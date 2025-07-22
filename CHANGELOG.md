# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
