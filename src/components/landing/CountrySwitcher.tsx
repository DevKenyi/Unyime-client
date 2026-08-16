import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCountry } from '../../contexts/CountryContext'
import type { Country } from '../../types'

const COUNTRY_LABELS: Record<Country, { label: string; flag: string }> = {
  NIGERIA: { label: 'Nigeria', flag: '🇳🇬' },
  SOUTH_AFRICA: { label: 'South Africa', flag: '🇿🇦' },
}

export default function CountrySwitcher({ fullWidth }: { fullWidth?: boolean }) {
  const { country, setCountry } = useCountry()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 14.5, fontWeight: 600, color: '#374151', padding: '6px 4px',
          width: fullWidth ? '100%' : undefined, justifyContent: fullWidth ? 'space-between' : undefined,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{COUNTRY_LABELS[country].flag}</span>
          <span>{COUNTRY_LABELS[country].label}</span>
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: '100%', right: fullWidth ? 'auto' : 0, left: fullWidth ? 0 : 'auto',
            marginTop: 8, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
            boxShadow: '0 8px 24px -12px rgba(17,24,39,0.2)', zIndex: 50, minWidth: 180, overflow: 'hidden',
          }}>
            {(Object.keys(COUNTRY_LABELS) as Country[]).map(c => (
              <button
                key={c}
                onClick={() => { setCountry(c); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px',
                  background: c === country ? '#E8F5F1' : 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: c === country ? 700 : 500, color: c === country ? '#095C46' : '#374151',
                  textAlign: 'left',
                }}
              >
                <span>{COUNTRY_LABELS[c].flag}</span>
                <span>{COUNTRY_LABELS[c].label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
