<template>
  <div class="hotel-booking-calendar" :class="[
    `theme-${theme}`,
    { 'show-prices': showPrices },
    { 'has-selection-error': selectionError }
  ]">
    <div class="calendar-header">
      <button type="button" class="nav-button prev" @click="previousMonth" :disabled="!canGoPrevious"
        :aria-label="labels.previousMonth">
        ‹
      </button>

      <div class="month-year">
        <h2>
          {{ formatMonth(currentDate) }}
        </h2>
      </div>

      <button type="button" class="nav-button next" @click="nextMonth" :disabled="!canGoNext"
        :aria-label="labels.nextMonth">
        ›
      </button>
    </div>

    <!-- NEW: Selection Error Display -->
    <div v-if="selectionError && showSelectionErrors" class="selection-error">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <div class="error-message">{{ selectionError.message }}</div>
        <div v-if="selectionError.blockedDates?.length" class="blocked-dates">
          Blocked dates: {{ formatBlockedDates(selectionError.blockedDates) }}
        </div>
      </div>
      <button @click="clearSelectionError" class="error-dismiss" :aria-label="labels.dismissError">✕</button>
    </div>

    <div class="calendar-body">
      <div class="calendar-grid-container">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>

        <div v-for="day in calendarDays" :key="day.dateString" class="day-cell" :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': isDaySelected(day.dateString),
          'in-range': isDayInRange(day.dateString),
          'range-start': isRangeStart(day.dateString),
          'range-end': isRangeEnd(day.dateString),
          'available': getEffectiveStatus(day) === 'available',
          'blocked': getEffectiveStatus(day) === 'blocked',
          'checkout-only': getEffectiveStatus(day) === 'checkout-only',
          'disabled': isDayDisabled(day),
          'click-disabled': isClickDisabled(day),
          'error-blocked': isErrorBlocked(day.dateString)
        }" @click="handleDayClick(day)" @mouseenter="handleDayHover(day)" role="button"
          :tabindex="isClickDisabled(day) ? -1 : 0" :aria-label="getDayAriaLabel(day)"
          @keydown.enter="handleDayClick(day)" @keydown.space.prevent="handleDayClick(day)">
          <div class="day-content">
            <span class="day-number">{{ day.date.getDate() }}</span>
            <div v-if="showPrices && getDayPrice(day)" class="day-price">
              {{ formatPrice(getDayPrice(day)) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- COMPACT: Price Calculation Display -->
    <div v-if="showPriceCalculation && priceCalculation" class="price-summary">
      <div class="price-summary-header">
        <h4>{{ labels.bookingSummary }}</h4>
        <button @click="clearSelection" class="clear-btn" :aria-label="labels.clearSelection">✕</button>
      </div>

      <div class="price-content">
        <div class="stay-info">
          <span class="nights">{{ priceCalculation.nights }} {{ priceCalculation.nights === 1 ? labels.night : labels.nights }}</span>
          <span class="dates">{{ modelValue?.checkIn && modelValue?.checkOut ? formatDateRange(modelValue.checkIn, modelValue.checkOut) : '' }}</span>
        </div>

        <div v-if="priceCalculation.dailyPrices.length > 1" class="breakdown">
          <details class="breakdown-toggle">
            <summary>{{ labels.priceBreakdown }} <span class="arrow">▼</span></summary>
            <div class="daily-list">
              <div v-for="dailyPrice in priceCalculation.dailyPrices" :key="dailyPrice.date" class="daily-row">
                <span>{{ formatShortDate(dailyPrice.date) }}</span>
                <span>{{ formatPrice(dailyPrice.price) }}</span>
              </div>
            </div>
          </details>
        </div>

        <div class="totals">
          <div class="subtotal">
            <span>{{ priceCalculation.nights }} × {{ formatPrice(priceCalculation.averagePerNight) }}</span>
            <span>{{ formatPrice(priceCalculation.totalPrice) }}</span>
          </div>
          <div class="total">
            <span>{{ labels.total }}</span>
            <strong>{{ formatPrice(priceCalculation.totalPrice) }}</strong>
          </div>
        </div>

        <button @click="handleBookNow" class="book-btn" :disabled="!priceCalculation">
          {{ labels.bookNow }}
        </button>
      </div>
    </div>

    <div v-if="$slots.legend || true" class="calendar-legend">
      <slot name="legend">
        <div class="legend-item">
          <div class="legend-indicator available"></div>
          <span>{{ labels.available }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-indicator checkout-only"></div>
          <span>{{ labels.checkoutOnly }}</span>
        </div>
        <div class="legend-item">
          <div class="legend-indicator blocked"></div>
          <span>{{ labels.blocked }}</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { CalendarProps, CalendarEmits, CalendarDay, DateAvailability, AvailabilityStatus, SelectionError, PriceCalculation } from '../types'

// Props with defaults
const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: () => ({ checkIn: null, checkOut: null }),
  availabilityData: () => ([]),
  locale: 'en-GB',
  disablePastDates: true,
  allowPreviousMonthNavigation: true,
  showPrices: false,
  allowSingleDay: false,
  theme: 'light',
  basePrice: 85,
  currency: 'GBP',
  showPriceCalculation: true,
  showSelectionErrors: true,
  textLabels: () => ({})
})

// Emits
const emit = defineEmits<CalendarEmits>()

// Reactive state
const currentDate = ref(new Date())
const hoveredDate = ref<string | null>(null)
const isSelectingRange = ref(false)
const selectionError = ref<SelectionError | null>(null)

// Existing computed properties
const minDateObj = computed(() => {
  if (!props.minDate) {
    if (props.disablePastDates) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    return null
  }
  return typeof props.minDate === 'string' ? new Date(props.minDate) : props.minDate
})

const maxDateObj = computed(() => {
  if (!props.maxDate) return null
  return typeof props.maxDate === 'string' ? new Date(props.maxDate) : props.maxDate
})

const availabilityMap = computed(() => {
  const map = new Map<string, DateAvailability>()
  props.availabilityData.forEach(item => {
    map.set(item.date, item)
  })
  return map
})

const weekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(props.locale, { weekday: 'short' })
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(2023, 0, i + 1) // Start from Sunday
    days.push(formatter.format(date))
  }
  return days
})

const calendarDays = computed((): CalendarDay[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  const endDate = new Date(lastDay)

  // Start from the first day of the week containing the first day of the month
  startDate.setDate(startDate.getDate() - startDate.getDay())

  // End at the last day of the week containing the last day of the month
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const days: CalendarDay[] = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateString = toDateString(current)
    const day: CalendarDay = {
      date: new Date(current),
      dateString,
      isToday: dateString === toDateString(new Date()),
      isCurrentMonth: current.getMonth() === month,
      isPreviousMonth: current.getMonth() < month,
      isNextMonth: current.getMonth() > month,
      availability: availabilityMap.value.get(dateString)
    }

    days.push(day)
    current.setDate(current.getDate() + 1)
  }

  return days
})

const canGoPrevious = computed(() => {
  // If allowPreviousMonthNavigation is true, always allow going to previous months
  if (props.allowPreviousMonthNavigation) return true
  
  if (!minDateObj.value) return true
  const prevMonth = new Date(currentDate.value)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  prevMonth.setDate(1)
  const minDate = new Date(minDateObj.value)
  minDate.setDate(1)
  return prevMonth >= minDate
})

const canGoNext = computed(() => {
  if (!maxDateObj.value) return true
  const nextMonth = new Date(currentDate.value)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  const maxDate = new Date(maxDateObj.value)
  maxDate.setDate(1)
  return nextMonth <= maxDate
})

// Text labels with fallbacks
const labels = computed(() => ({
  previousMonth: props.textLabels?.previousMonth || 'Previous month',
  nextMonth: props.textLabels?.nextMonth || 'Next month',
  bookingSummary: props.textLabels?.bookingSummary || 'Booking Summary',
  nights: props.textLabels?.nights || 'nights',
  night: props.textLabels?.night || 'night',
  priceBreakdown: props.textLabels?.priceBreakdown || 'Price breakdown',
  total: props.textLabels?.total || 'Total',
  bookNow: props.textLabels?.bookNow || 'Book Now',
  available: props.textLabels?.available || 'Available',
  checkoutOnly: props.textLabels?.checkoutOnly || 'Checkout Only',
  blocked: props.textLabels?.blocked || 'Blocked',
  clearSelection: props.textLabels?.clearSelection || 'Clear selection',
  dismissError: props.textLabels?.dismissError || 'Dismiss error'
}))

// NEW: Price calculation computed
const priceCalculation = computed((): PriceCalculation | null => {
  const { checkIn, checkOut } = props.modelValue
  if (!checkIn || !checkOut) return null

  const startDate = new Date(checkIn)
  const endDate = new Date(checkOut)
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  if (nights <= 0) return null

  const dailyPrices: { date: string; price: number }[] = []
  let totalPrice = 0
  const current = new Date(startDate)

  while (current < endDate) {
    const dateString = toDateString(current)
    const availability = availabilityMap.value.get(dateString)
    const dayPrice = availability?.price || props.basePrice || 85

    dailyPrices.push({ date: dateString, price: dayPrice })
    totalPrice += dayPrice

    current.setDate(current.getDate() + 1)
  }

  return {
    basePrice: props.basePrice || 85,
    nights,
    dailyPrices,
    totalPrice,
    currency: props.currency || 'GBP',
    averagePerNight: totalPrice / nights
  }
})

// Utility function to create date strings safely without timezone issues
const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Methods
const formatMonth = (date: Date): string => {
  return new Intl.DateTimeFormat(props.locale, {
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency || 'GBP'
  }).format(price)
}

const formatDateRange = (checkIn: string, checkOut: string): string => {
  const start = new Date(checkIn)
  const end = new Date(checkOut)

  const formatter = new Intl.DateTimeFormat(props.locale, {
    month: 'short',
    day: 'numeric'
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

const formatShortDate = (date: string): string => {
  return new Intl.DateTimeFormat(props.locale, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const formatBlockedDates = (dates: string[]): string => {
  return dates.map(date => formatShortDate(date)).join(', ')
}

const getDayPrice = (day: CalendarDay): number => {
  return day.availability?.price || props.basePrice || 0
}

const isDayDisabled = (day: CalendarDay): boolean => {
  if (!day.isCurrentMonth) return true

  if (props.disablePastDates) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayDate = new Date(day.date)
    dayDate.setHours(0, 0, 0, 0)
    if (dayDate < today) return true
  }

  if (minDateObj.value && day.date < minDateObj.value) return true
  if (maxDateObj.value && day.date > maxDateObj.value) return true

  return false
}

const isClickDisabled = (day: CalendarDay): boolean => {
  if (isDayDisabled(day)) return true
  if (getEffectiveStatus(day) === 'blocked') return true
  return false
}

const getEffectiveStatus = (day: CalendarDay): AvailabilityStatus => {
  return day.availability?.status || 'available'
}

// NEW: Check if date is highlighted as error blocked
const isErrorBlocked = (dateString: string): boolean => {
  return selectionError.value?.blockedDates?.includes(dateString) || false
}

// NEW: Enhanced blocked dates detection
const getBlockedDatesInRange = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(start)
  const blockedDates: string[] = []

  current.setDate(current.getDate() + 1)

  while (current < end) {
    const dateString = toDateString(current)
    const availability = availabilityMap.value.get(dateString)
    if (availability?.status === 'blocked') {
      blockedDates.push(dateString)
    }
    current.setDate(current.getDate() + 1)
  }

  return blockedDates
}

const isDaySelected = (dateString: string): boolean => {
  return dateString === props.modelValue.checkIn || dateString === props.modelValue.checkOut
}

const isDayInRange = (dateString: string): boolean => {
  const { checkIn, checkOut } = props.modelValue
  if (!checkIn || !checkOut) return false
  return dateString > checkIn && dateString < checkOut
}

const isRangeStart = (dateString: string): boolean => {
  return dateString === props.modelValue.checkIn
}

const isRangeEnd = (dateString: string): boolean => {
  return dateString === props.modelValue.checkOut
}

const getDayAriaLabel = (day: CalendarDay): string => {
  const date = day.date.toLocaleDateString(props.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const status = getEffectiveStatus(day)
  const price = getDayPrice(day)
  return `${date}, ${status}${price ? `, ${formatPrice(price)}` : ''}`
}

// NEW: Error handling methods
const clearSelectionError = () => {
  selectionError.value = null
}

const createSelectionError = (type: SelectionError['type'], blockedDates?: string[]): SelectionError => {
  const messages = {
    'blocked-dates-in-range': 'Selected dates include unavailable periods. Please choose different dates.',
    'min-stay-not-met': 'Minimum stay requirement not met for selected dates.',
    'max-stay-exceeded': 'Selected stay exceeds maximum allowed duration.',
    'invalid-range': 'Invalid date range selected.'
  }

  return {
    type,
    message: messages[type],
    blockedDates
  }
}

const clearSelection = () => {
  const newValue = { checkIn: null, checkOut: null }
  emit('update:modelValue', newValue)
  emit('selection-change', newValue)
  clearSelectionError()
  isSelectingRange.value = false
}

// NEW: Handle Book Now
const handleBookNow = () => {
  if (priceCalculation.value && props.modelValue.checkIn && props.modelValue.checkOut) {
    const booking = {
      selection: {
        checkIn: props.modelValue.checkIn,
        checkOut: props.modelValue.checkOut
      },
      calculation: priceCalculation.value
    }
    emit('book-now', booking)
  }
}

// Enhanced handleDayClick with error handling
const handleDayClick = (day: CalendarDay) => {
  if (isClickDisabled(day)) return

  clearSelectionError()

  const { checkIn, checkOut } = props.modelValue
  const clickedDate = day.dateString

  emit('date-click', clickedDate, getEffectiveStatus(day))

  if (!checkIn || (checkIn && checkOut)) {
    const newValue = { checkIn: clickedDate, checkOut: null }
    emit('update:modelValue', newValue)
    emit('selection-change', newValue)
    isSelectingRange.value = true
  } else if (checkIn && !checkOut) {
    if (clickedDate === checkIn && !props.allowSingleDay) {
      return
    }

    const startDate = clickedDate < checkIn ? clickedDate : checkIn
    const endDate = clickedDate < checkIn ? checkIn : clickedDate

    const blockedDates = getBlockedDatesInRange(startDate, endDate)
    if (blockedDates.length > 0) {
      const error = createSelectionError('blocked-dates-in-range', blockedDates)
      selectionError.value = error
      emit('selection-error', error)

      const newValue = { checkIn: clickedDate, checkOut: null }
      emit('update:modelValue', newValue)
      emit('selection-change', newValue)
      isSelectingRange.value = true
      return
    }

    const newValue = { checkIn: startDate, checkOut: endDate }
    emit('update:modelValue', newValue)
    emit('selection-change', newValue)
    isSelectingRange.value = false
  }
}

const handleDayHover = (day: CalendarDay) => {
  if (isDayDisabled(day)) return
  hoveredDate.value = day.dateString
}

const previousMonth = () => {
  if (!canGoPrevious.value) return
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  if (!canGoNext.value) return
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

// Initialize calendar
onMounted(() => {
  if (props.modelValue.checkIn) {
    const checkInDate = new Date(props.modelValue.checkIn)
    currentDate.value = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1)
  }
})

// Watch for changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.checkIn && !newValue.checkOut) {
    isSelectingRange.value = true
  } else {
    isSelectingRange.value = false
  }
}, { deep: true })

watch(priceCalculation, (newCalculation) => {
  emit('price-calculation', newCalculation)
}, { immediate: true })
</script>

<style scoped>
.hotel-booking-calendar {
  width: 100%;
  max-width: 400px;
  min-width: 280px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  margin: 0 auto;
}

.theme-dark {
  background: #111827;
  color: #f8fafc;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(12px, 3vw, 16px);
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  min-height: 60px;
}

.theme-dark .calendar-header {
  background: #1f2937;
  border-color: #374151;
  color: #f8fafc;
}

.nav-button {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: inherit;
}

.nav-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
}

.theme-dark .nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.month-year h2 {
  margin: 0;
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 600;
  white-space: nowrap;
  padding: 0 4px;
}

.calendar-body {
  padding: 16px;
}

.calendar-grid-container {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  width: 100%;
  gap: 2px;
}

.weekdays {
  display: contents;
}

.weekday {
  text-align: center;
  font-size: clamp(10px, 3vw, 12px);
  font-weight: 600;
  color: #718096;
  padding: 4px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.theme-dark .weekday {
  color: #d1d5db;
}

.days-grid {
  display: contents;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  height: clamp(36px, 10vw, 44px);
  color: #374151;
  padding: 2px;
  margin: 1px;
  grid-column: auto;
}

.theme-dark .day-cell {
  color: #f8fafc;
}

.day-cell:hover:not(.disabled) {
  background: #f7fafc;
}

.day-cell.other-month {
  color: #cbd5e0;
}

.theme-dark .day-cell.other-month {
  color: #6b7280;
}

.day-cell.disabled {
  color: #cbd5e0;
  cursor: not-allowed;
}

.theme-dark .day-cell.disabled {
  color: #6b7280;
}

.day-cell.today {
  font-weight: 600;
  border: 2px solid #4ade80;
}

.day-cell.selected {
  background: #3182ce !important;
  color: white !important;
}

.day-cell.in-range {
  background: #bee3f8 !important;
  color: #2d3748 !important;
}

.day-cell.range-start,
.day-cell.range-end {
  background: #3182ce !important;
  color: white !important;
}

.day-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.day-number {
  font-size: clamp(12px, 3.5vw, 14px);
  line-height: 1.2;
}

.day-price {
  font-size: clamp(8px, 2.5vw, 10px);
  margin-top: 1px;
  line-height: 1;
}

.status-indicator {
  display: none;
}

/* Base day cell styles - only apply if not disabled and not past dates */
.day-cell.available:not(.disabled) {
  background: #f0fdf4;
  color: #166534;
}

.day-cell.available:not(.disabled):hover {
  background: #dcfce7;
}

.day-cell.checkout-only:not(.disabled) {
  background: linear-gradient(45deg, #f0fdf4 50%, #fef3c7 50%);
  color: #1f2937;
}

.day-cell.checkout-only:not(.disabled):hover {
  background: linear-gradient(45deg, #dcfce7 50%, #fde68a 50%);
}

.day-cell.blocked:not(.disabled) {
  background: #fef2f2 !important;
  color: #991b1b !important;
  cursor: not-allowed;
}

.day-cell.blocked:not(.disabled):hover {
  background: #fee2e2 !important;
}

/* Past dates - neutral styling (overrides everything) */
.day-cell.disabled {
  background: transparent !important;
  color: #9ca3af !important;
  cursor: not-allowed;
}

.day-cell.disabled:hover {
  background: transparent !important;
}

/* NEW: Selection Error Styles */
.selection-error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  margin: 0 16px 16px;
  color: #991b1b;
  animation: slideIn 0.3s ease-out;
}

.theme-dark .selection-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-message {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 14px;
}

.blocked-dates {
  font-size: 12px;
  opacity: 0.8;
}

.error-dismiss {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 2px;
  color: inherit;
  opacity: 0.7;
  border-radius: 2px;
}

.error-dismiss:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Error blocked dates highlighting */
.day-cell.error-blocked {
  background: #fee2e2 !important;
  border: 2px solid #ef4444 !important;
  animation: errorPulse 1s ease-in-out;
}

.theme-dark .day-cell.error-blocked {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: #ef4444 !important;
}

/* COMPACT: Price Summary Styles */
.price-summary {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 12px;
  font-size: 14px;
}

.theme-dark .price-summary {
  background: #1f2937;
  border-color: #374151;
  color: #f8fafc;
}

.price-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
}

.theme-dark .price-summary-header {
  background: #111827;
  border-color: #374151;
}

.price-summary-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.theme-dark .price-summary-header h4 {
  color: #f8fafc;
}

.clear-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.theme-dark .clear-btn {
  color: #9ca3af;
}

.theme-dark .clear-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.price-content {
  padding: 16px;
}

.stay-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.nights {
  font-weight: 600;
  font-size: 16px;
  color: #111827;
}

.theme-dark .nights {
  color: #f8fafc;
}

.dates {
  color: #6b7280;
  font-size: 14px;
}

.theme-dark .dates {
  color: #9ca3af;
}

.breakdown {
  margin-bottom: 12px;
}

.breakdown-toggle {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.theme-dark .breakdown-toggle {
  border-color: #4b5563;
}

.breakdown-toggle summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 13px;
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 6px;
  list-style: none;
  user-select: none;
}

.breakdown-toggle summary::-webkit-details-marker {
  display: none;
}

.breakdown-toggle[open] summary {
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #e5e7eb;
}

.theme-dark .breakdown-toggle summary {
  background: #111827;
  color: #60a5fa;
}

.theme-dark .breakdown-toggle[open] summary {
  border-color: #4b5563;
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.breakdown-toggle[open] .arrow {
  transform: rotate(180deg);
}

.daily-list {
  padding: 8px 12px;
  background: #ffffff;
}

.theme-dark .daily-list {
  background: #1f2937;
}

.daily-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 13px;
}

.daily-row:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.theme-dark .daily-row:not(:last-child) {
  border-color: #374151;
}

.totals {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-bottom: 16px;
}

.theme-dark .totals {
  border-color: #4b5563;
}

.subtotal {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.theme-dark .subtotal {
  color: #9ca3af;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 16px;
}

.total strong {
  color: #059669;
  font-size: 18px;
}

.theme-dark .total strong {
  color: #10b981;
}

.book-btn {
  width: 100%;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.book-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.book-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.theme-dark .book-btn:disabled {
  background: #4b5563;
}

.calendar-legend {
  padding: 16px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
}

.theme-dark .calendar-legend {
  background: #1f2937;
  border-color: #374151;
  color: #f8fafc;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-indicator.available {
  background: #48bb78;
}

.legend-indicator.checkout-only {
  background: #ed8936;
}

.legend-indicator.blocked {
  background: #e53e3e;
}

/* Dark theme overrides */
.theme-dark .day-cell:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.theme-dark .day-cell.today {
  border-color: rgba(16, 185, 129, 0.6);
  color: #f8fafc;
  background: rgba(16, 185, 129, 0.05);
}

.theme-dark .day-cell.available:not(.disabled) {
  background: rgba(16, 185, 129, 0.08);
  color: #f8fafc;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.theme-dark .day-cell.available:not(.disabled):hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
}

.theme-dark .day-cell.checkout-only:not(.disabled) {
  background: linear-gradient(45deg, rgba(16, 185, 129, 0.08) 50%, rgba(245, 158, 11, 0.08) 50%);
  color: #f8fafc;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.theme-dark .day-cell.checkout-only:not(.disabled):hover {
  background: linear-gradient(45deg, rgba(16, 185, 129, 0.12) 50%, rgba(245, 158, 11, 0.12) 50%);
  border-color: rgba(245, 158, 11, 0.3);
}

.theme-dark .day-cell.blocked:not(.disabled) {
  background: rgba(239, 68, 68, 0.08) !important;
  color: #f8fafc !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.theme-dark .day-cell.blocked:not(.disabled):hover {
  background: rgba(239, 68, 68, 0.12) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.theme-dark .day-cell.disabled {
  background: transparent !important;
  color: #4b5563 !important;
}

.theme-dark .day-cell.disabled:hover {
  background: transparent !important;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes errorPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}
</style>