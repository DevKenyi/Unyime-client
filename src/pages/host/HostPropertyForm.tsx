import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import type { BlockedDate, Property, PropertyPhoto } from '../../types'

interface FormState {
  title: string
  description: string
  city: string
  address: string
  pricePerNight: string
  cleaningFee: string
  maxGuests: string
  bedrooms: string
  bathrooms: string
  amenities: string
  coverImageUrl: string
}

const EMPTY_FORM: FormState = {
  title: '', description: '', city: '', address: '',
  pricePerNight: '', cleaningFee: '', maxGuests: '1', bedrooms: '1', bathrooms: '1',
  amenities: '', coverImageUrl: '',
}

export default function HostPropertyForm() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const isEdit = !!propertyId
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.get<Property[]>('/api/host/properties')
      .then(({ data }) => {
        const p = data.find(x => x.id === propertyId)
        if (!p) { setError('Property not found.'); return }
        setForm({
          title: p.title,
          description: p.description ?? '',
          city: p.city,
          address: p.address ?? '',
          pricePerNight: String(p.pricePerNight),
          cleaningFee: p.cleaningFee != null ? String(p.cleaningFee) : '',
          maxGuests: String(p.maxGuests),
          bedrooms: String(p.bedrooms),
          bathrooms: String(p.bathrooms),
          amenities: p.amenities.join(', '),
          coverImageUrl: p.coverImageUrl ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [isEdit, propertyId])

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      title: form.title,
      description: form.description || null,
      city: form.city,
      address: form.address || null,
      pricePerNight: Number(form.pricePerNight),
      cleaningFee: form.cleaningFee ? Number(form.cleaningFee) : null,
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      coverImageUrl: form.coverImageUrl || null,
    }
    try {
      if (isEdit) {
        await api.put(`/api/host/properties/${propertyId}`, payload)
      } else {
        const { data } = await api.post<Property>('/api/host/properties', payload)
        navigate(`/host/properties/${data.id}/edit`, { replace: true })
        return
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not save this property.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLayout><div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">{isEdit ? 'Edit property' : 'Add property'}</h1>
          <p className="page-subtitle">
            {isEdit ? 'Update your listing details.' : 'New listings need admin approval before they appear in search.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card" style={{ padding: 24, maxWidth: 640 }}>
          <div className="form-group">
            <label>Title</label>
            <input className="input" required value={form.title} onChange={set('title')} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>City</label>
              <input className="input" required value={form.city} onChange={set('city')} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="input" value={form.address} onChange={set('address')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Price per night (₦)</label>
              <input className="input" type="number" min={0.01} step="0.01" required value={form.pricePerNight} onChange={set('pricePerNight')} />
            </div>
            <div className="form-group">
              <label>Cleaning fee (₦, optional)</label>
              <input className="input" type="number" min={0} step="0.01" value={form.cleaningFee} onChange={set('cleaningFee')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Max guests</label>
              <input className="input" type="number" min={1} required value={form.maxGuests} onChange={set('maxGuests')} />
            </div>
            <div className="form-group">
              <label>Bedrooms</label>
              <input className="input" type="number" min={0} required value={form.bedrooms} onChange={set('bedrooms')} />
            </div>
            <div className="form-group">
              <label>Bathrooms</label>
              <input className="input" type="number" min={0} required value={form.bathrooms} onChange={set('bathrooms')} />
            </div>
          </div>
          <div className="form-group">
            <label>Amenities (comma-separated)</label>
            <input className="input" placeholder="Wi-Fi, Pool, Parking" value={form.amenities} onChange={set('amenities')} />
          </div>
          <div className="form-group">
            <label>Cover image URL</label>
            <input className="input" type="url" value={form.coverImageUrl} onChange={set('coverImageUrl')} />
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-md" disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? 'Save changes' : 'Create property'}
          </button>
        </form>

        {isEdit && propertyId && (
          <>
            <PhotosManager propertyId={propertyId} />
            <BlockedDatesManager propertyId={propertyId} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function PhotosManager({ propertyId }: { propertyId: string }) {
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [adding, setAdding] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<PropertyPhoto[]>(`/api/host/properties/${propertyId}/photos`)
      .then(({ data }) => setPhotos(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [propertyId])

  const addPhoto = async (e: FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim()) return
    setAdding(true)
    try {
      await api.post(`/api/host/properties/${propertyId}/photos`, { imageUrl, caption: caption || null, sortOrder: photos.length })
      setImageUrl('')
      setCaption('')
      load()
    } finally {
      setAdding(false)
    }
  }

  const removePhoto = async (photoId: string) => {
    await api.delete(`/api/host/properties/${propertyId}/photos/${photoId}`)
    setPhotos(prev => prev.filter(p => p.id !== photoId))
  }

  return (
    <div className="surface-card" style={{ padding: 24, maxWidth: 640, marginTop: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Photos</h2>

      {loading ? <span className="spinner spinner-dark" /> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', width: 100, height: 100 }}>
              <img src={photo.imageUrl} alt={photo.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              <button
                onClick={() => removePhoto(photo.id)}
                style={{
                  position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                  background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addPhoto} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Image URL" required value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ flex: '1 1 220px' }} />
        <input className="input" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} style={{ flex: '1 1 160px' }} />
        <button type="submit" className="btn btn-secondary btn-md" disabled={adding}>
          <Plus size={14} /> Add
        </button>
      </form>
    </div>
  )
}

function BlockedDatesManager({ propertyId }: { propertyId: string }) {
  const [blocks, setBlocks] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.get<BlockedDate[]>(`/api/host/properties/${propertyId}/blocked-dates`)
      .then(({ data }) => setBlocks(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [propertyId])

  const addBlock = async (e: FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      await api.post(`/api/host/properties/${propertyId}/blocked-dates`, { startDate, endDate, reason: reason || null })
      setStartDate('')
      setEndDate('')
      setReason('')
      load()
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not block these dates.')
    } finally {
      setAdding(false)
    }
  }

  const removeBlock = async (blockId: string) => {
    await api.delete(`/api/host/properties/${propertyId}/blocked-dates/${blockId}`)
    setBlocks(prev => prev.filter(b => b.id !== blockId))
  }

  return (
    <div className="surface-card" style={{ padding: 24, maxWidth: 640, marginTop: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Blocked dates</h2>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Block dates for maintenance or personal use — these won't be bookable by guests.
      </p>

      {loading ? <span className="spinner spinner-dark" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {blocks.map(b => (
            <div key={b.id} className="surface-muted" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, color: '#374151' }}>
                {b.startDate} → {b.endDate}{b.reason ? ` · ${b.reason}` : ''}
              </span>
              <button onClick={() => removeBlock(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {blocks.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No blocked dates.</p>}
        </div>
      )}

      <form onSubmit={addBlock} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <input type="date" className="input" required value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: '1 1 140px' }} />
        <input type="date" className="input" required value={endDate} onChange={e => setEndDate(e.target.value)} style={{ flex: '1 1 140px' }} />
        <input className="input" placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} style={{ flex: '1 1 160px' }} />
        <button type="submit" className="btn btn-secondary btn-md" disabled={adding}>
          <Plus size={14} /> Block
        </button>
      </form>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
    </div>
  )
}
