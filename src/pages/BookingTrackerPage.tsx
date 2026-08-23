import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Home, Star, Clock, XCircle, CheckCircle2, DoorOpen, Sparkles, Upload, X, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import StatusPill from '../components/StatusPill'
import { formatMoney } from '../utils/currency'
import { formatCountdown, useCountdown } from '../hooks/useCountdown'
import { uploadImage } from '../utils/cloudinaryUpload'
import type { Booking, BookingStatus, GuestKycStatusInfo, IdDocumentType, StayCleaningOptions } from '../types'

const CANCELLABLE: BookingStatus[] = ['PENDING_PAYMENT', 'CONFIRMED']

export default function BookingTrackerPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const [payingAgain, setPayingAgain] = useState(false)
  const [payError, setPayError] = useState('')
  const [payReason, setPayReason] = useState('')

  // Mandatory guest ID verification — see BookingPage's identical widget/BookingService for why
  // submission (not admin approval) is what unlocks payment.
  const [guestKyc, setGuestKyc] = useState<GuestKycStatusInfo | null>(null)
  const [kycLegalName, setKycLegalName] = useState('')
  const [kycIdType, setKycIdType] = useState<IdDocumentType>('NATIONAL_ID')
  const [kycIdUrl, setKycIdUrl] = useState('')
  const [kycUploading, setKycUploading] = useState(false)
  const [kycSubmitting, setKycSubmitting] = useState(false)
  const [kycError, setKycError] = useState('')
  const kycFileInputRef = useRef<HTMLInputElement>(null)

  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const [cleaningOptions, setCleaningOptions] = useState<StayCleaningOptions | null>(null)
  const [showCleaningForm, setShowCleaningForm] = useState(false)
  const [cleaningDate, setCleaningDate] = useState('')
  const [cleaningWindow, setCleaningWindow] = useState('')
  const [requestingCleaning, setRequestingCleaning] = useState(false)
  const [cleaningError, setCleaningError] = useState('')

  const fetchBooking = () => {
    if (!bookingId) return
    api.get<Booking>(`/api/public/bookings/${bookingId}`)
      .then(({ data }) => setBooking(data))
      .catch(() => setError('This booking could not be found.'))
      .finally(() => setLoading(false))
  }

  const fetchCleaningOptions = () => {
    if (!bookingId) return
    api.get<StayCleaningOptions>(`/api/public/bookings/${bookingId}/stay-cleaning`)
      .then(({ data }) => setCleaningOptions(data))
      .catch(() => {})
  }

  useEffect(() => {
    fetchBooking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  // Only worth asking about once the stay is actually underway — matches the backend's own
  // CHECKED_IN gate, this just avoids a pointless request before/after that window.
  useEffect(() => {
    if (booking?.status === 'CHECKED_IN') fetchCleaningOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.status, bookingId])

  useEffect(() => {
    if (!bookingId) return
    const source = new EventSource(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/sse/bookings/${bookingId}`)
    source.addEventListener('booking-update', () => fetchBooking())
    source.onerror = () => source.close()
    return () => source.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return
    api.get<GuestKycStatusInfo>(`/api/public/bookings/${bookingId}/kyc-status`)
      .then(({ data }) => {
        setGuestKyc(data)
        if (data.legalName) setKycLegalName(data.legalName)
        if (data.idDocumentType) setKycIdType(data.idDocumentType)
        if (data.idDocumentUrl) setKycIdUrl(data.idDocumentUrl)
      })
      .catch(() => {})
  }, [bookingId])

  const kycSatisfied = guestKyc?.status === 'PENDING' || guestKyc?.status === 'VERIFIED'

  const handleKycFile = async (file: File | undefined) => {
    if (!file) return
    setKycError('')
    setKycUploading(true)
    try {
      const url = await uploadImage(file, 'kyc', '/api/public/uploads/signature')
      setKycIdUrl(url)
    } catch (err: any) {
      setKycError(err.message ?? 'Could not upload this photo.')
    } finally {
      setKycUploading(false)
      if (kycFileInputRef.current) kycFileInputRef.current.value = ''
    }
  }

  const handleSubmitKyc = async (e: FormEvent) => {
    e.preventDefault()
    if (!bookingId) return
    setKycSubmitting(true)
    setKycError('')
    try {
      const { data } = await api.post<GuestKycStatusInfo>(`/api/public/bookings/${bookingId}/kyc`, {
        legalName: kycLegalName, idDocumentType: kycIdType, idDocumentUrl: kycIdUrl,
      })
      setGuestKyc(data)
    } catch (err: any) {
      setKycError(err.response?.data?.error ?? 'Could not submit verification.')
    } finally {
      setKycSubmitting(false)
    }
  }

  const remainingMs = useCountdown(booking?.expiresAt ?? null, fetchBooking)

  const handlePayAgain = async () => {
    if (!bookingId) return
    setPayingAgain(true)
    setPayError('')
    setPayReason('')
    try {
      const { data } = await api.post<{ paymentLink: string }>('/api/payments/initiate', { bookingId })
      window.location.href = data.paymentLink
    } catch (err: any) {
      setPayError(err.response?.data?.error ?? 'Could not start payment — please try again.')
      setPayReason(err.response?.data?.reason ?? '')
      setPayingAgain(false)
    }
  }

  const handleAcceptTermsAndRetry = async () => {
    if (!bookingId) return
    await api.post(`/api/public/bookings/${bookingId}/accept-terms`)
    handlePayAgain()
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

  const handleRequestCleaning = async (e: FormEvent) => {
    e.preventDefault()
    if (!bookingId || !cleaningDate || !cleaningWindow) return
    setRequestingCleaning(true)
    setCleaningError('')
    try {
      const { data: request } = await api.post<{ id: string }>(`/api/public/bookings/${bookingId}/stay-cleaning`, {
        date: cleaningDate,
        timeWindow: cleaningWindow,
      })
      const { data: payment } = await api.post<{ paymentLink: string }>(
        '/api/payments/initiate-cleaning', { requestId: request.id }
      )
      window.location.href = payment.paymentLink
    } catch (err: any) {
      setCleaningError(err.response?.data?.error ?? 'Could not request cleaning — please try again.')
      setRequestingCleaning(false)
      fetchCleaningOptions()
    }
  }

  const handleCancelCleaning = async (requestId: string) => {
    if (!bookingId) return
    try {
      await api.post(`/api/public/bookings/${bookingId}/stay-cleaning/${requestId}/cancel`)
      fetchCleaningOptions()
    } catch {
      // best-effort — the request just stays visible as pending payment if this fails
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
              {payReason === 'GUEST_TERMS_REQUIRED' && (
                <button className="btn btn-secondary btn-md" style={{ marginBottom: 10 }} onClick={handleAcceptTermsAndRetry}>
                  Accept Terms & Conditions and retry
                </button>
              )}
              <button className="btn btn-primary btn-md" onClick={handlePayAgain} disabled={payingAgain || !kycSatisfied}>
                {payingAgain ? <span className="spinner" /> : 'Complete payment'}
              </button>
              {!kycSatisfied && (
                <p style={{ fontSize: 12, color: '#92400E', margin: '8px 0 0' }}>Verify your identity below to unlock payment.</p>
              )}
            </div>
          )}

          {booking.status === 'PENDING_PAYMENT' && !kycSatisfied && (
            <div className="surface-muted" style={{ padding: 16, marginTop: 16, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <ShieldCheck size={15} color="#095C46" />
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>Verify your identity (required)</p>
              </div>
              <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 12px' }}>
                Required to complete your booking — used for identity verification, safety, fraud
                prevention, dispute resolution, and legal compliance. See our Terms & Conditions.
              </p>

              {!guestKyc ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}><span className="spinner spinner-dark" /></div>
              ) : guestKyc.status === 'PENDING' ? (
                <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>Submitted — we'll review it shortly. You can continue to payment now.</p>
              ) : (
                <form onSubmit={handleSubmitKyc}>
                  <div className="form-group">
                    <label>Legal name</label>
                    <input
                      className="input" required
                      value={kycLegalName} onChange={e => setKycLegalName(e.target.value)}
                      placeholder="As it appears on your ID"
                    />
                  </div>
                  <div className="form-group">
                    <label>ID document type</label>
                    <select className="input" value={kycIdType} onChange={e => setKycIdType(e.target.value as IdDocumentType)}>
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVERS_LICENSE">Driver's License</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ID document photo</label>
                    <div
                      onClick={() => !kycUploading && kycFileInputRef.current?.click()}
                      className="surface-card"
                      style={{
                        height: 140, borderRadius: 12, cursor: kycUploading ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden', border: '1.5px dashed #D1D5DB',
                      }}
                    >
                      {kycIdUrl ? (
                        <>
                          <img src={kycIdUrl} alt="ID document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setKycIdUrl('') }}
                            style={{
                              position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%',
                              background: 'rgba(17,24,39,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            aria-label="Remove photo"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : kycUploading ? (
                        <span className="spinner spinner-dark" />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                          <Upload size={20} style={{ marginBottom: 4 }} />
                          <p style={{ fontSize: 12.5, margin: 0 }}>Click to upload a photo/scan of your ID</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={kycFileInputRef} type="file" accept="image/*" hidden
                      onChange={e => handleKycFile(e.target.files?.[0])}
                    />
                  </div>
                  {kycError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 10 }}>{kycError}</p>}
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={kycSubmitting || kycUploading || !kycIdUrl || !kycLegalName.trim()}>
                    {kycSubmitting ? <span className="spinner" /> : guestKyc.status === 'REJECTED' ? 'Resubmit' : 'Submit for review'}
                  </button>
                </form>
              )}
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

        {booking.status === 'CHECKED_IN' && cleaningOptions && (
          <div className="surface-card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Sparkles size={16} color="#111827" />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Cleaning</h2>
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px' }}>Need your apartment cleaned during your stay?</p>

            {cleaningOptions.requests.filter(r => r.status !== 'CANCELLED').map(r => (
              <div key={r.id} className="surface-muted" style={{ padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>
                    {new Date(r.requestedDate + 'T00:00:00').toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} · {r.timeWindow}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                    {formatMoney(r.price, r.currency)} · {r.status === 'PAID' ? 'Confirmed' : 'Awaiting payment'}
                  </p>
                </div>
                {r.status === 'PENDING_PAYMENT' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancelCleaning(r.id)}>Cancel</button>
                )}
              </div>
            ))}

            {!cleaningOptions.available && cleaningOptions.requests.length === 0 && (
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Stay cleaning isn't available for this property.</p>
            )}

            {cleaningOptions.available && !showCleaningForm && (
              <button className="btn btn-secondary btn-md" onClick={() => setShowCleaningForm(true)}>Request cleaning</button>
            )}

            {cleaningOptions.available && showCleaningForm && (
              <form onSubmit={handleRequestCleaning}>
                <div className="form-row-2" style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                  <div className="form-group">
                    <label>Cleaning date</label>
                    <input
                      type="date" className="input" required
                      min={cleaningOptions.minDate} max={cleaningOptions.maxDate}
                      value={cleaningDate} onChange={e => setCleaningDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time window</label>
                    <select className="input" required value={cleaningWindow} onChange={e => setCleaningWindow(e.target.value)}>
                      <option value="">— Select —</option>
                      {cleaningOptions.windows.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>
                  Professional cleaning during your stay: <strong>{formatMoney(cleaningOptions.price ?? 0, cleaningOptions.currency)}</strong>
                </p>
                {cleaningError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 10 }}>{cleaningError}</p>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary btn-md" onClick={() => setShowCleaningForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-md" disabled={requestingCleaning}>
                    {requestingCleaning ? <span className="spinner" /> : 'Request & pay'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
