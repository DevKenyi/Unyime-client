import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Keep in sync with the backend's terms.current-version (application.properties) — bumping one
// without the other means guests/hosts would be accepting text that doesn't match what the
// acceptance record actually points to.
export const TERMS_VERSION = '2026-08-23-v1'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F3EE' }}>
      <header style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '14px 20px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div className="surface-card" style={{ padding: '32px 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>Terms & Conditions</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 28px' }}>Version {TERMS_VERSION}</p>

          <div style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151' }}>
            <p>
              These Terms & Conditions govern your use of Unyimi as a host or a guest. By accepting
              them, you agree to the terms below. Please read them carefully.
            </p>

            <h2 style={terms.h2}>1. Identity Verification</h2>
            <p>
              To help keep everyone on Unyimi safe, both hosts and guests are required to verify
              their identity with at least one valid form of government-issued identification
              (such as a passport, driver's licence, or National Identification Number). This
              information is collected solely for <strong>identity verification, safety, fraud
              prevention, dispute resolution, and legal compliance</strong> — not to track you. It
              is stored securely and handled in accordance with applicable data-protection and
              privacy laws (including Nigeria's NDPR and South Africa's POPIA, where applicable).
            </p>

            <h2 style={terms.h2}>2. Your Responsibilities</h2>
            <p>
              You are responsible for your own conduct while using Unyimi, including your behaviour
              during a stay and your compliance with the rules of the property you book or host.
              You agree to comply with all applicable laws.
            </p>

            <h2 style={terms.h2}>3. Cooperation with Authorities</h2>
            <p>
              Unyimi may cooperate with law enforcement or other relevant authorities where legally
              required. In cases involving theft, fraud, property damage, disputes, or other legal
              issues, verified user information may be disclosed to the appropriate authorities in
              accordance with applicable law — never disclosed casually or without legal basis.
            </p>

            <h2 style={terms.h2}>4. Record Retention</h2>
            <p>
              Unyimi may retain relevant booking, transaction, and identity-verification records
              where legally permitted or required, including to assist with legitimate
              investigations, disputes, fraud prevention, or legal proceedings.
            </p>

            <h2 style={terms.h2}>5. Booking Confirmation</h2>
            <p>
              A booking is not confirmed until both the host and the guest have completed identity
              verification and accepted the current version of these Terms & Conditions. Unyimi
              records the version accepted and the date and time of acceptance for every confirmed
              booking.
            </p>

            <h2 style={terms.h2}>6. Changes to These Terms</h2>
            <p>
              These terms may be updated from time to time. If they change in a material way, you
              will be asked to review and accept the new version before your next payment goes
              through.
            </p>
          </div>

          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 28, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
            This is a draft policy document pending final legal review — it is not yet a
            substitute for advice from qualified counsel in each jurisdiction Unyimi operates in.
          </p>
        </div>
      </main>
    </div>
  )
}

const terms = {
  h2: { fontSize: 15.5, fontWeight: 700, color: '#111827', margin: '22px 0 6px' } as const,
}
