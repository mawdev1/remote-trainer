/**
 * Progression System Types
 * XP, Levels, Unlocks, and Achievements
 */

// ═══════════════════════════════════════════════════════════════════════════════
// XP & LEVELS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * XP thresholds for each level
 * Level 1 starts at 0, Level 10 is mastery
 * 
 * Designed to be challenging:
 * - Level 2 requires 200 reps/seconds
 * - Level 10 (Mastery) requires 12,000 reps/seconds
 */
export const LEVEL_THRESHOLDS = [
  0,      // Level 1: Starting out
  200,    // Level 2: Getting consistent
  600,    // Level 3: Building habit
  1200,   // Level 4: Dedicated
  2000,   // Level 5: Halfway to mastery
  3000,   // Level 6: Advanced
  4000,   // Level 7: Expert territory
  6000,   // Level 8: Veteran status
  8000,   // Level 9: Elite
  12000,  // Level 10: TRUE MASTERY 🏆
] as const

export const MAX_LEVEL = 10

/**
 * Progress data for a single exercise
 */
export interface ExerciseProgress {
  /** Total XP earned for this exercise */
  xp: number
  /** Current level (1-10) */
  level: number
  /** Whether this exercise is unlocked */
  unlocked: boolean
  /** Timestamp when unlocked (undefined if locked or starter) */
  unlockedAt?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNLOCK SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Types of unlock requirements
 */
export type UnlockRequirementType = 
  | 'starter'           // Available from the start
  | 'exercise_level'    // Reach a level in a specific exercise
  | 'total_xp'          // Accumulate total XP across all exercises
  | 'exercises_at_level' // Have N exercises at a certain level
  | 'achievement'       // Unlock a specific achievement

/**
 * Requirement to unlock an exercise
 */
export interface UnlockRequirement {
  type: UnlockRequirementType
  /** For exercise_level: which exercise */
  exerciseId?: string
  /** For exercise_level or exercises_at_level: required level */
  level?: number
  /** For total_xp: XP threshold */
  xpThreshold?: number
  /** For exercises_at_level: how many exercises */
  count?: number
  /** For achievement: which achievement */
  achievementId?: string
  /** Human-readable description */
  description: string
}

/**
 * Unlock configuration for an exercise
 */
export interface ExerciseUnlockConfig {
  exerciseId: string
  requirement: UnlockRequirement
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Achievement categories
 */
export type AchievementCategory = 
  | 'getting_started'
  | 'leveling'
  | 'dedication'
  | 'variety'
  | 'mastery'

/**
 * Achievement condition types
 */
export type AchievementConditionType =
  | 'first_exercise'      // Log any exercise
  | 'total_xp'            // Reach total XP
  | 'exercise_level'      // Reach level in any exercise
  | 'specific_level'      // Reach level in specific exercise
  | 'exercises_unlocked'  // Unlock N exercises
  | 'all_unlocked'        // Unlock all exercises
  | 'daily_xp'            // Earn N XP in one day
  | 'exercises_in_day'    // Do N different exercises in one day
  | 'streak'              // N day streak (for future)
  | 'max_level'           // Reach max level in any exercise
  | 'multi_max_level'     // Reach max level in N exercises

/**
 * Condition for unlocking an achievement
 */
export interface AchievementCondition {
  type: AchievementConditionType
  /** Threshold value (XP, level, count, etc.) */
  value?: number
  /** For specific_level: which exercise */
  exerciseId?: string
}

/**
 * Achievement definition
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  condition: AchievementCondition
  /** XP bonus when unlocked */
  xpReward?: number
}

/**
 * Unlocked achievement record
 */
export interface UnlockedAchievement {
  achievementId: string
  unlockedAt: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESSION STATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Complete progression data stored in chrome.storage
 */
export interface ProgressionData {
  /** Progress per exercise ID */
  exercises: Record<string, ExerciseProgress>
  /** List of unlocked achievements */
  achievements: UnlockedAchievement[]
  /** Total XP across all exercises */
  totalXp: number
  /** Timestamp of first exercise ever */
  startedAt?: number
}

/**
 * Default progression data for new users
 */
export const DEFAULT_PROGRESSION: ProgressionData = {
  exercises: {},
  achievements: [],
  totalXp: 0,
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get XP needed for next level
 */
export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return LEVEL_THRESHOLDS[MAX_LEVEL - 1]
  return LEVEL_THRESHOLDS[currentLevel]
}

/**
 * Get XP threshold for current level
 */
export function getXpForCurrentLevel(currentLevel: number): number {
  return LEVEL_THRESHOLDS[currentLevel - 1] || 0
}

/**
 * Calculate progress percentage to next level
 */
export function getLevelProgress(xp: number, level: number): number {
  if (level >= MAX_LEVEL) return 100
  
  const currentThreshold = getXpForCurrentLevel(level)
  const nextThreshold = getXpForNextLevel(level)
  const xpInLevel = xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  
  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
}

/**
 * Get level title/rank name
 */
export function getLevelTitle(level: number): string {
  const titles = [
    'Novice',      // 1
    'Beginner',    // 2
    'Apprentice',  // 3
    'Intermediate',// 4
    'Skilled',     // 5
    'Advanced',    // 6
    'Expert',      // 7
    'Veteran',     // 8
    'Elite',       // 9
    'Master',      // 10
  ]
  return titles[Math.min(level, MAX_LEVEL) - 1] || 'Novice'
}

