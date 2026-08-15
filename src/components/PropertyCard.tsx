import { Link } from 'react-router-dom'
import { MapPin, Users, Star } from 'lucide-react'
import type { Property } from '../types'

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23E8F5F1"/%3E%3C/svg%3E'

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to={`/properties/${property.slug}`}
      className="surface-card"
      style={{ display: 'block', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        height: 180, background: `url(${property.coverImageUrl || FALLBACK_IMAGE}) center/cover no-repeat`,
      }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
            {property.title}
          </h3>
          {property.averageRating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {property.averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#6B7280', fontSize: 13 }}>
          <MapPin size={13} />
          <span>{property.city}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#6B7280', fontSize: 13 }}>
          <Users size={13} />
          <span>Up to {property.maxGuests} guests</span>
        </div>

        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#095C46' }}>
            ₦{property.pricePerNight.toLocaleString()}
          </span>
          <span style={{ fontSize: 12.5, color: '#6B7280' }}>/ night</span>
        </div>
      </div>
    </Link>
  )
}
