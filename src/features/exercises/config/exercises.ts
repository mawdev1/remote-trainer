/**
 * Exercise Registry
 * 
 * Central configuration for all supported exercises.
 * To add a new exercise, simply add it to this array.
 * The storage and UI will automatically pick it up.
 */

import { ExerciseDefinition, ExerciseCategory } from '@/types'

/**
 * All available exercises in the app
 */
export const EXERCISE_REGISTRY: ExerciseDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // UPPER BODY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'pushups',
    name: 'Push-ups',
    subtitle: 'Upper body strength',
    icon: '💪',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#ff6b6b',
    colorEnd: '#ee5a24',
    defaultQuickOptions: [15, 20, 25, 30, 35],
    enabledByDefault: true,
  },
  {
    id: 'arm_curls',
    name: 'Arm Curls',
    subtitle: 'Bicep training with dumbbells',
    icon: '🏋️',
    category: 'upper_body',
    trackingType: 'reps',
    color: '#4ecdc4',
    colorEnd: '#44a08d',
    defaultQuickOptions: [6, 8, 10, 12, 21],
    enabledByDefault: true,
  },
  // Future exercises can be added here:
  // {
  //   id: 'tricep_dips',
  //   name: 'Tricep Dips',
  //   subtitle: 'Chair or desk dips',
  //   icon: '💺',
  //   category: 'upper_body',
  //   trackingType: 'reps',
  //   color: '#f39c12',
  //   colorEnd: '#e67e22',
  //   defaultQuickOptions: [8, 10, 12, 15, 20],
  //   enabledByDefault: false,
  // },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOWER BODY
  // ═══════════════════════════════════════════════════════════════════════════
  // {
  //   id: 'squats',
  //   name: 'Squats',
  //   subtitle: 'Lower body strength',
  //   icon: '🦵',
  //   category: 'lower_body',
  //   trackingType: 'reps',
  //   color: '#3498db',
  //   colorEnd: '#2980b9',
  //   defaultQuickOptions: [10, 15, 20, 25, 30],
  //   enabledByDefault: false,
  // },

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE
  // ═══════════════════════════════════════════════════════════════════════════
  // {
  //   id: 'plank',
  //   name: 'Plank',
  //   subtitle: 'Core stability hold',
  //   icon: '🧘',
  //   category: 'core',
  //   trackingType: 'duration',  // Measured in seconds!
  //   color: '#9b59b6',
  //   colorEnd: '#8e44ad',
  //   defaultQuickOptions: [30, 45, 60, 90, 120],
  //   enabledByDefault: false,
  // },
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

