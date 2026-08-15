import DestinationCard from './DestinationCard'
import Reveal from './Reveal'

const DESTINATIONS = [
  { city: 'Abuja', descriptor: 'Modern stays in the heart of the capital', variant: 'skyline-abuja' as const, tall: true },
  { city: 'Lagos', descriptor: 'Coastal energy meets city living', variant: 'skyline-lagos' as const, tall: true },
  { city: 'Port Harcourt', descriptor: 'Riverside comfort and warm hospitality', variant: 'apartment-exterior' as const },
  { city: 'Ibadan', descriptor: 'Historic charm, modern comfort', variant: 'apartment-living' as const },
  { city: 'Enugu', descriptor: 'Hilltop views and quiet stays', variant: 'apartment-bedroom' as const },
]

export default function Destinations() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            Explore stays across Nigeria
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', margin: 0 }}>
            From the capital to the coast — find your next favorite city.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="destinations-grid">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="destinations-grid-primary">
            <DestinationCard {...DESTINATIONS[0]} />
            <DestinationCard {...DESTINATIONS[1]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="destinations-grid-secondary">
            {DESTINATIONS.slice(2).map(d => <DestinationCard key={d.city} {...d} />)}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
