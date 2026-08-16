import { CURRENCY_BY_COUNTRY, type StepProps } from './wizardTypes'
import { currencySymbol, formatMoney } from '../../../utils/currency'

/** Mirrors PricingService.SERVICE_CHARGE_RATE on the backend — guests pay this on top, hosts keep the full nightly price. */
const SERVICE_CHARGE_RATE = 0.10

export default function StepPricing({ state, update }: StepProps) {
  const price = Number(state.pricePerNight) || 0
  const guestPays = Math.round(price * (1 + SERVICE_CHARGE_RATE))
  const currency = CURRENCY_BY_COUNTRY[state.country]

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Set your price</h2>
      <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px' }}>
        You can change this any time.
      </p>

      <div className="form-row-2" style={{ display: 'grid', gap: 16 }}>
        <div className="form-group">
          <label>Price per night ({currencySymbol(currency)})</label>
          <input
            className="input" type="number" min={0.01} step="0.01"
            value={state.pricePerNight} onChange={e => update('pricePerNight', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Cleaning fee ({currencySymbol(currency)}, optional)</label>
          <input
            className="input" type="number" min={0} step="0.01"
            value={state.cleaningFee} onChange={e => update('cleaningFee', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-2" style={{ display: 'grid', gap: 16 }}>
        <div className="form-group">
          <label>Minimum stay (nights)</label>
          <input
            className="input" type="number" min={1}
            value={state.minNights} onChange={e => update('minNights', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>House rules (optional)</label>
        <textarea
          className="input" rows={3} placeholder="No smoking, no parties, check-in after 2pm..."
          value={state.houseRules} onChange={e => update('houseRules', e.target.value)}
        />
      </div>

      {price > 0 && (
        <div className="surface-muted" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
          <div>
            <p style={{ fontSize: 11.5, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 4px' }}>Your guest pays</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>{formatMoney(guestPays, currency)}<span style={{ fontSize: 12.5, fontWeight: 500, color: '#6B7280' }}> /night</span></p>
          </div>
          <div>
            <p style={{ fontSize: 11.5, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, margin: '0 0 4px' }}>You earn</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#095C46', margin: 0 }}>{formatMoney(price, currency)}<span style={{ fontSize: 12.5, fontWeight: 500, color: '#6B7280' }}> /night</span></p>
          </div>
        </div>
      )}
      {price > 0 && (
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: '8px 0 0' }}>
          Unyimi adds a 10% service fee for the guest — you keep 100% of your nightly price{state.cleaningFee ? ' plus your cleaning fee' : ''}.
        </p>
      )}
    </div>
  )
}
