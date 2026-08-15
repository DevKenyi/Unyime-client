import PlaceholderImage from './PlaceholderImage'
import TestimonialCard from './TestimonialCard'
import Reveal from './Reveal'

const TESTIMONIALS = [
  { quote: "Booking through Unyimi was incredibly easy. The apartment looked exactly like the pictures and the host was amazing.", name: 'Sarah O.' },
  { quote: "We found the perfect place for our weekend trip in minutes. Verified reviews made all the difference.", name: 'Tunde A.' },
]

export default function GuestExperience() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            Guests leave happy
          </h2>
          <p style={{ fontSize: 16, color: '#6B7280', margin: 0 }}>
            Real stays, real experiences.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="guest-experience-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <PlaceholderImage
            variant="lifestyle-couple"
            alt="Happy guests enjoying their stay"
            className="guest-experience-image"
            iconSize={36}
            style={{ borderRadius: 24, height: 320 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TESTIMONIALS.map(t => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
