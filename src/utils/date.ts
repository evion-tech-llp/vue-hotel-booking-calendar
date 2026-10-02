/**
 * Parses a date-only ("YYYY-MM-DD") or ISO-timestamp string into a Date
 * representing local midnight of that calendar date.
 *
 * `new Date(dateString)` parses a bare date-only string as UTC midnight. In any
 * negative-UTC-offset timezone that instant falls on the *previous* local
 * calendar day, so `.getDate()`/day-of-month comparisons against a locally
 * constructed `Date` (`new Date(year, month, day)`) are silently off by one.
 * This parses the Y/M/D components directly, sidestepping UTC interpretation
 * entirely regardless of the viewer's timezone offset.
 */
export function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number)
    return new Date(year, month - 1, day)
}
