import Reveal from './Reveal'

const STATS = [
  { value: '1,000+', label: 'Guests' },
  { value: '250+', label: 'Verified stays' },
  { value: '4.9/5', label: 'Average guest rating' },
  { value: 'Growing', label: 'Across Nigeria' },
]

export default function Stats() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 0' }}>
      <Reveal>
        <div className="surface-card" style={{ padding: '40px 32px', background: '#FBFAF7' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', textAlign: 'center', margin: '0 0 32px', letterSpacing: '-0.3px' }}>
            Built for better stays
          </h2>
          <div className="grid-4">
            {STATS.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 800, color: '#095C46', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0, fontWeight: 500 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
