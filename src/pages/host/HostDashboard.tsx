import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ClipboardList, Wallet, ShieldAlert, ArrowRight } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { Booking, HostEarningsSummary, KycStatusInfo, Property } from '../../types'

export default function HostDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [earnings, setEarnings] = useState<HostEarningsSummary | null>(null)
  const [kyc, setKyc] = useState<KycStatusInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Property[]>('/api/host/properties'),
      api.get<Booking[]>('/api/host/bookings'),
      api.get<HostEarningsSummary>('/api/host/earnings'),
      api.get<KycStatusInfo>('/api/host/kyc'),
    ])
      .then(([p, b, e, k]) => {
        setProperties(p.data)
        setBookings(b.data)
        setEarnings(e.data)
        setKyc(k.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">A quick overview of your properties, bookings, and earnings.</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span className="spinner spinner-dark" />
          </div>
        )}

        {!loading && (
          <>
            {kyc && kyc.status !== 'VERIFIED' && (
              <div className="surface-card" style={{
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                background: '#FEF3C7', border: '1px solid #FDE68A',
              }}>
                <ShieldAlert size={20} color="#92400E" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#92400E', margin: 0 }}>
                    {kyc.status === 'REJECTED' ? 'Your identity verification was rejected' : 'Complete identity verification'}
                  </p>
                  <p style={{ fontSize: 12.5, color: '#92400E', margin: '2px 0 0' }}>
                    Properties can't be approved for public listing until you're verified.
                  </p>
                </div>
                <Link to="/host/kyc" className="btn btn-secondary btn-sm">Verify now</Link>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <StatCard icon={<Home size={18} />} label="Properties" value={properties.length} to="/host/properties" />
              <StatCard icon={<ClipboardList size={18} />} label="Upcoming bookings" value={upcoming} to="/host/bookings" />
              <StatCard
                icon={<Wallet size={18} />} label="Available balance"
                value={`₦${(earnings?.availableBalance ?? 0).toLocaleString()}`} to="/host/earnings"
              />
            </div>

            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Recent bookings</h2>
                <Link to="/host/bookings" style={{ fontSize: 13, color: '#095C46', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              {bookings.length === 0 && <p style={{ fontSize: 13.5, color: '#6B7280' }}>No bookings yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.slice(0, 5).map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ color: '#111827', fontWeight: 500 }}>{b.propertyTitle}</span>
                    <span style={{ color: '#6B7280' }}>{b.guestName} · {b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: string | number; to: string }) {
  return (
    <Link to={to} className="surface-card" style={{ padding: 18, textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#095C46', marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
    </Link>
  )
}
