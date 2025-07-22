<template>
  <div class="hotel-booking-calendar" :class="[
    `theme-${theme}`,
    { 'show-prices': showPrices },
    { 'has-selection-error': selectionError }
  ]">
    <div class="calendar-header">
      <button type="button" class="nav-button prev" @click="previousMonth" :disabled="!canGoPrevious"
        :aria-label="'Previous month'">
        ‹
      </button>

      <div class="month-year">
        <h2>
          {{ formatMonth(currentDate) }}
        </h2>
      </div>

      <button type="button" class="nav-button next" @click="nextMonth" :disabled="!canGoNext"
        :aria-label="'Next month'">
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
      <button @click="clearSelectionError" class="error-dismiss" aria-label="Dismiss error">✕</button>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="days-grid">
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

    <!-- IMPROVED: Price Calculation Display -->
    <div v-if="showPriceCalculation && priceCalculation" class="price-summary">
      <div class="price-summary-header">
        <h3>Booking Summary</h3>
        <button @click="clearSelection" class="clear-selection" aria-label="Clear selection">
          <span class="clear-icon">✕</span>
          Clear
        </button>
      </div>

      <div class="price-details">
        <div class="stay-info">
          <div class="stay-duration">
            <span class="nights-count">{{ priceCalculation.nights }} night{{ priceCalculation.nights !== 1 ? 's' : ''
              }}</span>
            <div class="date-range">
              {{ formatDateRange(modelValue.checkIn!, modelValue.checkOut!) }}
            </div>
          </div>
        </div>

        <div class="price-breakdown" v-if="priceCalculation.dailyPrices.length > 1">
          <details class="breakdown-toggle">
            <summary>
              <span>View price breakdown</span>
              <span class="breakdown-arrow">▼</span>
            </summary>
            <div class="daily-prices">
              <div v-for="dailyPrice in priceCalculation.dailyPrices" :key="dailyPrice.date" class="daily-price">
                <span class="daily-date">{{ formatShortDate(dailyPrice.date) }}</span>
                <span class="daily-amount">{{ formatPrice(dailyPrice.price) }}</span>
              </div>
            </div>
          </details>
        </div>

        <div class="price-totals">
          <div class="subtotal">
            <div class="subtotal-label">
              <span>{{ priceCalculation.nights }} night{{ priceCalculation.nights !== 1 ? 's' : '' }} × {{
                formatPrice(priceCalculation.averagePerNight) }} avg</span>
            </div>
            <div class="subtotal-amount">{{ formatPrice(priceCalculation.totalPrice) }}</div>
          </div>
          <div class="total-price">
            <span class="total-label">Total</span>
            <span class="total-amount">{{ formatPrice(priceCalculation.totalPrice) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="$slots.legend || true" class="calendar-legend">
      <slot name="legend">
        <div class="legend-item">
          <div class="legend-indicator available"></div>
          <span>Available</span>
        </div>
        <div class="legend-item">
          <div class="legend-indicator checkout-only"></div>
          <span>Checkout Only</span>
        </div>
        <div class="legend-item">
          <div class="legend-indicator blocked"></div>
          <span>Blocked</span>
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
  locale: 'en-US',
  disablePastDates: true,
  showPrices: false,
  allowSingleDay: false,
  theme: 'light',
  basePrice: 100,
  currency: 'USD',
  showPriceCalculation: true,
  showSelectionErrors: true
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
    const dateString = current.toISOString().split('T')[0]
    const day: CalendarDay = {
      date: new Date(current),
      dateString,
      isToday: dateString === new Date().toISOString().split('T')[0],
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
    const dateString = current.toISOString().split('T')[0]
    const availability = availabilityMap.value.get(dateString)
    const dayPrice = availability?.price || props.basePrice || 100

    dailyPrices.push({ date: dateString, price: dayPrice })
    totalPrice += dayPrice

    current.setDate(current.getDate() + 1)
  }

  return {
    basePrice: props.basePrice || 100,
    nights,
    dailyPrices,
    totalPrice,
    currency: props.currency || 'USD',
    averagePerNight: totalPrice / nights
  }
})

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
    currency: props.currency || 'USD'
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
    const dateString = current.toISOString().split('T')[0]
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

const handleDayClick = (day: CalendarDay) => {
  if (isClickDisabled(day)) return

  const { checkIn, checkOut } = props.modelValue
  const clickedDate = day.dateString

  emit('date-click', clickedDate, getEffectiveStatus(day))

  // Handle selection logic
  if (!checkIn || (checkIn && checkOut)) {
    // Start new selection
    const newValue = { checkIn: clickedDate, checkOut: null }
    emit('update:modelValue', newValue)
    emit('selection-change', newValue)
    isSelectingRange.value = true
  } else if (checkIn && !checkOut) {
    // Complete the range
    if (clickedDate === checkIn && !props.allowSingleDay) {
      return
    }

    const startDate = clickedDate < checkIn ? clickedDate : checkIn
    const endDate = clickedDate < checkIn ? checkIn : clickedDate

    // Check if there are blocked dates in between
    if (getBlockedDatesInRange(startDate, endDate).length > 0) {
      const error = createSelectionError('blocked-dates-in-range', getBlockedDatesInRange(startDate, endDate))
      selectionError.value = error
      emit('selection-error', error)
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

// Initialize calendar to show selected dates
onMounted(() => {
  if (props.modelValue.checkIn) {
    const checkInDate = new Date(props.modelValue.checkIn)
    currentDate.value = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), 1)
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue.checkIn && !newValue.checkOut) {
    isSelectingRange.value = true
  } else {
    isSelectingRange.value = false
  }
}, { deep: true })

// NEW: Fixed Clear Selection method
const clearSelection = () => {
  const newValue = { checkIn: null, checkOut: null }
  emit('update:modelValue', newValue)
  emit('selection-change', newValue)
  clearSelectionError()
  isSelectingRange.value = false
}
</script>

<style scoped>
.hotel-booking-calendar {
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.theme-dark {
  background: #111827;
  color: #f8fafc;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
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
  font-size: 18px;
  font-weight: 600;
}

.calendar-body {
  padding: 16px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  padding: 8px 4px;
}

.theme-dark .weekday {
  color: #d1d5db;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
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
  min-height: 44px;
  color: #374151;
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
  z-index: 1;
}

.day-number {
  font-size: 14px;
}

.day-price {
  font-size: 10px;
  margin-top: 2px;
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

/* NEW: Selection Error Styles */
.selection-error {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fef3c7;
  color: #854d0e;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  margin: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.theme-dark .selection-error {
  background-color: #4b5563;
  color: #f8fafc;
  border-color: #374151;
}

.error-icon {
  font-size: 24px;
  margin-right: 12px;
}

.error-content {
  flex-grow: 1;
}

.error-message {
  font-weight: 600;
  margin-bottom: 4px;
}

.blocked-dates {
  font-size: 0.875em;
  color: #854d0e;
}

.error-dismiss {
  background: none;
  border: none;
  font-size: 20px;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  color: #854d0e;
  transition: background-color 0.2s;
}

.theme-dark .error-dismiss {
  color: #f8fafc;
}

.error-dismiss:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.theme-dark .error-dismiss:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* IMPROVED: Price Summary Styles */
.price-summary {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.theme-dark .price-summary-header {
  background: #111827;
  border-color: #374151;
}

.price-summary-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.theme-dark .price-summary-header h3 {
  color: #f8fafc;
}

.clear-selection {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.clear-selection:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.theme-dark .clear-selection {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

.theme-dark .clear-selection:hover {
  background: #4b5563;
  border-color: #6b7280;
  color: #f8fafc;
}

.clear-icon {
  font-size: 12px;
  opacity: 0.7;
}

.price-details {
  padding: 24px;
}

.stay-info {
  margin-bottom: 20px;
}

.nights-count {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.theme-dark .nights-count {
  color: #f8fafc;
}

.date-range {
  color: #6b7280;
  font-size: 16px;
  margin-top: 4px;
  font-weight: 500;
}

.theme-dark .date-range {
  color: #9ca3af;
}

.breakdown-toggle {
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0;
}

.theme-dark .breakdown-toggle {
  border-color: #4b5563;
}

.breakdown-toggle summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  background: #f8fafc;
  border-radius: 8px;
  list-style: none;
  user-select: none;
}

.breakdown-toggle summary::-webkit-details-marker {
  display: none;
}

.breakdown-toggle summary:hover {
  background: #f1f5f9;
  color: #1e40af;
}

.theme-dark .breakdown-toggle summary {
  background: #111827;
  color: #60a5fa;
}

.theme-dark .breakdown-toggle summary:hover {
  background: #1f2937;
  color: #93c5fd;
}

.breakdown-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.breakdown-toggle[open] .breakdown-arrow {
  transform: rotate(180deg);
}

.daily-prices {
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.theme-dark .daily-prices {
  background: #1f2937;
  border-color: #4b5563;
}

.daily-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.daily-price:not(:last-child) {
  border-bottom: 1px solid #f3f4f6;
}

.theme-dark .daily-price:not(:last-child) {
  border-color: #374151;
}

.daily-date {
  color: #6b7280;
  font-weight: 500;
}

.theme-dark .daily-date {
  color: #9ca3af;
}

.daily-amount {
  font-weight: 600;
  color: #111827;
}

.theme-dark .daily-amount {
  color: #f8fafc;
}

.price-totals {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.theme-dark .price-totals {
  border-color: #4b5563;
}

.subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  color: #6b7280;
  font-size: 15px;
}

.theme-dark .subtotal {
  color: #9ca3af;
}

.subtotal-label {
  font-weight: 500;
}

.subtotal-amount {
  font-weight: 600;
  color: #374151;
}

.theme-dark .subtotal-amount {
  color: #d1d5db;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.theme-dark .total-price {
  border-color: #4b5563;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.theme-dark .total-label {
  color: #f8fafc;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
}

.theme-dark .total-amount {
  color: #10b981;
}
</style>