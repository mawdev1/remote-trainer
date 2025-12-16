/**
 * Settings Types
 * User preferences and configuration
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export type WeightUnit = 'lbs' | 'kg'

export type BackgroundStyle = 'minimal' | 'aurora' | 'gradient' | 'cosmos' | 'waves'

export const BACKGROUND_OPTIONS: { id: BackgroundStyle; name: string; description: string }[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean, solid background' },
  { id: 'aurora', name: 'Aurora', description: 'Floating dots with soft glow' },
  { id: 'gradient', name: 'Gradient', description: 'Static layered gradients' },
  { id: 'cosmos', name: 'Cosmos', description: 'Starfield with twinkling dots' },
  { id: 'waves', name: 'Waves', description: 'Gentle flowing motion' },
]

/** Available reminder interval options in minutes */
export const REMINDER_INTERVAL_OPTIONS = [30, 45, 60, 90, 120] as const
export type ReminderInterval = typeof REMINDER_INTERVAL_OPTIONS[number]

/**
 * Reminder/notification settings
 */
export interface ReminderSettings {
  /** Whether break reminders are enabled */
  enabled: boolean
  /** Interval in minutes between reminders */
  intervalMinutes: ReminderInterval
  /** Quiet hours start (24h format, e.g., 22 for 10pm) */
  quietHoursStart: number | null
  /** Quiet hours end (24h format, e.g., 7 for 7am) */
  quietHoursEnd: number | null
  /** Whether to play sound with notifications */
  soundEnabled: boolean
  /** Whether to use active time tracking (idle-aware) instead of fixed intervals */
  useActiveTimeTracking: boolean
  /** Smart suggestions - suggest exercises based on history */
  smartSuggestions: boolean
}

/**
 * Movement minutes goal settings
 */
export interface MovementGoalSettings {
  /** Whether movement minutes goal is enabled */
  enabled: boolean
  /** Daily goal in minutes */
  dailyGoalMinutes: number
}

/**
 * Goal settings for exercises
 */
export interface GoalSettings {
  /** Daily goals per exercise ID */
  daily: Record<string, number>
  /** Weekly goals per exercise ID */
  weekly: Record<string, number>
}

/**
 * Display and UI settings
 */
export interface DisplaySettings {
  /** Theme mode */
  theme: ThemeMode
  /** Background style */
  background: BackgroundStyle
  /** Whether to show celebration animations */
  celebrationsEnabled: boolean
  /** Whether to show the streak counter */
  showStreak: boolean
}

/**
 * Exercise customization settings
 */
export interface ExerciseSettings {
  /** List of enabled exercise IDs */
  enabledExercises: string[]
  /** Custom quick-add options per exercise ID */
  customQuickOptions: Record<string, number[]>
}

/**
 * Complete app settings object
 */
export interface AppSettings {
  reminders: ReminderSettings
  goals: GoalSettings
  display: DisplaySettings
  exercises: ExerciseSettings
  movementGoal: MovementGoalSettings
  /** Weight unit preference for weighted exercises */
  weightUnit: WeightUnit
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  reminders: {
    enabled: false,
    intervalMinutes: 60,
    quietHoursStart: null,
    quietHoursEnd: null,
    soundEnabled: true,
    useActiveTimeTracking: true,
    smartSuggestions: true,
  },
  goals: {
    daily: {},
    weekly: {},
  },
  display: {
    theme: 'system',
    background: 'aurora',
    celebrationsEnabled: true,
    showStreak: true,
  },
  exercises: {
    enabledExercises: [],  // Empty means "use defaults from registry"
    customQuickOptions: {},
  },
  movementGoal: {
    enabled: true,
    dailyGoalMinutes: 30,
  },
  weightUnit: 'lbs',
}

