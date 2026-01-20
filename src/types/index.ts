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
  type: 'blocked-dates-in-range' | 'min-stay-not-met' | 'max-stay-exceeded' | 'invalid-range' | 'checkout-only-in-range'
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

// Custom text labels for the booking calendar
export interface CalendarTextLabels {
  previousMonth?: string
  nextMonth?: string
  bookingSummary?: string
  nights?: string
  night?: string
  priceBreakdown?: string
  total?: string
  bookNow?: string
  available?: string
  checkoutOnly?: string
  blocked?: string
  clearSelection?: string
  dismissError?: string
}

// Guest Calendar Props
export interface CalendarProps {
  modelValue: DateRange
  availabilityData?: DateAvailability[]
  minDate?: string | Date
  maxDate?: string | Date
  locale?: string
  disablePastDates?: boolean
  allowPreviousMonthNavigation?: boolean
  showPrices?: boolean
  allowSingleDay?: boolean
  theme?: 'light' | 'dark'
  basePrice?: number
  currency?: string
  showPriceCalculation?: boolean
  showSelectionErrors?: boolean
  textLabels?: CalendarTextLabels
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

// Custom text labels for the dashboard calendar
export interface DashboardTextLabels {
  previousMonth?: string
  nextMonth?: string
  room?: string
  available?: string
  createBooking?: string
  clickForDetails?: string
}

// Dashboard Calendar Props
export interface DashboardCalendarProps {
  rooms: Room[]
  bookings: Booking[]
  selectedMonth?: Date
  theme?: 'light' | 'dark'
  statusConfig?: StatusConfig[]
  allowPreviousMonthNavigation?: boolean
  textLabels?: DashboardTextLabels
}

// Dashboard Calendar Emits
export interface DashboardCalendarEmits {
  'update:selectedMonth': [value: Date]
  'booking-click': [booking: Booking]
  'booking-create': [data: { roomId: string; date: string }]
}

// ============================================================================
// Resource Scheduler Calendar Types
// ============================================================================

// View types for the scheduler
export type SchedulerViewType = 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly'

// Event category for color-coding
export interface EventCategory {
  id: string
  name: string
  color: string
  backgroundColor: string
  darkBackgroundColor?: string
}

// Recurrence pattern for recurring events
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurrencePattern {
  frequency: RecurrenceFrequency
  interval: number // e.g., every 2 weeks
  endDate?: string // ISO date string
  endAfterOccurrences?: number
  daysOfWeek?: number[] // 0-6 for weekly recurrence (Sunday = 0)
  dayOfMonth?: number // for monthly recurrence
}

// Resource Event (core scheduling unit)
export interface ResourceEvent {
  id: string
  title: string
  description?: string
  start: string // ISO datetime string
  end: string // ISO datetime string
  allDay?: boolean
  categoryId?: string
  color?: string // Override category color
  backgroundColor?: string
  recurrence?: RecurrencePattern
  location?: string
  metadata?: Record<string, unknown>
}

// Time slot for selection
export interface TimeSlot {
  start: string // ISO datetime string
  end: string // ISO datetime string
  date: string // ISO date string
  hour?: number
  minute?: number
}

// Conflict information
export interface EventConflict {
  eventId: string
  conflictingEventIds: string[]
  message: string
}

// Custom text labels for the scheduler calendar
export interface SchedulerTextLabels {
  today?: string
  previousPeriod?: string
  nextPeriod?: string
  yearView?: string
  monthView?: string
  weekView?: string
  dayView?: string
  hourView?: string
  allDay?: string
  noEvents?: string
  createEvent?: string
  editEvent?: string
  deleteEvent?: string
  eventDetails?: string
  conflictWarning?: string
  cancel?: string
  save?: string
}

// Time interval options for hourly view
export type TimeInterval = 15 | 30 | 60

// Working hours configuration
export interface WorkingHours {
  start: number // Hour (0-23)
  end: number // Hour (0-23)
  daysOfWeek?: number[] // 0-6, defaults to Mon-Fri
}

// Responsive breakpoint configuration
export interface ResponsiveBreakpoints {
  mobile?: number // Default: 480
  tablet?: number // Default: 768
  desktop?: number // Default: 1024
}

// Slot height configuration for time-based views
export interface SlotHeightConfig {
  hourly?: number // Height in pixels for hourly slots (default: 60)
  daily?: number // Height in pixels for daily view slots (default: 48)
  weekly?: number // Height in pixels for weekly view slots (default: 48)
}

// Header display options
export interface HeaderOptions {
  showNavigation?: boolean // Show prev/next buttons (default: true)
  showToday?: boolean // Show today button (default: true)
  showViewSwitcher?: boolean // Show view toggle buttons (default: true)
  showTitle?: boolean // Show period title (default: true)
}

// Legend display options
export interface LegendOptions {
  show?: boolean // Show legend (default: true when categories exist)
  position?: 'top' | 'bottom' // Legend position (default: 'bottom')
}

// Scheduler Calendar Props
export interface SchedulerCalendarProps {
  events?: ResourceEvent[]
  categories?: EventCategory[]
  selectedDate?: Date
  view?: SchedulerViewType
  theme?: 'light' | 'dark'
  locale?: string
  timeInterval?: TimeInterval
  workingHours?: WorkingHours
  showWeekNumbers?: boolean
  showAllDaySlot?: boolean
  allowEventCreation?: boolean
  allowEventEditing?: boolean
  allowEventDeletion?: boolean
  minDate?: string | Date
  maxDate?: string | Date
  textLabels?: SchedulerTextLabels
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Sunday, 1 = Monday, etc.

  // New enhanced props
  enabledViews?: SchedulerViewType[] // Which views to show in view switcher (default: all)
  defaultView?: SchedulerViewType // Initial view on load (default: 'monthly')
  slotHeight?: SlotHeightConfig // Configurable slot heights for time-based views
  responsiveBreakpoints?: ResponsiveBreakpoints // Custom breakpoints for responsive behavior
  headerOptions?: HeaderOptions // Control header element visibility
  legendOptions?: LegendOptions // Control legend display
  showCurrentTimeIndicator?: boolean // Show current time line in time-based views (default: true)
  highlightToday?: boolean // Highlight today's date (default: true)
  highlightWeekends?: boolean // Highlight weekend days (default: false)
  maxEventsPerSlot?: number // Max events shown before "+X more" in monthly view (default: 3)
  eventMinHeight?: number // Minimum height for events in pixels (default: 20)
  compactMode?: boolean // Condensed UI for smaller screens (default: false)
}

// Scheduler Calendar Emits
export interface SchedulerCalendarEmits {
  'update:selectedDate': [value: Date]
  'update:view': [value: SchedulerViewType]
  'event-click': [event: ResourceEvent]
  'event-create': [data: { start: string; end: string; allDay?: boolean }]
  'event-update': [event: ResourceEvent]
  'event-delete': [eventId: string]
  'slot-click': [slot: TimeSlot]
  'date-click': [date: string]
  'view-change': [view: SchedulerViewType]
  'date-range-change': [range: { start: string; end: string }]
  'conflict-detected': [conflict: EventConflict]
}

// Helper type for calendar day in scheduler
export interface SchedulerDay {
  date: Date
  dateString: string
  isToday: boolean
  isCurrentMonth: boolean
  isCurrentWeek: boolean
  isWeekend: boolean
  isWorkingDay: boolean
  events: ResourceEvent[]
  weekNumber?: number
}

// Helper type for time slot in hourly/daily view
export interface SchedulerTimeSlot {
  time: string // HH:mm format
  hour: number
  minute: number
  isWorkingHour: boolean
  events: ResourceEvent[]
}

// Helper type for month in yearly view
export interface SchedulerMonth {
  date: Date
  month: number // 0-11
  year: number
  name: string
  shortName: string
  eventCount: number
  hasEvents: boolean
} 