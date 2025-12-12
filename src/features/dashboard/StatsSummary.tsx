/**
 * StatsSummary Component
 * Summary cards showing today's totals, week's totals, and movement minutes
 */

import React from 'react'
import { useTotalStats } from '@/stores'
import { useMovementMinutes } from '@/lib/hooks'

export const StatsSummary: React.FC = () => {
  const { todayTotals, weekTotals } = useTotalStats()
  const { minutes, goal, percentage, isGoalMet } = useMovementMinutes()

  return (
    <div className="stats-summary">
      <div className="summary-card">
        <h4>Today</h4>
        <div className="summary-value">{todayTotals.totalValue}</div>
        <div className="summary-detail">{todayTotals.setCount} sets completed</div>
      </div>
      <div className="summary-card">
        <h4>This Week</h4>
        <div className="summary-value">{weekTotals.totalValue}</div>
        <div className="summary-detail">{weekTotals.setCount} sets completed</div>
      </div>
      <div className={`summary-card movement-card ${isGoalMet ? 'goal-met' : ''}`}>
        <h4>Movement</h4>
        <div className="movement-progress-container">
          <svg className="movement-ring" viewBox="0 0 36 36">
            <path
              className="movement-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="movement-ring-progress"
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="movement-ring-text">
              {Math.round(minutes)}
            </text>
          </svg>
          <div className="movement-info">
            <span className="movement-goal">{minutes.toFixed(0)} / {goal} min</span>
            {isGoalMet && <span className="movement-complete">🎉 Goal met!</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

