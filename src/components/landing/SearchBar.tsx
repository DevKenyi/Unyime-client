import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import DateRangeCalendar from '../DateRangeCalendar'

function formatNice(d: Date): string {
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function SearchBar() {
  const navigate = useNavigate()
  const [where, setWhere] = useState('')
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState('')
  const [datesOpen, setDatesOpen] = useState(false)
  const [guestsOpen, setGuestsOpen] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Dates aren't wired to a backend filter yet — search only supports city/guests today —
    // so they're collected for the premium feel but not sent as query params.
    const params: Record<string, string> = {}
    if (where.trim()) params.city = where.trim()
    if (guests) params.guests = guests
    navigate(`/properties?${new URLSearchParams(params).toString()}`)
  }

  const openDates = () => { setDatesOpen(o => !o); setGuestsOpen(false) }
  const openGuests = () => { setGuestsOpen(o => !o); setDatesOpen(false) }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card search-panel"
      style={{
        display: 'flex', alignItems: 'stretch', gap: 0, padding: 8,
        borderRadius: 20, boxShadow: '0 24px 48px -20px rgba(17,24,39,0.22)',
      }}
    >
      <SearchField icon={<MapPin size={16} />} label="Where">
        <input
          className="search-field-input" placeholder="Search destinations"
          value={where} onChange={e => setWhere(e.target.value)}
        />
      </SearchField>
      <div className="search-divider" />

      <div style={{ position: 'relative', display: 'flex', flex: '2 1 0' }}>
        <SearchField icon={<Calendar size={16} />} label="Check in">
          <button type="button" className={`search-field-button${range?.from ? '' : ' is-placeholder'}`} onClick={openDates}>
            {range?.from ? formatNice(range.from) : 'Add date'}
          </button>
        </SearchField>
        <div className="search-divider" />
        <SearchField icon={<Calendar size={16} />} label="Check out">
          <button type="button" className={`search-field-button${range?.to ? '' : ' is-placeholder'}`} onClick={openDates}>
            {range?.to ? formatNice(range.to) : 'Add date'}
          </button>
        </SearchField>

        {datesOpen && (
          <>
            <div onClick={() => setDatesOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div className="search-popover dates">
              <DateRangeCalendar selected={range} onSelect={setRange} unavailableRanges={[]} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setRange(undefined)}>Clear</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setDatesOpen(false)}>Done</button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="search-divider" />

      <div style={{ position: 'relative', display: 'flex', flex: '1 1 0' }}>
        <SearchField icon={<Users size={16} />} label="Guests">
          <button type="button" className={`search-field-button${guests ? '' : ' is-placeholder'}`} onClick={openGuests}>
            {guests ? `${guests} guest${Number(guests) === 1 ? '' : 's'}` : 'Add guests'}
          </button>
        </SearchField>

        {guestsOpen && (
          <>
            <div onClick={() => setGuestsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div className="search-popover guests">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: '#111827' }}>Guests</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button" className="stepper-btn" aria-label="Fewer guests"
                    disabled={!guests || Number(guests) <= 1}
                    onClick={() => setGuests(g => String(Math.max(1, Number(g || 1) - 1)))}
                  >−</button>
                  <span style={{ minWidth: 16, textAlign: 'center', fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
                    {guests || 1}
                  </span>
                  <button
                    type="button" className="stepper-btn" aria-label="More guests"
                    onClick={() => setGuests(g => String(Number(g || 1) + 1))}
                  >+</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '4px' }}>
        <button type="submit" className="btn btn-primary" style={{
          width: 52, height: 52, borderRadius: '50%', padding: 0, flexShrink: 0,
        }}>
          <Search size={19} />
        </button>
      </div>
    </form>
  )
}

function SearchField({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="search-field">
      <span className="search-field-label">{icon} {label}</span>
      {children}
    </div>
  )
}
