# Vue Hotel Booking Calendar

A beautiful, accessible, and highly customizable Vue 3 calendar component designed specifically for hotel booking systems. Display room availability with three distinct states: available, blocked, and checkout-only. Features intelligent range selection, dynamic pricing, and elegant dark/light themes.

[![npm version](https://badge.fury.io/js/vue-hotel-booking-calendar.svg)](https://www.npmjs.com/package/vue-hotel-booking-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/evion-tech-llp/vue-hotel-booking-calendar?style=social)](https://github.com/evion-tech-llp/vue-hotel-booking-calendar)

## Features

🎨 **Beautiful Design** - Modern, clean interface with elegant light and dark themes  
📱 **Responsive** - Works perfectly on desktop and mobile devices  
♿ **Accessible** - Full keyboard navigation and screen reader support  
🌍 **Internationalization** - Built-in support for multiple locales  
⚡ **TypeScript** - Fully typed for better developer experience  
🎯 **Hotel-Focused** - Three availability states designed for hospitality  
💰 **Dynamic Pricing** - Optional price display with support for varying rates  
🔧 **Customizable** - Extensive props and styling options  
🚫 **Smart Validation** - Prevents selection across blocked dates  
🌙 **Elegant Themes** - Subtle, professional dark mode with off-white text  
📅 **Flexible Data** - Only specify blocked/checkout dates, others auto-available

## Installation

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
- Bundle size: ~9KB gzipped
- Zero dependencies (peer: Vue 3+)

## Quick Start

### Global Registration

```typescript
import { createApp } from 'vue'
import VueHotelBookingCalendar from 'vue-hotel-booking-calendar'
import 'vue-hotel-booking-calendar/dist/style.css'

const app = createApp(App)
app.use(VueHotelBookingCalendar)
```

### Local Registration

```vue
<template>
  <HotelBookingCalendar
    v-model="selection"
    :availability-data="availabilityData"
    :show-prices="true"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HotelBookingCalendar } from 'vue-hotel-booking-calendar'
import type { DateAvailability } from 'vue-hotel-booking-calendar'
import 'vue-hotel-booking-calendar/dist/style.css'

const selection = ref({
  checkIn: null,
  checkOut: null,
})

// Only specify blocked/checkout-only dates - others will be available by default
const availabilityData: DateAvailability[] = [
  { date: '2024-01-16', status: 'checkout-only', price: 89 },
  { date: '2024-01-17', status: 'blocked' },
  { date: '2024-01-22', status: 'blocked' },
  { date: '2024-01-25', status: 'checkout-only', price: 129 },
  // Available dates can optionally include pricing
  { date: '2024-01-20', status: 'available', price: 200 }, // Peak pricing
  // All other dates will automatically be 'available' at base rate
]

const handleSelectionChange = (newSelection) => {
  console.log('Selection changed:', newSelection)
}
</script>
```

## Availability States

The component supports three distinct availability states for hotel booking:

- **Available** (`available`) - Room is available for both check-in and check-out (DEFAULT)
- **Checkout Only** (`checkout-only`) - Only checkout is allowed on this date
- **Blocked** (`blocked`) - Date is completely unavailable

**✨ Smart Defaults:** You only need to provide data for dates that are **blocked** or **checkout-only**. All dates without data will automatically be treated as **available** (green). This makes integration incredibly simple!

**🚫 Intelligent Validation:** The calendar automatically prevents users from selecting date ranges that contain blocked dates, ensuring only valid bookings can be made.

## Props

| Prop               | Type                 | Default                             | Description                        |
| ------------------ | -------------------- | ----------------------------------- | ---------------------------------- |
| `modelValue`       | `Object`             | `{ checkIn: null, checkOut: null }` | Selected date range                |
| `availabilityData` | `DateAvailability[]` | `[]`                                | Array of date availability objects |
| `minDate`          | `string \| Date`     | -                                   | Minimum selectable date            |
| `maxDate`          | `string \| Date`     | -                                   | Maximum selectable date            |
| `locale`           | `string`             | `'en-US'`                           | Locale for date formatting         |
| `disablePastDates` | `boolean`            | `true`                              | Disable dates before today         |
| `showPrices`       | `boolean`            | `false`                             | Show prices on available dates     |
| `allowSingleDay`   | `boolean`            | `false`                             | Allow single day selections        |
| `theme`            | `'light' \| 'dark'`  | `'light'`                           | Visual theme                       |

## Events

| Event               | Payload                                                   | Description                               |
| ------------------- | --------------------------------------------------------- | ----------------------------------------- |
| `update:modelValue` | `{ checkIn?: string \| null, checkOut?: string \| null }` | Emitted when selection changes            |
| `date-click`        | `(date: string, status: AvailabilityStatus)`              | Emitted when a date is clicked            |
| `selection-change`  | `{ checkIn?: string \| null, checkOut?: string \| null }` | Emitted when date range selection changes |

## TypeScript Types

```typescript
export type AvailabilityStatus = 'available' | 'blocked' | 'checkout-only'

export interface DateAvailability {
  date: string // ISO date string (YYYY-MM-DD)
  status: AvailabilityStatus
  price?: number
  minStay?: number
  maxStay?: number
}
```

## Examples

### Basic Usage

```vue
<HotelBookingCalendar v-model="dates" :availability-data="availability" />
```

### With Dynamic Pricing and Dark Theme

```vue
<HotelBookingCalendar
  v-model="dates"
  :availability-data="pricingData"
  :show-prices="true"
  theme="dark"
/>
```

**Note:** Prices automatically adjust based on availability data. Perfect for showing weekend rates, seasonal pricing, or demand-based pricing.

### Custom Date Range

```vue
<HotelBookingCalendar
  v-model="dates"
  :availability-data="blockedDates"
  min-date="2024-01-01"
  max-date="2024-12-31"
  :disable-past-dates="false"
/>
```

### French Locale

```vue
<HotelBookingCalendar v-model="dates" :availability-data="availability" locale="fr-FR" />
```

## Styling

The component features carefully crafted themes optimized for hospitality applications:

**Light Theme:**

- Clean, soft backgrounds with subtle color coding
- Green tints for available dates
- Red tints for blocked dates
- Half-green/half-yellow for checkout-only dates

**Dark Theme:**

- Professional dark backgrounds with off-white text
- Extremely subtle color overlays (8% opacity)
- Elegant borders for status indication
- Easy on the eyes for extended use

### Custom Styling

Override default styles with CSS:

```css
.hotel-booking-calendar {
  --primary-color: #3182ce;
  --border-radius: 8px;
  /* Theme colors automatically calculated */
}

/* Dark theme customization */
.theme-dark .day-cell.available:not(.disabled) {
  background: rgba(your-color, 0.08);
  border-color: rgba(your-color, 0.2);
}
```

### Custom Legend

You can provide a custom legend using the `legend` slot:

```vue
<HotelBookingCalendar v-model="dates" :availability-data="blockedDates">
  <template #legend>
    <div class="my-custom-legend">
      <!-- Your custom legend content -->
    </div>
  </template>
</HotelBookingCalendar>
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/evion/vue-hotel-booking-calendar.git

# Install dependencies
cd vue-hotel-booking-calendar
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build:lib

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Browser Support

- **Chrome** ≥ 87
- **Firefox** ≥ 78
- **Safari** ≥ 14
- **Edge** ≥ 88
- **Mobile browsers** fully supported

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed changelog.

## Links

- 📦 **[npm Package](https://www.npmjs.com/package/vue-hotel-booking-calendar)** - Install and version info
- 📖 **[Documentation](https://github.com/evion-tech-llp/vue-hotel-booking-calendar#readme)** - Full README and examples
- 🐛 **[Issue Tracker](https://github.com/evion-tech-llp/vue-hotel-booking-calendar/issues)** - Bug reports and feature requests
- 💬 **[Discussions](https://github.com/evion-tech-llp/vue-hotel-booking-calendar/discussions)** - Community support

---

Made with ❤️ by [Evion Technologies LLP](https://github.com/evion)
