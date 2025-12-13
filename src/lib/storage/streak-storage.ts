/**
 * Streak Storage
 * Handles persistence of streak data (consecutive days of exercise)
 */

import { localStorage } from './chrome-storage'
import { StreakData, DEFAULT_STREAK_DATA, isMilestone } from '@/types/streak'
import { toISODateString, getStartOfDay } from '@/lib/utils/dates'

const STORAGE_KEY = 'extFlex_streak'

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
function getTodayISO(): string {
  return toISODateString(new Date())
}

/**
 * Get yesterday's date as ISO string
 */
function getYesterdayISO(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return toISODateString(yesterday)
}

/**
 * Get the start of the current week (Monday) as ISO string
 */
function getWeekStartISO(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return toISODateString(monday)
}

/**
 * Streak Storage API
 */
export const streakStorage = {
  /**
   * Get current streak data
   */
  async get(): Promise<StreakData> {
    const data = await localStorage.get<StreakData>(STORAGE_KEY)
    if (!data) return { ...DEFAULT_STREAK_DATA }
    
    // Reset freezes if it's a new week
    return this.maybeResetFreezes(data)
  },

  /**
   * Save streak data
   */
  async save(data: StreakData): Promise<void> {
    await localStorage.set(STORAGE_KEY, data)
  },

  /**
   * Reset freezes if it's a new week
   */
  maybeResetFreezes(data: StreakData): StreakData {
    const weekStart = getWeekStartISO()
    if (data.freezesResetDate !== weekStart) {
      return {
        ...data,
        freezesRemaining: 2,
        freezesResetDate: weekStart,
      }
    }
    return data
  },

  /**
   * Record activity for today
   * Call this when a user logs an exercise
   * Returns updated streak data and whether a milestone was hit
   */
  async recordActivity(): Promise<{
    data: StreakData
    streakIncreased: boolean
    milestoneHit: boolean
    newMilestone: number | null
  }> {
    const data = await this.get()
    const today = getTodayISO()
    const yesterday = getYesterdayISO()
    
    let streakIncreased = false
    let newMilestone: number | null = null
    
    // Already recorded activity today
    if (data.lastActiveDate === today) {
      return { 
        data, 
        streakIncreased: false, 
        milestoneHit: false, 
        newMilestone: null 
      }
    }
    
    // Check if streak continues
    if (data.lastActiveDate === yesterday || data.frozenDates.includes(yesterday)) {
      // Streak continues - increment
      data.current += 1
      streakIncreased = true
    } else if (data.lastActiveDate === null) {
      // First activity ever
      data.current = 1
      streakIncreased = true
      if (!data.startedAt) {
        data.startedAt = Date.now()
      }
    } else {
      // Streak broken - start fresh
      data.current = 1
      streakIncreased = true
      // Clear frozen dates since streak is reset
      data.frozenDates = []
    }
    
    // Update last active date
    data.lastActiveDate = today
    
    // Update longest streak
    if (data.current > data.longest) {
      data.longest = data.current
    }
    
    // Check for milestone
    if (isMilestone(data.current)) {
      newMilestone = data.current
    }
    
    await this.save(data)
    
    return { 
      data, 
      streakIncreased, 
      milestoneHit: newMilestone !== null, 
      newMilestone 
    }
  },

  /**
   * Use a streak freeze for today
   * Returns success status and updated data
   */
  async useFreeze(): Promise<{
    success: boolean
    data: StreakData
    reason?: string
  }> {
    const data = await this.get()
    const today = getTodayISO()
    
    // Check if already have activity today
    if (data.lastActiveDate === today) {
      return { 
        success: false, 
        data, 
        reason: 'Already logged activity today' 
      }
    }
    
    // Check if freeze already used today
    if (data.frozenDates.includes(today)) {
      return { 
        success: false, 
        data, 
        reason: 'Freeze already used today' 
      }
    }
    
    // Check if any freezes remaining
    if (data.freezesRemaining <= 0) {
      return { 
        success: false, 
        data, 
        reason: 'No freezes remaining this week' 
      }
    }
    
    // Use the freeze
    data.freezesRemaining -= 1
    data.frozenDates.push(today)
    
    await this.save(data)
    
    return { success: true, data }
  },

  /**
   * Calculate current streak status
   * Returns whether streak is at risk (no activity today and not frozen)
   */
  async getStreakStatus(): Promise<{
    data: StreakData
    isAtRisk: boolean
    isActive: boolean
    isFrozen: boolean
  }> {
    const data = await this.get()
    const today = getTodayISO()
    
    const isActive = data.lastActiveDate === today
    const isFrozen = data.frozenDates.includes(today)
    const isAtRisk = !isActive && !isFrozen && data.current > 0
    
    return { data, isAtRisk, isActive, isFrozen }
  },

  /**
   * Check and potentially break the streak
   * Call this on app open to verify streak is still valid
   */
  async validateStreak(): Promise<StreakData> {
    const data = await this.get()
    const today = getTodayISO()
    const yesterday = getYesterdayISO()
    
    // If last activity was today or yesterday, streak is still valid
    if (data.lastActiveDate === today || data.lastActiveDate === yesterday) {
      return data
    }
    
    // Check if yesterday was frozen
    if (data.frozenDates.includes(yesterday)) {
      return data
    }
    
    // If we get here and there's a streak, it might be broken
    // Only break if last active was more than 1 day ago
    if (data.lastActiveDate && data.current > 0) {
      const lastActive = new Date(data.lastActiveDate)
      const todayDate = new Date(today)
      const daysDiff = Math.floor(
        (todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysDiff > 1) {
        // Streak is broken
        data.current = 0
        data.frozenDates = []
        await this.save(data)
      }
    }
    
    return data
  },

  /**
   * Reset streak data
   */
  async reset(): Promise<void> {
    await this.save({ ...DEFAULT_STREAK_DATA })
  },

  /**
   * Listen for changes to streak data
   */
  onChange(callback: (data: StreakData) => void): () => void {
    return localStorage.onChange(async (changes) => {
      if (changes[STORAGE_KEY]) {
        const data = await this.get()
        callback(data)
      }
    })
  },
}

