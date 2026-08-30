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
  videoUrl: string | null
  isActive: boolean
  status: PropertyStatus
  /** Whether the unit is physically ready right now — separate from the approval status above. */
  operationalStatus: PropertyOperationalStatus
  createdAt: string
  photos: PropertyPhoto[] | null
  averageRating: number | null
  reviewCount: number
}

export type PropertyOperationalStatus = 'AVAILABLE' | 'CLEANING' | 'READY' | 'MAINTENANCE'

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
  | 'CHECKED_OUT'
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
  guestEmail: string
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
  checkedOutAt: string | null
  refundStatus: RefundStatus
  refundedAt: string | null
  /** Only set while status is PENDING_PAYMENT — when the payment hold expires. */
  expiresAt: string | null
  /** Compliance audit snapshot, captured at confirmation time — null until then. */
  hostVerifiedAtBooking: boolean | null
  guestVerifiedAtBooking: boolean | null
  hostTermsVersionAccepted: string | null
  guestTermsVersionAccepted: string | null
  hostTermsAcceptedAt: string | null
  guestTermsAcceptedAt: string | null
  disputeStatus: DisputeStatus
  disputeReason: string | null
  disputeOpenedAt: string | null
  disputeResolvedAt: string | null
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

export type PayoutStatus =
  | 'PENDING'
  | 'ELIGIBLE'
  | 'PROCESSING'
  | 'PAID'
  | 'ON_HOLD'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'FAILED'

export interface Payout {
  id: string
  bookingId: string | null
  propertyTitle: string | null
  amount: number
  currency: string
  status: PayoutStatus
  requestedAt: string
  eligibleAt: string | null
  processedAt: string | null
  paidAt: string | null
  flutterwaveTransferId: string | null
  flutterwaveReference: string | null
  failureReason: string | null
  holdReason: string | null
}

export type DisputeStatus = 'NONE' | 'OPEN' | 'RESOLVED'

export interface AdminPayout {
  payoutId: string
  bookingId: string | null
  propertyTitle: string | null
  guestName: string | null
  hostEmail: string
  grossAmount: number | null
  platformCommission: number | null
  hostAmount: number
  currency: string
  bookingStatus: BookingStatus | null
  payoutStatus: PayoutStatus
  checkInDate: string | null
  checkOutDate: string | null
  checkedInAt: string | null
  checkedOutAt: string | null
  eligibleAt: string | null
  payoutDelayHours: number
  disputeStatus: DisputeStatus | null
  paymentReference: string | null
  flutterwaveTransferId: string | null
  flutterwaveReference: string | null
  failureReason: string | null
  paymentVerified: boolean
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
  bankCountry: Country | null
  bankCode: string | null
  bankName: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
}

export interface BankOption {
  code: string
  name: string
}

export interface GuestKycStatusInfo {
  guestId: string
  legalName: string | null
  idDocumentType: IdDocumentType | null
  idDocumentUrl: string | null
  status: KycStatus
  submittedAt: string | null
  verifiedAt: string | null
}

// ── Notifications ────────────────────────────────────────────────────────

export type NotificationType =
  | 'NEW_BOOKING'
  | 'GUEST_CHECKED_IN'
  | 'GUEST_CHECKED_OUT'
  | 'PAYOUT_ELIGIBLE'
  | 'PAYOUT_PAID'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'PROPERTY_PENDING_REVIEW'
  | 'HOST_KYC_PENDING'
  | 'TRANSFER_FAILED'
  | 'UNVERIFIED_PAYOUT_ESCALATED'
  | 'NEW_USER_REGISTERED'
  | 'DISPUTE_OPENED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string | null
  link: string | null
  read: boolean
  createdAt: string
}

// ── Terms & Conditions ──────────────────────────────────────────────────────

export interface TermsStatus {
  currentVersion: string
  accepted: boolean
  acceptedAt: string | null
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

// ── Cleaning ─────────────────────────────────────────────────────────────

export type CleaningTaskStatus = 'PENDING' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
export type CleaningTaskType = 'TURNOVER' | 'STAY'

export interface Cleaner {
  id: string
  name: string
  phone: string | null
  active: boolean
}

export interface CleaningTask {
  id: string
  propertyId: string
  propertyTitle: string
  bookingId: string | null
  guestName: string | null
  checkedOutAt: string | null
  cleanerId: string | null
  cleanerName: string | null
  type: CleaningTaskType
  status: CleaningTaskStatus
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
  startedAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
}

// ── Stay cleaning (guest-requested, during an active stay) ────────────────

export interface CleaningSettings {
  stayCleaningPrice: number | null
  estimatedDurationMinutes: number
  enabledWindows: string[]
  allowGuestRequestedCleaning: boolean
}

export type StayCleaningRequestStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED'

export interface StayCleaningRequest {
  id: string
  bookingId: string
  requestedDate: string
  timeWindow: string
  price: number
  currency: string
  status: StayCleaningRequestStatus
  paymentReference: string
  createdAt: string
}

export interface StayCleaningOptions {
  available: boolean
  price: number | null
  currency: string
  windows: string[]
  minDate: string
  maxDate: string
  requests: StayCleaningRequest[]
}
