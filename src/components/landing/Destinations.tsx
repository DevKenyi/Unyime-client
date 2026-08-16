import DestinationCard from './DestinationCard'
import Reveal from './Reveal'
import { IMAGES } from './images'
import { useCountry } from '../../contexts/CountryContext'

const DESTINATIONS_BY_COUNTRY = {
  NIGERIA: [
    { city: 'Abuja', descriptor: 'Modern stays in the heart of the capital', variant: 'skyline-abuja' as const, src: IMAGES.destAbuja, tall: true },
    { city: 'Lagos', descriptor: 'Coastal energy meets city living', variant: 'skyline-lagos' as const, src: IMAGES.destLagos, tall: true },
    { city: 'Port Harcourt', descriptor: 'Riverside comfort and warm hospitality', variant: 'apartment-exterior' as const, src: IMAGES.destPh },
    { city: 'Ibadan', descriptor: 'Historic charm, modern comfort', variant: 'apartment-living' as const, src: IMAGES.destIbadan },
    { city: 'Enugu', descriptor: 'Hilltop views and quiet stays', variant: 'apartment-bedroom' as const, src: IMAGES.destEnugu },
  ],
  SOUTH_AFRICA: [
    { city: 'Cape Town', descriptor: 'Coastal views and mountain backdrops', variant: 'skyline-lagos' as const, tall: true },
    { city: 'Johannesburg', descriptor: 'The city of gold, always on the move', variant: 'skyline-abuja' as const, tall: true },
    { city: 'Durban', descriptor: 'Warm beaches and Indian Ocean living', variant: 'apartment-exterior' as const },
    { city: 'Pretoria', descriptor: 'Jacaranda-lined streets, quiet comfort', variant: 'apartment-living' as const },
    { city: 'Stellenbosch', descriptor: 'Winelands charm, historic stays', variant: 'apartment-bedroom' as const },
  ],
}

const HEADING_BY_COUNTRY = {
  NIGERIA: { title: 'Explore stays across Nigeria', subtitle: 'From the capital to the coast — find your next favorite city.' },
  SOUTH_AFRICA: { title: 'Explore stays across South Africa', subtitle: 'From the coast to the winelands — find your next favorite city.' },
}

export default function Destinations() {
  const { country } = useCountry()
  const DESTINATIONS = DESTINATIONS_BY_COUNTRY[country]
  const heading = HEADING_BY_COUNTRY[country]

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            {heading.title}
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', margin: 0 }}>
            {heading.subtitle}
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
