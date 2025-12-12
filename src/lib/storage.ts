/**
 * @deprecated Import from '@/lib/storage' folder instead
 * This file is kept for backwards compatibility
 */

// Re-export everything from the new storage module
export * from './storage/index'

// Legacy type aliases for backwards compatibility
import type { ExerciseEntry, ExerciseStats } from '@/types'

/** @deprecated Use ExerciseEntry from '@/types' */
export type { ExerciseEntry, ExerciseStats }

/** @deprecated Use string instead - exercise types are now dynamic */
export type ExerciseType = string
