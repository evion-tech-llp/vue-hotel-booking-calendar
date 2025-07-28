<template>
    <div class="hotel-dashboard-calendar" :class="`theme-${theme}`" :style="{ '--days-in-month': monthDates.length }">
        <!-- Header with Month Navigation -->
        <div class="dashboard-header" ref="calendarHeaderRef">
            <button @click="navigateMonth(-1)" class="nav-btn" :aria-label="labels.previousMonth">
                {{ labels.previousMonth }}
            </button>
            <h2 class="current-month">{{ formatMonth(currentMonth) }}</h2>
            <button @click="navigateMonth(1)" class="nav-btn" :aria-label="labels.nextMonth">
                {{ labels.nextMonth }}
            </button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-container">
            <div class="calendar-grid">
                <!-- Header Row: Dates -->
                <div class="grid-header">
                    <div class="room-header">{{ labels.room }}</div>
                    <div v-for="date in monthDates" :key="date.dateString" class="date-header" :class="{
                        'is-today': date.isToday,
                        'is-weekend': date.isWeekend
                    }">
                        <div class="date-number">{{ date.day }}</div>
                        <div class="date-weekday">{{ date.weekday }}</div>
                    </div>
                </div>

                <!-- Room Rows -->
                <div v-for="room in props.rooms" :key="room.id" class="room-row">
                    <!-- Room Name Column -->
                    <div class="room-name">{{ room.number }}</div>

                    <!-- Date Cells (Background Grid) -->
                    <div v-for="date in monthDates" :key="`${room.id}-${date.dateString}`" class="date-cell"
                        :class="getCellClasses(room, date.dateString)" :style="getCellStyle(room, date.dateString)"
                        @click="handleCellClick(room, date.dateString)" :title="getCellTooltip(room, date.dateString)">
                        <!-- Keep individual cell indicators as fallback -->
                        <div v-if="hasBooking(room, date.dateString) && !hasBookingSpan(room, date.day)"
                            class="booking-indicator">
                            <span class="guest-initials">
                                {{ getGuestInitials(room, date.dateString) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Booking Spans (Positioned absolutely over the entire grid) -->
                <div v-for="(room, roomIndex) in props.rooms" :key="`spans-${room.id}`">
                    <div v-for="(span, spanIndex) in bookingSpans[room.id]" :key="`span-${room.id}-${spanIndex}`"
                        class="booking-span" :style="getSpanStyleWithRow(span, roomIndex)"
                        @click="handleSpanClick(span.booking)" :title="getSpanTooltip(span)">
                        <div class="span-content">
                            <span class="span-text">{{ getSpanText(span) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="legend">
            <div v-for="status in availableStatuses" :key="status.key" class="legend-item">
                <div class="legend-color" :style="{
                    backgroundColor: status.backgroundColor,
                    borderColor: status.color
                }"></div>
                <span>{{ status.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type {
    DashboardCalendarProps,
    DashboardCalendarEmits,
    Room,
    Booking,
    StatusConfig
} from '../types'

// Props
const props = withDefaults(defineProps<DashboardCalendarProps>(), {
  selectedMonth: () => new Date(),
  theme: 'light',
  allowPreviousMonthNavigation: false,
  textLabels: () => ({})
})

// Emits
const emit = defineEmits<DashboardCalendarEmits>()

// Template refs and reactive data
const calendarHeaderRef = ref<HTMLElement | null>(null)
const actualHeaderHeight = ref(60) // Default fallback

// Dynamically measure header height
onMounted(() => {
    if (calendarHeaderRef.value) {
        actualHeaderHeight.value = calendarHeaderRef.value.getBoundingClientRect().height
    }
})

// Re-measure header height when month changes (in case content changes)
watch(() => props.selectedMonth, () => {
    setTimeout(() => {
        if (calendarHeaderRef.value) {
            actualHeaderHeight.value = calendarHeaderRef.value.getBoundingClientRect().height
        }
    }, 50) // Small delay to ensure DOM is updated
})

// State
const currentMonth = ref(new Date(props.selectedMonth!))

// Default status configuration
const defaultStatusConfig: StatusConfig[] = [
    {
        key: 'available',
        label: 'Available',
        color: '#666',
        backgroundColor: '#f9f9f9',
        darkBackgroundColor: '#2a2a2a'
    },
    {
        key: 'confirmed',
        label: 'Confirmed',
        color: '#166534',
        backgroundColor: '#dcf8c6',
        darkBackgroundColor: '#1a4d14'
    },
    {
        key: 'pending',
        label: 'Pending',
        color: '#92400e',
        backgroundColor: '#fef3c7',
        darkBackgroundColor: '#4a3c00'
    },
    {
        key: 'checked-in',
        label: 'Checked In',
        color: '#1e40af',
        backgroundColor: '#dbeafe',
        darkBackgroundColor: '#1e3a8a'
    },
    {
        key: 'checked-out',
        label: 'Checked Out',
        color: '#7c3aed',
        backgroundColor: '#f3e8ff',
        darkBackgroundColor: '#5b21b6'
    },
    {
        key: 'cancelled',
        label: 'Cancelled',
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        darkBackgroundColor: '#7f1d1d'
    }
]

// Computed Properties
const availableStatuses = computed(() =>
  props.statusConfig || defaultStatusConfig
)

// Text labels with fallbacks
const labels = computed(() => ({
  previousMonth: props.textLabels?.previousMonth || '← Previous',
  nextMonth: props.textLabels?.nextMonth || 'Next →',
  room: props.textLabels?.room || 'Room',
  available: props.textLabels?.available || 'Available',
  createBooking: props.textLabels?.createBooking || 'Click to create booking',
  clickForDetails: props.textLabels?.clickForDetails || 'Click for details'
}))

const monthDates = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dates = []
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        // Create dateString safely without timezone conversion
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        dates.push({
            day,
            dateString,
            date,
            isToday: date.getTime() === today.getTime(),
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
            weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
        })
    }

    return dates
})

// Compute booking spans for visual display
const bookingSpans = computed(() => {
    const spans: Record<string, any[]> = {}

    props.rooms.forEach(room => {
        spans[room.id] = []

        // Get bookings for this room that overlap with current month
        const roomBookings = props.bookings.filter(booking =>
            booking.roomNumber === room.number
        )

        roomBookings.forEach(booking => {
            const checkIn = new Date(booking.checkIn)
            const checkOut = new Date(booking.checkOut)
            const currentYear = currentMonth.value.getFullYear()
            const currentMonthIndex = currentMonth.value.getMonth()

            // Calculate month boundaries correctly (avoid timezone issues)
            const monthStart = new Date(currentYear, currentMonthIndex, 1)
            const monthEnd = new Date(currentYear, currentMonthIndex + 1, 0) // Last day of current month

            // Check if booking overlaps with current month
            if (checkIn <= monthEnd && checkOut > monthStart) {
                // Calculate start and end days within the current month
                let startDay: number
                let endDay: number

                // Fix: Use the actual day of the month, not relative to month start
                if (checkIn >= monthStart) {
                    // Booking starts in this month
                    startDay = checkIn.getDate()
                } else {
                    // Booking started in previous month
                    startDay = 1
                }

                if (checkOut <= monthEnd) {
                    // Booking ends in this month (subtract 1 because checkout is exclusive)
                    endDay = checkOut.getDate() - 1
                } else {
                    // Booking continues into next month
                    endDay = monthEnd.getDate()
                }

                // Ensure endDay is not less than startDay
                endDay = Math.max(startDay, endDay)

                // Only create span if we have valid days
                if (startDay >= 1 && endDay <= monthEnd.getDate() && startDay <= endDay) {
                    const statusConfig = getStatusConfig(booking.status)

                    spans[room.id].push({
                        booking,
                        startDay,
                        endDay,
                        length: endDay - startDay + 1,
                        statusConfig
                    })
                }
            }
        })

        // Sort spans by start day
        spans[room.id].sort((a, b) => a.startDay - b.startDay)
    })

    return spans
})

// Methods
const formatMonth = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
    }).format(date)
}

const navigateMonth = (direction: number): void => {
  // Allow navigation to previous months if allowPreviousMonthNavigation is true
  if (direction < 0 && !props.allowPreviousMonthNavigation) {
    const today = new Date()
    const currentMonthStart = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Don't allow going to months before current month unless explicitly allowed
    if (currentMonthStart <= todayMonthStart) return
  }
  
  const newMonth = new Date(currentMonth.value)
  newMonth.setMonth(newMonth.getMonth() + direction)
  currentMonth.value = newMonth
  emit('update:selectedMonth', newMonth)
}

const hasBooking = (room: Room, dateString: string): boolean => {
    return props.bookings.some(booking =>
        booking.roomNumber === room.number &&
        isDateInBookingRange(dateString, booking)
    )
}

const isDateInBookingRange = (dateString: string, booking: Booking): boolean => {
    const date = new Date(dateString)
    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    return date >= checkIn && date < checkOut
}

const getBookingForRoomAndDate = (room: Room, dateString: string): Booking | null => {
    return props.bookings.find(booking =>
        booking.roomNumber === room.number &&
        isDateInBookingRange(dateString, booking)
    ) || null
}

const getCellStatus = (room: Room, dateString: string): string => {
    const booking = getBookingForRoomAndDate(room, dateString)
    return booking ? booking.status : 'available'
}

const getStatusConfig = (statusKey: string): StatusConfig => {
    return availableStatuses.value.find(s => s.key === statusKey) || availableStatuses.value[0]
}

const getCellClasses = (room: Room, dateString: string): string[] => {
    const classes = []

    const date = monthDates.value.find(d => d.dateString === dateString)
    if (date?.isToday) classes.push('is-today')
    if (date?.isWeekend) classes.push('is-weekend')
    if (hasBooking(room, dateString)) classes.push('has-booking')

    return classes
}

const getCellStyle = (room: Room, dateString: string): Record<string, string> => {
    const status = getCellStatus(room, dateString)
    const statusConfig = getStatusConfig(status)

    const isDark = props.theme === 'dark'
    const backgroundColor = isDark && statusConfig.darkBackgroundColor
        ? statusConfig.darkBackgroundColor
        : statusConfig.backgroundColor

    return {
        backgroundColor,
        color: statusConfig.color
    }
}

const getGuestInitials = (room: Room, dateString: string): string => {
    const booking = getBookingForRoomAndDate(room, dateString)
    if (!booking) return ''

    return booking.guestName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
}

const calculateNights = (checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getCellTooltip = (room: Room, dateString: string): string => {
  const booking = getBookingForRoomAndDate(room, dateString)
  if (!booking) return `${labels.value.room} ${room.number} - ${labels.value.available} (${labels.value.createBooking})`

  const statusConfig = getStatusConfig(booking.status)
  const nights = calculateNights(booking.checkIn, booking.checkOut)
  return `${booking.guestName} - ${labels.value.room} ${room.number} - ${statusConfig.label} - ${nights} nights (${labels.value.clickForDetails})`
}

const handleCellClick = (room: Room, dateString: string): void => {
    const booking = getBookingForRoomAndDate(room, dateString)
    if (booking) {
        emit('booking-click', booking)
    } else {
        emit('booking-create', { roomId: room.id, date: dateString })
    }
}

const hasBookingSpan = (room: Room, day: number): boolean => {
    const spans = bookingSpans.value[room.id] || []
    const hasSpan = spans.some(span =>
        day >= span.startDay && day <= span.endDay
    )

    return hasSpan
}



const getSpanText = (span: any): string => {
    const nights = calculateNights(span.booking.checkIn, span.booking.checkOut)
    const guestName = span.booking.guestName

    // Adjust text based on span length
    if (span.length === 1) {
        // Single day: just initials
        return guestName.split(' ').map((name: string) => name.charAt(0)).join('').substring(0, 2)
    } else if (span.length <= 3) {
        // Short span: first name
        return guestName.split(' ')[0]
    } else if (span.length <= 6) {
        // Medium span: first name + nights
        return `${guestName.split(' ')[0]} (${nights}n)`
    } else {
        // Long span: full name + nights
        return `${guestName} - ${nights} nights`
    }
}

const getSpanTooltip = (span: any): string => {
    const nights = calculateNights(span.booking.checkIn, span.booking.checkOut)
    const room = props.rooms.find(r => r.number === span.booking.roomNumber)
    return `${span.booking.guestName} - Room ${room?.number} - ${span.statusConfig.label} - ${nights} nights`
}

const handleSpanClick = (booking: Booking): void => {
    emit('booking-click', booking)
}

const getSpanStyleWithRow = (span: any, roomIndex: number): Record<string, string> => {
    const isDark = props.theme === 'dark'
    const backgroundColor = isDark && span.statusConfig.darkBackgroundColor
        ? span.statusConfig.darkBackgroundColor
        : span.statusConfig.backgroundColor

    // Calculate position relative to entire calendar grid
    const roomColumnWidth = 80 // Room name column width
    const totalDays = monthDates.value.length
    const dateColumnWidth = `calc((100% - ${roomColumnWidth}px) / ${totalDays})`

    // Horizontal position
    const left = `calc(${roomColumnWidth}px + (${span.startDay - 1} * ${dateColumnWidth}))`
    const width = `calc(${span.length} * ${dateColumnWidth})`

    // Vertical position - adjust header height
    const rowHeight = 38 // Height of each room row (matches date-cell height)
    const headerHeight = actualHeaderHeight.value - rowHeight + 7 // Add 7px fine-tuning to align properly
    const top = headerHeight + (roomIndex * rowHeight) // No extra margin

    return {
        backgroundColor,
        color: span.statusConfig.color,
        border: `1px solid ${span.statusConfig.color}`,
        position: 'absolute',
        left,
        width,
        top: `${top}px`,
        height: `${rowHeight}px`, // Match cell height exactly
        zIndex: '10',
        borderRadius: '4px'
    }
}

// Watch for prop changes
watch(() => props.selectedMonth, (newMonth) => {
    if (newMonth) {
        currentMonth.value = new Date(newMonth)
    }
})
</script>

<style scoped>
.hotel-dashboard-calendar {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    border-radius: 12px;
    border: 1px solid #f1f3f4;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.theme-dark {
    background: #1e1e1e;
    color: #ffffff;
    border-color: #333;
}

/* Header */
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: white;
    border-bottom: 1px solid #f1f3f4;
}

.theme-dark .dashboard-header {
    background: #2d2d2d;
    border-bottom-color: #444;
}

.nav-btn {
    padding: 10px 18px;
    border: 1px solid #e9ecef;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    color: #495057;
}

.nav-btn:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
}

.theme-dark .nav-btn {
    background: #333;
    border-color: #555;
    color: white;
}

.theme-dark .nav-btn:hover {
    background: #404040;
}

.current-month {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #1a202c;
    letter-spacing: -0.01em;
}

.theme-dark .current-month {
    color: white;
}

/* Calendar Container */
.calendar-container {
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    /* Remove horizontal scroll */
    position: relative;
    /* For absolute positioned spans */
}

.calendar-grid {
    display: grid;
    width: 100%;
    grid-template-columns: 80px repeat(var(--days-in-month), 1fr);
    /* Flexible columns */
    gap: 0;
}

/* Grid Header */
.grid-header {
    display: contents;
    /* Make header part of the grid */
}

.room-header {
    padding: 16px 8px;
    font-weight: 600;
    border-right: 1px solid #f1f3f4;
    border-bottom: 1px solid #f1f3f4;
    background: white;
    font-size: 13px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 11;
    color: #495057;
}

.theme-dark .room-header {
    background: #2d2d2d;
    border-color: #444;
    color: #ccc;
}

.date-header {
    padding: 8px 2px;
    text-align: center;
    border-right: 1px solid #f1f3f4;
    border-bottom: 1px solid #f1f3f4;
    font-size: 11px;
    background: white;
    position: sticky;
    top: 0;
    z-index: 10;
}

.theme-dark .date-header {
    background: #2d2d2d;
    border-color: #444;
}

.date-header.is-today {
    background: #f0f8ff;
    font-weight: 600;
    color: #2563eb;
}

.theme-dark .date-header.is-today {
    background: #1e3a8a;
    color: white;
}

.date-header.is-weekend {
    background: #fafafa;
}

.theme-dark .date-header.is-weekend {
    background: #4a2c17;
}

.date-number {
    font-weight: 600;
    line-height: 1;
    font-size: 12px;
}

.date-weekday {
    font-size: 9px;
    color: #6c757d;
    line-height: 1;
    margin-top: 2px;
    text-transform: uppercase;
}

.theme-dark .date-weekday {
    color: #999;
}

/* Room Rows */
.room-row {
    display: contents;
    /* Make row part of the grid */
}

.room-name {
    padding: 12px 6px;
    font-weight: 600;
    border-right: 1px solid #f1f3f4;
    border-bottom: 1px solid #f1f3f4;
    background: white;
    font-size: 13px;
    text-align: center;
    position: sticky;
    left: 0;
    z-index: 5;
    color: #495057;
}

.room-name:hover {
    background: #f8f9fa;
}

.theme-dark .room-name {
    background: #1e1e1e;
    border-color: #444;
    color: #ccc;
}

.theme-dark .room-name:hover {
    background: #2a2a2a;
}

/* Date Cells */
.date-cell {
    padding: 0;
    border-right: 1px solid #f1f3f4;
    border-bottom: 1px solid #f1f3f4;
    height: 38px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    /* Allow shrinking */
    background: white;
}

.theme-dark .date-cell {
    border-color: #444;
    background: #1e1e1e;
}

.date-cell:hover {
    background: #f8f9fa;
    transform: scale(1.02);
}

.theme-dark .date-cell:hover {
    background: rgba(255, 255, 255, 0.05);
}

.date-cell.is-today {
    border-left: 3px solid #2563eb;
    background: #f0f8ff;
}

.theme-dark .date-cell.is-today {
    background: #1e3a8a;
}

.booking-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    z-index: 5;
    /* Lower than spans */
}

.guest-initials {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* Booking Spans */
.booking-span {
    /* Absolute positioning to overlay the grid */
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 20;
    /* Higher than individual indicators (z-index: 5) */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    /* Remove margin to fill entire cell area */
}

.booking-span:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    z-index: 25;
}

.span-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
}

.span-text {
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

/* Legend */
.legend {
    display: flex;
    gap: 20px;
    padding: 20px 24px;
    background: white;
    border-top: 1px solid #f1f3f4;
    flex-wrap: wrap;
}

.theme-dark .legend {
    background: #2d2d2d;
    border-top-color: #444;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #495057;
    font-weight: 500;
}

.theme-dark .legend-item {
    color: #ccc;
}

.legend-color {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: 1px solid;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-header {
        padding: 16px 20px;
    }

    .nav-btn {
        padding: 8px 14px;
        font-size: 13px;
    }

    .current-month {
        font-size: 18px;
    }

    .calendar-grid {
        grid-template-columns: 60px repeat(var(--days-in-month), 1fr);
    }

    .room-header,
    .room-name {
        padding: 8px 2px;
        font-size: 11px;
    }

    .date-header {
        padding: 6px 1px;
        font-size: 10px;
    }

    .date-number {
        font-size: 10px;
    }

    .date-weekday {
        font-size: 8px;
    }

    .date-cell {
        height: 34px;
    }

    .legend {
        padding: 16px 20px;
        gap: 16px;
    }

    .legend-item {
        font-size: 12px;
    }

    .guest-initials {
        font-size: 9px;
    }
}
</style>