<template>
  <div id="app">
    <div class="demo-container">
      <h1>Vue Hotel Booking Calendar Demo</h1>
      
      <div class="demo-section">
        <h2>Basic Usage</h2>
        <HotelBookingCalendar
          v-model="selection"
          :availability-data="sampleAvailability"
          :show-prices="true"
          @date-click="onDateClick"
          @selection-change="onSelectionChange"
        />
      </div>

      <div class="demo-section">
        <h2>Dark Theme</h2>
        <HotelBookingCalendar
          v-model="selection2"
          :availability-data="sampleAvailability"
          theme="dark"
          :show-prices="true"
        />
      </div>

      <div class="selection-info">
        <h3>Current Selection:</h3>
        <p><strong>Check-in:</strong> {{ selection.checkIn || 'Not selected' }}</p>
        <p><strong>Check-out:</strong> {{ selection.checkOut || 'Not selected' }}</p>
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

// Sample availability data for demonstration
const sampleAvailability: DateAvailability[] = [
  { date: '2024-01-15', status: 'available', price: 120 },
  { date: '2024-01-16', status: 'available', price: 120 },
  { date: '2024-01-17', status: 'checkout-only', price: 120 },
  { date: '2024-01-18', status: 'available', price: 150 },
  { date: '2024-01-19', status: 'blocked' },
  { date: '2024-01-20', status: 'blocked' },
  { date: '2024-01-21', status: 'available', price: 200 },
  { date: '2024-01-22', status: 'available', price: 200 },
  { date: '2024-01-23', status: 'checkout-only', price: 180 },
  { date: '2024-01-24', status: 'available', price: 120 },
  { date: '2024-01-25', status: 'available', price: 120 },
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
</style> 