export type Role = 'ADMIN' | 'HOST' | 'GUEST'

export interface AuthUser {
  token: string
  email: string
  role: Role
}

// ── Property ──────────────────────────────────────────────────────────────

export type PropertyStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'HOTEL' | 'ROOM'
export type Country = 'NIGERIA' | 'SOUTH_AFRICA'

export interface PropertyPhoto {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export interface Property {
  id: string
  ownerId: string
  title: string
  slug: string
  description: string | null
  propertyType: PropertyType
  country: Country
  currency: string
  city: string
  address: string | null
  pricePerNight: number
  cleaningFee: number | null
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  minNights: number
  houseRules: string | null
  amenities: string[]
  coverImageUrl: string | null
  isActive: boolean
  status: PropertyStatus
  createdAt: string
  photos: PropertyPhoto[] | null
  averageRating: number | null
  reviewCount: number
}

export interface UnavailableDateRange {
  startDate: string
  endDate: string
  source: 'BOOKED' | 'BLOCKED'
}

export interface PropertyAvailability {
  unavailableDates: UnavailableDateRange[]
}

export interface BlockedDate {
  id: string
  startDate: string
  endDate: string
  reason: string | null
}

// ── Booking ───────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXPIRED'

export type RefundStatus = 'NONE' | 'PENDING' | 'PROCESSED'

export interface Booking {
  id: string
  propertyId: string
  propertyTitle: string
  guestName: string
  guestPhone: string
  checkInDate: string
  checkOutDate: string
  nights: number
  guestCount: number
  pricePerNightSnapshot: number
  cleaningFee: number
  subtotal: number
  serviceCharge: number
  total: number
  currency: string
  paymentReference: string
  status: BookingStatus
  createdAt: string
  paidAt: string | null
  refundStatus: RefundStatus
  refundedAt: string | null
  /** Only set while status is PENDING_PAYMENT — when the payment hold expires. */
  expiresAt: string | null
}

export interface CreateBookingResult {
  bookingId: string
  paymentReference: string
}

// ── Reviews ───────────────────────────────────────────────────────────────

export interface Review {
  id: string
  propertyId: string
  guestName: string
  rating: number
  cleanlinessRating: number | null
  locationRating: number | null
  accuracyRating: number | null
  communicationRating: number | null
  comment: string | null
  hostResponse: string | null
  createdAt: string
}

// ── Host earnings / payouts ─────────────────────────────────────────────

export interface HostEarningsSummary {
  totalEarnings: number
  totalPaidOut: number
  pendingPayoutAmount: number
  availableBalance: number
  currency: string
}

export interface EarningsTransaction {
  bookingId: string
  propertyTitle: string
  amount: number
  currency: string
  status: BookingStatus
  date: string
}

export type PayoutStatus = 'PENDING' | 'PAID'

export interface Payout {
  id: string
  amount: number
  status: PayoutStatus
  requestedAt: string
  paidAt: string | null
}

// ── KYC ───────────────────────────────────────────────────────────────────

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type IdDocumentType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE'

export interface KycStatusInfo {
  hostId: string
  legalName: string | null
  idDocumentType: IdDocumentType | null
  idDocumentUrl: string | null
  status: KycStatus
  submittedAt: string | null
  verifiedAt: string | null
}

// ── Admin ─────────────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalUsers: number
  totalHosts: number
  totalGuests: number
  totalProperties: number
  activeBookings: number
  /** Keyed by currency code (e.g. "NGN", "ZAR") — can't be summed across currencies. */
  revenueByCurrency: Record<string, number>
  platformFeesByCurrency: Record<string, number>
  pendingPayoutAmount: number
  cancellations: number
}

export interface AdminUser {
  id: string
  email: string
  role: Role
  enabled: boolean
  createdAt: string
}
