# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-22

### 🎉 Initial Release

**Core Features:**

- ✅ Three availability states: available, blocked, checkout-only
- ✅ Smart defaults - only specify blocked/checkout dates
- ✅ Intelligent range validation prevents selection across blocked dates
- ✅ Dynamic pricing support with flexible rate structures
- ✅ Elegant light and dark themes with subtle color palettes
- ✅ Full TypeScript support with comprehensive type definitions
- ✅ Responsive design optimized for all screen sizes

**User Experience:**

- ✅ Accessibility-first design with ARIA labels and keyboard navigation
- ✅ Internationalization support with customizable locales
- ✅ Range selection for check-in and check-out dates
- ✅ Customizable date constraints (min/max dates, past dates)
- ✅ Single-day selection support for day-use bookings
- ✅ Event system for date selection and state changes

**Developer Experience:**

- ✅ Vue 3 Composition API implementation
- ✅ Tree-shakeable ES modules build + UMD for legacy support
- ✅ Complete TypeScript declaration files
- ✅ ESLint and Prettier configuration
- ✅ Vite-based modern build system
- ✅ Comprehensive documentation and live examples

**Visual Design:**

- ✅ Professional hotel-focused styling
- ✅ Subtle color coding for availability states
- ✅ Dark theme with off-white text and 8% opacity overlays
- ✅ Smooth hover states and transitions
- ✅ Custom legend slot for branding

### 🔧 Technical Improvements

- Optimized bundle size (< 10KB gzipped)
- Cross-browser compatibility testing
- Mobile-first responsive approach
- Performance optimized for large date ranges

[Unreleased]: https://github.com/evion/vue-hotel-booking-calendar/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/evion/vue-hotel-booking-calendar/releases/tag/v1.0.0
