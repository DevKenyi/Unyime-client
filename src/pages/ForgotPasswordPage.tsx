import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { Mail, Home, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F3EE', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
      position: 'relative',
    }}>
      <Link
        to="/login"
        style={{
          position: 'absolute', top: 24, left: 24,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to sign in
      </Link>

      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #3DAA82, #095C46)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 8px 24px rgba(9,92,70,0.25)',
      }}>
        <Home size={32} color="#fff" strokeWidth={1.75} />
      </div>

      <h1 style={{ fontSize: 34, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px', textAlign: 'center' }}>
        Forgot your password?
      </h1>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, textAlign: 'center', maxWidth: 340 }}>
        Enter your email and we'll send you a link to reset it.
      </p>

      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#E8F5F1', color: '#095C46',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={26} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Check your email</p>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. It expires in 30 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email" required
                  style={{
                    width: '100%', padding: '13px 16px 13px 44px', border: '1.5px solid #E5E7EB', borderRadius: 9999,
                    fontSize: 15, fontFamily: 'inherit', background: '#fff', color: '#111827', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#095C46'; e.target.style.boxShadow = '0 0 0 3px rgba(9,92,70,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px', background: '#095C46', color: '#fff', border: 'none', borderRadius: 9999,
                fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#053A2C' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = '#095C46' }}
            >
              {loading ? <><span className="spinner" /> Sending…</> : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
