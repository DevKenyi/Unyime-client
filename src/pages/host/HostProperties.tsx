import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Power, Trash2, Sparkles } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { formatMoney } from '../../utils/currency'
import type { CleaningSettings, Property, PropertyOperationalStatus, PropertyStatus } from '../../types'

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

const ALL_WINDOWS = ['10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM']

export default function HostProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [expandedSettingsId, setExpandedSettingsId] = useState<string | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [stayPrice, setStayPrice] = useState('')
  const [duration, setDuration] = useState(120)
  const [windows, setWindows] = useState<string[]>(ALL_WINDOWS)
  const [allowRequests, setAllowRequests] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<Property[]>('/api/host/properties')
      .then(({ data }) => setProperties(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleSettings = async (propertyId: string) => {
    if (expandedSettingsId === propertyId) { setExpandedSettingsId(null); return }
    setExpandedSettingsId(propertyId)
    setSettingsError('')
    setSettingsLoading(true)
    try {
      const { data } = await api.get<CleaningSettings>(`/api/host/properties/${propertyId}/cleaning-settings`)
      setStayPrice(data.stayCleaningPrice != null ? String(data.stayCleaningPrice) : '')
      setDuration(data.estimatedDurationMinutes)
      setWindows(data.enabledWindows.length > 0 ? data.enabledWindows : ALL_WINDOWS)
      setAllowRequests(data.allowGuestRequestedCleaning)
    } catch {
      setSettingsError('Could not load cleaning settings.')
    } finally {
      setSettingsLoading(false)
    }
  }

  const toggleWindow = (w: string) => {
    setWindows(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])
  }

  const saveSettings = async (propertyId: string) => {
    setSettingsSaving(true)
    setSettingsError('')
    try {
      await api.put(`/api/host/properties/${propertyId}/cleaning-settings`, {
        stayCleaningPrice: stayPrice.trim() ? Number(stayPrice) : null,
        estimatedDurationMinutes: duration,
        enabledWindows: windows,
        allowGuestRequestedCleaning: allowRequests,
      })
      setExpandedSettingsId(null)
    } catch (err: any) {
      setSettingsError(err.response?.data?.error ?? 'Could not save cleaning settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

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
              <div key={p.id} className="surface-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleSettings(p.id)}>
                    <Sparkles size={13} /> Cleaning settings
                  </button>
                  <button className="btn btn-secondary btn-sm" disabled={busyId === p.id} onClick={() => toggleActive(p.id)}>
                    <Power size={13} /> {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === p.id} onClick={() => remove(p.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {expandedSettingsId === p.id && (
                <div className="surface-muted" style={{ padding: 16, marginTop: 14 }}>
                  {settingsLoading ? (
                    <span className="spinner spinner-dark" />
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Guest-requested stay cleaning</p>
                      <p style={{ fontSize: 12.5, color: '#6B7280', margin: '0 0 12px' }}>
                        Let guests pay for an extra cleaning during their stay, on top of the mandatory turnover cleaning after checkout.
                      </p>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
                        <input type="checkbox" checked={allowRequests} onChange={e => setAllowRequests(e.target.checked)} />
                        Allow guests to request cleaning during their stay
                      </label>

                      <div className="form-row-2" style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                        <div className="form-group">
                          <label>Stay cleaning price ({p.currency})</label>
                          <input className="input" type="number" min={0} placeholder="e.g. 15000" value={stayPrice} onChange={e => setStayPrice(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Estimated duration (minutes)</label>
                          <input className="input" type="number" min={30} step={30} value={duration} onChange={e => setDuration(Number(e.target.value))} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Available cleaning windows</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {ALL_WINDOWS.map(w => (
                            <label key={w} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#374151' }}>
                              <input type="checkbox" checked={windows.includes(w)} onChange={() => toggleWindow(w)} />
                              {w}
                            </label>
                          ))}
                        </div>
                      </div>

                      {settingsError && <p style={{ color: '#DC2626', fontSize: 13, margin: '10px 0' }}>{settingsError}</p>}

                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setExpandedSettingsId(null)}>Cancel</button>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={settingsSaving || (allowRequests && !stayPrice.trim())}
                          onClick={() => saveSettings(p.id)}
                        >
                          {settingsSaving ? <span className="spinner" /> : 'Save settings'}
                        </button>
                      </div>
                    </>
                  )}
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
