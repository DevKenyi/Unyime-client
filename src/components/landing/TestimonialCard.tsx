import { Star } from 'lucide-react'
import PlaceholderImage, { type ImageVariant } from './PlaceholderImage'

interface Props {
  quote: string
  name: string
  rating?: number
  variant?: ImageVariant
  src?: string
}

export default function TestimonialCard({ quote, name, rating = 5, variant = 'lifestyle-couple', src }: Props) {
  return (
    <div className="surface-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PlaceholderImage variant={variant} src={src} alt={name} style={{ height: 200 }} />
      <div style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 1, marginBottom: 10 }}>
          {Array.from({ length: rating }).map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#374151', margin: '0 0 14px' }}>&ldquo;{quote}&rdquo;</p>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>— {name}</span>
      </div>
    </div>
  )
}
