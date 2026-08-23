import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import TermsContent, { TERMS_VERSION } from '../components/TermsContent'

export { TERMS_VERSION }

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div className="surface-card" style={{ padding: '32px 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Terms & Conditions</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 28px' }}>Version {TERMS_VERSION}</p>

          <TermsContent />

          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 28, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
            This is a draft policy document pending final legal review — it is not yet a
            substitute for advice from qualified counsel in each jurisdiction Unyimi operates in.
          </p>
        </div>
      </main>
    </div>
  )
}
