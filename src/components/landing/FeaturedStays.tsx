import { useEffect, useState } from 'react'
import api from '../../api/axios'
import type { Property } from '../../types'
import PropertyGrid from './PropertyGrid'
import ShowcaseCard from './ShowcaseCard'
import Reveal from './Reveal'

const SAMPLE_STAYS = [
  { variant: 'apartment-living' as const, title: 'Modern 2 Bedroom Apartment', location: 'Maitama, Abuja', rating: '4.9', price: '₦85,000' },
  { variant: 'apartment-bedroom' as const, title: 'Cozy Studio with City Views', location: 'Lekki, Lagos', rating: '4.8', price: '₦45,000' },
  { variant: 'apartment-kitchen' as const, title: 'Luxury 3 Bedroom Short-let', location: 'Wuse II, Abuja', rating: '5.0', price: '₦120,000' },
  { variant: 'pool' as const, title: 'Serene Poolside Apartment', location: 'Ikoyi, Lagos', rating: '4.9', price: '₦150,000' },
  { variant: 'apartment-exterior' as const, title: 'Minimalist Garden Flat', location: 'Old GRA, Port Harcourt', rating: '4.7', price: '₦55,000' },
  { variant: 'host-welcome' as const, title: 'Bright Family Duplex', location: 'Independence Layout, Enugu', rating: '4.8', price: '₦70,000' },
]

export default function FeaturedStays() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get<Property[]>('/api/public/properties')
      .then(({ data }) => setProperties(data.slice(0, 6)))
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
            <div className="grid-3">
              {SAMPLE_STAYS.map(stay => <ShowcaseCard key={stay.title} {...stay} />)}
            </div>
          )}
        </Reveal>
      )}
    </section>
  )
}
