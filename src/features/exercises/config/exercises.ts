/**
 * Exercise Registry
 * 
 * Central configuration for all supported exercises.
 * Organized into 3 categories that unlock together:
 * - Strength (includes dumbbell exercises)
 * - Cardio
 * - Wellness (stretches + eye care)
 */

import { ExerciseDefinition, ExerciseCategory } from '@/types'

/**
 * All available exercises in the app
 * Organized by unlock tier (0 = starter, 1-9 = unlocked by reaching levels 2-10)
 */
export const EXERCISE_REGISTRY: ExerciseDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 0 - STARTERS (Available from the beginning)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength Starter
  {
    id: 'pushups',
    name: 'Push-ups',
    subtitle: 'Classic upper body builder',
    icon: '💪',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#ef4444',
    colorEnd: '#dc2626',
    defaultQuickOptions: [10, 15, 20, 25, 30],
    enabledByDefault: true,
  },
  // Cardio Starter
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    subtitle: 'Classic cardio warmup',
    icon: '⭐',
    category: 'cardio',
    trackingType: 'reps',
    color: '#f59e0b',
    colorEnd: '#d97706',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: true,
  },
  // Wellness Starter
  {
    id: 'neck_rolls',
    name: 'Neck Rolls',
    subtitle: 'Release neck tension',
    icon: '🔄',
    category: 'stretch',
    trackingType: 'duration',
    color: '#8b5cf6',
    colorEnd: '#7c3aed',
    defaultQuickOptions: [15, 30, 45, 60, 90],
    enabledByDefault: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1 - Unlocked when ANY exercise reaches Level 2
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Dumbbell Curls
  {
    id: 'dumbbell_curls',
    name: 'Dumbbell Curls',
    subtitle: 'Bicep builder with weights',
    icon: '🏋️',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#3b82f6',
    colorEnd: '#2563eb',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - High Knees
  {
    id: 'high_knees',
    name: 'High Knees',
    subtitle: 'Running in place, knees up!',
    icon: '🏃',
    category: 'cardio',
    trackingType: 'reps',
    color: '#06b6d4',
    colorEnd: '#0891b2',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Wellness - Shoulder Stretch
  {
    id: 'shoulder_stretch',
    name: 'Shoulder Stretch',
    subtitle: 'Cross-body shoulder relief',
    icon: '💆',
    category: 'stretch',
    trackingType: 'duration',
    color: '#a855f7',
    colorEnd: '#9333ea',
    defaultQuickOptions: [15, 30, 45, 60, 90],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 - Unlocked when ANY exercise reaches Level 3
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Squats
  {
    id: 'squats',
    name: 'Squats',
    subtitle: 'King of leg exercises',
    icon: '🦵',
    category: 'lower_body',
    trackingType: 'reps',
    color: '#22c55e',
    colorEnd: '#16a34a',
    defaultQuickOptions: [10, 15, 20, 25, 30],
    enabledByDefault: false,
  },
  // Cardio - Burpees
  {
    id: 'burpees',
    name: 'Burpees',
    subtitle: 'Full body cardio blast',
    icon: '💥',
    category: 'cardio',
    trackingType: 'reps',
    color: '#f43f5e',
    colorEnd: '#e11d48',
    defaultQuickOptions: [5, 8, 10, 12, 15],
    enabledByDefault: false,
  },
  // Wellness - Wrist Circles
  {
    id: 'wrist_circles',
    name: 'Wrist Circles',
    subtitle: 'Essential for keyboard warriors',
    icon: '🖐️',
    category: 'stretch',
    trackingType: 'duration',
    color: '#ec4899',
    colorEnd: '#db2777',
    defaultQuickOptions: [15, 30, 45, 60, 90],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3 - Unlocked when ANY exercise reaches Level 4
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Dumbbell Shoulder Press
  {
    id: 'dumbbell_shoulder_press',
    name: 'Shoulder Press',
    subtitle: 'Overhead dumbbell press',
    icon: '🔱',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#0ea5e9',
    colorEnd: '#0284c7',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - Jump Squats
  {
    id: 'jump_squats',
    name: 'Jump Squats',
    subtitle: 'Explosive leg power',
    icon: '🦘',
    category: 'cardio',
    trackingType: 'reps',
    color: '#84cc16',
    colorEnd: '#65a30d',
    defaultQuickOptions: [10, 15, 20, 25, 30],
    enabledByDefault: false,
  },
  // Wellness - Hip Flexor Stretch
  {
    id: 'hip_flexor_stretch',
    name: 'Hip Flexor Stretch',
    subtitle: 'Open up those hips',
    icon: '🧘',
    category: 'stretch',
    trackingType: 'duration',
    color: '#14b8a6',
    colorEnd: '#0d9488',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4 - Unlocked when ANY exercise reaches Level 5
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Tricep Dips
  {
    id: 'tricep_dips',
    name: 'Tricep Dips',
    subtitle: 'Chair or bench dips',
    icon: '💺',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#f97316',
    colorEnd: '#ea580c',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
  },
  // Cardio - Mountain Climbers
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    subtitle: 'Core + cardio combo',
    icon: '⛰️',
    category: 'cardio',
    trackingType: 'reps',
    color: '#64748b',
    colorEnd: '#475569',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Wellness - Spinal Twist
  {
    id: 'spinal_twist',
    name: 'Seated Spinal Twist',
    subtitle: 'Rotate and decompress',
    icon: '🌀',
    category: 'stretch',
    trackingType: 'duration',
    color: '#6366f1',
    colorEnd: '#4f46e5',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 5 - Unlocked when ANY exercise reaches Level 6
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Dumbbell Rows
  {
    id: 'dumbbell_rows',
    name: 'Dumbbell Rows',
    subtitle: 'Build a strong back',
    icon: '🚣',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#059669',
    colorEnd: '#047857',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - Butt Kicks
  {
    id: 'butt_kicks',
    name: 'Butt Kicks',
    subtitle: 'Kick your heels to your glutes',
    icon: '🦶',
    category: 'cardio',
    trackingType: 'reps',
    color: '#eab308',
    colorEnd: '#ca8a04',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Wellness - Quad Stretch
  {
    id: 'quad_stretch',
    name: 'Standing Quad Stretch',
    subtitle: 'Balance and stretch',
    icon: '🦩',
    category: 'stretch',
    trackingType: 'duration',
    color: '#f472b6',
    colorEnd: '#ec4899',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 6 - Unlocked when ANY exercise reaches Level 7
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Goblet Squats
  {
    id: 'goblet_squats',
    name: 'Goblet Squats',
    subtitle: 'Dumbbell-loaded squats',
    icon: '🏆',
    category: 'lower_body',
    trackingType: 'reps',
    color: '#8b5cf6',
    colorEnd: '#7c3aed',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - Jump Lunges
  {
    id: 'jump_lunges',
    name: 'Jump Lunges',
    subtitle: 'Explosive alternating lunges',
    icon: '🔥',
    category: 'cardio',
    trackingType: 'reps',
    color: '#ef4444',
    colorEnd: '#dc2626',
    defaultQuickOptions: [10, 16, 20, 24, 30],
    enabledByDefault: false,
  },
  // Wellness - Hamstring Stretch
  {
    id: 'hamstring_stretch',
    name: 'Hamstring Stretch',
    subtitle: 'Touch those toes',
    icon: '🙆',
    category: 'stretch',
    trackingType: 'duration',
    color: '#10b981',
    colorEnd: '#059669',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 7 - Unlocked when ANY exercise reaches Level 8
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Dumbbell Lunges
  {
    id: 'dumbbell_lunges',
    name: 'Dumbbell Lunges',
    subtitle: 'Weighted walking lunges',
    icon: '🚶',
    category: 'lower_body',
    trackingType: 'reps',
    color: '#0891b2',
    colorEnd: '#0e7490',
    defaultQuickOptions: [10, 12, 16, 20, 24],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - Skaters
  {
    id: 'skaters',
    name: 'Skaters',
    subtitle: 'Side-to-side skating motion',
    icon: '⛸️',
    category: 'cardio',
    trackingType: 'reps',
    color: '#06b6d4',
    colorEnd: '#0891b2',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Wellness - Deep Breathing
  {
    id: 'deep_breathing',
    name: 'Deep Breathing',
    subtitle: 'Box breathing for calm',
    icon: '🌬️',
    category: 'stretch',
    trackingType: 'duration',
    color: '#38bdf8',
    colorEnd: '#0ea5e9',
    defaultQuickOptions: [60, 90, 120, 180, 300],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 8 - Unlocked when ANY exercise reaches Level 9
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Dumbbell Chest Press
  {
    id: 'dumbbell_chest_press',
    name: 'Floor Chest Press',
    subtitle: 'Dumbbell press on floor',
    icon: '🛋️',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#dc2626',
    colorEnd: '#b91c1c',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Cardio - Tuck Jumps
  {
    id: 'tuck_jumps',
    name: 'Tuck Jumps',
    subtitle: 'Jump and tuck knees to chest',
    icon: '🎯',
    category: 'cardio',
    trackingType: 'reps',
    color: '#7c3aed',
    colorEnd: '#6d28d9',
    defaultQuickOptions: [5, 8, 10, 12, 15],
    enabledByDefault: false,
  },
  // Wellness - 20-20-20 Rule
  {
    id: 'eye_20_20_20',
    name: '20-20-20 Rule',
    subtitle: 'Look 20ft away for 20sec',
    icon: '👁️',
    category: 'eyes',
    trackingType: 'duration',
    color: '#0ea5e9',
    colorEnd: '#0284c7',
    defaultQuickOptions: [20],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 9 - Unlocked when ANY exercise reaches Level 10 (MASTERY!)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Strength - Plank
  {
    id: 'plank',
    name: 'Plank',
    subtitle: 'Ultimate core stability',
    icon: '🧱',
    category: 'core',
    trackingType: 'duration',
    color: '#fbbf24',
    colorEnd: '#f59e0b',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },
  // Cardio - Star Jumps
  {
    id: 'star_jumps',
    name: 'Star Jumps',
    subtitle: 'Explode into a star shape',
    icon: '🌟',
    category: 'cardio',
    trackingType: 'reps',
    color: '#fcd34d',
    colorEnd: '#fbbf24',
    defaultQuickOptions: [10, 15, 20, 25, 30],
    enabledByDefault: false,
  },
  // Wellness - Full Body Stretch
  {
    id: 'full_body_stretch',
    name: 'Full Body Stretch',
    subtitle: 'Complete relaxation routine',
    icon: '🧘‍♀️',
    category: 'stretch',
    trackingType: 'duration',
    color: '#a78bfa',
    colorEnd: '#8b5cf6',
    defaultQuickOptions: [120, 180, 240, 300, 600],
    enabledByDefault: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BONUS TIER - Unlocked at specific milestones
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Unlocked at 5,000 total XP - Advanced Dumbbell
  {
    id: 'dumbbell_deadlifts',
    name: 'Dumbbell Deadlifts',
    subtitle: 'Hip hinge with weights',
    icon: '🏗️',
    category: 'lower_body',
    trackingType: 'reps',
    color: '#78716c',
    colorEnd: '#57534e',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Unlocked at 10,000 total XP - Lateral Raises
  {
    id: 'lateral_raises',
    name: 'Lateral Raises',
    subtitle: 'Dumbbell shoulder isolation',
    icon: '🦅',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#2dd4bf',
    colorEnd: '#14b8a6',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Unlocked at 15,000 total XP - Hammer Curls
  {
    id: 'hammer_curls',
    name: 'Hammer Curls',
    subtitle: 'Neutral grip dumbbell curls',
    icon: '🔨',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#a3a3a3',
    colorEnd: '#737373',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Unlocked at 20,000 total XP - Overhead Tricep Extension
  {
    id: 'overhead_tricep_extension',
    name: 'Tricep Extension',
    subtitle: 'Overhead dumbbell extension',
    icon: '🎪',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#fb923c',
    colorEnd: '#f97316',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Unlocked at 25,000 total XP - Dumbbell Flyes
  {
    id: 'dumbbell_flyes',
    name: 'Floor Dumbbell Flyes',
    subtitle: 'Chest isolation on floor',
    icon: '🦋',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#c084fc',
    colorEnd: '#a855f7',
    defaultQuickOptions: [8, 10, 12, 15, 20],
    enabledByDefault: false,
    requiresWeight: true,
  },
  // Unlocked at 30,000 total XP - Wall Sit
  {
    id: 'wall_sit',
    name: 'Wall Sit',
    subtitle: 'Isometric leg burner',
    icon: '🧱',
    category: 'lower_body',
    trackingType: 'duration',
    color: '#facc15',
    colorEnd: '#eab308',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },
  // Unlocked at 35,000 total XP - Crunches
  {
    id: 'crunches',
    name: 'Crunches',
    subtitle: 'Classic core builder',
    icon: '🔥',
    category: 'core',
    trackingType: 'reps',
    color: '#f97316',
    colorEnd: '#ea580c',
    defaultQuickOptions: [15, 20, 25, 30, 40],
    enabledByDefault: false,
  },
  // Unlocked at 40,000 total XP - Bicycle Crunches
  {
    id: 'bicycle_crunches',
    name: 'Bicycle Crunches',
    subtitle: 'Cardio core combo',
    icon: '🚴',
    category: 'cardio',
    trackingType: 'reps',
    color: '#10b981',
    colorEnd: '#059669',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Unlocked at 45,000 total XP - Cat-Cow Stretch
  {
    id: 'cat_cow_stretch',
    name: 'Cat-Cow Stretch',
    subtitle: 'Spinal mobility flow',
    icon: '🐱',
    category: 'stretch',
    trackingType: 'duration',
    color: '#f472b6',
    colorEnd: '#ec4899',
    defaultQuickOptions: [30, 45, 60, 90, 120],
    enabledByDefault: false,
  },
  // Unlocked at 50,000 total XP - Russian Twists
  {
    id: 'russian_twists',
    name: 'Russian Twists',
    subtitle: 'Oblique obliterator',
    icon: '🌀',
    category: 'core',
    trackingType: 'reps',
    color: '#ef4444',
    colorEnd: '#dc2626',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Unlocked at 60,000 total XP - Speed Skaters
  {
    id: 'speed_skaters',
    name: 'Speed Skaters',
    subtitle: 'Explosive lateral cardio',
    icon: '⚡',
    category: 'cardio',
    trackingType: 'reps',
    color: '#fbbf24',
    colorEnd: '#f59e0b',
    defaultQuickOptions: [20, 30, 40, 50, 60],
    enabledByDefault: false,
  },
  // Unlocked at 75,000 total XP - Child's Pose
  {
    id: 'childs_pose',
    name: "Child's Pose",
    subtitle: 'Restorative rest position',
    icon: '🙏',
    category: 'stretch',
    trackingType: 'duration',
    color: '#818cf8',
    colorEnd: '#6366f1',
    defaultQuickOptions: [30, 60, 90, 120, 180],
    enabledByDefault: false,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get an exercise definition by ID
 */
export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return EXERCISE_REGISTRY.find(e => e.id === id)
}

/**
 * Get all exercises that are enabled by default
 */
export function getDefaultEnabledExercises(): ExerciseDefinition[] {
  return EXERCISE_REGISTRY.filter(e => e.enabledByDefault)
}

/**
 * Get all exercises (regardless of enabled status)
 */
export function getAllExercises(): ExerciseDefinition[] {
  return [...EXERCISE_REGISTRY]
}

/**
 * Get exercises filtered by category
 */
export function getExercisesByCategory(category: ExerciseCategory): ExerciseDefinition[] {
  return EXERCISE_REGISTRY.filter(e => e.category === category)
}

/**
 * Get all unique categories that have exercises
 */
export function getActiveCategories(): ExerciseCategory[] {
  const categories = new Set(EXERCISE_REGISTRY.map(e => e.category))
  return Array.from(categories)
}

/**
 * Get exercise IDs that are enabled by default
 */
export function getDefaultEnabledIds(): string[] {
  return getDefaultEnabledExercises().map(e => e.id)
}

/**
 * Check if an exercise ID exists in the registry
 */
export function isValidExerciseId(id: string): boolean {
  return EXERCISE_REGISTRY.some(e => e.id === id)
}

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  upper_body: 'Upper Body',
  lower_body: 'Lower Body',
  core: 'Core',
  cardio: 'Cardio',
  stretch: 'Stretches',
  eyes: 'Eye Care',
}
