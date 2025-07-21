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
            'available': day.availability?.status === 'available',
            'blocked': day.availability?.status === 'blocked',
            'checkout-only': day.availability?.status === 'checkout-only',
            'disabled': isDayDisabled(day)
          }"
          @click="handleDayClick(day)"
          @mouseenter="handleDayHover(day)"
          role="button"
          :tabindex="isDayDisabled(day) ? -1 : 0"
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
          
          <div class="status-indicator" :class="day.availability?.status"></div>
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
  if (!props.minDate) return props.disablePastDates ? new Date() : null
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
  return prevMonth >= minDateObj.value
})

const canGoNext = computed(() => {
  if (!maxDateObj.value) return true
  const nextMonth = new Date(currentDate.value)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth <= maxDateObj.value
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
  if (day.availability?.status === 'blocked') return true
  
  if (minDateObj.value && day.date < minDateObj.value) return true
  if (maxDateObj.value && day.date > maxDateObj.value) return true
  
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
  
  let status = ''
  if (day.availability?.status) {
    status = `, ${day.availability.status}`
  }
  
  return `${date}${status}`
}

const handleDayClick = (day: CalendarDay) => {
  if (isDayDisabled(day)) return
  
  const { checkIn, checkOut } = props.modelValue
  const clickedDate = day.dateString
  
  emit('date-click', clickedDate, day.availability?.status || 'available')
  
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
    
    const newValue = clickedDate < checkIn 
      ? { checkIn: clickedDate, checkOut: checkIn }
      : { checkIn, checkOut: clickedDate }
    
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
  background: #2d3748;
  color: #e2e8f0;
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
  background: #4a5568;
  border-color: #4a5568;
}

.nav-button {
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
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
}

.day-cell:hover:not(.disabled) {
  background: #f7fafc;
}

.day-cell.other-month {
  color: #cbd5e0;
}

.day-cell.disabled {
  color: #cbd5e0;
  cursor: not-allowed;
}

.day-cell.today {
  font-weight: 600;
  background: #e6fffa;
}

.day-cell.selected {
  background: #3182ce;
  color: white;
}

.day-cell.in-range {
  background: #bee3f8;
  color: #2d3748;
}

.day-cell.range-start,
.day-cell.range-end {
  background: #3182ce;
  color: white;
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
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-indicator.available {
  background: #48bb78;
}

.status-indicator.checkout-only {
  background: #ed8936;
}

.status-indicator.blocked {
  background: #e53e3e;
}

.day-cell.available:hover {
  background: #c6f6d5;
}

.day-cell.checkout-only:hover {
  background: #fbd38d;
}

.day-cell.blocked {
  background: #fed7d7;
  cursor: not-allowed;
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
  background: #4a5568;
  border-color: #4a5568;
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
  background: #4a5568;
}

.theme-dark .day-cell.today {
  background: #2d3748;
}

.theme-dark .day-cell.available:hover {
  background: #2f855a;
}

.theme-dark .day-cell.checkout-only:hover {
  background: #c05621;
}

.theme-dark .day-cell.blocked {
  background: #c53030;
}
</style> 