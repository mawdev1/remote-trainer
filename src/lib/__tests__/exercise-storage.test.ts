/**
 * Exercise Storage Tests
 */

import { exerciseStorage } from '../storage/exercise-storage'
import { clearMockStorage, seedMockStorage } from '@/test/setup'

describe('Exercise Storage', () => {
  beforeEach(() => {
    clearMockStorage()
  })

  describe('logExercise', () => {
    it('should create a new exercise entry', async () => {
      const entry = await exerciseStorage.logExercise('pushups', 20)

      expect(entry.id).toBeDefined()
      expect(entry.exerciseId).toBe('pushups')
      expect(entry.value).toBe(20)
      expect(entry.timestamp).toBeDefined()
    })

    it('should add entry to existing entries', async () => {
      await exerciseStorage.logExercise('pushups', 20)
      await exerciseStorage.logExercise('pushups', 15)

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(2)
    })

    it('should include sessionId if provided', async () => {
      const entry = await exerciseStorage.logExercise('pushups', 20, 'session-123')

      expect(entry.sessionId).toBe('session-123')
    })
  })

  describe('getAllEntries', () => {
    it('should return empty array when no entries', async () => {
      const entries = await exerciseStorage.getAllEntries()
      expect(entries).toEqual([])
    })

    it('should return all logged entries', async () => {
      await exerciseStorage.logExercise('pushups', 20)
      await exerciseStorage.logExercise('arm_curls', 10)

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(2)
    })
  })

  describe('getEntriesByType', () => {
    it('should filter entries by exercise type', async () => {
      await exerciseStorage.logExercise('pushups', 20)
      await exerciseStorage.logExercise('arm_curls', 10)
      await exerciseStorage.logExercise('pushups', 15)

      const pushups = await exerciseStorage.getEntriesByType('pushups')
      expect(pushups.length).toBe(2)
      pushups.forEach((entry) => {
        expect(entry.exerciseId).toBe('pushups')
      })
    })
  })

  describe('computeStats', () => {
    it('should compute total value and set count', () => {
      const entries = [
        { id: '1', exerciseId: 'pushups', value: 20, timestamp: Date.now() },
        { id: '2', exerciseId: 'pushups', value: 15, timestamp: Date.now() },
        { id: '3', exerciseId: 'pushups', value: 25, timestamp: Date.now() },
      ]

      const stats = exerciseStorage.computeStats(entries)
      expect(stats.totalValue).toBe(60)
      expect(stats.setCount).toBe(3)
    })

    it('should filter by exercise ID when provided', () => {
      const entries = [
        { id: '1', exerciseId: 'pushups', value: 20, timestamp: Date.now() },
        { id: '2', exerciseId: 'arm_curls', value: 10, timestamp: Date.now() },
        { id: '3', exerciseId: 'pushups', value: 15, timestamp: Date.now() },
      ]

      const stats = exerciseStorage.computeStats(entries, 'pushups')
      expect(stats.totalValue).toBe(35)
      expect(stats.setCount).toBe(2)
    })

    it('should return zeros for empty array', () => {
      const stats = exerciseStorage.computeStats([])
      expect(stats.totalValue).toBe(0)
      expect(stats.setCount).toBe(0)
    })
  })

  describe('clearHistory', () => {
    it('should remove all entries', async () => {
      await exerciseStorage.logExercise('pushups', 20)
      await exerciseStorage.logExercise('arm_curls', 10)

      await exerciseStorage.clearHistory()

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(0)
    })
  })

  describe('deleteEntry', () => {
    it('should remove specific entry by ID', async () => {
      const entry1 = await exerciseStorage.logExercise('pushups', 20)
      await exerciseStorage.logExercise('pushups', 15)

      const deleted = await exerciseStorage.deleteEntry(entry1.id)
      expect(deleted).toBe(true)

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(1)
      expect(entries[0]?.id).not.toBe(entry1.id)
    })

    it('should return false when entry not found', async () => {
      const deleted = await exerciseStorage.deleteEntry('nonexistent')
      expect(deleted).toBe(false)
    })
  })

  describe('exportData / importData', () => {
    it('should export data as JSON string', async () => {
      await exerciseStorage.logExercise('pushups', 20)

      const json = await exerciseStorage.exportData()
      const parsed = JSON.parse(json)

      expect(parsed.version).toBe(1)
      expect(parsed.exportedAt).toBeDefined()
      expect(parsed.entries.length).toBe(1)
    })

    it('should import data and replace existing', async () => {
      await exerciseStorage.logExercise('pushups', 20)

      const importData = JSON.stringify({
        version: 1,
        entries: [
          { id: 'import-1', exerciseId: 'arm_curls', value: 10, timestamp: Date.now() },
          { id: 'import-2', exerciseId: 'arm_curls', value: 15, timestamp: Date.now() },
        ],
      })

      const count = await exerciseStorage.importData(importData, false)
      expect(count).toBe(2)

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(2)
    })

    it('should merge data when merge=true', async () => {
      await exerciseStorage.logExercise('pushups', 20)

      const importData = JSON.stringify({
        version: 1,
        entries: [
          { id: 'import-1', exerciseId: 'arm_curls', value: 10, timestamp: Date.now() },
        ],
      })

      const count = await exerciseStorage.importData(importData, true)
      expect(count).toBe(1)

      const entries = await exerciseStorage.getAllEntries()
      expect(entries.length).toBe(2)
    })
  })
})

