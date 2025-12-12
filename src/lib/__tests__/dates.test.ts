/**
 * Date Utilities Tests
 */

import {
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getStartOfMonth,
  getDaysAgo,
  formatDateShort,
  formatDateLong,
  toISODateString,
  isSameDay,
} from '../utils/dates'

describe('Date Utilities', () => {
  describe('getStartOfDay', () => {
    it('should return midnight of the given date', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = new Date(getStartOfDay(date))
      
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('should use current date when no date provided', () => {
      const result = new Date(getStartOfDay())
      const now = new Date()
      
      expect(result.getDate()).toBe(now.getDate())
      expect(result.getHours()).toBe(0)
    })
  })

  describe('getEndOfDay', () => {
    it('should return 23:59:59.999 of the given date', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = new Date(getEndOfDay(date))
      
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
    })
  })

  describe('getStartOfWeek', () => {
    it('should return Monday of the current week', () => {
      // Wednesday, Jan 17, 2024
      const wednesday = new Date('2024-01-17T14:30:00')
      const result = new Date(getStartOfWeek(wednesday))
      
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(15) // Jan 15
    })

    it('should handle Sunday correctly (go back to Monday)', () => {
      // Sunday, Jan 21, 2024
      const sunday = new Date('2024-01-21T14:30:00')
      const result = new Date(getStartOfWeek(sunday))
      
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(15) // Jan 15
    })

    it('should handle Monday correctly (stay on same day)', () => {
      // Monday, Jan 15, 2024
      const monday = new Date('2024-01-15T14:30:00')
      const result = new Date(getStartOfWeek(monday))
      
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(15) // Same day
    })
  })

  describe('getStartOfMonth', () => {
    it('should return first day of the month', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = new Date(getStartOfMonth(date))
      
      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getHours()).toBe(0)
    })
  })

  describe('getDaysAgo', () => {
    it('should return timestamp for N days ago', () => {
      const now = Date.now()
      const threeDaysAgo = getDaysAgo(3)
      const expectedDiff = 3 * 24 * 60 * 60 * 1000
      
      // Allow small tolerance for execution time
      expect(Math.abs(now - threeDaysAgo - expectedDiff)).toBeLessThan(1000)
    })
  })

  describe('formatDateShort', () => {
    it('should format date as "Mon, Dec 11" style', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateShort(date)
      
      expect(result).toMatch(/Mon, Jan 15/)
    })
  })

  describe('formatDateLong', () => {
    it('should format date as "Monday, January 15" style', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateLong(date)
      
      expect(result).toMatch(/Monday, January 15/)
    })
  })

  describe('toISODateString', () => {
    it('should return YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T14:30:00Z')
      const result = toISODateString(date)
      
      expect(result).toBe('2024-01-15')
    })
  })

  describe('isSameDay', () => {
    it('should return true for same day different times', () => {
      const date1 = new Date('2024-01-15T08:00:00')
      const date2 = new Date('2024-01-15T20:00:00')
      
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different days', () => {
      const date1 = new Date('2024-01-15T08:00:00')
      const date2 = new Date('2024-01-16T08:00:00')
      
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })
})

