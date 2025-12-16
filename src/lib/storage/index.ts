/**
 * Storage Module
 * Central exports for all storage functionality
 */

// Base Chrome storage
export { ChromeStorage, syncStorage, localStorage, sessionStorage } from './chrome-storage'
export type { StorageArea } from './chrome-storage'

// Exercise storage
export { exerciseStorage } from './exercise-storage'

// Settings storage
export { settingsStorage } from './settings-storage'

// Progression storage
export { progressionStorage } from './progression-storage'

// Reminder storage
export { reminderStorage } from './reminder-storage'

// Streak storage
export { streakStorage } from './streak-storage'

// Personal Best storage
export { pbStorage } from './pb-storage'
export type { PBCheckResult } from './pb-storage'

