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
}

export interface CalendarEmits {
  'update:modelValue': [value: { checkIn?: string | null; checkOut?: string | null }]
  'date-click': [date: string, status: AvailabilityStatus]
  'selection-change': [selection: { checkIn?: string | null; checkOut?: string | null }]
} 