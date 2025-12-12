/// <reference types="chrome"/>

/**
 * Ext & Flex - Background Service Worker
 * Handles break reminders, active time tracking, and notifications
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const ALARM_NAMES = {
  REMINDER_CHECK: 'extFlex_reminder_check',
  ACTIVE_TIME_UPDATE: 'extFlex_active_time_update',
} as const

const STORAGE_KEYS = {
  SETTINGS: 'extFlex_settings',
  ACTIVE_TIME_START: 'extFlex_active_time_start',
  LAST_ACTIVE_TIMESTAMP: 'extFlex_last_active_timestamp',
  ACCUMULATED_ACTIVE_TIME: 'extFlex_accumulated_active_time',
  LAST_REMINDER_TIME: 'extFlex_last_reminder_time',
  SNOOZE_UNTIL: 'extFlex_snooze_until',
  EXERCISES: 'extFlex_exercises',
  PROGRESSION: 'extFlex_progression',
} as const

const NOTIFICATION_ID = 'extFlex_break_reminder'

// Idle detection threshold in seconds (15 seconds of inactivity = idle)
const IDLE_DETECTION_THRESHOLD = 15

// Default reminder settings
const DEFAULT_REMINDER_SETTINGS = {
  enabled: false,
  intervalMinutes: 60,
  quietHoursStart: null as number | null,
  quietHoursEnd: null as number | null,
  soundEnabled: true,
  useActiveTimeTracking: true,
  smartSuggestions: true,
}

// Exercise suggestions for notifications
const EXERCISE_SUGGESTIONS = [
  { id: 'pushups', name: 'Push-ups', icon: '💪', defaultReps: 15 },
  { id: 'jumping_jacks', name: 'Jumping Jacks', icon: '⭐', defaultReps: 30 },
  { id: 'squats', name: 'Squats', icon: '🦵', defaultReps: 15 },
  { id: 'neck_rolls', name: 'Neck Rolls', icon: '🔄', defaultDuration: 30 },
  { id: 'shoulder_stretch', name: 'Shoulder Stretch', icon: '💆', defaultDuration: 30 },
  { id: 'high_knees', name: 'High Knees', icon: '🏃', defaultReps: 30 },
]

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

console.log('Ext & Flex background script initialized', new Date().toISOString())

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Ext & Flex extension installed')
    initializeReminders()
  } else if (details.reason === 'update') {
    console.log('Ext & Flex extension updated to version', chrome.runtime.getManifest().version)
    initializeReminders()
  }
})

// Browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, Ext & Flex ready')
  initializeReminders()
})

/**
 * Initialize the reminder system based on stored settings
 */
async function initializeReminders(): Promise<void> {
  const settings = await getReminderSettings()
  
  if (settings.enabled) {
    await startReminderSystem(settings)
  } else {
    await stopReminderSystem()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get reminder settings from storage
 */
async function getReminderSettings(): Promise<typeof DEFAULT_REMINDER_SETTINGS> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEYS.SETTINGS, (result) => {
      const settings = result[STORAGE_KEYS.SETTINGS]
      if (settings?.reminders) {
        resolve({ ...DEFAULT_REMINDER_SETTINGS, ...settings.reminders })
      } else {
        resolve(DEFAULT_REMINDER_SETTINGS)
      }
    })
  })
}

/**
 * Get unlocked exercises from progression data
 */
async function getUnlockedExercises(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.PROGRESSION, (result) => {
      const progression = result[STORAGE_KEYS.PROGRESSION]
      if (progression?.exercises) {
        const unlocked = Object.entries(progression.exercises)
          .filter(([_, data]: [string, any]) => data.unlocked)
          .map(([id]) => id)
        resolve(unlocked)
      } else {
        // Default starter exercises
        resolve(['pushups', 'jumping_jacks', 'neck_rolls'])
      }
    })
  })
}

/**
 * Get recently done exercises (last 24 hours)
 */
async function getRecentExercises(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.EXERCISES, (result) => {
      const exercises = result[STORAGE_KEYS.EXERCISES] || []
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      const recent = exercises
        .filter((e: any) => e.timestamp > oneDayAgo)
        .map((e: any) => e.exerciseId)
      resolve([...new Set(recent)] as string[])
    })
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// REMINDER SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Start the reminder system
 */
async function startReminderSystem(settings: typeof DEFAULT_REMINDER_SETTINGS): Promise<void> {
  console.log('Starting reminder system with interval:', settings.intervalMinutes, 'minutes')

  // Set up idle detection if using active time tracking
  if (settings.useActiveTimeTracking) {
    chrome.idle.setDetectionInterval(IDLE_DETECTION_THRESHOLD)
    
    // Check initial state
    chrome.idle.queryState(IDLE_DETECTION_THRESHOLD, (state) => {
      handleIdleStateChange(state)
    })
  }

  // Set up the reminder check alarm (runs every minute to check conditions)
  await chrome.alarms.create(ALARM_NAMES.REMINDER_CHECK, {
    periodInMinutes: 1,
  })

  // Set up active time update alarm (for UI updates)
  await chrome.alarms.create(ALARM_NAMES.ACTIVE_TIME_UPDATE, {
    periodInMinutes: 0.5, // Every 30 seconds
  })
}

/**
 * Stop the reminder system
 */
async function stopReminderSystem(): Promise<void> {
  console.log('Stopping reminder system')
  await chrome.alarms.clear(ALARM_NAMES.REMINDER_CHECK)
  await chrome.alarms.clear(ALARM_NAMES.ACTIVE_TIME_UPDATE)
}

// ═══════════════════════════════════════════════════════════════════════════════
// IDLE STATE HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle idle state changes
 */
async function handleIdleStateChange(state: chrome.idle.IdleState): Promise<void> {
  const now = Date.now()

  if (state === 'active') {
    // User became active - start/resume tracking
    const startTime = await getStorageValue<number>(STORAGE_KEYS.ACTIVE_TIME_START)
    
    if (!startTime) {
      // Start new tracking session
      await setStorageValue(STORAGE_KEYS.ACTIVE_TIME_START, now)
    }
    
    await setStorageValue(STORAGE_KEYS.LAST_ACTIVE_TIMESTAMP, now)
    console.log('User active - tracking time')
  } else {
    // User went idle or locked - pause tracking
    const startTime = await getStorageValue<number>(STORAGE_KEYS.ACTIVE_TIME_START)
    const accumulated = await getStorageValue<number>(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME) || 0

    if (startTime) {
      const sessionTime = now - startTime
      const newAccumulated = accumulated + sessionTime
      await setStorageValue(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME, newAccumulated)
      await removeStorageValue(STORAGE_KEYS.ACTIVE_TIME_START)
      console.log('User idle - paused tracking. Accumulated:', Math.round(newAccumulated / 60000), 'min')
    }
  }
}

// Set up idle state listener
chrome.idle.onStateChanged.addListener(handleIdleStateChange)

// ═══════════════════════════════════════════════════════════════════════════════
// ALARM HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.REMINDER_CHECK) {
    await checkAndTriggerReminder()
  } else if (alarm.name === ALARM_NAMES.ACTIVE_TIME_UPDATE) {
    // Broadcast active time update for popup UI
    await broadcastActiveTimeUpdate()
  }
})

/**
 * Check if reminder conditions are met and trigger notification
 */
async function checkAndTriggerReminder(): Promise<void> {
  const settings = await getReminderSettings()

  if (!settings.enabled) {
    return
  }

  // Check quiet hours
  if (isInQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
    console.log('In quiet hours - skipping reminder')
    return
  }

  // Check snooze
  const snoozeUntil = await getStorageValue<number>(STORAGE_KEYS.SNOOZE_UNTIL)
  if (snoozeUntil && Date.now() < snoozeUntil) {
    console.log('In snooze period - skipping reminder')
    return
  }

  // Get active time or elapsed time since last reminder
  let shouldRemind = false
  const intervalMs = settings.intervalMinutes * 60 * 1000

  if (settings.useActiveTimeTracking) {
    // Check active time
    const activeTime = await getActiveTime()
    shouldRemind = activeTime >= intervalMs
    
    if (shouldRemind) {
      console.log('Active time threshold reached:', Math.round(activeTime / 60000), 'min')
    }
  } else {
    // Check elapsed time since last reminder or exercise
    const lastReminder = await getStorageValue<number>(STORAGE_KEYS.LAST_REMINDER_TIME)
    const lastExercise = await getStorageValue<number>('extFlex_last_exercise')
    
    const lastActivity = Math.max(lastReminder || 0, lastExercise || 0, 0)
    const elapsed = Date.now() - lastActivity
    
    shouldRemind = elapsed >= intervalMs
    
    if (shouldRemind) {
      console.log('Elapsed time threshold reached:', Math.round(elapsed / 60000), 'min')
    }
  }

  if (shouldRemind) {
    await showBreakReminder(settings)
  }
}

/**
 * Get current active time in milliseconds
 */
async function getActiveTime(): Promise<number> {
  const startTime = await getStorageValue<number>(STORAGE_KEYS.ACTIVE_TIME_START)
  const accumulated = await getStorageValue<number>(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME) || 0

  if (startTime) {
    return accumulated + (Date.now() - startTime)
  }

  return accumulated
}

/**
 * Broadcast active time update to popup
 */
async function broadcastActiveTimeUpdate(): Promise<void> {
  const activeTime = await getActiveTime()
  
  // Send message to popup (if open)
  chrome.runtime.sendMessage({
    type: 'ACTIVE_TIME_UPDATE',
    payload: { activeTimeMs: activeTime },
  }).catch(() => {
    // Popup not open - ignore error
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the current notifications permission level for this extension
 * Useful for debugging OS/Brave-level notification blocks
 */
function getNotificationsPermissionLevel(): Promise<chrome.notifications.PermissionLevel> {
  return new Promise((resolve) => {
    chrome.notifications.getPermissionLevel((level) => resolve(level))
  })
}

/**
 * Get all currently active notifications created by this extension
 * (useful for debugging \"created but not displayed\" scenarios)
 */
function getActiveNotifications(): Promise<Record<string, chrome.notifications.NotificationOptions>> {
  return new Promise((resolve) => {
    chrome.notifications.getAll((notifications) => resolve(notifications))
  })
}

/**
 * Show break reminder notification
 */
async function showBreakReminder(settings: typeof DEFAULT_REMINDER_SETTINGS): Promise<void> {
  // Get smart suggestion if enabled
  let suggestion = null
  if (settings.smartSuggestions) {
    suggestion = await getSmartExerciseSuggestion()
  }

  const message = suggestion 
    ? `How about ${suggestion.defaultReps || suggestion.defaultDuration + 's'} ${suggestion.name}?`
    : 'Take a quick break and do some exercises!'

  // Clear any existing notification first
  try {
    await chrome.notifications.clear(NOTIFICATION_ID)
  } catch (e) {
    console.log('No existing notification to clear')
  }

  // Create new notification using callback style for better compatibility
  return new Promise((resolve, reject) => {
    chrome.notifications.create(
      NOTIFICATION_ID,
      {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/ext-and-flex-128.png'),
        title: '🧘 Time for a Break!',
        message,
        buttons: [
          { title: '✓ Log Exercise' },
          { title: '⏰ Snooze 10 min' },
        ],
        priority: 2,
        requireInteraction: true,
        silent: !settings.soundEnabled,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError.message)
          reject(chrome.runtime.lastError)
          return
        }
        console.log('Break reminder shown, notification ID:', notificationId)
        setStorageValue(STORAGE_KEYS.LAST_REMINDER_TIME, Date.now())
        resolve()
      }
    )
  })
}

/**
 * Show a test notification.
 * Uses a unique ID to avoid Chromium/Brave behavior where fixed IDs may update silently.
 */
async function showTestNotification(): Promise<{ createdId: string | null }> {
  const createdId = await new Promise<string | null>((resolve, reject) => {
    const id = `extFlex_test_${Date.now()}`
    chrome.notifications.create(
      id,
      {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/ext-and-flex-128.png'),
        title: 'Ext & Flex — Test Notification',
        message: 'If you can read this, notifications are working 🎉',
        priority: 2,
        // Some platforms ignore requireInteraction; some suppress it. Keep test simple.
        requireInteraction: false,
        silent: false,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Test notification error:', chrome.runtime.lastError.message)
          reject(chrome.runtime.lastError)
          return
        }
        resolve(notificationId || null)
      }
    )
  })

  return { createdId }
}

/**
 * Get a smart exercise suggestion based on history
 */
async function getSmartExerciseSuggestion(): Promise<typeof EXERCISE_SUGGESTIONS[0] | null> {
  const unlocked = await getUnlockedExercises()
  const recent = await getRecentExercises()

  // Filter to exercises that are unlocked and in our suggestion list
  const available = EXERCISE_SUGGESTIONS.filter(ex => unlocked.includes(ex.id))

  if (available.length === 0) {
    return EXERCISE_SUGGESTIONS[0] ?? null // Fallback to push-ups
  }

  // Prefer exercises not done recently
  const notRecent = available.filter(ex => !recent.includes(ex.id))

  if (notRecent.length > 0) {
    // Return a random exercise from those not done recently
    return notRecent[Math.floor(Math.random() * notRecent.length)] ?? null
  }

  // All have been done recently - just pick a random one
  return available[Math.floor(Math.random() * available.length)] ?? null
}

/**
 * Open the extension popup or fallback to a new window
 */
async function openExtensionPopup(): Promise<void> {
  // Try to open the popup directly (not always supported)
  if (typeof chrome.action.openPopup === 'function') {
    try {
      await chrome.action.openPopup()
      return
    } catch {
      // Fallback to creating a window
    }
  }
  
  // Fallback: create a popup window
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 750,
    height: 600,
  })
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (notificationId !== NOTIFICATION_ID) return

  if (buttonIndex === 0) {
    // Log Exercise - open popup
    await openExtensionPopup()
    await resetActiveTimeAfterExercise()
  } else if (buttonIndex === 1) {
    // Snooze 10 minutes
    const snoozeUntil = Date.now() + 10 * 60 * 1000
    await setStorageValue(STORAGE_KEYS.SNOOZE_UNTIL, snoozeUntil)
    console.log('Snoozed for 10 minutes')
  }

  await chrome.notifications.clear(notificationId)
})

// Handle notification click (not on buttons)
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId !== NOTIFICATION_ID) return

  // Open popup
  await openExtensionPopup()

  await chrome.notifications.clear(notificationId)
})

// Handle notification closed (dismissed)
chrome.notifications.onClosed.addListener(async (notificationId, byUser) => {
  if (notificationId !== NOTIFICATION_ID) return

  if (byUser) {
    // User dismissed - treat as snooze
    const snoozeUntil = Date.now() + 10 * 60 * 1000
    await setStorageValue(STORAGE_KEYS.SNOOZE_UNTIL, snoozeUntil)
    console.log('Notification dismissed - snoozed for 10 minutes')
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLING
// ═══════════════════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXERCISE_LOGGED') {
    // Exercise was logged - reset active time
    resetActiveTimeAfterExercise()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep channel open for async response
  }

  if (message.type === 'GET_ACTIVE_TIME') {
    // Return current active time
    getActiveTime()
      .then((activeTimeMs) => sendResponse({ activeTimeMs }))
      .catch((error) => sendResponse({ error: error.message }))
    return true
  }

  if (message.type === 'SETTINGS_UPDATED') {
    // Settings changed - reinitialize reminders
    initializeReminders()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'SNOOZE_REMINDER') {
    // Snooze requested from popup
    const minutes = message.payload?.minutes || 10
    setStorageValue(STORAGE_KEYS.SNOOZE_UNTIL, Date.now() + minutes * 60 * 1000)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'RESET_ACTIVE_TIME') {
    // Reset active time requested from popup
    resetActiveTimeAfterExercise()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'GET_NOTIFICATION_PERMISSION') {
    getNotificationsPermissionLevel()
      .then((level) => sendResponse({ level }))
      .catch((error) => sendResponse({ error: error?.message || String(error) }))
    return true
  }

  if (message.type === 'TEST_NOTIFICATION') {
    // Test notification - useful for debugging
    console.log('Testing notification...')
    Promise.all([getNotificationsPermissionLevel(), showTestNotification(), getActiveNotifications()])
      .then(([level, testResult, active]) => {
        const activeIds = Object.keys(active)
        sendResponse({
          success: true,
          level,
          createdId: testResult.createdId,
          activeCount: activeIds.length,
          activeIds: activeIds.slice(0, 10),
        })
      })
      .catch((error) => {
        console.error('Test notification failed:', error)
        getNotificationsPermissionLevel()
          .then((level) => {
            sendResponse({ success: false, level, error: error?.message || String(error) })
          })
          .catch(() => {
            sendResponse({ success: false, error: error?.message || String(error) })
          })
      })
    return true
  }
})

/**
 * Debug helpers for the MV3 service worker DevTools console.
 * Brave/Chrome devtools can evaluate expressions in the SW context, but webpack
 * bundles functions into a closure, so we explicitly expose a small API on `self`.
 */
;(self as unknown as { extFlexDebug?: Record<string, unknown> }).extFlexDebug = {
  /** Test notification without using runtime messaging */
  testNotification: async () => {
    const level = await getNotificationsPermissionLevel()
    const result = await showTestNotification()
    const active = await getActiveNotifications()
    return { level, ...result, activeCount: Object.keys(active).length, activeIds: Object.keys(active) }
  },
  /** Read current permission level */
  getNotificationPermission: async () => {
    const level = await getNotificationsPermissionLevel()
    return { level }
  },
}

/**
 * Reset active time after exercise is logged
 */
async function resetActiveTimeAfterExercise(): Promise<void> {
  await removeStorageValue(STORAGE_KEYS.ACTIVE_TIME_START)
  await removeStorageValue(STORAGE_KEYS.ACCUMULATED_ACTIVE_TIME)
  await setStorageValue(STORAGE_KEYS.LAST_REMINDER_TIME, Date.now())
  await removeStorageValue(STORAGE_KEYS.SNOOZE_UNTIL)
  
  // Restart tracking if user is active
  chrome.idle.queryState(IDLE_DETECTION_THRESHOLD, (state) => {
    if (state === 'active') {
      setStorageValue(STORAGE_KEYS.ACTIVE_TIME_START, Date.now())
    }
  })

  console.log('Active time reset after exercise')
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if currently within quiet hours
 */
function isInQuietHours(quietStart: number | null, quietEnd: number | null): boolean {
  if (quietStart === null || quietEnd === null) return false

  const now = new Date()
  const currentHour = now.getHours()

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (quietStart > quietEnd) {
    return currentHour >= quietStart || currentHour < quietEnd
  }

  // Normal quiet hours (e.g., 12:00 - 13:00)
  return currentHour >= quietStart && currentHour < quietEnd
}

/**
 * Get value from local storage
 */
function getStorageValue<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] ?? null)
    })
  })
}

/**
 * Set value in local storage
 */
function setStorageValue<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve()
    })
  })
}

/**
 * Remove value from local storage
 */
function removeStorageValue(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      resolve()
    })
  })
}

// Initialize on script load
initializeReminders()
