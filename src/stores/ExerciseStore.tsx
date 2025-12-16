/**
 * Exercise Store
 * Global state management for exercise data
 * 
 * Provides centralized access to exercise stats, history,
 * and actions without prop drilling.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { ExerciseStats, DailyTotals, ExerciseDefinition, ExercisePersonalBests } from '@/types'
import { exerciseStorage, reminderStorage, streakStorage, pbStorage, PBCheckResult } from '@/lib/storage'
import { getDefaultEnabledExercises, getExerciseById } from '@/features/exercises'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ExerciseStoreState {
  /** Whether data is currently loading */
  isLoading: boolean
  /** Today's stats per exercise */
  todayStats: Record<string, ExerciseStats>
  /** This week's stats per exercise */
  weekStats: Record<string, ExerciseStats>
  /** Total stats for today (all exercises combined) */
  todayTotals: ExerciseStats
  /** Total stats for this week (all exercises combined) */
  weekTotals: ExerciseStats
  /** Daily history for charts */
  history: DailyTotals[]
  /** Currently animating card (for feedback) */
  animatingCard: string | null
  /** List of enabled exercises */
  enabledExercises: ExerciseDefinition[]
  /** Personal bests for all exercises */
  personalBests: Record<string, ExercisePersonalBests>
  /** Last PB check result (for showing celebration) */
  lastPBResult: { exerciseId: string; result: PBCheckResult } | null
}

interface ExerciseStoreActions {
  /** Log a new exercise (with optional weight for weighted exercises) */
  logExercise: (exerciseId: string, value: number, weight?: number) => Promise<PBCheckResult>
  /** Refresh all data from storage */
  refresh: () => Promise<void>
  /** Clear all exercise history */
  clearHistory: () => Promise<void>
  /** Get exercise definition by ID */
  getExercise: (id: string) => ExerciseDefinition | undefined
  /** Clear the last PB result (after showing celebration) */
  clearLastPBResult: () => void
}

type ExerciseStoreContextValue = ExerciseStoreState & ExerciseStoreActions

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const ExerciseStoreContext = createContext<ExerciseStoreContextValue | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface ExerciseStoreProviderProps {
  children: ReactNode
  /** Number of days to fetch for history (default: 7) */
  historyDays?: number
}

export const ExerciseStoreProvider: React.FC<ExerciseStoreProviderProps> = ({
  children,
  historyDays = 7,
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [todayStats, setTodayStats] = useState<Record<string, ExerciseStats>>({})
  const [weekStats, setWeekStats] = useState<Record<string, ExerciseStats>>({})
  const [todayTotals, setTodayTotals] = useState<ExerciseStats>({ totalValue: 0, setCount: 0 })
  const [weekTotals, setWeekTotals] = useState<ExerciseStats>({ totalValue: 0, setCount: 0 })
  const [history, setHistory] = useState<DailyTotals[]>([])
  const [animatingCard, setAnimatingCard] = useState<string | null>(null)
  const [personalBests, setPersonalBests] = useState<Record<string, ExercisePersonalBests>>({})
  const [lastPBResult, setLastPBResult] = useState<{ exerciseId: string; result: PBCheckResult } | null>(null)

  // Get enabled exercises
  const enabledExercises = useMemo(() => getDefaultEnabledExercises(), [])
  const enabledIds = useMemo(() => enabledExercises.map(e => e.id), [enabledExercises])

  // Load all data from storage
  const loadData = useCallback(async () => {
    try {
      const [today, week, dailyHistory, todayTotal, weekTotal, pbs] = await Promise.all([
        exerciseStorage.getTodayStats(enabledIds),
        exerciseStorage.getWeekStats(enabledIds),
        exerciseStorage.getDailyTotals(historyDays, enabledIds),
        exerciseStorage.getTodayTotals(),
        exerciseStorage.getWeekTotals(),
        pbStorage.getAllPersonalBests(),
      ])

      setTodayStats(today)
      setWeekStats(week)
      setHistory(dailyHistory)
      setTodayTotals(todayTotal)
      setWeekTotals(weekTotal)
      setPersonalBests(pbs)
    } catch (error) {
      console.error('Failed to load exercise data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [enabledIds, historyDays])

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Log exercise action
  const logExercise = useCallback(async (exerciseId: string, value: number, weight?: number): Promise<PBCheckResult> => {
    if (value <= 0) return { isNewPB: false }

    // Get exercise definition to determine tracking type
    const exercise = getExerciseById(exerciseId)
    const trackingType = exercise?.trackingType || 'reps'

    // Log the exercise with optional weight
    await exerciseStorage.logExercise(exerciseId, value, { weight })
    
    // Check for personal best
    const pbResult = await pbStorage.checkAndUpdatePB(exerciseId, value, weight)
    
    // Store the PB result for celebration display
    if (pbResult.isNewPB) {
      setLastPBResult({ exerciseId, result: pbResult })
    }
    
    // Add movement minutes
    await reminderStorage.addMovementMinutes(exerciseId, value, trackingType)

    // Record streak activity
    await streakStorage.recordActivity()

    // Notify background script that an exercise was logged (resets active time)
    try {
      chrome.runtime.sendMessage({ type: 'EXERCISE_LOGGED' })
    } catch {
      // Background script might not be ready
    }
    
    // Trigger animation
    setAnimatingCard(exerciseId)
    setTimeout(() => setAnimatingCard(null), 200)
    
    // Refresh data
    await loadData()
    
    return pbResult
  }, [loadData])

  // Clear history action
  const clearHistory = useCallback(async () => {
    await exerciseStorage.clearHistory()
    await loadData()
  }, [loadData])

  // Get exercise helper
  const getExercise = useCallback((id: string) => getExerciseById(id), [])

  // Clear last PB result (after showing celebration)
  const clearLastPBResult = useCallback(() => {
    setLastPBResult(null)
  }, [])

  // Context value
  const value = useMemo<ExerciseStoreContextValue>(() => ({
    // State
    isLoading,
    todayStats,
    weekStats,
    todayTotals,
    weekTotals,
    history,
    animatingCard,
    enabledExercises,
    personalBests,
    lastPBResult,
    // Actions
    logExercise,
    refresh: loadData,
    clearHistory,
    getExercise,
    clearLastPBResult,
  }), [
    isLoading,
    todayStats,
    weekStats,
    todayTotals,
    weekTotals,
    history,
    animatingCard,
    enabledExercises,
    personalBests,
    lastPBResult,
    logExercise,
    loadData,
    clearHistory,
    getExercise,
    clearLastPBResult,
  ])

  return (
    <ExerciseStoreContext.Provider value={value}>
      {children}
    </ExerciseStoreContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Access the exercise store
 * Must be used within ExerciseStoreProvider
 */
export function useExerciseStore(): ExerciseStoreContextValue {
  const context = useContext(ExerciseStoreContext)
  if (!context) {
    throw new Error('useExerciseStore must be used within ExerciseStoreProvider')
  }
  return context
}

/**
 * Get stats for a specific exercise
 */
export function useExerciseStats(exerciseId: string) {
  const { todayStats, weekStats, animatingCard } = useExerciseStore()
  
  return {
    today: todayStats[exerciseId] || { totalValue: 0, setCount: 0 },
    week: weekStats[exerciseId] || { totalValue: 0, setCount: 0 },
    isAnimating: animatingCard === exerciseId,
  }
}

/**
 * Get aggregate totals
 */
export function useTotalStats() {
  const { todayTotals, weekTotals } = useExerciseStore()
  return { todayTotals, weekTotals }
}

/**
 * Get history data
 */
export function useExerciseHistory() {
  const { history, enabledExercises } = useExerciseStore()
  return { history, exercises: enabledExercises }
}

/**
 * Get personal bests for an exercise
 */
export function usePersonalBests(exerciseId: string) {
  const { personalBests } = useExerciseStore()
  return personalBests[exerciseId] || null
}

/**
 * Get last PB result for celebration display
 */
export function useLastPBResult() {
  const { lastPBResult, clearLastPBResult } = useExerciseStore()
  return { lastPBResult, clearLastPBResult }
}

