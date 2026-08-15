import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { KycStatusInfo } from '../../types'

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState<KycStatusInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<KycStatusInfo[]>('/api/admin/kyc/pending')
      .then(({ data }) => setSubmissions(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const decide = async (hostId: string, action: 'approve' | 'reject') => {
    setBusyId(hostId)
    try {
      await api.patch(`/api/admin/kyc/${hostId}/${action}`)
      setSubmissions(prev => prev.filter(s => s.hostId !== hostId))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Host verification</h1>
          <p className="page-subtitle">Review pending identity verification submissions.</p>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && submissions.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No submissions pending review.</p>
          </div>
        )}

        {!loading && submissions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {submissions.map(s => (
              <div key={s.hostId} className="surface-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{s.legalName}</p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                      {s.idDocumentType?.replace('_', ' ')} ·{' '}
                      <a href={s.idDocumentUrl ?? '#'} target="_blank" rel="noreferrer" style={{ color: '#095C46' }}>View document</a>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-success btn-sm" disabled={busyId === s.hostId} onClick={() => decide(s.hostId, 'approve')}>Approve</button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === s.hostId} onClick={() => decide(s.hostId, 'reject')}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
