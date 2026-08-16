import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Home, ArrowLeft } from 'lucide-react'
import api from '../api/axios'
import PropertyCard from '../components/PropertyCard'
import { useCountry } from '../contexts/CountryContext'
import { currencySymbol } from '../utils/currency'
import type { Country, Property } from '../types'

const COUNTRY_CURRENCY: Record<Country, string> = { NIGERIA: 'NGN', SOUTH_AFRICA: 'ZAR' }

export default function DiscoverPage() {
  const { country } = useCountry()
  const [searchParams, setSearchParams] = useSearchParams()
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [guests, setGuests] = useState(searchParams.get('guests') ?? '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const params: Record<string, string> = { country }
    const c = searchParams.get('city')
    const g = searchParams.get('guests')
    const min = searchParams.get('minPrice')
    const max = searchParams.get('maxPrice')
    if (c) params.city = c
    if (g) params.guests = g
    if (min) params.minPrice = min
    if (max) params.maxPrice = max

    setLoading(true)
    setError('')
    api.get<Property[]>('/api/public/properties', { params })
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('Unexpected response shape')
        setProperties(data)
      })
      .catch(() => setError('Could not load properties. Please try again.'))
      .finally(() => setLoading(false))
  }, [searchParams, country])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const params: Record<string, string> = {}
    if (city.trim()) params.city = city.trim()
    if (guests) params.guests = guests
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    setSearchParams(params)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(245,243,238,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB', padding: '14px 20px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
            <ArrowLeft size={16} /> Unyimi
          </Link>
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <input
              className="input" placeholder="Where are you going?" value={city}
              onChange={e => setCity(e.target.value)} style={{ flex: '1 1 200px', minWidth: 160 }}
            />
            <input
              className="input" type="number" min={1} placeholder="Guests" value={guests}
              onChange={e => setGuests(e.target.value)} style={{ width: 100 }}
            />
            <input
              className="input" type="number" min={0} placeholder={`Min ${currencySymbol(COUNTRY_CURRENCY[country])}/night`} value={minPrice}
              onChange={e => setMinPrice(e.target.value)} style={{ width: 130 }}
            />
            <input
              className="input" type="number" min={0} placeholder={`Max ${currencySymbol(COUNTRY_CURRENCY[country])}/night`} value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)} style={{ width: 130 }}
            />
            <button type="submit" className="btn btn-primary btn-md">
              <Search size={15} /> Search
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 20px 60px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
            <span className="spinner spinner-dark" /> <span style={{ marginLeft: 8 }}>Loading properties…</span>
          </div>
        )}

        {!loading && error && (
          <div className="surface-card" style={{ padding: 24, textAlign: 'center', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Home size={32} color="#9CA3AF" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>No properties found</p>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>Try adjusting your search filters.</p>
          </div>
        )}

        {!loading && !error && properties.length > 0 && (
          <>
            <p style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 16 }}>
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
