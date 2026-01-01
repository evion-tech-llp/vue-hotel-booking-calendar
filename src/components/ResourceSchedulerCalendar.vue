<template>
  <div class="resource-scheduler-calendar" :class="[`theme-${theme}`]">
    <!-- Header with Navigation and View Switcher -->
    <div class="scheduler-header">
      <!-- Navigation Controls -->
      <div class="nav-controls">
        <button type="button" @click="navigatePrevious" class="nav-btn" :aria-label="labels.previousPeriod">
          <span class="nav-arrow">‹</span>
        </button>
        
        <button type="button" @click="goToToday" class="today-btn">
          {{ labels.today }}
        </button>
        
        <button type="button" @click="navigateNext" class="nav-btn" :aria-label="labels.nextPeriod">
          <span class="nav-arrow">›</span>
        </button>
      </div>

      <!-- Current Period Title -->
      <h2 class="period-title">{{ currentPeriodTitle }}</h2>

      <!-- View Switcher -->
      <div class="view-switcher">
        <button
          v-for="viewOption in viewOptions"
          :key="viewOption.value"
          type="button"
          @click="switchView(viewOption.value)"
          class="view-btn"
          :class="{ active: currentView === viewOption.value }"
        >
          {{ viewOption.label }}
        </button>
      </div>
    </div>

    <!-- Calendar Content Area -->
    <div class="scheduler-content">
      <!-- Yearly View -->
      <YearlyView
        v-if="currentView === 'yearly'"
        :year="currentYear"
        :events="expandedEvents"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        @month-click="handleMonthClick"
        @date-click="handleDateClick"
      />

      <!-- Monthly View -->
      <MonthlyView
        v-else-if="currentView === 'monthly'"
        :current-date="currentDate"
        :events="expandedEvents"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :first-day-of-week="firstDayOfWeek"
        @date-click="handleDateClick"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Weekly View -->
      <WeeklyView
        v-else-if="currentView === 'weekly'"
        :current-date="currentDate"
        :events="expandedEvents"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        :first-day-of-week="firstDayOfWeek"
        :show-all-day-slot="showAllDaySlot"
        @date-click="handleDateClick"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Daily View -->
      <DailyView
        v-else-if="currentView === 'daily'"
        :current-date="currentDate"
        :events="expandedEvents"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        :show-all-day-slot="showAllDaySlot"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Hourly View -->
      <HourlyView
        v-else-if="currentView === 'hourly'"
        :current-date="currentDate"
        :events="expandedEvents"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />
    </div>

    <!-- Legend -->
    <div v-if="categories && categories.length > 0" class="scheduler-legend">
      <div v-for="category in categories" :key="category.id" class="legend-item">
        <div 
          class="legend-color"
          :style="{ 
            backgroundColor: theme === 'dark' && category.darkBackgroundColor 
              ? category.darkBackgroundColor 
              : category.backgroundColor,
            borderColor: category.color 
          }"
        ></div>
        <span>{{ category.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { 
  SchedulerCalendarProps, 
  SchedulerCalendarEmits,
  SchedulerViewType,
  ResourceEvent,
  TimeSlot,
  RecurrencePattern
} from '../types'

// Sub-components
import YearlyView from './scheduler/YearlyView.vue'
import MonthlyView from './scheduler/MonthlyView.vue'
import WeeklyView from './scheduler/WeeklyView.vue'
import DailyView from './scheduler/DailyView.vue'
import HourlyView from './scheduler/HourlyView.vue'

// ============================================================================
// Recurring Events Expansion Utility
// ============================================================================

/**
 * Expands recurring events into individual occurrences within a date range
 */
const expandRecurringEvents = (
  events: ResourceEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number = 365 // Safety limit
): ResourceEvent[] => {
  const expandedEvents: ResourceEvent[] = []

  events.forEach(event => {
    if (!event.recurrence) {
      // Non-recurring event - include if it overlaps with the range
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      if (eventStart <= rangeEnd && eventEnd >= rangeStart) {
        expandedEvents.push(event)
      }
      return
    }

    // Expand recurring event
    const occurrences = generateOccurrences(event, rangeStart, rangeEnd, maxOccurrences)
    expandedEvents.push(...occurrences)
  })

  return expandedEvents
}

/**
 * Generates occurrences for a recurring event within a date range
 */
const generateOccurrences = (
  event: ResourceEvent,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number
): ResourceEvent[] => {
  const occurrences: ResourceEvent[] = []
  const recurrence = event.recurrence!
  
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  const duration = eventEnd.getTime() - eventStart.getTime()
  
  // Determine the end of recurrence
  let recurrenceEnd = rangeEnd
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate)
    if (endDate < recurrenceEnd) {
      recurrenceEnd = endDate
    }
  }

  let currentDate = new Date(eventStart)
  let occurrenceCount = 0
  const maxCount = recurrence.endAfterOccurrences || maxOccurrences

  while (currentDate <= recurrenceEnd && occurrenceCount < maxCount) {
    // Check if this occurrence is within the visible range
    if (currentDate >= rangeStart || new Date(currentDate.getTime() + duration) >= rangeStart) {
      if (shouldIncludeOccurrence(currentDate, recurrence)) {
        const occurrenceStart = new Date(currentDate)
        const occurrenceEnd = new Date(currentDate.getTime() + duration)

        occurrences.push({
          ...event,
          id: `${event.id}_${occurrenceStart.toISOString()}`,
          start: occurrenceStart.toISOString(),
          end: occurrenceEnd.toISOString(),
          // Mark as recurring instance
          metadata: {
            ...event.metadata,
            isRecurringInstance: true,
            originalEventId: event.id,
            occurrenceDate: occurrenceStart.toISOString()
          }
        })
        occurrenceCount++
      }
    }

    // Move to next occurrence based on frequency
    currentDate = getNextOccurrenceDate(currentDate, recurrence)
    
    // Safety check to prevent infinite loops
    if (occurrenceCount > maxOccurrences) break
  }

  return occurrences
}

/**
 * Check if the current date should be included based on recurrence rules
 */
const shouldIncludeOccurrence = (date: Date, recurrence: RecurrencePattern): boolean => {
  // For weekly recurrence with specific days of week
  if (recurrence.frequency === 'weekly' && recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
    return recurrence.daysOfWeek.includes(date.getDay())
  }

  // For monthly recurrence with specific day of month
  if (recurrence.frequency === 'monthly' && recurrence.dayOfMonth) {
    return date.getDate() === recurrence.dayOfMonth
  }

  return true
}

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
const getNextOccurrenceDate = (currentDate: Date, recurrence: RecurrencePattern): Date => {
  const next = new Date(currentDate)
  const interval = recurrence.interval || 1

  switch (recurrence.frequency) {
    case 'daily':
      next.setDate(next.getDate() + interval)
      break
    
    case 'weekly':
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        // Find next day in the daysOfWeek array
        let found = false
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(next)
          checkDate.setDate(checkDate.getDate() + i)
          if (recurrence.daysOfWeek.includes(checkDate.getDay())) {
            // Check if we've completed a week cycle
            const weeksPassed = Math.floor(i / 7)
            if (weeksPassed === 0 || (weeksPassed >= interval - 1)) {
              next.setDate(next.getDate() + i)
              found = true
              break
            }
          }
        }
        if (!found) {
          next.setDate(next.getDate() + (7 * interval))
        }
      } else {
        next.setDate(next.getDate() + (7 * interval))
      }
      break
    
    case 'monthly':
      next.setMonth(next.getMonth() + interval)
      // Handle edge cases like Jan 31 -> Feb 28
      if (recurrence.dayOfMonth) {
        const targetDay = recurrence.dayOfMonth
        const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next.setDate(Math.min(targetDay, daysInMonth))
      }
      break
    
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval)
      break
  }

  return next
}

// Props with defaults
const props = withDefaults(defineProps<SchedulerCalendarProps>(), {
  events: () => [],
  categories: () => [],
  selectedDate: () => new Date(),
  view: 'monthly',
  theme: 'light',
  locale: 'en-US',
  timeInterval: 60,
  workingHours: () => ({ start: 9, end: 17, daysOfWeek: [1, 2, 3, 4, 5] }),
  showWeekNumbers: false,
  showAllDaySlot: true,
  allowEventCreation: true,
  allowEventEditing: true,
  allowEventDeletion: true,
  firstDayOfWeek: 0,
  textLabels: () => ({})
})

// Emits
const emit = defineEmits<SchedulerCalendarEmits>()

// Reactive State
const currentDate = ref(new Date(props.selectedDate!))
const currentView = ref<SchedulerViewType>(props.view!)

// Labels with defaults
const labels = computed(() => ({
  today: props.textLabels?.today || 'Today',
  previousPeriod: props.textLabels?.previousPeriod || 'Previous',
  nextPeriod: props.textLabels?.nextPeriod || 'Next',
  yearView: props.textLabels?.yearView || 'Year',
  monthView: props.textLabels?.monthView || 'Month',
  weekView: props.textLabels?.weekView || 'Week',
  dayView: props.textLabels?.dayView || 'Day',
  hourView: props.textLabels?.hourView || 'Hour',
  allDay: props.textLabels?.allDay || 'All Day',
  noEvents: props.textLabels?.noEvents || 'No events',
  createEvent: props.textLabels?.createEvent || 'Create Event',
  editEvent: props.textLabels?.editEvent || 'Edit Event',
  deleteEvent: props.textLabels?.deleteEvent || 'Delete Event',
  eventDetails: props.textLabels?.eventDetails || 'Event Details',
  conflictWarning: props.textLabels?.conflictWarning || 'Time conflict detected',
  cancel: props.textLabels?.cancel || 'Cancel',
  save: props.textLabels?.save || 'Save'
}))

// View options
const viewOptions = computed(() => [
  { value: 'yearly' as SchedulerViewType, label: labels.value.yearView },
  { value: 'monthly' as SchedulerViewType, label: labels.value.monthView },
  { value: 'weekly' as SchedulerViewType, label: labels.value.weekView },
  { value: 'daily' as SchedulerViewType, label: labels.value.dayView },
  { value: 'hourly' as SchedulerViewType, label: labels.value.hourView }
])

// Computed: Current year
const currentYear = computed(() => currentDate.value.getFullYear())

// Computed: Expanded events (including recurring event instances)
const expandedEvents = computed((): ResourceEvent[] => {
  const range = getVisibleDateRange()
  const rangeStart = new Date(range.start)
  const rangeEnd = new Date(range.end)
  
  // Add buffer for events that might span into the visible range
  rangeStart.setDate(rangeStart.getDate() - 7)
  rangeEnd.setDate(rangeEnd.getDate() + 7)
  
  return expandRecurringEvents(props.events || [], rangeStart, rangeEnd)
})

// Computed: Current period title based on view
const currentPeriodTitle = computed(() => {
  const date = currentDate.value

  switch (currentView.value) {
    case 'yearly':
      return date.getFullYear().toString()
    
    case 'monthly':
      return new Intl.DateTimeFormat(props.locale, { 
        year: 'numeric', 
        month: 'long' 
      }).format(date)
    
    case 'weekly': {
      const weekStart = getWeekStart(date)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      const startFormat = new Intl.DateTimeFormat(props.locale, { 
        month: 'short', 
        day: 'numeric' 
      }).format(weekStart)
      
      const endFormat = new Intl.DateTimeFormat(props.locale, { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }).format(weekEnd)
      
      return `${startFormat} - ${endFormat}`
    }
    
    case 'daily':
    case 'hourly':
      return new Intl.DateTimeFormat(props.locale, { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      }).format(date)
    
    default:
      return new Intl.DateTimeFormat(props.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
  }
})

// Helper: Get start of week
const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < props.firstDayOfWeek! ? 7 : 0) + day - props.firstDayOfWeek!
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Helper: Format date to ISO string (YYYY-MM-DD)
const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Navigation methods
const navigatePrevious = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() - 1)
      break
    case 'monthly':
      newDate.setMonth(newDate.getMonth() - 1)
      break
    case 'weekly':
      newDate.setDate(newDate.getDate() - 7)
      break
    case 'daily':
    case 'hourly':
      newDate.setDate(newDate.getDate() - 1)
      break
  }
  
  currentDate.value = newDate
  emit('update:selectedDate', newDate)
  emitDateRangeChange()
}

const navigateNext = () => {
  const newDate = new Date(currentDate.value)
  
  switch (currentView.value) {
    case 'yearly':
      newDate.setFullYear(newDate.getFullYear() + 1)
      break
    case 'monthly':
      newDate.setMonth(newDate.getMonth() + 1)
      break
    case 'weekly':
      newDate.setDate(newDate.getDate() + 7)
      break
    case 'daily':
    case 'hourly':
      newDate.setDate(newDate.getDate() + 1)
      break
  }
  
  currentDate.value = newDate
  emit('update:selectedDate', newDate)
  emitDateRangeChange()
}

const goToToday = () => {
  currentDate.value = new Date()
  emit('update:selectedDate', currentDate.value)
  emitDateRangeChange()
}

const switchView = (view: SchedulerViewType) => {
  currentView.value = view
  emit('update:view', view)
  emit('view-change', view)
  emitDateRangeChange()
}

// Emit date range change
const emitDateRangeChange = () => {
  const range = getVisibleDateRange()
  emit('date-range-change', range)
}

// Get visible date range based on current view
const getVisibleDateRange = (): { start: string; end: string } => {
  const date = currentDate.value
  let start: Date
  let end: Date

  switch (currentView.value) {
    case 'yearly':
      start = new Date(date.getFullYear(), 0, 1)
      end = new Date(date.getFullYear(), 11, 31)
      break
    case 'monthly':
      start = new Date(date.getFullYear(), date.getMonth(), 1)
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      break
    case 'weekly':
      start = getWeekStart(date)
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      break
    case 'daily':
    case 'hourly':
    default:
      start = new Date(date)
      start.setHours(0, 0, 0, 0)
      end = new Date(date)
      end.setHours(23, 59, 59, 999)
      break
  }

  return {
    start: toDateString(start),
    end: toDateString(end)
  }
}

// Event handlers
const handleMonthClick = (month: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(month)
  currentDate.value = newDate
  switchView('monthly')
}

const handleDateClick = (dateString: string) => {
  currentDate.value = new Date(dateString)
  emit('date-click', dateString)
  emit('update:selectedDate', currentDate.value)
}

const handleEventClick = (event: ResourceEvent) => {
  emit('event-click', event)
}

const handleSlotClick = (slot: TimeSlot) => {
  emit('slot-click', slot)
  if (props.allowEventCreation) {
    emit('event-create', {
      start: slot.start,
      end: slot.end,
      allDay: false
    })
  }
}

// Watchers
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate)
  }
})

watch(() => props.view, (newView) => {
  if (newView) {
    currentView.value = newView
  }
})
</script>

<style scoped>
.resource-scheduler-calendar {
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  border: 1px solid #e2e8f0;
}

.theme-dark {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
}

/* Header */
.scheduler-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.theme-dark .scheduler-header {
  background: #0f172a;
  border-color: #334155;
}

/* Navigation Controls */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
}

.nav-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.theme-dark .nav-btn {
  background: #334155;
  border-color: #475569;
  color: #e2e8f0;
}

.theme-dark .nav-btn:hover {
  background: #475569;
}

.nav-arrow {
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
}

.today-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Period Title */
.period-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.theme-dark .period-title {
  color: #f1f5f9;
}

/* View Switcher */
.view-switcher {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.theme-dark .view-switcher {
  border-color: #475569;
}

.view-btn {
  padding: 8px 14px;
  border: none;
  background: white;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #e2e8f0;
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: #f1f5f9;
}

.view-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.theme-dark .view-btn {
  background: #1e293b;
  color: #94a3b8;
  border-color: #475569;
}

.theme-dark .view-btn:hover {
  background: #334155;
}

.theme-dark .view-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

/* Content Area */
.scheduler-content {
  padding: 20px;
  min-height: 400px;
}

.theme-dark .scheduler-content {
  background: #1e293b;
}

/* Legend */
.scheduler-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.theme-dark .scheduler-legend {
  background: #0f172a;
  border-color: #334155;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.theme-dark .legend-item {
  color: #94a3b8;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid;
}

/* Responsive - Tablet */
@media (max-width: 992px) {
  .scheduler-header {
    padding: 14px 16px;
    gap: 12px;
  }

  .period-title {
    font-size: 18px;
    min-width: 180px;
  }

  .view-btn {
    padding: 7px 10px;
    font-size: 12px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .today-btn {
    padding: 7px 14px;
    font-size: 13px;
  }

  .scheduler-content {
    padding: 16px;
  }

  .scheduler-legend {
    padding: 12px 16px;
    gap: 12px;
  }

  .legend-item {
    font-size: 12px;
  }

  .legend-color {
    width: 14px;
    height: 14px;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .scheduler-header {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  .period-title {
    order: -1;
    width: 100%;
    font-size: 16px;
    min-width: unset;
  }

  .nav-controls {
    width: 100%;
    justify-content: center;
    gap: 6px;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .nav-arrow {
    font-size: 18px;
  }

  .today-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .view-switcher {
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    padding: 8px 6px;
    font-size: 11px;
  }

  .scheduler-content {
    padding: 12px;
    min-height: 300px;
  }

  .scheduler-legend {
    padding: 10px 12px;
    gap: 10px;
  }

  .legend-item {
    font-size: 11px;
    gap: 6px;
  }

  .legend-color {
    width: 12px;
    height: 12px;
  }
}

/* Responsive - Very small screens */
@media (max-width: 480px) {
  .scheduler-container {
    border-radius: 8px;
  }

  .scheduler-header {
    padding: 10px;
    gap: 8px;
  }

  .period-title {
    font-size: 14px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .nav-arrow {
    font-size: 16px;
  }

  .today-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .view-btn {
    padding: 6px 4px;
    font-size: 10px;
  }

  .scheduler-content {
    padding: 8px;
    min-height: 250px;
  }

  .scheduler-legend {
    padding: 8px 10px;
    gap: 8px;
  }

  .legend-item {
    font-size: 10px;
    gap: 4px;
  }

  .legend-color {
    width: 10px;
    height: 10px;
  }
}
</style>
