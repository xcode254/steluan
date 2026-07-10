// src/lib/properties.ts
// Property data access layer — all DB calls live here.
// Components never import from @supabase/ssr directly.

import { createClient } from '../utils/supabase/client'
import type { Property, PropertyImage } from '../types/database'

const PROPERTY_SELECT = `
  *,
  agent:profiles!properties_agent_id_fkey (id, full_name, avatar_url, phone, role),
  images:property_images (id, url, storage_path, is_primary, sort_order)
`

// ── Queries ───────────────────────────────────────────────────

export async function getProperties(opts: {
  status?:  string
  agentId?: string
  limit?:   number
  offset?:  number
} = {}): Promise<Property[]> {
  const supabase = createClient()
  const limit  = opts.limit  ?? 20
  const offset = opts.offset ?? 0

  let q = supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (opts.status)  q = q.eq('status',   opts.status)
  if (opts.agentId) q = q.eq('agent_id', opts.agentId)

  const { data, error } = await q
  if (error) throw error
  return data as Property[]
}

export async function getProperty(id: string): Promise<Property> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Property
}

export async function searchProperties(params: {
  query?:    string
  type?:     string
  category?: string
  minPrice?: number
  maxPrice?: number
  minBeds?:  number
  location?: string
  limit?:    number
  offset?:   number
}): Promise<Property[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('search_properties', {
    query:         params.query     ?? '',
    prop_type:     params.type      ?? null,
    prop_category: params.category  ?? null,
    min_price:     params.minPrice  ?? null,
    max_price:     params.maxPrice  ?? null,
    min_beds:      params.minBeds   ?? null,
    location_q:    params.location  ?? null,
    lim:           params.limit     ?? 20,
    offs:          params.offset    ?? 0,
  })
  if (error) throw error
  return data as Property[]
}

// ── Mutations ─────────────────────────────────────────────────

export async function createProperty(
  payload: Omit<Property, 'id' | 'search_vector' | 'created_at' | 'updated_at' | 'agent' | 'images'>
): Promise<Property> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .insert(payload)
    .select(PROPERTY_SELECT)
    .single()
  if (error) throw error
  return data as Property
}

export async function updateProperty(
  id: string,
  payload: Partial<Omit<Property, 'id' | 'search_vector' | 'created_at' | 'agent' | 'images'>>
): Promise<Property> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .update(payload)
    .eq('id', id)
    .select(PROPERTY_SELECT)
    .single()
  if (error) throw error
  return data as Property
}

// Soft delete — sets status to 'archived', never hard deletes.
// Images and audit trail are preserved.
//
// Chains .select() and checks the result explicitly rather than only
// checking `error`: without .select(), PostgREST returns a bare 204
// No Content for UPDATE regardless of whether 0 or N rows matched —
// if RLS silently excludes the row, supabase-js reports
// { error: null, data: null } and this would appear to succeed while
// leaving the database completely untouched.
export async function deleteProperty(id: string): Promise<void> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('properties')
    .update({ status: 'archived' })
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Could not delete this property — you may not have permission, or it may already be gone.')
  }
}

// ── Image management ──────────────────────────────────────────

export async function uploadPropertyImage(opts: {
  propertyId: string
  uploadedBy: string
  file:       File
  isPrimary?: boolean
  sortOrder?: number
}): Promise<PropertyImage> {
  const supabase = createClient()
  const ext  = opts.file.name.split('.').pop()
  const path = `${opts.uploadedBy}/${opts.propertyId}/${Date.now()}.${ext}`

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(path, opts.file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from('property-images')
    .getPublicUrl(path)

  // 3. Unset any existing primary if we're setting a new one
  if (opts.isPrimary) {
    await supabase
      .from('property_images')
      .update({ is_primary: false })
      .eq('property_id', opts.propertyId)
      .eq('is_primary', true)
  }

  // 4. Insert image record — DB trigger updates property.primary_image
  const { data, error } = await supabase
    .from('property_images')
    .insert({
      property_id:  opts.propertyId,
      url:          urlData.publicUrl,
      storage_path: path,
      is_primary:   opts.isPrimary ?? false,
      sort_order:   opts.sortOrder ?? 0,
      uploaded_by:  opts.uploadedBy,
    })
    .select()
    .single()
  if (error) throw error
  return data as PropertyImage
}

export async function deletePropertyImage(
  imageId: string,
  storagePath: string
): Promise<void> {
  const supabase = createClient()
  // Remove file from storage first
  await supabase.storage.from('property-images').remove([storagePath])
  // Remove DB record — .select() lets us detect an RLS-blocked delete
  // (0 rows affected) instead of silently reporting success. See
  // deleteProperty() above for why this matters.
  const { data, error } = await supabase
    .from('property_images')
    .delete()
    .eq('id', imageId)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Could not delete this image — you may not have permission, or it may already be gone.')
  }
}

export async function setPrimaryImage(
  propertyId: string,
  imageId:    string
): Promise<void> {
  const supabase = createClient()
  // Unset all existing primaries
  await supabase
    .from('property_images')
    .update({ is_primary: false })
    .eq('property_id', propertyId)
  // Set new primary — DB trigger updates property.primary_image.
  // .select() lets us detect an RLS-blocked update instead of
  // silently reporting success — see deleteProperty() above.
  const { data, error } = await supabase
    .from('property_images')
    .update({ is_primary: true })
    .eq('id', imageId)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Could not set this image as primary — you may not have permission, or it may already be gone.')
  }
}

// ── Viewing requests ──────────────────────────────────────────

export async function submitViewingRequest(payload: {
  property_id:   string
  requester_id?: string
  contact_name:  string
  contact_email: string
  contact_phone?: string
  preferred_at?:  string
  message?:       string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('viewing_requests')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getViewingRequestsForAgent(agentId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('viewing_requests')
    .select('*, property:properties(id, name, primary_image, location)')
    .eq('properties.agent_id', agentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateViewingRequestStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  agentNotes?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('viewing_requests')
    .update({ status, ...(agentNotes !== undefined ? { agent_notes: agentNotes } : {}) })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
