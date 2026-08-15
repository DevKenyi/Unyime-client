import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapPin, Users, Star, Heart } from 'lucide-react'
import PlaceholderImage from './landing/PlaceholderImage'
import { IMAGES } from './landing/images'
import type { Property } from '../types'

const FAVORITES_KEY = 'unyimi_favorites'

function useFavorite(propertyId: string) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      const ids: string[] = raw ? JSON.parse(raw) : []
      setActive(ids.includes(propertyId))
    } catch { /* ignore */ }
  }, [propertyId])

  const toggle = () => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      const ids: string[] = raw ? JSON.parse(raw) : []
      const next = active ? ids.filter(id => id !== propertyId) : [...ids, propertyId]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      setActive(!active)
    } catch { /* ignore */ }
  }

  return { active, toggle }
}

export default function PropertyCard({ property }: { property: Property }) {
  const { active, toggle } = useFavorite(property.id)

  return (
    <Link to={`/properties/${property.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="media-zoom" style={{ position: 'relative', borderRadius: 20, aspectRatio: '4 / 3' }}>
        <PlaceholderImage
          variant="apartment-living"
          src={property.coverImageUrl || IMAGES.featured1}
          alt={property.title}
          className="media-zoom__img"
          style={{ borderRadius: 20, height: '100%' }}
        />
        <button
          className={`heart-btn${active ? ' is-active' : ''}`}
          onClick={e => { e.preventDefault(); toggle() }}
          style={{ position: 'absolute', top: 12, right: 12 }}
          aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={16} color="#fff" fill={active ? '#EF4444' : 'none'} strokeWidth={2} />
        </button>
      </div>

      <div style={{ padding: '14px 2px 0' }}>
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
