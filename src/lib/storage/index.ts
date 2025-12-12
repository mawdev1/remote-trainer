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

