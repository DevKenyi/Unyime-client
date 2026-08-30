import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useCountry } from '../../contexts/CountryContext'
import type { Property, PropertyPhoto } from '../../types'
import { EMPTY_WIZARD_STATE, type WizardPhoto, type WizardState } from './property-wizard/wizardTypes'
import ListingPreviewCard from './property-wizard/ListingPreviewCard'
import StepAbout from './property-wizard/StepAbout'
import StepSpace from './property-wizard/StepSpace'
import StepPhotos from './property-wizard/StepPhotos'
import StepPricing from './property-wizard/StepPricing'
import StepPreview from './property-wizard/StepPreview'
import HostAvailabilityCalendar from './property-wizard/HostAvailabilityCalendar'

const STEPS = ['About', 'Space & amenities', 'Photos', 'Pricing', 'Preview']

function isStepValid(step: number, state: WizardState): boolean {
  switch (step) {
    case 0: return state.title.trim() !== '' && state.city.trim() !== ''
    case 1: return state.maxGuests >= 1
    case 2: return state.photos.length >= 1
    case 3: return Number(state.pricePerNight) >= 0.01
    default: return true
  }
}

async function syncPhotos(propertyId: string, original: WizardPhoto[], current: WizardPhoto[]) {
  const currentIds = new Set(current.filter(p => p.id).map(p => p.id))
  const deleted = original.filter(o => !currentIds.has(o.id))
  await Promise.all(deleted.map(p => api.delete(`/api/host/properties/${propertyId}/photos/${p.id}`)))

  await Promise.all(current.map((photo, index) => {
    const body = { imageUrl: photo.url, caption: photo.caption || null, sortOrder: index }
    return photo.id
      ? api.put(`/api/host/properties/${propertyId}/photos/${photo.id}`, body)
      : api.post(`/api/host/properties/${propertyId}/photos`, body)
  }))
}

export default function HostPropertyForm() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const isEdit = !!propertyId
  const navigate = useNavigate()
  const { country: browsingCountry } = useCountry()

  const [state, setState] = useState<WizardState>(() => isEdit ? EMPTY_WIZARD_STATE : { ...EMPTY_WIZARD_STATE, country: browsingCountry })
  const [originalPhotos, setOriginalPhotos] = useState<WizardPhoto[]>([])
  const [step, setStep] = useState(0)
  const [maxReached, setMaxReached] = useState(0)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(propertyId ?? null)

  useEffect(() => {
    if (!isEdit || !propertyId) return
    Promise.all([
      api.get<Property[]>('/api/host/properties'),
      api.get<PropertyPhoto[]>(`/api/host/properties/${propertyId}/photos`),
    ])
      .then(([propsRes, photosRes]) => {
        const p = propsRes.data.find(x => x.id === propertyId)
        if (!p) { setError('Property not found.'); return }
        const wizardPhotos: WizardPhoto[] = photosRes.data
          .slice().sort((a, b) => a.sortOrder - b.sortOrder)
          .map(ph => ({ id: ph.id, url: ph.imageUrl, caption: ph.caption ?? '' }))
        setOriginalPhotos(wizardPhotos)
        setState({
          title: p.title,
          propertyType: p.propertyType,
          country: p.country,
          description: p.description ?? '',
          city: p.city,
          address: p.address ?? '',
          maxGuests: p.maxGuests,
          bedrooms: p.bedrooms,
          beds: p.beds,
          bathrooms: p.bathrooms,
          amenities: p.amenities,
          photos: wizardPhotos,
          videoUrl: p.videoUrl ?? '',
          pricePerNight: String(p.pricePerNight),
          cleaningFee: p.cleaningFee != null ? String(p.cleaningFee) : '',
          minNights: String(p.minNights),
          houseRules: p.houseRules ?? '',
        })
        setMaxReached(STEPS.length - 1)
      })
      .finally(() => setLoading(false))
  }, [isEdit, propertyId])

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const goToStep = (target: number) => {
    if (target <= maxReached) setStep(target)
  }

  const handleContinue = () => {
    if (!isStepValid(step, state)) return
    const next = Math.min(step + 1, STEPS.length - 1)
    setStep(next)
    setMaxReached(m => Math.max(m, next))
  }

  const handleSubmit = async () => {
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
      let id = savedPropertyId
      if (isEdit && id) {
        await api.put(`/api/host/properties/${id}`, payload)
      } else {
        const { data } = await api.post<Property>('/api/host/properties', payload)
        id = data.id
        setSavedPropertyId(id)
      }
      await syncPhotos(id!, originalPhotos, state.photos)
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not save this property.')
    } finally {
      setSaving(false)
    }
  }

  const handleExit = () => {
    const hasProgress = state.title.trim() !== '' || state.city.trim() !== ''
    if (!hasProgress || window.confirm('Discard this listing and go back?')) {
      navigate('/host/properties')
    }
  }

  if (loading) {
    return <DashboardLayout><div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div></DashboardLayout>
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
              {isEdit ? 'Changes saved' : 'Your property has been submitted'}
            </h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              {isEdit
                ? 'Your listing has been updated.'
                : "Our team will review your listing and notify you once it's approved."}
            </p>
            {!isEdit && (
              <span className="status-pill status-pending" style={{ marginBottom: 20 }}>
                <span className="status-dot" /> Listing status: Pending review
              </span>
            )}
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary btn-md" onClick={() => navigate('/host/properties')}>Done</button>
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
            <h1 className="page-title">{isEdit ? 'Edit property' : 'List your property'}</h1>
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
            {step === 0 && <StepAbout state={state} update={update} />}
            {step === 1 && <StepSpace state={state} update={update} />}
            {step === 2 && <StepPhotos state={state} update={update} />}
            {step === 3 && <StepPricing state={state} update={update} />}
            {step === 4 && (
              <StepPreview
                state={state}
                isEdit={isEdit}
                saving={saving}
                error={error}
                onEdit={() => setStep(0)}
                onSubmit={handleSubmit}
              />
            )}

            {step < 4 && (
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
                    onClick={handleContinue} disabled={!isStepValid(step, state)}
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

        {isEdit && propertyId && <HostAvailabilityCalendar propertyId={propertyId} />}
      </div>
    </DashboardLayout>
  )
}
