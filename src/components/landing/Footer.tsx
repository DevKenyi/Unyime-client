import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Browse stays', to: '/properties' },
      { label: 'Destinations', to: '/properties' },
      { label: 'How it works', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Host',
    links: [
      { label: 'Become a host', to: '/register' },
      { label: 'Host dashboard', to: '/host/dashboard' },
      { label: 'Host resources', href: '#become-a-host' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #E5E7EB', marginTop: 120 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px' }}>
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
            <p style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 260, lineHeight: 1.6 }}>
              Beautiful stays. Trusted hosts.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                {col.heading}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.links.map(link => link.to ? (
                  <Link key={link.label} to={link.to} style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} style={{ fontSize: 13.5, color: '#374151', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 40, paddingTop: 20, borderTop: '1px solid #E5E7EB' }}>
          © {new Date().getFullYear()} Unyimi. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
