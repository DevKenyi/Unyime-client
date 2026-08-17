import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Power, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { formatMoney } from '../../utils/currency'
import type { Property, PropertyOperationalStatus, PropertyStatus } from '../../types'

const STATUS_CFG: Record<PropertyStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending review', cls: 'status-pending' },
  APPROVED: { label: 'Approved',       cls: 'status-delivered' },
  REJECTED: { label: 'Rejected',       cls: 'status-cancelled' },
}

/** AVAILABLE is the common case — only flag the states that need a host's attention. */
const OPERATIONAL_CFG: Partial<Record<PropertyOperationalStatus, { label: string; cls: string }>> = {
  CLEANING:    { label: 'Cleaning',    cls: 'status-preparing' },
  READY:       { label: 'Ready',       cls: 'status-delivered' },
  MAINTENANCE: { label: 'Maintenance', cls: 'status-cancelled' },
}

export default function HostProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get<Property[]>('/api/host/properties')
      .then(({ data }) => setProperties(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActive = async (id: string) => {
    setBusyId(id)
    try {
      const { data } = await api.patch<Property>(`/api/host/properties/${id}/toggle-active`)
      setProperties(prev => prev.map(p => p.id === id ? data : p))
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this property? This cannot be undone.')) return
    setBusyId(id)
    try {
      await api.delete(`/api/host/properties/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
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
            <p className="page-subtitle">Manage your listings, photos, and availability.</p>
          </div>
          <Link to="/host/properties/new" className="btn btn-primary btn-md">
            <Plus size={15} /> Add property
          </Link>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>
        )}

        {!loading && properties.length === 0 && (
          <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>You haven't listed any properties yet.</p>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {properties.map(p => (
              <div key={p.id} className="surface-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                  background: p.coverImageUrl ? `url(${p.coverImageUrl}) center/cover no-repeat` : '#E8F5F1',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Link to={`/host/properties/${p.id}/edit`} style={{ fontSize: 14.5, fontWeight: 700, color: '#111827', textDecoration: 'none' }}>
                      {p.title}
                    </Link>
                    <span className={`status-pill ${STATUS_CFG[p.status].cls}`}>
                      <span className="status-dot" />{STATUS_CFG[p.status].label}
                    </span>
                    {!p.isActive && <span className="status-pill status-cancelled"><span className="status-dot" />Inactive</span>}
                    {OPERATIONAL_CFG[p.operationalStatus] && (
                      <span className={`status-pill ${OPERATIONAL_CFG[p.operationalStatus]!.cls}`}>
                        <span className="status-dot" />{OPERATIONAL_CFG[p.operationalStatus]!.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                    <MapPin size={12} /> {p.city} · {formatMoney(p.pricePerNight, p.currency)}/night
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" disabled={busyId === p.id} onClick={() => toggleActive(p.id)}>
                    <Power size={13} /> {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === p.id} onClick={() => remove(p.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
