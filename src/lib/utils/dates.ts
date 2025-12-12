/**
 * Date Utilities
 * Helper functions for date calculations
 */

/**
 * Get the start of today (midnight) in milliseconds
 */
export function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Get the end of today (23:59:59.999) in milliseconds
 */
export function getEndOfDay(date: Date = new Date()): number {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * Get the start of the week (Monday) in milliseconds
 */
export function getStartOfWeek(date: Date = new Date()): number {
  const d = new Date(date)
  const day = d.getDay()
  // Adjust when day is Sunday (0) to go back to Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Get the start of the month in milliseconds
 */
export function getStartOfMonth(date: Date = new Date()): number {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Get timestamp for N days ago
 */
export function getDaysAgo(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000
}

/**
 * Format date for display (e.g., "Mon, Dec 11")
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date for full display (e.g., "Monday, December 11")
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get ISO date string (YYYY-MM-DD) for a date
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

