import { useEffect, useState } from 'react'
import { Wallet, CheckCircle2, Clock, Banknote } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { formatMoney } from '../../utils/currency'
import type { EarningsTransaction, HostEarningsSummary, Payout, PayoutStatus } from '../../types'

const STATUS_CFG: Record<PayoutStatus, { label: string; cls: string }> = {
  PENDING:    { label: 'Not yet eligible', cls: 'status-pending' },
  ELIGIBLE:   { label: 'Ready for release', cls: 'status-preparing' },
  PROCESSING: { label: 'Processing',       cls: 'status-preparing' },
  PAID:       { label: 'Paid',             cls: 'status-delivered' },
  ON_HOLD:    { label: 'On hold',          cls: 'status-cancelled' },
  DISPUTED:   { label: 'Disputed',         cls: 'status-cancelled' },
  REFUNDED:   { label: 'Refunded',         cls: 'status-cancelled' },
  CANCELLED:  { label: 'Cancelled',        cls: 'status-cancelled' },
  FAILED:     { label: 'Failed',           cls: 'status-cancelled' },
}

export default function HostEarnings() {
  const [summary, setSummary] = useState<HostEarningsSummary | null>(null)
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<HostEarningsSummary>('/api/host/earnings'),
      api.get<EarningsTransaction[]>('/api/host/earnings/transactions'),
      api.get<Payout[]>('/api/host/payouts'),
    ]).then(([s, t, p]) => {
      setSummary(s.data)
      setTransactions(t.data)
      setPayouts(p.data)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Earnings</h1>
          <p className="page-subtitle">
            Payouts release automatically after checkout, once the protection window clears — nothing to request.
          </p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && summary && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <StatCard icon={<Wallet size={17} />} label="Total earnings" value={summary.totalEarnings} currency={summary.currency} />
              <StatCard icon={<CheckCircle2 size={17} />} label="Paid out" value={summary.totalPaidOut} currency={summary.currency} />
              <StatCard icon={<Clock size={17} />} label="Not yet eligible" value={summary.pendingPayoutAmount} currency={summary.currency} />
              <StatCard icon={<Banknote size={17} />} label="Ready for release" value={summary.availableBalance} currency={summary.currency} highlight />
            </div>

            <div className="surface-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Payouts by booking</h2>
              {payouts.length === 0 && <p style={{ fontSize: 13.5, color: '#6B7280' }}>No payouts yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payouts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13.5, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ color: '#111827', fontWeight: 600 }}>{p.propertyTitle ?? 'Booking'}</span>
                    <span style={{ color: '#095C46', fontWeight: 700 }}>{formatMoney(p.amount, p.currency)}</span>
                    <span style={{ color: '#6B7280' }}>{new Date(p.requestedAt).toLocaleDateString()}</span>
                    <span className={`status-pill ${STATUS_CFG[p.status].cls}`}>
                      <span className="status-dot" />{STATUS_CFG[p.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Transaction history</h2>
              {transactions.length === 0 && <p style={{ fontSize: 13.5, color: '#6B7280' }}>No transactions yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.map(t => (
                  <div key={t.bookingId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13.5 }}>
                    <span style={{ color: '#111827' }}>{t.propertyTitle}</span>
                    <span style={{ color: '#6B7280' }}>{new Date(t.date).toLocaleDateString()}</span>
                    <span style={{ color: '#095C46', fontWeight: 700 }}>{formatMoney(t.amount, t.currency)}</span>
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

function StatCard({ icon, label, value, currency, highlight }: { icon: React.ReactNode; label: string; value: number; currency: string; highlight?: boolean }) {
  return (
    <div className="surface-card" style={{ padding: 18, ...(highlight ? { background: '#E8F5F1', border: '1px solid #095C46' } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#095C46', marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{label}</span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>{formatMoney(value, currency)}</p>
    </div>
  )
}
