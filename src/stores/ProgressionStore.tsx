/**
 * Progression Store
 * Manages XP, levels, unlocks, and achievements
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
  ProgressionData,
  ExerciseProgress,
  DEFAULT_PROGRESSION,
  calculateLevel,
  getLevelProgress,
  getLevelTitle,
  MAX_LEVEL,
  Achievement,
  UnlockRequirement,
} from '@/types/progression'
import { progressionStorage, streakStorage } from '@/lib/storage'
import {
  UNLOCK_CONFIG,
  getUnlockConfig,
  isStarterExercise,
  ACHIEVEMENTS,
  getAchievementById,
} from '@/features/progression'
import { EXERCISE_REGISTRY } from '@/features/exercises'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface NewUnlock {
  type: 'exercise' | 'achievement'
  id: string
  name: string
  icon: string
  xpReward?: number
}

interface ProgressionStoreState {
  /** Whether data is loading */
  isLoading: boolean
  /** Full progression data */
  data: ProgressionData
  /** Queue of new unlocks to celebrate */
  unlockQueue: NewUnlock[]
  /** Daily XP earned today */
  dailyXp: number
  /** Exercises done today (for variety achievements) */
  exercisesToday: Set<string>
}

interface ProgressionStoreActions {
  /** Add XP for completing an exercise */
  addXp: (exerciseId: string, value: number) => Promise<void>
  /** Get progress for a specific exercise */
  getExerciseProgress: (exerciseId: string) => ExerciseProgress
  /** Check if an exercise is unlocked */
  isUnlocked: (exerciseId: string) => boolean
  /** Get unlock requirement for an exercise */
  getUnlockRequirement: (exerciseId: string) => UnlockRequirement | undefined
  /** Check if unlock requirement is met */
  isUnlockRequirementMet: (exerciseId: string) => boolean
  /** Get progress toward unlock (0-100) */
  getUnlockProgress: (exerciseId: string) => number
  /** Get all unlocked exercises */
  getUnlockedExercises: () => string[]
  /** Get all locked exercises */
  getLockedExercises: () => string[]
  /** Check if an achievement is unlocked */
  isAchievementUnlocked: (achievementId: string) => boolean
  /** Dismiss the next unlock from the queue */
  dismissUnlock: () => void
  /** Reset all progression */
  resetProgression: () => Promise<void>
}

type ProgressionStoreContextValue = ProgressionStoreState & ProgressionStoreActions

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const ProgressionStoreContext = createContext<ProgressionStoreContextValue | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getDefaultProgress(exerciseId: string): ExerciseProgress {
  const isStarter = isStarterExercise(exerciseId)
  return {
    xp: 0,
    level: 1,
    unlocked: isStarter,
    unlockedAt: isStarter ? Date.now() : undefined,
  }
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressionStoreProviderProps {
  children: ReactNode
}

export const ProgressionStoreProvider: React.FC<ProgressionStoreProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ProgressionData>(DEFAULT_PROGRESSION)
  const [unlockQueue, setUnlockQueue] = useState<NewUnlock[]>([])
  const [dailyXp, setDailyXp] = useState(0)
  const [exercisesToday, setExercisesToday] = useState<Set<string>>(new Set())
  const [lastDayKey, setLastDayKey] = useState(getTodayKey())

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await progressionStorage.get()
        setData(loaded)
      } catch (error) {
        console.error('Failed to load progression:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Listen for changes
  useEffect(() => {
    const unsubscribe = progressionStorage.onChange((newData) => {
      setData(newData)
    })
    return unsubscribe
  }, [])

  // Reset daily tracking at midnight
  useEffect(() => {
    const checkDay = () => {
      const today = getTodayKey()
      if (today !== lastDayKey) {
        setLastDayKey(today)
        setDailyXp(0)
        setExercisesToday(new Set())
      }
    }
    
    const interval = setInterval(checkDay, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [lastDayKey])

  // Get exercise progress
  const getExerciseProgress = useCallback((exerciseId: string): ExerciseProgress => {
    return data.exercises[exerciseId] || getDefaultProgress(exerciseId)
  }, [data.exercises])

  // Check if unlocked
  const isUnlocked = useCallback((exerciseId: string): boolean => {
    const progress = getExerciseProgress(exerciseId)
    return progress.unlocked
  }, [getExerciseProgress])

  // Get unlock requirement
  const getUnlockRequirement = useCallback((exerciseId: string): UnlockRequirement | undefined => {
    const config = getUnlockConfig(exerciseId)
    return config?.requirement
  }, [])

  // Check if unlock requirement is met
  const isUnlockRequirementMet = useCallback((exerciseId: string): boolean => {
    const config = getUnlockConfig(exerciseId)
    if (!config) return false
    
    const { requirement } = config
    
    switch (requirement.type) {
      case 'starter':
        return true
        
      case 'exercise_level': {
        const progress = getExerciseProgress(requirement.exerciseId!)
        // Must be unlocked AND at the required level
        return progress.unlocked && progress.level >= (requirement.level || 1)
      }
      
      case 'total_xp':
        return data.totalXp >= (requirement.xpThreshold || 0)
        
      case 'exercises_at_level': {
        const count = Object.values(data.exercises).filter(
          p => p.unlocked && p.level >= (requirement.level || 1)
        ).length
        return count >= (requirement.count || 1)
      }
      
      case 'achievement':
        return data.achievements.some(a => a.achievementId === requirement.achievementId)
        
      default:
        return false
    }
  }, [data, getExerciseProgress])

  // Get unlock progress percentage
  const getUnlockProgress = useCallback((exerciseId: string): number => {
    const config = getUnlockConfig(exerciseId)
    if (!config) return 0
    
    const { requirement } = config
    
    switch (requirement.type) {
      case 'starter':
        return 100
        
      case 'exercise_level': {
        const progress = getExerciseProgress(requirement.exerciseId!)
        const targetLevel = requirement.level || 1
        
        // If prerequisite isn't unlocked yet, show 0%
        if (!progress.unlocked) return 0
        
        if (progress.level >= targetLevel) return 100
        
        // Show progress within current level toward target
        const levelProgress = getLevelProgress(progress.xp, progress.level)
        const levelsNeeded = targetLevel - 1
        const levelsComplete = progress.level - 1
        if (levelsNeeded <= 0) return 100
        return Math.round(((levelsComplete + levelProgress / 100) / levelsNeeded) * 100)
      }
      
      case 'total_xp': {
        const threshold = requirement.xpThreshold || 1
        return Math.min(100, Math.round((data.totalXp / threshold) * 100))
      }
      
      case 'exercises_at_level': {
        const count = Object.values(data.exercises).filter(
          p => p.unlocked && p.level >= (requirement.level || 1)
        ).length
        const needed = requirement.count || 1
        return Math.min(100, Math.round((count / needed) * 100))
      }
      
      default:
        return 0
    }
  }, [data, getExerciseProgress])

  // Check achievement conditions
  const checkAchievementCondition = useCallback((achievement: Achievement): boolean => {
    const { condition } = achievement
    
    switch (condition.type) {
      case 'first_exercise':
        return data.totalXp > 0
        
      case 'total_xp':
        return data.totalXp >= (condition.value || 0)
        
      case 'exercise_level': {
        const maxLevel = Math.max(
          ...Object.values(data.exercises).map(p => p.level),
          1
        )
        return maxLevel >= (condition.value || 1)
      }
      
      case 'specific_level': {
        const progress = getExerciseProgress(condition.exerciseId!)
        return progress.level >= (condition.value || 1)
      }
      
      case 'exercises_unlocked': {
        const unlocked = Object.values(data.exercises).filter(p => p.unlocked).length
        return unlocked >= (condition.value || 1)
      }
      
      case 'all_unlocked': {
        const totalExercises = EXERCISE_REGISTRY.length
        const unlocked = Object.values(data.exercises).filter(p => p.unlocked).length
        return unlocked >= totalExercises
      }
      
      case 'daily_xp':
        return dailyXp >= (condition.value || 0)
        
      case 'exercises_in_day':
        return exercisesToday.size >= (condition.value || 1)
        
      case 'max_level':
        return Object.values(data.exercises).some(p => p.level >= MAX_LEVEL)
        
      case 'multi_max_level': {
        const mastered = Object.values(data.exercises).filter(p => p.level >= MAX_LEVEL).length
        return mastered >= (condition.value || 1)
      }
      
      case 'streak':
        // Streak achievements are checked separately in addXp
        // This is a placeholder - actual check happens with current streak data
        return false
      
      default:
        return false
    }
  }, [data, dailyXp, exercisesToday, getExerciseProgress])

  // Check if achievement is unlocked
  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return data.achievements.some(a => a.achievementId === achievementId)
  }, [data.achievements])

  // Add XP and check for unlocks/achievements
  const addXp = useCallback(async (exerciseId: string, value: number) => {
    // XP is equal to reps for rep-based, or seconds for duration-based
    const xpGained = value
    
    // Update daily tracking
    setDailyXp(prev => prev + xpGained)
    setExercisesToday(prev => new Set([...prev, exerciseId]))
    
    // Add XP to storage
    const result = await progressionStorage.addXp(exerciseId, xpGained)
    
    // Refresh data
    const newData = await progressionStorage.get()
    setData(newData)
    
    const newUnlocks: NewUnlock[] = []
    
    // Check for level up
    if (result.leveledUp) {
      const exercise = EXERCISE_REGISTRY.find(e => e.id === exerciseId)
      if (exercise) {
        newUnlocks.push({
          type: 'exercise',
          id: `levelup_${exerciseId}_${result.progress.level}`,
          name: `${exercise.name} Level ${result.progress.level}!`,
          icon: exercise.icon,
        })
      }
    }
    
    // Check for new exercise unlocks
    for (const config of UNLOCK_CONFIG) {
      const progress = newData.exercises[config.exerciseId]
      if (progress?.unlocked) continue // Already unlocked
      
      // Check if requirement is now met
      const { requirement } = config
      let isMet = false
      
      switch (requirement.type) {
        case 'exercise_level': {
          const reqProgress = newData.exercises[requirement.exerciseId!]
          isMet = reqProgress && reqProgress.level >= (requirement.level || 1)
          break
        }
        case 'total_xp':
          isMet = newData.totalXp >= (requirement.xpThreshold || 0)
          break
        case 'exercises_at_level': {
          const count = Object.values(newData.exercises).filter(
            p => p.unlocked && p.level >= (requirement.level || 1)
          ).length
          isMet = count >= (requirement.count || 1)
          break
        }
      }
      
      if (isMet) {
        // Unlock the exercise
        await progressionStorage.unlockExercise(config.exerciseId)
        const exercise = EXERCISE_REGISTRY.find(e => e.id === config.exerciseId)
        if (exercise) {
          newUnlocks.push({
            type: 'exercise',
            id: config.exerciseId,
            name: `${exercise.name} Unlocked!`,
            icon: exercise.icon,
          })
        }
      }
    }
    
    // Check for new achievements
    for (const achievement of ACHIEVEMENTS) {
      if (newData.achievements.some(a => a.achievementId === achievement.id)) continue
      
      // Re-check with updated daily tracking
      const updatedDailyXp = dailyXp + xpGained
      const updatedExercisesToday = new Set([...exercisesToday, exerciseId])
      
      let conditionMet = false
      const { condition } = achievement
      
      switch (condition.type) {
        case 'first_exercise':
          conditionMet = newData.totalXp > 0
          break
        case 'total_xp':
          conditionMet = newData.totalXp >= (condition.value || 0)
          break
        case 'exercise_level': {
          const maxLevel = Math.max(...Object.values(newData.exercises).map(p => p.level), 1)
          conditionMet = maxLevel >= (condition.value || 1)
          break
        }
        case 'specific_level': {
          const progress = newData.exercises[condition.exerciseId!]
          conditionMet = progress && progress.level >= (condition.value || 1)
          break
        }
        case 'exercises_unlocked': {
          const unlocked = Object.values(newData.exercises).filter(p => p.unlocked).length
          conditionMet = unlocked >= (condition.value || 1)
          break
        }
        case 'all_unlocked': {
          const totalExercises = EXERCISE_REGISTRY.length
          const unlocked = Object.values(newData.exercises).filter(p => p.unlocked).length
          conditionMet = unlocked >= totalExercises
          break
        }
        case 'daily_xp':
          conditionMet = updatedDailyXp >= (condition.value || 0)
          break
        case 'exercises_in_day':
          conditionMet = updatedExercisesToday.size >= (condition.value || 1)
          break
        case 'max_level':
          conditionMet = Object.values(newData.exercises).some(p => p.level >= MAX_LEVEL)
          break
        case 'multi_max_level': {
          const mastered = Object.values(newData.exercises).filter(p => p.level >= MAX_LEVEL).length
          conditionMet = mastered >= (condition.value || 1)
          break
        }
        
        case 'streak': {
          // Get current streak from storage
          const streakData = await streakStorage.get()
          conditionMet = streakData.current >= (condition.value || 1)
          break
        }
      }
      
      if (conditionMet) {
        await progressionStorage.unlockAchievement(achievement.id)
        
        // Add XP reward
        if (achievement.xpReward) {
          await progressionStorage.addXp(exerciseId, achievement.xpReward)
        }
        
        newUnlocks.push({
          type: 'achievement',
          id: achievement.id,
          name: achievement.name,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        })
      }
    }
    
    // Add new unlocks to queue
    if (newUnlocks.length > 0) {
      setUnlockQueue(prev => [...prev, ...newUnlocks])
    }
    
    // Refresh data again after all unlocks
    const finalData = await progressionStorage.get()
    setData(finalData)
  }, [dailyXp, exercisesToday])

  // Get unlocked exercises
  const getUnlockedExercises = useCallback((): string[] => {
    return EXERCISE_REGISTRY
      .filter(e => {
        const progress = data.exercises[e.id]
        return progress?.unlocked || isStarterExercise(e.id)
      })
      .map(e => e.id)
  }, [data.exercises])

  // Get locked exercises
  const getLockedExercises = useCallback((): string[] => {
    return EXERCISE_REGISTRY
      .filter(e => {
        const progress = data.exercises[e.id]
        return !progress?.unlocked && !isStarterExercise(e.id)
      })
      .map(e => e.id)
  }, [data.exercises])

  // Dismiss unlock
  const dismissUnlock = useCallback(() => {
    setUnlockQueue(prev => prev.slice(1))
  }, [])

  // Reset progression
  const resetProgression = useCallback(async () => {
    await progressionStorage.reset()
    const newData = await progressionStorage.get()
    setData(newData)
    setDailyXp(0)
    setExercisesToday(new Set())
    setUnlockQueue([])
  }, [])

  // Context value
  const value = useMemo<ProgressionStoreContextValue>(() => ({
    isLoading,
    data,
    unlockQueue,
    dailyXp,
    exercisesToday,
    addXp,
    getExerciseProgress,
    isUnlocked,
    getUnlockRequirement,
    isUnlockRequirementMet,
    getUnlockProgress,
    getUnlockedExercises,
    getLockedExercises,
    isAchievementUnlocked,
    dismissUnlock,
    resetProgression,
  }), [
    isLoading,
    data,
    unlockQueue,
    dailyXp,
    exercisesToday,
    addXp,
    getExerciseProgress,
    isUnlocked,
    getUnlockRequirement,
    isUnlockRequirementMet,
    getUnlockProgress,
    getUnlockedExercises,
    getLockedExercises,
    isAchievementUnlocked,
    dismissUnlock,
    resetProgression,
  ])

  return (
    <ProgressionStoreContext.Provider value={value}>
      {children}
    </ProgressionStoreContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Access the progression store
 */
export function useProgressionStore(): ProgressionStoreContextValue {
  const context = useContext(ProgressionStoreContext)
  if (!context) {
    throw new Error('useProgressionStore must be used within ProgressionStoreProvider')
  }
  return context
}

/**
 * Get progress for a specific exercise
 */
export function useExerciseProgression(exerciseId: string) {
  const { getExerciseProgress, isUnlocked } = useProgressionStore()
  const progress = getExerciseProgress(exerciseId)
  
  return {
    ...progress,
    isUnlocked: isUnlocked(exerciseId),
    levelProgress: getLevelProgress(progress.xp, progress.level),
    levelTitle: getLevelTitle(progress.level),
    isMaxLevel: progress.level >= MAX_LEVEL,
  }
}

/**
 * Get unlock info for a locked exercise
 */
export function useUnlockInfo(exerciseId: string) {
  const { getUnlockRequirement, getUnlockProgress, isUnlockRequirementMet } = useProgressionStore()
  
  return {
    requirement: getUnlockRequirement(exerciseId),
    progress: getUnlockProgress(exerciseId),
    isReady: isUnlockRequirementMet(exerciseId),
  }
}

/**
 * Get total stats
 */
export function useTotalProgression() {
  const { data, dailyXp, exercisesToday } = useProgressionStore()
  
  return {
    totalXp: data.totalXp,
    dailyXp,
    exercisesTodayCount: exercisesToday.size,
    achievementsUnlocked: data.achievements.length,
    totalAchievements: ACHIEVEMENTS.length,
  }
}

