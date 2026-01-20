<template>
  <div class="daily-view" :class="[`theme-${theme}`]" :style="{ '--slot-height': `${slotHeight}px`, '--event-min-height': `${eventMinHeight}px` }">
    <!-- Day Header -->
    <div class="day-header-section">
      <div class="weekday-label">{{ dayInfo.weekday }}</div>
      <div class="date-display" :class="{ 'is-today': highlightToday && dayInfo.isToday }">
        {{ dayInfo.dayNumber }}
      </div>
    </div>

    <!-- All Day Section -->
    <div v-if="showAllDaySlot" class="all-day-section">
      <div class="section-label">All Day Events</div>
      <div v-if="allDayEvents.length === 0" class="no-events">No all-day events</div>
      <div class="all-day-events">
        <div
          v-for="event in allDayEvents"
          :key="event.id"
          class="all-day-event"
          :style="getEventStyle(event)"
          @click="handleEventClick(event)"
        >
          <div class="event-title">{{ event.title }}</div>
          <div v-if="event.description" class="event-description">{{ event.description }}</div>
        </div>
      </div>
    </div>

    <!-- Time Grid -->
    <div class="time-grid-wrapper">
      <div class="time-grid">
        <div v-for="hour in hoursOfDay" :key="hour" class="hour-row">
          <!-- Time Label -->
          <div class="hour-label" :class="{ 'working-hour': isWorkingHour(hour) }">
            {{ formatHour(hour) }}
          </div>

          <!-- Time Slot -->
          <div 
            class="hour-slot"
            :class="{
              'working-hour': isWorkingHour(hour),
              'current-hour': isCurrentHour(hour)
            }"
            @click="handleSlotClick(hour)"
          >
            <!-- Current Time Indicator -->
            <div v-if="showCurrentTimeIndicator && isCurrentHour(hour)" class="current-time-indicator" :style="{ top: `${currentMinuteOffset}%` }">
              <div class="time-dot"></div>
            </div>

            <!-- Events in this hour -->
            <div class="hour-events">
              <div
                v-for="event in getEventsForHour(hour)"
                :key="event.id"
                class="hour-event"
                :style="getEventStyle(event)"
                @click.stop="handleEventClick(event)"
              >
                <div class="event-header">
                  <span class="event-title">{{ event.title }}</span>
                  <span class="event-time-range">{{ formatEventTimeRange(event) }}</span>
                </div>
                <div v-if="event.location" class="event-location">
                  <span class="location-icon">📍</span>
                  {{ event.location }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Events Summary -->
    <div class="summary-section">
      <span class="summary-label">Total events today:</span>
      <span class="summary-count">{{ totalEventsCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResourceEvent, EventCategory, WorkingHours, TimeInterval } from '../../types'

interface Props {
  currentDate: Date
  events: ResourceEvent[]
  theme: 'light' | 'dark'
  locale: string
  categories: EventCategory[]
  workingHours: WorkingHours
  timeInterval: TimeInterval
  showAllDaySlot: boolean
  highlightToday?: boolean
  showCurrentTimeIndicator?: boolean
  slotHeight?: number
  eventMinHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  highlightToday: true,
  showCurrentTimeIndicator: true,
  slotHeight: 48,
  eventMinHeight: 20
})

const emit = defineEmits<{
  'event-click': [event: ResourceEvent]
  'slot-click': [slot: { start: string; end: string; date: string; hour: number }]
}>()

const currentDateString = computed(() => toDateString(props.currentDate))

const dayInfo = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDay = new Date(props.currentDate)
  currentDay.setHours(0, 0, 0, 0)
  
  return {
    weekday: new Intl.DateTimeFormat(props.locale, { weekday: 'long' }).format(props.currentDate),
    dayNumber: props.currentDate.getDate(),
    isToday: currentDay.getTime() === today.getTime()
  }
})

const hoursOfDay = computed(() => {
  const hours: number[] = []
  for (let h = 0; h < 24; h++) {
    hours.push(h)
  }
  return hours
})

const allDayEvents = computed(() => {
  return props.events.filter(event => {
    if (!event.allDay) return false
    
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const checkDate = new Date(currentDateString.value)
    
    eventStart.setHours(0, 0, 0, 0)
    eventEnd.setHours(23, 59, 59, 999)
    checkDate.setHours(12, 0, 0, 0)
    
    return checkDate >= eventStart && checkDate <= eventEnd
  })
})

const totalEventsCount = computed(() => getDayEvents().length)

const currentMinuteOffset = computed(() => {
  const now = new Date()
  return (now.getMinutes() / 60) * 100
})

const toDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isWorkingHour = (hour: number): boolean => {
  return hour >= props.workingHours.start && hour < props.workingHours.end
}

const isCurrentHour = (hour: number): boolean => {
  if (!dayInfo.value.isToday) return false
  const now = new Date()
  return now.getHours() === hour
}

const formatHour = (hour: number): string => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(props.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const getDayEvents = (): ResourceEvent[] => {
  return props.events.filter(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    const checkDate = new Date(currentDateString.value)
    
    const startOfDay = new Date(checkDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    return eventStart <= endOfDay && eventEnd >= startOfDay
  })
}

const getEventsForHour = (hour: number): ResourceEvent[] => {
  return props.events.filter(event => {
    if (event.allDay) return false
    
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    const eventDateStr = toDateString(eventStart)
    if (eventDateStr !== currentDateString.value) return false
    
    const eventStartHour = eventStart.getHours()
    const eventEndHour = eventEnd.getHours() + (eventEnd.getMinutes() > 0 ? 1 : 0)
    
    return hour >= eventStartHour && hour < eventEndHour
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
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

const formatEventTimeRange = (event: ResourceEvent): string => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  
  const timeFormatter = new Intl.DateTimeFormat(props.locale, {
    hour: 'numeric',
    minute: '2-digit'
  })
  
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
}

const handleSlotClick = (hour: number) => {
  const start = `${currentDateString.value}T${String(hour).padStart(2, '0')}:00:00`
  const endHour = hour + 1
  const end = `${currentDateString.value}T${String(endHour).padStart(2, '0')}:00:00`
  
  emit('slot-click', { start, end, date: currentDateString.value, hour })
}

const handleEventClick = (event: ResourceEvent) => {
  emit('event-click', event)
}
</script>

<style scoped>
.daily-view {
  width: 100%;
}

/* Day Header */
.day-header-section {
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.theme-dark .day-header-section {
  border-color: #334155;
}

.weekday-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}

.theme-dark .weekday-label {
  color: #94a3b8;
}

.date-display {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  background: #f1f5f9;
  border-radius: 50%;
}

.theme-dark .date-display {
  color: #e2e8f0;
  background: #334155;
}

.date-display.is-today {
  background: #3b82f6;
  color: white;
}

/* All Day Section */
.all-day-section {
  padding: 16px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.theme-dark .all-day-section {
  background: #0f172a;
  border-color: #334155;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 12px;
}

.theme-dark .section-label {
  color: #94a3b8;
}

.no-events {
  font-size: 14px;
  color: #94a3b8;
  font-style: italic;
}

.all-day-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.all-day-event {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.all-day-event:hover {
  transform: scale(1.01);
}

.event-title {
  font-weight: 600;
  font-size: 14px;
}

.event-description {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

/* Time Grid */
.time-grid-wrapper {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.theme-dark .time-grid-wrapper {
  border-color: #334155;
}

.time-grid {
  display: flex;
  flex-direction: column;
}

.hour-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  border-bottom: 1px solid #f1f5f9;
}

.hour-row:last-child {
  border-bottom: none;
}

.theme-dark .hour-row {
  border-color: #334155;
}

.hour-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  background: #fafafa;
  border-right: 1px solid #e2e8f0;
}

.theme-dark .hour-label {
  background: #0f172a;
  border-color: #334155;
  color: #64748b;
}

.hour-label.working-hour {
  color: #475569;
}

.theme-dark .hour-label.working-hour {
  color: #94a3b8;
}

.hour-slot {
  position: relative;
  min-height: var(--slot-height, 48px);
  padding: 4px 8px;
  background: white;
  cursor: pointer;
  transition: background 0.15s ease;
}

.hour-slot:hover {
  background: #f8fafc;
}

.theme-dark .hour-slot {
  background: #1e293b;
}

.theme-dark .hour-slot:hover {
  background: #334155;
}

.hour-slot:not(.working-hour) {
  background: #f8fafc;
}

.theme-dark .hour-slot:not(.working-hour) {
  background: #0f172a;
}

.hour-slot.current-hour {
  background: #fef3c7;
}

.theme-dark .hour-slot.current-hour {
  background: #422006;
}

/* Current Time Indicator */
.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #ef4444;
  z-index: 20;
}

.time-dot {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: #ef4444;
  border-radius: 50%;
}

/* Hour Events */
.hour-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hour-event {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.hour-event:hover {
  transform: scale(1.01);
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-time-range {
  font-size: 11px;
  opacity: 0.8;
  white-space: nowrap;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.location-icon {
  font-size: 11px;
}

/* Summary Section */
.summary-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-top: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.theme-dark .summary-section {
  background: #0f172a;
  border-color: #334155;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
}

.theme-dark .summary-label {
  color: #94a3b8;
}

.summary-count {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  background: #e2e8f0;
  padding: 4px 12px;
  border-radius: 20px;
}

.theme-dark .summary-count {
  color: #e2e8f0;
  background: #334155;
}

/* Responsive - Tablet */
@media (max-width: 768px) {
  .day-header-section {
    padding: 16px;
  }

  .date-display {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .weekday-label {
    font-size: 11px;
  }

  .hour-row {
    grid-template-columns: 70px 1fr;
  }

  .hour-label {
    padding: 6px 8px;
    font-size: 11px;
  }

  .hour-slot {
    min-height: 50px;
    padding: 3px 6px;
  }

  .hour-event {
    padding: 6px 10px;
  }

  .event-title {
    font-size: 12px;
  }

  .event-time-range {
    font-size: 10px;
  }

  .event-location {
    font-size: 11px;
  }

  .all-day-section {
    padding: 12px;
  }

  .all-day-event {
    padding: 10px 12px;
  }

  .summary-section {
    padding: 12px;
  }

  .summary-label {
    font-size: 13px;
  }

  .summary-count {
    font-size: 16px;
    padding: 3px 10px;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  .day-header-section {
    padding: 12px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .day-status {
    text-align: center;
  }

  .date-display {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .weekday-label {
    font-size: 10px;
  }

  .hour-row {
    grid-template-columns: 55px 1fr;
  }

  .hour-label {
    padding: 4px 6px;
    font-size: 10px;
  }

  .hour-slot {
    min-height: 45px;
    padding: 2px 4px;
  }

  .time-grid-wrapper {
    max-height: 400px;
  }

  .hour-event {
    padding: 4px 8px;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .event-title {
    font-size: 11px;
  }

  .event-time-range {
    font-size: 9px;
  }

  .event-location {
    font-size: 10px;
    margin-top: 2px;
  }

  .all-day-section {
    padding: 10px;
    margin-bottom: 12px;
  }

  .section-label {
    font-size: 10px;
    margin-bottom: 8px;
  }

  .all-day-event {
    padding: 8px 10px;
  }

  .summary-section {
    padding: 10px;
    margin-top: 12px;
  }

  .summary-label {
    font-size: 12px;
  }

  .summary-count {
    font-size: 14px;
  }
}
</style>
