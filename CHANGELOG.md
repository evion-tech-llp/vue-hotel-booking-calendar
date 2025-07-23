# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2025-01-23

### 🔧 Build & Package Configuration Fixes

**🐛 Package Resolution:**

- ✅ **Fixed package entry resolution error** - Updated module exports to match actual generated files
- ✅ **Resolved CJS build deprecation warning** - Added `"type": "module"` for modern ES module support
- ✅ **Updated file extensions** - Aligned package.json entries with Vite's ES module output (.js for ESM, .umd.cjs for CommonJS)
- ✅ **Enhanced build configuration** - Added `exports: 'named'` to eliminate mixed export warnings

**📦 Improved Package Structure:**

- ✅ **Modern ES module configuration** - Full ES module support for better tree-shaking and compatibility
- ✅ **Proper CommonJS fallback** - Maintained backward compatibility with `.umd.cjs` files
- ✅ **Clean build output** - No more deprecation warnings or configuration mismatches

## [1.0.3] - 2025-01-13

### 🏨 Hotel Dashboard Component Release

**🆕 Major New Component:**

### 🎯 HotelDashboardCalendar Component

- ✅ **Horizontal grid layout** - Dates as columns, rooms as rows for optimal space usage
- ✅ **Room-wise booking management** - Visual grid showing all bookings per room
- ✅ **Responsive without horizontal scroll** - All dates fit on screen with flexible columns
- ✅ **Guest information display** - Guest initials in booking cells with full names on hover
- ✅ **Custom status configuration** - Define your own booking statuses, colors, and labels
- ✅ **Click-to-interact design** - Emit events to parent for booking management
- ✅ **Tooltip system** - Hover for detailed booking information
- ✅ **Month navigation** - Easy navigation between months
- ✅ **Today highlighting** - Clear visual indicator for current date
- ✅ **Weekend styling** - Subtle visual differentiation for weekends

### 🎨 Elegant White Design System

- ✅ **Pure white backgrounds** - Clean, professional aesthetic throughout
- ✅ **Subtle shadows and borders** - Elegant depth without heaviness
- ✅ **Refined typography** - Better font weights and letter spacing
- ✅ **Smooth interactions** - Gentle hover effects and transitions
- ✅ **Professional color palette** - Sophisticated gray tones for better readability
- ✅ **Enhanced spacing** - More breathing room for better visual hierarchy

### 🏗️ Component Architecture

- ✅ **Dual component system** - Guest calendar + Hotel dashboard in one package
- ✅ **Event-driven design** - Dashboard emits events, parent handles complex logic
- ✅ **Simplified data models** - Minimal interfaces for better performance
- ✅ **Optimized props** - Removed unused properties for cleaner API
- ✅ **TypeScript enhanced** - Complete type definitions for both components

### 📊 Hotel Dashboard Features

**🎯 Core Functionality:**

- **Booking visualization** - See all bookings across rooms and dates at a glance
- **Status management** - Custom status colors and labels via props
- **Interactive cells** - Click empty cells to create, click bookings for details
- **Mobile responsive** - Optimized layout for all screen sizes
- **Theme support** - Light and dark themes with elegant styling

**📅 Data Structure:**

```typescript
interface Room {
  id: string
  number: string
}

interface Booking {
  id: string
  guestName: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: string
}

interface StatusConfig {
  key: string
  label: string
  color: string
  backgroundColor: string
  darkBackgroundColor?: string
}
```

**📡 Events:**

- `booking-click`: Emitted when clicking existing booking
- `booking-create`: Emitted when clicking empty cell
- `update:selectedMonth`: Month navigation changes

### 🎨 Design Improvements

**🤍 Visual Refinements:**

- Updated demo page with clean white aesthetic
- Improved component styling with subtle borders
- Enhanced user experience with smooth transitions
- Better visual hierarchy throughout
- Professional typography improvements

**✨ User Experience:**

- Cleaner interface reduces visual noise
- Better contrast for improved readability
- More intuitive interaction patterns
- Elegant hover states and animations

### 🔧 Technical Improvements

**📦 Package Updates:**

- Added HotelDashboardCalendar to main exports
- Enhanced TypeScript definitions for dashboard component
- Updated documentation with comprehensive examples
- Improved tree-shaking support

**⚡ Performance:**

- Optimized rendering for large room/booking datasets
- Better memory management in dashboard component
- Streamlined prop interfaces for faster updates

### 📚 Documentation

- ✅ Complete hotel dashboard component documentation
- ✅ Interactive demo showcasing both components
- ✅ TypeScript usage examples for dashboard
- ✅ Custom status configuration examples
- ✅ Integration patterns for hotel management systems

**🎯 Usage Example:**

```vue
<template>
  <!-- Guest Booking Calendar -->
  <HotelBookingCalendar
    v-model="guestSelection"
    :show-price-calculation="true"
    @book-now="handleGuestBooking"
  />

  <!-- Hotel Dashboard Calendar -->
  <HotelDashboardCalendar
    :rooms="hotelRooms"
    :bookings="hotelBookings"
    :status-config="customStatuses"
    @booking-click="showBookingDetails"
    @booking-create="showCreateForm"
  />
</template>
```

### 🛠️ Migration Guide

**✅ Fully Backward Compatible** - No breaking changes!

- All existing HotelBookingCalendar functionality unchanged
- New HotelDashboardCalendar is completely separate
- Enhanced styling improves visual appeal without breaking existing styles

---

## [1.0.2] - 2025-01-13

### 🎉 Feature Enhancement Release

**🆕 New Features:**

### 💰 Price Calculation System

- ✅ Real-time price calculation with daily breakdowns
- ✅ Multi-currency support (GBP, USD, EUR, JPY) with proper formatting
- ✅ Configurable base price with individual date pricing override
- ✅ Average price per night calculation
- ✅ Price display on calendar dates (optional)

### 📊 Compact Booking Summary

- ✅ Space-efficient booking summary with expand/collapse details
- ✅ Night count and date range display
- ✅ Daily price breakdown (collapsible)
- ✅ Total price calculation with prominent display
- ✅ Clear selection functionality

### 🎯 Complete Booking Flow

- ✅ "Book Now" button with full booking data emit
- ✅ Booking event includes selection dates and price calculation
- ✅ Ready for integration with payment systems
- ✅ Disabled state handling for incomplete selections

### ⚠️ Enhanced Error Handling

- ✅ Visual error messages for blocked date selections
- ✅ Specific blocked dates highlighted with animation
- ✅ Dismissible error notifications
- ✅ Smart selection reset (starts new range instead of clearing)
- ✅ Error type categorization for custom handling

### 🌍 Internationalization Improvements

- ✅ GBP set as default currency (more suitable for hospitality)
- ✅ British locale (en-GB) as default
- ✅ Proper currency symbol placement and formatting
- ✅ Multi-locale date formatting support

### 🎨 UX/UI Enhancements

- ✅ Improved visual hierarchy and spacing
- ✅ Better error state styling with animations
- ✅ Enhanced dark theme support for new components
- ✅ More compact design suitable for booking flows
- ✅ Accessible error handling with ARIA labels

### 🔧 Developer Experience

- ✅ Enhanced TypeScript definitions for new features
- ✅ Additional emit events for price calculation and booking
- ✅ Comprehensive documentation with examples
- ✅ Dynamic demo with always-current dates

**🛠️ Technical Improvements:**

### 📝 Updated Props

- `basePrice`: Default price per night (default: 85 GBP)
- `currency`: Currency code with proper formatting (default: 'GBP')
- `showPriceCalculation`: Toggle booking summary display (default: true)
- `showSelectionErrors`: Toggle error message display (default: true)

### 📡 New Events

- `price-calculation`: Emitted with price calculation details
- `selection-error`: Emitted when selection validation fails
- `book-now`: Emitted with complete booking data

### 🎯 Enhanced Types

- `PriceCalculation`: Complete pricing breakdown interface
- `SelectionError`: Detailed error information with blocked dates
- `CalendarEmits`: Updated with new event signatures

**📚 Documentation:**

- ✅ Comprehensive README with new features
- ✅ Live demo with interactive examples
- ✅ TypeScript usage examples
- ✅ Multi-currency implementation guide

**🚀 Demo Improvements:**

- ✅ Dynamic date generation (always current, never outdated)
- ✅ Multiple currency showcases
- ✅ Error handling demonstrations
- ✅ Real-time price calculation examples

### 🐛 Bug Fixes

- Fixed TypeScript compilation errors for new emit types
- Improved date validation for edge cases
- Enhanced error state cleanup on selection change

### ⚡ Performance

- Optimized price calculation for large date ranges
- Improved rendering performance for booking summary
- Better memory management for error states

---

## [1.0.1] - 2024-12-15

### 🐛 Bug Fixes

- Fixed TypeScript declaration file generation
- Improved CSS bundling for better tree-shaking
- Enhanced accessibility for screen readers

### 📚 Documentation

- Added comprehensive usage examples
- Improved TypeScript integration guide
- Updated browser compatibility information

---

## [1.0.0] - 2024-01-22

### 🎉 Initial Release

**Core Features:**

- ✅ Three availability states: available, blocked, checkout-only
- ✅ Smart defaults - only specify blocked/checkout dates
- ✅ Intelligent range validation prevents selection across blocked dates
- ✅ Dynamic pricing support with flexible rate structures
- ✅ Elegant light and dark themes with subtle color palettes
- ✅ Full TypeScript support with comprehensive type definitions
- ✅ Accessibility features including keyboard navigation and ARIA labels
- ✅ Internationalization support with configurable locales
- ✅ Responsive design optimized for both desktop and mobile
- ✅ Vue 3 Composition API with reactive date selection
- ✅ Flexible styling options and CSS custom properties
- ✅ Comprehensive documentation and examples

**Technical Specifications:**

- Vue 3.3+ compatible
- TypeScript 5.0+ support
- Zero runtime dependencies
- Tree-shakable ES modules
- UMD builds for legacy support
- ~9KB gzipped bundle size

**Developer Experience:**

- Complete TypeScript definitions
- Comprehensive documentation
- Interactive demo with examples
- Clear API design with intuitive props
- Extensive customization options
- Professional dark theme

---

## 📋 **Migration Guide**

### From 1.0.1 to 1.0.2

**✅ Backward Compatible** - No breaking changes!

**🆕 Optional New Features:**

```vue
<!-- Enable new features -->
<HotelBookingCalendar
  v-model="dates"
  :show-price-calculation="true"
  :show-selection-errors="true"
  @book-now="handleBooking"
  @price-calculation="handlePricing"
  @selection-error="handleError"
/>
```

**🎯 Enhanced Props:**

- All existing props work exactly the same
- New props are optional with sensible defaults
- Currency default changed from USD to GBP (minor cosmetic change)

**📡 New Events:**

- Listen to new events for enhanced functionality
- All existing events continue to work unchanged

### From 1.0.0 to 1.0.2

**✅ Fully Backward Compatible** - No breaking changes!

- All existing implementations continue to work
- New features are opt-in only
- Enhanced functionality available through new props and events
