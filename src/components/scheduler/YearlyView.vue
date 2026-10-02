<template>
  <div class="yearly-view" :class="[`theme-${theme}`]">
    <!-- Year Grid - 4 columns x 3 rows -->
    <div class="months-grid">
      <div
        v-for="(month, monthIndex) in months"
        :key="month.month"
        class="month-card"
        :class="{ 'current-month': month.isCurrentMonth, 'has-events': month.hasEvents }"
        :ref="el => monthCardNav.setCellRef(el, monthIndex)"
        :tabindex="monthCardNav.isTabbable(monthIndex) ? 0 : -1"
        role="button"
        :aria-label="`${month.name} ${month.year}, ${month.eventCount} event${month.eventCount !== 1 ? 's' : ''}`"
        @click="handleMonthClick(month.month)"
        @keydown="monthCardNav.handleKeydown($event, monthIndex)"
      >
        <!-- Month Header -->
        <div class="month-header">
          <span class="month-name">{{ month.name }}</span>
          <span v-if="monthHasConflict(month)" class="conflict-badge" title="Conflicts with another event" aria-label="Conflicts with another event">&#9888;</span>
          <span v-if="month.eventCount > 0" class="event-count">{{ month.eventCount }}</span>
        </div>

        <!-- Mini Calendar Grid -->
        <div class="mini-calendar">
          <!-- Weekday headers -->
          <div v-for="day in weekdayHeaders" :key="day" class="mini-weekday">
            {{ day }}
          </div>

          <!-- Days -->
          <template v-for="(day, index) in getMonthDays(month)" :key="index">
            <div v-if="day === null" class="mini-day empty"></div>
            <div
              v-else
              class="mini-day"
              :class="getDayClasses(month, day)"
              :ref="el => monthDayNavs[month.month].setCellRef(el, index)"
              :tabindex="monthDayNavs[month.month].isTabbable(index) ? 0 : -1"
              role="button"
              :aria-label="getDayAriaLabel(month, day)"
              @click.stop="handleDateClick(month, day)"
              @keydown.stop="monthDayNavs[month.month].handleKeydown($event, index)"
            >
              {{ day }}
            </div>
          </template>
        </div>

        <!-- Event Category Indicators -->
        <div v-if="getTopCategories(month).length > 0" class="category-indicators">
          <div
            v-for="(category, idx) in getTopCategories(month)"
            :key="idx"
            class="category-dot"
            :style="{ backgroundColor: category.color }"
            :title="category.name"
          ></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="totalEvents === 0" class="no-events-message">{{ noEventsLabel }}</div>

    <!-- Year Summary -->
    <div class="year-summary">
      <div class="summary-item">
        <div class="summary-value">{{ totalEvents }}</div>
        <div class="summary-label">Total Events</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ busiestMonth?.shortName || '-' }}</div>
        <div class="summary-label">Busiest Month</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ monthsWithEvents }}</div>
        <div class="summary-label">Active Months</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">{{ averageEventsPerMonth }}</div>
        <div class="summary-label">Avg per Month</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceEvent, EventCategory, SchedulerMonth } from '../../types'
import { parseLocalDate } from '../../utils/date'
import { useGridKeyboardNav } from '../../composables/useGridKeyboardNav'

interface Props {
  year: number
  events: ResourceEvent[]
  theme: 'light' | 'dark'
  locale: string
  categories: EventCategory[]
  highlightToday?: boolean
  firstDayOfWeek?: number
  conflictingEventIds?: string[]
  noEventsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  highlightToday: true,
  firstDayOfWeek: 0,
  conflictingEventIds: () => [],
  noEventsLabel: 'No events'
})

const emit = defineEmits<{
  'month-click': [month: number]
  'date-click': [dateString: string]
}>()

const weekdayHeaders = computed(() => {
  const formatter = new Intl.DateTimeFormat(props.locale, { weekday: 'narrow' })
  const days: string[] = []

  for (let i = 0; i < 7; i++) {
    const dayIndex = (props.firstDayOfWeek + i) % 7
    const date = new Date(2023, 0, 1 + dayIndex)
    days.push(formatter.format(date))
  }

  return days
})

const months = computed((): (SchedulerMonth & { isCurrentMonth: boolean })[] => {
  const monthFormatter = new Intl.DateTimeFormat(props.locale, { month: 'long' })
  const shortFormatter = new Intl.DateTimeFormat(props.locale, { month: 'short' })
  const today = new Date()
  
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(props.year, i, 1)
    const eventCount = getEventCountForMonth(i)
    
    return {
      date,
      month: i,
      year: props.year,
      name: monthFormatter.format(date),
      shortName: shortFormatter.format(date),
      eventCount,
      hasEvents: eventCount > 0,
      isCurrentMonth: today.getFullYear() === props.year && today.getMonth() === i
    }
  })
})

const totalEvents = computed(() => {
  return months.value.reduce((sum, m) => sum + m.eventCount, 0)
})

const busiestMonth = computed(() => {
  return months.value.reduce((busiest, month) => {
    if (!busiest || month.eventCount > busiest.eventCount) {
      return month
    }
    return busiest
  }, null as (SchedulerMonth & { isCurrentMonth: boolean }) | null)
})

const monthsWithEvents = computed(() => {
  return months.value.filter(m => m.hasEvents).length
})

const averageEventsPerMonth = computed(() => {
  if (totalEvents.value === 0) return 0
  return Math.round(totalEvents.value / 12)
})

const getEventCountForMonth = (month: number): number => {
  return props.events.filter(event => {
    const eventStart = parseLocalDate(event.start)
    const eventEnd = parseLocalDate(event.end)

    const monthStart = new Date(props.year, month, 1)
    const monthEnd = new Date(props.year, month + 1, 0, 23, 59, 59)

    return eventStart <= monthEnd && eventEnd >= monthStart
  }).length
}

const getMonthDays = (month: SchedulerMonth): (number | null)[] => {
  const firstDay = new Date(props.year, month.month, 1)
  const lastDay = new Date(props.year, month.month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const dayOfWeek = firstDay.getDay()
  const startOffset = (dayOfWeek - props.firstDayOfWeek + 7) % 7

  const days: (number | null)[] = []

  for (let i = 0; i < startOffset; i++) {
    days.push(null)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }

  return days
}

const getMonthEventDays = (month: SchedulerMonth): number[] => {
  const eventDays = new Set<number>()

  props.events.forEach(event => {
    const eventStart = parseLocalDate(event.start)
    const eventEnd = parseLocalDate(event.end)

    const monthStart = new Date(props.year, month.month, 1)
    const monthEnd = new Date(props.year, month.month + 1, 0)

    if (eventStart <= monthEnd && eventEnd >= monthStart) {
      const startDay = eventStart.getMonth() === month.month && eventStart.getFullYear() === props.year
        ? eventStart.getDate()
        : 1
      const endDay = eventEnd.getMonth() === month.month && eventEnd.getFullYear() === props.year
        ? eventEnd.getDate()
        : monthEnd.getDate()

      for (let d = startDay; d <= endDay; d++) {
        eventDays.add(d)
      }
    }
  })

  return Array.from(eventDays)
}

const getTopCategories = (month: SchedulerMonth): EventCategory[] => {
  const categoryIds = new Set<string>()

  props.events.forEach(event => {
    const eventStart = parseLocalDate(event.start)
    const eventEnd = parseLocalDate(event.end)

    const monthStart = new Date(props.year, month.month, 1)
    const monthEnd = new Date(props.year, month.month + 1, 0)

    if (eventStart <= monthEnd && eventEnd >= monthStart && event.categoryId) {
      categoryIds.add(event.categoryId)
    }
  })

  return props.categories
    .filter(c => categoryIds.has(c.id))
    .slice(0, 5)
}

// Whether any event overlapping this month has a detected conflict
const monthHasConflict = (month: SchedulerMonth): boolean => {
  if (props.conflictingEventIds.length === 0) return false

  const monthStart = new Date(props.year, month.month, 1)
  const monthEnd = new Date(props.year, month.month + 1, 0, 23, 59, 59)

  return props.events.some(event => {
    if (!props.conflictingEventIds.includes(event.id)) return false
    const eventStart = parseLocalDate(event.start)
    const eventEnd = parseLocalDate(event.end)
    return eventStart <= monthEnd && eventEnd >= monthStart
  })
}

const getDayClasses = (month: SchedulerMonth, day: number): Record<string, boolean> => {
  const today = new Date()
  const isToday = props.highlightToday && today.getFullYear() === props.year
    && today.getMonth() === month.month
    && today.getDate() === day

  const hasEvent = getMonthEventDays(month).includes(day)

  return {
    'is-today': isToday,
    'has-event': hasEvent
  }
}

const handleMonthClick = (month: number) => {
  emit('month-click', month)
}

const handleDateClick = (month: SchedulerMonth, day: number) => {
  const dateString = `${props.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  emit('date-click', dateString)
}

const getDayAriaLabel = (month: SchedulerMonth, day: number): string => {
  const hasEvent = getMonthEventDays(month).includes(day)
  return `${month.name} ${day}, ${props.year}${hasEvent ? ', has events' : ''}`
}

// Keyboard navigation: month-card grid (4 columns on desktop)
const monthCardNav = useGridKeyboardNav(
  () => months.value.length,
  {
    columns: 4,
    onActivate: (index) => {
      const month = months.value[index]
      if (month) handleMonthClick(month.month)
    }
  }
)

// Keyboard navigation: one instance per month's mini day-grid (7 columns)
const monthDayNavs = Array.from({ length: 12 }, (_, m) =>
  useGridKeyboardNav(
    () => getMonthDays(months.value[m]).length,
    {
      columns: 7,
      onActivate: (index) => {
        const days = getMonthDays(months.value[m])
        const day = days[index]
        if (day !== null) handleDateClick(months.value[m], day)
      }
    }
  )
)
</script>

<style scoped>
.yearly-view {
  width: 100%;
}

/* Months Grid */
.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 1200px) {
  .months-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .months-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .months-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* Month Card */
.month-card {
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.month-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.month-card:focus-visible,
.mini-day:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.theme-dark .month-card {
  background: #1e293b;
  border-color: #334155;
}

.theme-dark .month-card:hover {
  border-color: #475569;
}

.month-card.current-month {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.month-card.has-events {
  background: #fafbff;
}

.theme-dark .month-card.has-events {
  background: #1e293b;
}

/* Month Header */
.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.theme-dark .month-name {
  color: #e2e8f0;
}

.event-count {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
}

.theme-dark .event-count {
  background: #1e3a8a;
  color: #93c5fd;
}

.conflict-badge {
  font-size: 11px;
  color: #d97706;
  cursor: help;
}

.theme-dark .conflict-badge {
  color: #fbbf24;
}

.no-events-message {
  text-align: center;
  padding: 24px;
  margin-top: 16px;
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

.theme-dark .no-events-message {
  color: #64748b;
}

/* Mini Calendar */
.mini-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.mini-weekday {
  font-size: 9px;
  font-weight: 600;
  text-align: center;
  color: #94a3b8;
  padding: 2px 0;
}

.theme-dark .mini-weekday {
  color: #64748b;
}

.mini-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  font-size: 10px;
  color: #64748b;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.theme-dark .mini-day {
  color: #94a3b8;
}

.mini-day:hover:not(.empty) {
  background: #f1f5f9;
}

.theme-dark .mini-day:hover:not(.empty) {
  background: #334155;
}

.mini-day.empty {
  cursor: default;
}

.mini-day.is-today {
  background: #3b82f6;
  color: white;
  font-weight: 700;
}

.mini-day.has-event {
  background: #dcfce7;
  color: #166534;
}

.theme-dark .mini-day.has-event {
  background: #14532d;
  color: #86efac;
}

/* Category Indicators */
.category-indicators {
  display: flex;
  gap: 4px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Year Summary */
.year-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.theme-dark .year-summary {
  background: #0f172a;
  border-color: #334155;
}

@media (max-width: 768px) {
  .year-summary {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px;
    gap: 12px;
  }

  .month-card {
    padding: 12px;
  }

  .month-name {
    font-size: 13px;
  }

  .event-count {
    font-size: 10px;
    padding: 2px 6px;
  }

  .mini-day {
    height: 18px;
    font-size: 9px;
  }

  .mini-weekday {
    font-size: 8px;
  }

  .summary-value {
    font-size: 20px;
  }

  .summary-label {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .year-summary {
    padding: 12px;
    gap: 10px;
  }

  .month-card {
    padding: 10px;
  }

  .month-header {
    margin-bottom: 8px;
  }

  .month-name {
    font-size: 12px;
  }

  .mini-day {
    height: 16px;
    font-size: 8px;
  }

  .category-indicators {
    margin-top: 8px;
  }

  .category-dot {
    width: 6px;
    height: 6px;
  }

  .summary-value {
    font-size: 18px;
  }

  .summary-label {
    font-size: 9px;
  }
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.theme-dark .summary-value {
  color: #e2e8f0;
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.theme-dark .summary-label {
  color: #94a3b8;
}
</style>
