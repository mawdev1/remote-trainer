/**
 * Exercise Types
 * Central type definitions for the exercise system
 */

/** Categories for grouping exercises */
export type ExerciseCategory = 
  | 'upper_body'
  | 'lower_body'
  | 'core'
  | 'cardio'
  | 'stretch'
  | 'eyes'

/** How the exercise is measured */
export type ExerciseTrackingType = 'reps' | 'duration'

/**
 * Definition of an exercise type
 * This is the configuration/metadata for an exercise
 */
export interface ExerciseDefinition {
  /** Unique identifier (e.g., 'pushups', 'squats') */
  id: string
  /** Display name */
  name: string
  /** Short description */
  subtitle: string
  /** Emoji icon */
  icon: string
  /** Category for grouping */
  category: ExerciseCategory
  /** How it's tracked (reps or duration in seconds) */
  trackingType: ExerciseTrackingType
  /** Primary color (hex) */
  color: string
  /** Gradient end color (hex) */
  colorEnd: string
  /** Default quick-add button values */
  defaultQuickOptions: number[]
  /** Whether this exercise is enabled by default */
  enabledByDefault: boolean
}

/**
 * A single logged exercise entry
 * Stored in chrome.storage.local
 */
export interface ExerciseEntry {
  /** Unique ID for this entry */
  id: string
  /** Exercise type ID (references ExerciseDefinition.id) */
  exerciseId: string
  /** Number of reps or duration in seconds */
  value: number
  /** Unix timestamp in milliseconds */
  timestamp: number
  /** Optional session grouping ID */
  sessionId?: string
}

/**
 * Aggregated stats for a period
 */
export interface ExerciseStats {
  /** Total reps or total seconds */
  totalValue: number
  /** Number of sets/entries */
  setCount: number
}

/**
 * Daily totals for history view
 * Dynamic - keys are exercise IDs
 */
export interface DailyTotals {
  /** Formatted date string */
  date: string
  /** Date as ISO string for sorting */
  dateISO: string
  /** Totals per exercise ID */
  totals: Record<string, number>
}

