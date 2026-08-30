import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Search } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { AdminUser, Property } from '../../types'
import { EMPTY_WIZARD_STATE, type WizardState } from '../host/property-wizard/wizardTypes'
import ListingPreviewCard from '../host/property-wizard/ListingPreviewCard'
import StepAbout from '../host/property-wizard/StepAbout'
import StepSpace from '../host/property-wizard/StepSpace'
import StepPhotos from '../host/property-wizard/StepPhotos'
import StepPricing from '../host/property-wizard/StepPricing'
import StepPreview from '../host/property-wizard/StepPreview'

const STEPS = ['Host', 'About', 'Space & amenities', 'Photos', 'Pricing', 'Preview']

function isStepValid(step: number, state: WizardState, hostId: string | null): boolean {
  switch (step) {
    case 0: return hostId !== null
    case 1: return state.title.trim() !== '' && state.city.trim() !== ''
    case 2: return state.maxGuests >= 1
    case 3: return state.photos.length >= 1
    case 4: return Number(state.pricePerNight) >= 0.01
    default: return true
  }
}

export default function AdminPropertyForm() {
  const navigate = useNavigate()

  const [hosts, setHosts] = useState<AdminUser[]>([])
  const [hostsLoading, setHostsLoading] = useState(true)
  const [hostSearch, setHostSearch] = useState('')
  const [hostId, setHostId] = useState<string | null>(null)

  const [state, setState] = useState<WizardState>(EMPTY_WIZARD_STATE)
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [createdStatus, setCreatedStatus] = useState<Property['status'] | null>(null)

  useEffect(() => {
    api.get<AdminUser[]>('/api/admin/users')
      .then(({ data }) => setHosts(data.filter(u => u.role === 'HOST')))
      .finally(() => setHostsLoading(false))
  }, [])

  const filteredHosts = useMemo(() => {
    const q = hostSearch.trim().toLowerCase()
    if (!q) return hosts
    return hosts.filter(h => h.email.toLowerCase().includes(q))
  }, [hosts, hostSearch])

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const goToStep = (target: number) => {
    if (target <= maxReached) setStep(target)
  }

  const handleContinue = () => {
    if (!isStepValid(step, state, hostId)) return
    const next = Math.min(step + 1, STEPS.length - 1)
    setStep(next)
    setMaxReached(m => Math.max(m, next))
  }

  const handleSubmit = async () => {
    if (!hostId) return
    setSaving(true)
    setError('')
    const payload = {
      title: state.title,
      description: state.description || null,
      propertyType: state.propertyType,
      country: state.country,
      city: state.city,
      address: state.address || null,
      pricePerNight: Number(state.pricePerNight),
      cleaningFee: state.cleaningFee ? Number(state.cleaningFee) : null,
      maxGuests: state.maxGuests,
      bedrooms: state.bedrooms,
      beds: state.beds,
      bathrooms: state.bathrooms,
      minNights: state.minNights ? Number(state.minNights) : 1,
      houseRules: state.houseRules || null,
      amenities: state.amenities,
      coverImageUrl: state.photos[0]?.url ?? null,
      videoUrl: state.videoUrl || null,
    }
    try {
      const { data } = await api.post<Property>(`/api/admin/properties/for-host/${hostId}`, payload)
      await Promise.all(state.photos.map((photo, index) =>
        api.post(`/api/admin/properties/${data.id}/photos`, { imageUrl: photo.url, caption: photo.caption || null, sortOrder: index })
      ))
      setCreatedStatus(data.status)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not create this property.')
    } finally {
      setSaving(false)
    }
  }

  const handleExit = () => {
    const hasProgress = hostId !== null || state.title.trim() !== ''
    if (!hasProgress || window.confirm('Discard this listing and go back?')) {
      navigate('/admin/properties')
    }
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="page-shell">
          <div className="surface-card" style={{ padding: '48px 32px', maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#E8F5F1', color: '#095C46',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
              {createdStatus === 'APPROVED' ? 'Property created and live' : 'Property created — pending host verification'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              {createdStatus === 'APPROVED'
                ? "This listing was created by an admin, so it's already approved and visible in search — no review needed."
                : "This host hasn't completed identity verification yet, so this listing is saved as Pending — it'll need approving from the Properties page once their KYC clears."}
            </p>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary btn-md" onClick={() => navigate('/admin/properties')}>Done</button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">Add property for a host</h1>
            <p className="page-subtitle">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExit}>Exit</button>
        </div>

        <div className="wizard-rail">
          {STEPS.map((label, i) => (
            <button
              key={label} type="button"
              className={`wizard-step${i === step ? ' is-active' : ''}${i < step || i < maxReached ? ' is-done' : ''}${i <= maxReached ? ' is-clickable' : ''}`}
              onClick={() => goToStep(i)}
              disabled={i > maxReached}
            >
              <span className="wizard-step-dot">{i + 1}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="wizard-layout">
          <div className="surface-card" style={{ padding: 24 }}>
            {step === 0 && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Which host is this for?</h2>
                <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 16px' }}>
                  This listing will be created under the selected host's account and auto-approved.
                </p>
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
                  <input
                    className="input" placeholder="Search hosts by email…"
                    value={hostSearch} onChange={e => setHostSearch(e.target.value)}
                    style={{ paddingLeft: 34 }}
                  />
                </div>
                {hostsLoading ? (
                  <span className="spinner spinner-dark" />
                ) : filteredHosts.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9CA3AF' }}>No hosts found.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                    {filteredHosts.map(h => (
                      <button
                        key={h.id} type="button"
                        onClick={() => setHostId(h.id)}
                        className="surface-muted"
                        style={{
                          textAlign: 'left', padding: '10px 14px', cursor: 'pointer',
                          border: hostId === h.id ? '2px solid #095C46' : '2px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{h.email}</span>
                        {!h.enabled && <span className="status-pill status-cancelled"><span className="status-dot" />Suspended</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {step === 1 && <StepAbout state={state} update={update} />}
            {step === 2 && <StepSpace state={state} update={update} />}
            {step === 3 && <StepPhotos state={state} update={update} />}
            {step === 4 && <StepPricing state={state} update={update} />}
            {step === 5 && (
              <StepPreview
                state={state}
                isEdit={false}
                saving={saving}
                error={error}
                onEdit={() => setStep(0)}
                onSubmit={handleSubmit}
                subtitle="This listing will be auto-approved and go live immediately since an admin is creating it."
                submitLabel="Create property →"
              />
            )}

            {step < 5 && (
              <>
                {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 16 }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                  <button
                    type="button" className="btn btn-secondary btn-md"
                    onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                  >
                    ← Back
                  </button>
                  <button
                    type="button" className="btn btn-primary btn-md"
                    onClick={handleContinue} disabled={!isStepValid(step, state, hostId)}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="wizard-preview-pane">
            <ListingPreviewCard state={state} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
