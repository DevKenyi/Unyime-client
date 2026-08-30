import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  imageUrl: string
}

interface Props {
  photos: Photo[]
}

export default function PhotoCarousel({ photos }: Props) {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    setActive(index)
  }

  const handleScroll = () => {
    const el = trackRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActive(index)
  }

  return (
    <div className="photo-carousel">
      <div className="photo-carousel-track" ref={trackRef} onScroll={handleScroll}>
        {photos.map(photo => (
          <div key={photo.id} className="photo-carousel-slide" style={{ backgroundImage: `url(${photo.imageUrl})` }} />
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button" className="photo-carousel-arrow prev" aria-label="Previous photo"
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button" className="photo-carousel-arrow next" aria-label="Next photo"
            onClick={() => scrollToIndex(Math.min(photos.length - 1, active + 1))}
          >
            <ChevronRight size={17} />
          </button>

          <div className="photo-carousel-dots">
            {photos.map((photo, i) => (
              <button
                key={photo.id} type="button" aria-label={`Go to photo ${i + 1}`}
                className={`photo-carousel-dot${i === active ? ' is-active' : ''}`}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
