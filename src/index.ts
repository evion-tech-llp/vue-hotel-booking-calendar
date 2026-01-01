import type { App } from 'vue'
import HotelBookingCalendar from './components/HotelBookingCalendar.vue'
import HotelDashboardCalendar from './components/HotelDashboardCalendar.vue'
import ResourceSchedulerCalendar from './components/ResourceSchedulerCalendar.vue'

// Export the components
export { default as HotelBookingCalendar } from './components/HotelBookingCalendar.vue'
export { default as HotelDashboardCalendar } from './components/HotelDashboardCalendar.vue'
export { default as ResourceSchedulerCalendar } from './components/ResourceSchedulerCalendar.vue'

// Export types
export type * from './types'

// Plugin install function for global registration
const plugin = {
  install(app: App) {
    app.component('HotelBookingCalendar', HotelBookingCalendar)
    app.component('HotelDashboardCalendar', HotelDashboardCalendar)
    app.component('ResourceSchedulerCalendar', ResourceSchedulerCalendar)
  },
}

// Export plugin as default
export default plugin 