import { Link } from 'react-router-dom'
import {
  Utensils, QrCode, Smartphone, Bell, LayoutDashboard,
  ArrowRight, CheckCircle2, Star, Clock, ChefHat, Menu as MenuIcon,
} from 'lucide-react'

const FEATURES = [
  {
    icon: <QrCode size={20} />,
    title: 'Scan-to-order QR codes',
    desc: 'Every table gets a unique code that opens your live menu — no app to download, no waiter to flag down.',
  },
  {
    icon: <Bell size={20} />,
    title: 'Real-time order tracking',
    desc: 'Guests watch their order move from received to preparing to ready, right from their phone.',
  },
  {
    icon: <LayoutDashboard size={20} />,
    title: 'Live vendor dashboard',
    desc: 'Kitchen and floor staff see new orders the second they land, with one tap to update status.',
  },
  {
    icon: <Smartphone size={20} />,
    title: 'Works on any phone',
    desc: 'Built for the mobile web — fast on any device, on any connection, with no install friction.',
  },
]

const STEPS = [
  {
    icon: <QrCode size={22} />,
    title: 'Scan the code',
    desc: 'Guests scan the QR code on their table and land straight on your live menu.',
  },
  {
    icon: <ChefHat size={22} />,
    title: 'Order & pay',
    desc: 'They browse, build their order, and check out in under a minute — no waiting on staff.',
  },
  {
    icon: <Clock size={22} />,
    title: 'Track in real time',
    desc: 'Your kitchen updates the order status live, so guests always know what\'s next.',
  },
]

export default function LandingPage() {
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
              <Utensils size={18} color="#fff" strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: '#111827' }}>
              Movara
            </span>
          </div>

          <nav className="landing-nav-links" style={{ alignItems: 'center', gap: 28 }}>
            <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              How it works
            </a>
            <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#for-restaurants" style={{ fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              For restaurants
            </a>
          </nav>

          <Link to="/login" className="btn btn-primary btn-md">
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 20px 40px' }}>
        <div className="landing-hero-grid">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#E8F5F1', color: '#095C46',
              padding: '6px 14px', borderRadius: 9999,
              fontSize: 13, fontWeight: 700, marginBottom: 20,
            }}>
              <QrCode size={14} /> QR ordering, reinvented
            </div>

            <h1 style={{
              fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-1.2px', color: '#111827',
              margin: '0 0 20px',
            }}>
              Table-side ordering,<br />
              without the <span style={{ color: '#095C46' }}>wait staff bottleneck</span>
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.6, color: '#6B7280',
              maxWidth: 480, margin: '0 0 32px',
            }}>
              Movara turns any table into an ordering counter. Guests scan, browse
              your live menu, and order in seconds — your kitchen sees it instantly.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <Link to="/login" className="btn btn-primary btn-lg">
                Get started <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg">
                See how it works
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
              {['No app to download', 'Live in minutes', 'Real-time kitchen sync'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CheckCircle2 size={16} color="#095C46" />
                  <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: floating menu / order mockup */}
          <div className="landing-hero-visual" style={{ position: 'relative', height: 460 }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(60% 60% at 70% 30%, rgba(9,92,70,0.14), transparent 70%)',
            }} />

            {/* Phone-style menu card */}
            <div style={{
              position: 'absolute', top: 20, left: 30, width: 280,
              background: '#fff', borderRadius: 24, border: '1px solid #E5E7EB',
              boxShadow: '0 24px 48px -20px rgba(17,24,39,0.22)', overflow: 'hidden',
            }}>
              <div style={{ background: '#095C46', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MenuIcon size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>The Grove Kitchen</p>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11.5, margin: 0 }}>Table 12 · Open now</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Jollof Rice & Grilled Chicken', price: '₦4,500' },
                  { name: 'Suya Skewers (3pc)', price: '₦3,200' },
                  { name: 'Chapman Mocktail', price: '₦1,800' },
                ].map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F5F3EE', flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: '#111827', fontWeight: 600, maxWidth: 140 }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 12.5, color: '#095C46', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating: order ready badge */}
            <div style={{
              position: 'absolute', top: 40, right: 10,
              background: '#fff', borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 16px 32px -14px rgba(17,24,39,0.25)',
              display: 'flex', alignItems: 'center', gap: 10,
              animation: 'landing-float 4s ease-in-out infinite',
            }}>
              <span className="status-pill status-ready">
                <span className="status-dot" /> Ready
              </span>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Order #482</span>
            </div>

            {/* Floating: rating card */}
            <div style={{
              position: 'absolute', bottom: 50, left: 4,
              background: '#fff', borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 16px 32px -14px rgba(17,24,39,0.25)',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'landing-float 5s ease-in-out infinite 0.5s',
            }}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>4.9</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>· 2 min avg wait</span>
            </div>

            {/* Floating: prep time card */}
            <div style={{
              position: 'absolute', bottom: 0, right: 40,
              background: '#095C46', borderRadius: 16, padding: '14px 18px',
              boxShadow: '0 16px 32px -14px rgba(9,92,70,0.4)',
              animation: 'landing-float 4.5s ease-in-out infinite 1s',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kitchen synced
              </p>
              <p style={{ color: '#fff', fontSize: 15, margin: '2px 0 0', fontWeight: 700 }}>
                Live in real time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section id="how-it-works" style={{ maxWidth: 1160, margin: '0 auto', padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 12px' }}>
            From scan to served, in three steps
          </h2>
          <p style={{ fontSize: 15.5, color: '#6B7280', margin: 0 }}>
            No downloads, no accounts, no waiting for a menu.
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
              Everything your floor and kitchen need
            </h2>
            <p style={{ fontSize: 15.5, color: '#6B7280', margin: 0 }}>
              One system connecting the table to the kitchen — built for speed on both ends.
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
      <section id="for-restaurants" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 20px' }}>
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
            Own a restaurant? Get set up in minutes.
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.78)', maxWidth: 480,
            margin: '0 auto 28px', position: 'relative',
          }}>
            Sign in to manage your menu, print your table QR codes, and start
            taking orders today.
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
                  <Utensils size={16} color="#fff" strokeWidth={1.75} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Movara</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 280, lineHeight: 1.6 }}>
                Table-side QR ordering for restaurants — scan, order, and track,
                without the app.
              </p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Product
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="#how-it-works" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>How it works</a>
                <a href="#features" style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>Features</a>
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
            © {new Date().getFullYear()} Movara. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
