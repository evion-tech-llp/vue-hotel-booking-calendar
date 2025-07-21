# Vue Hotel Booking Calendar

A beautiful, accessible, and highly customizable Vue 3 calendar component designed specifically for hotel booking systems. Display room availability with three distinct states: available, blocked, and checkout-only.

[![npm version](https://badge.fury.io/js/vue-hotel-booking-calendar.svg)](https://badge.fury.io/js/vue-hotel-booking-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

🎨 **Beautiful Design** - Modern, clean interface with light and dark themes  
📱 **Responsive** - Works perfectly on desktop and mobile devices  
♿ **Accessible** - Full keyboard navigation and screen reader support  
🌍 **Internationalization** - Built-in support for multiple locales  
⚡ **TypeScript** - Fully typed for better developer experience  
🎯 **Hotel-Focused** - Three availability states designed for hospitality  
💰 **Price Display** - Optional price display for each available date  
🔧 **Customizable** - Extensive props and styling options  

## Installation

```bash
npm install vue-hotel-booking-calendar
```

or with yarn:

```bash
yarn add vue-hotel-booking-calendar
```

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
  checkOut: null
})

const availabilityData: DateAvailability[] = [
  { date: '2024-01-15', status: 'available', price: 120 },
  { date: '2024-01-16', status: 'checkout-only', price: 120 },
  { date: '2024-01-17', status: 'blocked' },
  // ... more dates
]

const handleSelectionChange = (newSelection) => {
  console.log('Selection changed:', newSelection)
}
</script>
```

## Availability States

The component supports three distinct availability states for hotel booking:

- **Available** (`available`) - Room is available for both check-in and check-out
- **Checkout Only** (`checkout-only`) - Only checkout is allowed on this date
- **Blocked** (`blocked`) - Date is completely unavailable

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Object` | `{ checkIn: null, checkOut: null }` | Selected date range |
| `availabilityData` | `DateAvailability[]` | `[]` | Array of date availability objects |
| `minDate` | `string \| Date` | - | Minimum selectable date |
| `maxDate` | `string \| Date` | - | Maximum selectable date |
| `locale` | `string` | `'en-US'` | Locale for date formatting |
| `disablePastDates` | `boolean` | `true` | Disable dates before today |
| `showPrices` | `boolean` | `false` | Show prices on available dates |
| `allowSingleDay` | `boolean` | `false` | Allow single day selections |
| `theme` | `'light' \| 'dark'` | `'light'` | Visual theme |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `{ checkIn?: string \| null, checkOut?: string \| null }` | Emitted when selection changes |
| `date-click` | `(date: string, status: AvailabilityStatus)` | Emitted when a date is clicked |
| `selection-change` | `{ checkIn?: string \| null, checkOut?: string \| null }` | Emitted when date range selection changes |

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
<HotelBookingCalendar
  v-model="dates"
  :availability-data="availability"
/>
```

### With Prices and Dark Theme

```vue
<HotelBookingCalendar
  v-model="dates"
  :availability-data="availability"
  :show-prices="true"
  theme="dark"
/>
```

### Custom Date Range

```vue
<HotelBookingCalendar
  v-model="dates"
  :availability-data="availability"
  min-date="2024-01-01"
  max-date="2024-12-31"
  :disable-past-dates="false"
/>
```

### French Locale

```vue
<HotelBookingCalendar
  v-model="dates"
  :availability-data="availability"
  locale="fr-FR"
/>
```

## Styling

The component uses CSS custom properties for theming. You can override these in your CSS:

```css
.hotel-booking-calendar {
  --primary-color: #3182ce;
  --available-color: #48bb78;
  --checkout-color: #ed8936;
  --blocked-color: #e53e3e;
  --border-radius: 8px;
}
```

### Custom Legend

You can provide a custom legend using the `legend` slot:

```vue
<HotelBookingCalendar v-model="dates" :availability-data="availability">
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

- Chrome ≥ 87
- Firefox ≥ 78
- Safari ≥ 14
- Edge ≥ 88

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

## Support

- 📖 [Documentation](https://github.com/evion/vue-hotel-booking-calendar#readme)
- 🐛 [Issue Tracker](https://github.com/evion/vue-hotel-booking-calendar/issues)
- 💬 [Discussions](https://github.com/evion/vue-hotel-booking-calendar/discussions)

---

Made with ❤️ by [Evion Technologies LLP](https://github.com/evion) 