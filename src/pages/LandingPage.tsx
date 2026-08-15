import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home, Search, ShieldCheck, CalendarCheck, CreditCard, Star,
  ArrowRight, CheckCircle2, MapPin, KeyRound, Sparkles,
} from 'lucide-react'

const FEATURES = [
  {
    icon: <ShieldCheck size={20} />,
    title: 'Verified hosts',
    desc: 'Every host completes identity verification before their property goes live — so you know who you\'re booking with.',
  },
  {
    icon: <CalendarCheck size={20} />,
    title: 'Real-time availability',
    desc: 'See exactly which dates are open, book instantly, and never worry about a double-booked stay.',
  },
  {
    icon: <CreditCard size={20} />,
    title: 'Secure payments',
    desc: 'Pay safely online with a transparent price breakdown — nightly rate, cleaning fee, and service charge, no surprises.',
  },
  {
    icon: <Star size={20} />,
    title: 'Real guest reviews',
    desc: 'Ratings and reviews come only from guests who actually stayed, so you can book with confidence.',
  },
]

const STEPS = [
  {
    icon: <Search size={22} />,
    title: 'Search',
    desc: 'Tell us where you\'re headed, your dates, and how many guests — we\'ll show you what\'s available.',
  },
  {
    icon: <KeyRound size={22} />,
    title: 'Book & pay',
    desc: 'Pick your stay, review the price breakdown, and pay securely online in a couple of minutes.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Stay',
    desc: 'Get your host\'s check-in details and enjoy your stay — leave a review when you\'re done.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(city.trim() ? `/properties?city=${encodeURIComponent(city.trim())}` : '/properties')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE', overflowX: 'hidden' }}>
      {/* ── Nav ─────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(245,243,238,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3DAA82, #095C46)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Home size={18} color="#fff" strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: '#111827' }}>
              Unyimi
            </span>
          </div>

          <nav className="landing-nav-links" style={{ alignItems: 'center', gap: 28 }}>
            <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              How it works
            </a>
            <Link to="/properties" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              Browse stays
            </Link>
            <a href="#become-a-host" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              Become a host
            </a>
          </nav>

          <Link to="/login" className="btn btn-primary btn-md">
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#E8F5F1', color: '#095C46',
            padding: '6px 14px', borderRadius: 9999,
            fontSize: 13, fontWeight: 700, marginBottom: 20,
          }}>
            <MapPin size={14} /> Stays across Nigeria
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-1.2px', color: '#111827',
            margin: '0 0 20px',
          }}>
            Book unique stays,<br />
            <span style={{ color: '#095C46' }}>hosted by verified locals</span>
          </h1>

          <p style={{
            fontSize: 17, lineHeight: 1.6, color: '#6B7280',
            maxWidth: 480, margin: '0 auto 32px',
          }}>
            Unyimi connects you with verified hosts across Nigeria — search real
            availability, book securely, and pay with confidence.
          </p>

          <form onSubmit={handleSearch} className="surface-card" style={{
            display: 'flex', gap: 8, padding: 10, maxWidth: 480, margin: '0 auto 24px',
          }}>
            <input
              className="input"
              placeholder="Where do you want to stay?"
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{ border: 'none', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-md">
              <Search size={15} /> Search
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 24px' }}>
            {['Verified hosts', 'Instant availability', 'Secure payments'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <CheckCircle2 size={16} color="#095C46" />
                <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 12px' }}>
            From search to stay, in three steps
          </h2>
          <p style={{ fontSize: 15.5, color: '#6B7280', margin: 0 }}>
            No middlemen, no guesswork — just verified places to stay.
          </p>
        </div>

        <div className="landing-steps-grid">
          {STEPS.map((step, i) => (
            <div key={step.title} style={{ position: 'relative', textAlign: 'center', padding: '0 12px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px',
                background: '#E8F5F1', color: '#095C46',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step.icon}
              </div>
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(38px)',
                fontSize: 13, fontWeight: 800, color: '#D1D5DB',
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" style={{ background: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 44px' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 12px' }}>
              Built for trust, on both sides
            </h2>
            <p style={{ fontSize: 15.5, color: '#6B7280', margin: 0 }}>
              Every part of a booking — from listing to payout — is designed to be verifiable.
            </p>
          </div>

          <div className="landing-features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="surface-card" style={{ padding: '24px 22px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: '#E8F5F1', color: '#095C46',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────── */}
      <section id="become-a-host" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #095C46, #053A2C)',
          borderRadius: 28, padding: 'clamp(36px, 6vw, 56px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(50% 80% at 80% 0%, rgba(255,255,255,0.08), transparent 70%)',
          }} />
          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff',
            letterSpacing: '-0.6px', margin: '0 0 14px', position: 'relative',
          }}>
            Have a property? Start hosting today.
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.78)', maxWidth: 480,
            margin: '0 auto 28px', position: 'relative',
          }}>
            Sign in to list your property, manage bookings, and track your
            earnings — all in one dashboard.
          </p>
          <Link
            to="/login"
            className="btn btn-lg"
            style={{ background: '#fff', color: '#095C46', position: 'relative' }}
          >
            Sign in to your dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 20px' }}>
          <div className="landing-footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'linear-gradient(135deg, #3DAA82, #095C46)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Home size={16} color="#fff" strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Unyimi</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 280, lineHeight: 1.6 }}>
                A property booking marketplace for verified hosts and guests
                across Nigeria.
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Product
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="#how-it-works" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>How it works</a>
                <Link to="/properties" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>Browse stays</Link>
                <Link to="/login" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>Sign in</Link>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Company
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="#" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>Terms</a>
                <a href="#" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>Privacy</a>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 32, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
            © {new Date().getFullYear()} Unyimi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
