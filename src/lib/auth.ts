// src/lib/auth.ts
// Auth actions updated for @supabase/ssr browser client
import { createClient } from '../utils/supabase/client'
import type { UserRole, Profile } from '../types/database'

const PERMISSIONS: Record<UserRole, Record<string, boolean>> = {
  admin:  { canAdd: true,  canEdit: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true  },
  agent:  { canAdd: true,  canEdit: true,  canDelete: false, canManageUsers: false, canViewAudit: false },
  viewer: { canAdd: false, canEdit: false, canDelete: false, canManageUsers: false, canViewAudit: false },
}

export function can(user: Profile | null, permission: string): boolean {
  if (!user) return false
  return PERMISSIONS[user.role]?.[permission] ?? false
}

export function canEditProperty(user: Profile | null, agentId: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.role === 'agent' && user.id === agentId
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function setUserRole(targetUserId: string, role: UserRole) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', targetUserId)
    .select()
    .single()
  if (error) throw error
  return data
}
