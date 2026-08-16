import ListingPreviewCard from './ListingPreviewCard'
import type { WizardState } from './wizardTypes'

interface Props {
  state: WizardState
  isEdit: boolean
  saving: boolean
  error: string
  onEdit: () => void
  onSubmit: () => void
}

export default function StepPreview({ state, isEdit, saving, error, onEdit, onSubmit }: Props) {
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>This is what guests will see</h2>
      <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
        {isEdit
          ? 'Review your changes before saving.'
          : "New listings need admin approval before they appear in search — we'll notify you once it's live."}
      </p>

      <div style={{ maxWidth: 360 }}>
        <ListingPreviewCard state={state} />
      </div>

      {state.description && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>About this place</h3>
          <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{state.description}</p>
        </div>
      )}

      {state.amenities.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>Amenities</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {state.amenities.map(a => (
              <span key={a} className="surface-muted" style={{ padding: '5px 12px', fontSize: 12.5, color: '#374151' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 16 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button type="button" className="btn btn-secondary btn-md" onClick={onEdit} disabled={saving}>
          ← Edit listing
        </button>
        <button type="button" className="btn btn-primary btn-md" onClick={onSubmit} disabled={saving}>
          {saving ? <span className="spinner" /> : isEdit ? 'Save changes' : 'Submit for approval →'}
        </button>
      </div>
    </div>
  )
}
