import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Search } from 'lucide-react'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function SearchBar() {
  const navigate = useNavigate()
  const [where, setWhere] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Dates aren't wired to a backend filter yet — search only supports city/guests today —
    // so they're collected for the premium feel but not sent as query params.
    const params: Record<string, string> = {}
    if (where.trim()) params.city = where.trim()
    if (guests) params.guests = guests
    navigate(`/properties?${new URLSearchParams(params).toString()}`)
  }

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
      <SearchField icon={<Calendar size={16} />} label="Check in">
        <input
          className="search-field-input" type="date" min={todayISO()}
          value={checkIn} onChange={e => setCheckIn(e.target.value)}
        />
      </SearchField>
      <div className="search-divider" />
      <SearchField icon={<Calendar size={16} />} label="Check out">
        <input
          className="search-field-input" type="date" min={checkIn || todayISO()}
          value={checkOut} onChange={e => setCheckOut(e.target.value)}
        />
      </SearchField>
      <div className="search-divider" />
      <SearchField icon={<Users size={16} />} label="Guests">
        <input
          className="search-field-input" type="number" min={1} placeholder="Add guests"
          value={guests} onChange={e => setGuests(e.target.value)}
        />
      </SearchField>

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

function SearchField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="search-field">
      <span className="search-field-label">{icon} {label}</span>
      {children}
    </div>
  )
}
