import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Menu, X } from 'lucide-react'
import CountrySwitcher from './CountrySwitcher'

const LINKS = [
  { label: 'Explore stays', href: '/properties', isRoute: true },
  { label: 'How it works', href: '#how-it-works', isRoute: false },
  { label: 'Become a host', href: '#become-a-host', isRoute: false },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`premium-nav${scrolled ? ' is-scrolled' : ''}`}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3DAA82, #095C46)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Home size={18} color="#fff" strokeWidth={1.75} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.3px', color: '#111827' }}>Unyimi</span>
        </Link>

        <nav className="landing-nav-links" style={{ alignItems: 'center', gap: 22 }}>
          {LINKS.map(link => link.isRoute ? (
            <Link key={link.label} to={link.href} style={{ fontSize: 14.5, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href} style={{ fontSize: 14.5, fontWeight: 500, color: '#374151', textDecoration: 'none' }}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-links" style={{ alignItems: 'center', gap: 12 }}>
          <CountrySwitcher />
          <Link to="/login" style={{ fontSize: 14.5, fontWeight: 600, color: '#111827', textDecoration: 'none' }}>
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary btn-md">
            List your property
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="mobile-menu-trigger"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#111827' }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>Unyimi</span>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827' }} aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
          <div style={{ padding: '4px 4px 14px', borderBottom: '1px solid #F3F4F6', marginBottom: 10 }}>
            <CountrySwitcher fullWidth />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LINKS.map(link => link.isRoute ? (
              <Link key={link.label} to={link.href} onClick={() => setMenuOpen(false)} style={{ padding: '14px 4px', fontSize: 17, fontWeight: 600, color: '#111827', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{ padding: '14px 4px', fontSize: 17, fontWeight: 600, color: '#111827', textDecoration: 'none', borderBottom: '1px solid #F3F4F6' }}>
                {link.label}
              </a>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              List your property
            </Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
