import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Country } from '../types'

interface CountryContextValue {
  country: Country
  setCountry: (country: Country) => void
  /** True while the initial IP-based detection call is in flight (first visit only). */
  detecting: boolean
}

const CountryContext = createContext<CountryContextValue | null>(null)

const STORAGE_KEY = 'unyimi_country'

/** ISO country codes we actually operate in — anything else falls back to Nigeria. */
const COUNTRY_CODE_MAP: Record<string, Country> = {
  NG: 'NIGERIA',
  ZA: 'SOUTH_AFRICA',
}

function readStoredCountry(): Country | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'NIGERIA' || stored === 'SOUTH_AFRICA' ? stored : null
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => readStoredCountry() ?? 'NIGERIA')
  const [detecting, setDetecting] = useState(() => readStoredCountry() === null)

  useEffect(() => {
    // A stored preference (from a manual switch, or a previous detection) always wins —
    // only geolocate on a visitor's very first visit.
    if (readStoredCountry() !== null) return

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const detected = COUNTRY_CODE_MAP[data.country_code]
        if (detected) setCountryState(detected)
      })
      .catch(() => { /* IP geolocation is best-effort — keep the Nigeria default on failure */ })
      .finally(() => setDetecting(false))
  }, [])

  const setCountry = (next: Country) => {
    setCountryState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <CountryContext.Provider value={{ country, setCountry, detecting }}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const ctx = useContext(CountryContext)
  if (!ctx) throw new Error('useCountry must be used within CountryProvider')
  return ctx
}
