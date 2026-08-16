import type { Country, PropertyType } from '../../../types'

export interface WizardPhoto {
  /** null until this photo has been persisted to the backend. */
  id: string | null
  url: string
  caption: string
}

export interface WizardState {
  title: string
  propertyType: PropertyType
  country: Country
  description: string
  city: string
  address: string
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  amenities: string[]
  photos: WizardPhoto[]
  pricePerNight: string
  cleaningFee: string
  minNights: string
  houseRules: string
}

export const EMPTY_WIZARD_STATE: WizardState = {
  title: '',
  propertyType: 'APARTMENT',
  country: 'NIGERIA',
  description: '',
  city: '',
  address: '',
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [],
  photos: [],
  pricePerNight: '',
  cleaningFee: '',
  minNights: '1',
  houseRules: '',
}

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'ROOM', label: 'Room' },
]

export const COUNTRY_OPTIONS: { value: Country; label: string; flag: string }[] = [
  { value: 'NIGERIA', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'SOUTH_AFRICA', label: 'South Africa', flag: '🇿🇦' },
]

export const CURRENCY_BY_COUNTRY: Record<Country, string> = {
  NIGERIA: 'NGN',
  SOUTH_AFRICA: 'ZAR',
}

export const AMENITY_OPTIONS = [
  'Wi-Fi', 'Parking', 'Pool', 'Generator', 'Air conditioning',
  'Kitchen', 'TV', 'Washing machine', 'Free breakfast', 'Security',
  'Elevator', 'Workspace',
]

export interface StepProps {
  state: WizardState
  update: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void
}
