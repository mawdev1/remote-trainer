/**
 * ProgressHeader Component
 * Shows total XP, daily progress, streak, and achievements overview
 */

import React, { useState } from 'react'
import { useTotalProgression, useProgressionStore, useStreakDisplay, useStreakStore, useDisplaySettings } from '@/stores'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '@/features/progression'

/**
 * Animated flame icon component
 */
const FlameIcon: React.FC<{ intensity: number }> = ({ intensity }) => {
  if (intensity === 0) return <span className="streak-flame-empty">🔥</span>
  
  return (
    <span className={`streak-flame streak-flame-${intensity}`}>
      🔥
    </span>
  )
}

export const ProgressHeader: React.FC = () => {
  const { totalXp, dailyXp, achievementsUnlocked, totalAchievements } = useTotalProgression()
  const { isAchievementUnlocked } = useProgressionStore()
  const { current, longest, freezesRemaining, flameIntensity, isAtRisk, isActiveToday, isFrozenToday } = useStreakDisplay()
  const { useFreeze } = useStreakStore()
  const { display } = useDisplaySettings()
  const showStreak = display.showStreak
  const [showAchievements, setShowAchievements] = useState(false)
  const [showStreakModal, setShowStreakModal] = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [freezeError, setFreezeError] = useState<string | null>(null)

  /**
   * Handle using a streak freeze
   */
  const handleUseFreeze = async () => {
    setFreezeLoading(true)
    setFreezeError(null)
    
    const result = await useFreeze()
    
    setFreezeLoading(false)
    if (!result.success) {
      setFreezeError(result.reason || 'Failed to use freeze')
    }
  }

  return (
    <>
      <div className="progress-header">
        {/* Streak - Only show if enabled */}
        {showStreak && (
          <button 
            className={`progress-stat clickable streak-stat ${isAtRisk ? 'at-risk' : ''} ${isActiveToday ? 'active-today' : ''}`}
            onClick={() => setShowStreakModal(true)}
          >
            <FlameIcon intensity={flameIntensity} />
            <div className="progress-stat-content">
              <span className="progress-stat-value">{current}</span>
              <span className="progress-stat-label">
                {current === 1 ? 'Day' : 'Days'} →
              </span>
            </div>
          </button>
        )}
        
        <div className="progress-stat">
          <span className="progress-stat-icon">⚡</span>
          <div className="progress-stat-content">
            <span className="progress-stat-value">{totalXp.toLocaleString()}</span>
            <span className="progress-stat-label">Total XP</span>
          </div>
        </div>
        <div className="progress-stat">
          <span className="progress-stat-icon">📅</span>
          <div className="progress-stat-content">
            <span className="progress-stat-value">{dailyXp}</span>
            <span className="progress-stat-label">Today</span>
          </div>
        </div>
        <button 
          className="progress-stat clickable"
          onClick={() => setShowAchievements(true)}
        >
          <span className="progress-stat-icon">🏆</span>
          <div className="progress-stat-content">
            <span className="progress-stat-value">{achievementsUnlocked}/{totalAchievements}</span>
            <span className="progress-stat-label">Badges →</span>
          </div>
        </button>
      </div>

      {/* Streak Modal */}
      {showStreakModal && (
        <>
          <div className="confirm-backdrop" onClick={() => setShowStreakModal(false)} />
          <div className="streak-modal">
            <div className="streak-modal-header">
              <h2 className="streak-modal-title">
                <FlameIcon intensity={flameIntensity} /> Streak
              </h2>
              <button 
                className="streak-modal-close"
                onClick={() => setShowStreakModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="streak-modal-content">
              {/* Current Streak */}
              <div className="streak-current">
                <span className="streak-current-number">{current}</span>
                <span className="streak-current-label">
                  {current === 1 ? 'Day Streak' : 'Day Streak'}
                </span>
              </div>
              
              {/* Status Indicator */}
              <div className={`streak-status ${isActiveToday ? 'active' : isAtRisk ? 'at-risk' : isFrozenToday ? 'frozen' : ''}`}>
                {isActiveToday && <span>✅ You&apos;ve exercised today!</span>}
                {isAtRisk && <span>⚠️ Don&apos;t break your streak!</span>}
                {isFrozenToday && <span>❄️ Rest day - streak protected</span>}
                {!isActiveToday && !isAtRisk && !isFrozenToday && current === 0 && (
                  <span>💪 Start your streak today!</span>
                )}
              </div>

              {/* Stats */}
              <div className="streak-stats">
                <div className="streak-stat-item">
                  <span className="streak-stat-value">{longest}</span>
                  <span className="streak-stat-label">Best Streak</span>
                </div>
                <div className="streak-stat-item">
                  <span className="streak-stat-value">{freezesRemaining}</span>
                  <span className="streak-stat-label">Rest Days Left</span>
                </div>
              </div>

              {/* Freeze Button */}
              {!isActiveToday && !isFrozenToday && current > 0 && (
                <div className="streak-freeze-section">
                  <p className="streak-freeze-hint">
                    Need a break? Use a rest day to protect your streak.
                  </p>
                  <button 
                    className="streak-freeze-btn"
                    onClick={handleUseFreeze}
                    disabled={freezeLoading || freezesRemaining === 0}
                  >
                    {freezeLoading ? 'Using...' : `❄️ Use Rest Day (${freezesRemaining} left)`}
                  </button>
                  {freezeError && (
                    <p className="streak-freeze-error">{freezeError}</p>
                  )}
                </div>
              )}

              {/* Milestone Progress */}
              {current > 0 && (
                <div className="streak-milestone-section">
                  <div className="streak-milestone-label">
                    {current < 7 && `🎯 Next: 7 day streak`}
                    {current >= 7 && current < 14 && `🎯 Next: 14 day streak`}
                    {current >= 14 && current < 30 && `🎯 Next: 30 day streak`}
                    {current >= 30 && current < 60 && `🎯 Next: 60 day streak`}
                    {current >= 60 && current < 90 && `🎯 Next: 90 day streak`}
                    {current >= 90 && current < 180 && `🎯 Next: 180 day streak`}
                    {current >= 180 && current < 365 && `🎯 Next: 365 day streak`}
                    {current >= 365 && `👑 Legendary status!`}
                  </div>
                </div>
              )}
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
                {achievementsUnlocked} / {totalAchievements} unlocked
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
    </>
  )
}

