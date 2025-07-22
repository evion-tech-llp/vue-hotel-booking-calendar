import type { App } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'
import HotelDashboardCalendar from './components/HotelDashboardCalendar.vue'

// Export the component
export { default as HotelBookingCalendar } from './components/HotelBookingCalendar.vue'
export { default as HotelDashboardCalendar } from './components/HotelDashboardCalendar.vue'

// Export types
export type * from './types'

// Plugin install function for global registration
const plugin = {
  install(app: App) {
    app.component('HotelBookingCalendar', HotelBookingCalendar)
    app.component('HotelDashboardCalendar', HotelDashboardCalendar)
  },
}

// Export plugin as default
export default plugin 