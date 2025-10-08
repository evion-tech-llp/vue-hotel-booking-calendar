<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue Hotel Booking Calendar Demo</h1>
      <div class="version-badge">
        <span class="version-tag">v1.0.10</span>
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
import type {
  DateAvailability,
  DateRange,
  SelectionError,
  PriceCalculation,
  Room,
  Booking,
  StatusConfig,
  CalendarTextLabels,
  DashboardTextLabels
} from './types'

// Guest calendar state
const guestSelection = ref<DateRange>({ checkIn: null, checkOut: null })
const dashboardMonth = ref(new Date())
const today = new Date()

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

    // Some random blocked dates
    const isBlocked = [5, 12, 19, 25, 31, 38, 45].includes(i)

    return {
      date,
      status: isBlocked ? 'blocked' as const : 'available' as const,
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