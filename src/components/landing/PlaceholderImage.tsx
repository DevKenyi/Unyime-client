import { cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { Home, Sofa, BedDouble, Building2, Users, DoorOpen, UtensilsCrossed, Waves } from 'lucide-react'

export type ImageVariant =
  | 'apartment-living' | 'apartment-bedroom' | 'apartment-exterior' | 'apartment-kitchen'
  | 'skyline-abuja' | 'skyline-lagos'
  | 'lifestyle-couple' | 'lifestyle-friends' | 'host-welcome' | 'pool'

const VARIANTS: Record<ImageVariant, { gradient: string; icon: ReactNode; skyline?: boolean }> = {
  'apartment-living':   { gradient: 'linear-gradient(135deg, #EFE0C9 0%, #E0B48C 55%, #C97B4A 100%)', icon: <Sofa /> },
  'apartment-bedroom':  { gradient: 'linear-gradient(135deg, #EAF3EE 0%, #BFDCCB 55%, #7FAE95 100%)', icon: <BedDouble /> },
  'apartment-exterior': { gradient: 'linear-gradient(135deg, #133D30 0%, #095C46 55%, #128666 100%)', icon: <Building2 />, skyline: true },
  'apartment-kitchen':  { gradient: 'linear-gradient(135deg, #F3EEE3 0%, #E3D3B8 55%, #C6A472 100%)', icon: <UtensilsCrossed /> },
  'skyline-abuja':      { gradient: 'linear-gradient(160deg, #1B2B27 0%, #0F3D30 55%, #095C46 100%)', icon: <Building2 />, skyline: true },
  'skyline-lagos':      { gradient: 'linear-gradient(160deg, #221C2E 0%, #3B2A46 55%, #7A4E6B 100%)', icon: <Waves />, skyline: true },
  'lifestyle-couple':   { gradient: 'linear-gradient(135deg, #F7E9DE 0%, #EFC9B4 55%, #DE9C82 100%)', icon: <Users /> },
  'lifestyle-friends':  { gradient: 'linear-gradient(135deg, #F3E7D8 0%, #E3B98F 55%, #C97B4A 100%)', icon: <Users /> },
  'host-welcome':       { gradient: 'linear-gradient(135deg, #E8F5F1 0%, #9AC7B4 55%, #095C46 100%)', icon: <DoorOpen /> },
  'pool':               { gradient: 'linear-gradient(135deg, #DCEFEC 0%, #8FC4C2 55%, #2E7A78 100%)', icon: <Home /> },
}

interface Props {
  variant: ImageVariant
  src?: string | null
  alt?: string
  className?: string
  style?: CSSProperties
  iconSize?: number
  children?: ReactNode
}

/** Editorial gradient placeholder standing in for real property photography — pass `src` to swap in a real photo with no layout change. */
export default function PlaceholderImage({ variant, src, alt = '', className, style, iconSize = 28, children }: Props) {
  const cfg = VARIANTS[variant]

  if (src) {
    return (
      <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {children}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative', overflow: 'hidden', background: cfg.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', ...style,
      }}
    >
      {/* subtle grain */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, mixBlendMode: 'overlay' }}>
        <filter id={`grain-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${variant})`} />
      </svg>

      {cfg.skyline && (
        <svg
          viewBox="0 0 400 100" preserveAspectRatio="none"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '42%', opacity: 0.28 }}
        >
          {[18, 55, 92, 130, 168, 205, 245, 282, 320, 358].map((x, i) => (
            <rect key={i} x={x} y={100 - (30 + (i % 4) * 16)} width={26} height={30 + (i % 4) * 16} fill="#000" />
          ))}
        </svg>
      )}

      <div style={{
        color: 'rgba(255,255,255,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        {isValidElement(cfg.icon) ? cloneElement(cfg.icon as ReactElement<{ size?: number }>, { size: iconSize }) : cfg.icon}
      </div>

      {children}
    </div>
  )
}
