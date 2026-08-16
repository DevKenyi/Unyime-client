import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { uploadImage } from '../utils/cloudinaryUpload'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  height?: number
}

export default function ImageUploadField({ value, onChange, label, height = 160 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="surface-muted"
        style={{
          height, borderRadius: 12, cursor: uploading ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', border: '1.5px dashed #D1D5DB',
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              style={{
                position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(17,24,39,0.6)', color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </>
        ) : uploading ? (
          <span className="spinner spinner-dark" />
        ) : (
          <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
            <Upload size={22} style={{ marginBottom: 6 }} />
            <p style={{ fontSize: 13, margin: 0 }}>Click to upload</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" hidden
        onChange={e => handleFile(e.target.files?.[0])}
      />
      {error && <p style={{ color: '#DC2626', fontSize: 12.5, marginTop: 6 }}>{error}</p>}
    </div>
  )
}
