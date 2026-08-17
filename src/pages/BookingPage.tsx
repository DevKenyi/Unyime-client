import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { ArrowLeft, Users, User, Phone, Star, MapPin } from 'lucide-react'
import api from '../api/axios'
import { formatMoney } from '../utils/currency'
import DateRangeCalendar from '../components/DateRangeCalendar'
import PlaceholderImage from '../components/landing/PlaceholderImage'
import {
  getLatestValidCheckout,
  isRangeAvailable,
  parseUnavailableRanges,
  type UnavailableRange,
} from '../utils/availability'
import type { CreateBookingResult, Property, PropertyAvailability } from '../types'

const SERVICE_CHARGE_RATE = 0.10

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatNice(d: Date): string {
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>()

  const [property, setProperty] = useState<Property | null>(null)
  const [loadingProperty, setLoadingProperty] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [unavailableRanges, setUnavailableRanges] = useState<UnavailableRange[]>([])

  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [calendarMessage, setCalendarMessage] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fetchAvailability = useCallback(() => {
    if (!slug) return Promise.resolve()
    return api.get<PropertyAvailability>(`/api/public/properties/${slug}/availability`)
      .then(res => setUnavailableRanges(parseUnavailableRanges(res.data.unavailableDates)))
  }, [slug])

  useEffect(() => {
    if (!slug) return
    setLoadingProperty(true)
    Promise.all([
      api.get<Property>(`/api/public/properties/${slug}`),
      fetchAvailability(),
    ])
      .then(([propRes]) => setProperty(propRes.data))
      .catch(() => setLoadError('This property could not be found.'))
      .finally(() => setLoadingProperty(false))
  }, [slug, fetchAvailability])

  // Guards every selection against the same overlap rule the backend enforces, in case a stale
  // `disabled` matcher (e.g. another guest just grabbed the dates) ever lets an invalid click
  // through — the calendar's `disabled` prop is the primary defense, this is the fallback.
  const handleRangeSelect = (next: DateRange | undefined) => {
    setCalendarMessage('')
    if (next?.from && next?.to && !isRangeAvailable(next.from, next.to, unavailableRanges)) {
      setCalendarMessage("This date isn't available for this stay.")
      return
    }
    setRange(next)
  }

  const checkInDate = range?.from ? toISODate(range.from) : ''
  const checkOutDate = range?.to ? toISODate(range.to) : ''

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0
    const diff = (range.to.getTime() - range.from.getTime()) / 86_400_000
    return diff > 0 ? Math.round(diff) : 0
  }, [range])

  const pricing = useMemo(() => {
    if (!property || nights === 0) return null
    const nightlySubtotal = property.pricePerNight * nights
    const cleaningFee = property.cleaningFee ?? 0
    const subtotal = nightlySubtotal + cleaningFee
    const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE * 100) / 100
    const total = subtotal + serviceCharge
    return { nightlySubtotal, cleaningFee, subtotal, serviceCharge, total }
  }, [property, nights])

  const guestsOverCapacity = !!property && guestCount > property.maxGuests

  // Once check-in is picked but not checkout yet, tell the guest how far this stay can run —
  // the calendar's `disabled` prop already enforces this, this is just the friendly explanation.
  const checkoutBoundary = useMemo(() => {
    if (!range?.from || range?.to) return null
    return getLatestValidCheckout(range.from, unavailableRanges)
  }, [range, unavailableRanges])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!slug || !checkInDate || !checkOutDate) return
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
      if (err.response?.status === 409) {
        // Someone else grabbed (part of) this range between when we loaded availability and now
        // — refresh the real availability and send the guest back to picking dates instead of
        // just surfacing a raw "already booked" error.
        setRange(undefined)
        setSubmitError('Those dates were just taken by another guest. Availability has been refreshed — please pick new dates.')
        await fetchAvailability()
      } else {
        setSubmitError(err.response?.data?.error ?? 'Something went wrong — please try again.')
      }
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
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 20px' }}>
          <Link to={`/properties/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to property
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 20px 60px' }}>
        {/* Property context strip — subtle, keeps focus on the calendar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
            <PlaceholderImage variant="apartment-living" src={property.coverImageUrl ?? undefined} alt={property.title} style={{ height: '100%' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 3px' }}>{property.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#6B7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {property.city}</span>
              {property.averageRating != null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" /> {property.averageRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-layout" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
          {/* Calendar */}
          <div className="surface-card" style={{ padding: '28px 24px' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>When are you staying?</h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
              {range?.from && !range?.to
                ? checkoutBoundary
                  ? `Choose your checkout date — this stay is available through ${formatNice(checkoutBoundary)}.`
                  : 'Choose your checkout date.'
                : 'Choose your check-in and checkout dates.'}
            </p>
            <DateRangeCalendar selected={range} onSelect={handleRangeSelect} unavailableRanges={unavailableRanges} />
            {calendarMessage && (
              <p style={{ fontSize: 12.5, color: '#9A6B00', marginTop: 12 }}>{calendarMessage}</p>
            )}
          </div>

          {/* Sticky summary */}
          <div className="surface-card booking-summary" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Your stay</h2>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 3px' }}>Check-in</p>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: range?.from ? '#111827' : '#D1D5DB', margin: 0 }}>
                  {range?.from ? formatNice(range.from) : 'Select date'}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 3px' }}>Check-out</p>
                <p style={{ fontSize: 14.5, fontWeight: 700, color: range?.to ? '#111827' : '#D1D5DB', margin: 0 }}>
                  {range?.to ? formatNice(range.to) : 'Select date'}
                </p>
              </div>
            </div>
            {nights > 0 && (
              <p style={{ fontSize: 12.5, color: '#095C46', fontWeight: 600, margin: '0 0 16px' }}>{nights} night{nights === 1 ? '' : 's'}</p>
            )}

            <div className="form-group">
              <label><Users size={13} style={{ marginRight: 4, verticalAlign: -2 }} />Guests</label>
              <input
                type="number" className="input" required min={1} max={property.maxGuests}
                value={guestCount} onChange={e => setGuestCount(Number(e.target.value))}
              />
              {guestsOverCapacity ? (
                <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>This property sleeps a maximum of {property.maxGuests} guests.</p>
              ) : (
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Up to {property.maxGuests} guests.</p>
              )}
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
                <Row label={`${formatMoney(property.pricePerNight, property.currency)} × ${nights} night${nights === 1 ? '' : 's'}`} value={pricing.nightlySubtotal} currency={property.currency} />
                {pricing.cleaningFee > 0 && <Row label="Cleaning fee" value={pricing.cleaningFee} currency={property.currency} />}
                <Row label="Service fee" value={pricing.serviceCharge} currency={property.currency} />
                <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8 }}>
                  <Row label="Total" value={pricing.total} currency={property.currency} bold />
                </div>
              </div>
            )}

            {submitError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
                {submitError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting || nights === 0 || guestsOverCapacity}>
              {submitting ? <><span className="spinner" /> Redirecting to payment…</> : 'Continue to payment →'}
            </button>
          </div>
        </form>
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
