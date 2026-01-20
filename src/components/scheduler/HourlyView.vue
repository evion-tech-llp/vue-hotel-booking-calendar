<template>
  <div class="hourly-view" :class="[`theme-${theme}`]" :style="{ '--slot-height': `${computedSlotHeight}px`, '--event-min-height': `${eventMinHeight}px` }">
    <!-- Day Header -->
    <div class="day-info-header">
      <div class="date-info">
        <div class="weekday-name">{{ dayInfo.weekday }}</div>
        <div class="full-date">{{ dayInfo.formattedDate }}</div>
      </div>
      <div class="day-status">
        <span v-if="dayInfo.isToday" class="today-badge">Today</span>
        <span class="event-count-label">{{ dayEventsCount }} event{{ dayEventsCount !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Time Interval Selector -->
    <div class="interval-selector">
      <span class="interval-label">Interval:</span>
      <div class="interval-buttons">
        <button
          v-for="interval in intervalOptions"
          :key="interval"
          type="button"
          class="interval-btn"
          :class="{ active: selectedInterval === interval }"
          @click="selectedInterval = interval"
        >
          {{ interval }}min
        </button>
      </div>
    </div>

    <!-- Time Slots Grid -->
    <div class="time-slots-container">
      <div class="time-slots">
        <div
          v-for="slot in timeSlots"
          :key="slot.time"
          class="time-slot-row"
        >
          <!-- Time Label -->
          <div 
            class="slot-time-label"
            :class="{ 
              'working-hour': slot.isWorkingHour,
              'hour-start': slot.minute === 0
            }"
          >
            {{ slot.formattedTime }}
          </div>

          <!-- Slot Content -->
          <div 
            class="slot-content"
            :class="{
              'working-hour': slot.isWorkingHour,
              'current-slot': isCurrentSlot(slot)
            }"
            @click="handleSlotClick(slot)"
          >
            <!-- Current Time Indicator -->
            <div v-if="showCurrentTimeIndicator && isCurrentSlot(slot)" class="current-time-line" :style="{ top: `${currentMinuteInSlot}%` }">
              <div class="time-marker"></div>
            </div>

            <!-- Events in this slot -->
            <div class="slot-events">
              <div
                v-for="event in getEventsForSlot(slot)"
                :key="event.id"
                class="slot-event"
                :style="getEventStyle(event)"
                @click.stop="handleEventClick(event)"
              >
                <div class="event-main">
                  <span class="event-title">{{ event.title }}</span>
                  <span class="event-duration">{{ formatEventDuration(event) }}</span>
                </div>
                <div v-if="event.description" class="event-desc">{{ event.description }}</div>
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

    <!-- Quick Stats -->
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-value">{{ freeSlots }}</div>
        <div class="stat-label">Free Slots</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ busySlots }}</div>
        <div class="stat-label">Busy Slots</div>
      </div>
      <div class="stat-item">
        <div class="stat-value highlight">{{ utilizationPercent }}%</div>
        <div class="stat-label">Utilization</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ResourceEvent, EventCategory, WorkingHours, TimeInterval } from '../../types'

interface TimeSlotData {
  time: string
  hour: number
  minute: number
  formattedTime: string
  isWorkingHour: boolean
}

interface Props {
  currentDate: Date
  events: ResourceEvent[]
  theme: 'light' | 'dark'
  locale: string
  categories: EventCategory[]
  workingHours: WorkingHours
  timeInterval: TimeInterval
  showCurrentTimeIndicator?: boolean
  slotHeight?: number
  eventMinHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  showCurrentTimeIndicator: true,
  slotHeight: 60,
  eventMinHeight: 20
})

const emit = defineEmits<{
  'event-click': [event: ResourceEvent]
  'slot-click': [slot: { start: string; end: string; date: string; hour: number; minute: number }]
}>()

const intervalOptions: TimeInterval[] = [15, 30, 60]
const selectedInterval = ref<TimeInterval>(props.timeInterval)

const currentDateString = computed(() => toDateString(props.currentDate))

const dayInfo = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDay = new Date(props.currentDate)
  currentDay.setHours(0, 0, 0, 0)
  
  return {
    weekday: new Intl.DateTimeFormat(props.locale, { weekday: 'long' }).format(props.currentDate),
    formattedDate: new Intl.DateTimeFormat(props.locale, { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(props.currentDate),
    isToday: currentDay.getTime() === today.getTime()
  }
})

const dayEventsCount = computed(() => getDayEvents().length)

const computedSlotHeight = computed(() => {
  if (props.slotHeight) return props.slotHeight
  switch (selectedInterval.value) {
    case 15: return 40
    case 30: return 50
    default: return 70
  }
})

const timeSlots = computed((): TimeSlotData[] => {
  const slots: TimeSlotData[] = []
  const interval = selectedInterval.value
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      
      const date = new Date()
      date.setHours(hour, minute, 0, 0)
      
      const formattedTime = new Intl.DateTimeFormat(props.locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date)
      
      slots.push({
        time,
        hour,
        minute,
        formattedTime,
        isWorkingHour: isWorkingHour(hour)
      })
    }
  }
  
  return slots
})

const workingHoursSlots = computed(() => {
  return timeSlots.value.filter(s => s.isWorkingHour)
})

const freeSlots = computed(() => {
  return workingHoursSlots.value.filter(slot => getEventsForSlot(slot).length === 0).length
})

const busySlots = computed(() => {
  return workingHoursSlots.value.filter(slot => getEventsForSlot(slot).length > 0).length
})

const utilizationPercent = computed(() => {
  const total = workingHoursSlots.value.length
  if (total === 0) return 0
  return Math.round((busySlots.value / total) * 100)
})

const currentMinuteInSlot = computed(() => {
  const now = new Date()
  const minuteInInterval = now.getMinutes() % selectedInterval.value
  return (minuteInInterval / selectedInterval.value) * 100
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

const isCurrentSlot = (slot: TimeSlotData): boolean => {
  if (!dayInfo.value.isToday) return false
  
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  const slotEndMinute = slot.minute + selectedInterval.value
  
  return slot.hour === currentHour && 
         currentMinute >= slot.minute && 
         currentMinute < slotEndMinute
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

const getEventsForSlot = (slot: TimeSlotData): ResourceEvent[] => {
  return props.events.filter(event => {
    if (event.allDay) return false
    
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    const eventDateStr = toDateString(eventStart)
    if (eventDateStr !== currentDateString.value) return false
    
    const slotStart = new Date(props.currentDate)
    slotStart.setHours(slot.hour, slot.minute, 0, 0)
    
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + selectedInterval.value)
    
    return eventStart < slotEnd && eventEnd > slotStart
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

const formatEventDuration = (event: ResourceEvent): string => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const durationMs = end.getTime() - start.getTime()
  const durationMins = Math.round(durationMs / (1000 * 60))
  
  if (durationMins < 60) {
    return `${durationMins}m`
  }
  
  const hours = Math.floor(durationMins / 60)
  const mins = durationMins % 60
  
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const handleSlotClick = (slot: TimeSlotData) => {
  const start = `${currentDateString.value}T${slot.time}:00`
  
  const endDate = new Date(props.currentDate)
  endDate.setHours(slot.hour, slot.minute + selectedInterval.value, 0, 0)
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
  const end = `${currentDateString.value}T${endTime}:00`
  
  emit('slot-click', { 
    start, 
    end, 
    date: currentDateString.value, 
    hour: slot.hour,
    minute: slot.minute 
  })
}

const handleEventClick = (event: ResourceEvent) => {
  emit('event-click', event)
}
</script>

<style scoped>
.hourly-view {
  width: 100%;
}

/* Day Info Header */
.day-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.theme-dark .day-info-header {
  background: #0f172a;
  border-color: #334155;
}

.weekday-name {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 4px;
}

.theme-dark .weekday-name {
  color: #94a3b8;
}

.full-date {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.theme-dark .full-date {
  color: #e2e8f0;
}

.day-status {
  text-align: right;
}

.today-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 4px;
}

.event-count-label {
  display: block;
  font-size: 13px;
  color: #64748b;
}

.theme-dark .event-count-label {
  color: #94a3b8;
}

/* Interval Selector */
.interval-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.interval-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.theme-dark .interval-label {
  color: #94a3b8;
}

.interval-buttons {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.theme-dark .interval-buttons {
  border-color: #475569;
}

.interval-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border-right: 1px solid #e2e8f0;
}

.interval-btn:last-child {
  border-right: none;
}

.interval-btn:hover {
  background: #f1f5f9;
}

.interval-btn.active {
  background: #3b82f6;
  color: white;
}

.theme-dark .interval-btn {
  background: #1e293b;
  color: #94a3b8;
  border-color: #475569;
}

.theme-dark .interval-btn:hover {
  background: #334155;
}

.theme-dark .interval-btn.active {
  background: #3b82f6;
  color: white;
}

/* Time Slots Container */
.time-slots-container {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  max-height: 500px;
  overflow-y: auto;
}

.theme-dark .time-slots-container {
  border-color: #334155;
}

.time-slots {
  display: flex;
  flex-direction: column;
}

.time-slot-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  border-bottom: 1px solid #f1f5f9;
}

.time-slot-row:last-child {
  border-bottom: none;
}

.theme-dark .time-slot-row {
  border-color: #334155;
}

/* Slot Time Label */
.slot-time-label {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px 12px;
  font-size: 12px;
  color: #94a3b8;
  background: #fafafa;
  border-right: 1px solid #e2e8f0;
}

.theme-dark .slot-time-label {
  background: #0f172a;
  border-color: #334155;
  color: #64748b;
}

.slot-time-label.hour-start {
  font-weight: 600;
}

.slot-time-label.working-hour {
  color: #475569;
}

.theme-dark .slot-time-label.working-hour {
  color: #94a3b8;
}

/* Slot Content */
.slot-content {
  position: relative;
  min-height: 50px;
  padding: 4px 8px;
  background: white;
  cursor: pointer;
  transition: background 0.15s ease;
}

.slot-content:hover {
  background: #f8fafc;
}

.theme-dark .slot-content {
  background: #1e293b;
}

.theme-dark .slot-content:hover {
  background: #334155;
}

.slot-content:not(.working-hour) {
  background: #f8fafc;
}

.theme-dark .slot-content:not(.working-hour) {
  background: #0f172a;
}

.slot-content.current-slot {
  background: #fef3c7;
}

.theme-dark .slot-content.current-slot {
  background: #422006;
}

/* Current Time Line */
.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #ef4444;
  z-index: 20;
}

.time-marker {
  position: absolute;
  left: -5px;
  top: -5px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
}

/* Slot Events */
.slot-events {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slot-event {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.slot-event:hover {
  transform: scale(1.01);
}

.event-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.event-title {
  font-weight: 600;
  font-size: 13px;
}

.event-duration {
  font-size: 11px;
  opacity: 0.8;
  white-space: nowrap;
}

.event-desc {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

.location-icon {
  font-size: 10px;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.theme-dark .stats-section {
  background: #0f172a;
  border-color: #334155;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.theme-dark .stat-value {
  color: #e2e8f0;
}

.stat-value.highlight {
  color: #10b981;
}

.theme-dark .stat-value.highlight {
  color: #34d399;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}

.theme-dark .stat-label {
  color: #94a3b8;
}

/* Responsive - Tablet */
@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    gap: 12px;
  }

  .time-info {
    padding: 12px;
  }

  .current-time {
    font-size: 28px;
  }

  .current-period {
    font-size: 12px;
  }

  .time-slot-row {
    grid-template-columns: 80px 1fr;
  }

  .slot-time-label {
    padding: 10px;
    font-size: 11px;
  }

  .slot-content-area {
    padding: 8px;
  }

  .slot-event {
    padding: 8px 10px;
  }

  .event-name {
    font-size: 12px;
  }

  .event-time-display {
    font-size: 10px;
  }

  .interval-btn {
    padding: 6px 12px;
    font-size: 11px;
  }

  .stats-section {
    padding: 16px;
    gap: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 10px;
  }
}

/* Responsive - Mobile */
@media (max-width: 480px) {
  .header-controls {
    padding: 0;
  }

  .time-info {
    padding: 10px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .current-time {
    font-size: 24px;
  }

  .current-period {
    font-size: 11px;
  }

  .time-details {
    text-align: center;
  }

  .date-display {
    font-size: 12px;
  }

  .remaining-hours {
    font-size: 11px;
  }

  .interval-buttons {
    width: 100%;
    justify-content: center;
  }

  .interval-btn {
    flex: 1;
    padding: 6px 8px;
    font-size: 10px;
  }

  .time-slots-container {
    max-height: 400px;
  }

  .time-slot-row {
    grid-template-columns: 60px 1fr;
  }

  .slot-time-label {
    padding: 6px;
    font-size: 10px;
  }

  .slot-content-area {
    padding: 6px;
    min-height: 45px;
  }

  .slot-event {
    padding: 6px 8px;
    border-left-width: 2px !important;
  }

  .event-name {
    font-size: 11px;
  }

  .event-time-display {
    font-size: 9px;
  }

  .stats-section {
    padding: 12px;
    gap: 8px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 9px;
  }
}
</style>
