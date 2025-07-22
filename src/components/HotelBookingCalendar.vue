<template>
  <div
    class="hotel-booking-calendar"
    :class="[
      `theme-${theme}`,
      { 'show-prices': showPrices }
    ]"
  >
    <div class="calendar-header">
      <button
        type="button"
        class="nav-button prev"
        @click="previousMonth"
        :disabled="!canGoPrevious"
        :aria-label="'Previous month'"
      >
        ‹
      </button>
      
      <div class="month-year">
        <h2>
          {{ formatMonth(currentDate) }}
        </h2>
      </div>
      
      <button
        type="button"
        class="nav-button next"
        @click="nextMonth"
        :disabled="!canGoNext"
        :aria-label="'Next month'"
      >
        ›
      </button>
    </div>

    <div class="calendar-body">
      <div class="weekdays">
        <div
          v-for="day in weekdays"
          :key="day"
          class="weekday"
        >
          {{ day }}
        </div>
      </div>

      <div class="days-grid">
        <div
          v-for="day in calendarDays"
          :key="day.dateString"
          class="day-cell"
          :class="{
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
            'click-disabled': isClickDisabled(day)
          }"
          @click="handleDayClick(day)"
          @mouseenter="handleDayHover(day)"
          role="button"
          :tabindex="isClickDisabled(day) ? -1 : 0"
          :aria-label="getDayAriaLabel(day)"
          @keydown.enter="handleDayClick(day)"
          @keydown.space.prevent="handleDayClick(day)"
        >
          <div class="day-content">
            <span class="day-number">{{ day.date.getDate() }}</span>
            <div v-if="showPrices && day.availability?.price" class="day-price">
              {{ formatPrice(day.availability.price) }}
            </div>
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
import type { CalendarProps, CalendarEmits, CalendarDay, DateAvailability, AvailabilityStatus } from '../types'

// Props with defaults
const props = withDefaults(defineProps<CalendarProps>(), {
  modelValue: () => ({ checkIn: null, checkOut: null }),
  availabilityData: () => ([]),
  locale: 'en-US',
  disablePastDates: true,
  showPrices: false,
  allowSingleDay: false,
  theme: 'light'
})

// Emits
const emit = defineEmits<CalendarEmits>()

// Reactive state
const currentDate = ref(new Date())
const hoveredDate = ref<string | null>(null)
const isSelectingRange = ref(false)

// Computed properties
const minDateObj = computed(() => {
  if (!props.minDate) {
    if (props.disablePastDates) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
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
  prevMonth.setDate(1) // Set to first day of previous month
  const minDate = new Date(minDateObj.value)
  minDate.setDate(1) // Set to first day of min month
  return prevMonth >= minDate
})

const canGoNext = computed(() => {
  if (!maxDateObj.value) return true
  const nextMonth = new Date(currentDate.value)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1) // Set to first day of next month
  const maxDate = new Date(maxDateObj.value)
  maxDate.setDate(1) // Set to first day of max month
  return nextMonth <= maxDate
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
    currency: 'USD' // Could be made configurable
  }).format(price)
}

const isDayDisabled = (day: CalendarDay): boolean => {
  if (!day.isCurrentMonth) return true
  
  // For past date checking, compare just the date (not time)
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
  // If no availability data is provided for this date, default to 'available'
  return day.availability?.status || 'available'
}

const hasBlockedDatesBetween = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(start)
  current.setDate(current.getDate() + 1) // Start checking from day after start date
  
  while (current < end) {
    const dateString = current.toISOString().split('T')[0]
    const availability = availabilityMap.value.get(dateString)
    if (availability?.status === 'blocked') {
      return true
    }
    current.setDate(current.getDate() + 1)
  }
  
  return false
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
  return `${date}, ${status}`
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
    if (hasBlockedDatesBetween(startDate, endDate)) {
      // Reset selection if blocked dates found
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
</style> 