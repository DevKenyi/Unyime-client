import { useEffect, useRef, useState } from 'react'

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Ticks every second purely for display — the countdown's source of truth is always the
 * server's expiresAt, never a locally-invented timer, and once it hits zero we re-fetch the
 * booking from the backend rather than assume it expired (the scheduled job is the real authority). */
export function useCountdown(expiresAt: string | null, onExpire: () => void) {
  const [now, setNow] = useState(() => Date.now())
  const firedRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) return
    firedRef.current = false
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const remainingMs = expiresAt ? new Date(expiresAt).getTime() - now : 0

  useEffect(() => {
    if (expiresAt && remainingMs <= 0 && !firedRef.current) {
      firedRef.current = true
      onExpire()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, expiresAt])

  return remainingMs
}
