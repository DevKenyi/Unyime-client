import type { UnavailableDateRange } from '../types'

/**
 * A half-open occupancy interval: `to` is the checkout day itself, which is free — it's the
 * first date NOT occupied by the stay, matching the backend's back-to-back-booking semantics
 * (a booking's checkOutDate can be another guest's checkInDate on the same day).
 */
export interface UnavailableRange {
  from: Date
  to: Date
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Parses the raw API ranges (checkIn/checkOut ISO date strings) into local Dates, sorted. */
export function parseUnavailableRanges(raw: UnavailableDateRange[]): UnavailableRange[] {
  return raw
    .map(r => ({ from: new Date(r.startDate + 'T00:00:00'), to: new Date(r.endDate + 'T00:00:00') }))
    .sort((a, b) => a.from.getTime() - b.from.getTime())
}

/** Whether `date` falls on a night actually occupied by an existing booking/hold/block. */
export function isDateAvailable(date: Date, ranges: UnavailableRange[]): boolean {
  const t = date.getTime()
  return !ranges.some(r => t >= r.from.getTime() && t < r.to.getTime())
}

/** Whether every night in [checkIn, checkOut) is free — the same overlap rule the backend enforces. */
export function isRangeAvailable(checkIn: Date, checkOut: Date, ranges: UnavailableRange[]): boolean {
  return !ranges.some(r => checkIn.getTime() < r.to.getTime() && checkOut.getTime() > r.from.getTime())
}

/**
 * The start date of the nearest occupied range strictly after `date`, or null if nothing blocks
 * the calendar beyond that point. This is the checkout boundary for a stay starting on `date`:
 * the guest may check out ON this date (checkout is exclusive of the night it falls on) but not
 * any later, since a night at or after it is already taken.
 */
export function getFirstUnavailableNightAfter(date: Date, ranges: UnavailableRange[]): Date | null {
  const upcoming = ranges
    .map(r => r.from)
    .filter(d => d.getTime() > date.getTime())
    .sort((a, b) => a.getTime() - b.getTime())
  return upcoming[0] ?? null
}

/** The latest valid checkout date for a stay starting on `checkIn`, or null if unbounded. */
export function getLatestValidCheckout(checkIn: Date, ranges: UnavailableRange[]): Date | null {
  return getFirstUnavailableNightAfter(checkIn, ranges)
}

/**
 * Matchers for react-day-picker's `disabled` prop covering only the actually-occupied nights —
 * the checkout day of each range is deliberately excluded so it stays clickable as a fresh
 * check-in for the next guest (back-to-back bookings).
 */
export function getOccupiedNightMatchers(ranges: UnavailableRange[]): { from: Date; to: Date }[] {
  return ranges.map(r => ({ from: r.from, to: addDays(r.to, -1) }))
}
