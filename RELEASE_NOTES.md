# Release Notes

## Latest Release

### Version 1.0.6 - Mobile Experience Enhancement

🎯 **Focus**: Improved mobile responsiveness and touch interaction

#### 🆕 New Features

**📱 Enhanced Mobile Navigation:**
- ✅ Simplified arrow-only navigation on mobile
- ✅ Optimized touch targets
- ✅ Better button centering and alignment
- ✅ Cleaner mobile interface with reduced text

**📊 Dashboard Calendar Mobile View:**
- ✅ New vertical stack layout for room calendars
- ✅ Full-width calendar view per room
- ✅ Better handling of booking spans across weeks
- ✅ Enhanced visual separation between rooms
- ✅ Proper grid alignment on all screen sizes

**🎨 Visual Refinements:**
- ✅ Improved responsive breakpoints
- ✅ Better dark theme support for mobile
- ✅ Enhanced accessibility for touch devices
- ✅ Smoother transitions between views

**🔧 Technical Improvements:**
- ✅ Refactored grid layout system
- ✅ Better handling of week boundaries
- ✅ Improved date alignment across views
- ✅ Enhanced booking span calculations

#### 🛠️ Technical Details

**📱 Mobile-Optimized Example:**
```vue
<template>
  <HotelDashboardCalendar
    :rooms="rooms"
    :bookings="bookings"
    :text-labels="{
      previousMonth: '←',
      nextMonth: '→'
    }"
  />
</template>
```

#### 🎨 Mobile Design Features

**Guest Calendar:**
- Simplified navigation controls
- Optimized touch targets
- Improved date selection
- Clean, uncluttered interface

**Dashboard Calendar:**
- Vertical room layout
- Full-width calendars
- Better booking visualization
- Enhanced touch interaction

---

### Version 1.0.5 - Enhanced Customization & Navigation

🎯 **Focus**: Custom text labels and flexible navigation control

#### 🆕 New Features

**🎨 Custom Text Labels System:**
- ✅ Fully customizable text labels for all UI elements
- ✅ Perfect for internationalization and custom terminology
- ✅ Complete coverage of all interface text
- ✅ Smart fallback system with English defaults
- ✅ Type-safe implementation with TypeScript interfaces

**📅 Enhanced Navigation Control:**
- ✅ New `allowPreviousMonthNavigation` prop
- ✅ Flexible past month access
- ✅ Better historical data viewing
- ✅ Maintains date selection rules

**🏗️ Dashboard Calendar Architecture:**
- ✅ Refactored to CSS Grid spans
- ✅ More semantic HTML structure
- ✅ Better performance and accessibility
- ✅ Cleaner, more maintainable code

#### 🛠️ Technical Details

**📦 New Props:**
```typescript
// Both calendars
allowPreviousMonthNavigation?: boolean  // Default: false
textLabels?: CalendarTextLabels | DashboardTextLabels  // Default: {}
```

**🎯 Usage Example:**
```vue
<template>
  <HotelBookingCalendar
    :allow-previous-month-navigation="true"
    :text-labels="{
      bookNow: 'Reserve Now',
      available: 'Open',
      previousMonth: '← Back'
    }"
  />
</template>
```

#### 🎨 Design Improvements

- Better visual hierarchy
- Enhanced accessibility
- Smoother transitions
- More consistent spacing