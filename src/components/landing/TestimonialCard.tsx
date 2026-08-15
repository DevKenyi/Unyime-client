import { Star, Quote } from 'lucide-react'

interface Props {
  quote: string
  name: string
  rating?: number
}

export default function TestimonialCard({ quote, name, rating = 5 }: Props) {
  return (
    <div className="surface-card" style={{ padding: 24, position: 'relative' }}>
      <Quote size={26} color="#D9E8E1" fill="#D9E8E1" style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 15, lineHeight: 1.65, color: '#374151', margin: '0 0 16px' }}>{quote}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>— {name}</span>
        <div style={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: rating }).map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
        </div>
      </div>
    </div>
  )
}
