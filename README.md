# Vue Hotel Booking Calendar

A comprehensive Vue 3 calendar component designed specifically for hotel booking systems. Features intelligent price calculation, booking flow, and error handling with elegant design and accessibility.

[![npm version](https://badge.fury.io/js/vue-hotel-booking-calendar.svg)](https://www.npmjs.com/package/vue-hotel-booking-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/evion-tech-llp/vue-hotel-booking-calendar?style=social)](https://github.com/evion-tech-llp/vue-hotel-booking-calendar)

## 🌟 **Live Demo**

**[View Interactive Demo →](https://evion-tech-llp.github.io/vue-hotel-booking-calendar/)**

## ✨ Features

🎨 **Beautiful Design** - Modern, clean interface with elegant light and dark themes  
💰 **Price Calculation** - Built-in pricing system with multi-currency support  
📊 **Booking Summary** - Compact booking flow with "Book Now" functionality  
⚠️ **Smart Error Handling** - Visual feedback for blocked date selections  
📱 **Responsive Design** - Works perfectly on desktop and mobile devices  
♿ **Accessibility** - Full keyboard navigation and screen reader support  
🌍 **Multi-Currency** - GBP, USD, EUR, JPY with proper locale formatting  
⚡ **TypeScript** - Fully typed for better developer experience  
🎯 **Hotel-Focused** - Three availability states designed for hospitality  
🔧 **Highly Customizable** - Extensive props and styling options  
🚫 **Smart Validation** - Prevents selection across blocked dates with helpful errors  
🌙 **Elegant Themes** - Professional dark mode support  
📅 **Flexible Data** - Only specify blocked/checkout dates, others auto-available

## 🆕 What's New in v1.0.2

- ✅ **Price Calculation System** - Real-time pricing with daily breakdowns
- ✅ **Compact Booking Summary** - Space-efficient booking flow
- ✅ **Book Now Integration** - Complete booking workflow with events
- ✅ **Enhanced Error Handling** - Visual feedback for selection issues
- ✅ **Multi-Currency Support** - GBP default with USD, EUR, JPY support
- ✅ **Improved UX** - Better visual hierarchy and user feedback
- ✅ **Dynamic Demo** - Always-current dates that never become outdated

## 📦 Installation

[![npm package](https://img.shields.io/npm/v/vue-hotel-booking-calendar?color=brightgreen&label=npm%20package)](https://www.npmjs.com/package/vue-hotel-booking-calendar)

```bash
npm install vue-hotel-booking-calendar
```

or with yarn:

```bash
yarn add vue-hotel-booking-calendar
```

**📦 Package Info:**

- [View on npm](https://www.npmjs.com/package/vue-hotel-booking-calendar)
- Bundle size: ~12KB gzipped
- Zero dependencies (peer: Vue 3+)

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
import { HotelBookingCalendar } from 'vue-hotel-booking-calendar'
import 'vue-hotel-booking-calendar/dist/style.css'

const selectedDates = ref({ checkIn: null, checkOut: null })
</script>

<template>
  <HotelBookingCalendar
    v-model="selectedDates"
    :show-price-calculation="true"
    currency="GBP"
    :base-price="85"
    @book-now="handleBooking"
  />
</template>
```

## 💰 Price Calculation & Booking Flow

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

## 🌍 Multi-Currency Support

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

## 🛠 Props

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
| `minDate`              | `String/Date` | `null`                              | Minimum selectable date             |
| `maxDate`              | `String/Date` | `null`                              | Maximum selectable date             |

## 📡 Events

| Event               | Payload                      | Description                 |
| ------------------- | ---------------------------- | --------------------------- |
| `update:modelValue` | `{ checkIn, checkOut }`      | Date selection changed      |
| `selection-change`  | `{ checkIn, checkOut }`      | Alternative selection event |
| `date-click`        | `(date, status)`             | Individual date clicked     |
| `price-calculation` | `PriceCalculation`           | Price calculation updated   |
| `selection-error`   | `SelectionError`             | Selection validation error  |
| `book-now`          | `{ selection, calculation }` | Book Now button clicked     |

## 🎯 TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  DateAvailability,
  PriceCalculation,
  SelectionError,
  CalendarProps,
  CalendarEmits,
} from 'vue-hotel-booking-calendar'
```

## 🎨 Custom Styling

Override CSS custom properties:

```css
.hotel-booking-calendar {
  --calendar-border-radius: 12px;
  --calendar-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --available-color: #10b981;
  --blocked-color: #ef4444;
  --checkout-color: #f59e0b;
}
```

## ♿ Accessibility

- Full keyboard navigation
- Screen reader support
- ARIA labels and descriptions
- High contrast support
- Focus management

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏢 About Evion Technologies

Built with ❤️ by [Evion Technologies LLP](https://evion.tech) - Specialists in Vue.js and TypeScript development.

---

⭐ **Star us on GitHub** if this component helps your project!
