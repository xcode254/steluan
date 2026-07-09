'use client'

// src/components/Navbar.tsx
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { theme, roleBadgeColor } from '@/styles/theme'
import { can } from '@/lib/auth'

export function Navbar() {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()

  const navLinks = [
    { href: '/',            label: 'Home' },
    { href: '/properties',  label: 'Properties' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav
      style={{
        background: theme.color.navy,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        height: 62,
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 20px rgba(0,0,0,0.35)',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="30" height="30" viewBox="0 0 34 34">
          <polygon points="17,2 32,30 2,30" fill={theme.color.gold} />
          <polygon points="17,10 26,28 8,28" fill={theme.color.navy} />
        </svg>
        <span style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>
          STELUAN LTD
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: pathname === l.href ? theme.color.gold : 'rgba(255,255,255,0.8)',
              fontFamily: theme.font.body,
              fontSize: 14,
              fontWeight: pathname === l.href ? 700 : 400,
              borderBottom: pathname === l.href ? `2px solid ${theme.color.gold}` : '2px solid transparent',
              paddingBottom: 2,
            }}
          >
            {l.label}
          </Link>
        ))}

        {user && can(user, 'canAdd') && (
          <Link
            href="/properties/new"
            style={{
              background: theme.color.gold,
              color: '#fff',
              borderRadius: 6,
              padding: '8px 18px',
              fontFamily: theme.font.body,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            + List Property
          </Link>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ color: '#fff', fontFamily: theme.font.body, fontSize: 13, fontWeight: 700 }}>
                {user.full_name}
              </div>
              <span
                style={{
                  background: roleBadgeColor(user.role),
                  color: '#fff',
                  borderRadius: 3,
                  padding: '1px 7px',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: theme.font.body,
                  textTransform: 'uppercase',
                }}
              >
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff',
                borderRadius: 6,
                padding: '6px 14px',
                fontFamily: theme.font.body,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 6,
              padding: '7px 16px',
              fontFamily: theme.font.body,
              fontSize: 13,
            }}
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}
