<template>
  <div class="weekly-view" :class="[`theme-${theme}`]" :style="{ '--slot-height': `${computedSlotHeight}px`, '--event-min-height': `${eventMinHeight}px` }">
    <!-- Header with Day Names -->
    <div class="week-header">
      <div class="time-column-header"></div>
      <div
        v-for="day in weekDays"
        :key="day.dateString"
        class="day-column-header"
        :class="{ 'is-today': highlightToday && day.isToday, 'is-weekend': highlightWeekends && day.isWeekend }"
      >
        <div class="day-name">{{ day.weekdayShort }}</div>
        <div class="day-number" :class="{ 'today-number': highlightToday && day.isToday }">
          {{ day.date.getDate() }}
        </div>
      </div>
    </div>

    <!-- All Day Events Row -->
    <div v-if="showAllDaySlot" class="all-day-row">
      <div class="time-label all-day-label">All Day</div>
      <div
        v-for="day in weekDays"
        :key="`allday-${day.dateString}`"
        class="all-day-cell"
        :class="{ 'is-today': highlightToday && day.isToday }"
        @click="handleAllDayClick(day)"
      >
        <div
          v-for="event in getAllDayEventsForDay(day.dateString)"
          :key="event.id"
          class="all-day-event"
          :style="getEventStyle(event)"
          @click.stop="handleEventClick(event)"
        >
          {{ event.title }}
        </div>
      </div>
    </div>

    <!-- Time Grid -->
    <div class="time-grid-container">
      <div class="time-grid">
        <template v-for="hour in hoursOfDay" :key="hour">
          <div class="time-row">
            <div class="time-label" :class="{ 'working-hour': isWorkingHour(hour) }">
              {{ formatHour(hour) }}
            </div>
            <div
              v-for="day in weekDays"
              :key="`${day.dateString}-${hour}`"
              class="time-slot"
              :class="{
                'working-hour': isWorkingHour(hour),
                'is-today': highlightToday && day.isToday,
                'is-weekend': highlightWeekends && day.isWeekend
              }"
              @click="handleSlotClick(day, hour)"
            >
              <div
                v-for="event in getEventsForSlot(day.dateString, hour)"
                :key="event.id"
                class="slot-event"
                :style="getPositionedEventStyle(event)"
                @click.stop="handleEventClick(event)"
              >
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatEventTimeRange(event) }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceEvent, EventCategory, WorkingHours, TimeInterval } from '../../types'

interface WeekDay {
  date: Date
  dateString: string
  weekdayShort: string
  isToday: boolean
  isWeekend: boolean
}

interface Props {
  currentDate: Date
  events: ResourceEvent[]
  theme: 'light' | 'dark'
  locale: string
  categories: EventCategory[]
  workingHours: WorkingHours
  timeInterval: TimeInterval
  firstDayOfWeek: number
  showAllDaySlot: boolean
  highlightToday?: boolean
  highlightWeekends?: boolean
  showCurrentTimeIndicator?: boolean
  slotHeight?: number
  eventMinHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  highlightToday: true,
  highlightWeekends: false,
  showCurrentTimeIndicator: true,
  slotHeight: 48,
  eventMinHeight: 20
})

const emit = defineEmits<{
  'date-click': [dateString: string]
  'event-click': [event: ResourceEvent]
  'slot-click': [slot: { start: string; end: string; date: string; hour: number }]
}>()

const computedSlotHeight = computed(() => {
  if (props.slotHeight) return props.slotHeight
  switch (props.timeInterval) {
    case 15: return 20
    case 30: return 30
    default: return 48
  }
})

const weekDays = computed((): WeekDay[] => {
  const days: WeekDay[] = []
  const startOfWeek = getWeekStart(props.currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const weekdayFormatter = new Intl.DateTimeFormat(props.locale, { weekday: 'short' })
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    
    days.push({
      date: new Date(date),
      dateString: toDateString(date),
      weekdayShort: weekdayFormatter.format(date),
      isToday: date.getTime() === today.getTime(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
  
  return days
})

const hoursOfDay = computed(() => {
  const hours: number[] = []
  for (let h = 0; h < 24; h++) {
    hours.push(h)
  }
  return hours
})

const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < props.firstDayOfWeek ? 7 : 0) + day - props.firstDayOfWeek
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isWorkingHour = (hour: number): boolean => {
  return hour >= props.workingHours.start && hour < props.workingHours.end
}

const formatHour = (hour: number): string => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(props.locale, {
    hour: 'numeric',
    hour12: true
  }).format(date)
}

const getAllDayEventsForDay = (dateString: string): ResourceEvent[] => {
  return props.events.filter(event => {
    if (!event.allDay) return false
    
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const checkDate = new Date(dateString)
    
    eventStart.setHours(0, 0, 0, 0)
    eventEnd.setHours(23, 59, 59, 999)
    checkDate.setHours(12, 0, 0, 0)
    
    return checkDate >= eventStart && checkDate <= eventEnd
  })
}

const getEventsForSlot = (dateString: string, hour: number): ResourceEvent[] => {
  return props.events.filter(event => {
    if (event.allDay) return false

    const eventStart = new Date(event.start)
    const slotStart = new Date(`${dateString}T${String(hour).padStart(2, '0')}:00:00`)
    const slotEnd = new Date(slotStart)
    slotEnd.setHours(slotEnd.getHours() + 1)

    return eventStart >= slotStart && eventStart < slotEnd
  })
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

const getPositionedEventStyle = (event: ResourceEvent): Record<string, string> => {
  const baseStyle = getEventStyle(event)
  
  const eventStart = new Date(event.start)
  const eventEnd = new Date(event.end)
  
  const minuteOffset = eventStart.getMinutes()
  const topOffset = (minuteOffset / 60) * computedSlotHeight.value

  const durationMs = eventEnd.getTime() - eventStart.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  const height = Math.max(durationHours * computedSlotHeight.value, props.eventMinHeight)
  
  return {
    ...baseStyle,
    top: `${topOffset}px`,
    height: `${height}px`,
    minHeight: '20px'
  }
}

const formatEventTimeRange = (event: ResourceEvent): string => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  
  const timeFormatter = new Intl.DateTimeFormat(props.locale, {
    hour: 'numeric',
    minute: '2-digit'
  })
  
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
}

const handleSlotClick = (day: WeekDay, hour: number) => {
  const start = `${day.dateString}T${String(hour).padStart(2, '0')}:00:00`
  const endHour = hour + 1
  const end = `${day.dateString}T${String(endHour).padStart(2, '0')}:00:00`
  
  emit('slot-click', { start, end, date: day.dateString, hour })
}

const handleAllDayClick = (day: WeekDay) => {
  emit('slot-click', {
    start: `${day.dateString}T00:00:00`,
    end: `${day.dateString}T23:59:59`,
    date: day.dateString,
    hour: 0
  })
}

const handleEventClick = (event: ResourceEvent) => {
  emit('event-click', event)
}
</script>

<style scoped>
.weekly-view {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.theme-dark .weekly-view {
  border-color: #334155;
}

/* Week Header */
.week-header {
  display: grid;
  grid-template-columns: 70px repeat(7, 1fr);
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.theme-dark .week-header {
  background: #0f172a;
  border-color: #334155;
}

.time-column-header {
  border-right: 1px solid #e2e8f0;
}

.theme-dark .time-column-header {
  border-color: #334155;
}

.day-column-header {
  padding: 12px 8px;
  text-align: center;
  border-right: 1px solid #e2e8f0;
}

.day-column-header:last-child {
  border-right: none;
}

.theme-dark .day-column-header {
  border-color: #334155;
}

.day-column-header.is-today {
  background: #eff6ff;
}

.theme-dark .day-column-header.is-today {
  background: #1e3a5f;
}

.day-column-header.is-weekend {
  background: #fefce8;
}

.theme-dark .day-column-header.is-weekend {
  background: #1c1917;
}

.day-name {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 4px;
}

.theme-dark .day-name {
  color: #94a3b8;
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  border-radius: 50%;
}

.theme-dark .day-number {
  color: #e2e8f0;
}

.day-number.today-number {
  background: #3b82f6;
  color: white;
}

/* All Day Row */
.all-day-row {
  display: grid;
  grid-template-columns: 70px repeat(7, 1fr);
  border-bottom: 1px solid #e2e8f0;
  background: #fafafa;
  min-height: 40px;
}

.theme-dark .all-day-row {
  background: #1e293b;
  border-color: #334155;
}

.all-day-label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.all-day-cell {
  padding: 4px;
  border-right: 1px solid #e2e8f0;
  min-height: 36px;
}

.all-day-cell:last-child {
  border-right: none;
}

.theme-dark .all-day-cell {
  border-color: #334155;
}

.all-day-cell.is-today {
  background: #eff6ff;
}

.theme-dark .all-day-cell.is-today {
  background: #1e3a5f;
}

.all-day-event {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
  cursor: pointer;
}

/* Time Grid */
.time-grid-container {
  max-height: 500px;
  overflow-y: auto;
}

.time-grid {
  display: flex;
  flex-direction: column;
}

.time-row {
  display: grid;
  grid-template-columns: 70px repeat(7, 1fr);
  min-height: 50px;
  border-bottom: 1px solid #f1f5f9;
}

.time-row:last-child {
  border-bottom: none;
}

.theme-dark .time-row {
  border-color: #334155;
}

.time-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px 8px;
  font-size: 11px;
  color: #94a3b8;
  border-right: 1px solid #e2e8f0;
  background: #fafafa;
}

.theme-dark .time-label {
  background: #0f172a;
  border-color: #334155;
  color: #64748b;
}

.time-label.working-hour {
  color: #64748b;
}

.theme-dark .time-label.working-hour {
  color: #94a3b8;
}

.time-slot {
  position: relative;
  border-right: 1px solid #f1f5f9;
  background: white;
  cursor: pointer;
  transition: background 0.15s ease;
}

.time-slot:last-child {
  border-right: none;
}

.time-slot:hover {
  background: #f8fafc;
}

.theme-dark .time-slot {
  background: #1e293b;
  border-color: #334155;
}

.theme-dark .time-slot:hover {
  background: #334155;
}

.time-slot.working-hour {
  background: white;
}

.theme-dark .time-slot.working-hour {
  background: #1e293b;
}

.time-slot:not(.working-hour) {
  background: #f8fafc;
}

.theme-dark .time-slot:not(.working-hour) {
  background: #0f172a;
}

.time-slot.is-today.working-hour {
  background: #fafbff;
}

.theme-dark .time-slot.is-today.working-hour {
  background: #1e3a5f;
}

/* Slot Events */
.slot-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  overflow: hidden;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.15s ease;
}

.slot-event:hover {
  transform: scale(1.02);
  z-index: 20;
}

.event-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
}

/* Responsive - Tablet */
@media (max-width: 992px) {
  .week-header,
  .all-day-row,
  .time-row {
    grid-template-columns: 60px repeat(7, 1fr);
  }

  .day-column-header {
    padding: 8px 4px;
  }

  .day-name {
    font-size: 10px;
  }

  .day-number {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .slot-event {
    padding: 2px 4px;
    font-size: 10px;
  }

  .event-time {
    font-size: 9px;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .weekly-view {
    overflow-x: auto;
  }

  .week-header,
  .all-day-row,
  .time-row {
    grid-template-columns: 45px repeat(7, minmax(60px, 1fr));
    min-width: 500px;
  }

  .time-label {
    font-size: 9px;
    padding: 2px 3px;
  }

  .day-column-header {
    padding: 6px 2px;
  }

  .day-name {
    font-size: 9px;
    letter-spacing: 0;
  }

  .day-number {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .time-grid-container {
    max-height: 400px;
  }

  .time-row {
    min-height: 40px;
  }

  .slot-event {
    padding: 1px 3px;
    font-size: 9px;
  }

  .event-title {
    font-size: 9px;
  }

  .event-time {
    display: none;
  }

  .all-day-event {
    font-size: 9px;
    padding: 1px 4px;
  }
}

/* Responsive - Very small screens */
@media (max-width: 480px) {
  .week-header,
  .all-day-row,
  .time-row {
    grid-template-columns: 40px repeat(7, minmax(50px, 1fr));
    min-width: 400px;
  }

  .time-label {
    font-size: 8px;
    padding: 1px 2px;
  }

  .day-name {
    font-size: 8px;
  }

  .day-number {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .time-row {
    min-height: 35px;
  }

  .slot-event {
    font-size: 8px;
    border-left-width: 2px !important;
  }
}
</style>
