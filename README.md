# Vue Hotel Booking Calendar

A comprehensive Vue 3 calendar component suite designed specifically for hotel booking systems. Features both guest booking calendar and hotel owner dashboard with intelligent price calculation, booking flow, and elegant design.

[![npm version](https://badge.fury.io/js/vue-hotel-booking-calendar.svg)](https://badge.fury.io/js/vue-hotel-booking-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/evion-tech-llp/vue-hotel-booking-calendar?style=social)](https://github.com/evion-tech-llp/vue-hotel-booking-calendar)

## 🌟 **Live Demo**

**[View Interactive Demo →](https://evion-tech-llp.github.io/vue-hotel-booking-calendar/)**

## ✨ Features

### 🏷️ **Guest Booking Calendar**

💰 **Price Calculation** - Built-in pricing system with multi-currency support  
📊 **Booking Summary** - Compact booking flow with "Book Now" functionality  
⚠️ **Smart Error Handling** - Visual feedback for blocked date selections  
🌍 **Multi-Currency** - GBP, USD, EUR, JPY with proper locale formatting  
🚫 **Smart Validation** - Prevents selection across blocked dates with helpful errors

### 🏨 **Hotel Dashboard Calendar**

📅 **Room-wise Grid** - Horizontal calendar showing all rooms and bookings  
🎯 **Custom Statuses** - Define your own booking statuses with colors  
👥 **Guest Management** - View guest initials with full names on hover  
📱 **No Horizontal Scroll** - All dates fit perfectly on any screen size  
🔗 **Event-Driven** - Emits events for parent component to handle bookings  
💅 **Elegant Design** - Clean white aesthetic with subtle shadows

### 🎨 **Shared Features**

🎨 **Beautiful Design** - Modern, clean interface with elegant white theme  
📱 **Responsive Design** - Works perfectly on desktop and mobile devices  
♿ **Accessibility** - Full keyboard navigation and screen reader support  
⚡ **TypeScript** - Fully typed for better developer experience  
🌙 **Theme Support** - Professional light and dark themes  
🌍 **Custom Text Labels** - Full internationalization and custom terminology support  
📅 **Flexible Navigation** - Optional previous month navigation for historical data  
🔧 **Highly Customizable** - Extensive props and styling options

## 🆕 What's New in v1.0.10

- ✅ **iOS Safari Support** - Full compatibility with iOS Safari and mobile browsers
- ✅ **Enhanced Mobile Layout** - Fixed mobile view layout and booking span alignment
- ✅ **Touch Optimization** - Improved touch handling and scrolling behavior
- ✅ **Grid Compatibility** - Better grid layout support across all browsers
- ✅ **Visual Consistency** - Consistent styling and behavior on all platforms
- ✅ **Performance Improvements** - Optimized rendering and touch interactions

## 📱 Mobile Responsiveness

Both components are now even more mobile-friendly with specific optimizations:

### Guest Calendar Mobile Features:
- Simplified arrow-only navigation buttons on mobile
- Optimized touch targets for better interaction
- Improved date selection on touch devices
- Clean, uncluttered mobile interface

### Dashboard Calendar Mobile Features:
- Vertical stack layout for room calendars on mobile
- Each room gets full-width calendar view
- Better handling of booking spans across weeks
- Enhanced visual separation between rooms
- Optimized for touch interaction
- Proper grid alignment on all screen sizes

```vue
<template>
  <!-- Mobile-optimized dashboard -->
  <HotelDashboardCalendar
    :rooms="rooms"
    :bookings="bookings"
    :text-labels="{
      previousMonth: '←',  // Simplified mobile navigation
      nextMonth: '→'
    }"
  />
</template>
```

## 📦 Installation

[![npm package](https://img.shields.io/npm/v/vue-hotel-booking-calendar?color=brightgreen&label=npm%20package)](https://www.npmjs.com/package/vue-hotel-booking-calendar)

```bash
npm install vue-hotel-booking-calendar@latest
```

or with yarn:

```bash
yarn add vue-hotel-booking-calendar@latest
```

**📦 Package Info:**

- [View on npm](https://www.npmjs.com/package/vue-hotel-booking-calendar)
- Bundle size: ~16KB gzipped (both components with new features)
- Zero dependencies (peer: Vue 3+)
- Full TypeScript support with enhanced interfaces

## 🚀 Quick Start

### Global Registration

```typescript
import { createApp } from 'vue'
import VueHotelBookingCalendar from 'vue-hotel-booking-calendar'
import 'vue-hotel-booking-calendar/dist/style.css'

const app = createApp(App)
app.use(VueHotelBookingCalendar)
app.mount('#app')
```

### Component Registration

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { HotelBookingCalendar, HotelDashboardCalendar } from 'vue-hotel-booking-calendar'
import 'vue-hotel-booking-calendar/dist/style.css'

const guestDates = ref({ checkIn: null, checkOut: null })
const dashboardMonth = ref(new Date())
</script>

<template>
  <!-- Guest Booking Calendar -->
  <HotelBookingCalendar
    v-model="guestDates"
    :show-price-calculation="true"
    currency="GBP"
    :base-price="85"
    :allow-previous-month-navigation="true"
    :text-labels="{
      bookNow: 'Reserve Now',
      available: 'Open',
      previousMonth: '← Back'
    }"
    @book-now="handleBooking"
  />

  <!-- Hotel Dashboard Calendar -->
  <HotelDashboardCalendar
    :rooms="hotelRooms"
    :bookings="hotelBookings"
    :selected-month="dashboardMonth"
    :allow-previous-month-navigation="true"
    :text-labels="{
      room: 'Room',
      available: 'Free',
      previousMonth: '← Previous'
    }"
    @booking-click="showBookingDetails"
    @booking-create="showCreateForm"
  />
</template>
```

## 🏨 Hotel Dashboard Calendar

Perfect for hotel owners and staff to manage bookings across all rooms:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { HotelDashboardCalendar } from 'vue-hotel-booking-calendar'
import type { Room, Booking, StatusConfig } from 'vue-hotel-booking-calendar'

const rooms = ref<Room[]>([
  { id: '1', number: '101' },
  { id: '2', number: '102' },
  { id: '3', number: '201' },
])

const bookings = ref<Booking[]>([
  {
    id: '1',
    guestName: 'John Smith',
    roomNumber: '101',
    checkIn: '2025-01-15',
    checkOut: '2025-01-18',
    status: 'confirmed',
  },
])

const customStatuses = ref<StatusConfig[]>([
  {
    key: 'confirmed',
    label: 'Confirmed',
    color: '#155e75',
    backgroundColor: '#a7f3d0',
  },
  {
    key: 'pending',
    label: 'Pending Review',
    color: '#b45309',
    backgroundColor: '#fed7aa',
  },
])

const handleBookingClick = (booking: Booking) => {
  // Show booking details modal
  console.log('Booking clicked:', booking)
}

const handleBookingCreate = (data: { roomId: string; date: string }) => {
  // Show create booking form
  console.log('Create booking:', data)
}
</script>

<template>
  <HotelDashboardCalendar
    :rooms="rooms"
    :bookings="bookings"
    :status-config="customStatuses"
    :allow-previous-month-navigation="true"
    :text-labels="{
      room: 'Room',
      available: 'Free',
      previousMonth: '← Previous',
      nextMonth: 'Next →'
    }"
    theme="light"
    @booking-click="handleBookingClick"
    @booking-create="handleBookingCreate"
  />
</template>
```

## 💰 Guest Booking Calendar

Enhanced booking experience for guests:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { HotelBookingCalendar } from 'vue-hotel-booking-calendar'

const selectedDates = ref({ checkIn: null, checkOut: null })

const availabilityData = [
  { date: '2025-01-15', status: 'available', price: 120 },
  { date: '2025-01-16', status: 'available', price: 150 }, // Weekend rate
  { date: '2025-01-17', status: 'blocked' },
  { date: '2025-01-18', status: 'checkout-only', price: 95 },
]

const handleBooking = (booking) => {
  console.log('Booking Details:', booking)
  // booking.selection = { checkIn: '2025-01-15', checkOut: '2025-01-16' }
  // booking.calculation = { nights: 1, totalPrice: 120, currency: 'GBP', ... }

  // Redirect to payment or send to booking API
  window.location.href = `/checkout?total=${booking.calculation.totalPrice}`
}
</script>

<template>
  <HotelBookingCalendar
    v-model="selectedDates"
    :availability-data="availabilityData"
    :show-price-calculation="true"
    :show-selection-errors="true"
    :allow-previous-month-navigation="true"
    :text-labels="{
      bookingSummary: 'Your Stay',
      bookNow: 'Book This Stay',
      available: 'Open',
      blocked: 'Not Available'
    }"
    currency="GBP"
    :base-price="85"
    @book-now="handleBooking"
  />
</template>
```

## ⚠️ Error Handling

The component intelligently handles selection errors:

```vue
<script setup lang="ts">
const handleSelectionError = (error) => {
  console.log('Selection Error:', error.message)
  console.log('Blocked Dates:', error.blockedDates)
  // Show custom error message or handle as needed
}
</script>

<template>
  <HotelBookingCalendar
    v-model="selectedDates"
    :availability-data="availabilityData"
    :show-selection-errors="true"
    @selection-error="handleSelectionError"
  />
</template>
```

## 🌍 Multi-Currency & Internationalization

### Currency Support

```vue
<template>
  <!-- British Pounds (Default) -->
  <HotelBookingCalendar v-model="selectedDates" currency="GBP" locale="en-GB" :base-price="85" />

  <!-- US Dollars -->
  <HotelBookingCalendar v-model="selectedDates" currency="USD" locale="en-US" :base-price="120" />

  <!-- Japanese Yen -->
  <HotelBookingCalendar v-model="selectedDates" currency="JPY" locale="ja-JP" :base-price="12000" />
</template>
```

### Custom Text Labels

Perfect for internationalization or simplified user interfaces:

```vue
<template>
  <!-- Spanish Labels -->
  <HotelBookingCalendar
    v-model="selectedDates"
    :text-labels="{
      previousMonth: '← Anterior',
      nextMonth: 'Siguiente →',
      bookingSummary: 'Tu Reserva',
      bookNow: 'Reservar Ahora',
      available: 'Disponible',
      blocked: 'No Disponible'
    }"
  />

  <!-- Simplified English -->
  <HotelBookingCalendar
    v-model="selectedDates"
    :text-labels="{
      previousMonth: '← Back',
      nextMonth: 'Forward →',
      bookingSummary: 'Your Stay',
      bookNow: 'Book This Stay',
      available: 'Open',
      blocked: 'Not Available'
    }"
  />

  <!-- Dashboard Custom Labels -->
  <HotelDashboardCalendar
    :rooms="rooms"
    :bookings="bookings"
    :text-labels="{
      room: 'Suite',
      available: 'Free',
      createBooking: 'Add Booking',
      clickForDetails: 'View Details'
    }"
  />
</template>
```

## 📅 Enhanced Navigation Control

Control how users can navigate through months with the new `allowPreviousMonthNavigation` prop:

```vue
<template>
  <!-- Default: Only future months (respects disablePastDates) -->
  <HotelBookingCalendar
    v-model="selectedDates"
    :disable-past-dates="true"
    :allow-previous-month-navigation="false"
  />

  <!-- Allow viewing historical data while keeping booking restrictions -->
  <HotelBookingCalendar
    v-model="selectedDates"
    :disable-past-dates="true"
    :allow-previous-month-navigation="true"
  />

  <!-- Dashboard with historical booking data access -->
  <HotelDashboardCalendar
    :rooms="rooms"
    :bookings="bookings"
    :allow-previous-month-navigation="true"
  />
</template>
```

**Use Cases:**
- **Hotels**: View historical bookings while preventing past date selections
- **Analytics**: Access booking history for reporting
- **Flexibility**: Different rules for navigation vs. selection

## 🎨 Theming

```vue
<template>
  <!-- Light Theme (Default) -->
  <HotelBookingCalendar theme="light" />

  <!-- Dark Theme -->
  <HotelBookingCalendar theme="dark" />
</template>
```

## 📅 Availability States

The calendar supports three distinct availability states:

- **Available** (Green) - Bookable dates
- **Blocked** (Red) - Unavailable dates
- **Checkout-only** (Half Green/Orange) - Check-out only dates

```typescript
const availabilityData = [
  { date: '2025-01-15', status: 'available', price: 120 },
  { date: '2025-01-16', status: 'blocked' }, // Fully booked
  { date: '2025-01-17', status: 'checkout-only', price: 95 },
]
```

## 🛠 Component Props

### 🏷️ HotelBookingCalendar (Guest Calendar)

| Prop                   | Type          | Default                             | Description                         |
| ---------------------- | ------------- | ----------------------------------- | ----------------------------------- |
| `modelValue`           | `Object`      | `{ checkIn: null, checkOut: null }` | Selected dates                      |
| `availabilityData`     | `Array`       | `[]`                                | Availability and pricing data       |
| `basePrice`            | `Number`      | `85`                                | Default price per night (GBP)       |
| `currency`             | `String`      | `'GBP'`                             | Currency code (GBP, USD, EUR, JPY)  |
| `locale`               | `String`      | `'en-GB'`                           | Locale for date/currency formatting |
| `theme`                | `String`      | `'light'`                           | Theme ('light' or 'dark')           |
| `showPrices`           | `Boolean`     | `false`                             | Show prices on calendar dates       |
| `showPriceCalculation` | `Boolean`     | `true`                              | Show booking summary                |
| `showSelectionErrors`  | `Boolean`     | `true`                              | Show error messages                 |
| `disablePastDates`     | `Boolean`     | `true`                              | Disable past dates                  |
| `allowSingleDay`       | `Boolean`     | `false`                             | Allow same-day check-in/out         |
| `allowPreviousMonthNavigation` | `Boolean` | `false`                         | Allow navigation to previous months |
| `textLabels`           | `Object`      | `{}`                                | Custom text labels for UI elements  |
| `minDate`              | `String/Date` | `null`                              | Minimum selectable date             |
| `maxDate`              | `String/Date` | `null`                              | Maximum selectable date             |

### 🏨 HotelDashboardCalendar (Hotel Management)

| Prop            | Type     | Default           | Description                  |
| --------------- | -------- | ----------------- | ---------------------------- |
| `rooms`         | `Array`  | `[]`              | Array of room objects        |
| `bookings`      | `Array`  | `[]`              | Array of booking objects     |
| `selectedMonth` | `Date`   | `new Date()`      | Currently displayed month    |
| `theme`         | `String` | `'light'`         | Theme ('light' or 'dark')    |
| `statusConfig`  | `Array`  | `defaultStatuses` | Custom status configurations |
| `allowPreviousMonthNavigation` | `Boolean` | `false` | Allow navigation to previous months |
| `textLabels`    | `Object` | `{}`              | Custom text labels for UI elements |

## 📡 Component Events

### 🏷️ HotelBookingCalendar Events

| Event               | Payload                      | Description                 |
| ------------------- | ---------------------------- | --------------------------- |
| `update:modelValue` | `{ checkIn, checkOut }`      | Date selection changed      |
| `selection-change`  | `{ checkIn, checkOut }`      | Alternative selection event |
| `date-click`        | `(date, status)`             | Individual date clicked     |
| `price-calculation` | `PriceCalculation`           | Price calculation updated   |
| `selection-error`   | `SelectionError`             | Selection validation error  |
| `book-now`          | `{ selection, calculation }` | Book Now button clicked     |

### 🏨 HotelDashboardCalendar Events

| Event                  | Payload            | Description              |
| ---------------------- | ------------------ | ------------------------ |
| `update:selectedMonth` | `Date`             | Month navigation changed |
| `booking-click`        | `Booking`          | Existing booking clicked |
| `booking-create`       | `{ roomId, date }` | Empty cell clicked       |

## 🎯 TypeScript Support

Full TypeScript definitions included for both components:

```typescript
// Guest Calendar Types
import type {
  DateAvailability,
  PriceCalculation,
  SelectionError,
  CalendarProps,
  CalendarEmits,
  CalendarTextLabels,
} from 'vue-hotel-booking-calendar'

// Hotel Dashboard Types
import type {
  Room,
  Booking,
  StatusConfig,
  DashboardCalendarProps,
  DashboardCalendarEmits,
  DashboardTextLabels,
} from 'vue-hotel-booking-calendar'

// Text Label Interfaces
interface CalendarTextLabels {
  previousMonth?: string
  nextMonth?: string
  bookingSummary?: string
  nights?: string
  night?: string
  priceBreakdown?: string
  total?: string
  bookNow?: string
  available?: string
  checkoutOnly?: string
  blocked?: string
  clearSelection?: string
  dismissError?: string
}

interface DashboardTextLabels {
  previousMonth?: string
  nextMonth?: string
  room?: string
  available?: string
  createBooking?: string
  clickForDetails?: string
}
```

## 🏨 Hotel Dashboard Data Models

```typescript
interface Room {
  id: string // Unique room identifier
  number: string // Room number/name (e.g., "101", "Presidential Suite")
}

interface Booking {
  id: string // Unique booking identifier
  guestName: string // Full guest name
  roomNumber: string // Room number (must match Room.number)
  checkIn: string // ISO date string (YYYY-MM-DD)
  checkOut: string // ISO date string (YYYY-MM-DD)
  status: string // Status key (matches StatusConfig.key)
}

interface StatusConfig {
  key: string // Status identifier
  label: string // Display label
  color: string // Text color
  backgroundColor: string // Cell background color
  darkBackgroundColor?: string // Optional dark theme background
}
```

## 🎨 Custom Styling

Override CSS custom properties:

```css
/* Guest Calendar Styling */
.hotel-booking-calendar {
  --calendar-border-radius: 12px;
  --calendar-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --available-color: #10b981;
  --blocked-color: #ef4444;
  --checkout-color: #f59e0b;
}

/* Dashboard Calendar Styling */
.hotel-dashboard-calendar {
  --dashboard-border-radius: 12px;
  --dashboard-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --room-header-background: white;
  --date-header-background: white;
  --cell-border-color: #f1f3f4;
}
```

## ♿ Accessibility

Both components include comprehensive accessibility features:

- Full keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- High contrast support
- Focus management
- Semantic HTML structure

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+ (including iOS Safari)
- Mobile browsers

### iOS Safari Support
The calendar is fully optimized for iOS Safari with:
- Proper grid layout support with vendor prefixes
- Enhanced touch handling and scrolling
- Consistent visual appearance
- Optimized mobile interactions
- Smooth booking span behavior

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About Evion Technologies

Built with ❤️ by [Evion Technologies LLP](https://eviontech.com) - Specialists in Vue.js and TypeScript development.

---

⭐ **Star us on GitHub** if this component helps your project!
