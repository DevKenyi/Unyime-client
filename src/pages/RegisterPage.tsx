import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import type { AuthUser } from '../types'
import { Eye, EyeOff, Mail, Lock, Home, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Public self-registration only ever creates HOST accounts — admin accounts
      // aren't self-service (see AuthService.register on the backend).
      const { data } = await api.post<AuthUser>('/api/auth/register', { email, password, role: 'HOST' })
      login(data)
      navigate('/host/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not create your account.')
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
        to="/"
        style={{
          position: 'absolute', top: 24, left: 24,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 600, color: '#374151', textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #3DAA82, #095C46)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, boxShadow: '0 8px 24px rgba(9,92,70,0.25)',
      }}>
        <Home size={32} color="#fff" strokeWidth={1.75} />
      </div>

      <h1 style={{ fontSize: 38, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.5px', textAlign: 'center' }}>
        Create your account
      </h1>
      <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>
        Start hosting on Unyimi
      </p>

      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters" autoComplete="new-password" required minLength={8}
                style={{
                  width: '100%', padding: '13px 48px 13px 44px', border: '1.5px solid #E5E7EB', borderRadius: 9999,
                  fontSize: 15, fontFamily: 'inherit', background: '#fff', color: '#111827', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#095C46'; e.target.style.boxShadow = '0 0 0 3px rgba(9,92,70,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
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
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginTop: 18, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#095C46', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, textAlign: 'center' }}>
        By continuing, you agree to Unyimi's{' '}
        <a href="#" style={{ color: '#6B7280', textDecoration: 'underline' }}>Terms</a>
        {' '}and{' '}
        <a href="#" style={{ color: '#6B7280', textDecoration: 'underline' }}>Privacy</a>.
      </p>
    </div>
  )
}
