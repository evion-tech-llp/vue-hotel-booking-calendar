<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue Hotel Booking Calendar Demo</h1>
      
      <div class="demo-section">
        <h2>Basic Usage</h2>
        <p class="demo-description">
          Simple calendar showing availability states. Green = available, Red = blocked, Half-colors = checkout-only.
          Try selecting a date range - blocked dates will prevent selection.
        </p>
        <HotelBookingCalendar
          v-model="selection"
          :availability-data="sampleAvailability"
          @date-click="onDateClick"
          @selection-change="onSelectionChange"
        />
      </div>

      <div class="demo-section">
        <h2>With Price Display</h2>
        <p class="demo-description">
          Calendar with price display enabled. Available dates show dynamic pricing based on demand.
        </p>
        <HotelBookingCalendar
          v-model="selection2"
          :availability-data="sampleAvailabilityWithPrices"
          :show-prices="true"
          @selection-change="onSelectionChange"
        />
      </div>

      <div class="demo-section">
        <h2>Dark Theme</h2>
        <p class="demo-description">
          Same functionality with dark theme for better integration with dark UIs.
        </p>
        <HotelBookingCalendar
          v-model="selection3"
          :availability-data="sampleAvailabilityWithPrices"
          theme="dark"
          :show-prices="true"
        />
      </div>

      <div class="demo-section">
        <h2>Custom Date Range</h2>
        <p class="demo-description">
          Calendar with custom min/max dates and past dates enabled for testing.
        </p>
        <HotelBookingCalendar
          v-model="selection4"
          :availability-data="sampleAvailability"
          min-date="2025-06-01"
          max-date="2025-09-30"
          :disable-past-dates="false"
        />
      </div>

      <div class="demo-section">
        <h2>Single Day Selection</h2>
        <p class="demo-description">
          Calendar allowing single day selections (same check-in and check-out date).
        </p>
        <HotelBookingCalendar
          v-model="selection5"
          :availability-data="sampleAvailability"
          :allow-single-day="true"
          :show-prices="true"
        />
      </div>

      <div class="selection-info">
        <h3>Selection States:</h3>
        <div class="selections-grid">
          <div class="selection-item">
            <h4>Basic Calendar:</h4>
            <p><strong>Check-in:</strong> {{ selection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection.checkOut || 'Not selected' }}</p>
          </div>
          
          <div class="selection-item">
            <h4>With Prices:</h4>
            <p><strong>Check-in:</strong> {{ selection2.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection2.checkOut || 'Not selected' }}</p>
          </div>
          
          <div class="selection-item">
            <h4>Dark Theme:</h4>
            <p><strong>Check-in:</strong> {{ selection3.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection3.checkOut || 'Not selected' }}</p>
          </div>
          
          <div class="selection-item">
            <h4>Custom Range:</h4>
            <p><strong>Check-in:</strong> {{ selection4.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection4.checkOut || 'Not selected' }}</p>
          </div>

          <div class="selection-item">
            <h4>Single Day:</h4>
            <p><strong>Check-in:</strong> {{ selection5.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection5.checkOut || 'Not selected' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'
import type { DateAvailability, AvailabilityStatus } from './types'

// Demo data
const selection = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const selection2 = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const selection3 = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const selection4 = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const selection5 = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

// Sample availability data for demonstration
// Only specify booked/checkout-only dates - all other dates will be available (green) by default
const sampleAvailability: DateAvailability[] = [
  // Current month (July 2025) bookings
  { date: '2025-07-15', status: 'blocked' },
  { date: '2025-07-16', status: 'blocked' },
  { date: '2025-07-17', status: 'checkout-only' },
  { date: '2025-07-22', status: 'blocked' },
  { date: '2025-07-23', status: 'blocked' },
  { date: '2025-07-24', status: 'blocked' },
  { date: '2025-07-25', status: 'checkout-only' },
  { date: '2025-07-28', status: 'blocked' },
  { date: '2025-07-29', status: 'checkout-only' },
  
  // Next month (August 2025) bookings
  { date: '2025-08-03', status: 'blocked' },
  { date: '2025-08-04', status: 'blocked' },
  { date: '2025-08-05', status: 'checkout-only' },
  { date: '2025-08-12', status: 'blocked' },
  { date: '2025-08-13', status: 'blocked' },
  { date: '2025-08-14', status: 'blocked' },
  { date: '2025-08-15', status: 'checkout-only' },
  { date: '2025-08-20', status: 'blocked' },
  { date: '2025-08-21', status: 'checkout-only' },
  
  // Previous month (June 2025) for testing navigation
  { date: '2025-06-28', status: 'blocked' },
  { date: '2025-06-29', status: 'checkout-only' },
  { date: '2025-06-30', status: 'blocked' },
]

// Sample data with prices for price display demo
const sampleAvailabilityWithPrices: DateAvailability[] = [
  // Blocked dates (no prices needed)
  { date: '2025-07-15', status: 'blocked' },
  { date: '2025-07-16', status: 'blocked' },
  { date: '2025-07-22', status: 'blocked' },
  { date: '2025-07-23', status: 'blocked' },
  { date: '2025-07-24', status: 'blocked' },
  { date: '2025-07-28', status: 'blocked' },
  
  // Checkout-only with prices
  { date: '2025-07-17', status: 'checkout-only', price: 89 },
  { date: '2025-07-25', status: 'checkout-only', price: 129 },
  { date: '2025-07-29', status: 'checkout-only', price: 109 },
  
  // Available dates with varying prices (optional - shows on hover/selection)
  { date: '2025-07-01', status: 'available', price: 120 },
  { date: '2025-07-02', status: 'available', price: 120 },
  { date: '2025-07-05', status: 'available', price: 150 }, // Weekend
  { date: '2025-07-06', status: 'available', price: 150 }, // Weekend
  { date: '2025-07-12', status: 'available', price: 180 }, // Weekend premium
  { date: '2025-07-13', status: 'available', price: 180 }, // Weekend premium
  { date: '2025-07-19', status: 'available', price: 200 }, // Peak weekend
  { date: '2025-07-20', status: 'available', price: 200 }, // Peak weekend
  { date: '2025-07-26', status: 'available', price: 165 }, // Weekend
  { date: '2025-07-27', status: 'available', price: 165 }, // Weekend
]

// Event handlers for demo
const onDateClick = (date: string, status: AvailabilityStatus) => {
  console.log('Date clicked:', date, 'Status:', status)
}

const onSelectionChange = (newSelection: { checkIn?: string | null; checkOut?: string | null }) => {
  console.log('Selection changed:', newSelection)
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
  padding: 20px;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
}

.demo-section {
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-top: 0;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.demo-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.selection-info {
  background: #e6fffa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #81e6d9;
}

.selection-info h3 {
  margin-top: 0;
  color: #2d3748;
}

.selection-info p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.selections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.selection-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.selection-item h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.9rem;
}
</style> 