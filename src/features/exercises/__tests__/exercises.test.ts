/**
 * Exercise Registry Tests
 */

import {
  EXERCISE_REGISTRY,
  getExerciseById,
  getDefaultEnabledExercises,
  getAllExercises,
  getExercisesByCategory,
  getActiveCategories,
  getDefaultEnabledIds,
  isValidExerciseId,
  CATEGORY_LABELS,
} from '../config/exercises'

describe('Exercise Registry', () => {
  describe('EXERCISE_REGISTRY', () => {
    it('should have at least one exercise', () => {
      expect(EXERCISE_REGISTRY.length).toBeGreaterThan(0)
    })

    it('should have unique IDs', () => {
      const ids = EXERCISE_REGISTRY.map((e) => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have required fields for each exercise', () => {
      EXERCISE_REGISTRY.forEach((exercise) => {
        expect(exercise.id).toBeDefined()
        expect(exercise.name).toBeDefined()
        expect(exercise.icon).toBeDefined()
        expect(exercise.category).toBeDefined()
        expect(exercise.trackingType).toMatch(/^(reps|duration)$/)
        expect(exercise.color).toMatch(/^#[0-9a-f]{6}$/i)
        expect(exercise.colorEnd).toMatch(/^#[0-9a-f]{6}$/i)
        expect(exercise.defaultQuickOptions.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getExerciseById', () => {
    it('should return exercise when ID exists', () => {
      const exercise = getExerciseById('pushups')
      expect(exercise).toBeDefined()
      expect(exercise?.name).toBe('Push-ups')
    })

    it('should return undefined for non-existent ID', () => {
      const exercise = getExerciseById('nonexistent')
      expect(exercise).toBeUndefined()
    })
  })

  describe('getDefaultEnabledExercises', () => {
    it('should return only exercises with enabledByDefault true', () => {
      const enabled = getDefaultEnabledExercises()
      enabled.forEach((exercise) => {
        expect(exercise.enabledByDefault).toBe(true)
      })
    })

    it('should return at least one exercise', () => {
      const enabled = getDefaultEnabledExercises()
      expect(enabled.length).toBeGreaterThan(0)
    })
  })

  describe('getAllExercises', () => {
    it('should return all exercises from registry', () => {
      const all = getAllExercises()
      expect(all.length).toBe(EXERCISE_REGISTRY.length)
    })

    it('should return a copy, not the original array', () => {
      const all = getAllExercises()
      all.push({} as any)
      expect(EXERCISE_REGISTRY.length).toBeLessThan(all.length)
    })
  })

  describe('getExercisesByCategory', () => {
    it('should return exercises filtered by category', () => {
      const upperBody = getExercisesByCategory('upper_body')
      upperBody.forEach((exercise) => {
        expect(exercise.category).toBe('upper_body')
      })
    })

    it('should return empty array for unused category', () => {
      const eyes = getExercisesByCategory('eyes')
      // May be empty if no eye exercises defined
      eyes.forEach((exercise) => {
        expect(exercise.category).toBe('eyes')
      })
    })
  })

  describe('getActiveCategories', () => {
    it('should return unique categories', () => {
      const categories = getActiveCategories()
      const unique = new Set(categories)
      expect(unique.size).toBe(categories.length)
    })

    it('should only include categories that have exercises', () => {
      const categories = getActiveCategories()
      categories.forEach((category) => {
        const exercises = getExercisesByCategory(category)
        expect(exercises.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getDefaultEnabledIds', () => {
    it('should return array of IDs', () => {
      const ids = getDefaultEnabledIds()
      ids.forEach((id) => {
        expect(typeof id).toBe('string')
      })
    })

    it('should match enabled exercises', () => {
      const ids = getDefaultEnabledIds()
      const enabled = getDefaultEnabledExercises()
      expect(ids.length).toBe(enabled.length)
      enabled.forEach((exercise) => {
        expect(ids).toContain(exercise.id)
      })
    })
  })

  describe('isValidExerciseId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidExerciseId('pushups')).toBe(true)
      expect(isValidExerciseId('arm_curls')).toBe(true)
    })

    it('should return false for invalid IDs', () => {
      expect(isValidExerciseId('nonexistent')).toBe(false)
      expect(isValidExerciseId('')).toBe(false)
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('should have labels for all category types', () => {
      expect(CATEGORY_LABELS.upper_body).toBeDefined()
      expect(CATEGORY_LABELS.lower_body).toBeDefined()
      expect(CATEGORY_LABELS.core).toBeDefined()
      expect(CATEGORY_LABELS.cardio).toBeDefined()
      expect(CATEGORY_LABELS.stretch).toBeDefined()
      expect(CATEGORY_LABELS.eyes).toBeDefined()
    })
  })
})

