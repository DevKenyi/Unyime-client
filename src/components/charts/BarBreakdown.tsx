import { useState } from 'react'

interface Bar { label: string; value: number; color: string }

export default function BarBreakdown({ data }: { data: Bar[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const max = Math.max(1, ...data.map(d => d.value))
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return <p style={{ fontSize: 13.5, color: '#6B7280' }}>No bookings yet.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((bar, i) => {
        const widthPct = (bar.value / max) * 100
        return (
          <div
            key={bar.label}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <span style={{ width: 96, fontSize: 12.5, color: '#6B7280', flexShrink: 0 }}>{bar.label}</span>
            <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 4, height: 20, position: 'relative' }}>
              <div style={{
                width: `${widthPct}%`, height: '100%', background: bar.color, borderRadius: 4,
                minWidth: bar.value > 0 ? 4 : 0,
                opacity: hoverIndex === i ? 0.85 : 1,
                transition: 'opacity 0.1s, width 0.3s',
              }} />
            </div>
            <span style={{ width: 28, fontSize: 12.5, fontWeight: 700, color: '#111827', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
              {bar.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
