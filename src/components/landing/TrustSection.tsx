import { ShieldCheck, Home, CreditCard, MessageSquareHeart, Tag, Headset } from 'lucide-react'
import Reveal from './Reveal'

const ITEMS = [
  { icon: <ShieldCheck size={18} />, label: 'Verified hosts' },
  { icon: <Home size={18} />, label: 'Verified properties' },
  { icon: <CreditCard size={18} />, label: 'Secure payments' },
  { icon: <MessageSquareHeart size={18} />, label: 'Real guest reviews' },
  { icon: <Tag size={18} />, label: 'Transparent pricing' },
  { icon: <Headset size={18} />, label: 'Customer support' },
]

export default function TrustSection() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 44px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, letterSpacing: '-0.6px', color: '#111827', margin: '0 0 10px' }}>
            Stay with confidence.
          </h2>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid-3" style={{ gap: '28px 20px' }}>
          {ITEMS.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: '#E8F5F1', color: '#095C46',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
