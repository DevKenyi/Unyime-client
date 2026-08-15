import { useEffect, useState } from 'react'
import { Users, Home, ClipboardList, TrendingUp, Percent, Banknote, XCircle } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { AdminDashboard as AdminDashboardData } from '../../types'

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AdminDashboardData>('/api/admin/dashboard')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform-wide metrics at a glance.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <StatCard icon={<Users size={17} />} label="Total users" value={data.totalUsers} />
            <StatCard icon={<Users size={17} />} label="Hosts" value={data.totalHosts} />
            <StatCard icon={<Users size={17} />} label="Guests" value={data.totalGuests} />
            <StatCard icon={<Home size={17} />} label="Properties" value={data.totalProperties} />
            <StatCard icon={<ClipboardList size={17} />} label="Active bookings" value={data.activeBookings} />
            <StatCard icon={<TrendingUp size={17} />} label="Revenue" value={`₦${data.revenue.toLocaleString()}`} highlight />
            <StatCard icon={<Percent size={17} />} label="Platform fees" value={`₦${data.platformFees.toLocaleString()}`} />
            <StatCard icon={<Banknote size={17} />} label="Pending payouts" value={`₦${data.pendingPayoutAmount.toLocaleString()}`} />
            <StatCard icon={<XCircle size={17} />} label="Cancellations" value={data.cancellations} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="surface-card" style={{ padding: 18, ...(highlight ? { background: '#E8F5F1', border: '1px solid #095C46' } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#095C46', marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{label}</span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{value}</p>
    </div>
  )
}
