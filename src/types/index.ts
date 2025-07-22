export type AvailabilityStatus = 'available' | 'blocked' | 'checkout-only'

export interface DateAvailability {
  date: string // ISO date string (YYYY-MM-DD)
  status: AvailabilityStatus
  price?: number
  minStay?: number
  maxStay?: number
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
}

export interface CalendarProps {
  modelValue?: {
    checkIn?: string | null
    checkOut?: string | null
  }
  availabilityData?: DateAvailability[]
  minDate?: string | Date
  maxDate?: string | Date
  locale?: string
  disablePastDates?: boolean
  showPrices?: boolean
  allowSingleDay?: boolean
  theme?: 'light' | 'dark'
  // NEW: Price calculation props
  basePrice?: number
  currency?: string
  showPriceCalculation?: boolean
  // NEW: Error handling
  showSelectionErrors?: boolean
}

export interface CalendarEmits {
  'update:modelValue': [value: { checkIn?: string | null; checkOut?: string | null }]
  'date-click': [date: string, status: AvailabilityStatus]
  'selection-change': [selection: { checkIn?: string | null; checkOut?: string | null }]
  // NEW: Price and error events
  'price-calculation': [calculation: PriceCalculation | null]
  'selection-error': [error: SelectionError]
} 