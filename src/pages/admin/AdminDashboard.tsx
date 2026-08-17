import { useEffect, useMemo, useState } from 'react'
import { Users, Home, ClipboardList, TrendingUp, Percent, Banknote, XCircle, PieChart } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import StatTile from '../../components/StatTile'
import TrendChart from '../../components/charts/TrendChart'
import BarBreakdown from '../../components/charts/BarBreakdown'
import api from '../../api/axios'
import { groupSumByDay } from '../../utils/chartData'
import { formatMoney } from '../../utils/currency'
import type { AdminDashboard as AdminDashboardData, Booking, BookingStatus } from '../../types'

function formatByCurrency(byCurrency: Record<string, number>): string {
  const entries = Object.entries(byCurrency)
  if (entries.length === 0) return formatMoney(0, undefined)
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(' · ')
}

const PAID_STATUSES: BookingStatus[] = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED']

const STATUS_ORDER: { status: BookingStatus; label: string; color: string }[] = [
  { status: 'PENDING_PAYMENT', label: 'Pending payment', color: '#D97706' },
  { status: 'CONFIRMED',       label: 'Confirmed',       color: '#059669' },
  { status: 'CHECKED_IN',      label: 'Checked in',      color: '#2563EB' },
  { status: 'CHECKED_OUT',     label: 'Checked out',     color: '#7C3AED' },
  { status: 'COMPLETED',       label: 'Completed',       color: '#10B981' },
  { status: 'CANCELLED',       label: 'Cancelled',       color: '#EF4444' },
  { status: 'FAILED',          label: 'Failed',          color: '#DC2626' },
  { status: 'EXPIRED',         label: 'Expired',         color: '#9CA3AF' },
]

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<AdminDashboardData>('/api/admin/dashboard'),
      api.get<Booking[]>('/api/admin/bookings'),
    ])
      .then(([d, b]) => {
        setData(d.data)
        setBookings(b.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Trend chart shows one currency at a time — summing NGN and ZAR bookings into the same daily
  // total would be meaningless, and the chart doesn't support multi-series yet. Defaults to
  // whichever currency has recorded revenue first; a future pass can make this a proper
  // multi-series or user-selectable chart once multi-currency volume is meaningful.
  const primaryCurrency = Object.keys(data?.revenueByCurrency ?? {})[0] ?? 'NGN'
  const revenueTrend = useMemo(
    () => groupSumByDay(
      bookings.filter(b => PAID_STATUSES.includes(b.status) && b.currency === primaryCurrency),
      b => b.createdAt,
      b => b.total,
      14
    ),
    [bookings, primaryCurrency]
  )

  const statusBreakdown = useMemo(
    () => STATUS_ORDER.map(({ status, label, color }) => ({
      label, color, value: bookings.filter(b => b.status === status).length,
    })),
    [bookings]
  )

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform-wide metrics at a glance.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <StatTile icon={<Users size={16} />} label="Total users" value={data.totalUsers} />
              <StatTile icon={<Users size={16} />} label="Hosts" value={data.totalHosts} />
              <StatTile icon={<Users size={16} />} label="Guests" value={data.totalGuests} />
              <StatTile icon={<Home size={16} />} label="Properties" value={data.totalProperties} />
              <StatTile icon={<ClipboardList size={16} />} label="Active bookings" value={data.activeBookings} />
              <StatTile icon={<TrendingUp size={16} />} label="Revenue" value={formatByCurrency(data.revenueByCurrency)} accent />
              <StatTile icon={<Percent size={16} />} label="Platform fees" value={formatByCurrency(data.platformFeesByCurrency)} />
              <StatTile icon={<Banknote size={16} />} label="Pending payouts" value={formatMoney(data.pendingPayoutAmount, undefined)} />
              <StatTile icon={<XCircle size={16} />} label="Cancellations" value={data.cancellations} />
            </div>

            <div className="detail-layout" style={{ display: 'grid', gap: 16 }}>
              <div className="surface-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <TrendingUp size={16} color="#095C46" />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Revenue, last 14 days</h2>
                </div>
                <TrendChart data={revenueTrend} formatValue={v => formatMoney(v, primaryCurrency)} />
              </div>

              <div className="surface-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <PieChart size={16} color="#095C46" />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Bookings by status</h2>
                </div>
                <BarBreakdown data={statusBreakdown} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
