import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { DateRange } from 'react-day-picker'
import { ArrowLeft, Users, User, Phone, Star, MapPin, Check, Clock } from 'lucide-react'
import api from '../api/axios'
import { formatMoney } from '../utils/currency'
import { formatCountdown, useCountdown } from '../hooks/useCountdown'
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

type Step = 'dates' | 'guests' | 'review' | 'payment'
const STEPS: { key: Step; label: string }[] = [
  { key: 'dates', label: 'Dates' },
  { key: 'guests', label: 'Guests' },
  { key: 'review', label: 'Review' },
  { key: 'payment', label: 'Payment' },
]

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

  const [step, setStep] = useState<Step>('dates')

  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [calendarMessage, setCalendarMessage] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')

  // Set once the booking (and its 2-hour hold) actually exists on the backend — from that point
  // dates/guests are locked in and the countdown below is authoritative, not a locally-made-up one.
  const [createdBooking, setCreatedBooking] = useState<{ bookingId: string; expiresAt: string } | null>(null)

  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState('')
  const [payingAgain, setPayingAgain] = useState(false)
  const [payError, setPayError] = useState('')

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

  const remainingMs = useCountdown(createdBooking?.expiresAt ?? null, () => {})

  const goToDates = () => {
    if (nights === 0) return
    setStep('guests')
  }

  const goToReview = (e?: FormEvent) => {
    e?.preventDefault()
    if (guestsOverCapacity || !guestName.trim() || !guestPhone.trim()) return
    setStep('review')
  }

  // Creates the booking (starting its 2-hour hold) and immediately tries to hand off to payment.
  // Split from the payment-link step so a Flutterwave hiccup after the hold exists can retry
  // without ever creating a second booking for the same dates.
  const handleReserve = async () => {
    if (!slug || !checkInDate || !checkOutDate) return
    setReserveError('')
    setReserving(true)
    try {
      const { data: booking } = await api.post<CreateBookingResult>('/api/public/bookings', {
        propertySlug: slug,
        guestName,
        guestPhone,
        checkInDate,
        checkOutDate,
        guestCount,
      })
      setCreatedBooking({ bookingId: booking.bookingId, expiresAt: '' })
      setStep('payment')
      await initiatePayment(booking.bookingId)
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Someone else grabbed (part of) this range between when we loaded availability and now
        // — refresh the real availability and send the guest back to picking dates instead of
        // just surfacing a raw "already booked" error.
        setRange(undefined)
        setStep('dates')
        setReserveError('Those dates were just taken by another guest. Availability has been refreshed — please pick new dates.')
        await fetchAvailability()
      } else {
        setReserveError(err.response?.data?.error ?? 'Something went wrong — please try again.')
      }
    } finally {
      setReserving(false)
    }
  }

  const initiatePayment = async (bookingId: string) => {
    setPayingAgain(true)
    setPayError('')
    try {
      const { data: payment } = await api.post<{ paymentLink: string; reference: string }>(
        '/api/payments/initiate',
        { bookingId }
      )
      window.location.href = payment.paymentLink
    } catch (err: any) {
      setPayError(err.response?.data?.error ?? 'Could not start payment — please try again.')
      setPayingAgain(false)
      // Fetch the real expiry now that we know the hold exists but the redirect failed, so the
      // countdown shown while the guest retries is accurate rather than blank.
      if (bookingId) {
        api.get(`/api/public/bookings/${bookingId}`)
          .then(({ data }) => setCreatedBooking({ bookingId, expiresAt: data.expiresAt }))
          .catch(() => {})
      }
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

  const stepIndex = STEPS.findIndex(s => s.key === step)
  const datesLocked = step === 'payment'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
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

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: i <= stepIndex ? '#095C46' : '#E5E7EB',
                  color: i <= stepIndex ? '#fff' : '#9CA3AF',
                  flexShrink: 0,
                }}>
                  {i < stepIndex ? <Check size={13} /> : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: i <= stepIndex ? '#111827' : '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#095C46' : '#E5E7EB', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>

        <div className="booking-layout" style={{ display: 'grid', gap: 24, alignItems: 'start' }}>
          {/* Left: step content */}
          <div className="surface-card" style={{ padding: '28px 24px' }}>
            {step === 'dates' && (
              <>
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
                <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} disabled={nights === 0} onClick={goToDates}>
                  Continue →
                </button>
              </>
            )}

            {step === 'guests' && (
              <form onSubmit={goToReview}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Who's coming?</h2>
                <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>Tell us a bit about your group and how to reach you.</p>

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

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep('dates')}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={guestsOverCapacity || !guestName.trim() || !guestPhone.trim()}>
                    Continue to review →
                  </button>
                </div>
              </form>
            )}

            {step === 'review' && pricing && (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Review your stay</h2>
                <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
                  We'll verify these dates are still available and hold them for 2 hours while you pay.
                </p>

                <div className="surface-muted" style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 3px' }}>Check-in</p>
                      <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: 0 }}>{range?.from && formatNice(range.from)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 3px' }}>Check-out</p>
                      <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: 0 }}>{range?.to && formatNice(range.to)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#095C46', fontWeight: 600, margin: 0 }}>{nights} night{nights === 1 ? '' : 's'} · {guestCount} guest{guestCount === 1 ? '' : 's'}</p>
                </div>

                <div style={{ fontSize: 13.5, color: '#374151', marginBottom: 16 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, color: '#111827' }}>{guestName}</p>
                  <p style={{ margin: 0, color: '#6B7280' }}>{guestPhone}</p>
                </div>

                <div className="surface-muted" style={{ padding: 16, marginBottom: 8 }}>
                  <Row label={`${formatMoney(property.pricePerNight, property.currency)} × ${nights} night${nights === 1 ? '' : 's'}`} value={pricing.nightlySubtotal} currency={property.currency} />
                  {pricing.cleaningFee > 0 && <Row label="Cleaning fee" value={pricing.cleaningFee} currency={property.currency} />}
                  <Row label="Service fee" value={pricing.serviceCharge} currency={property.currency} />
                  <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8 }}>
                    <Row label="Total" value={pricing.total} currency={property.currency} bold />
                  </div>
                </div>

                {reserveError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: 13, marginTop: 12 }}>
                    {reserveError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep('guests')} disabled={reserving}>← Back</button>
                  <button type="button" className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleReserve} disabled={reserving}>
                    {reserving ? <><span className="spinner" /> Reserving…</> : 'Reserve & continue to payment →'}
                  </button>
                </div>
              </>
            )}

            {step === 'payment' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {!payError ? (
                  <>
                    <span className="spinner spinner-dark" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Taking you to secure payment…</h2>
                    <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>Your dates are held — don't close this tab.</p>
                  </>
                ) : (
                  <>
                    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: 16, textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Clock size={16} color="#92400E" />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#92400E' }}>
                          {createdBooking?.expiresAt ? `Your reservation is held for ${formatCountdown(remainingMs)}` : 'Your reservation is held'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#92400E', margin: '0 0 12px' }}>{payError}</p>
                      <button
                        className="btn btn-primary btn-md"
                        onClick={() => createdBooking && initiatePayment(createdBooking.bookingId)}
                        disabled={payingAgain}
                      >
                        {payingAgain ? <span className="spinner" /> : 'Try payment again'}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
              <p style={{ fontSize: 12.5, color: '#095C46', fontWeight: 600, margin: '0 0 4px' }}>{nights} night{nights === 1 ? '' : 's'}</p>
            )}
            {!datesLocked && range?.from && step !== 'dates' && (
              <button type="button" onClick={() => setStep('dates')} style={{ background: 'none', border: 'none', padding: 0, color: '#095C46', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>
                Change dates
              </button>
            )}

            {step !== 'dates' && step !== 'guests' && (
              <p style={{ fontSize: 13, color: '#374151', margin: '0 0 16px' }}>{guestCount} guest{guestCount === 1 ? '' : 's'}</p>
            )}

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
          </div>
        </div>
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
