/// <reference types="chrome"/>

type StorageArea = 'sync' | 'local' | 'session'

// Exercise types supported by the trainer
export type ExerciseType = 'pushups' | 'arm_curls'

// A single logged exercise entry
export interface ExerciseEntry {
  id: string
  type: ExerciseType
  reps: number
  timestamp: number // Unix timestamp in ms
  sessionId?: string
}

// Summary stats for a given period
export interface ExerciseStats {
  totalReps: number
  setCount: number
}

// Storage keys
const EXERCISES_KEY = 'trainer_exercises'

class ChromeStorage {
  private area: chrome.storage.StorageArea

  constructor(storageArea: StorageArea = 'sync') {
    this.area = chrome.storage[storageArea]
  }

  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      this.area.get(key, (result: { [key: string]: any }) => {
        resolve((result[key] as T) || null)
      })
    })
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T>> {
    return new Promise((resolve) => {
      this.area.get(keys, (result: Record<string, T>) => {
        resolve(result)
      })
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      this.area.set({ [key]: value }, () => {
        resolve()
      })
    })
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      this.area.remove(key, () => {
        resolve()
      })
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve) => {
      this.area.clear(() => {
        resolve()
      })
    })
  }
}

export const syncStorage = new ChromeStorage('sync')
export const localStorage = new ChromeStorage('local')
export const sessionStorage = new ChromeStorage('session')

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get start of today (midnight) in ms
function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Get start of week (Monday) in ms
function getStartOfWeek(date: Date = new Date()): number {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Exercise data access layer
export const exerciseStorage = {
  // Log a new exercise
  async logExercise(type: ExerciseType, reps: number, sessionId?: string): Promise<ExerciseEntry> {
    const entry: ExerciseEntry = {
      id: generateId(),
      type,
      reps,
      timestamp: Date.now(),
      sessionId,
    }

    const existing = await localStorage.get<ExerciseEntry[]>(EXERCISES_KEY)
    const exercises = existing || []
    exercises.push(entry)
    await localStorage.set(EXERCISES_KEY, exercises)

    return entry
  },

  // Get all exercise entries
  async getAllExercises(): Promise<ExerciseEntry[]> {
    const exercises = await localStorage.get<ExerciseEntry[]>(EXERCISES_KEY)
    return exercises || []
  },

  // Get exercises filtered by type
  async getExercisesByType(type: ExerciseType): Promise<ExerciseEntry[]> {
    const all = await this.getAllExercises()
    return all.filter((e) => e.type === type)
  },

  // Get exercises for today
  async getTodayExercises(): Promise<ExerciseEntry[]> {
    const all = await this.getAllExercises()
    const startOfToday = getStartOfDay()
    return all.filter((e) => e.timestamp >= startOfToday)
  },

  // Get exercises for this week
  async getWeekExercises(): Promise<ExerciseEntry[]> {
    const all = await this.getAllExercises()
    const startOfWeek = getStartOfWeek()
    return all.filter((e) => e.timestamp >= startOfWeek)
  },

  // Get exercises for the last N days
  async getRecentExercises(days: number): Promise<ExerciseEntry[]> {
    const all = await this.getAllExercises()
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return all.filter((e) => e.timestamp >= cutoff)
  },

  // Compute stats for a given set of exercises
  computeStats(exercises: ExerciseEntry[], type?: ExerciseType): ExerciseStats {
    const filtered = type ? exercises.filter((e) => e.type === type) : exercises
    return {
      totalReps: filtered.reduce((sum, e) => sum + e.reps, 0),
      setCount: filtered.length,
    }
  },

  // Get stats for today by exercise type
  async getTodayStats(): Promise<Record<ExerciseType, ExerciseStats>> {
    const today = await this.getTodayExercises()
    return {
      pushups: this.computeStats(today, 'pushups'),
      arm_curls: this.computeStats(today, 'arm_curls'),
    }
  },

  // Get stats for this week by exercise type
  async getWeekStats(): Promise<Record<ExerciseType, ExerciseStats>> {
    const week = await this.getWeekExercises()
    return {
      pushups: this.computeStats(week, 'pushups'),
      arm_curls: this.computeStats(week, 'arm_curls'),
    }
  },

  // Get daily totals for the last N days (for history view)
  async getDailyTotals(days: number): Promise<Array<{ date: string; pushups: number; arm_curls: number }>> {
    const all = await this.getAllExercises()
    const result: Array<{ date: string; pushups: number; arm_curls: number }> = []

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = getStartOfDay(date)
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayExercises = all.filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd)
      const pushups = this.computeStats(dayExercises, 'pushups').totalReps
      const arm_curls = this.computeStats(dayExercises, 'arm_curls').totalReps

      result.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        pushups,
        arm_curls,
      })
    }

    return result
  },

  // Clear all exercise history
  async clearHistory(): Promise<void> {
    await localStorage.remove(EXERCISES_KEY)
  },
}
