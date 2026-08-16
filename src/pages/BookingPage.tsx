import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, User, Phone } from 'lucide-react'
import api from '../api/axios'
import type { CreateBookingResult, Property } from '../types'

const SERVICE_CHARGE_RATE = 0.10

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>()

  const [property, setProperty] = useState<Property | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoadingProperty(true)
    api.get<Property>(`/api/public/properties/${slug}`)
      .then(({ data }) => setProperty(data))
      .catch(() => setLoadError('This property could not be found.'))
      .finally(() => setLoadingProperty(false))
  }, [slug])

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0
    const diff = (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86_400_000
    return diff > 0 ? Math.round(diff) : 0
  }, [checkInDate, checkOutDate])

  const pricing = useMemo(() => {
    if (!property || nights === 0) return null
    const nightlySubtotal = property.pricePerNight * nights
    const cleaningFee = property.cleaningFee ?? 0
    const subtotal = nightlySubtotal + cleaningFee
    const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE * 100) / 100
    const total = subtotal + serviceCharge
    return { nightlySubtotal, cleaningFee, subtotal, serviceCharge, total }
  }, [property, nights])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!slug) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const { data: booking } = await api.post<CreateBookingResult>('/api/public/bookings', {
        propertySlug: slug,
        guestName,
        guestPhone,
        checkInDate,
        checkOutDate,
        guestCount,
      })

      const { data: payment } = await api.post<{ paymentLink: string; reference: string }>(
        '/api/payments/initiate',
        { bookingId: booking.bookingId }
      )

      window.location.href = payment.paymentLink
    } catch (err: any) {
      setSubmitError(err.response?.data?.error ?? 'Something went wrong — please try again.')
      setSubmitting(false)
    }
  }

  if (loadingProperty) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE' }}>
        <span className="spinner spinner-dark" />
      </div>
    )
  }

  if (loadError || !property) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 12 }}>
        <p style={{ color: '#DC2626', fontSize: 15 }}>{loadError || 'Property not found'}</p>
        <Link to="/properties" className="btn btn-secondary btn-md">Back to search</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 20px' }}>
          <Link to={`/properties/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to {property.title}
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
          Book your stay
        </h1>

        <form onSubmit={handleSubmit} className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
          <div className="form-row-2" style={{ display: 'grid', gap: 16, marginBottom: 4 }}>
            <div className="form-group">
              <label><Calendar size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Check-in</label>
              <input
                type="date" className="input" required min={todayISO()}
                value={checkInDate} onChange={e => setCheckInDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label><Calendar size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Check-out</label>
              <input
                type="date" className="input" required min={checkInDate || todayISO()}
                value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label><Users size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Guests</label>
            <input
              type="number" className="input" required min={1} max={property.maxGuests}
              value={guestCount} onChange={e => setGuestCount(Number(e.target.value))}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>This property sleeps up to {property.maxGuests} guests.</p>
          </div>

          <div className="form-group">
            <label><User size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Full name</label>
            <input
              type="text" className="input" required placeholder="Your full name"
              value={guestName} onChange={e => setGuestName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><Phone size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Phone number</label>
            <input
              type="tel" className="input" required placeholder="e.g. +234 801 234 5678"
              value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
            />
          </div>

          {pricing && (
            <div className="surface-muted" style={{ padding: 16, marginTop: 8, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 10px', fontWeight: 600 }}>
                Price breakdown · {nights} night{nights === 1 ? '' : 's'}
              </p>
              <Row label={`₦${property.pricePerNight.toLocaleString()} × ${nights} night${nights === 1 ? '' : 's'}`} value={pricing.nightlySubtotal} />
              {pricing.cleaningFee > 0 && <Row label="Cleaning fee" value={pricing.cleaningFee} />}
              <Row label="Service charge" value={pricing.serviceCharge} />
              <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8 }}>
                <Row label="Total" value={pricing.total} bold />
              </div>
            </div>
          )}

          {submitError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
              {submitError}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting || nights === 0}>
            {submitting ? <><span className="spinner" /> Redirecting to payment…</> : 'Continue to payment'}
          </button>
        </form>
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
