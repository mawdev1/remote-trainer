/**
 * Streak Store
 * Manages streak state - consecutive days of exercise activity
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
import {
  StreakData,
  DEFAULT_STREAK_DATA,
  StreakTier,
  getStreakTier,
  getNextMilestone,
  getFlameIntensity,
} from '@/types/streak'
import { streakStorage } from '@/lib/storage'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface StreakMilestoneEvent {
  milestone: number
  timestamp: number
}

interface StreakStoreState {
  /** Whether data is loading */
  isLoading: boolean
  /** Current streak data */
  data: StreakData
  /** Streak tier for visual styling */
  tier: StreakTier
  /** Flame intensity (0-4) for animations */
  flameIntensity: number
  /** Next milestone to achieve */
  nextMilestone: number | null
  /** Progress toward next milestone (0-100) */
  milestoneProgress: number
  /** Whether streak is at risk today */
  isAtRisk: boolean
  /** Whether user has been active today */
  isActiveToday: boolean
  /** Whether today is frozen */
  isFrozenToday: boolean
  /** Pending milestone celebration */
  pendingMilestone: StreakMilestoneEvent | null
}

interface StreakStoreActions {
  /** Record activity for today (call when exercise is logged) */
  recordActivity: () => Promise<{
    streakIncreased: boolean
    milestoneHit: boolean
    newMilestone: number | null
  }>
  /** Use a streak freeze */
  useFreeze: () => Promise<{ success: boolean; reason?: string }>
  /** Dismiss milestone celebration */
  dismissMilestone: () => void
  /** Refresh streak data */
  refresh: () => Promise<void>
  /** Reset streak (for testing/debug) */
  resetStreak: () => Promise<void>
}

type StreakStoreContextValue = StreakStoreState & StreakStoreActions

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const StreakStoreContext = createContext<StreakStoreContextValue | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate progress toward next milestone
 */
function calculateMilestoneProgress(current: number, nextMilestone: number | null): number {
  if (!nextMilestone) return 100
  if (current === 0) return 0
  
  // Find the previous milestone
  const milestones = [0, 7, 14, 30, 60, 90, 180, 365]
  let prevMilestone = 0
  for (const m of milestones) {
    if (m < nextMilestone && m <= current) {
      prevMilestone = m
    }
  }
  
  const range = nextMilestone - prevMilestone
  const progress = current - prevMilestone
  
  return Math.min(100, Math.round((progress / range) * 100))
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface StreakStoreProviderProps {
  children: ReactNode
}

export const StreakStoreProvider: React.FC<StreakStoreProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<StreakData>(DEFAULT_STREAK_DATA)
  const [isAtRisk, setIsAtRisk] = useState(false)
  const [isActiveToday, setIsActiveToday] = useState(false)
  const [isFrozenToday, setIsFrozenToday] = useState(false)
  const [pendingMilestone, setPendingMilestone] = useState<StreakMilestoneEvent | null>(null)

  // Computed values
  const tier = useMemo(() => getStreakTier(data.current), [data.current])
  const flameIntensity = useMemo(() => getFlameIntensity(data.current), [data.current])
  const nextMilestone = useMemo(() => getNextMilestone(data.current), [data.current])
  const milestoneProgress = useMemo(
    () => calculateMilestoneProgress(data.current, nextMilestone),
    [data.current, nextMilestone]
  )

  // Load and validate streak on mount
  useEffect(() => {
    const load = async () => {
      try {
        // First validate the streak (check if it should be broken)
        await streakStorage.validateStreak()
        
        // Then get current status
        const status = await streakStorage.getStreakStatus()
        setData(status.data)
        setIsAtRisk(status.isAtRisk)
        setIsActiveToday(status.isActive)
        setIsFrozenToday(status.isFrozen)
      } catch (error) {
        console.error('Failed to load streak data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Listen for changes
  useEffect(() => {
    const unsubscribe = streakStorage.onChange(async (newData) => {
      setData(newData)
      const status = await streakStorage.getStreakStatus()
      setIsAtRisk(status.isAtRisk)
      setIsActiveToday(status.isActive)
      setIsFrozenToday(status.isFrozen)
    })
    return unsubscribe
  }, [])

  // Record activity
  const recordActivity = useCallback(async () => {
    const result = await streakStorage.recordActivity()
    setData(result.data)
    setIsActiveToday(true)
    setIsAtRisk(false)
    
    // Trigger milestone celebration
    if (result.milestoneHit && result.newMilestone) {
      setPendingMilestone({
        milestone: result.newMilestone,
        timestamp: Date.now(),
      })
    }
    
    return {
      streakIncreased: result.streakIncreased,
      milestoneHit: result.milestoneHit,
      newMilestone: result.newMilestone,
    }
  }, [])

  // Use freeze
  const useFreeze = useCallback(async () => {
    const result = await streakStorage.useFreeze()
    if (result.success) {
      setData(result.data)
      setIsFrozenToday(true)
      setIsAtRisk(false)
    }
    return { success: result.success, reason: result.reason }
  }, [])

  // Dismiss milestone
  const dismissMilestone = useCallback(() => {
    setPendingMilestone(null)
  }, [])

  // Refresh data
  const refresh = useCallback(async () => {
    const status = await streakStorage.getStreakStatus()
    setData(status.data)
    setIsAtRisk(status.isAtRisk)
    setIsActiveToday(status.isActive)
    setIsFrozenToday(status.isFrozen)
  }, [])

  // Reset streak
  const resetStreak = useCallback(async () => {
    await streakStorage.reset()
    const status = await streakStorage.getStreakStatus()
    setData(status.data)
    setIsAtRisk(false)
    setIsActiveToday(false)
    setIsFrozenToday(false)
    setPendingMilestone(null)
  }, [])

  // Context value
  const value = useMemo<StreakStoreContextValue>(() => ({
    // State
    isLoading,
    data,
    tier,
    flameIntensity,
    nextMilestone,
    milestoneProgress,
    isAtRisk,
    isActiveToday,
    isFrozenToday,
    pendingMilestone,
    // Actions
    recordActivity,
    useFreeze,
    dismissMilestone,
    refresh,
    resetStreak,
  }), [
    isLoading,
    data,
    tier,
    flameIntensity,
    nextMilestone,
    milestoneProgress,
    isAtRisk,
    isActiveToday,
    isFrozenToday,
    pendingMilestone,
    recordActivity,
    useFreeze,
    dismissMilestone,
    refresh,
    resetStreak,
  ])

  return (
    <StreakStoreContext.Provider value={value}>
      {children}
    </StreakStoreContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Access the streak store
 */
export function useStreakStore(): StreakStoreContextValue {
  const context = useContext(StreakStoreContext)
  if (!context) {
    throw new Error('useStreakStore must be used within StreakStoreProvider')
  }
  return context
}

/**
 * Get just the streak display info
 */
export function useStreakDisplay() {
  const { data, tier, flameIntensity, isAtRisk, isActiveToday, isFrozenToday } = useStreakStore()
  
  return {
    current: data.current,
    longest: data.longest,
    freezesRemaining: data.freezesRemaining,
    tier,
    flameIntensity,
    isAtRisk,
    isActiveToday,
    isFrozenToday,
  }
}

/**
 * Get milestone progress info
 */
export function useStreakMilestone() {
  const { data, nextMilestone, milestoneProgress, pendingMilestone, dismissMilestone } = useStreakStore()
  
  return {
    current: data.current,
    nextMilestone,
    progress: milestoneProgress,
    pendingMilestone,
    dismissMilestone,
  }
}

