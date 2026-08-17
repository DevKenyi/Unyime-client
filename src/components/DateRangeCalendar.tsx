import { DayPicker, type DateRange } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface Props {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  /** Booked/blocked/held date ranges from the property's real availability — never hardcoded. */
  unavailableRanges: { from: Date; to: Date }[]
}

/**
 * A fully custom skin over react-day-picker — none of the library's own CSS is loaded, every
 * visual state below (day cells, range highlighting, nav, weekday header) is Unyimi's own styling
 * driven purely through the `classNames` map, so nothing here falls back to the library's default look.
 */
export default function DateRangeCalendar({ selected, onSelect, unavailableRanges }: Props) {
  const isDesktop = useMediaQuery('(min-width: 860px)')

  return (
    <DayPicker
      mode="range"
      numberOfMonths={isDesktop ? 2 : 1}
      selected={selected}
      onSelect={onSelect}
      disabled={[{ before: new Date() }, ...unavailableRanges]}
      animate
      classNames={{
        root: 'uy-cal',
        months: 'uy-cal-months',
        month: 'uy-cal-month',
        month_caption: 'uy-cal-caption',
        caption_label: 'uy-cal-caption-label',
        nav: 'uy-cal-nav',
        button_previous: 'uy-cal-nav-btn',
        button_next: 'uy-cal-nav-btn',
        month_grid: 'uy-cal-grid',
        weekdays: 'uy-cal-weekdays',
        weekday: 'uy-cal-weekday',
        weeks: 'uy-cal-weeks',
        week: 'uy-cal-week',
        day: 'uy-cal-day',
        day_button: 'uy-cal-day-btn',
        today: 'uy-cal-today',
        selected: 'uy-cal-selected',
        range_start: 'uy-cal-range-start',
        range_end: 'uy-cal-range-end',
        range_middle: 'uy-cal-range-middle',
        disabled: 'uy-cal-disabled',
        outside: 'uy-cal-outside',
        hidden: 'uy-cal-hidden',
      }}
      components={{
        Chevron: ({ orientation, className, style }) => (
          <span className={className} style={style}>
            {orientation === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </span>
        ),
      }}
    />
  )
}
