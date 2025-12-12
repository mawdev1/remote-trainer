/**
 * useReminders Hook
 * Provides reactive access to reminder state and active time tracking
 */

import { useState, useEffect, useCallback } from 'react'
import { reminderStorage } from '@/lib/storage'
import { settingsStorage } from '@/lib/storage'

interface ReminderState {
  /** Active browsing time in milliseconds */
  activeTimeMs: number
  /** Formatted active time string (e.g., "45 min") */
  activeTimeFormatted: string
  /** Today's movement minutes */
  movementMinutes: number
  /** Daily movement goal in minutes */
  movementGoal: number
  /** Whether reminders are enabled */
  remindersEnabled: boolean
  /** Whether currently in snooze period */
  isSnoozed: boolean
}

/**
 * Format milliseconds to human-readable duration
 */
function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} min`
}

/**
 * Hook to access reminder state with real-time updates
 */
export function useReminders(): ReminderState & {
  snooze: (minutes?: number) => Promise<void>
  resetActiveTime: () => Promise<void>
  refreshData: () => Promise<void>
} {
  const [state, setState] = useState<ReminderState>({
    activeTimeMs: 0,
    activeTimeFormatted: '0 min',
    movementMinutes: 0,
    movementGoal: 30,
    remindersEnabled: false,
    isSnoozed: false,
  })

  /**
   * Fetch all reminder data from storage
   */
  const refreshData = useCallback(async () => {
    try {
      const [activeTimeMs, movementMinutes, isSnoozed, settings] = await Promise.all([
        reminderStorage.getActiveTime(),
        reminderStorage.getTodayMovementMinutes(),
        reminderStorage.isInSnooze(),
        settingsStorage.get(),
      ])

      setState({
        activeTimeMs,
        activeTimeFormatted: formatDuration(activeTimeMs),
        movementMinutes,
        movementGoal: settings.movementGoal.dailyGoalMinutes,
        remindersEnabled: settings.reminders.enabled,
        isSnoozed,
      })
    } catch (error) {
      console.error('Failed to refresh reminder data:', error)
    }
  }, [])

  /**
   * Snooze reminders for specified minutes
   */
  const snooze = useCallback(async (minutes = 10) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SNOOZE_REMINDER',
        payload: { minutes },
      })
      await refreshData()
    } catch (error) {
      console.error('Failed to snooze reminder:', error)
    }
  }, [refreshData])

  /**
   * Reset active time (usually called after logging exercise)
   */
  const resetActiveTime = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'RESET_ACTIVE_TIME' })
      await refreshData()
    } catch (error) {
      console.error('Failed to reset active time:', error)
    }
  }, [refreshData])

  // Initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Listen for active time updates from background script
  useEffect(() => {
    const handleMessage = (message: { type: string; payload?: { activeTimeMs?: number } }) => {
      if (message.type === 'ACTIVE_TIME_UPDATE' && message.payload?.activeTimeMs !== undefined) {
        const ms = message.payload.activeTimeMs
        setState(prev => ({
          ...prev,
          activeTimeMs: ms,
          activeTimeFormatted: formatDuration(ms),
        }))
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  // Refresh data periodically (every 30 seconds) for movement minutes and snooze state
  useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  return {
    ...state,
    snooze,
    resetActiveTime,
    refreshData,
  }
}

/**
 * Hook for just the active time (lightweight version)
 */
export function useActiveTime(): {
  activeTimeMs: number
  activeTimeFormatted: string
} {
  const [activeTimeMs, setActiveTimeMs] = useState(0)

  useEffect(() => {
    // Get initial value
    chrome.runtime.sendMessage({ type: 'GET_ACTIVE_TIME' })
      .then((response) => {
        if (response?.activeTimeMs !== undefined) {
          setActiveTimeMs(response.activeTimeMs)
        }
      })
      .catch(() => {
        // Background script might not be ready
      })

    // Listen for updates
    const handleMessage = (message: { type: string; payload?: { activeTimeMs?: number } }) => {
      if (message.type === 'ACTIVE_TIME_UPDATE' && message.payload?.activeTimeMs !== undefined) {
        setActiveTimeMs(message.payload.activeTimeMs)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  return {
    activeTimeMs,
    activeTimeFormatted: formatDuration(activeTimeMs),
  }
}

/**
 * Hook for movement minutes progress
 */
export function useMovementMinutes(): {
  minutes: number
  goal: number
  percentage: number
  isGoalMet: boolean
} {
  const [data, setData] = useState({
    minutes: 0,
    goal: 30,
  })

  useEffect(() => {
    const load = async () => {
      const [minutes, settings] = await Promise.all([
        reminderStorage.getTodayMovementMinutes(),
        settingsStorage.get(),
      ])
      setData({
        minutes,
        goal: settings.movementGoal.dailyGoalMinutes,
      })
    }
    load()

    // Refresh periodically
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const percentage = Math.min(100, (data.minutes / data.goal) * 100)
  const isGoalMet = data.minutes >= data.goal

  return {
    minutes: Math.round(data.minutes * 10) / 10,
    goal: data.goal,
    percentage,
    isGoalMet,
  }
}

