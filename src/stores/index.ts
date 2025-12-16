/**
 * Stores
 * Central exports for global state management
 */

export {
  ExerciseStoreProvider,
  useExerciseStore,
  useExerciseStats,
  useTotalStats,
  useExerciseHistory,
  usePersonalBests,
  useLastPBResult,
} from './ExerciseStore'

export {
  SettingsStoreProvider,
  useSettingsStore,
  useSettings,
  useSettingsSection,
  useReminderSettings,
  useGoalSettings,
  useDisplaySettings,
  useWeightSettings,
} from './SettingsStore'

export {
  ProgressionStoreProvider,
  useProgressionStore,
  useExerciseProgression,
  useUnlockInfo,
  useTotalProgression,
} from './ProgressionStore'

export {
  StreakStoreProvider,
  useStreakStore,
  useStreakDisplay,
  useStreakMilestone,
} from './StreakStore'

