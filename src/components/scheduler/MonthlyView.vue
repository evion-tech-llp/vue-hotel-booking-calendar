<template>
  <div class="monthly-view" :class="[`theme-${theme}`, { 'show-week-numbers': showWeekNumbers }]">
    <!-- Weekday Headers -->
    <div class="weekday-headers">
      <div v-if="showWeekNumbers" class="weekday-header week-number-header">Wk</div>
      <div v-for="day in weekdayHeaders" :key="day" class="weekday-header">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid" :class="{ 'with-week-numbers': showWeekNumbers }">
      <template v-for="(day, index) in calendarDays" :key="day.dateString">
        <!-- Week Number Column -->
        <div
          v-if="showWeekNumbers && index % 7 === 0"
          class="week-number-cell"
        >
          {{ getWeekNumber(day.date) }}
        </div>

        <!-- Day Cell -->
        <div
          class="day-cell"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': highlightToday && day.isToday,
            'weekend': highlightWeekends && day.isWeekend,
            'selected': isSelected(day.dateString)
          }"
          @click="handleDayClick(day)"
        >
          <!-- Day Number -->
          <div class="day-header">
            <span class="day-number" :class="{ 'today-number': highlightToday && day.isToday }">
              {{ day.date.getDate() }}
            </span>
            <span v-if="getEventsForDay(day.dateString).length > maxEventsPerSlot" class="more-events">
              +{{ getEventsForDay(day.dateString).length - maxEventsPerSlot }}
            </span>
          </div>

          <!-- Events List -->
          <div class="events-list">
            <div
              v-for="event in getEventsForDay(day.dateString).slice(0, maxEventsPerSlot)"
              :key="event.id"
              class="event-item"
              :style="getEventStyle(event)"
              :title="event.title"
              @click.stop="handleEventClick(event)"
            >
              <span v-if="!event.allDay" class="event-time">
                {{ formatEventTime(event.start) }}
              </span>
              {{ event.title }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceEvent, EventCategory, SchedulerDay } from '../../types'

interface Props {
  currentDate: Date
  events: ResourceEvent[]
  theme: 'light' | 'dark'
  locale: string
  categories: EventCategory[]
  firstDayOfWeek: number
  highlightToday?: boolean
  highlightWeekends?: boolean
  maxEventsPerSlot?: number
  showWeekNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  highlightToday: true,
  highlightWeekends: false,
  maxEventsPerSlot: 3,
  showWeekNumbers: false
})

const emit = defineEmits<{
  'date-click': [dateString: string]
  'event-click': [event: ResourceEvent]
  'slot-click': [slot: { start: string; end: string; date: string }]
}>()

// Computed: Weekday headers
const weekdayHeaders = computed(() => {
  const formatter = new Intl.DateTimeFormat(props.locale, { weekday: 'short' })
  const days: string[] = []
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (props.firstDayOfWeek + i) % 7
    const date = new Date(2023, 0, 1 + dayIndex)
    days.push(formatter.format(date))
  }
  
  return days
})

// Computed: Calendar days for the current month
const calendarDays = computed((): SchedulerDay[] => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  
  const startDate = new Date(firstDay)
  let dayOfWeek = startDate.getDay()
  let daysToSubtract = (dayOfWeek - props.firstDayOfWeek + 7) % 7
  startDate.setDate(startDate.getDate() - daysToSubtract)
  
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 41)
  
  const days: SchedulerDay[] = []
  const current = new Date(startDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  while (current <= endDate) {
    const dateString = toDateString(current)
    const dayEvents = getEventsForDateString(dateString)
    
    days.push({
      date: new Date(current),
      dateString,
      isToday: current.getTime() === today.getTime(),
      isCurrentMonth: current.getMonth() === month,
      isCurrentWeek: isSameWeek(current, today),
      isWeekend: current.getDay() === 0 || current.getDay() === 6,
      isWorkingDay: isWorkingDay(current),
      events: dayEvents
    })
    
    current.setDate(current.getDate() + 1)
  }
  
  return days
})

const selectedDateString = computed(() => toDateString(props.currentDate))

const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isSameWeek = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  
  const startOfWeek1 = new Date(d1)
  startOfWeek1.setDate(d1.getDate() - ((d1.getDay() - props.firstDayOfWeek + 7) % 7))
  
  const startOfWeek2 = new Date(d2)
  startOfWeek2.setDate(d2.getDate() - ((d2.getDay() - props.firstDayOfWeek + 7) % 7))
  
  return startOfWeek1.getTime() === startOfWeek2.getTime()
}

const isWorkingDay = (date: Date): boolean => {
  const day = date.getDay()
  return day !== 0 && day !== 6
}

const getEventsForDateString = (dateString: string): ResourceEvent[] => {
  return props.events.filter(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const checkDate = new Date(dateString)
    
    eventStart.setHours(0, 0, 0, 0)
    eventEnd.setHours(23, 59, 59, 999)
    checkDate.setHours(12, 0, 0, 0)
    
    return checkDate >= eventStart && checkDate <= eventEnd
  }).sort((a, b) => {
    if (a.allDay && !b.allDay) return -1
    if (!a.allDay && b.allDay) return 1
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

const getEventsForDay = (dateString: string): ResourceEvent[] => {
  return getEventsForDateString(dateString)
}

const isSelected = (dateString: string): boolean => {
  return dateString === selectedDateString.value
}

const getEventStyle = (event: ResourceEvent): Record<string, string> => {
  let backgroundColor = event.backgroundColor || '#3b82f6'
  let color = event.color || '#ffffff'
  
  if (event.categoryId) {
    const category = props.categories.find(c => c.id === event.categoryId)
    if (category) {
      backgroundColor = props.theme === 'dark' && category.darkBackgroundColor 
        ? category.darkBackgroundColor 
        : category.backgroundColor
      color = category.color
    }
  }
  
  return {
    backgroundColor,
    color,
    borderLeft: `3px solid ${color}`
  }
}

const formatEventTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString)
  return new Intl.DateTimeFormat(props.locale, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

const handleDayClick = (day: SchedulerDay) => {
  emit('date-click', day.dateString)
  emit('slot-click', {
    start: `${day.dateString}T09:00:00`,
    end: `${day.dateString}T10:00:00`,
    date: day.dateString
  })
}

const handleEventClick = (event: ResourceEvent) => {
  emit('event-click', event)
}

// Get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
</script>

<style scoped>
.monthly-view {
  width: 100%;
}

/* Weekday Headers */
.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.show-week-numbers .weekday-headers {
  grid-template-columns: 32px repeat(7, 1fr);
}

.week-number-header {
  font-size: 10px !important;
}

.weekday-header {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 4px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 6px;
}

.theme-dark .weekday-header {
  color: #94a3b8;
  background: #0f172a;
}

/* Calendar Grid - Consistent cell sizing */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-grid.with-week-numbers {
  grid-template-columns: 32px repeat(7, 1fr);
}

.week-number-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border-radius: 4px;
  min-height: 80px;
}

.theme-dark .week-number-cell {
  color: #94a3b8;
  background: #0f172a;
}

.day-cell {
  /* Fixed aspect ratio for consistent sizing */
  aspect-ratio: 1 / 1;
  min-height: 80px;
  max-height: 140px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.day-cell:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  transform: scale(1.02);
  z-index: 10;
}

.theme-dark .day-cell {
  background: #1e293b;
  border-color: #334155;
}

.theme-dark .day-cell:hover {
  background: #334155;
  border-color: #64748b;
}

.day-cell.other-month {
  background: #f1f5f9;
  opacity: 0.5;
}

.theme-dark .day-cell.other-month {
  background: #0f172a;
  opacity: 0.4;
}

.day-cell.weekend {
  background: #fffbeb;
}

.theme-dark .day-cell.weekend {
  background: #1c1917;
}

.day-cell.today {
  background: #eff6ff;
  border-color: #3b82f6;
  border-width: 2px;
}

.theme-dark .day-cell.today {
  background: #1e3a5f;
  border-color: #3b82f6;
}

.day-cell.selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}

/* Day Header */
.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  border-radius: 50%;
  flex-shrink: 0;
}

.theme-dark .day-number {
  color: #e2e8f0;
}

.day-number.today-number {
  background: #3b82f6;
  color: white;
  font-weight: 700;
}

.more-events {
  font-size: 10px;
  padding: 2px 5px;
  background: #e2e8f0;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  flex-shrink: 0;
}

.theme-dark .more-events {
  background: #475569;
  color: #e2e8f0;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.event-item {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.event-item:hover {
  transform: scale(1.02);
  z-index: 5;
}

.event-time {
  margin-right: 3px;
  opacity: 0.8;
  font-size: 9px;
}

/* Responsive - Tablet */
@media (max-width: 992px) {
  .day-cell {
    min-height: 70px;
    max-height: 120px;
    padding: 4px;
  }

  .day-number {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .event-item {
    font-size: 9px;
    padding: 2px 4px;
  }

  .weekday-header {
    font-size: 10px;
    padding: 8px 2px;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .day-cell {
    aspect-ratio: auto;
    min-height: 50px;
    max-height: 80px;
    padding: 3px;
    border-radius: 4px;
  }

  .day-header {
    margin-bottom: 2px;
  }

  .day-number {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }

  .more-events {
    font-size: 8px;
    padding: 1px 3px;
  }

  .event-item {
    font-size: 8px;
    padding: 1px 3px;
  }

  .event-time {
    display: none;
  }

  .weekday-header {
    font-size: 9px;
    padding: 6px 2px;
  }

  .events-list {
    gap: 1px;
  }
}

/* Responsive - Very small screens */
@media (max-width: 400px) {
  .weekday-header {
    font-size: 8px;
    padding: 4px 1px;
  }

  .day-cell {
    min-height: 40px;
    max-height: 60px;
    padding: 2px;
  }

  .day-number {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .event-item {
    font-size: 7px;
    padding: 1px 2px;
    border-left-width: 2px !important;
  }

  .more-events {
    display: none;
  }
}
</style>
