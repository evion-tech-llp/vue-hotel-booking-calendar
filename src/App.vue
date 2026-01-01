<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue Hotel Booking Calendar Demo</h1>
      <div class="version-badge">
        <span class="version-tag">v1.0.11</span>
        <span class="version-label">Latest Release</span>
      </div>
      <p class="demo-intro">
        Interactive demo showcasing the new v1.0.2 features including price calculation, booking flow, and the new hotel
        dashboard component.
        <br><strong>All dates are dynamically generated</strong> relative to today ({{ formatDate(today) }}) so the demo
        stays current!
      </p>

      <!-- Guest Booking Calendar Demo -->
      <div class="demo-section">
        <h2>🏷️ Guest Booking Calendar</h2>
        <p class="demo-description">
          Enhanced calendar for guests with price calculation, booking summary, and currency formatting.
          <strong>Custom text labels demo</strong>: Notice the simplified language like "Back/Forward", "Your Stay", "Book This Stay", etc.
          Base price: £85/night. Select dates to see pricing and booking flow.
        </p>
        <HotelBookingCalendar v-model="guestSelection" :availability-data="guestAvailabilityData" :base-price="85"
          currency="GBP" :show-price-calculation="true" :show-selection-errors="true" theme="light"
          :allow-previous-month-navigation="true" :text-labels="guestCalendarLabels"
          @selection-error="handleSelectionError" @price-calculation="handlePriceCalculation"
          @book-now="handleBookNow" />
      </div>

      <!-- Hotel Dashboard Demo -->
      <div class="demo-section">
        <h2>🏨 Hotel Dashboard Calendar</h2>
        <p class="demo-description">
          Hotel dashboard component focused on clean display and event emission. Shows room-wise booking grid with guest
          initials. <strong>Custom text labels</strong>: Uses simple terms like "Previous/Next" and "Free" instead of "Available".
          <br><strong>Hover over bookings</strong> to see full guest name and booking details in tooltip.
          <br><strong>Click bookings</strong> to emit booking-click event to parent for detailed handling.
          <br><strong>Click empty cells</strong> to emit booking-create event to parent.
          <br><strong>Parent handles</strong> all modals, forms, and booking management logic.
        </p>
        <HotelDashboardCalendar :rooms="sampleRooms" :bookings="sampleBookings" :selected-month="dashboardMonth"
          :status-config="customStatusConfig" theme="light" :allow-previous-month-navigation="true" 
          :text-labels="dashboardCalendarLabels" @update:selected-month="dashboardMonth = $event"
          @booking-click="handleBookingClick" @booking-create="handleBookingCreate" />
      </div>

      <!-- Resource Scheduler Calendar Demo -->
      <div class="demo-section">
        <h2>📅 Resource Scheduler Calendar</h2>
        <p class="demo-description">
          A comprehensive resource scheduling calendar with <strong>5 different views</strong>: Yearly, Monthly, Weekly, Daily, and Hourly.
          <br><strong>Perfect for:</strong> Meeting rooms, equipment booking, staff scheduling, appointment management.
          <br><strong>Features:</strong> Multiple views, working hours, event categories, time intervals (15/30/60 min), conflict detection.
          <br><strong>Click on time slots</strong> to create events. <strong>Click on events</strong> to view details.
        </p>
        <ResourceSchedulerCalendar 
          :events="schedulerEvents" 
          :categories="eventCategories"
          :selected-date="schedulerDate"
          :view="schedulerView"
          theme="light"
          locale="en-US"
          :time-interval="60"
          :working-hours="{ start: 9, end: 18 }"
          :show-all-day-slot="true"
          :first-day-of-week="0"
          @update:selected-date="schedulerDate = $event"
          @update:view="schedulerView = $event"
          @event-click="handleSchedulerEventClick"
          @slot-click="handleSchedulerSlotClick"
          @event-create="handleSchedulerEventCreate"
        />
      </div>

      <!-- Demo Features List -->
      <div class="demo-section">
        <h2>✨ Features Showcase</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>💰 Price Calculation</h3>
            <p>Real-time pricing with currency support, daily breakdowns, and booking summaries.</p>
          </div>
          <div class="feature-card">
            <h3>🚨 Smart Error Handling</h3>
            <p>Intelligent validation for blocked dates, minimum stays, and booking conflicts.</p>
          </div>
          <div class="feature-card">
            <h3>📊 Hotel Dashboard</h3>
            <p>Complete booking management with room-wise views, occupancy tracking, and guest management.</p>
          </div>
          <div class="feature-card">
            <h3>🌍 Custom Text Labels</h3>
            <p>Fully customizable text labels for different languages or simplified terminology - perfect for different audiences.</p>
          </div>
          <div class="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Mobile-first design that works perfectly on all device sizes.</p>
          </div>
          <div class="feature-card">
            <h3>🎨 Themeable</h3>
            <p>Light and dark theme support with customizable styling options.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'
import HotelDashboardCalendar from './components/HotelDashboardCalendar.vue'
import ResourceSchedulerCalendar from './components/ResourceSchedulerCalendar.vue'
import type {
  DateAvailability,
  DateRange,
  SelectionError,
  PriceCalculation,
  Room,
  Booking,
  StatusConfig,
  CalendarTextLabels,
  DashboardTextLabels,
  ResourceEvent,
  EventCategory,
  SchedulerViewType,
  TimeSlot
} from './types'

// Guest calendar state
const guestSelection = ref<DateRange>({ checkIn: null, checkOut: null })
const dashboardMonth = ref(new Date())
const today = new Date()

// Resource Scheduler state
const schedulerDate = ref(new Date())
const schedulerView = ref<SchedulerViewType>('monthly')

// Custom text labels for guest calendar - Simple demo language
const guestCalendarLabels = ref<CalendarTextLabels>({
  previousMonth: '← Back',
  nextMonth: 'Forward →',
  bookingSummary: 'Your Stay',
  nights: 'nights',
  night: 'night',
  priceBreakdown: 'Show details',
  total: 'Total Cost',
  bookNow: 'Book This Stay',
  available: 'Open',
  checkoutOnly: 'Check-out Only',
  blocked: 'Not Available',
  clearSelection: 'Start over',
  dismissError: 'Got it'
})

// Custom text labels for dashboard calendar - Simple demo language
const dashboardCalendarLabels = ref<DashboardTextLabels>({
  previousMonth: '← Previous',
  nextMonth: 'Next →',
  room: 'Room',
  available: 'Free',
  createBooking: 'Click to add booking',
  clickForDetails: 'Click to view details'
})

// Helper function to get dynamic dates
const getDynamicDate = (daysFromToday: number): string => {
  const date = new Date(today)
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().split('T')[0]
}

// Sample data for guest calendar
const guestAvailabilityData = computed<DateAvailability[]>(() => [
  // Next 60 days with realistic availability
  ...Array.from({ length: 60 }, (_, i) => {
    const date = getDynamicDate(i)
    const dayOfWeek = new Date(date).getDay()

    // Weekend premium pricing
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const basePrice = isWeekend ? 110 : 85

    // Some random blocked and checkout-only dates
    const isBlocked = [5, 12, 19, 25, 31, 38, 45].includes(i)
    const isCheckoutOnly = [7, 15, 22, 28, 35, 42].includes(i)

    return {
      date,
      status: isBlocked ? 'blocked' as const : isCheckoutOnly ? 'checkout-only' as const : 'available' as const,
      price: basePrice,
      minStay: isWeekend ? 2 : 1,
      maxStay: 14
    }
  })
])

// Sample rooms data - minimal interface
const sampleRooms = computed<Room[]>(() => [
  { id: '1', number: '101' },
  { id: '2', number: '102' },
  { id: '3', number: '201' },
  { id: '4', number: '202' },
  { id: '5', number: '301' }
])

// Sample bookings data - minimal interface
const sampleBookings = computed<Booking[]>(() => [
  {
    id: '1',
    guestName: 'John Smith',
    roomNumber: '101',
    checkIn: getDynamicDate(2),
    checkOut: getDynamicDate(5),
    status: 'confirmed'
  },
  {
    id: '2',
    guestName: 'Sarah Johnson',
    roomNumber: '102',
    checkIn: getDynamicDate(7),
    checkOut: getDynamicDate(10),
    status: 'checked-in'
  },
  {
    id: '3',
    guestName: 'Michael Brown',
    roomNumber: '201',
    checkIn: getDynamicDate(1),
    checkOut: getDynamicDate(4),
    status: 'confirmed'
  },
  {
    id: '4',
    guestName: 'Emma Wilson',
    roomNumber: '202',
    checkIn: getDynamicDate(15),
    checkOut: getDynamicDate(17),
    status: 'pending'
  },
  {
    id: '5',
    guestName: 'David Taylor',
    roomNumber: '301',
    checkIn: getDynamicDate(20),
    checkOut: getDynamicDate(25),
    status: 'confirmed'
  },
  {
    id: '6',
    guestName: 'Lisa Anderson',
    roomNumber: '101',
    checkIn: getDynamicDate(12),
    checkOut: getDynamicDate(14),
    status: 'cancelled'
  }
])

// Event categories for Resource Scheduler
const eventCategories = computed<EventCategory[]>(() => [
  {
    id: 'meeting',
    name: 'Meeting',
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    darkBackgroundColor: '#1e3a8a'
  },
  {
    id: 'appointment',
    name: 'Appointment',
    color: '#047857',
    backgroundColor: '#d1fae5',
    darkBackgroundColor: '#064e3b'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    darkBackgroundColor: '#78350f'
  },
  {
    id: 'blocked',
    name: 'Blocked',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    darkBackgroundColor: '#7f1d1d'
  }
])

// Sample events for Resource Scheduler
const schedulerEvents = computed<ResourceEvent[]>(() => [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily standup meeting with the development team',
    start: `${getDynamicDate(0)}T09:00:00`,
    end: `${getDynamicDate(0)}T09:30:00`,
    categoryId: 'meeting',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Quarterly project review with stakeholders',
    start: `${getDynamicDate(0)}T14:00:00`,
    end: `${getDynamicDate(0)}T16:00:00`,
    categoryId: 'meeting',
    location: 'Board Room'
  },
  {
    id: '3',
    title: 'Client Call',
    description: 'Follow-up call with ABC Corp',
    start: `${getDynamicDate(1)}T10:00:00`,
    end: `${getDynamicDate(1)}T11:00:00`,
    categoryId: 'appointment'
  },
  {
    id: '4',
    title: 'System Maintenance',
    description: 'Scheduled server maintenance window',
    start: `${getDynamicDate(2)}T22:00:00`,
    end: `${getDynamicDate(3)}T02:00:00`,
    categoryId: 'maintenance'
  },
  {
    id: '5',
    title: 'Training Session',
    description: 'New employee onboarding',
    start: `${getDynamicDate(3)}T09:00:00`,
    end: `${getDynamicDate(3)}T12:00:00`,
    categoryId: 'meeting',
    location: 'Training Room'
  },
  {
    id: '6',
    title: 'Equipment Reserved',
    start: `${getDynamicDate(4)}T00:00:00`,
    end: `${getDynamicDate(4)}T23:59:59`,
    allDay: true,
    categoryId: 'blocked'
  },
  {
    id: '7',
    title: 'Sprint Planning',
    description: 'Plan sprint 24 tasks and priorities',
    start: `${getDynamicDate(7)}T13:00:00`,
    end: `${getDynamicDate(7)}T15:00:00`,
    categoryId: 'meeting',
    location: 'Conference Room B'
  },
  {
    id: '8',
    title: 'Doctor Appointment',
    start: `${getDynamicDate(5)}T11:30:00`,
    end: `${getDynamicDate(5)}T12:30:00`,
    categoryId: 'appointment',
    location: 'Medical Center'
  },
  // RECURRING EVENTS EXAMPLES
  {
    id: '9',
    title: '🔄 Daily Standup (Recurring)',
    description: 'Recurring daily standup - every weekday',
    start: `${getDynamicDate(0)}T09:00:00`,
    end: `${getDynamicDate(0)}T09:15:00`,
    categoryId: 'meeting',
    location: 'Virtual',
    recurrence: {
      frequency: 'daily',
      interval: 1,
      endAfterOccurrences: 30
    }
  },
  {
    id: '10',
    title: '🔄 Weekly Team Sync (Recurring)',
    description: 'Recurring weekly team sync every Monday and Wednesday',
    start: `${getDynamicDate(0)}T14:00:00`,
    end: `${getDynamicDate(0)}T15:00:00`,
    categoryId: 'meeting',
    location: 'Conference Room A',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 3], // Monday and Wednesday
      endAfterOccurrences: 12
    }
  },
  {
    id: '11',
    title: '🔄 Monthly Report (Recurring)',
    description: 'Monthly status report - 15th of each month',
    start: `${getDynamicDate(0)}T10:00:00`,
    end: `${getDynamicDate(0)}T11:00:00`,
    categoryId: 'appointment',
    location: 'Board Room',
    recurrence: {
      frequency: 'monthly',
      interval: 1,
      dayOfMonth: 15,
      endAfterOccurrences: 6
    }
  }
])

// Custom status configuration example
const customStatusConfig = computed<StatusConfig[]>(() => [
  {
    key: 'available',
    label: 'Available',
    color: '#666',
    backgroundColor: '#f8f9fa',
    darkBackgroundColor: '#2a2a2a'
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    color: '#155e75',
    backgroundColor: '#a7f3d0',
    darkBackgroundColor: '#064e3b'
  },
  {
    key: 'pending',
    label: 'Pending Review',
    color: '#b45309',
    backgroundColor: '#fed7aa',
    darkBackgroundColor: '#7c2d12'
  },
  {
    key: 'checked-in',
    label: 'Guest Arrived',
    color: '#1e40af',
    backgroundColor: '#93c5fd',
    darkBackgroundColor: '#1e3a8a'
  },
  {
    key: 'checked-out',
    label: 'Departed',
    color: '#7c3aed',
    backgroundColor: '#d8b4fe',
    darkBackgroundColor: '#5b21b6'
  },
  {
    key: 'cancelled',
    label: 'Cancelled',
    color: '#dc2626',
    backgroundColor: '#fca5a5',
    darkBackgroundColor: '#7f1d1d'
  }
])

// Event handlers for guest calendar
const handleSelectionError = (error: SelectionError | null) => {
  if (error) {
    // Handle selection error - could show user notification
  }
}

const handlePriceCalculation = () => {
  // Handle price calculation updates
}

const handleBookNow = (data: { selection: DateRange; calculation: PriceCalculation }) => {
  alert(`Booking request for ${data.calculation.nights} nights - Total: ${formatCurrency(data.calculation.totalPrice)}`)
}

// Event handlers for dashboard calendar
const handleBookingClick = (booking: Booking) => {
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
  alert(`Booking Details:\n\nGuest: ${booking.guestName}\nRoom: ${booking.roomNumber}\nStatus: ${booking.status}\nNights: ${nights}\n\n(Parent component would show detailed modal here)`)
}

const handleBookingCreate = (data: { roomId: string; date: string }) => {
  const room = sampleRooms.value.find(r => r.id === data.roomId)
  alert(`Create new booking:\nRoom: ${room?.number}\nDate: ${formatDate(new Date(data.date))}\n\n(Parent component would show booking form here)`)
}

// Event handlers for Resource Scheduler
const handleSchedulerEventClick = (event: ResourceEvent) => {
  const category = eventCategories.value.find(c => c.id === event.categoryId)
  alert(`Event Details:\n\nTitle: ${event.title}\nDescription: ${event.description || 'N/A'}\nCategory: ${category?.name || 'None'}\nLocation: ${event.location || 'N/A'}\nStart: ${new Date(event.start).toLocaleString()}\nEnd: ${new Date(event.end).toLocaleString()}`)
}

const handleSchedulerSlotClick = (slot: TimeSlot) => {
  alert(`Create new event:\n\nDate: ${slot.date}\nStart: ${new Date(slot.start).toLocaleTimeString()}\nEnd: ${new Date(slot.end).toLocaleTimeString()}\n\n(Would open event creation form)`)
}

const handleSchedulerEventCreate = (data: { start: string; end: string; allDay?: boolean }) => {
  alert(`New event request:\n\nStart: ${data.start}\nEnd: ${data.end}\nAll Day: ${data.allDay ? 'Yes' : 'No'}\n\n(Would open event creation form)`)
}

// Utility functions
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  color: #2c3e50;
}

#app {
  min-height: 100vh;
  padding: 40px 20px;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #f1f3f4;
}

h1 {
  text-align: center;
  color: #1a202c;
  font-size: 36px;
  font-weight: 600;
  margin: 0;
  padding: 60px 40px 20px;
  background: white;
  border-bottom: 1px solid #f1f3f4;
  letter-spacing: -0.02em;
}

.version-badge {
  text-align: center;
  margin: 0 0 30px;
  padding: 0 40px 30px;
  background: white;
  border-bottom: 1px solid #f1f3f4;
}

.version-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e9ecef;
  display: inline-block;
}

.version-label {
  color: #6c757d;
  font-size: 11px;
  margin-left: 8px;
}

.demo-intro {
  text-align: center;
  color: #495057;
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  padding: 40px 40px 50px;
  background: white;
  font-weight: 400;
}

.demo-section {
  padding: 50px 40px;
  border-bottom: 1px solid #f1f3f4;
  background: white;
}

.demo-section:last-child {
  border-bottom: none;
}

.demo-section h2 {
  color: #1a202c;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
}

.demo-description {
  color: #495057;
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 40px 0;
  font-weight: 400;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.feature-card {
  background: #fdfdfd;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #f1f3f4;
  transition: all 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #e9ecef;
}

.feature-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #1a202c;
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
  font-weight: 400;
}

@media (max-width: 768px) {
  #app {
    padding: 20px 10px;
  }

  .demo-container {
    border-radius: 8px;
  }

  h1 {
    font-size: 28px;
    padding: 40px 20px 15px;
  }

  .demo-intro {
    padding: 30px 20px 40px;
    font-size: 16px;
  }

  .demo-section {
    padding: 40px 20px;
  }

  .demo-section h2 {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-card {
    padding: 24px;
  }
}
</style>