import { useMemo } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import type { Matcher } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { getLatestValidCheckout, getOccupiedNightMatchers, type UnavailableRange } from '../utils/availability'

interface Props {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  /** Booked/held/blocked date ranges from the property's real availability — never hardcoded. */
  unavailableRanges: UnavailableRange[]
}

/**
 * A fully custom skin over react-day-picker — none of the library's own CSS is loaded, every
 * visual state below (day cells, range highlighting, nav, weekday header) is Unyimi's own styling
 * driven purely through the `classNames` map, so nothing here falls back to the library's default look.
 *
 * Once a check-in date is picked (selected.from set, selected.to not yet), every date beyond the
 * next occupied night is disabled too — not just the occupied nights themselves. Native `disabled`
 * buttons can't be clicked, so the guest can never construct a range that crosses a booked/held
 * period, and the range highlight can never span invalid dates.
 */
export default function DateRangeCalendar({ selected, onSelect, unavailableRanges }: Props) {
  const isDesktop = useMediaQuery('(min-width: 860px)')

  const disabled = useMemo(() => {
    const matchers: Matcher[] = [{ before: new Date() }, ...getOccupiedNightMatchers(unavailableRanges)]
    if (selected?.from && !selected?.to) {
      const boundary = getLatestValidCheckout(selected.from, unavailableRanges)
      if (boundary) matchers.push({ after: boundary })
    }
    return matchers
  }, [selected, unavailableRanges])

  return (
    <DayPicker
      mode="range"
      numberOfMonths={isDesktop ? 2 : 1}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
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
