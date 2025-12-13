/**
 * Streak System Types
 * Track consecutive days of exercise activity
 */

/**
 * Streak tier based on length
 */
export type StreakTier = 'none' | 'small' | 'medium' | 'large' | 'epic'

/**
 * Streak data stored in chrome.storage
 */
export interface StreakData {
  /** Current streak count (consecutive days) */
  current: number
  /** Longest streak ever achieved */
  longest: number
  /** Local ISO date key of last active day (YYYY-MM-DD) */
  lastActiveDate: string | null
  /** Number of streak freezes remaining this week */
  freezesRemaining: number
  /** Local ISO date key of when freezes were last reset */
  freezesResetDate: string | null
  /** Array of dates where freezes were used (local ISO date keys) */
  frozenDates: string[]
  /** Timestamp when streak system was initialized */
  startedAt?: number
}

/**
 * Default streak data for new users
 */
export const DEFAULT_STREAK_DATA: StreakData = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  freezesRemaining: 2,
  freezesResetDate: null,
  frozenDates: [],
}

/**
 * Streak milestone thresholds
 */
export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365] as const
export type StreakMilestone = typeof STREAK_MILESTONES[number]

/**
 * Get streak tier based on current streak count
 */
export function getStreakTier(streak: number): StreakTier {
  if (streak <= 0) return 'none'
  if (streak < 7) return 'small'
  if (streak < 14) return 'medium'
  if (streak < 30) return 'large'
  return 'epic'
}

/**
 * Get the next milestone for a given streak count
 */
export function getNextMilestone(streak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak < milestone) return milestone
  }
  return null
}

/**
 * Check if streak count is a milestone
 */
export function isMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak as StreakMilestone)
}

/**
 * Get streak flame intensity (1-4) for visual scaling
 */
export function getFlameIntensity(streak: number): number {
  const tier = getStreakTier(streak)
  switch (tier) {
    case 'none': return 0
    case 'small': return 1
    case 'medium': return 2
    case 'large': return 3
    case 'epic': return 4
  }
}

