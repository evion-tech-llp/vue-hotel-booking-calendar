// Guest Calendar Types (for the booking calendar component)
export type AvailabilityStatus = 'available' | 'blocked' | 'checkout-only'

export interface DateAvailability {
  date: string
  status: AvailabilityStatus
  price?: number
  minStay?: number
  maxStay?: number
}

export interface DateRange {
  checkIn: string | null
  checkOut: string | null
}

export interface SelectionError {
  type: 'blocked-dates-in-range' | 'min-stay-not-met' | 'max-stay-exceeded' | 'invalid-range'
  message: string
  blockedDates?: string[]
}

export interface PriceCalculation {
  basePrice: number
  nights: number
  dailyPrices: { date: string; price: number }[]
  totalPrice: number
  currency: string
  averagePerNight: number
  taxesAndFees?: number
  discounts?: number
}

export interface CalendarDay {
  date: Date
  dateString: string
  isToday: boolean
  isCurrentMonth: boolean
  isPreviousMonth: boolean
  isNextMonth: boolean
  availability?: DateAvailability
}

// Guest Calendar Props
export interface CalendarProps {
  modelValue: DateRange
  availabilityData?: DateAvailability[]
  minDate?: string | Date
  maxDate?: string | Date
  locale?: string
  disablePastDates?: boolean
  showPrices?: boolean
  allowSingleDay?: boolean
  theme?: 'light' | 'dark'
  basePrice?: number
  currency?: string
  showPriceCalculation?: boolean
  showSelectionErrors?: boolean
}

// Guest Calendar Emits
export interface CalendarEmits {
  'update:modelValue': [value: DateRange]
  'date-click': [date: string, status: AvailabilityStatus]
  'date-select': [date: Date]
  'selection-change': [selection: DateRange]
  'selection-error': [error: SelectionError | null]
  'price-calculation': [calculation: PriceCalculation | null]
  'book-now': [bookingData: { selection: DateRange; calculation: PriceCalculation }]
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out' | 'no-show'

// Hotel Dashboard Types (minimal and focused)
export interface Booking {
  id: string
  guestName: string
  roomNumber: string
  checkIn: string // ISO date string
  checkOut: string // ISO date string
  status: string
}

export interface Room {
  id: string
  number: string
}

export interface StatusConfig {
  key: string
  label: string
  color: string
  backgroundColor: string
  darkBackgroundColor?: string
}

// Dashboard Calendar Props
export interface DashboardCalendarProps {
  rooms: Room[]
  bookings: Booking[]
  selectedMonth?: Date
  theme?: 'light' | 'dark'
  statusConfig?: StatusConfig[]
}

// Dashboard Calendar Emits
export interface DashboardCalendarEmits {
  'update:selectedMonth': [value: Date]
  'booking-click': [booking: Booking]
  'booking-create': [data: { roomId: string; date: string }]
} 