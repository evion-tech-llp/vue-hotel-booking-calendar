# Vue Hotel Booking Calendar v1.0.0 🎉

We're excited to announce the initial release of Vue Hotel Booking Calendar - a professional-grade calendar component designed specifically for hospitality applications.

## 🌟 What Makes This Special

**🏨 Built for Hotels**: Unlike generic calendar components, this is purpose-built for hotel booking systems with three key availability states and intelligent validation.

**🧠 Smart by Default**: Simply specify blocked and checkout-only dates. Everything else automatically becomes available - no need to define every single date.

**🚫 Prevents Invalid Bookings**: Automatically prevents users from selecting ranges that span blocked dates, ensuring only valid reservations.

**🎨 Elegant Themes**: Beautiful light theme and ultra-subtle dark theme with off-white text and whisper-soft color hints.

## 🚀 Key Features

### Availability Management

- **Available** (green) - Ready for booking
- **Blocked** (red) - Unavailable dates
- **Checkout-only** (half green/yellow) - Only checkout allowed

### Smart Validation

```typescript
// This selection would automatically reset if July 16 is blocked
checkIn: '2024-07-15' // Available ✅
// July 16: blocked ❌
checkOut: '2024-07-17' // Available ✅
// Range invalid due to blocked date in between
```

### Dynamic Pricing

```typescript
const availability = [
  { date: '2024-07-20', status: 'available', price: 200 }, // Peak weekend
  { date: '2024-07-15', status: 'checkout-only', price: 89 }, // Reduced rate
  { date: '2024-07-16', status: 'blocked' }, // No price needed
]
```

### Professional Themes

- **Light**: Clean, soft backgrounds with subtle color coding
- **Dark**: Professional dark theme with 8% color overlays and off-white text

## 📦 Installation

```bash
npm install vue-hotel-booking-calendar
```

## 🎯 Perfect For

- Hotel booking systems
- Vacation rental platforms
- Property management systems
- Any hospitality application needing availability calendars

## 💻 Framework Support

- **Vue 3** with Composition API
- **TypeScript** first-class support
- **ES Modules** + UMD builds
- **Mobile responsive** out of the box

## 🔗 Links

- [Documentation & Examples](https://github.com/evion/vue-hotel-booking-calendar#readme)
- [npm Package](https://www.npmjs.com/package/vue-hotel-booking-calendar)
- [GitHub Repository](https://github.com/evion/vue-hotel-booking-calendar)

---

**Ready to upgrade your booking experience?** This component brings professional-grade calendar functionality to your Vue 3 application with minimal setup and maximum flexibility.

Happy coding! 🏨✨
