# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.14] - 2025-10-15

### Added
- Enhanced validation for checkout-only dates
- Added visual indicators for checkout-only dates in error messages
- Improved date range validation to prevent invalid selections

### Fixed
- Fixed issue where checkout-only dates could be included within stay range
- Added proper validation for blocked dates between selected dates
- Enhanced error messages to show specific dates causing validation issues

## [1.0.13] - 2025-10-13

### Fixed
- Fixed same-day bookings not showing in mobile calendar view
- Added proper handling for bookings where check-in and check-out dates are the same
- Enhanced date range validation and error logging

## [1.0.12] - 2025-10-13

### Fixed
- Fixed mobile vertical view calendar layout and grid issues
- Fixed Safari visibility issues with booking colors and indicators
- Fixed vertical stretching of bookings in mobile view
- Improved date and booking name positioning in calendar cells
- Enhanced mobile calendar grid layout for better consistency

## [1.0.11] - 2025-10-08

### Added
- Added toggle switch for mobile view options (vertical/horizontal)
- Added auto-scroll to today's date in horizontal mobile view

### Changed
- Made mobile vertical view calendar cells square for better visual consistency
- Improved toggle button design with better visual feedback
- Enhanced mobile view switching with smooth transitions

### Fixed
- Fixed weekday sequence to always start with Sunday
- Fixed mobile view grid alignment issues

## [1.0.10] - 2025-10-08

### 🌐 iOS Safari & Mobile Compatibility

**📱 Enhanced Mobile Support:**
- ✅ Fixed mobile view layout issues in dashboard calendar
- ✅ Improved iOS Safari compatibility with proper vendor prefixes
- ✅ Better touch handling and scrolling behavior on iOS devices
- ✅ Fixed booking span alignment in mobile view
- ✅ Corrected week start alignment

**🔧 Technical Improvements:**
- ✅ Added `-webkit` prefixes for better iOS Safari support
- ✅ Enhanced grid layout compatibility
- ✅ Improved touch event handling
- ✅ Better scrolling behavior with `-webkit-overflow-scrolling`
- ✅ Fixed mobile grid layout and booking spans

**🎨 Visual Refinements:**
- ✅ Consistent styling across iOS Safari and other browsers
- ✅ Better tap highlight handling on iOS
- ✅ Improved visual feedback for touch interactions
- ✅ Enhanced mobile grid alignment
- ✅ Fixed booking span height in mobile view

## [1.0.9] - 2024-06-10

### 🚀 Release

- Version bump to 1.0.9
- No breaking changes
- Updated documentation and version references

[Rest of the changelog remains unchanged...]