import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Property } from '../../types'
import PropertyGrid from './PropertyGrid'
import ShowcaseCard from './ShowcaseCard'
import Reveal from './Reveal'
import { IMAGES } from './images'

const SAMPLE_STAYS = [
  { variant: 'apartment-living' as const, src: IMAGES.featured1, title: 'Modern 2 Bedroom Apartment', location: 'Maitama, Abuja', rating: '4.9', price: '₦85,000' },
  { variant: 'apartment-bedroom' as const, src: IMAGES.featured2, title: 'Luxury Short-let Studio', location: 'Ikoyi, Lagos', rating: '4.8', price: '₦65,000' },
  { variant: 'apartment-kitchen' as const, src: IMAGES.featured3, title: 'Beautiful 3 Bedroom Duplex', location: 'GRA, Port Harcourt', rating: '5.0', price: '₦120,000' },
  { variant: 'pool' as const, src: IMAGES.featured4, title: 'Cozy 1 Bedroom Flat', location: 'Bodija, Ibadan', rating: '4.7', price: '₦45,000' },
]

export default function FeaturedStays() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get<Property[]>('/api/public/properties')
      .then(({ data }) => setProperties(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setProperties([]))
      .finally(() => setLoaded(true))
  }, [])

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            Stay somewhere you'll love
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', margin: 0 }}>
            Handpicked stays from trusted hosts.
          </p>
        </div>
      </Reveal>

      {loaded && (
        <Reveal delay={80}>
          {properties.length > 0 ? (
            <PropertyGrid properties={properties} />
          ) : (
            <div className="grid-4">
              {SAMPLE_STAYS.map(stay => <ShowcaseCard key={stay.title} {...stay} />)}
            </div>
          )}
        </Reveal>
      )}
    </section>
  )
}
