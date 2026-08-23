import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Upload, X, CheckCircle2, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'
import { uploadImage } from '../utils/cloudinaryUpload'
import { TERMS_VERSION } from './TermsPage'
import type { GuestKycStatusInfo, IdDocumentType, TermsStatus } from '../types'

const STATUS_COPY: Record<string, { label: string; cls: string }> = {
  UNVERIFIED: { label: 'Not submitted', cls: 'status-pending' },
  PENDING:    { label: 'Under review',  cls: 'status-preparing' },
  VERIFIED:   { label: 'Verified',      cls: 'status-delivered' },
  REJECTED:   { label: 'Rejected',      cls: 'status-cancelled' },
}

export default function GuestVerifyPage() {
  const { user } = useAuth()

  const [kyc, setKyc] = useState<GuestKycStatusInfo | null>(null)
  const [terms, setTerms] = useState<TermsStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const [legalName, setLegalName] = useState('')
  const [idDocumentType, setIdDocumentType] = useState<IdDocumentType>('NATIONAL_ID')
  const [idDocumentUrl, setIdDocumentUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [kycError, setKycError] = useState('')
  const [kycSuccess, setKycSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [acceptChecked, setAcceptChecked] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [termsError, setTermsError] = useState('')

  useEffect(() => {
    if (!user || user.role !== 'GUEST') { setLoading(false); return }
    Promise.all([
      api.get<GuestKycStatusInfo>('/api/guest/kyc'),
      api.get<TermsStatus>('/api/terms/status'),
    ])
      .then(([kycRes, termsRes]) => {
        setKyc(kycRes.data)
        setTerms(termsRes.data)
        if (kycRes.data.legalName) setLegalName(kycRes.data.legalName)
        if (kycRes.data.idDocumentType) setIdDocumentType(kycRes.data.idDocumentType)
        if (kycRes.data.idDocumentUrl) setIdDocumentUrl(kycRes.data.idDocumentUrl)
      })
      .finally(() => setLoading(false))
  }, [user])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setKycError('')
    setUploading(true)
    try {
      const url = await uploadImage(file, 'kyc', '/api/guest/uploads/signature')
      setIdDocumentUrl(url)
    } catch (err: any) {
      setKycError(err.message ?? 'Could not upload this photo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmitKyc = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setKycError('')
    setKycSuccess(false)
    try {
      const { data } = await api.post<GuestKycStatusInfo>('/api/guest/kyc', { legalName, idDocumentType, idDocumentUrl })
      setKyc(data)
      setKycSuccess(true)
    } catch (err: any) {
      setKycError(err.response?.data?.error ?? 'Could not submit verification.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAcceptTerms = async () => {
    setAccepting(true)
    setTermsError('')
    try {
      const { data } = await api.post<TermsStatus>('/api/terms/accept')
      setTerms(data)
    } catch (err: any) {
      setTermsError(err.response?.data?.error ?? 'Could not record your acceptance.')
    } finally {
      setAccepting(false)
    }
  }

  if (!user || user.role !== 'GUEST') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', gap: 12, padding: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#374151', maxWidth: 360 }}>
          Please use the sign-in link from your reservation confirmation email to access identity verification.
        </p>
        <Link to="/properties" className="btn btn-secondary btn-md">Back to search</Link>
      </div>
    )
  }

  const status = kyc?.status ?? 'UNVERIFIED'
  const cfg = STATUS_COPY[status]
  const canEdit = status !== 'PENDING' && status !== 'VERIFIED'
  const bothComplete = status === 'VERIFIED' && !!terms?.accepted

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Browse stays
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Complete your verification</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>
            Required once, before your first payment on Unyimi — signed in as {user.email}.
          </p>
        </div>

        {bothComplete && (
          <div className="surface-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 12, background: '#E8F5F1' }}>
            <CheckCircle2 size={22} color="#095C46" />
            <p style={{ fontSize: 14, color: '#095C46', fontWeight: 600, margin: 0 }}>
              You're all set — go back to your booking to complete payment.
            </p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><span className="spinner spinner-dark" /></div>
        ) : (
          <>
            <div className="surface-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>1. Identity verification</h2>
                <span className={`status-pill ${cfg.cls}`}><span className="status-dot" />{cfg.label}</span>
              </div>

              {status === 'VERIFIED' ? (
                <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
                  You're verified — thanks! Your legal name and ID are on file with our team.
                </p>
              ) : (
                <form onSubmit={handleSubmitKyc}>
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

                  {kycError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{kycError}</p>}
                  {kycSuccess && <p style={{ color: '#065F46', fontSize: 13, marginBottom: 12 }}>Submitted — we'll review it shortly.</p>}

                  {canEdit && (
                    <button type="submit" className="btn btn-primary btn-md" disabled={submitting || uploading || !idDocumentUrl}>
                      {submitting ? <span className="spinner" /> : status === 'REJECTED' ? 'Resubmit' : 'Submit for review'}
                    </button>
                  )}
                  {status === 'PENDING' && (
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Your submission is under review.</p>
                  )}
                </form>
              )}
            </div>

            <div className="surface-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>2. Terms & Conditions</h2>
                {terms?.accepted && <ShieldCheck size={16} color="#095C46" />}
              </div>

              {terms?.accepted ? (
                <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>
                  You accepted version {terms.currentVersion} on {terms.acceptedAt ? new Date(terms.acceptedAt).toLocaleDateString() : ''}.
                </p>
              ) : (
                <>
                  <Link to="/terms" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#095C46', textDecoration: 'none', fontWeight: 600, marginBottom: 12 }}>
                    <FileText size={14} /> Read the Terms & Conditions (v{TERMS_VERSION})
                  </Link>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: '#374151', marginBottom: 14 }}>
                    <input type="checkbox" checked={acceptChecked} onChange={e => setAcceptChecked(e.target.checked)} style={{ marginTop: 2 }} />
                    I have read and agree to Unyimi's Terms & Conditions.
                  </label>
                  {termsError && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{termsError}</p>}
                  <button className="btn btn-primary btn-md" disabled={!acceptChecked || accepting} onClick={handleAcceptTerms}>
                    {accepting ? <span className="spinner" /> : 'Accept & continue'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
