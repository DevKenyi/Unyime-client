import { Search, KeyRound, Sparkles } from 'lucide-react'
import PlaceholderImage, { type ImageVariant } from './PlaceholderImage'
import Reveal from './Reveal'
import { IMAGES } from './images'

const STEPS: { n: string; icon: React.ReactNode; title: string; desc: string; variant: ImageVariant; src: string }[] = [
  { n: '01', icon: <Search size={20} />, title: 'Discover', desc: 'Browse beautiful verified properties.', variant: 'apartment-living', src: IMAGES.heroSecondary1 },
  { n: '02', icon: <KeyRound size={20} />, title: 'Book', desc: 'Choose your dates and pay securely.', variant: 'apartment-bedroom', src: IMAGES.heroSecondary2 },
  { n: '03', icon: <Sparkles size={20} />, title: 'Stay', desc: 'Check in and enjoy your stay.', variant: 'lifestyle-friends', src: IMAGES.guest2 },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 44px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            Your next stay is only a few steps away.
          </h2>
        </div>
      </Reveal>

      <div className="grid-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.n} delay={i * 100}>
            <div className="media-zoom" style={{ position: 'relative', borderRadius: 22, marginBottom: 20 }}>
              <PlaceholderImage variant={step.variant} src={step.src} alt={step.title} className="media-zoom__img" style={{ borderRadius: 22, height: 200 }} />
              <div style={{
                position: 'absolute', top: 14, left: 14, width: 44, height: 44, borderRadius: 13,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#095C46',
              }}>
                {step.icon}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#D1D5DB' }}>{step.n}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{step.title}</h3>
            </div>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
