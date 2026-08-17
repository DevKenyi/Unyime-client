import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Home, Star, Clock, XCircle, CheckCircle2, DoorOpen } from 'lucide-react'
import api from '../api/axios'
import StatusPill from '../components/StatusPill'
import { formatMoney } from '../utils/currency'
import type { Booking, BookingStatus } from '../types'

const CANCELLABLE: BookingStatus[] = ['PENDING_PAYMENT', 'CONFIRMED']

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Ticks every second purely for display — the countdown's source of truth is always the
 * server's expiresAt, never a locally-invented timer, and once it hits zero we re-fetch the
 * booking from the backend rather than assume it expired (the scheduled job is the real authority). */
function useCountdown(expiresAt: string | null, onExpire: () => void) {
  const [now, setNow] = useState(() => Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) return
    firedRef.current = false
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const remainingMs = expiresAt ? new Date(expiresAt).getTime() - now : 0

  useEffect(() => {
    if (expiresAt && remainingMs <= 0 && !firedRef.current) {
      firedRef.current = true
      onExpire()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, expiresAt])

  return remainingMs
}

export default function BookingTrackerPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const [payingAgain, setPayingAgain] = useState(false)
  const [payError, setPayError] = useState('')

  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const fetchBooking = () => {
    if (!bookingId) return
    api.get<Booking>(`/api/public/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data))
      .catch(() => setError('This booking could not be found.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return
    const source = new EventSource(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/sse/bookings/${bookingId}`)
    source.addEventListener('booking-update', () => fetchBooking())
    source.onerror = () => source.close()
    return () => source.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const remainingMs = useCountdown(booking?.expiresAt ?? null, fetchBooking)

  const handlePayAgain = async () => {
    if (!bookingId) return
    setPayingAgain(true)
    setPayError('')
    try {
      const { data } = await api.post<{ paymentLink: string }>('/api/payments/initiate', { bookingId })
      window.location.href = data.paymentLink
    } catch (err: any) {
      setPayError(err.response?.data?.error ?? 'Could not start payment — please try again.')
      setPayingAgain(false)
    }
  }

  const handleConfirmCheckout = async () => {
    if (!bookingId) return
    setCheckingOut(true)
    setCheckoutError('')
    try {
      const { data } = await api.post<Booking>(`/api/public/bookings/${bookingId}/checkout`)
      setBooking(data)
    } catch (err: any) {
      setCheckoutError(err.response?.data?.error ?? 'Could not confirm checkout.')
    } finally {
      setCheckingOut(false)
    }
  }

  const handleCancel = async () => {
    if (!bookingId || !confirm('Cancel this booking?')) return
    setCancelling(true)
    setCancelError('')
    try {
      const { data } = await api.post<Booking>(`/api/public/bookings/${bookingId}/cancel`)
      setBooking(data)
    } catch (err: any) {
      setCancelError(err.response?.data?.error ?? 'Could not cancel this booking.')
    } finally {
      setCancelling(false)
    }
  }

  const handleReview = async (e: FormEvent) => {
    e.preventDefault()
    if (!bookingId) return
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await api.post(`/api/public/bookings/${bookingId}/review`, { rating, comment })
      setReviewSubmitted(true)
    } catch (err: any) {
      setReviewError(err.response?.data?.error ?? 'Could not submit your review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE' }}>
        <span className="spinner spinner-dark" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 12 }}>
        <p style={{ color: '#DC2626', fontSize: 15 }}>{error || 'Booking not found'}</p>
        <Link to="/properties" className="btn btn-secondary btn-md">Back to search</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Browse more stays
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 60px' }}>
        <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, margin: '0 0 4px' }}>
                Booking reference
              </p>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>{booking.paymentReference}</h1>
            </div>
            <StatusPill status={booking.status} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
            <Home size={16} /> {booking.propertyTitle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#6B7280', marginBottom: 6 }}>
            <Calendar size={14} />
            {new Date(booking.checkInDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' → '}
            {new Date(booking.checkOutDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' · '}{booking.nights} night{booking.nights === 1 ? '' : 's'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#6B7280' }}>
            <Users size={14} /> {booking.guestCount} guest{booking.guestCount === 1 ? '' : 's'}
          </div>

          <div className="surface-muted" style={{ padding: 16, marginTop: 16 }}>
            <Row label={`${formatMoney(booking.pricePerNightSnapshot, booking.currency)} × ${booking.nights} night${booking.nights === 1 ? '' : 's'}`} value={booking.pricePerNightSnapshot * booking.nights} currency={booking.currency} />
            {booking.cleaningFee > 0 && <Row label="Cleaning fee" value={booking.cleaningFee} currency={booking.currency} />}
            <Row label="Service charge" value={booking.serviceCharge} currency={booking.currency} />
            <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8 }}>
              <Row label="Total" value={booking.total} currency={booking.currency} bold />
            </div>
          </div>

          {booking.status === 'PENDING_PAYMENT' && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={16} color="#92400E" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#92400E' }}>
                  Your reservation is held for {formatCountdown(remainingMs)}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#92400E', margin: '0 0 12px' }}>
                Complete payment before the timer runs out to secure your stay — after that, these dates go back on the market.
              </p>
              {payError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 10 }}>{payError}</p>}
              <button className="btn btn-primary btn-md" onClick={handlePayAgain} disabled={payingAgain}>
                {payingAgain ? <span className="spinner" /> : 'Complete payment'}
              </button>
            </div>
          )}

          {booking.status === 'EXPIRED' && (
            <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <XCircle size={16} color="#6B7280" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#374151' }}>Reservation expired</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 12px' }}>
                The payment window closed before payment was completed. These dates have been released and may no longer be available — you'll need to make a new booking.
              </p>
              <Link to="/properties" className="btn btn-secondary btn-md">Search for available dates</Link>
            </div>
          )}

          {booking.status === 'CHECKED_IN' && (
            <div style={{ background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: 10, padding: '14px', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <DoorOpen size={16} color="#5B21B6" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#5B21B6' }}>Ready to leave?</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#5B21B6', margin: '0 0 12px' }}>
                Please confirm when you've left the property so the host can prepare it for the next guest.
              </p>
              {checkoutError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 10 }}>{checkoutError}</p>}
              <button className="btn btn-primary btn-md" onClick={handleConfirmCheckout} disabled={checkingOut}>
                {checkingOut ? <span className="spinner" /> : "I've checked out"}
              </button>
            </div>
          )}

          {booking.status === 'CHECKED_OUT' && (
            <div style={{ background: '#E8F5F1', border: '1px solid #6EE7B7', borderRadius: 10, padding: '14px', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircle2 size={16} color="#065F46" />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#065F46' }}>You're checked out</span>
              </div>
              <p style={{ fontSize: 12.5, color: '#065F46', margin: 0 }}>Thanks for staying with Unyimi.</p>
            </div>
          )}

          {booking.refundStatus === 'PENDING' && (
            <p style={{ fontSize: 13, color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginTop: 16 }}>
              A refund is pending for this booking.
            </p>
          )}

          {CANCELLABLE.includes(booking.status) && (
            <div style={{ marginTop: 16 }}>
              {cancelError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{cancelError}</p>}
              <button className="btn btn-danger btn-md" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner" /> : 'Cancel booking'}
              </button>
            </div>
          )}
        </div>

        {(booking.status === 'CHECKED_OUT' || booking.status === 'COMPLETED') && !reviewSubmitted && (
          <form onSubmit={handleReview} className="surface-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Leave a review</h2>
            <div className="form-group">
              <label>Rating</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n} type="button" onClick={() => setRating(n)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <Star size={24} color="#F59E0B" fill={n <= rating ? '#F59E0B' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                className="input" rows={3} placeholder="How was your stay?"
                value={comment} onChange={e => setComment(e.target.value)}
              />
            </div>
            {reviewError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{reviewError}</p>}
            <button type="submit" className="btn btn-primary btn-md" disabled={reviewSubmitting}>
              {reviewSubmitting ? <span className="spinner" /> : 'Submit review'}
            </button>
          </form>
        )}

        {reviewSubmitted && (
          <div className="surface-card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#111827', fontWeight: 600, margin: 0 }}>Thanks for your review!</p>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value, currency, bold }: { label: string; value: number; currency: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13.5, fontWeight: bold ? 800 : 400, color: bold ? '#111827' : '#374151', marginBottom: 6 }}>
      <span>{label}</span>
      <span>{formatMoney(value, currency)}</span>
    </div>
  )
}
