import PropertyCard from '../PropertyCard'
import type { Property } from '../../types'

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  if (!Array.isArray(properties)) return null
  return (
    <div className="grid-3">
      {properties.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  )
}
