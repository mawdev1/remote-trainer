/**
 * SettingsView Component
 * Settings page with reminders, reset options and app info
 */

import React, { useState } from 'react'
import { useExerciseStore, useProgressionStore, useReminderSettings, useSettingsStore, useWeightSettings } from '@/stores'
import { EXERCISE_REGISTRY } from '@/features/exercises'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '@/features/progression'
import { useTheme } from '@/components/theme/ThemeProvider'
import { BACKGROUND_OPTIONS, REMINDER_INTERVAL_OPTIONS, ReminderInterval, WeightUnit } from '@/types'

type ConfirmAction = 'progress' | 'history' | 'all' | null

export const SettingsView: React.FC = () => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [notificationTestResult, setNotificationTestResult] = useState<string | null>(null)
  const { clearHistory } = useExerciseStore()
  const { resetProgression, data, isAchievementUnlocked } = useProgressionStore()
  const { background, setBackground } = useTheme()
  const { reminders, updateReminders } = useReminderSettings()
  const { settings, updateSection } = useSettingsStore()
  const { weightUnit, updateWeightUnit } = useWeightSettings()

  const handleReset = async (action: ConfirmAction) => {
    if (!action) return
    
    setIsResetting(true)
    try {
      switch (action) {
        case 'progress':
          await resetProgression()
          break
        case 'history':
          await clearHistory()
          break
        case 'all':
          await resetProgression()
          await clearHistory()
          break
      }
    } catch (error) {
      console.error('Reset failed:', error)
    } finally {
      setIsResetting(false)
      setConfirmAction(null)
    }
  }

  const getConfirmMessage = (action: ConfirmAction) => {
    switch (action) {
      case 'progress':
        return 'This will reset all XP, levels, unlocks, and achievements. Your exercise history will be kept.'
      case 'history':
        return 'This will delete all logged exercises. Your progression (XP, levels, unlocks) will be kept.'
      case 'all':
        return 'This will delete EVERYTHING and start fresh. All data will be permanently lost!'
      default:
        return ''
    }
  }

  // Calculate stats
  const unlockedCount = Object.values(data.exercises).filter(p => p.unlocked).length
  const achievementCount = data.achievements.length

  return (
    <div className="settings-view">
      {/* Break Reminders */}
      <div className="settings-section">
        <h3 className="settings-section-title">⏰ Break Reminders</h3>
        
        {/* Enable/Disable Toggle */}
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Enable Reminders</span>
            <span className="setting-desc">Get notified to take exercise breaks</span>
          </div>
          <button
            className={`toggle-btn ${reminders.enabled ? 'active' : ''}`}
            onClick={() => {
              updateReminders({ enabled: !reminders.enabled })
              // Notify background script
              chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' })
            }}
            aria-label={reminders.enabled ? 'Disable reminders' : 'Enable reminders'}
          >
            <span className="toggle-slider" />
          </button>
        </div>

        {reminders.enabled && (
          <>
            {/* Interval Selection */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Reminder Interval</span>
                <span className="setting-desc">How often to remind you</span>
              </div>
              <select
                className="setting-select"
                value={reminders.intervalMinutes}
                onChange={(e) => {
                  updateReminders({ intervalMinutes: Number(e.target.value) as ReminderInterval })
                  chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' })
                }}
              >
                {REMINDER_INTERVAL_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
            </div>

            {/* Active Time Tracking */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Smart Time Tracking</span>
                <span className="setting-desc">Only count active browsing time</span>
              </div>
              <button
                className={`toggle-btn ${reminders.useActiveTimeTracking ? 'active' : ''}`}
                onClick={() => {
                  updateReminders({ useActiveTimeTracking: !reminders.useActiveTimeTracking })
                  chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATED' })
                }}
              >
                <span className="toggle-slider" />
              </button>
            </div>

            {/* Smart Suggestions */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Smart Suggestions</span>
                <span className="setting-desc">Suggest exercises based on history</span>
              </div>
              <button
                className={`toggle-btn ${reminders.smartSuggestions ? 'active' : ''}`}
                onClick={() => {
                  updateReminders({ smartSuggestions: !reminders.smartSuggestions })
                }}
              >
                <span className="toggle-slider" />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Notification Sound</span>
                <span className="setting-desc">Play sound with reminders</span>
              </div>
              <button
                className={`toggle-btn ${reminders.soundEnabled ? 'active' : ''}`}
                onClick={() => {
                  updateReminders({ soundEnabled: !reminders.soundEnabled })
                }}
              >
                <span className="toggle-slider" />
              </button>
            </div>

            {/* Quiet Hours */}
            <div className="setting-row quiet-hours">
              <div className="setting-info">
                <span className="setting-label">Quiet Hours</span>
                <span className="setting-desc">No reminders during these hours</span>
              </div>
              <div className="quiet-hours-inputs">
                <select
                  className="setting-select small"
                  value={reminders.quietHoursStart ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value)
                    updateReminders({ 
                      quietHoursStart: value,
                      quietHoursEnd: value === null ? null : (reminders.quietHoursEnd ?? 7)
                    })
                  }}
                >
                  <option value="">Off</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                {reminders.quietHoursStart !== null && (
                  <>
                    <span className="quiet-hours-separator">to</span>
                    <select
                      className="setting-select small"
                      value={reminders.quietHoursEnd ?? 7}
                      onChange={(e) => {
                        updateReminders({ quietHoursEnd: Number(e.target.value) })
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Test Notification (debug) */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Test Notification</span>
                <span className="setting-desc">
                  Sends a test desktop notification and reports permission state
                </span>
                {notificationTestResult && (
                  <span className="setting-desc">{notificationTestResult}</span>
                )}
              </div>
              <button
                className="reset-btn warning"
                onClick={async () => {
                  setNotificationTestResult('Testing...')
                  try {
                    const response = await chrome.runtime.sendMessage({ type: 'TEST_NOTIFICATION' })
                    const level = response?.level || 'unknown'
                    if (response?.success) {
                      const createdId = response?.createdId || 'unknown'
                      const activeCount = response?.activeCount ?? 'unknown'
                      setNotificationTestResult(
                        `Sent. Permission: ${level}. Created: ${createdId}. Active: ${activeCount}`
                      )
                    } else {
                      setNotificationTestResult(
                        `Failed. Permission: ${level}. Error: ${response?.error || 'unknown'}`
                      )
                    }
                  } catch (error) {
                    setNotificationTestResult(`Failed to contact background: ${String(error)}`)
                  }
                }}
              >
                Send Test
              </button>
            </div>
          </>
        )}
      </div>

      {/* Movement Goal */}
      <div className="settings-section">
        <h3 className="settings-section-title">🏃 Movement Minutes Goal</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Daily Goal</span>
            <span className="setting-desc">Minutes of movement per day</span>
          </div>
          <select
            className="setting-select"
            value={settings.movementGoal.dailyGoalMinutes}
            onChange={(e) => {
              updateSection('movementGoal', { dailyGoalMinutes: Number(e.target.value) })
            }}
          >
            {[10, 15, 20, 30, 45, 60, 90].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} min
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weight Unit */}
      <div className="settings-section">
        <h3 className="settings-section-title">🏋️ Weight Settings</h3>
        
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Weight Unit</span>
            <span className="setting-desc">Unit for dumbbell exercises</span>
          </div>
          <select
            className="setting-select"
            value={weightUnit}
            onChange={(e) => {
              updateWeightUnit(e.target.value as WeightUnit)
            }}
          >
            <option value="lbs">Pounds (lbs)</option>
            <option value="kg">Kilograms (kg)</option>
          </select>
        </div>
      </div>

      {/* Background Selection */}
      <div className="settings-section">
        <h3 className="settings-section-title">🎨 Background</h3>
        <div className="background-options">
          {BACKGROUND_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`background-option ${background === option.id ? 'active' : ''}`}
              onClick={() => setBackground(option.id)}
            >
              <span className="background-option-name">{option.name}</span>
              <span className="background-option-desc">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* App Stats */}
      <div className="settings-section">
        <h3 className="settings-section-title">📊 Your Stats</h3>
        <div className="settings-stats">
          <div className="settings-stat">
            <span className="settings-stat-value">{data.totalXp.toLocaleString()}</span>
            <span className="settings-stat-label">Total XP</span>
          </div>
          <div className="settings-stat">
            <span className="settings-stat-value">{unlockedCount}/{EXERCISE_REGISTRY.length}</span>
            <span className="settings-stat-label">Exercises</span>
          </div>
          <button 
            className="settings-stat clickable"
            onClick={() => setShowAchievements(true)}
          >
            <span className="settings-stat-value">{achievementCount}/{ACHIEVEMENTS.length}</span>
            <span className="settings-stat-label">Achievements →</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3 className="settings-section-title">⚠️ Danger Zone</h3>
        
        <div className="reset-option">
          <div className="reset-option-info">
            <h4>Reset Progression</h4>
            <p>Reset all XP, levels, unlocked exercises, and achievements back to start.</p>
          </div>
          <button 
            className="reset-btn warning"
            onClick={() => setConfirmAction('progress')}
            disabled={isResetting}
          >
            Reset Progress
          </button>
        </div>

        <div className="reset-option">
          <div className="reset-option-info">
            <h4>Clear Exercise History</h4>
            <p>Delete all logged exercises. Your progression will remain intact.</p>
          </div>
          <button 
            className="reset-btn warning"
            onClick={() => setConfirmAction('history')}
            disabled={isResetting}
          >
            Clear History
          </button>
        </div>

        <div className="reset-option">
          <div className="reset-option-info">
            <h4>Reset Everything</h4>
            <p>Delete all data and start completely fresh. This cannot be undone!</p>
          </div>
          <button 
            className="reset-btn danger"
            onClick={() => setConfirmAction('all')}
            disabled={isResetting}
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h3 className="settings-section-title">ℹ️ About</h3>
        <div className="about-info">
          <p><strong>RepsXtension</strong> v1.0.0</p>
          <p>Micro workouts for remote workers</p>
          <p className="about-muted">All data stored locally in your browser</p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <>
          <div className="confirm-backdrop" onClick={() => setConfirmAction(null)} />
          <div className="confirm-dialog">
            <div className="confirm-icon">
              {confirmAction === 'all' ? '🗑️' : '⚠️'}
            </div>
            <h3 className="confirm-title">
              {confirmAction === 'all' ? 'Reset Everything?' : 'Are you sure?'}
            </h3>
            <p className="confirm-message">
              {getConfirmMessage(confirmAction)}
            </p>
            <div className="confirm-actions">
              <button 
                className="confirm-btn cancel"
                onClick={() => setConfirmAction(null)}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button 
                className={`confirm-btn ${confirmAction === 'all' ? 'danger' : 'warning'}`}
                onClick={() => handleReset(confirmAction)}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <>
          <div className="confirm-backdrop" onClick={() => setShowAchievements(false)} />
          <div className="achievements-modal">
            <div className="achievements-modal-header">
              <h2 className="achievements-modal-title">🏆 Achievements</h2>
              <span className="achievements-modal-count">
                {achievementCount} / {ACHIEVEMENTS.length} unlocked
              </span>
              <button 
                className="achievements-modal-close"
                onClick={() => setShowAchievements(false)}
              >
                ✕
              </button>
            </div>
            <div className="achievements-modal-content">
              {Object.entries(ACHIEVEMENT_CATEGORIES).map(([categoryId, category]) => {
                const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === categoryId)
                if (categoryAchievements.length === 0) return null
                
                return (
                  <div key={categoryId} className="achievement-category">
                    <h3 className="achievement-category-title">
                      {category.icon} {category.name}
                    </h3>
                    <div className="achievement-list">
                      {categoryAchievements.map(achievement => {
                        const unlocked = isAchievementUnlocked(achievement.id)
                        return (
                          <div 
                            key={achievement.id} 
                            className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}
                          >
                            <span className="achievement-icon">
                              {unlocked ? achievement.icon : '🔒'}
                            </span>
                            <div className="achievement-info">
                              <span className="achievement-name">{achievement.name}</span>
                              <span className="achievement-desc">{achievement.description}</span>
                            </div>
                            {achievement.xpReward && (
                              <span className="achievement-xp">+{achievement.xpReward} XP</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

