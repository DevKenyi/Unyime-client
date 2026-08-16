import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ClipboardList, Wallet, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import StatTile from '../../components/StatTile'
import TrendChart from '../../components/charts/TrendChart'
import api from '../../api/axios'
import { groupSumByDay } from '../../utils/chartData'
import { formatMoney } from '../../utils/currency'
import type { Booking, EarningsTransaction, HostEarningsSummary, KycStatusInfo, Property } from '../../types'

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function HostDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([])
  const [earnings, setEarnings] = useState<HostEarningsSummary | null>(null)
  const [kyc, setKyc] = useState<KycStatusInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<Property[]>('/api/host/properties'),
      api.get<Booking[]>('/api/host/bookings'),
      api.get<EarningsTransaction[]>('/api/host/earnings/transactions'),
      api.get<HostEarningsSummary>('/api/host/earnings'),
      api.get<KycStatusInfo>('/api/host/kyc'),
    ])
      .then(([p, b, t, e, k]) => {
        setProperties(p.data)
        setBookings(b.data)
        setTransactions(t.data)
        setEarnings(e.data)
        setKyc(k.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length
  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [bookings]
  )
  const earningsTrend = useMemo(
    () => groupSumByDay(transactions, t => t.date, t => t.amount, 14),
    [transactions]
  )

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
              <Link to="/host/properties" style={{ textDecoration: 'none' }}>
                <StatTile icon={<Home size={16} />} label="Properties" value={properties.length} />
              </Link>
              <Link to="/host/bookings" style={{ textDecoration: 'none' }}>
                <StatTile icon={<ClipboardList size={16} />} label="Upcoming bookings" value={upcoming} />
              </Link>
              <Link to="/host/earnings" style={{ textDecoration: 'none' }}>
                <StatTile icon={<Wallet size={16} />} label="Available balance" value={formatMoney(earnings?.availableBalance ?? 0, earnings?.currency)} accent />
              </Link>
            </div>

            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TrendingUp size={16} color="#095C46" />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Earnings, last 14 days</h2>
              </div>
              <TrendChart data={earningsTrend} formatValue={v => formatMoney(v, earnings?.currency)} />
            </div>

            <div className="surface-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Recent bookings</h2>
                <Link to="/host/bookings" style={{ fontSize: 13, color: '#095C46', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              {recentBookings.length === 0 && <p style={{ fontSize: 13.5, color: '#6B7280' }}>No bookings yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentBookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: '#E8F5F1', color: '#095C46',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {b.guestName[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }}>{b.guestName}</p>
                      <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '1px 0 0' }}>{b.propertyTitle}</p>
                    </div>
                    <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{timeAgo(b.createdAt)}</span>
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
