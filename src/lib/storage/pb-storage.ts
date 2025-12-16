/**
 * Personal Best Storage
 * Handles persistence and checking of personal bests
 * 
 * For non-weighted exercises: tracks highest single rep count or longest duration
 * For weighted exercises: tracks PBs per weight level
 */

import { PersonalBest, ExercisePersonalBests } from '@/types'
import { getExerciseById } from '@/features/exercises'
import { localStorage } from './chrome-storage'

const STORAGE_KEY = 'extFlex_personal_bests'

/**
 * Result of checking/updating a personal best
 */
export interface PBCheckResult {
  /** Whether a new PB was achieved */
  isNewPB: boolean
  /** The new PB record (if achieved) */
  newPB?: PersonalBest
  /** The previous PB (if one existed) */
  previousPB?: PersonalBest
}

/**
 * Personal Best Storage API
 */
export const pbStorage = {
  /**
   * Get all personal bests from storage
   */
  async getAllPersonalBests(): Promise<Record<string, ExercisePersonalBests>> {
    const data = await localStorage.get<Record<string, ExercisePersonalBests>>(STORAGE_KEY)
    return data || {}
  },

  /**
   * Get personal bests for a specific exercise
   * @param exerciseId - The exercise ID
   */
  async getPersonalBests(exerciseId: string): Promise<ExercisePersonalBests | null> {
    const all = await this.getAllPersonalBests()
    return all[exerciseId] || null
  },

  /**
   * Get the current PB for an exercise (optionally at a specific weight)
   * @param exerciseId - The exercise ID
   * @param weight - Optional weight level for weighted exercises
   */
  async getCurrentPB(exerciseId: string, weight?: number): Promise<PersonalBest | null> {
    const exercisePBs = await this.getPersonalBests(exerciseId)
    if (!exercisePBs) return null

    const exercise = getExerciseById(exerciseId)
    const isWeighted = exercise?.requiresWeight

    if (isWeighted && weight !== undefined) {
      return exercisePBs.weightedPbs?.[String(weight)] || null
    }

    return exercisePBs.pb || null
  },

  /**
   * Check if a new value is a personal best and update if so
   * @param exerciseId - The exercise ID
   * @param value - The value achieved (reps or duration)
   * @param weight - Optional weight for weighted exercises
   */
  async checkAndUpdatePB(
    exerciseId: string,
    value: number,
    weight?: number
  ): Promise<PBCheckResult> {
    const exercise = getExerciseById(exerciseId)
    if (!exercise) {
      return { isNewPB: false }
    }

    const isWeighted = exercise.requiresWeight
    const all = await this.getAllPersonalBests()
    const exercisePBs: ExercisePersonalBests = all[exerciseId] || { exerciseId }

    let previousPB: PersonalBest | undefined
    let isNewPB = false

    if (isWeighted && weight !== undefined) {
      // Weighted exercise - check PB for this weight level
      const weightKey = String(weight)
      previousPB = exercisePBs.weightedPbs?.[weightKey]

      if (!previousPB || value > previousPB.value) {
        isNewPB = true
        const newPB: PersonalBest = {
          value,
          timestamp: Date.now(),
          weight,
        }

        exercisePBs.weightedPbs = exercisePBs.weightedPbs || {}
        exercisePBs.weightedPbs[weightKey] = newPB

        all[exerciseId] = exercisePBs
        await localStorage.set(STORAGE_KEY, all)

        return { isNewPB, newPB, previousPB }
      }
    } else {
      // Non-weighted exercise - check single PB
      previousPB = exercisePBs.pb

      if (!previousPB || value > previousPB.value) {
        isNewPB = true
        const newPB: PersonalBest = {
          value,
          timestamp: Date.now(),
        }

        exercisePBs.pb = newPB

        all[exerciseId] = exercisePBs
        await localStorage.set(STORAGE_KEY, all)

        return { isNewPB, newPB, previousPB }
      }
    }

    return { isNewPB: false, previousPB }
  },

  /**
   * Get all PBs for a weighted exercise (at all weight levels)
   * @param exerciseId - The exercise ID
   */
  async getWeightedPBs(exerciseId: string): Promise<Record<string, PersonalBest>> {
    const exercisePBs = await this.getPersonalBests(exerciseId)
    return exercisePBs?.weightedPbs || {}
  },

  /**
   * Get the highest PB across all weights for a weighted exercise
   * Useful for displaying "overall best"
   * @param exerciseId - The exercise ID
   */
  async getHighestWeightedPB(exerciseId: string): Promise<PersonalBest | null> {
    const weightedPBs = await this.getWeightedPBs(exerciseId)
    const pbs = Object.values(weightedPBs)
    
    if (pbs.length === 0) return null

    return pbs.reduce((highest, current) => 
      current.value > highest.value ? current : highest
    )
  },

  /**
   * Clear all personal bests (for data reset)
   */
  async clearAllPBs(): Promise<void> {
    await localStorage.remove(STORAGE_KEY)
  },

  /**
   * Clear personal bests for a specific exercise
   * @param exerciseId - The exercise ID
   */
  async clearExercisePBs(exerciseId: string): Promise<void> {
    const all = await this.getAllPersonalBests()
    delete all[exerciseId]
    await localStorage.set(STORAGE_KEY, all)
  },
}
