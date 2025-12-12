/**
 * ProgressHeader Component
 * Shows total XP, daily progress, and achievements overview
 */

import React from 'react'
import { useTotalProgression } from '@/stores'
import { ACHIEVEMENTS } from '@/features/progression'

export const ProgressHeader: React.FC = () => {
  const { totalXp, dailyXp, achievementsUnlocked, totalAchievements } = useTotalProgression()

  return (
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
      <div className="progress-stat">
        <span className="progress-stat-icon">🏆</span>
        <div className="progress-stat-content">
          <span className="progress-stat-value">{achievementsUnlocked}/{totalAchievements}</span>
          <span className="progress-stat-label">Badges</span>
        </div>
      </div>
    </div>
  )
}

