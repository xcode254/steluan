// src/styles/theme.ts
// Shared design tokens — keeps the navy/gold Steluan identity
// consistent across every component instead of re-declaring hex
// values in each file.

export const theme = {
  // Measured against the target layout: content spans ~89% of the
  // viewport (~1366px of 1536px), not a narrow centered column. 1320
  // left ~300px of dead margin on each side of a 1920px monitor,
  // which is what made the page read as mostly white space. 1600 with
  // 48px padding keeps content wide on large screens while still
  // capping it so line lengths stay readable on ultrawides.
  layout: {
    maxWidth: 1600,
  },
  color: {
    navy:      '#0d1f3c',
    navyLight: '#16294f',
    gold:      '#c8922a',
    goldLight: '#e0a83a',
    cream:     '#f5f0e8',
    white:     '#ffffff',
    red:       '#c0392b',
    green:     '#1f8a54',
    blue:      '#2a5a9c',
    textMuted: '#6b7280',
    border:    '#e7e2d8',
  },
  font: {
    // These map to the CSS variables next/font/google generates in
    // app/layout.tsx (--font-display, --font-body, --font-data) —
    // never hardcode a font name directly in a font-family string;
    // if it's not loaded via next/font, it silently won't render.
    display: "var(--font-display), Georgia, serif",
    body:    "var(--font-body), -apple-system, sans-serif",
    // Reserved for numbers only — prices, beds/baths/sqm stats,
    // dashboard figures. Never used for prose or labels.
    data:    "var(--font-data), 'SF Mono', monospace",
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
  },
  shadow: {
    card:  '0 2px 12px rgba(13,31,60,0.08)',
    cardHover: '0 12px 32px rgba(13,31,60,0.16)',
    modal: '0 24px 80px rgba(13,31,60,0.30)',
  },
} as const

export const roleBadgeColor = (role: string) =>
  role === 'admin' ? '#8e44ad' : role === 'agent' ? theme.color.gold : '#7f8c8d'

// size_value is a raw number; size_unit says what unit it's in — no
// conversion happens anywhere, this just formats the pair with a
// sensible label and decimal precision per unit (acres/ha commonly
// use fractional values like 0.5; sqm listings are normally whole
// numbers).
export function formatSize(sizeValue: number, sizeUnit: string): string {
  const unitLabel = sizeUnit === 'acres' ? 'acres' : sizeUnit === 'ha' ? 'ha' : 'sqm'
  const formatted = sizeUnit === 'sqm'
    ? Number(sizeValue).toLocaleString()
    : Number(sizeValue).toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${formatted} ${unitLabel}`
}
