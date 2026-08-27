import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { formatMoney } from '../../utils/currency'
import type { Property, PropertyStatus } from '../../types'

const STATUS_CFG: Record<PropertyStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending review', cls: 'status-pending' },
  APPROVED: { label: 'Approved',       cls: 'status-delivered' },
  REJECTED: { label: 'Rejected',       cls: 'status-cancelled' },
}

export default function AdminProperties() {
  const [pending, setPending] = useState<Property[]>([])
  const [all, setAll] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<Property[]>('/api/admin/properties/pending'),
      api.get<Property[]>('/api/admin/properties'),
    ]).then(([p, a]) => {
      setPending(p.data)
      setAll(a.data)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id)
    setErrors(prev => ({ ...prev, [id]: '' }))
    try {
      await api.patch(`/api/admin/properties/${id}/${action}`)
      load()
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [id]: err.response?.data?.error ?? 'Action failed.' }))
    } finally {
      setBusyId(null)
    }
  }

  const toggleActive = async (id: string) => {
    setBusyId(id)
    try {
      await api.patch(`/api/admin/properties/${id}/toggle`)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Properties</h1>
            <p className="page-subtitle">Review new listings and manage all properties.</p>
          </div>
          <Link to="/admin/properties/new" className="btn btn-primary btn-md">Add property</Link>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>}

        {!loading && (
          <>
            {pending.length > 0 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Pending review ({pending.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.map(p => (
                    <div key={p.id} className="surface-card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{p.title}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6B7280' }}>
                            <MapPin size={12} /> {p.city} · {formatMoney(p.pricePerNight, p.currency)}/night
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-success btn-sm" disabled={busyId === p.id} onClick={() => decide(p.id, 'approve')}>Approve</button>
                          <button className="btn btn-danger btn-sm" disabled={busyId === p.id} onClick={() => decide(p.id, 'reject')}>Reject</button>
                        </div>
                      </div>

                      {p.photos && p.photos.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                          {p.photos.map(photo => (
                            <img
                              key={photo.id} src={photo.imageUrl} alt={photo.caption ?? ''}
                              style={{ width: 100, height: 76, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '10px 0 0' }}>No photos uploaded yet.</p>
                      )}
                      {p.videoUrl && (
                        <video src={p.videoUrl} controls style={{ width: 200, maxWidth: '100%', borderRadius: 8, marginTop: 8, display: 'block' }} />
                      )}

                      {errors[p.id] && <p style={{ color: '#DC2626', fontSize: 12.5, marginTop: 8 }}>{errors[p.id]}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '20px 0 12px' }}>All properties ({all.length})</h2>
              <div className="surface-card" style={{ padding: 0 }}>
                {all.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 20px', borderBottom: i < all.length - 1 ? '1px solid #F3F4F6' : 'none', gap: 12, flexWrap: 'wrap',
                  }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }}>{p.title}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{p.city}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`status-pill ${STATUS_CFG[p.status].cls}`}><span className="status-dot" />{STATUS_CFG[p.status].label}</span>
                      {!p.isActive && <span className="status-pill status-cancelled"><span className="status-dot" />Inactive</span>}
                      <button className="btn btn-secondary btn-sm" disabled={busyId === p.id} onClick={() => toggleActive(p.id)}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
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
