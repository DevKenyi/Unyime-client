import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { Payout } from '../../types'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<Payout[]>('/api/admin/payouts/pending')
      .then(({ data }) => setPayouts(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const pay = async (id: string) => {
    setBusyId(id)
    try {
      await api.patch(`/api/admin/payouts/${id}/pay`)
      setPayouts(prev => prev.filter(p => p.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Payouts</h1>
          <p className="page-subtitle">Process pending host payout requests.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && payouts.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No pending payouts.</p>
          </div>
        )}

        {!loading && payouts.length > 0 && (
          <div className="surface-card" style={{ padding: 0 }}>
            {payouts.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: i < payouts.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>₦{p.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>
                    Requested {new Date(p.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <button className="btn btn-primary btn-sm" disabled={busyId === p.id} onClick={() => pay(p.id)}>
                  Mark as paid
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
