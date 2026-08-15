import { Link } from 'react-router-dom'
import PlaceholderImage, { type ImageVariant } from './PlaceholderImage'

interface Props {
  city: string
  descriptor: string
  variant: ImageVariant
  src?: string
  tall?: boolean
}

export default function DestinationCard({ city, descriptor, variant, src, tall }: Props) {
  return (
    <Link
      to={`/properties?city=${encodeURIComponent(city)}`}
      className="media-zoom"
      style={{
        position: 'relative', display: 'block', borderRadius: 22, overflow: 'hidden',
        height: tall ? 360 : 240, textDecoration: 'none',
      }}
    >
      <PlaceholderImage variant={variant} src={src} alt={city} className="media-zoom__img" style={{ height: '100%' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
      }} />
      <div style={{ position: 'absolute', left: 20, bottom: 18, right: 20 }}>
        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.2px' }}>{city}</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{descriptor}</p>
      </div>
    </Link>
  )
}
