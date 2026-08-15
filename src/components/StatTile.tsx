import type { ReactNode } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  icon: ReactNode
  label: string
  value: string | number
  delta?: { value: string; positive: boolean }
  accent?: boolean
}

export default function StatTile({ icon, label, value, delta, accent }: Props) {
  return (
    <div className="surface-card" style={{
      padding: 18,
      ...(accent ? { background: '#E8F5F1', border: '1px solid #095C46' } : {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, background: accent ? 'rgba(9,92,70,0.12)' : '#F3F4F6',
          color: '#095C46', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {delta && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700,
            color: delta.positive ? '#059669' : '#DC2626',
          }}>
            {delta.positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {delta.value}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>{value}</p>
    </div>
  )
}
