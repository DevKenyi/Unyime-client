import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import PlaceholderImage, { type ImageVariant } from './PlaceholderImage'

interface Props {
  variant: ImageVariant
  src?: string
  title: string
  location: string
  rating: string
  price: string
  to?: string
}

/** Illustrative sample card — used only as a fallback when there's no live property data to show yet. */
export default function ShowcaseCard({ variant, src, title, location, rating, price, to = '/properties' }: Props) {
  return (
    <Link to={to} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="media-zoom" style={{ position: 'relative', borderRadius: 20, aspectRatio: '4 / 3' }}>
        <PlaceholderImage variant={variant} src={src} alt={title} className="media-zoom__img" style={{ borderRadius: 20, height: '100%' }} />
      </div>
      <div style={{ padding: '14px 2px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{rating}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#6B7280', fontSize: 13 }}>
          <MapPin size={13} /><span>{location}</span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#095C46' }}>{price}</span>
          <span style={{ fontSize: 12.5, color: '#6B7280' }}>/ night</span>
        </div>
      </div>
    </Link>
  )
}
