// app/properties/new/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PropertyForm } from '@/components/PropertyForm'
import { theme } from '@/styles/theme'

export default async function NewPropertyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/properties/new')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role === 'viewer') redirect('/')

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 26, marginBottom: 24 }}>
        List a new property
      </h1>
      <PropertyForm />
    </main>
  )
}
