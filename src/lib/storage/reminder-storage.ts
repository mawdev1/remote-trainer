/**
 * Reminder Storage
 * Handles active time tracking, movement minutes, and reminder state
 */

import { localStorage } from './chrome-storage'
import { toISODateString } from '@/lib/utils/dates'

// Storage keys
const STORAGE_KEYS = {
  ACTIVE_TIME_START: 'extFlex_active_time_start',
  LAST_ACTIVE_TIMESTAMP: 'extFlex_last_active_timestamp',
  ACCUMULATED_ACTIVE_TIME: 'extFlex_accumulated_active_time',
  MOVEMENT_MINUTES: 'extFlex_movement_minutes',
  LAST_REMINDER_TIME: 'extFlex_last_reminder_time',
  SNOOZE_UNTIL: 'extFlex_snooze_until',
} as const

/**
 * Movement minutes data structure
 * Keyed by ISO date string (YYYY-MM-DD)
 */
interface MovementMinutesData {
  [dateKey: string]: number
}

/**
 * Estimated duration in seconds for different exercise types
 * Used to calculate movement minutes from exercise logs
 */
const ESTIMATED_EXERCISE_DURATION: Record<string, number> = {
  // Reps-based: roughly 2 seconds per rep
  pushups: 2,
  jumping_jacks: 1,
  squats: 2,
  burpees: 4,
  lunges: 2,
  crunches: 1.5,
  mountain_climbers: 1,
  high_knees: 0.5,
  dumbbell_curls: 2,
  dumbbell_shoulder_press: 2,
  dumbbell_rows: 2,
  tricep_dips: 2,
  goblet_squats: 3,
  dumbbell_lunges: 3,
  dumbbell_chest_press: 2,
  jump_squats: 2,
  jump_lunges: 2,
  tuck_jumps: 2,
  butt_kicks: 0.5,
  skaters: 1,
  star_jumps: 2,
  bicycle_crunches: 1,
  russian_twists: 1,
  speed_skaters: 1,
  lateral_raises: 2,
  hammer_curls: 2,
  overhead_tricep_extension: 2,
  dumbbell_flyes: 2,
  dumbbell_deadlifts: 3,
}

/**
 * Reminder Storage API
 */
export const reminderStorage = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE TIME TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start tracking active time (called when user becomes active)
   */
  async startActiveTracking(): Promise<void> {
    const now = Date.now()
    await localStorage.set(STORAGE_KEYS.ACTIVE_TIME_START, now)
    await localStorage.set(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP, now)
  },

  /**
   * Update the last active timestamp (called periodically while user is active)
   */
  async updateActiveTimestamp(): Promise<void> {
    await localStorage.set(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP, Date.now())
  },

  /**
   * Pause active tracking and accumulate the time (called when user goes idle)
   * @returns The accumulated active time in milliseconds
   */
  async pauseActiveTracking(): Promise<number> {
    const startTime = await localStorage.get<number>(STORAGE_KEYS.ACTIVE_TIME_START)
    const currentAccumulated = await localStorage.get<number>(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME) || 0

    if (startTime) {
      const sessionTime = Date.now() - startTime
      const newAccumulated = currentAccumulated + sessionTime
      await localStorage.set(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME, newAccumulated)
      await localStorage.remove(STORAGE_KEYS.ACTIVE_TIME_START)
      return newAccumulated
    }

    return currentAccumulated
  },

  /**
   * Get the current active time in milliseconds
   * Includes both accumulated time and current session time (if active)
   */
  async getActiveTime(): Promise<number> {
    const startTime = await localStorage.get<number>(STORAGE_KEYS.ACTIVE_TIME_START)
    const accumulated = await localStorage.get<number>(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME) || 0

    if (startTime) {
      return accumulated + (Date.now() - startTime)
    }

    return accumulated
  },

  /**
   * Get the active time formatted as a human-readable string
   * @returns e.g., "45 min" or "1h 15m"
   */
  async getActiveTimeFormatted(): Promise<string> {
    const ms = await this.getActiveTime()
    return this.formatDuration(ms)
  },

  /**
   * Reset active time tracking (called when user completes an exercise)
   */
  async resetActiveTime(): Promise<void> {
    await localStorage.remove(STORAGE_KEYS.ACTIVE_TIME_START)
    await localStorage.remove(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME)
    await localStorage.set(STORAGE_KEYS.LAST_REMINDER_TIME, Date.now())
  },

  /**
   * Get the last active timestamp
   */
  async getLastActiveTimestamp(): Promise<number | null> {
    return localStorage.get<number>(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REMINDER TIMING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get the time of the last reminder
   */
  async getLastReminderTime(): Promise<number | null> {
    return localStorage.get<number>(STORAGE_KEYS.LAST_REMINDER_TIME)
  },

  /**
   * Set the last reminder time to now
   */
  async setLastReminderTime(): Promise<void> {
    await localStorage.set(STORAGE_KEYS.LAST_REMINDER_TIME, Date.now())
  },

  /**
   * Set a snooze period
   * @param minutes Number of minutes to snooze
   */
  async setSnooze(minutes: number): Promise<void> {
    const snoozeUntil = Date.now() + minutes * 60 * 1000
    await localStorage.set(STORAGE_KEYS.SNOOZE_UNTIL, snoozeUntil)
  },

  /**
   * Check if currently in snooze period
   */
  async isInSnooze(): Promise<boolean> {
    const snoozeUntil = await localStorage.get<number>(STORAGE_KEYS.SNOOZE_UNTIL)
    if (!snoozeUntil) return false
    return Date.now() < snoozeUntil
  },

  /**
   * Clear snooze
   */
  async clearSnooze(): Promise<void> {
    await localStorage.remove(STORAGE_KEYS.SNOOZE_UNTIL)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVEMENT MINUTES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add movement minutes for an exercise
   * @param exerciseId The exercise type ID
   * @param value The value (reps or seconds depending on tracking type)
   * @param trackingType 'reps' or 'duration'
   */
  async addMovementMinutes(
    exerciseId: string,
    value: number,
    trackingType: 'reps' | 'duration'
  ): Promise<number> {
    let seconds: number

    if (trackingType === 'duration') {
      // Value is already in seconds
      seconds = value
    } else {
      // Value is reps - estimate duration
      const secPerRep = ESTIMATED_EXERCISE_DURATION[exerciseId] || 2
      seconds = value * secPerRep
    }

    const minutes = seconds / 60
    const today = toISODateString(new Date())
    
    const allData = await localStorage.get<MovementMinutesData>(STORAGE_KEYS.MOVEMENT_MINUTES) || {}
    const currentMinutes = allData[today] || 0
    const newMinutes = currentMinutes + minutes
    
    allData[today] = newMinutes
    await localStorage.set(STORAGE_KEYS.MOVEMENT_MINUTES, allData)

    return newMinutes
  },

  /**
   * Get today's movement minutes
   */
  async getTodayMovementMinutes(): Promise<number> {
    const today = toISODateString(new Date())
    const allData = await localStorage.get<MovementMinutesData>(STORAGE_KEYS.MOVEMENT_MINUTES) || {}
    return allData[today] || 0
  },

  /**
   * Get movement minutes for a specific date
   */
  async getMovementMinutes(date: Date): Promise<number> {
    const dateKey = toISODateString(date)
    const allData = await localStorage.get<MovementMinutesData>(STORAGE_KEYS.MOVEMENT_MINUTES) || {}
    return allData[dateKey] || 0
  },

  /**
   * Clean up old movement minutes data (keep last 90 days)
   */
  async cleanupOldData(): Promise<void> {
    const allData = await localStorage.get<MovementMinutesData>(STORAGE_KEYS.MOVEMENT_MINUTES) || {}
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)
    const cutoffKey = toISODateString(cutoffDate)

    const cleanedData: MovementMinutesData = {}
    for (const [dateKey, minutes] of Object.entries(allData)) {
      if (dateKey >= cutoffKey) {
        cleanedData[dateKey] = minutes
      }
    }

    await localStorage.set(STORAGE_KEYS.MOVEMENT_MINUTES, cleanedData)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Format duration in milliseconds to human-readable string
   */
  formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} min`
  },

  /**
   * Check if currently within quiet hours
   */
  isInQuietHours(quietStart: number | null, quietEnd: number | null): boolean {
    if (quietStart === null || quietEnd === null) return false

    const now = new Date()
    const currentHour = now.getHours()

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (quietStart > quietEnd) {
      return currentHour >= quietStart || currentHour < quietEnd
    }

    // Normal quiet hours (e.g., 12:00 - 13:00)
    return currentHour >= quietStart && currentHour < quietEnd
  },
}

