import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { formatMoney } from '../../utils/currency'
import type { AdminPayout, PayoutStatus } from '../../types'

const STATUS_CFG: Record<PayoutStatus, { label: string; cls: string }> = {
  PENDING:    { label: 'Not yet eligible', cls: 'status-pending' },
  ELIGIBLE:   { label: 'Eligible',         cls: 'status-preparing' },
  PROCESSING: { label: 'Processing',       cls: 'status-preparing' },
  PAID:       { label: 'Paid',             cls: 'status-delivered' },
  ON_HOLD:    { label: 'On hold',          cls: 'status-cancelled' },
  DISPUTED:   { label: 'Disputed',         cls: 'status-cancelled' },
  REFUNDED:   { label: 'Refunded',         cls: 'status-cancelled' },
  CANCELLED:  { label: 'Cancelled',        cls: 'status-cancelled' },
  FAILED:     { label: 'Failed',           cls: 'status-cancelled' },
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [holdReason, setHoldReason] = useState('')
  const [transferReference, setTransferReference] = useState('')
  const [actionError, setActionError] = useState('')

  const load = () => {
    setLoading(true)
    api.get<AdminPayout[]>('/api/admin/payouts')
      .then(({ data }) => setPayouts(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleExpand = (payoutId: string) => {
    setExpandedId(expandedId === payoutId ? null : payoutId)
    setHoldReason('')
    setTransferReference('')
    setActionError('')
  }

  const runAction = async (payoutId: string, action: () => Promise<unknown>) => {
    setBusyId(payoutId)
    setActionError('')
    try {
      await action()
      setExpandedId(null)
      load()
    } catch (err: any) {
      setActionError(err.response?.data?.error ?? 'Could not complete this action.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Payouts</h1>
          <p className="page-subtitle">
            Every booking's host earnings — gross amount, commission, payout status, and dispute state.
          </p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && payouts.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No payouts yet.</p>
          </div>
        )}

        {!loading && payouts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {payouts.map(p => {
              const expanded = expandedId === p.payoutId
              return (
                <div key={p.payoutId} className="surface-card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{p.propertyTitle ?? 'Booking'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#6B7280', flexWrap: 'wrap' }}>
                        <span>{p.guestName}</span>
                        <span>{p.hostEmail}</span>
                        {p.checkInDate && p.checkOutDate && <span>{p.checkInDate} → {p.checkOutDate}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {p.disputeStatus === 'OPEN' && (
                        <span className="status-pill status-cancelled"><span className="status-dot" />Dispute open</span>
                      )}
                      <span className={`status-pill ${STATUS_CFG[p.payoutStatus].cls}`}>
                        <span className="status-dot" />{STATUS_CFG[p.payoutStatus].label}
                      </span>
                    </div>
                  </div>

                  <div className="surface-muted" style={{ padding: 12, marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                    <div><span style={{ color: '#9CA3AF' }}>Gross</span><br /><strong>{p.grossAmount != null ? formatMoney(p.grossAmount, p.currency) : '—'}</strong></div>
                    <div><span style={{ color: '#9CA3AF' }}>Commission</span><br /><strong>{p.platformCommission != null ? formatMoney(p.platformCommission, p.currency) : '—'}</strong></div>
                    <div><span style={{ color: '#9CA3AF' }}>Host earnings</span><br /><strong style={{ color: '#095C46' }}>{formatMoney(p.hostAmount, p.currency)}</strong></div>
                    <div><span style={{ color: '#9CA3AF' }}>Payment ref</span><br /><strong>{p.paymentReference ?? '—'}</strong></div>
                    {p.eligibleAt && <div><span style={{ color: '#9CA3AF' }}>Eligible since</span><br /><strong>{new Date(p.eligibleAt).toLocaleString()}</strong></div>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    {p.payoutStatus === 'ELIGIBLE' && (
                      <button className="btn btn-primary btn-sm" disabled={busyId === p.payoutId}
                        onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/payouts/${p.payoutId}/mark-processing`))}>
                        Start release
                      </button>
                    )}
                    {p.payoutStatus === 'PROCESSING' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(p.payoutId)}>
                        Mark paid
                      </button>
                    )}
                    {(p.payoutStatus === 'PENDING' || p.payoutStatus === 'ELIGIBLE') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleExpand(p.payoutId)}>
                        Hold
                      </button>
                    )}
                    {(p.payoutStatus === 'ON_HOLD' || p.payoutStatus === 'DISPUTED') && (
                      <button className="btn btn-secondary btn-sm" disabled={busyId === p.payoutId}
                        onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/payouts/${p.payoutId}/release-hold`))}>
                        Release hold
                      </button>
                    )}
                    {p.bookingId && p.disputeStatus !== 'OPEN' && (
                      <button className="btn btn-danger btn-sm" onClick={() => toggleExpand(p.payoutId)}>
                        Open dispute
                      </button>
                    )}
                    {p.bookingId && p.disputeStatus === 'OPEN' && (
                      <button className="btn btn-secondary btn-sm" disabled={busyId === p.payoutId}
                        onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/bookings/${p.bookingId}/dispute/resolve`))}>
                        Resolve dispute
                      </button>
                    )}
                  </div>

                  {expanded && (
                    <div className="surface-muted" style={{ padding: 14, marginTop: 12 }}>
                      {p.payoutStatus === 'PROCESSING' && (
                        <div className="form-group">
                          <label>Transfer reference</label>
                          <input className="input" value={transferReference} onChange={e => setTransferReference(e.target.value)} placeholder="e.g. bank transfer confirmation #" />
                          <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} disabled={!transferReference.trim() || busyId === p.payoutId}
                            onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/payouts/${p.payoutId}/mark-paid`, { transferReference }))}>
                            Confirm paid
                          </button>
                        </div>
                      )}
                      {(p.payoutStatus === 'PENDING' || p.payoutStatus === 'ELIGIBLE') && (
                        <div className="form-group">
                          <label>Hold reason</label>
                          <input className="input" value={holdReason} onChange={e => setHoldReason(e.target.value)} placeholder="e.g. risk review" />
                          <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} disabled={!holdReason.trim() || busyId === p.payoutId}
                            onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/payouts/${p.payoutId}/hold`, { reason: holdReason }))}>
                            Confirm hold
                          </button>
                        </div>
                      )}
                      {p.bookingId && p.disputeStatus !== 'OPEN' && (
                        <div className="form-group">
                          <label>Dispute reason</label>
                          <input className="input" value={holdReason} onChange={e => setHoldReason(e.target.value)} placeholder="e.g. guest reported property damage" />
                          <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} disabled={!holdReason.trim() || busyId === p.payoutId}
                            onClick={() => runAction(p.payoutId, () => api.patch(`/api/admin/bookings/${p.bookingId}/dispute`, { reason: holdReason }))}>
                            Confirm dispute
                          </button>
                        </div>
                      )}
                      {actionError && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 8 }}>{actionError}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
