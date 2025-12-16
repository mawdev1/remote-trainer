/**
 * Settings Store
 * Global state management for user settings
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { AppSettings, DEFAULT_SETTINGS } from '@/types'
import { settingsStorage } from '@/lib/storage'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsStoreState {
  /** Whether settings are loading */
  isLoading: boolean
  /** Current settings */
  settings: AppSettings
}

interface SettingsStoreActions {
  /** Update settings (partial update) */
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
  /** Reset to defaults */
  resetSettings: () => Promise<void>
  /** Update a specific section */
  updateSection: <K extends keyof AppSettings>(
    section: K,
    value: Partial<AppSettings[K]>
  ) => Promise<void>
}

type SettingsStoreContextValue = SettingsStoreState & SettingsStoreActions

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

const SettingsStoreContext = createContext<SettingsStoreContextValue | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsStoreProviderProps {
  children: ReactNode
}

export const SettingsStoreProvider: React.FC<SettingsStoreProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await settingsStorage.get()
        setSettings(loaded)
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Listen for changes from other contexts (e.g., other tabs)
  useEffect(() => {
    const unsubscribe = settingsStorage.onChange((newSettings) => {
      setSettings(newSettings)
    })
    return unsubscribe
  }, [])

  // Update settings
  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await settingsStorage.update(partial)
    setSettings(updated)
  }, [])

  // Reset settings
  const resetSettings = useCallback(async () => {
    const defaults = await settingsStorage.reset()
    setSettings(defaults)
  }, [])

  // Update section
  const updateSection = useCallback(async <K extends keyof AppSettings>(
    section: K,
    value: Partial<AppSettings[K]>
  ) => {
    await settingsStorage.updateSection(section, value)
    const updated = await settingsStorage.get()
    setSettings(updated)
  }, [])

  const value = useMemo<SettingsStoreContextValue>(() => ({
    isLoading,
    settings,
    updateSettings,
    resetSettings,
    updateSection,
  }), [isLoading, settings, updateSettings, resetSettings, updateSection])

  return (
    <SettingsStoreContext.Provider value={value}>
      {children}
    </SettingsStoreContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Access the full settings store
 */
export function useSettingsStore(): SettingsStoreContextValue {
  const context = useContext(SettingsStoreContext)
  if (!context) {
    throw new Error('useSettingsStore must be used within SettingsStoreProvider')
  }
  return context
}

/**
 * Access just the settings values
 */
export function useSettings(): AppSettings {
  const { settings } = useSettingsStore()
  return settings
}

/**
 * Access a specific settings section
 */
export function useSettingsSection<K extends keyof AppSettings>(section: K): AppSettings[K] {
  const settings = useSettings()
  return settings[section]
}

/**
 * Access reminder settings
 */
export function useReminderSettings() {
  const { settings, updateSection } = useSettingsStore()
  return {
    reminders: settings.reminders,
    updateReminders: (value: Partial<AppSettings['reminders']>) =>
      updateSection('reminders', value),
  }
}

/**
 * Access goal settings
 */
export function useGoalSettings() {
  const { settings, updateSection } = useSettingsStore()
  return {
    goals: settings.goals,
    updateGoals: (value: Partial<AppSettings['goals']>) =>
      updateSection('goals', value),
  }
}

/**
 * Access display settings
 */
export function useDisplaySettings() {
  const { settings, updateSection } = useSettingsStore()
  return {
    display: settings.display,
    updateDisplay: (value: Partial<AppSettings['display']>) =>
      updateSection('display', value),
  }
}

/**
 * Access weight unit settings
 */
export function useWeightSettings() {
  const { settings, updateSettings } = useSettingsStore()
  return {
    weightUnit: settings.weightUnit,
    updateWeightUnit: (unit: AppSettings['weightUnit']) =>
      updateSettings({ weightUnit: unit }),
  }
}

