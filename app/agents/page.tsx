// app/agents/page.tsx
import { User } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { theme } from '@/styles/theme'

export default async function AgentsPage() {
  const supabase = await createClient()

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
    .in('role', ['agent', 'admin'])
    .order('full_name')

  // Listing counts per agent — one query, grouped client-side rather
  // than N+1 queries per agent.
  const { data: properties } = await supabase
    .from('properties')
    .select('agent_id')
    .eq('status', 'active')

  const countByAgent = new Map<string, number>()
  properties?.forEach((p) => {
    countByAgent.set(p.agent_id, (countByAgent.get(p.agent_id) ?? 0) + 1)
  })

  return (
    <main style={{ maxWidth: theme.layout.maxWidth, margin: '0 auto', padding: '48px 32px' }}>
      <h1 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 28, marginBottom: 6 }}>
        Our Agents
      </h1>
      <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, fontSize: 14, marginBottom: 32 }}>
        Meet the team behind Steluan&apos;s listings.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {agents?.map((agent) => (
          <div key={agent.id} style={{ background: '#fff', borderRadius: 12, padding: 22, boxShadow: theme.shadow.card, textAlign: 'center' }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%', background: '#dde4f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
              }}
            >
              <User size={28} color={theme.color.navy} />
            </div>
            <div style={{ fontFamily: theme.font.body, fontWeight: 700, fontSize: 15, color: theme.color.navy }}>
              {agent.full_name}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 4,
                background: agent.role === 'admin' ? '#8e44ad' : theme.color.gold,
                color: '#fff',
                borderRadius: 3,
                padding: '1px 8px',
                fontSize: 10,
                fontWeight: 700,
                fontFamily: theme.font.body,
                textTransform: 'uppercase',
              }}
            >
              {agent.role}
            </span>
            <div style={{ fontFamily: theme.font.data, fontSize: 13, color: theme.color.textMuted, marginTop: 12 }}>
              {countByAgent.get(agent.id) ?? 0} active listing{(countByAgent.get(agent.id) ?? 0) === 1 ? '' : 's'}
            </div>
            {agent.phone && (
              <div style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted, marginTop: 4 }}>
                {agent.phone}
              </div>
            )}
          </div>
        ))}

        {(!agents || agents.length === 0) && (
          <p style={{ fontFamily: theme.font.body, color: theme.color.textMuted, gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0' }}>
            No agents to show yet.
          </p>
        )}
      </div>
    </main>
  )
}
