<template>
  <div
    class="resource-scheduler-calendar"
    :class="[
      `theme-${theme}`,
      { 'compact-mode': compactMode },
      { 'highlight-weekends': highlightWeekends }
    ]"
    :style="cssVariables"
  >
    <!-- Legend (Top Position) -->
    <div
      v-if="showLegend && legendPosition === 'top'"
      class="scheduler-legend legend-top"
    >
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

    <!-- Header with Navigation and View Switcher -->
    <div v-if="showHeader" class="scheduler-header">
      <!-- Navigation Controls -->
      <div v-if="showNavigation" class="nav-controls">
        <button type="button" @click="navigatePrevious" class="nav-btn" :aria-label="labels.previousPeriod">
          <span class="nav-arrow">&#8249;</span>
        </button>

        <button v-if="showTodayButton" type="button" @click="goToToday" class="today-btn">
          {{ labels.today }}
        </button>

        <button type="button" @click="navigateNext" class="nav-btn" :aria-label="labels.nextPeriod">
          <span class="nav-arrow">&#8250;</span>
        </button>
      </div>

      <!-- Current Period Title -->
      <h2 v-if="showTitle" class="period-title">{{ currentPeriodTitle }}</h2>

      <!-- View Switcher -->
      <div v-if="showViewSwitcher && filteredViewOptions.length > 1" class="view-switcher">
        <button
          v-for="viewOption in filteredViewOptions"
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
        :events="events"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :highlight-today="highlightToday"
        :first-day-of-week="firstDayOfWeek"
        @month-click="handleMonthClick"
        @date-click="handleDateClick"
      />

      <!-- Monthly View -->
      <MonthlyView
        v-else-if="currentView === 'monthly'"
        :current-date="currentDate"
        :events="events"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :first-day-of-week="firstDayOfWeek"
        :highlight-today="highlightToday"
        :highlight-weekends="highlightWeekends"
        :max-events-per-slot="maxEventsPerSlot"
        :show-week-numbers="showWeekNumbers"
        @date-click="handleDateClick"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Weekly View -->
      <WeeklyView
        v-else-if="currentView === 'weekly'"
        :current-date="currentDate"
        :events="events"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        :first-day-of-week="firstDayOfWeek"
        :show-all-day-slot="showAllDaySlot"
        :highlight-today="highlightToday"
        :highlight-weekends="highlightWeekends"
        :show-current-time-indicator="showCurrentTimeIndicator"
        :slot-height="resolvedSlotHeight.weekly"
        :event-min-height="eventMinHeight"
        @date-click="handleDateClick"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Daily View -->
      <DailyView
        v-else-if="currentView === 'daily'"
        :current-date="currentDate"
        :events="events"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        :show-all-day-slot="showAllDaySlot"
        :highlight-today="highlightToday"
        :show-current-time-indicator="showCurrentTimeIndicator"
        :slot-height="resolvedSlotHeight.daily"
        :event-min-height="eventMinHeight"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />

      <!-- Hourly View -->
      <HourlyView
        v-else-if="currentView === 'hourly'"
        :current-date="currentDate"
        :events="events"
        :theme="theme"
        :locale="locale"
        :categories="categories"
        :working-hours="workingHours"
        :time-interval="timeInterval"
        :show-current-time-indicator="showCurrentTimeIndicator"
        :slot-height="resolvedSlotHeight.hourly"
        :event-min-height="eventMinHeight"
        @event-click="handleEventClick"
        @slot-click="handleSlotClick"
      />
    </div>

    <!-- Legend (Bottom Position - Default) -->
    <div
      v-if="showLegend && legendPosition === 'bottom'"
      class="scheduler-legend legend-bottom"
    >
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
  TimeSlot
} from '../types'

// Sub-components
import YearlyView from './scheduler/YearlyView.vue'
import MonthlyView from './scheduler/MonthlyView.vue'
import WeeklyView from './scheduler/WeeklyView.vue'
import DailyView from './scheduler/DailyView.vue'
import HourlyView from './scheduler/HourlyView.vue'

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
  textLabels: () => ({}),
  // New enhanced props defaults
  enabledViews: () => ['yearly', 'monthly', 'weekly', 'daily', 'hourly'],
  slotHeight: () => ({ hourly: 60, daily: 48, weekly: 48 }),
  responsiveBreakpoints: () => ({ mobile: 480, tablet: 768, desktop: 1024 }),
  headerOptions: () => ({ showNavigation: true, showToday: true, showViewSwitcher: true, showTitle: true }),
  legendOptions: () => ({ show: true, position: 'bottom' }),
  showCurrentTimeIndicator: true,
  highlightToday: true,
  highlightWeekends: false,
  maxEventsPerSlot: 3,
  eventMinHeight: 20,
  compactMode: false
})

// Emits
const emit = defineEmits<SchedulerCalendarEmits>()

// Reactive State
const currentDate = ref(new Date(props.selectedDate!))
const currentView = ref<SchedulerViewType>(props.view!)

// Computed: Header options
const showHeader = computed(() => {
  const opts = props.headerOptions
  return opts?.showNavigation || opts?.showToday || opts?.showViewSwitcher || opts?.showTitle
})

const showNavigation = computed(() => props.headerOptions?.showNavigation !== false)
const showTodayButton = computed(() => props.headerOptions?.showToday !== false)
const showViewSwitcher = computed(() => props.headerOptions?.showViewSwitcher !== false)
const showTitle = computed(() => props.headerOptions?.showTitle !== false)

// Computed: Legend options
const showLegend = computed(() => {
  if (props.legendOptions?.show === false) return false
  return props.categories && props.categories.length > 0
})

const legendPosition = computed(() => props.legendOptions?.position || 'bottom')

// Computed: Resolved slot heights with defaults
const resolvedSlotHeight = computed(() => ({
  hourly: props.slotHeight?.hourly ?? 60,
  daily: props.slotHeight?.daily ?? 48,
  weekly: props.slotHeight?.weekly ?? 48
}))

// Computed: CSS Variables for dynamic styling
const cssVariables = computed(() => ({
  '--breakpoint-mobile': `${props.responsiveBreakpoints?.mobile ?? 480}px`,
  '--breakpoint-tablet': `${props.responsiveBreakpoints?.tablet ?? 768}px`,
  '--breakpoint-desktop': `${props.responsiveBreakpoints?.desktop ?? 1024}px`,
  '--slot-height-hourly': `${resolvedSlotHeight.value.hourly}px`,
  '--slot-height-daily': `${resolvedSlotHeight.value.daily}px`,
  '--slot-height-weekly': `${resolvedSlotHeight.value.weekly}px`,
  '--event-min-height': `${props.eventMinHeight ?? 20}px`
}))

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

// All view options
const allViewOptions = computed(() => [
  { value: 'yearly' as SchedulerViewType, label: labels.value.yearView },
  { value: 'monthly' as SchedulerViewType, label: labels.value.monthView },
  { value: 'weekly' as SchedulerViewType, label: labels.value.weekView },
  { value: 'daily' as SchedulerViewType, label: labels.value.dayView },
  { value: 'hourly' as SchedulerViewType, label: labels.value.hourView }
])

// Filtered view options based on enabledViews prop
const filteredViewOptions = computed(() => {
  const enabled = props.enabledViews || ['yearly', 'monthly', 'weekly', 'daily', 'hourly']
  return allViewOptions.value.filter(opt => enabled.includes(opt.value))
})

// Computed: Current year
const currentYear = computed(() => currentDate.value.getFullYear())

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
  // Only switch to enabled views
  const enabled = props.enabledViews || ['yearly', 'monthly', 'weekly', 'daily', 'hourly']
  if (!enabled.includes(view)) return

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

  // Switch to monthly if enabled, otherwise stay in current view
  const enabled = props.enabledViews || ['yearly', 'monthly', 'weekly', 'daily', 'hourly']
  if (enabled.includes('monthly')) {
    switchView('monthly')
  }
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

// Ensure current view is valid when enabledViews changes
watch(() => props.enabledViews, (enabledViews) => {
  if (enabledViews && enabledViews.length > 0 && !enabledViews.includes(currentView.value)) {
    currentView.value = enabledViews[0]
    emit('update:view', currentView.value)
    emit('view-change', currentView.value)
  }
}, { immediate: true })
</script>

<style scoped>
.resource-scheduler-calendar {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --slot-height-hourly: 60px;
  --slot-height-daily: 48px;
  --slot-height-weekly: 48px;
  --event-min-height: 20px;

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

/* Compact Mode */
.compact-mode {
  font-size: 0.875rem;
}

.compact-mode .scheduler-header {
  padding: 8px 12px;
  gap: 8px;
}

.compact-mode .nav-btn {
  width: 28px;
  height: 28px;
}

.compact-mode .today-btn {
  padding: 4px 10px;
  font-size: 12px;
}

.compact-mode .period-title {
  font-size: 16px;
  min-width: 150px;
}

.compact-mode .view-btn {
  padding: 4px 8px;
  font-size: 11px;
}

.compact-mode .scheduler-content {
  padding: 12px;
  min-height: 300px;
}

.compact-mode .scheduler-legend {
  padding: 8px 12px;
  gap: 10px;
}

.compact-mode .legend-item {
  font-size: 11px;
}

.compact-mode .legend-color {
  width: 12px;
  height: 12px;
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

.nav-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
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

.today-btn:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
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

.view-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
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
}

.scheduler-legend.legend-top {
  border-bottom: 1px solid #e2e8f0;
}

.scheduler-legend.legend-bottom {
  border-top: 1px solid #e2e8f0;
}

.theme-dark .scheduler-legend {
  background: #0f172a;
}

.theme-dark .scheduler-legend.legend-top {
  border-color: #334155;
}

.theme-dark .scheduler-legend.legend-bottom {
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
@media (max-width: 768px) {
  .scheduler-header {
    flex-direction: column;
    gap: 12px;
  }

  .period-title {
    order: -1;
    width: 100%;
  }

  .nav-controls,
  .view-switcher {
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
    padding: 8px 8px;
    font-size: 12px;
  }

  .scheduler-content {
    padding: 12px;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  .resource-scheduler-calendar {
    border-radius: 8px;
  }

  .scheduler-header {
    padding: 12px;
    gap: 10px;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
  }

  .nav-arrow {
    font-size: 18px;
  }

  .today-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .period-title {
    font-size: 16px;
    min-width: auto;
  }

  .view-btn {
    padding: 6px 6px;
    font-size: 11px;
  }

  .scheduler-content {
    padding: 8px;
    min-height: 300px;
  }

  .scheduler-legend {
    padding: 12px;
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
</style>
