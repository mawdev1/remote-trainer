/**
 * ProgressHeader Component
 * Shows total XP, daily progress, and achievements overview
 */

import React, { useState } from 'react'
import { useTotalProgression, useProgressionStore } from '@/stores'
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '@/features/progression'

export const ProgressHeader: React.FC = () => {
  const { totalXp, dailyXp, achievementsUnlocked, totalAchievements } = useTotalProgression()
  const { isAchievementUnlocked } = useProgressionStore()
  const [showAchievements, setShowAchievements] = useState(false)

  return (
    <>
      <div className="progress-header">
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

