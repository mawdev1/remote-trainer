/**
 * Exercise Storage
 * Handles all exercise data persistence
 * 
 * DYNAMIC: Works with any exercise type from the registry
 */

import { ExerciseEntry, ExerciseStats, DailyTotals } from '@/types'
import { getStartOfDay, getStartOfWeek, formatDateShort, toISODateString } from '@/lib/utils/dates'
import { generateId } from '@/lib/utils/ids'
import { getDefaultEnabledIds, getExerciseById } from '@/features/exercises'
import { localStorage } from './chrome-storage'

// Storage keys (new extFlex prefix)
const STORAGE_KEYS = {
  EXERCISES: 'extFlex_exercises',
  LAST_EXERCISE_TIME: 'extFlex_last_exercise',
} as const

// Legacy keys for migration
const LEGACY_KEYS = {
  EXERCISES: 'trainer_exercises',
  LAST_EXERCISE_TIME: 'trainer_last_exercise',
} as const

// Migration flag key
const MIGRATION_FLAG = 'extFlex_exercise_migration_done'

/**
 * Migrate data from old storage keys to new keys
 * Runs once on first load after update
 */
async function migrateExerciseStorage(): Promise<void> {
  // Check if migration already done
  const migrationDone = await localStorage.get<boolean>(MIGRATION_FLAG)
  if (migrationDone) return

  // Migrate exercises
  const oldExercises = await localStorage.get<ExerciseEntry[]>(LEGACY_KEYS.EXERCISES)
  if (oldExercises && oldExercises.length > 0) {
    const newExercises = await localStorage.get<ExerciseEntry[]>(STORAGE_KEYS.EXERCISES)
    if (!newExercises || newExercises.length === 0) {
      await localStorage.set(STORAGE_KEYS.EXERCISES, oldExercises)
      console.log('Ext & Flex: Migrated exercise data to new storage keys')
    }
  }

  // Migrate last exercise time
  const oldLastTime = await localStorage.get<number>(LEGACY_KEYS.LAST_EXERCISE_TIME)
  if (oldLastTime) {
    const newLastTime = await localStorage.get<number>(STORAGE_KEYS.LAST_EXERCISE_TIME)
    if (!newLastTime) {
      await localStorage.set(STORAGE_KEYS.LAST_EXERCISE_TIME, oldLastTime)
    }
  }

  // Mark migration as complete
  await localStorage.set(MIGRATION_FLAG, true)
  console.log('Ext & Flex: Exercise storage migration complete')
}

// Run migration on module load
migrateExerciseStorage().catch(console.error)

/**
 * Exercise Storage API
 * All methods are dynamic and work with any exercise ID
 */
export const exerciseStorage = {
  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Log a new exercise entry
   * @param exerciseId - The exercise type ID (e.g., 'pushups')
   * @param value - Reps count or duration in seconds
   * @param options - Optional parameters (sessionId, weight)
   */
  async logExercise(
    exerciseId: string,
    value: number,
    options?: { sessionId?: string; weight?: number }
  ): Promise<ExerciseEntry> {
    const entry: ExerciseEntry = {
      id: generateId(),
      exerciseId,
      value,
      timestamp: Date.now(),
      sessionId: options?.sessionId,
      weight: options?.weight,
    }

    const existing = await localStorage.get<ExerciseEntry[]>(STORAGE_KEYS.EXERCISES)
    const exercises = existing || []
    exercises.push(entry)
    
    await localStorage.set(STORAGE_KEYS.EXERCISES, exercises)
    await localStorage.set(STORAGE_KEYS.LAST_EXERCISE_TIME, Date.now())

    return entry
  },

  /**
   * Delete a specific exercise entry by ID
   */
  async deleteEntry(entryId: string): Promise<boolean> {
    const exercises = await this.getAllEntries()
    const filtered = exercises.filter(e => e.id !== entryId)
    
    if (filtered.length === exercises.length) {
      return false // Nothing was deleted
    }

    await localStorage.set(STORAGE_KEYS.EXERCISES, filtered)
    return true
  },

  /**
   * Clear all exercise history
   */
  async clearHistory(): Promise<void> {
    await localStorage.remove(STORAGE_KEYS.EXERCISES)
    await localStorage.remove(STORAGE_KEYS.LAST_EXERCISE_TIME)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READ OPERATIONS - Raw Entries
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all exercise entries
   */
  async getAllEntries(): Promise<ExerciseEntry[]> {
    const exercises = await localStorage.get<ExerciseEntry[]>(STORAGE_KEYS.EXERCISES)
    return exercises || []
  },

  /**
   * Get entries filtered by exercise type
   */
  async getEntriesByType(exerciseId: string): Promise<ExerciseEntry[]> {
    const all = await this.getAllEntries()
    return all.filter(e => e.exerciseId === exerciseId)
  },

  /**
   * Get entries for today
   */
  async getTodayEntries(): Promise<ExerciseEntry[]> {
    const all = await this.getAllEntries()
    const startOfToday = getStartOfDay()
    return all.filter(e => e.timestamp >= startOfToday)
  },

  /**
   * Get entries for this week (starting Monday)
   */
  async getWeekEntries(): Promise<ExerciseEntry[]> {
    const all = await this.getAllEntries()
    const startOfWeek = getStartOfWeek()
    return all.filter(e => e.timestamp >= startOfWeek)
  },

  /**
   * Get entries for the last N days
   */
  async getRecentEntries(days: number): Promise<ExerciseEntry[]> {
    const all = await this.getAllEntries()
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return all.filter(e => e.timestamp >= cutoff)
  },

  /**
   * Get the timestamp of the last logged exercise
   */
  async getLastExerciseTime(): Promise<number | null> {
    return localStorage.get<number>(STORAGE_KEYS.LAST_EXERCISE_TIME)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED STATS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Compute stats from a set of entries
   * @param entries - Exercise entries to aggregate
   * @param exerciseId - Optional filter by exercise type
   */
  computeStats(entries: ExerciseEntry[], exerciseId?: string): ExerciseStats {
    const filtered = exerciseId 
      ? entries.filter(e => e.exerciseId === exerciseId) 
      : entries
    
    return {
      totalValue: filtered.reduce((sum, e) => sum + e.value, 0),
      setCount: filtered.length,
    }
  },

  /**
   * Get stats for today, grouped by exercise type
   * DYNAMIC: Returns stats for all exercise types found in data
   * @param exerciseIds - Optional list of exercise IDs to include (defaults to enabled exercises)
   */
  async getTodayStats(exerciseIds?: string[]): Promise<Record<string, ExerciseStats>> {
    const today = await this.getTodayEntries()
    return this.computeStatsForExercises(today, exerciseIds)
  },

  /**
   * Get stats for this week, grouped by exercise type
   */
  async getWeekStats(exerciseIds?: string[]): Promise<Record<string, ExerciseStats>> {
    const week = await this.getWeekEntries()
    return this.computeStatsForExercises(week, exerciseIds)
  },

  /**
   * Compute stats for multiple exercise types
   */
  computeStatsForExercises(
    entries: ExerciseEntry[],
    exerciseIds?: string[]
  ): Record<string, ExerciseStats> {
    // Use provided IDs or default to enabled exercises
    const ids = exerciseIds || getDefaultEnabledIds()
    
    const result: Record<string, ExerciseStats> = {}
    for (const id of ids) {
      result[id] = this.computeStats(entries, id)
    }
    
    return result
  },

  /**
   * Get daily totals for the last N days
   * Used for history/chart views
   */
  async getDailyTotals(days: number, exerciseIds?: string[]): Promise<DailyTotals[]> {
    const all = await this.getAllEntries()
    const ids = exerciseIds || getDefaultEnabledIds()
    const result: DailyTotals[] = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dayStart = getStartOfDay(date)
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayEntries = all.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd)
      
      const totals: Record<string, number> = {}
      for (const id of ids) {
        totals[id] = this.computeStats(dayEntries, id).totalValue
      }

      result.push({
        date: formatDateShort(date),
        dateISO: toISODateString(date),
        totals,
      })
    }

    return result
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGGREGATE STATS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get total stats across all exercises for today
   */
  async getTodayTotals(): Promise<ExerciseStats> {
    const today = await this.getTodayEntries()
    return this.computeStats(today)
  },

  /**
   * Get total stats across all exercises for this week
   */
  async getWeekTotals(): Promise<ExerciseStats> {
    const week = await this.getWeekEntries()
    return this.computeStats(week)
  },

  /**
   * Get all-time totals
   */
  async getAllTimeTotals(): Promise<ExerciseStats> {
    const all = await this.getAllEntries()
    return this.computeStats(all)
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA EXPORT/IMPORT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Export all exercise data as JSON
   */
  async exportData(): Promise<string> {
    const entries = await this.getAllEntries()
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries,
    }
    return JSON.stringify(exportData, null, 2)
  },

  /**
   * Import exercise data from JSON
   * @param json - JSON string to import
   * @param merge - If true, merge with existing data; if false, replace
   */
  async importData(json: string, merge: boolean = false): Promise<number> {
    const data = JSON.parse(json)
    
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid import data: missing entries array')
    }

    // Validate entries
    const validEntries: ExerciseEntry[] = data.entries.filter((e: unknown) => {
      if (typeof e !== 'object' || e === null) return false
      const entry = e as Record<string, unknown>
      return (
        typeof entry.id === 'string' &&
        typeof entry.exerciseId === 'string' &&
        typeof entry.value === 'number' &&
        typeof entry.timestamp === 'number'
      )
    })

    if (merge) {
      const existing = await this.getAllEntries()
      const existingIds = new Set(existing.map(e => e.id))
      const newEntries = validEntries.filter(e => !existingIds.has(e.id))
      await localStorage.set(STORAGE_KEYS.EXERCISES, [...existing, ...newEntries])
      return newEntries.length
    } else {
      await localStorage.set(STORAGE_KEYS.EXERCISES, validEntries)
      return validEntries.length
    }
  },
}

