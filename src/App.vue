<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue Hotel Booking Calendar Demo</h1>
      <div class="version-badge">
        <span class="version-tag">v1.0.2</span>
        <span class="version-label">Latest Release</span>
      </div>
      <p class="demo-intro">
        Interactive demo showcasing the new v1.0.2 features including price calculation, booking flow, and error
        handling.
        <br><strong>All dates are dynamically generated</strong> relative to today ({{ formatDate(today) }}) so the demo
        stays current!
      </p>

      <div class="demo-section featured">
        <div class="feature-badge">🆕 NEW in v1.0.2</div>
        <h2>💰 Price Calculation & Booking Flow</h2>
        <p class="demo-description">
          Complete booking experience with real-time price calculation, compact summary, and Book Now functionality.
          Select dates to see total pricing with daily breakdown. Base price: £95/night.
        </p>
        <HotelBookingCalendar v-model="priceSelection" :availability-data="dynamicAvailabilityWithPrices"
          :show-prices="true" :show-price-calculation="true" :base-price="95" currency="GBP" locale="en-GB"
          @selection-change="onSelectionChange" @price-calculation="onPriceCalculation" @book-now="onBookNow" />
        <div v-if="currentPriceCalculation" class="price-info">
          <h4>💰 Live Price Calculation:</h4>
          <p><strong>Nights:</strong> {{ currentPriceCalculation.nights }}</p>
          <p><strong>Total:</strong> {{ formatPriceGBP(currentPriceCalculation.totalPrice) }}</p>
          <p><strong>Average per night:</strong> {{ formatPriceGBP(currentPriceCalculation.averagePerNight) }}</p>
        </div>
        <div v-if="lastBooking" class="booking-info">
          <h4>🎯 Last Booking Event:</h4>
          <p><strong>Check-in:</strong> {{ lastBooking.selection.checkIn }}</p>
          <p><strong>Check-out:</strong> {{ lastBooking.selection.checkOut }}</p>
          <p><strong>Total:</strong> {{ formatPriceGBP(lastBooking.calculation.totalPrice) }}</p>
          <p class="booking-note">Ready for payment integration!</p>
        </div>
      </div>

      <div class="demo-section featured">
        <div class="feature-badge">🆕 NEW in v1.0.2</div>
        <h2>⚠️ Intelligent Error Handling</h2>
        <p class="demo-description">
          Smart error handling with visual feedback when selecting ranges with blocked dates.
          Try selecting a range that includes red (blocked) dates - you'll see helpful error messages.
          <strong>Tip:</strong> Try selecting from {{ formatDateShort(getDateDaysFromNow(7)) }} to {{
            formatDateShort(getDateDaysFromNow(12)) }} to see the error in action.
        </p>
        <HotelBookingCalendar v-model="errorSelection" :availability-data="dynamicAvailabilityWithBlockedRanges"
          :show-prices="true" :show-price-calculation="true" :show-selection-errors="true" :base-price="78"
          currency="GBP" locale="en-GB" @selection-error="onSelectionError" @price-calculation="onPriceCalculation" />
        <div v-if="lastSelectionError" class="error-info">
          <h4>🚨 Last Selection Error:</h4>
          <p><strong>Type:</strong> {{ lastSelectionError.type }}</p>
          <p><strong>Message:</strong> {{ lastSelectionError.message }}</p>
          <p v-if="lastSelectionError.blockedDates" class="blocked-dates">
            <strong>Blocked dates:</strong> {{ formatBlockedDates(lastSelectionError.blockedDates) }}
          </p>
        </div>
      </div>

      <div class="demo-section">
        <h2>🌙 Dark Theme with Pricing</h2>
        <p class="demo-description">
          Dark theme version with all features enabled. Perfect for dark mode applications.
          Base price: ¥15,000/night with Japanese Yen formatting.
        </p>
        <HotelBookingCalendar v-model="darkSelection" :availability-data="dynamicAvailabilityWithPrices" theme="dark"
          :show-prices="true" :show-price-calculation="true" :base-price="15000" currency="JPY" locale="ja-JP" />
      </div>

      <div class="demo-section">
        <h2>📅 Basic Usage</h2>
        <p class="demo-description">
          Simple calendar showing availability states. Green = available, Red = blocked, Half-colors = checkout-only.
          Try selecting a date range - blocked dates will prevent selection.
        </p>
        <HotelBookingCalendar v-model="selection" :availability-data="dynamicBasicAvailability"
          @date-click="onDateClick" @selection-change="onSelectionChange" />
      </div>

      <div class="demo-section">
        <h2>💵 Different Currencies & Locales</h2>
        <p class="demo-description">
          Showcase different currency formatting and locales. This example uses British Pounds with UK locale.
        </p>
        <HotelBookingCalendar v-model="currencySelection" :availability-data="dynamicAvailabilityWithPrices"
          :show-prices="true" :show-price-calculation="true" :base-price="85" currency="GBP" locale="en-GB" />
      </div>

      <div class="demo-section">
        <h2>📍 Custom Date Range</h2>
        <p class="demo-description">
          Calendar with custom min/max dates. Range: {{ formatDateShort(getDateMonthsFromNow(1)) }} to {{
            formatDateShort(getDateMonthsFromNow(4)) }}
        </p>
        <HotelBookingCalendar v-model="selection4" :availability-data="dynamicBasicAvailability"
          :min-date="getDateMonthsFromNow(1)" :max-date="getDateMonthsFromNow(4)" :disable-past-dates="false" />
      </div>

      <div class="demo-section">
        <h2>📋 Single Day Selection</h2>
        <p class="demo-description">
          Calendar allowing single day selections (same check-in and check-out date).
        </p>
        <HotelBookingCalendar v-model="selection5" :availability-data="dynamicBasicAvailability"
          :allow-single-day="true" :show-prices="true" />
      </div>

      <div class="selection-info">
        <h3>📊 Current Selection States:</h3>
        <div class="selections-grid">
          <div class="selection-item">
            <h4>Price Calculation:</h4>
            <p><strong>Check-in:</strong> {{ priceSelection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ priceSelection.checkOut || 'Not selected' }}</p>
          </div>

          <div class="selection-item">
            <h4>Error Handling:</h4>
            <p><strong>Check-in:</strong> {{ errorSelection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ errorSelection.checkOut || 'Not selected' }}</p>
          </div>

          <div class="selection-item">
            <h4>Dark Theme:</h4>
            <p><strong>Check-in:</strong> {{ darkSelection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ darkSelection.checkOut || 'Not selected' }}</p>
          </div>

          <div class="selection-item">
            <h4>Currency Demo:</h4>
            <p><strong>Check-in:</strong> {{ currencySelection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ currencySelection.checkOut || 'Not selected' }}</p>
          </div>

          <div class="selection-item">
            <h4>Basic Calendar:</h4>
            <p><strong>Check-in:</strong> {{ selection.checkIn || 'Not selected' }}</p>
            <p><strong>Check-out:</strong> {{ selection.checkOut || 'Not selected' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'
import type { DateAvailability, AvailabilityStatus, SelectionError, PriceCalculation } from './types'

// Get current date for dynamic date generation
const today = new Date()
today.setHours(0, 0, 0, 0)

// Demo data - New selections for enhanced features
const priceSelection = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const errorSelection = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const darkSelection = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

const currencySelection = ref({
  checkIn: null as string | null,
  checkOut: null as string | null
})

// Existing selections
const selection = ref({
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

// Event data
const currentPriceCalculation = ref<PriceCalculation | null>(null)
const lastSelectionError = ref<SelectionError | null>(null)
const lastBooking = ref<{ selection: { checkIn: string | null; checkOut: string | null }; calculation: PriceCalculation } | null>(null)

// Helper functions for dynamic date generation
const getDateDaysFromNow = (days: number): Date => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date
}

const getDateMonthsFromNow = (months: number): Date => {
  const date = new Date(today)
  date.setMonth(date.getMonth() + months)
  return date
}

const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Dynamic availability data generation
const dynamicAvailabilityWithPrices = computed((): DateAvailability[] => {
  const availability: DateAvailability[] = []

  // Generate data for next 90 days
  for (let i = 1; i <= 90; i++) {
    const date = getDateDaysFromNow(i)
    const dateString = formatDateToString(date)
    const dayOfWeek = date.getDay()

    // Create patterns for blocked dates (every 8-10 days with some randomness)
    const isBlocked = i % 9 === 0 || i % 13 === 0 || i === 15 || i === 16 || i === 22 || i === 28

    // Checkout-only dates (day after some blocked periods)
    const isCheckoutOnly = i === 17 || i === 25 || i === 35 || i === 45

    if (isBlocked) {
      availability.push({
        date: dateString,
        status: 'blocked'
      })
    } else if (isCheckoutOnly) {
      availability.push({
        date: dateString,
        status: 'checkout-only',
        price: 89 + Math.floor(Math.random() * 40) // Random price between 89-129
      })
    } else {
      // Calculate dynamic pricing based on patterns
      let basePrice = 120

      // Weekend premium (Friday, Saturday, Sunday)
      if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
        basePrice += 60
      }

      // Month-based seasonal pricing
      const month = date.getMonth()
      if (month >= 5 && month <= 7) { // Summer months (Jun, Jul, Aug)
        basePrice += 30
      } else if (month === 11 || month === 0) { // Holiday season (Dec, Jan)
        basePrice += 50
      }

      // Add some randomness
      basePrice += Math.floor(Math.random() * 30) - 15

      availability.push({
        date: dateString,
        status: 'available',
        price: Math.max(basePrice, 90) // Minimum price of 90
      })
    }
  }

  return availability
})

// Availability data specifically designed for error testing
const dynamicAvailabilityWithBlockedRanges = computed((): DateAvailability[] => {
  const availability: DateAvailability[] = []

  // Generate data for next 60 days with specific blocked patterns
  for (let i = 1; i <= 60; i++) {
    const date = getDateDaysFromNow(i)
    const dateString = formatDateToString(date)
    const dayOfWeek = date.getDay()

    // Create specific blocked ranges for error testing
    const isBlocked =
      (i >= 7 && i <= 10) || // Block days 7-10 for error testing
      (i >= 18 && i <= 20) || // Block days 18-20
      i === 25 || i === 32 || i === 38

    const isCheckoutOnly = i === 11 || i === 21 || i === 30

    if (isBlocked) {
      availability.push({
        date: dateString,
        status: 'blocked'
      })
    } else if (isCheckoutOnly) {
      availability.push({
        date: dateString,
        status: 'checkout-only',
        price: 95 + Math.floor(Math.random() * 30)
      })
    } else {
      // Pricing logic
      let basePrice = 110

      if (dayOfWeek === 5 || dayOfWeek === 6) {
        basePrice += 40
      }

      basePrice += Math.floor(Math.random() * 25) - 10

      availability.push({
        date: dateString,
        status: 'available',
        price: Math.max(basePrice, 80)
      })
    }
  }

  return availability
})

// Basic availability for simple demos
const dynamicBasicAvailability = computed((): DateAvailability[] => {
  const availability: DateAvailability[] = []

  // Generate simpler pattern for basic demo
  for (let i = 1; i <= 60; i++) {
    const date = getDateDaysFromNow(i)
    const dateString = formatDateToString(date)

    // Simple patterns
    const isBlocked = i % 12 === 0 || i % 17 === 0
    const isCheckoutOnly = (i + 1) % 12 === 0 || (i + 1) % 17 === 0

    if (isBlocked) {
      availability.push({
        date: dateString,
        status: 'blocked'
      })
    } else if (isCheckoutOnly) {
      availability.push({
        date: dateString,
        status: 'checkout-only'
      })
    }
    // Don't add available dates - they'll be default
  }

  return availability
})

// Event handlers
const onDateClick = (date: string, status: AvailabilityStatus) => {
  console.log('Date clicked:', date, 'Status:', status)
}

const onSelectionChange = (newSelection: { checkIn?: string | null; checkOut?: string | null }) => {
  console.log('Selection changed:', newSelection)
}

const onPriceCalculation = (calculation: PriceCalculation | null) => {
  currentPriceCalculation.value = calculation
  console.log('Price calculation:', calculation)
}

const onSelectionError = (error: SelectionError) => {
  lastSelectionError.value = error
  console.log('Selection error:', error)
}

const onBookNow = (booking: { selection: { checkIn: string | null; checkOut: string | null }; calculation: PriceCalculation }) => {
  lastBooking.value = booking
  console.log('Book Now event:', booking)
}

// Helper functions for display
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const formatPriceGBP = (price: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(price)
}

const formatBlockedDates = (dates: string[]): string => {
  return dates.map(dateStr => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }).join(', ')
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
  margin-bottom: 1rem;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #4f46e5, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.version-badge {
  display: inline-block;
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-intro {
  text-align: center;
  color: #6b7280;
  margin-bottom: 3rem;
  font-size: 1.1rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.demo-section {
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.demo-section h2 {
  margin-top: 0;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.demo-description {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.price-info,
.error-info {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
}

.price-info {
  border-color: #10b981;
  background: #ecfdf5;
}

.error-info {
  border-color: #ef4444;
  background: #fef2f2;
}

.price-info h4,
.error-info h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.price-info p,
.error-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.blocked-dates {
  color: #dc2626 !important;
  font-weight: 500;
}

.booking-info {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
}

.booking-note {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.selection-info {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #a7f3d0;
  margin-top: 2rem;
}

.selection-info h3 {
  margin-top: 0;
  color: #065f46;
  text-align: center;
  font-size: 1.25rem;
}

.selections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.selection-item {
  background: white;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.selection-item h4 {
  margin: 0 0 0.75rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.selection-item p {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.selection-item p strong {
  color: #374151;
}

.feature-badge {
  position: absolute;
  top: -10px;
  left: 10px;
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .demo-container {
    padding: 0 10px;
  }

  .demo-section {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  .selections-grid {
    grid-template-columns: 1fr;
  }
}
</style>