import { BedDouble, Bath, MapPin, Sparkles, Users } from 'lucide-react'
import PlaceholderImage from '../../../components/landing/PlaceholderImage'
import { formatMoney } from '../../../utils/currency'
import { CURRENCY_BY_COUNTRY, type WizardState } from './wizardTypes'

export default function ListingPreviewCard({ state }: { state: WizardState }) {
  const coverUrl = state.photos[0]?.url ?? null
  const currency = CURRENCY_BY_COUNTRY[state.country]

  return (
    <div className="surface-card" style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
        <PlaceholderImage
          variant="apartment-living"
          src={coverUrl ?? undefined}
          alt={state.title || 'Property preview'}
          style={{ height: '100%' }}
        />
        <span style={{
          position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '4px 10px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          <Sparkles size={12} /> New listing
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
          {state.title || 'Your listing title'}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: '#6B7280', fontSize: 13 }}>
          <MapPin size={13} />
          <span>{state.city || 'Location'}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 8, color: '#6B7280', fontSize: 12.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {state.maxGuests} guests</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BedDouble size={13} /> {state.bedrooms} bed{state.bedrooms === 1 ? '' : 's'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={13} /> {state.bathrooms} bath{state.bathrooms === 1 ? '' : 's'}</span>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#095C46' }}>
            {formatMoney(state.pricePerNight ? Number(state.pricePerNight) : 0, currency)}
          </span>
          <span style={{ fontSize: 12.5, color: '#6B7280' }}>/ night</span>
        </div>
      </div>
    </div>
  )
}
