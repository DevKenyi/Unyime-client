import { ShieldCheck, CreditCard, Star, MessageSquareHeart } from 'lucide-react'
import SearchBar from './SearchBar'
import PlaceholderImage from './PlaceholderImage'
import Reveal from './Reveal'
import { IMAGES } from './images'

const TRUST_ITEMS = [
  { icon: <ShieldCheck size={15} />, label: 'Verified properties' },
  { icon: <CreditCard size={15} />, label: 'Secure payments' },
  { icon: <MessageSquareHeart size={15} />, label: 'Real guest reviews' },
]

export default function Hero() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 0' }}>
      <Reveal>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-1.6px', color: '#111827',
            margin: '0 0 20px',
          }}>
            Find a place that<br />feels like home.
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.6, color: '#5B6572', maxWidth: 520, margin: '0 auto 36px' }}>
            Discover beautiful, verified stays across Nigeria — and book with confidence.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SearchBar />
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 28px',
          margin: '28px 0 48px',
        }}>
          {TRUST_ITEMS.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#095C46' }}>
              {item.icon}
              <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="hero-collage" style={{
          display: 'grid', gridTemplateColumns: '1fr', gap: 16, position: 'relative', paddingBottom: 40,
        }}>
          <PlaceholderImage
            variant="apartment-exterior"
            src={IMAGES.heroMain}
            alt="Modern apartment exterior"
            iconSize={40}
            style={{ borderRadius: 28, height: 'clamp(320px, 46vw, 520px)' }}
          >
            {/* Floating review card */}
            <div style={{
              position: 'absolute', left: 24, bottom: -28,
              background: '#fff', borderRadius: 18, padding: '14px 18px',
              boxShadow: '0 20px 40px -16px rgba(17,24,39,0.28)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ display: 'flex', gap: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', margin: 0 }}>4.9 rating</p>
                <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>Loved by our guests</p>
              </div>
            </div>
          </PlaceholderImage>

          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
            <PlaceholderImage
              variant="apartment-living" src={IMAGES.heroSecondary1} alt="Living room"
              style={{ borderRadius: 24, height: 'clamp(150px, 22vw, 252px)' }}
            />
            <PlaceholderImage
              variant="apartment-bedroom" src={IMAGES.heroSecondary2} alt="Bedroom"
              style={{ borderRadius: 24, height: 'clamp(150px, 22vw, 252px)' }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
