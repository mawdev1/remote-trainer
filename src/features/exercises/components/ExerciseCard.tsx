/**
 * ExerciseCard Component
 * Card for displaying and logging a single exercise type
 * Now with XP bar and level display!
 */

import React, { useState } from 'react'
import { ExerciseDefinition } from '@/types'
import { getLevelProgress, getXpForNextLevel, getXpForCurrentLevel, MAX_LEVEL } from '@/types/progression'
import { useExerciseStats, useExerciseStore, useExerciseProgression, useProgressionStore } from '@/stores'

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
  const { addXp } = useProgressionStore()
  const { today, week, isAnimating } = useExerciseStats(exercise.id)
  const progression = useExerciseProgression(exercise.id)

  const options = quickOptions || exercise.defaultQuickOptions

  const handleQuickAdd = async (value: number) => {
    await logExercise(exercise.id, value)
    await addXp(exercise.id, value)
  }

  const handleCustomSubmit = async () => {
    const value = parseInt(customValue, 10)
    if (value > 0) {
      await logExercise(exercise.id, value)
      await addXp(exercise.id, value)
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

  // XP progress calculation
  const currentLevelXp = getXpForCurrentLevel(progression.level)
  const nextLevelXp = getXpForNextLevel(progression.level)
  const xpInLevel = progression.xp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp

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
        <div className="exercise-header-text">
          <div className="exercise-title-row">
            <h3 className="exercise-title">{exercise.name}</h3>
            <span 
              className="exercise-level"
              style={{ color: exercise.color }}
            >
              Lv.{progression.level}
            </span>
          </div>
          <p className="exercise-subtitle">{progression.levelTitle}</p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-bar-container">
        <div 
          className="xp-bar"
          style={{
            width: `${progression.isMaxLevel ? 100 : progression.levelProgress}%`,
            background: `linear-gradient(90deg, ${exercise.color} 0%, ${exercise.colorEnd} 100%)`,
          }}
        />
        <span className="xp-text">
          {progression.isMaxLevel ? (
            '✨ MAX LEVEL'
          ) : (
            `${xpInLevel} / ${xpNeeded} XP`
          )}
        </span>
      </div>

      <div className="exercise-stats">
        <div className="stat-item">
          <span className="stat-value">{today.totalValue}{unitLabel}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{progression.xp}</span>
          <span className="stat-label">Total XP</span>
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

