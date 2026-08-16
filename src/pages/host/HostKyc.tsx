import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ShieldCheck, Upload, X } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { uploadImage } from '../../utils/cloudinaryUpload'
import type { IdDocumentType, KycStatusInfo } from '../../types'

const STATUS_COPY: Record<string, { label: string; cls: string }> = {
  UNVERIFIED: { label: 'Not submitted', cls: 'status-pending' },
  PENDING:    { label: 'Under review',  cls: 'status-preparing' },
  VERIFIED:   { label: 'Verified',      cls: 'status-delivered' },
  REJECTED:   { label: 'Rejected',      cls: 'status-cancelled' },
}

export default function HostKyc() {
  const [kyc, setKyc] = useState<KycStatusInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const [legalName, setLegalName] = useState('')
  const [idDocumentType, setIdDocumentType] = useState<IdDocumentType>('NATIONAL_ID')
  const [idDocumentUrl, setIdDocumentUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<KycStatusInfo>('/api/host/kyc')
      .then(({ data }) => {
        setKyc(data)
        if (data.legalName) setLegalName(data.legalName)
        if (data.idDocumentType) setIdDocumentType(data.idDocumentType)
        if (data.idDocumentUrl) setIdDocumentUrl(data.idDocumentUrl)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file, 'kyc')
      setIdDocumentUrl(url)
    } catch (err: any) {
      setError(err.message ?? 'Could not upload this photo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess(false)
    try {
      const { data } = await api.post<KycStatusInfo>('/api/host/kyc', { legalName, idDocumentType, idDocumentUrl })
      setKyc(data)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not submit verification.')
    } finally {
      setSubmitting(false)
    }
  }

  const status = kyc?.status ?? 'UNVERIFIED'
  const cfg = STATUS_COPY[status]
  const canEdit = status !== 'PENDING' && status !== 'VERIFIED'

  return (
    <DashboardLayout>
      <div className="page-shell">
        <div className="page-header">
          <h1 className="page-title">Identity verification</h1>
          <p className="page-subtitle">Verified hosts can get their properties approved for public listing.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>
        ) : (
          <div className="surface-card" style={{ padding: 24, maxWidth: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className={`status-pill ${cfg.cls}`}><span className="status-dot" />{cfg.label}</span>
              {status === 'VERIFIED' && <ShieldCheck size={16} color="#095C46" />}
            </div>

            {status === 'VERIFIED' ? (
              <p style={{ fontSize: 14, color: '#374151' }}>
                You're verified — thanks! Your legal name and ID are on file with our team.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Legal name</label>
                  <input
                    className="input" required disabled={!canEdit}
                    value={legalName} onChange={e => setLegalName(e.target.value)}
                    placeholder="As it appears on your ID"
                  />
                </div>
                <div className="form-group">
                  <label>ID document type</label>
                  <select
                    className="input" disabled={!canEdit}
                    value={idDocumentType} onChange={e => setIdDocumentType(e.target.value as IdDocumentType)}
                  >
                    <option value="NATIONAL_ID">National ID</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVERS_LICENSE">Driver's License</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ID document photo</label>
                  <div
                    onClick={() => canEdit && !uploading && fileInputRef.current?.click()}
                    className="surface-muted"
                    style={{
                      height: 180, borderRadius: 12, cursor: canEdit && !uploading ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden', border: '1.5px dashed #D1D5DB',
                    }}
                  >
                    {idDocumentUrl ? (
                      <>
                        <img src={idDocumentUrl} alt="ID document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {canEdit && (
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setIdDocumentUrl('') }}
                            style={{
                              position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%',
                              background: 'rgba(17,24,39,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            aria-label="Remove photo"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </>
                    ) : uploading ? (
                      <span className="spinner spinner-dark" />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                        <Upload size={22} style={{ marginBottom: 6 }} />
                        <p style={{ fontSize: 13, margin: 0 }}>Click to upload a photo/scan of your ID</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef} type="file" accept="image/*" hidden
                    onChange={e => handleFile(e.target.files?.[0])}
                  />
                </div>

                {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
                {success && <p style={{ color: '#065F46', fontSize: 13, marginBottom: 12 }}>Submitted — we'll review it shortly.</p>}

                {canEdit && (
                  <button type="submit" className="btn btn-primary btn-md" disabled={submitting || uploading || !idDocumentUrl}>
                    {submitting ? <span className="spinner" /> : status === 'REJECTED' ? 'Resubmit' : 'Submit for review'}
                  </button>
                )}
                {status === 'PENDING' && (
                  <p style={{ fontSize: 13, color: '#6B7280' }}>Your submission is under review.</p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
