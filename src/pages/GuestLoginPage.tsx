import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'

/**
 * Lands here from the magic link emailed right after a reservation is created — the token
 * carries its own identity, so this page just needs to hydrate a real session from it and hand
 * the guest off to their booking. Uses a bare axios call (not the shared `api` instance) so the
 * token in the URL is what actually authenticates this request, not whatever session (if any)
 * already happens to be sitting in localStorage on this browser.
 */
export default function GuestLoginPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const token = searchParams.get('token')
  const bookingId = searchParams.get('bookingId')

  useEffect(() => {
    if (!token) {
      setError('This link is missing its sign-in token.')
      return
    }

    axios.get<{ email: string; role: Role }>(
      `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(({ data }) => {
        login({ token, email: data.email, role: data.role })
        navigate(bookingId ? `/booking/${bookingId}/status` : '/properties', { replace: true })
      })
      .catch(() => setError('This link has expired or is no longer valid.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, bookingId])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 14, padding: 20, textAlign: 'center' }}>
      {error ? (
        <>
          <p style={{ color: '#DC2626', fontSize: 15, maxWidth: 360 }}>{error}</p>
          {bookingId && (
            <Link to={`/booking/${bookingId}/status`} className="btn btn-secondary btn-md">
              View booking without signing in
            </Link>
          )}
          <Link to="/properties" style={{ fontSize: 13.5, color: '#6B7280' }}>Back to search</Link>
        </>
      ) : (
        <>
          <span className="spinner spinner-dark" />
          <p style={{ fontSize: 14, color: '#6B7280' }}>Signing you in…</p>
        </>
      )}
    </div>
  )
}
