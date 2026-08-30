import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker'
import { Trash2 } from 'lucide-react'
import api from '../../../api/axios'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { UY_CAL_CLASSNAMES, UY_CAL_COMPONENTS } from '../../../components/DateRangeCalendar'
import { getOccupiedNightMatchers, type UnavailableRange } from '../../../utils/availability'
import type { BlockedDate, UnavailableDateRange } from '../../../types'

interface Props {
  propertyId: string
}

interface SourcedRange extends UnavailableRange {
  source: 'BOOKED' | 'BLOCKED'
}

function parseSourced(raw: UnavailableDateRange[]): SourcedRange[] {
  return raw.map(r => ({
    from: new Date(`${r.startDate}T00:00:00`),
    to: new Date(`${r.endDate}T00:00:00`),
    source: r.source,
  }))
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatNice(d: Date): string {
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HostAvailabilityCalendar({ propertyId }: Props) {
  const isDesktop = useMediaQuery('(min-width: 860px)')

  const [ranges, setRanges] = useState<UnavailableDateRange[]>([])
  const [blocks, setBlocks] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [newRange, setNewRange] = useState<DateRange | undefined>(undefined)
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<{ unavailableDates: UnavailableDateRange[] }>(`/api/host/properties/${propertyId}/availability`),
      api.get<BlockedDate[]>(`/api/host/properties/${propertyId}/blocked-dates`),
    ])
      .then(([a, b]) => { setRanges(a.data.unavailableDates); setBlocks(b.data) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [propertyId])

  const { bookedMatchers, blockedMatchers, disabledMatchers } = useMemo(() => {
    const sourced = parseSourced(ranges)
    const booked = getOccupiedNightMatchers(sourced.filter(r => r.source === 'BOOKED'))
    const blocked = getOccupiedNightMatchers(sourced.filter(r => r.source === 'BLOCKED'))
    const disabled: Matcher[] = [{ before: new Date() }, ...booked, ...blocked]
    return { bookedMatchers: booked, blockedMatchers: blocked, disabledMatchers: disabled }
  }, [ranges])

  const confirmBlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!newRange?.from || !newRange?.to) return
    setAdding(true)
    setError('')
    try {
      await api.post(`/api/host/properties/${propertyId}/blocked-dates`, {
        startDate: toISODate(newRange.from), endDate: toISODate(newRange.to), reason: reason || null,
      })
      setNewRange(undefined)
      setReason('')
      load()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not block these dates.')
    } finally {
      setAdding(false)
    }
  }

  const removeBlock = async (blockId: string) => {
    await api.delete(`/api/host/properties/${propertyId}/blocked-dates/${blockId}`)
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    load()
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '24px 0' }}><span className="spinner spinner-dark" /></div>
  }

  return (
    <div className="surface-card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Calendar</h2>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Booked stays and your own blocked dates, all in one place. Select a range below to block new dates.
      </p>

      <div style={{ display: 'flex', gap: 18, marginBottom: 16, flexWrap: 'wrap' }}>
        <Legend color="#2563EB" label="Booked" />
        <Legend color="#D97706" label="Blocked by you" />
        <Legend color="#095C46" label="Selected" />
      </div>

      <DayPicker
        mode="range"
        numberOfMonths={isDesktop ? 2 : 1}
        selected={newRange}
        onSelect={setNewRange}
        disabled={disabledMatchers}
        modifiers={{ booked: bookedMatchers, blocked: blockedMatchers }}
        modifiersClassNames={{ booked: 'uy-cal-day-booked', blocked: 'uy-cal-day-blocked' }}
        navLayout="around"
        classNames={UY_CAL_CLASSNAMES}
        components={UY_CAL_COMPONENTS}
      />

      {newRange?.from && newRange?.to && (
        <form onSubmit={confirmBlock} className="surface-muted" style={{ padding: 14, marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
              Block {formatNice(newRange.from)} → {formatNice(newRange.to)}
            </p>
            <input
              className="input" placeholder="Reason (optional)"
              value={reason} onChange={e => setReason(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-secondary btn-md" onClick={() => { setNewRange(undefined); setReason('') }}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-md" disabled={adding}>
            {adding ? <span className="spinner" /> : 'Confirm block'}
          </button>
          {error && <p style={{ color: '#DC2626', fontSize: 13, width: '100%', margin: 0 }}>{error}</p>}
        </form>
      )}

      {blocks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>
            Your blocked dates
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blocks.map(b => (
              <div key={b.id} className="surface-muted" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>
                  {b.startDate} → {b.endDate}{b.reason ? ` · ${b.reason}` : ''}
                </span>
                <button onClick={() => removeBlock(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }} aria-label="Remove block">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#374151' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      {label}
    </div>
  )
}
