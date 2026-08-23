// Keep in sync with the backend's terms.current-version (application.properties) — bumping one
// without the other means guests/hosts would be accepting text that doesn't match what the
// acceptance record actually points to.
export const TERMS_VERSION = '2026-08-23-v2'

const h2Style = { fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '22px 0 6px' } as const

/** The actual policy text, shared between the standalone /terms page and the inline
 * scroll-to-accept box in the booking wizard so they can never drift out of sync. */
export default function TermsContent() {
  return (
    <div style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151' }}>
      <p>
        These Terms & Conditions govern your use of Unyimi as a host or a guest. By accepting
        them, you agree to the terms below. Please read them carefully.
      </p>

      <h2 style={h2Style}>1. Identity & Account Information</h2>
      <p>
        Hosts are required to verify their identity with a valid form of government-issued
        identification before listing a property. Guests are required to submit identity
        verification (a legal name and a valid form of government-issued identification) before
        completing payment on a booking. Any identity information collected is used solely for
        <strong> identity verification, safety, fraud prevention, dispute resolution, and legal
        compliance</strong> — not to track you. It is stored securely and handled in accordance
        with applicable data-protection and privacy laws (including Nigeria's NDPR and South
        Africa's POPIA, where applicable).
      </p>

      <h2 style={h2Style}>2. Your Responsibilities</h2>
      <p>
        You are responsible for your own conduct while using Unyimi, including your behaviour
        during a stay and your compliance with the rules of the property you book or host. You
        agree to comply with all applicable laws.
      </p>

      <h2 style={h2Style}>3. Cooperation with Authorities</h2>
      <p>
        Unyimi may cooperate with law enforcement or other relevant authorities where legally
        required. In cases involving theft, fraud, property damage, disputes, or other legal
        issues, verified user information may be disclosed to the appropriate authorities in
        accordance with applicable law — never disclosed casually or without legal basis.
      </p>

      <h2 style={h2Style}>4. Record Retention</h2>
      <p>
        Unyimi may retain relevant booking, transaction, and identity-verification records where
        legally permitted or required, including to assist with legitimate investigations,
        disputes, fraud prevention, or legal proceedings.
      </p>

      <h2 style={h2Style}>5. Booking Confirmation</h2>
      <p>
        A booking is not confirmed until both the host and the guest have accepted the current
        version of these Terms & Conditions. Unyimi records the version accepted and the date
        and time of acceptance for every confirmed booking.
      </p>

      <h2 style={h2Style}>6. Changes to These Terms</h2>
      <p>
        These terms may be updated from time to time. If they change in a material way, you will
        be asked to review and accept the new version before your next payment goes through.
      </p>
    </div>
  )
}
