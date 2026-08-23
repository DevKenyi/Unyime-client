import { useRef, useState } from 'react'
import { ImagePlus, Video, X } from 'lucide-react'
import { uploadImage, uploadVideo } from '../../../utils/cloudinaryUpload'
import type { StepProps, WizardPhoto } from './wizardTypes'

export default function StepPhotos({ state, update }: StepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const dragIndex = useRef<number | null>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoError, setVideoError] = useState('')

  const handleVideoFile = async (file: File | undefined) => {
    if (!file) return
    setVideoError('')
    setUploadingVideo(true)
    try {
      const url = await uploadVideo(file)
      update('videoUrl', url)
    } catch (err: any) {
      setVideoError(err.message ?? 'Could not upload this video.')
    } finally {
      setUploadingVideo(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)
    try {
      const uploads = await Promise.all(Array.from(files).map(file => uploadImage(file)))
      const newPhotos: WizardPhoto[] = uploads.map(url => ({ id: null, url, caption: '' }))
      update('photos', [...state.photos, ...newPhotos])
    } catch (err: any) {
      setError(err.message ?? 'Could not upload one of these photos.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeAt = (index: number) => {
    update('photos', state.photos.filter((_, i) => i !== index))
  }

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const next = [...state.photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    update('photos', next)
  }

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Show guests what makes your place special</h2>
      <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 16px' }}>
        Drag to reorder — your first photo becomes the cover.
      </p>

      <div className="surface-muted" style={{ padding: '10px 14px', marginBottom: 16, fontSize: 12.5, color: '#374151' }}>
        <strong>Great photos get more bookings.</strong> Add at least 5 clear photos of your living room, bedroom, bathroom and exterior.
      </div>

      <div className="photo-grid">
        {state.photos.map((photo, index) => (
          <div
            key={photo.id ?? photo.url}
            className="photo-tile"
            draggable
            onDragStart={() => { dragIndex.current = index }}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIndex.current !== null) reorder(dragIndex.current, index); dragIndex.current = null }}
          >
            <img src={photo.url} alt="" />
            {index === 0 && <span className="photo-tile-cover-badge">Cover</span>}
            <button type="button" className="photo-tile-remove" onClick={() => removeAt(index)} aria-label="Remove photo">
              <X size={13} />
            </button>
          </div>
        ))}

        <div className="photo-upload-tile" onClick={() => !uploading && inputRef.current?.click()}>
          {uploading ? <span className="spinner spinner-dark" /> : (
            <>
              <ImagePlus size={22} />
              <span>Add photos</span>
            </>
          )}
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {error && <p style={{ color: '#DC2626', fontSize: 12.5, marginTop: 10 }}>{error}</p>}

      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '28px 0 4px' }}>Walkthrough video (optional)</h2>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
        A short video tour helps guests picture the space before booking.
      </p>

      {state.videoUrl ? (
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <video src={state.videoUrl} controls style={{ width: '100%', borderRadius: 12, display: 'block' }} />
          <button
            type="button"
            onClick={() => update('videoUrl', '')}
            className="photo-tile-remove"
            style={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="Remove video"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="photo-upload-tile" style={{ width: 160, height: 120 }} onClick={() => !uploadingVideo && videoInputRef.current?.click()}>
          {uploadingVideo ? <span className="spinner spinner-dark" /> : (
            <>
              <Video size={22} />
              <span>Add video</span>
            </>
          )}
        </div>
      )}
      <input
        ref={videoInputRef} type="file" accept="video/*" hidden
        onChange={e => handleVideoFile(e.target.files?.[0])}
      />
      {videoError && <p style={{ color: '#DC2626', fontSize: 12.5, marginTop: 10 }}>{videoError}</p>}
    </div>
  )
}
