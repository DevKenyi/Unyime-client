/** Buckets items into a fixed-length daily series (last `days` days, zero-filled), for even x-spacing in a trend chart. */
export function groupSumByDay<T>(
  items: T[],
  getDate: (item: T) => string,
  getValue: (item: T) => number,
  days = 14
): { date: string; value: number }[] {
  const buckets = new Map<string, number>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.set(d.toISOString().split('T')[0], 0)
  }
  for (const item of items) {
    const day = getDate(item).split('T')[0]
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + getValue(item))
    }
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }))
}
