/**
 * SettingsView Component
 * Settings page with reset options and app info
 */

import React, { useState } from 'react'
import { useExerciseStore, useProgressionStore } from '@/stores'
import { EXERCISE_REGISTRY } from '@/features/exercises'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '@/features/progression'
import { useTheme } from '@/components/theme/ThemeProvider'
import { BACKGROUND_OPTIONS, BackgroundStyle } from '@/types'

type ConfirmAction = 'progress' | 'history' | 'all' | null

export const SettingsView: React.FC = () => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const { clearHistory } = useExerciseStore()
  const { resetProgression, data, isAchievementUnlocked } = useProgressionStore()
  const { background, setBackground } = useTheme()

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
          <p><strong>Ext & Flex</strong> v1.0.0</p>
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

