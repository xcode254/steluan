// src/components/WhyChooseUs.tsx
import { ShieldCheck, Users, Tag } from 'lucide-react'
import { theme } from '@/styles/theme'

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    body: 'All properties are verified for your peace of mind.',
  },
  {
    icon: Users,
    title: 'Expert Agents',
    body: 'Professional agents to guide you every step of the way.',
  },
  {
    icon: Tag,
    title: 'Best Deals',
    body: 'We help you find the best properties at the best prices.',
  },
]

export function WhyChooseUs() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 22, boxShadow: theme.shadow.card }}>
      <h3 style={{ fontFamily: theme.font.display, color: theme.color.navy, fontSize: 17, margin: '0 0 16px' }}>
        Why Choose Us?
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ITEMS.map((item) => (
          <div key={item.title} style={{ display: 'flex', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 8,
                background: '#fbf1e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <item.icon size={18} color={theme.color.gold} />
            </div>
            <div>
              <div style={{ fontFamily: theme.font.body, fontWeight: 700, fontSize: 13, color: theme.color.navy }}>
                {item.title}
              </div>
              <div style={{ fontFamily: theme.font.body, fontSize: 12, color: theme.color.textMuted, marginTop: 2, lineHeight: 1.5 }}>
                {item.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
