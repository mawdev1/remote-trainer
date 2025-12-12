/**
 * Settings Storage
 * Handles user preferences and configuration
 */

import { AppSettings, DEFAULT_SETTINGS } from '@/types'
import { syncStorage } from './chrome-storage'

// Storage key (new extFlex prefix)
const SETTINGS_KEY = 'extFlex_settings'

// Legacy key for migration
const LEGACY_SETTINGS_KEY = 'trainer_settings'

// Migration flag key
const SETTINGS_MIGRATION_FLAG = 'extFlex_settings_migration_done'

/**
 * Migrate settings from old storage key to new key
 * Runs once on first load after update
 */
async function migrateSettingsStorage(): Promise<void> {
  // Check if migration already done
  const migrationDone = await syncStorage.get<boolean>(SETTINGS_MIGRATION_FLAG)
  if (migrationDone) return

  // Migrate settings
  const oldSettings = await syncStorage.get<Partial<AppSettings>>(LEGACY_SETTINGS_KEY)
  if (oldSettings && Object.keys(oldSettings).length > 0) {
    const newSettings = await syncStorage.get<Partial<AppSettings>>(SETTINGS_KEY)
    if (!newSettings || Object.keys(newSettings).length === 0) {
      await syncStorage.set(SETTINGS_KEY, oldSettings)
      console.log('Ext & Flex: Migrated settings to new storage key')
    }
  }

  // Mark migration as complete
  await syncStorage.set(SETTINGS_MIGRATION_FLAG, true)
  console.log('Ext & Flex: Settings storage migration complete')
}

// Run migration on module load
migrateSettingsStorage().catch(console.error)

/**
 * Settings Storage API
 */
export const settingsStorage = {
  /**
   * Get all settings (with defaults merged)
   */
  async get(): Promise<AppSettings> {
    const stored = await syncStorage.get<Partial<AppSettings>>(SETTINGS_KEY)
    return deepMerge(DEFAULT_SETTINGS, stored || {})
  },

  /**
   * Update settings (partial update supported)
   */
  async update(partial: DeepPartial<AppSettings>): Promise<AppSettings> {
    const current = await this.get()
    const updated = deepMerge(current, partial)
    await syncStorage.set(SETTINGS_KEY, updated)
    return updated
  },

  /**
   * Reset all settings to defaults
   */
  async reset(): Promise<AppSettings> {
    await syncStorage.set(SETTINGS_KEY, DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  },

  /**
   * Get a specific setting section
   */
  async getSection<K extends keyof AppSettings>(section: K): Promise<AppSettings[K]> {
    const settings = await this.get()
    return settings[section]
  },

  /**
   * Update a specific setting section
   */
  async updateSection<K extends keyof AppSettings>(
    section: K,
    value: Partial<AppSettings[K]>
  ): Promise<AppSettings[K]> {
    const current = await this.get()
    const updated = { ...current[section], ...value }
    await this.update({ [section]: updated } as DeepPartial<AppSettings>)
    return updated
  },

  /**
   * Listen for settings changes
   */
  onChange(callback: (settings: AppSettings) => void): () => void {
    return syncStorage.onChange(async (changes) => {
      if (changes[SETTINGS_KEY]) {
        const settings = await this.get()
        callback(settings)
      }
    })
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES & FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deep partial type for nested partial updates
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (
        sourceValue !== undefined &&
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Partial<Record<string, unknown>>
        ) as T[Extract<keyof T, string>]
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return result
}

