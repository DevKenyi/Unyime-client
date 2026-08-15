import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import StatusPill from '../../components/StatusPill'
import type { Booking } from '../../types'

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<Booking[]>('/api/admin/bookings')
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const markRefunded = async (id: string) => {
    setBusyId(id)
    try {
      const { data } = await api.patch<Booking>(`/api/admin/bookings/${id}/refund`)
      setBookings(prev => prev.map(b => b.id === id ? data : b))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">All bookings across the platform.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookings.map(b => (
              <div key={b.id} className="surface-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{b.propertyTitle}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
                      <span>{b.guestName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} /> {b.checkInDate} → {b.checkOutDate}
                      </span>
                      <span>Ref: {b.paymentReference}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#095C46' }}>₦{b.total.toLocaleString()}</span>
                    <StatusPill status={b.status} />
                  </div>
                </div>

                {b.refundStatus === 'PENDING' && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="status-pill status-pending"><span className="status-dot" />Refund pending</span>
                    <button className="btn btn-primary btn-sm" disabled={busyId === b.id} onClick={() => markRefunded(b.id)}>
                      Mark refunded
                    </button>
                  </div>
                )}
                {b.refundStatus === 'PROCESSED' && (
                  <div style={{ marginTop: 12 }}>
                    <span className="status-pill status-delivered"><span className="status-dot" />Refunded</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
