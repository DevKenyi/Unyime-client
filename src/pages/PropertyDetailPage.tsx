import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Users, BedDouble, Bath, Star,
  ShieldCheck, CalendarX2, MessageSquare,
} from 'lucide-react'
import api from '../api/axios'
import { formatMoney } from '../utils/currency'
import type { Property, PropertyAvailability, Review } from '../types'

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500"%3E%3Crect width="800" height="500" fill="%23E8F5F1"/%3E%3C/svg%3E'

function formatDateRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${new Date(start).toLocaleDateString('en-NG', opts)} – ${new Date(end).toLocaleDateString('en-NG', opts)}`
}

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [property, setProperty] = useState<Property | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [availability, setAvailability] = useState<PropertyAvailability | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    Promise.all([
      api.get<Property>(`/api/public/properties/${slug}`),
      api.get<Review[]>(`/api/public/properties/${slug}/reviews`),
      api.get<PropertyAvailability>(`/api/public/properties/${slug}/availability`),
    ])
      .then(([propertyRes, reviewsRes, availabilityRes]) => {
        setProperty(propertyRes.data)
        setReviews(reviewsRes.data)
        setAvailability(availabilityRes.data)
      })
      .catch(() => setError('This property could not be found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE' }}>
        <span className="spinner spinner-dark" />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 12 }}>
        <p style={{ color: '#DC2626', fontSize: 15 }}>{error || 'Property not found'}</p>
        <Link to="/properties" className="btn btn-secondary btn-md">Back to search</Link>
      </div>
    )
  }

  const photos = property.photos?.length
    ? property.photos
    : [{ id: 'cover', imageUrl: property.coverImageUrl || FALLBACK_IMAGE, caption: null, sortOrder: 0 }]

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to search
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 60px' }}>
        {/* Photo gallery */}
        <div
          className={`photo-gallery-grid${photos.length > 1 ? ' has-secondary' : ''}`}
          style={{ display: 'grid', gap: 8, borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}
        >
          <div style={{ background: `url(${photos[0].imageUrl}) center/cover no-repeat` }} />
          {photos.length > 1 && (
            <div className="photo-gallery-secondary" style={{ gridTemplateRows: 'repeat(2, 1fr)', gap: 8 }}>
              {photos.slice(1, 3).map(photo => (
                <div key={photo.id} style={{ background: `url(${photo.imageUrl}) center/cover no-repeat` }} />
              ))}
            </div>
          )}
        </div>

        <div className="detail-layout" style={{ display: 'grid', gap: 32 }}>
          {/* Left: details */}
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
              {property.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280', fontSize: 14 }}>
                <MapPin size={15} /> {property.address ? `${property.address}, ` : ''}{property.city}
              </div>
              {property.averageRating != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                  <Star size={15} color="#F59E0B" fill="#F59E0B" />
                  <strong>{property.averageRating.toFixed(1)}</strong>
                  <span style={{ color: '#6B7280' }}>({property.reviewCount} review{property.reviewCount === 1 ? '' : 's'})</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#095C46', fontSize: 13, fontWeight: 600 }}>
                <ShieldCheck size={15} /> Verified host
              </div>
            </div>

            <div className="surface-card" style={{ padding: '16px 18px', display: 'flex', gap: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#374151' }}>
                <Users size={16} /> {property.maxGuests} guests
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#374151' }}>
                <BedDouble size={16} /> {property.bedrooms} bedroom{property.bedrooms === 1 ? '' : 's'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#374151' }}>
                <Bath size={16} /> {property.bathrooms} bathroom{property.bathrooms === 1 ? '' : 's'}
              </div>
            </div>

            {property.description && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>About this place</h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap' }}>{property.description}</p>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Amenities</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {property.amenities.map(a => (
                    <span key={a} className="surface-muted" style={{ padding: '6px 12px', fontSize: 13, color: '#374151' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}

            {property.videoUrl && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Video tour</h2>
                <video
                  src={property.videoUrl} controls playsInline
                  style={{ width: '100%', maxHeight: 420, borderRadius: 14, background: '#000', display: 'block' }}
                />
              </div>
            )}

            {availability && availability.unavailableDates.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <CalendarX2 size={17} /> Unavailable dates
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {availability.unavailableDates.map((range, i) => (
                    <div key={i} className="surface-muted" style={{ padding: '8px 12px', fontSize: 13.5, color: '#374151' }}>
                      {formatDateRange(range.startDate, range.endDate)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <MessageSquare size={17} /> Reviews {property.reviewCount > 0 && `(${property.reviewCount})`}
              </h2>
              {reviews.length === 0 && (
                <p style={{ fontSize: 14, color: '#6B7280' }}>No reviews yet.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(review => (
                  <div key={review.id} className="surface-card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 14 }}>{review.guestName}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} color="#F59E0B" fill="#F59E0B" />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>}
                    {review.hostResponse && (
                      <div className="surface-muted" style={{ padding: 10, marginTop: 10, fontSize: 13 }}>
                        <strong style={{ display: 'block', marginBottom: 3, color: '#095C46' }}>Host response</strong>
                        <span style={{ color: '#374151' }}>{review.hostResponse}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: booking sidebar */}
          <div>
            <div className="surface-card" style={{ padding: 20, position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#095C46' }}>{formatMoney(property.pricePerNight, property.currency)}</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>/ night</span>
              </div>
              {property.cleaningFee != null && property.cleaningFee > 0 && (
                <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 16px' }}>
                  + {formatMoney(property.cleaningFee, property.currency)} cleaning fee
                </p>
              )}
              <Link to={`/properties/${property.slug}/book`} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}>
                Check availability
              </Link>
              <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 10 }}>
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
