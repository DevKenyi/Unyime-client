import TestimonialCard from './TestimonialCard'
import Reveal from './Reveal'
import { IMAGES } from './images'

const TESTIMONIALS = [
  { src: IMAGES.guest1, quote: "Booking through Unyimi was incredibly easy. The apartment looked exactly like the pictures and the host was amazing.", name: 'Sarah O.' },
  { src: IMAGES.guest2, quote: "The whole experience felt seamless. Verified hosts and secure payments gave us complete peace of mind.", name: 'Chidi & Amara' },
  { src: IMAGES.guest3, quote: "I loved the transparency. No hidden fees, no surprises — just a beautiful place to stay.", name: 'Tunde A.' },
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
        <div className="grid-3">
          {TESTIMONIALS.map(t => <TestimonialCard key={t.name} {...t} />)}
        </div>
      </Reveal>
    </section>
  )
}
