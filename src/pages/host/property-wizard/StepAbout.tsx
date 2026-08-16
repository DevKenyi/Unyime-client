import { Building2, Home, Hotel, TreePine, User } from 'lucide-react'
import { COUNTRY_OPTIONS, PROPERTY_TYPE_OPTIONS, type StepProps } from './wizardTypes'
import type { PropertyType } from '../../../types'

const TYPE_ICONS: Record<PropertyType, typeof Home> = {
  APARTMENT: Building2,
  HOUSE: Home,
  VILLA: TreePine,
  HOTEL: Hotel,
  ROOM: User,
}

export default function StepAbout({ state, update }: StepProps) {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Tell us about your place</h2>
      <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
        Start with the basics — you can always come back and edit these later.
      </p>

      <div className="form-group">
        <label>What should guests call your property?</label>
        <input
          className="input" placeholder="Modern 2 Bedroom Apartment"
          value={state.title} onChange={e => update('title', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Country</label>
        <div className="type-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {COUNTRY_OPTIONS.map(opt => (
            <button
              key={opt.value} type="button"
              className={`type-chip${state.country === opt.value ? ' is-selected' : ''}`}
              onClick={() => update('country', opt.value)}
            >
              <span style={{ fontSize: 20 }}>{opt.flag}</span>
              {opt.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '6px 0 0' }}>
          Sets the currency guests will pay in for this listing.
        </p>
      </div>

      <div className="form-group">
        <label>Property type</label>
        <div className="type-grid">
          {PROPERTY_TYPE_OPTIONS.map(opt => {
            const Icon = TYPE_ICONS[opt.value]
            return (
              <button
                key={opt.value} type="button"
                className={`type-chip${state.propertyType === opt.value ? ' is-selected' : ''}`}
                onClick={() => update('propertyType', opt.value)}
              >
                <Icon size={20} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          className="input" rows={5} placeholder="Tell guests what makes this place special..."
          value={state.description} onChange={e => update('description', e.target.value)}
        />
      </div>

      <div className="form-row-2" style={{ display: 'grid', gap: 16 }}>
        <div className="form-group">
          <label>City</label>
          <input className="input" placeholder="Abuja" value={state.city} onChange={e => update('city', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input className="input" placeholder="Street address (optional)" value={state.address} onChange={e => update('address', e.target.value)} />
        </div>
      </div>
    </div>
  )
}
