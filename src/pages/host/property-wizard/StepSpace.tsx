import { Minus, Plus } from 'lucide-react'
import { AMENITY_OPTIONS, type StepProps } from './wizardTypes'

function Stepper({ label, value, min = 0, onChange }: { label: string; value: number; min?: number; onChange: (v: number) => void }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="stepper-control">
        <button type="button" className="stepper-btn" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`}>
          <Minus size={14} />
        </button>
        <span className="stepper-value">{value}</span>
        <button type="button" className="stepper-btn" onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function StepSpace({ state, update }: StepProps) {
  const toggleAmenity = (amenity: string) => {
    update('amenities', state.amenities.includes(amenity)
      ? state.amenities.filter(a => a !== amenity)
      : [...state.amenities, amenity])
  }

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Tell us about the space</h2>
      <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
        How many people can stay, and what do you offer?
      </p>

      <div className="form-row-3" style={{ display: 'grid', gap: 16, marginBottom: 4 }}>
        <Stepper label="Guests" value={state.maxGuests} min={1} onChange={v => update('maxGuests', v)} />
        <Stepper label="Bedrooms" value={state.bedrooms} onChange={v => update('bedrooms', v)} />
        <Stepper label="Beds" value={state.beds} min={1} onChange={v => update('beds', v)} />
      </div>
      <div className="form-row-3" style={{ display: 'grid', gap: 16 }}>
        <Stepper label="Bathrooms" value={state.bathrooms} onChange={v => update('bathrooms', v)} />
      </div>

      <div className="form-group" style={{ marginTop: 8 }}>
        <label>Amenities</label>
        <div className="amenity-grid">
          {AMENITY_OPTIONS.map(amenity => (
            <button
              key={amenity} type="button"
              className={`amenity-chip${state.amenities.includes(amenity) ? ' is-selected' : ''}`}
              onClick={() => toggleAmenity(amenity)}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
