// src/styles/theme.ts
// Shared design tokens — keeps the navy/gold Steluan identity
// consistent across every component instead of re-declaring hex
// values in each file.

export const theme = {
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
    display: "'Playfair Display', Georgia, serif",
    body:    "'Lato', -apple-system, sans-serif",
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
