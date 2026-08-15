import { useMemo, useState } from 'react'

interface Point { date: string; value: number }

interface Props {
  data: Point[]
  color?: string
  formatValue?: (v: number) => string
  height?: number
}

const WIDTH = 600

export default function TrendChart({ data, color = '#095C46', formatValue = v => v.toLocaleString(), height = 180 }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { points, maxValue, ticks } = useMemo(() => {
    const max = Math.max(1, ...data.map(d => d.value))
    const padTop = 24
    const padBottom = 24
    const usableHeight = height - padTop - padBottom
    const step = data.length > 1 ? WIDTH / (data.length - 1) : 0
    const pts = data.map((d, i) => ({
      x: data.length > 1 ? i * step : WIDTH / 2,
      y: padTop + usableHeight - (d.value / max) * usableHeight,
      ...d,
    }))
    const tickCount = 3
    const tickVals = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((max / tickCount) * i))
    return { points: pts, maxValue: max, ticks: tickVals }
  }, [data, height])

  if (data.length === 0) {
    return <p style={{ fontSize: 13.5, color: '#6B7280' }}>No data yet.</p>
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - 24} L ${points[0].x} ${height - 24} Z`

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX)
      if (dist < nearestDist) { nearestDist = dist; nearest = i }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} width="100%" height={height} style={{ display: 'block', overflow: 'visible' }}>
        {/* Gridlines */}
        {ticks.map((t, i) => {
          const y = 24 + (height - 48) - (t / maxValue) * (height - 48)
          return (
            <g key={i}>
              <line x1={0} x2={WIDTH} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={0} y={y - 4} fontSize={10} fill="#9CA3AF">{formatValue(t)}</text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* End marker with surface ring */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={5} fill={color} stroke="#fff" strokeWidth={2} />

        {/* Crosshair + hover marker */}
        {hovered && (
          <>
            <line x1={hovered.x} x2={hovered.x} y1={24} y2={height - 24} stroke="#D1D5DB" strokeWidth={1} />
            <circle cx={hovered.x} cy={hovered.y} r={5} fill={color} stroke="#fff" strokeWidth={2} />
          </>
        )}

        {/* Hit layer */}
        <rect
          x={0} y={0} width={WIDTH} height={height} fill="transparent"
          onMouseMove={handleMove} onMouseLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          left: `${(hovered.x / WIDTH) * 100}%`, top: 0,
          transform: `translateX(${hovered.x > WIDTH * 0.8 ? '-100%' : '0'})`,
          background: '#111827', color: '#fff', borderRadius: 8, padding: '6px 10px',
          fontSize: 12, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontWeight: 700 }}>{formatValue(hovered.value)}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
            {new Date(hovered.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  )
}
