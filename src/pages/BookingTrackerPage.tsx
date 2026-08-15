import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Home, Star } from 'lucide-react'
import api from '../api/axios'
import StatusPill from '../components/StatusPill'
import type { Booking, BookingStatus } from '../types'

const CANCELLABLE: BookingStatus[] = ['PENDING_PAYMENT', 'CONFIRMED']

export default function BookingTrackerPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

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
            <Row label={`₦${booking.pricePerNightSnapshot.toLocaleString()} × ${booking.nights} night${booking.nights === 1 ? '' : 's'}`} value={booking.pricePerNightSnapshot * booking.nights} />
            {booking.cleaningFee > 0 && <Row label="Cleaning fee" value={booking.cleaningFee} />}
            <Row label="Service charge" value={booking.serviceCharge} />
            <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8 }}>
              <Row label="Total" value={booking.total} bold />
            </div>
          </div>

          {booking.status === 'PENDING_PAYMENT' && (
            <p style={{ fontSize: 13, color: '#92400E', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginTop: 16 }}>
              Waiting for payment confirmation. This page updates automatically once your payment clears.
            </p>
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

        {booking.status === 'COMPLETED' && !reviewSubmitted && (
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

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13.5, fontWeight: bold ? 800 : 400, color: bold ? '#111827' : '#374151', marginBottom: 6 }}>
      <span>{label}</span>
      <span>₦{value.toLocaleString()}</span>
    </div>
  )
}
