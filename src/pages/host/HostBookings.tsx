import { useEffect, useState } from 'react'
import { Calendar, Users, Star, MessageSquare } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import StatusPill from '../../components/StatusPill'
import type { Booking, BookingStatus, Property, Review } from '../../types'

const NEXT_STATUS: Partial<Record<BookingStatus, { label: string; status: BookingStatus }[]>> = {
  CONFIRMED:  [{ label: 'Check in', status: 'CHECKED_IN' }, { label: 'Cancel', status: 'CANCELLED' }],
  CHECKED_IN: [{ label: 'Complete', status: 'COMPLETED' }],
  PENDING_PAYMENT: [{ label: 'Cancel', status: 'CANCELLED' }],
}

export default function HostBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<Booking[]>('/api/host/bookings')
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    setBusyId(bookingId)
    try {
      const { data } = await api.patch<Booking>(`/api/host/bookings/${bookingId}/status`, { status })
      setBookings(prev => prev.map(b => b.id === bookingId ? data : b))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Manage stays across all your properties.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && bookings.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No bookings yet.</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(b => (
              <div key={b.id} className="surface-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{b.propertyTitle}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
                      <span>{b.guestName} · {b.guestPhone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {b.checkInDate} → {b.checkOutDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={13} /> {b.guestCount}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#095C46' }}>₦{b.total.toLocaleString()}</span>
                    <StatusPill status={b.status} />
                  </div>
                </div>

                {(NEXT_STATUS[b.status]?.length ?? 0) > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {NEXT_STATUS[b.status]!.map(action => (
                      <button
                        key={action.status}
                        className={action.status === 'CANCELLED' ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'}
                        disabled={busyId === b.id}
                        onClick={() => updateStatus(b.id, action.status)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ReviewsSection />
      </div>
    </DashboardLayout>
  )
}

function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    api.get<Property[]>('/api/host/properties')
      .then(async ({ data: properties }) => {
        const results = await Promise.all(
          properties.map(p => api.get<Review[]>(`/api/public/properties/${p.slug}/reviews`).then(r => r.data))
        )
        setReviews(results.flat())
      })
      .finally(() => setLoading(false))
  }, [])

  const respond = async (reviewId: string) => {
    const response = drafts[reviewId]?.trim()
    if (!response) return
    setSubmittingId(reviewId)
    try {
      await api.post(`/api/host/reviews/${reviewId}/response`, { response })
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, hostResponse: response } : r))
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) return null
  if (reviews.length === 0) return null

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <MessageSquare size={17} /> Guest reviews
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map(review => (
          <div key={review.id} className="surface-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ fontSize: 14 }}>{review.guestName}</strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{review.rating}</span>
              </div>
            </div>
            {review.comment && <p style={{ fontSize: 13.5, color: '#374151', margin: '0 0 10px' }}>{review.comment}</p>}

            {review.hostResponse ? (
              <div className="surface-muted" style={{ padding: 10, fontSize: 13 }}>
                <strong style={{ display: 'block', marginBottom: 3, color: '#095C46' }}>Your response</strong>
                <span style={{ color: '#374151' }}>{review.hostResponse}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input" placeholder="Write a response…"
                  value={drafts[review.id] ?? ''}
                  onChange={e => setDrafts(prev => ({ ...prev, [review.id]: e.target.value }))}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-secondary btn-sm" disabled={submittingId === review.id} onClick={() => respond(review.id)}>
                  Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
