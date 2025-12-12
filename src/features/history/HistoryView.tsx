/**
 * HistoryView Component
 * Shows exercise history with bar charts
 */

import React from 'react'
import { useExerciseHistory, useExerciseStore } from '@/stores'
import { DailyTotals, ExerciseDefinition } from '@/types'

export const HistoryView: React.FC = () => {
  const { history, exercises } = useExerciseHistory()
  const { clearHistory } = useExerciseStore()

  // Find max value for scaling bars
  const maxValue = Math.max(
    ...history.flatMap((day) =>
      exercises.map((ex) => day.totals[ex.id] || 0)
    ),
    1
  )

  // Check if there's any data
  const hasData = history.some((day) =>
    exercises.some((ex) => (day.totals[ex.id] || 0) > 0)
  )

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all workout history? This cannot be undone.')) {
      clearHistory()
    }
  }

  if (!hasData) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <p className="empty-state-text">No workout history yet.</p>
        <p className="empty-state-text">Start logging exercises to see your progress!</p>
      </div>
    )
  }

  return (
    <>
      <div className="history-list">
        {history.map((day, idx) => (
          <HistoryItem
            key={day.dateISO || idx}
            day={day}
            exercises={exercises}
            maxValue={maxValue}
          />
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <HistoryLegend exercises={exercises} />
        <button
          className="quick-btn"
          onClick={handleClearHistory}
          style={{ width: '100%', color: '#ef4444', borderColor: '#ef4444' }}
        >
          Clear All History
        </button>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface HistoryItemProps {
  day: DailyTotals
  exercises: ExerciseDefinition[]
  maxValue: number
}

const HistoryItem: React.FC<HistoryItemProps> = ({ day, exercises, maxValue }) => (
  <div className="history-item">
    <div className="history-date">{day.date}</div>
    <div className="history-bars">
      {exercises.map((ex) => {
        const value = day.totals[ex.id] || 0
        const width = (value / maxValue) * 100
        return (
          <div
            key={ex.id}
            className="history-bar"
            style={{
              width: `${width}%`,
              minWidth: value > 0 ? '4px' : '0',
              background: `linear-gradient(90deg, ${ex.color} 0%, ${ex.colorEnd} 100%)`,
            }}
            title={`${ex.name}: ${value}`}
          />
        )
      })}
    </div>
    <div className="history-values">
      {exercises.map((ex) => (
        <span
          key={ex.id}
          className="history-value"
          style={{ color: ex.colorEnd }}
        >
          {day.totals[ex.id] || 0}
        </span>
      ))}
    </div>
  </div>
)

interface HistoryLegendProps {
  exercises: ExerciseDefinition[]
}

const HistoryLegend: React.FC<HistoryLegendProps> = ({ exercises }) => (
  <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.75rem' }}>
    {exercises.map((ex) => (
      <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${ex.color} 0%, ${ex.colorEnd} 100%)`,
          }}
        />
        <span style={{ color: 'var(--text-secondary)' }}>{ex.name}</span>
      </div>
    ))}
  </div>
)

