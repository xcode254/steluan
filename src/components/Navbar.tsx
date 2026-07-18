'use client'

// src/components/Navbar.tsx
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from './AuthProvider'
import { theme, roleBadgeColor } from '@/styles/theme'
import { can } from '@/lib/auth'

export function Navbar() {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/',            label: 'Home' },
    { href: '/properties',  label: 'Properties' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  const handleLogout = async () => {
    setMobileOpen(false)
    await signOut()
    router.push('/')
  }

  return (
    <nav
      style={{
        background: theme.color.navy,
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 20px rgba(0,0,0,0.35)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          height: 62,
        }}
      >
        <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="30" height="30" viewBox="0 0 34 34">
            <polygon points="17,2 32,30 2,30" fill={theme.color.gold} />
            <polygon points="17,10 26,28 8,28" fill={theme.color.navy} />
          </svg>
          <span style={{ color: '#fff', fontFamily: theme.font.display, fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>
            STELUAN LTD
          </span>
        </Link>

        {/* Desktop links — hidden below 860px via CSS */}
        <div className="navbar-desktop-links" style={{ alignItems: 'center', gap: 28 }}>
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

        {/* Hamburger — hidden above 860px via CSS */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 6,
            flexDirection: 'column',
            gap: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ width: 22, height: 2, background: '#fff', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ width: 22, height: 2, background: '#fff', opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ width: 22, height: 2, background: '#fff', transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {/* Mobile dropdown panel — only rendered visible via CSS
          when both mobileOpen (the "open" class) AND viewport
          is under the 860px breakpoint. */}
      <div
        className={`navbar-mobile-panel${mobileOpen ? ' open' : ''}`}
        style={{
          flexDirection: 'column',
          padding: '8px 20px 20px',
          gap: 4,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            style={{
              color: pathname === l.href ? theme.color.gold : 'rgba(255,255,255,0.85)',
              fontFamily: theme.font.body,
              fontSize: 15,
              fontWeight: pathname === l.href ? 700 : 400,
              padding: '10px 4px',
            }}
          >
            {l.label}
          </Link>
        ))}

        {user && can(user, 'canAdd') && (
          <Link
            href="/properties/new"
            onClick={() => setMobileOpen(false)}
            style={{
              background: theme.color.gold,
              color: '#fff',
              borderRadius: 6,
              padding: '10px 16px',
              fontFamily: theme.font.body,
              fontSize: 14,
              fontWeight: 700,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            + List Property
          </Link>
        )}

        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 4px 4px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8 }}>
              <span style={{ color: '#fff', fontFamily: theme.font.body, fontSize: 14, fontWeight: 700 }}>
                {user.full_name}
              </span>
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
                padding: '10px 16px',
                fontFamily: theme.font.body,
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: 8,
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 6,
              padding: '10px 16px',
              fontFamily: theme.font.body,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}
