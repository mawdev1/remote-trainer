/**
 * Progression Storage
 * Handles persistence of XP, levels, unlocks, and achievements
 */

import { localStorage } from './chrome-storage'
import {
  ProgressionData,
  DEFAULT_PROGRESSION,
  ExerciseProgress,
  UnlockedAchievement,
  calculateLevel,
} from '@/types/progression'
import { isStarterExercise } from '@/features/progression'

const STORAGE_KEY = 'extFlex_progression'

/**
 * Get default progress for an exercise
 */
function getDefaultExerciseProgress(exerciseId: string): ExerciseProgress {
  const isStarter = isStarterExercise(exerciseId)
  return {
    xp: 0,
    level: 1,
    unlocked: isStarter,
    unlockedAt: isStarter ? Date.now() : undefined,
  }
}

/**
 * Progression Storage API
 */
export const progressionStorage = {
  /**
   * Get all progression data
   */
  async get(): Promise<ProgressionData> {
    const data = await localStorage.get<ProgressionData>(STORAGE_KEY)
    return data || { ...DEFAULT_PROGRESSION }
  },

  /**
   * Save progression data
   */
  async save(data: ProgressionData): Promise<void> {
    await localStorage.set(STORAGE_KEY, data)
  },

  /**
   * Get progress for a specific exercise
   */
  async getExerciseProgress(exerciseId: string): Promise<ExerciseProgress> {
    const data = await this.get()
    return data.exercises[exerciseId] || getDefaultExerciseProgress(exerciseId)
  },

  /**
   * Add XP to an exercise and update level
   * Returns the updated progress and any level-ups
   */
  async addXp(
    exerciseId: string,
    xpAmount: number
  ): Promise<{
    progress: ExerciseProgress
    leveledUp: boolean
    previousLevel: number
    newTotalXp: number
  }> {
    const data = await this.get()
    
    // Get or create exercise progress
    const currentProgress = data.exercises[exerciseId] || getDefaultExerciseProgress(exerciseId)
    const previousLevel = currentProgress.level
    
    // Add XP
    const newXp = currentProgress.xp + xpAmount
    const newLevel = calculateLevel(newXp)
    
    // Update progress
    const updatedProgress: ExerciseProgress = {
      ...currentProgress,
      xp: newXp,
      level: newLevel,
    }
    
    // Update data
    data.exercises[exerciseId] = updatedProgress
    data.totalXp += xpAmount
    
    // Set started timestamp if first exercise
    if (!data.startedAt) {
      data.startedAt = Date.now()
    }
    
    await this.save(data)
    
    return {
      progress: updatedProgress,
      leveledUp: newLevel > previousLevel,
      previousLevel,
      newTotalXp: data.totalXp,
    }
  },

  /**
   * Unlock an exercise
   */
  async unlockExercise(exerciseId: string): Promise<ExerciseProgress> {
    const data = await this.get()
    
    const currentProgress = data.exercises[exerciseId] || getDefaultExerciseProgress(exerciseId)
    
    if (!currentProgress.unlocked) {
      currentProgress.unlocked = true
      currentProgress.unlockedAt = Date.now()
      data.exercises[exerciseId] = currentProgress
      await this.save(data)
    }
    
    return currentProgress
  },

  /**
   * Unlock an achievement
   */
  async unlockAchievement(achievementId: string): Promise<boolean> {
    const data = await this.get()
    
    // Check if already unlocked
    if (data.achievements.some(a => a.achievementId === achievementId)) {
      return false
    }
    
    const unlocked: UnlockedAchievement = {
      achievementId,
      unlockedAt: Date.now(),
    }
    
    data.achievements.push(unlocked)
    await this.save(data)
    
    return true
  },

  /**
   * Check if an achievement is unlocked
   */
  async isAchievementUnlocked(achievementId: string): Promise<boolean> {
    const data = await this.get()
    return data.achievements.some(a => a.achievementId === achievementId)
  },

  /**
   * Get all unlocked achievement IDs
   */
  async getUnlockedAchievementIds(): Promise<string[]> {
    const data = await this.get()
    return data.achievements.map(a => a.achievementId)
  },

  /**
   * Get count of exercises at or above a certain level
   */
  async getExercisesAtLevel(level: number): Promise<number> {
    const data = await this.get()
    return Object.values(data.exercises).filter(
      p => p.unlocked && p.level >= level
    ).length
  },

  /**
   * Get count of unlocked exercises
   */
  async getUnlockedCount(): Promise<number> {
    const data = await this.get()
    return Object.values(data.exercises).filter(p => p.unlocked).length
  },

  /**
   * Reset all progression data
   */
  async reset(): Promise<void> {
    await this.save({ ...DEFAULT_PROGRESSION })
  },

  /**
   * Listen for changes to progression data
   */
  onChange(callback: (data: ProgressionData) => void): () => void {
    return localStorage.onChange(async (changes) => {
      if (changes[STORAGE_KEY]) {
        const data = await this.get()
        callback(data)
      }
    })
  },
}

