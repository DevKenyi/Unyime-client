import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { TERMS_VERSION } from '../components/TermsContent'
import type { TermsStatus } from '../types'

/** Reachable via the magic link emailed at reservation time. Terms & Conditions is the only
 * gate on the guest side now — no ID upload, no admin review (see PaymentService's
 * requireVerification) — this page exists mainly so a guest can review/re-accept from their
 * account if the terms ever change, since the booking wizard itself handles first-time
 * acceptance inline without requiring login at all. */
export default function GuestVerifyPage() {
  const { user } = useAuth()

  const [terms, setTerms] = useState<TermsStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const [acceptChecked, setAcceptChecked] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [termsError, setTermsError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'GUEST') { setLoading(false); return }
    api.get<TermsStatus>('/api/terms/status')
      .then(({ data }) => setTerms(data))
      .finally(() => setLoading(false))
  }, [user])

  const handleAcceptTerms = async () => {
    setAccepting(true)
    setTermsError('')
    try {
      const { data } = await api.post<TermsStatus>('/api/terms/accept')
      setTerms(data)
    } catch (err: any) {
      setTermsError(err.response?.data?.error ?? 'Could not record your acceptance.')
    } finally {
      setAccepting(false)
    }
  }

  if (!user || user.role !== 'GUEST') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#374151', maxWidth: 360 }}>
          Please use the sign-in link from your reservation confirmation email to access this page.
        </p>
        <Link to="/properties" className="btn btn-secondary btn-md">Back to search</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Browse stays
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 60px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Your account</h1>
        <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>Signed in as {user.email}.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>
        ) : (
          <div className="surface-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Terms & Conditions</h2>
              {terms?.accepted && <ShieldCheck size={16} color="#095C46" />}
            </div>

            {terms?.accepted ? (
              <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
                You accepted version {terms.currentVersion} on {terms.acceptedAt ? new Date(terms.acceptedAt).toLocaleDateString() : ''}.
              </p>
            ) : (
              <>
                <Link to="/terms" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#095C46', textDecoration: 'none', fontWeight: 600, marginBottom: 12 }}>
                  <FileText size={14} /> Read the Terms & Conditions (v{TERMS_VERSION})
                </Link>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: '#374151', marginBottom: 14 }}>
                  <input type="checkbox" checked={acceptChecked} onChange={e => setAcceptChecked(e.target.checked)} style={{ marginTop: 2 }} />
                  I have read and agree to Unyimi's Terms & Conditions.
                </label>
                {termsError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{termsError}</p>}
                <button className="btn btn-primary btn-md" disabled={!acceptChecked || accepting} onClick={handleAcceptTerms}>
                  {accepting ? <span className="spinner" /> : 'Accept & continue'}
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

