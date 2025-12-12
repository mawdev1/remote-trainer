/**
 * StatsSummary Component
 * Summary cards showing today's and week's totals
 */

import React from 'react'
import { useTotalStats } from '@/stores'

export const StatsSummary: React.FC = () => {
  const { todayTotals, weekTotals } = useTotalStats()

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
    </div>
  )
}

