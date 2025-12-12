/**
 * Exercise Unlock Configuration
 * 
 * Tier-based system: Every time you reach a new level in ANY exercise,
 * you unlock 3 new exercises (1 Strength, 1 Cardio, 1 Wellness)
 * 
 * TIER STRUCTURE:
 * - Tier 0 (Start): Push-ups, Jumping Jacks, Neck Rolls
 * - Tier 1 (First Lv2): Dumbbell Curls, High Knees, Shoulder Stretch
 * - Tier 2 (First Lv3): Squats, Burpees, Wrist Circles
 * - Tier 3 (First Lv4): Shoulder Press, Jump Squats, Hip Flexor Stretch
 * - Tier 4 (First Lv5): Tricep Dips, Mountain Climbers, Spinal Twist
 * - Tier 5 (First Lv6): Dumbbell Rows, Butt Kicks, Quad Stretch
 * - Tier 6 (First Lv7): Goblet Squats, Jump Lunges, Hamstring Stretch
 * - Tier 7 (First Lv8): Dumbbell Lunges, Skaters, Deep Breathing
 * - Tier 8 (First Lv9): Floor Chest Press, Tuck Jumps, 20-20-20 Rule
 * - Tier 9 (First Lv10): Plank, Star Jumps, Full Body Stretch
 * 
 * BONUS EXERCISES (Total XP milestones):
 * - 5,000 XP: Dumbbell Deadlifts
 * - 10,000 XP: Lateral Raises
 * - 15,000 XP: Hammer Curls
 * - 20,000 XP: Overhead Tricep Extension
 * - 25,000 XP: Dumbbell Flyes
 * - 30,000 XP: Wall Sit
 */

import { ExerciseUnlockConfig } from '@/types/progression'

/**
 * Unlock requirements for each exercise
 */
export const UNLOCK_CONFIG: ExerciseUnlockConfig[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 0 - STARTERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'pushups',
    requirement: {
      type: 'starter',
      description: 'Available from the start',
    },
  },
  {
    exerciseId: 'jumping_jacks',
    requirement: {
      type: 'starter',
      description: 'Available from the start',
    },
  },
  {
    exerciseId: 'neck_rolls',
    requirement: {
      type: 'starter',
      description: 'Available from the start',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1 - First Level 2
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_curls',
    requirement: {
      type: 'exercises_at_level',
      level: 2,
      count: 1,
      description: 'Reach Level 2 in any exercise',
    },
  },
  {
    exerciseId: 'high_knees',
    requirement: {
      type: 'exercises_at_level',
      level: 2,
      count: 1,
      description: 'Reach Level 2 in any exercise',
    },
  },
  {
    exerciseId: 'shoulder_stretch',
    requirement: {
      type: 'exercises_at_level',
      level: 2,
      count: 1,
      description: 'Reach Level 2 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 - First Level 3
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'squats',
    requirement: {
      type: 'exercises_at_level',
      level: 3,
      count: 1,
      description: 'Reach Level 3 in any exercise',
    },
  },
  {
    exerciseId: 'burpees',
    requirement: {
      type: 'exercises_at_level',
      level: 3,
      count: 1,
      description: 'Reach Level 3 in any exercise',
    },
  },
  {
    exerciseId: 'wrist_circles',
    requirement: {
      type: 'exercises_at_level',
      level: 3,
      count: 1,
      description: 'Reach Level 3 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3 - First Level 4
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_shoulder_press',
    requirement: {
      type: 'exercises_at_level',
      level: 4,
      count: 1,
      description: 'Reach Level 4 in any exercise',
    },
  },
  {
    exerciseId: 'jump_squats',
    requirement: {
      type: 'exercises_at_level',
      level: 4,
      count: 1,
      description: 'Reach Level 4 in any exercise',
    },
  },
  {
    exerciseId: 'hip_flexor_stretch',
    requirement: {
      type: 'exercises_at_level',
      level: 4,
      count: 1,
      description: 'Reach Level 4 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4 - First Level 5
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'tricep_dips',
    requirement: {
      type: 'exercises_at_level',
      level: 5,
      count: 1,
      description: 'Reach Level 5 in any exercise',
    },
  },
  {
    exerciseId: 'mountain_climbers',
    requirement: {
      type: 'exercises_at_level',
      level: 5,
      count: 1,
      description: 'Reach Level 5 in any exercise',
    },
  },
  {
    exerciseId: 'spinal_twist',
    requirement: {
      type: 'exercises_at_level',
      level: 5,
      count: 1,
      description: 'Reach Level 5 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 5 - First Level 6
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_rows',
    requirement: {
      type: 'exercises_at_level',
      level: 6,
      count: 1,
      description: 'Reach Level 6 in any exercise',
    },
  },
  {
    exerciseId: 'butt_kicks',
    requirement: {
      type: 'exercises_at_level',
      level: 6,
      count: 1,
      description: 'Reach Level 6 in any exercise',
    },
  },
  {
    exerciseId: 'quad_stretch',
    requirement: {
      type: 'exercises_at_level',
      level: 6,
      count: 1,
      description: 'Reach Level 6 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 6 - First Level 7
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'goblet_squats',
    requirement: {
      type: 'exercises_at_level',
      level: 7,
      count: 1,
      description: 'Reach Level 7 in any exercise',
    },
  },
  {
    exerciseId: 'jump_lunges',
    requirement: {
      type: 'exercises_at_level',
      level: 7,
      count: 1,
      description: 'Reach Level 7 in any exercise',
    },
  },
  {
    exerciseId: 'hamstring_stretch',
    requirement: {
      type: 'exercises_at_level',
      level: 7,
      count: 1,
      description: 'Reach Level 7 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 7 - First Level 8
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_lunges',
    requirement: {
      type: 'exercises_at_level',
      level: 8,
      count: 1,
      description: 'Reach Level 8 in any exercise',
    },
  },
  {
    exerciseId: 'skaters',
    requirement: {
      type: 'exercises_at_level',
      level: 8,
      count: 1,
      description: 'Reach Level 8 in any exercise',
    },
  },
  {
    exerciseId: 'deep_breathing',
    requirement: {
      type: 'exercises_at_level',
      level: 8,
      count: 1,
      description: 'Reach Level 8 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 8 - First Level 9
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_chest_press',
    requirement: {
      type: 'exercises_at_level',
      level: 9,
      count: 1,
      description: 'Reach Level 9 in any exercise',
    },
  },
  {
    exerciseId: 'tuck_jumps',
    requirement: {
      type: 'exercises_at_level',
      level: 9,
      count: 1,
      description: 'Reach Level 9 in any exercise',
    },
  },
  {
    exerciseId: 'eye_20_20_20',
    requirement: {
      type: 'exercises_at_level',
      level: 9,
      count: 1,
      description: 'Reach Level 9 in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 9 - First Level 10 (MASTERY!)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'plank',
    requirement: {
      type: 'exercises_at_level',
      level: 10,
      count: 1,
      description: 'Reach Level 10 (Master) in any exercise',
    },
  },
  {
    exerciseId: 'star_jumps',
    requirement: {
      type: 'exercises_at_level',
      level: 10,
      count: 1,
      description: 'Reach Level 10 (Master) in any exercise',
    },
  },
  {
    exerciseId: 'full_body_stretch',
    requirement: {
      type: 'exercises_at_level',
      level: 10,
      count: 1,
      description: 'Reach Level 10 (Master) in any exercise',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BONUS TIER - Total XP Milestones
  // ═══════════════════════════════════════════════════════════════════════════
  {
    exerciseId: 'dumbbell_deadlifts',
    requirement: {
      type: 'total_xp',
      xpThreshold: 5000,
      description: 'Earn 5,000 total XP',
    },
  },
  {
    exerciseId: 'lateral_raises',
    requirement: {
      type: 'total_xp',
      xpThreshold: 10000,
      description: 'Earn 10,000 total XP',
    },
  },
  {
    exerciseId: 'hammer_curls',
    requirement: {
      type: 'total_xp',
      xpThreshold: 15000,
      description: 'Earn 15,000 total XP',
    },
  },
  {
    exerciseId: 'overhead_tricep_extension',
    requirement: {
      type: 'total_xp',
      xpThreshold: 20000,
      description: 'Earn 20,000 total XP',
    },
  },
  {
    exerciseId: 'dumbbell_flyes',
    requirement: {
      type: 'total_xp',
      xpThreshold: 25000,
      description: 'Earn 25,000 total XP',
    },
  },
  {
    exerciseId: 'wall_sit',
    requirement: {
      type: 'total_xp',
      xpThreshold: 30000,
      description: 'Earn 30,000 total XP',
    },
  },
  {
    exerciseId: 'crunches',
    requirement: {
      type: 'total_xp',
      xpThreshold: 35000,
      description: 'Earn 35,000 total XP',
    },
  },
  {
    exerciseId: 'bicycle_crunches',
    requirement: {
      type: 'total_xp',
      xpThreshold: 40000,
      description: 'Earn 40,000 total XP',
    },
  },
  {
    exerciseId: 'cat_cow_stretch',
    requirement: {
      type: 'total_xp',
      xpThreshold: 45000,
      description: 'Earn 45,000 total XP',
    },
  },
  {
    exerciseId: 'russian_twists',
    requirement: {
      type: 'total_xp',
      xpThreshold: 50000,
      description: 'Earn 50,000 total XP',
    },
  },
  {
    exerciseId: 'speed_skaters',
    requirement: {
      type: 'total_xp',
      xpThreshold: 60000,
      description: 'Earn 60,000 total XP',
    },
  },
  {
    exerciseId: 'childs_pose',
    requirement: {
      type: 'total_xp',
      xpThreshold: 75000,
      description: 'Earn 75,000 total XP',
    },
  },
]

/**
 * Get unlock config for a specific exercise
 */
export function getUnlockConfig(exerciseId: string): ExerciseUnlockConfig | undefined {
  return UNLOCK_CONFIG.find(c => c.exerciseId === exerciseId)
}

/**
 * Get all starter exercises
 */
export function getStarterExercises(): string[] {
  return UNLOCK_CONFIG
    .filter(c => c.requirement.type === 'starter')
    .map(c => c.exerciseId)
}

/**
 * Check if an exercise is a starter (unlocked by default)
 */
export function isStarterExercise(exerciseId: string): boolean {
  const config = getUnlockConfig(exerciseId)
  return config?.requirement.type === 'starter'
}

/**
 * Get exercises unlocked at a specific level tier
 */
export function getExercisesForLevelTier(level: number): string[] {
  return UNLOCK_CONFIG
    .filter(c => 
      c.requirement.type === 'exercises_at_level' && 
      c.requirement.level === level &&
      c.requirement.count === 1
    )
    .map(c => c.exerciseId)
}

/**
 * Get the tier (level requirement) for an exercise
 */
export function getExerciseTier(exerciseId: string): number | null {
  const config = getUnlockConfig(exerciseId)
  if (!config) return null
  if (config.requirement.type === 'starter') return 0
  if (config.requirement.type === 'exercises_at_level') {
    return config.requirement.level || null
  }
  return null
}
