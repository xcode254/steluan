'use client'

// src/components/PropertyForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { ImageUploadZone, type ImageSlot } from './ImageUploadZone'
import { createProperty, updateProperty, uploadPropertyImage, deletePropertyImage, setPrimaryImage } from '@/lib/properties'
import { theme } from '@/styles/theme'
import type { Property, PropertyType, PropertyCategory, PropertyTag, PropertyStatus, SizeUnit } from '@/types/database'

let tempCounter = 0
const nextTempId = () => `slot-${Date.now()}-${tempCounter++}`

export function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const isEdit = !!property

  const [name, setName]           = useState(property?.name ?? '')
  const [description, setDescription] = useState(property?.description ?? '')
  const [price, setPrice]         = useState(property?.price?.toString() ?? '')
  const [type, setType]           = useState<PropertyType>(property?.type ?? 'For Sale')
  const [category, setCategory]   = useState<PropertyCategory>(property?.category ?? 'house')
  const [tag, setTag]             = useState<PropertyTag>(property?.tag ?? 'Featured')
  const [status, setStatus]       = useState<PropertyStatus>(property?.status ?? 'active')
  const [beds, setBeds]           = useState(property?.beds?.toString() ?? '3')
  const [baths, setBaths]         = useState(property?.baths?.toString() ?? '2')
  const [sizeValue, setSizeValue] = useState(property?.size_value?.toString() ?? '150')
  const [sizeUnit, setSizeUnit]   = useState<SizeUnit>(property?.size_unit ?? 'sqm')
  const [location, setLocation]   = useState(property?.location ?? '')
  const [amenities, setAmenities] = useState(property?.amenities?.join(', ') ?? '')

  const isLand = category === 'land'

  // Only land exposes a unit picker — switching away from land
  // resets to sqm so non-land listings never end up stored in
  // acres/ha, and switching into land defaults to acres (Kenyan land
  // is conventionally sold in acres more often than sqm or ha).
  function handleCategoryChange(next: PropertyCategory) {
    setCategory(next)
    if (next === 'land' && sizeUnit === 'sqm') {
      setSizeUnit('acres')
      if (sizeValue === '150') setSizeValue('1')
    } else if (next !== 'land' && sizeUnit !== 'sqm') {
      setSizeUnit('sqm')
      setSizeValue('150')
    }
  }

  // Unified image slots — existing DB images + newly picked local files
  const existingMeta = new Map((property?.images ?? []).map((img) => [img.id, img]))
  const [slots, setSlots] = useState<ImageSlot[]>(
    (property?.images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({ tempId: img.id, url: img.url, kind: 'existing' as const }))
  )
  const [pendingFiles, setPendingFiles] = useState<Map<string, File>>(new Map())
  const [removedExistingIds, setRemovedExistingIds] = useState<string[]>([])
  const [primaryTempId, setPrimaryTempId] = useState<string | null>(
    property?.images?.find((img) => img.is_primary)?.id ?? null
  )

  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  function handleAddFiles(files: FileList) {
    const newSlots: ImageSlot[] = []
    const newFiles = new Map(pendingFiles)
    Array.from(files).forEach((file) => {
      const tempId = nextTempId()
      newFiles.set(tempId, file)
      newSlots.push({ tempId, url: URL.createObjectURL(file), kind: 'pending' })
    })
    setPendingFiles(newFiles)
    setSlots((prev) => {
      const merged = [...prev, ...newSlots]
      if (!primaryTempId && merged.length) setPrimaryTempId(merged[0].tempId)
      return merged
    })
  }

  function handleRemoveSlot(tempId: string) {
    setSlots((prev) => {
      const remaining = prev.filter((s) => s.tempId !== tempId)
      if (primaryTempId === tempId) {
        setPrimaryTempId(remaining[0]?.tempId ?? null)
      }
      return remaining
    })
    if (existingMeta.has(tempId)) {
      setRemovedExistingIds((prev) => [...prev, tempId])
    } else {
      setPendingFiles((prev) => {
        const next = new Map(prev)
        next.delete(tempId)
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim())     return setError('Property name is required.')
    if (!location.trim()) return setError('Location is required.')
    if (!price || Number(price) <= 0) return setError('Enter a valid price.')
    if (!sizeValue || Number(sizeValue) <= 0) return setError(isLand ? 'Enter a valid plot size.' : 'Enter a valid size in sqm.')
    if (slots.length === 0) return setError('Upload at least one photo.')
    if (!user) return setError('You must be logged in.')

    setBusy(true)
    try {
      const amenitiesArr = amenities.split(',').map((a) => a.trim()).filter(Boolean)
      const bedsVal  = isLand ? 0 : Number(beds)
      const bathsVal = isLand ? 0 : Number(baths)

      let propertyId: string

      if (isEdit && property) {
        propertyId = property.id
        await updateProperty(propertyId, {
          name, description, price: Number(price), type, category, tag, status,
          beds: bedsVal, baths: bathsVal, size_value: Number(sizeValue), size_unit: sizeUnit,
          location, amenities: amenitiesArr,
        })

        // Remove any images the user deleted from the form
        for (const imgId of removedExistingIds) {
          const meta = existingMeta.get(imgId)
          if (meta) await deletePropertyImage(imgId, meta.storage_path)
        }
      } else {
        const created = await createProperty({
          agent_id: user.id, name, description, price: Number(price),
          currency: 'KES', type, category, tag, status: 'active',
          beds: bedsVal, baths: bathsVal, size_value: Number(sizeValue), size_unit: sizeUnit,
          location, latitude: null, longitude: null,
          amenities: amenitiesArr, primary_image: null,
        })
        propertyId = created.id
      }

      // Upload newly added files
      let sortOrder = slots.length
      for (const slot of slots) {
        if (slot.kind !== 'pending') continue
        const file = pendingFiles.get(slot.tempId)
        if (!file) continue
        await uploadPropertyImage({
          propertyId, uploadedBy: user.id, file,
          isPrimary: slot.tempId === primaryTempId,
          sortOrder: sortOrder++,
        })
      }

      // If the chosen primary was an existing (already-uploaded) image
      // that wasn't previously primary, flip it now.
      if (primaryTempId && existingMeta.has(primaryTempId)) {
        const wasAlreadyPrimary = existingMeta.get(primaryTempId)?.is_primary
        if (!wasAlreadyPrimary) await setPrimaryImage(propertyId, primaryTempId)
      }

      router.push(`/properties/${propertyId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong saving this property.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 900 }}>
      {error && (
        <div style={{ background: '#fdecec', color: theme.color.red, padding: '10px 14px', borderRadius: 6, fontSize: 13, fontFamily: theme.font.body, marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <div>
          <Field label="Property name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <Field label="Price (KES)" required>
            <input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category">
              <select value={category} onChange={(e) => handleCategoryChange(e.target.value as PropertyCategory)} style={inputStyle}>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} style={inputStyle}>
                <option>For Sale</option>
                <option>For Rent</option>
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Tag">
              <select value={tag} onChange={(e) => setTag(e.target.value as PropertyTag)} style={inputStyle}>
                <option>Featured</option>
                <option>New</option>
                <option>Hot</option>
              </select>
            </Field>
            {isEdit && (
              <Field label="Status">
                <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} style={inputStyle}>
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            )}
          </div>

          <Field label="Location" required>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Karen, Nairobi" style={inputStyle} />
          </Field>

          {isLand ? (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <Field label="Plot size" required>
                <input type="number" min="0.01" step="0.01" value={sizeValue} onChange={(e) => setSizeValue(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Unit">
                <select value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value as SizeUnit)} style={inputStyle}>
                  <option value="acres">Acres</option>
                  <option value="ha">Hectares</option>
                  <option value="sqm">Sqm</option>
                </select>
              </Field>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Beds"><input type="number" min="0" value={beds} onChange={(e) => setBeds(e.target.value)} style={inputStyle} /></Field>
              <Field label="Baths"><input type="number" min="0" value={baths} onChange={(e) => setBaths(e.target.value)} style={inputStyle} /></Field>
              <Field label="Sqm"><input type="number" min="1" value={sizeValue} onChange={(e) => setSizeValue(e.target.value)} style={inputStyle} /></Field>
            </div>
          )}

          <Field label={isLand ? 'Features (comma separated)' : 'Amenities (comma separated)'}>
            <input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder={isLand ? 'Title Deed Ready, Electricity Connection, Road Access' : 'Swimming Pool, Balcony, 24/7 Security'}
              style={inputStyle}
            />
          </Field>
        </div>

        <div>
          <ImageUploadZone
            slots={slots}
            primaryTempId={primaryTempId}
            onAddFiles={handleAddFiles}
            onRemove={handleRemoveSlot}
            onSetPrimary={setPrimaryTempId}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button type="button" onClick={() => router.back()} style={ghostButtonStyle}>Cancel</button>
        <button type="submit" disabled={busy} style={primaryButtonStyle(busy)}>
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'List property'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontFamily: theme.font.body, fontSize: 12, fontWeight: 700, color: theme.color.navy, display: 'block', marginBottom: 5 }}>
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.color.border}`,
  borderRadius: 6,
  padding: '9px 11px',
  fontFamily: theme.font.body,
  fontSize: 13,
  boxSizing: 'border-box',
}

const primaryButtonStyle = (busy: boolean): React.CSSProperties => ({
  background: theme.color.gold,
  border: 'none',
  color: '#fff',
  borderRadius: 6,
  padding: '10px 24px',
  fontFamily: theme.font.body,
  fontSize: 13,
  fontWeight: 700,
  cursor: busy ? 'not-allowed' : 'pointer',
  opacity: busy ? 0.7 : 1,
})

const ghostButtonStyle: React.CSSProperties = {
  background: 'none',
  border: `1px solid ${theme.color.navy}`,
  color: theme.color.navy,
  borderRadius: 6,
  padding: '10px 20px',
  fontFamily: theme.font.body,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
}
