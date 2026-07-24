'use client'

// src/components/VersionChecker.tsx
//
// Detects version skew: this client's JS was built with a specific
// NEXT_PUBLIC_BUILD_ID baked in at build time (next.config.js). If a
// new deployment has since gone live, /api/version (evaluated fresh
// on every request) will report a different buildId. Rather than let
// the user silently hit confusing hangs/errors on stale code —
// exactly what prompted adding this — show a small banner prompting
// a refresh.
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { theme } from '@/styles/theme'

const CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function VersionChecker() {
  const [staleDetected, setStaleDetected] = useState(false)

  useEffect(() => {
    const currentBuildId = process.env.NEXT_PUBLIC_BUILD_ID

    // Local dev builds get a per-process timestamp id, not a real
    // deployment — skip checking entirely so this never nags during
    // development.
    if (!currentBuildId || currentBuildId.startsWith('local-')) return

    async function check() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { buildId } = await res.json()
        if (buildId && buildId !== currentBuildId) {
          setStaleDetected(true)
        }
      } catch {
        // Network hiccup — not worth surfacing, just try again next cycle
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)

    // Also check whenever the tab regains focus — catches the common
    // case of a deploy happening while someone's tab sat idle/backgrounded
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  if (!staleDetected) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: theme.color.navy,
        color: '#fff',
        borderRadius: 8,
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        fontFamily: theme.font.body,
        fontSize: 13,
      }}
    >
      <span>A new version is available.</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: theme.color.gold,
          border: 'none',
          color: '#fff',
          borderRadius: 6,
          padding: '6px 14px',
          fontFamily: theme.font.body,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  )
}
