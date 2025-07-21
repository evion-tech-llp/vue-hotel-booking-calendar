import type { App } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'

// Export the component
export { HotelBookingCalendar }

// Export types
export * from './types'

// Plugin install function for global registration
const plugin = {
  install(app: App) {
    app.component('HotelBookingCalendar', HotelBookingCalendar)
  },
}

// Export plugin as default
export default plugin 