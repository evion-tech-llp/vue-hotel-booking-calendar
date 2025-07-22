<template>
    <div class="hotel-dashboard-calendar" :class="`theme-${theme}`" :style="{ '--days-in-month': monthDates.length }">
        <!-- Header with Month Navigation -->
        <div class="dashboard-header">
            <button @click="navigateMonth(-1)" class="nav-btn" aria-label="Previous month">
                ← Previous
            </button>
            <h2 class="current-month">{{ formatMonth(currentMonth) }}</h2>
            <button @click="navigateMonth(1)" class="nav-btn" aria-label="Next month">
                Next →
            </button>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-container">
            <div class="calendar-grid">
                <!-- Header Row: Dates -->
                <div class="grid-header">
                    <div class="room-header">Room</div>
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

                    <!-- Date Cells -->
                    <div v-for="date in monthDates" :key="`${room.id}-${date.dateString}`" class="date-cell"
                        :class="getCellClasses(room, date.dateString)" :style="getCellStyle(room, date.dateString)"
                        @click="handleCellClick(room, date.dateString)" :title="getCellTooltip(room, date.dateString)">
                        <!-- Booking indicator -->
                        <div v-if="hasBooking(room, date.dateString)" class="booking-indicator">
                            <span class="guest-initials">
                                {{ getGuestInitials(room, date.dateString) }}
                            </span>
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
import { computed, ref, watch } from 'vue'
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
    theme: 'light'
})

// Emits
const emit = defineEmits<DashboardCalendarEmits>()

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

const monthDates = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dates = []
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateString = date.toISOString().split('T')[0]

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

// Methods
const formatMonth = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
    }).format(date)
}

const navigateMonth = (direction: number): void => {
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
    if (!booking) return `Room ${room.number} - Available (Click to create booking)`

    const statusConfig = getStatusConfig(booking.status)
    const nights = calculateNights(booking.checkIn, booking.checkOut)
    return `${booking.guestName} - Room ${room.number} - ${statusConfig.label} - ${nights} nights (Click for details)`
}

const handleCellClick = (room: Room, dateString: string): void => {
    const booking = getBookingForRoomAndDate(room, dateString)
    if (booking) {
        emit('booking-click', booking)
    } else {
        emit('booking-create', { roomId: room.id, date: dateString })
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
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
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
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.theme-dark .dashboard-header {
    background: #2d2d2d;
    border-bottom-color: #444;
}

.nav-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.nav-btn:hover {
    background: #f5f5f5;
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
}

/* Calendar Container */
.calendar-container {
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
    /* Remove horizontal scroll */
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
    padding: 12px 8px;
    font-weight: 600;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
    font-size: 12px;
    text-align: center;
    position: sticky;
    top: 0;
    z-index: 11;
}

.theme-dark .room-header {
    background: #2d2d2d;
    border-color: #444;
}

.date-header {
    padding: 6px 2px;
    text-align: center;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    font-size: 10px;
    background: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 10;
}

.theme-dark .date-header {
    background: #2d2d2d;
    border-color: #444;
}

.date-header.is-today {
    background: #e3f2fd;
    font-weight: 600;
}

.theme-dark .date-header.is-today {
    background: #1e3a8a;
}

.date-header.is-weekend {
    background: #fff3e0;
}

.theme-dark .date-header.is-weekend {
    background: #4a2c17;
}

.date-number {
    font-weight: 600;
    line-height: 1;
    font-size: 11px;
}

.date-weekday {
    font-size: 8px;
    color: #666;
    line-height: 1;
    margin-top: 1px;
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
    padding: 8px 4px;
    font-weight: 600;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    background: white;
    font-size: 12px;
    text-align: center;
    position: sticky;
    left: 0;
    z-index: 5;
}

.room-name:hover {
    background: #f8f9fa;
}

.theme-dark .room-name {
    background: #1e1e1e;
    border-color: #444;
}

.theme-dark .room-name:hover {
    background: #2a2a2a;
}

.date-cell {
    padding: 0;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    height: 35px;
    cursor: pointer;
    position: relative;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    /* Allow shrinking */
}

.theme-dark .date-cell {
    border-color: #444;
}

.date-cell:hover {
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.05);
}

.theme-dark .date-cell:hover {
    background: rgba(255, 255, 255, 0.05);
}

.date-cell.is-today {
    border-left: 3px solid #2563eb;
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
}

.guest-initials {
    font-size: 10px;
    font-weight: 600;
}

/* Legend */
.legend {
    display: flex;
    gap: 16px;
    padding: 16px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
    flex-wrap: wrap;
}

.theme-dark .legend {
    background: #2d2d2d;
    border-top-color: #444;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid;
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-header {
        padding: 12px 16px;
    }

    .nav-btn {
        padding: 6px 12px;
        font-size: 12px;
    }

    .current-month {
        font-size: 16px;
    }

    .calendar-grid {
        grid-template-columns: 60px repeat(var(--days-in-month), 1fr);
    }

    .room-header,
    .room-name {
        padding: 6px 2px;
        font-size: 10px;
    }

    .date-header {
        padding: 4px 1px;
        font-size: 9px;
    }

    .date-number {
        font-size: 9px;
    }

    .date-weekday {
        font-size: 7px;
    }

    .date-cell {
        height: 30px;
    }

    .legend {
        padding: 12px 16px;
        gap: 12px;
    }

    .guest-initials {
        font-size: 8px;
    }
}
</style>