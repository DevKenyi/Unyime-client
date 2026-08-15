import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import Reveal from './Reveal'

const POINTS = [
  'Reach more guests',
  'Manage bookings easily',
  'Track your earnings',
  'Build your reputation',
]

export default function HostCTA() {
  return (
    <section id="become-a-host" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div className="split-2">
          <PlaceholderImage
            variant="host-welcome" alt="Host welcoming a guest" iconSize={36}
            style={{ borderRadius: 28, height: 'clamp(280px, 34vw, 440px)' }}
          />
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 16px' }}>
              Have a beautiful space?
            </h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: '#5B6572', margin: '0 0 24px', maxWidth: 440 }}>
              Turn your property into income by hosting guests on Unyimi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {POINTS.map(point => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <CheckCircle2 size={17} color="#095C46" />
                  <span style={{ fontSize: 14.5, color: '#374151', fontWeight: 500 }}>{point}</span>
                </div>
              ))}
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">
              Become a host <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
