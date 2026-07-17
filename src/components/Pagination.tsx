'use client'

// src/components/Pagination.tsx
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { theme } from '@/styles/theme'

export function Pagination({
  currentPage,
  hasNextPage,
}: {
  currentPage: number
  hasNextPage: boolean
}) {
  const searchParams = useSearchParams()

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete('page')
    else params.set('page', String(page))
    const qs = params.toString()
    return `/properties${qs ? `?${qs}` : ''}`
  }

  if (currentPage === 1 && !hasNextPage) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
      {currentPage > 1 && (
        <Link href={hrefForPage(currentPage - 1)} style={navButtonStyle}>
          ← Previous
        </Link>
      )}
      <span
        style={{
          fontFamily: theme.font.body,
          fontSize: 13,
          color: theme.color.textMuted,
          padding: '9px 4px',
        }}
      >
        Page {currentPage}
      </span>
      {hasNextPage && (
        <Link href={hrefForPage(currentPage + 1)} style={navButtonStyle}>
          Next →
        </Link>
      )}
    </div>
  )
}

const navButtonStyle: React.CSSProperties = {
  border: `1px solid ${theme.color.navy}`,
  color: theme.color.navy,
  borderRadius: 6,
  padding: '9px 18px',
  fontFamily: theme.font.body,
  fontSize: 13,
  fontWeight: 600,
}
