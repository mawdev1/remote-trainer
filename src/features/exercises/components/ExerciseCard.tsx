/**
 * ExerciseCard Component
 * Card for displaying and logging a single exercise type
 */

import React, { useState } from 'react'
import { ExerciseDefinition } from '@/types'
import { useExerciseStats, useExerciseStore } from '@/stores'

interface ExerciseCardProps {
  /** Exercise definition from registry */
  exercise: ExerciseDefinition
  /** Override quick options (optional) */
  quickOptions?: number[]
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  quickOptions,
}) => {
  const [customValue, setCustomValue] = useState('')
  const { logExercise } = useExerciseStore()
  const { today, week, isAnimating } = useExerciseStats(exercise.id)

  const options = quickOptions || exercise.defaultQuickOptions

  const handleQuickAdd = async (value: number) => {
    await logExercise(exercise.id, value)
  }

  const handleCustomSubmit = async () => {
    const value = parseInt(customValue, 10)
    if (value > 0) {
      await logExercise(exercise.id, value)
      setCustomValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit()
    }
  }

  // Determine unit label based on tracking type
  const isTimeBased = exercise.trackingType === 'duration'
  const unitLabel = isTimeBased ? 's' : ''

  return (
    <div className={`exercise-card ${isAnimating ? 'pop-animation' : ''}`}>
      <div className="exercise-header">
        <div
          className="exercise-icon"
          style={{
            background: `linear-gradient(135deg, ${exercise.color} 0%, ${exercise.colorEnd} 100%)`,
          }}
        >
          {exercise.icon}
        </div>
        <div>
          <h3 className="exercise-title">{exercise.name}</h3>
          <p className="exercise-subtitle">{exercise.subtitle}</p>
        </div>
      </div>

      <div className="exercise-stats">
        <div className="stat-item">
          <span className="stat-value">{today.totalValue}{unitLabel}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{today.setCount}</span>
          <span className="stat-label">Sets</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{week.totalValue}{unitLabel}</span>
          <span className="stat-label">This Week</span>
        </div>
      </div>

      <div className="exercise-actions">
        <div className="quick-btns-row">
          {options.map((value) => (
            <button
              key={value}
              className="quick-btn"
              onClick={() => handleQuickAdd(value)}
              aria-label={`Add ${value} ${isTimeBased ? 'seconds' : 'reps'}`}
            >
              +{value}{unitLabel}
            </button>
          ))}
        </div>
        <div className="custom-rep-input">
          <input
            type="number"
            placeholder={isTimeBased ? 'Seconds' : 'Custom'}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleKeyDown}
            min="1"
            max="9999"
            aria-label={`Custom ${isTimeBased ? 'duration' : 'reps'} input`}
          />
          <button
            className="quick-btn primary"
            onClick={handleCustomSubmit}
            disabled={!customValue}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

