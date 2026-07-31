'use client'

// src/components/Navbar.tsx
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Heart, ChevronDown, Building2, User as UserIcon } from 'lucide-react'
import { useAuthContext } from './AuthProvider'
import { theme } from '@/styles/theme'
import { can } from '@/lib/auth'

const BUY_ITEMS = [
  { label: 'All For Sale', href: '/properties?type=For%20Sale' },
  { label: 'Houses',       href: '/properties?type=For%20Sale&category=house' },
  { label: 'Apartments',   href: '/properties?type=For%20Sale&category=apartment' },
  { label: 'Land',         href: '/properties?type=For%20Sale&category=land' },
  { label: 'Commercial',   href: '/properties?type=For%20Sale&category=commercial' },
]

const RENT_ITEMS = [
  { label: 'All For Rent', href: '/properties?type=For%20Rent' },
  { label: 'Houses',       href: '/properties?type=For%20Rent&category=house' },
  { label: 'Apartments',   href: '/properties?type=For%20Rent&category=apartment' },
  { label: 'Land',         href: '/properties?type=For%20Rent&category=land' },
  { label: 'Commercial',   href: '/properties?type=For%20Rent&category=commercial' },
]

export function Navbar() {
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<'buy' | 'rent' | 'user' | null>(null)
  const navRef = useRef<HTMLElement>(null)

  // Close any open dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const handleLogout = async () => {
    setMobileOpen(false)
    setOpenMenu(null)
    await signOut()
    router.push('/')
  }

  return (
    <nav
      ref={navRef}
      style={{
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        borderBottom: `1px solid ${theme.color.border}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          height: 72,
          maxWidth: theme.layout.maxWidth,
          margin: '0 auto',
        }}
      >
        <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <polygon points="17,2 32,30 2,30" fill={theme.color.gold} />
            <polygon points="17,10 26,28 8,28" fill={theme.color.navy} />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ color: theme.color.navy, fontFamily: theme.font.display, fontSize: 17, fontWeight: 700, letterSpacing: 1 }}>
              STELUAN LTD
            </span>
            <span style={{ color: theme.color.textMuted, fontFamily: theme.font.body, fontSize: 9, letterSpacing: 2 }}>
              REAL ESTATE
            </span>
          </div>
        </Link>

        {/* Desktop links — hidden below 860px via CSS */}
        <div className="navbar-desktop-links" style={{ alignItems: 'center', gap: 26 }}>
          <NavDropdown
            label="Buy"
            items={BUY_ITEMS}
            open={openMenu === 'buy'}
            onToggle={() => setOpenMenu(openMenu === 'buy' ? null : 'buy')}
          />
          <NavDropdown
            label="Rent"
            items={RENT_ITEMS}
            open={openMenu === 'rent'}
            onToggle={() => setOpenMenu(openMenu === 'rent' ? null : 'rent')}
          />
          <NavLink href="/properties/new" pathname={pathname}>Sell</NavLink>
          <NavLink href="/properties?category=commercial" pathname={pathname}>Commercial</NavLink>
          <NavLink href="/agents" pathname={pathname}>Agents</NavLink>
          <NavLink href="/about" pathname={pathname}>About Us</NavLink>
          <NavLink href="/contact" pathname={pathname}>Contact</NavLink>
        </div>

        <div className="navbar-desktop-links" style={{ alignItems: 'center', gap: 18 }}>
          <Link
            href="/saved"
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.color.navy, fontFamily: theme.font.body, fontSize: 13 }}
          >
            <Heart size={17} /> Saved
          </Link>

          {user && can(user, 'canAdd') && (
            <Link
              href="/properties/new"
              style={{
                background: theme.color.navy,
                color: '#fff',
                borderRadius: 6,
                padding: '9px 18px',
                fontFamily: theme.font.body,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              List Property
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setOpenMenu(openMenu === 'user' ? null : 'user')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dde4f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={15} color={theme.color.navy} />
                </div>
                <span style={{ fontFamily: theme.font.body, fontSize: 13, color: theme.color.navy }}>
                  Hi, {user.full_name.split(' ')[0]}
                </span>
                <ChevronDown size={14} color={theme.color.textMuted} style={{ transform: openMenu === 'user' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>

              {openMenu === 'user' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: theme.shadow.cardHover,
                    minWidth: 160,
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setOpenMenu(null)}
                    style={{ display: 'block', padding: '10px 16px', fontFamily: theme.font.body, fontSize: 13, color: theme.color.navy }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px',
                      fontFamily: theme.font.body, fontSize: 13, color: theme.color.red,
                      background: 'none', border: 'none', borderTop: `1px solid ${theme.color.border}`, cursor: 'pointer',
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                border: `1px solid ${theme.color.navy}`,
                color: theme.color.navy,
                borderRadius: 6,
                padding: '8px 18px',
                fontFamily: theme.font.body,
                fontSize: 13,
                fontWeight: 600,
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
          <span style={{ width: 22, height: 2, background: theme.color.navy, transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ width: 22, height: 2, background: theme.color.navy, opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ width: 22, height: 2, background: theme.color.navy, transition: 'transform 0.2s', transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`navbar-mobile-panel${mobileOpen ? ' open' : ''}`}
        style={{
          flexDirection: 'column',
          padding: '8px 20px 20px',
          gap: 4,
          borderTop: `1px solid ${theme.color.border}`,
        }}
      >
        {[
          { href: '/properties?type=For%20Sale', label: 'Buy' },
          { href: '/properties?type=For%20Rent', label: 'Rent' },
          { href: '/properties/new', label: 'Sell' },
          { href: '/properties?category=commercial', label: 'Commercial' },
          { href: '/agents', label: 'Agents' },
          { href: '/about', label: 'About Us' },
          { href: '/contact', label: 'Contact' },
          { href: '/saved', label: 'Saved' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            style={{
              color: theme.color.navy,
              fontFamily: theme.font.body,
              fontSize: 15,
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
              background: theme.color.navy,
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
            List Property
          </Link>
        )}

        {user ? (
          <>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              style={{ padding: '10px 4px', fontFamily: theme.font.body, fontSize: 15, color: theme.color.navy, borderTop: `1px solid ${theme.color.border}`, marginTop: 8 }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: `1px solid ${theme.color.red}`,
                color: theme.color.red,
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
              border: `1px solid ${theme.color.navy}`,
              color: theme.color.navy,
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

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        color: pathname === href ? theme.color.gold : theme.color.navy,
        fontFamily: theme.font.body,
        fontSize: 14,
        fontWeight: pathname === href ? 700 : 500,
      }}
    >
      {children}
    </Link>
  )
}

function NavDropdown({
  label,
  items,
  open,
  onToggle,
}: {
  label: string
  items: { label: string; href: string }[]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer',
          color: theme.color.navy, fontFamily: theme.font.body, fontSize: 14, fontWeight: 500, padding: 0,
        }}
      >
        {label} <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 12,
            background: '#fff',
            borderRadius: 8,
            boxShadow: theme.shadow.cardHover,
            minWidth: 170,
            overflow: 'hidden',
            zIndex: 210,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: 'block', padding: '10px 16px', fontFamily: theme.font.body, fontSize: 13, color: theme.color.navy }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
