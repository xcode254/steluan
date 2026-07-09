// src/hooks/useAuth.ts
// Auth state hook — updated for @supabase/ssr
// Uses createBrowserClient instead of createClientComponentClient
import { useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import type { Profile } from '../types/database'

export interface AuthState {
  user:    Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser]       = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Load profile for the current session
    async function getProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return data as Profile | null
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await getProfile(session.user.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(await getProfile(session.user.id))
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(await getProfile(session.user.id))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signOut }
}
