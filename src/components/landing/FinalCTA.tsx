import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import Reveal from './Reveal'
import { IMAGES } from './images'

export default function FinalCTA() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <PlaceholderImage
          variant="skyline-lagos"
          src={IMAGES.finalCTA}
          alt="Beautiful stays across Nigeria"
          iconSize={0}
          style={{ borderRadius: 32, height: 'clamp(340px, 42vw, 480px)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(10,15,20,0.15) 0%, rgba(10,15,20,0.68) 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: 24,
          }}>
            <h2 style={{
              fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, color: '#fff',
              letterSpacing: '-0.8px', margin: '0 0 12px', maxWidth: 560,
            }}>
              Your next stay is waiting.
            </h2>
            <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.82)', margin: '0 0 32px', maxWidth: 440 }}>
              Discover a better way to stay in Nigeria.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <Link to="/properties" className="btn btn-lg" style={{ background: '#fff', color: '#095C46' }}>
                Explore stays <ArrowRight size={16} />
              </Link>
              <Link to="/register" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                Become a host
              </Link>
            </div>
          </div>
        </PlaceholderImage>
      </Reveal>
    </section>
  )
}
