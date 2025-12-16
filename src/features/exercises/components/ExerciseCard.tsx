/**
 * ExerciseCard Component
 * Card for displaying and logging a single exercise type
 * Now with XP bar, level display, weight input, and PB tracking!
 */

import React, { useState, useEffect } from 'react'
import { ExerciseDefinition, PersonalBest } from '@/types'
import { getXpForNextLevel, getXpForCurrentLevel } from '@/types/progression'
import {
  useExerciseStats,
  useExerciseStore,
  useExerciseProgression,
  useProgressionStore,
  usePersonalBests,
  useWeightSettings,
} from '@/stores'

interface ExerciseCardProps {
  /** Exercise definition from registry */
  exercise: ExerciseDefinition
  /** Override quick options (optional) */
  quickOptions?: number[]
}

/**
 * Format PB display text based on exercise type
 */
function formatPBDisplay(
  pb: PersonalBest | null,
  isTimeBased: boolean,
  weightUnit: string
): string {
  if (!pb) return 'No PB yet'
  
  const valueLabel = isTimeBased ? `${pb.value}s` : `${pb.value} reps`
  
  if (pb.weight !== undefined) {
    return `${valueLabel} @ ${pb.weight} ${weightUnit}`
  }
  
  return valueLabel
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  quickOptions,
}) => {
  const [customValue, setCustomValue] = useState('')
  const [weightValue, setWeightValue] = useState('')
  const [showPBCelebration, setShowPBCelebration] = useState(false)
  
  const { logExercise } = useExerciseStore()
  const { addXp } = useProgressionStore()
  const { today, week, isAnimating } = useExerciseStats(exercise.id)
  const progression = useExerciseProgression(exercise.id)
  const personalBests = usePersonalBests(exercise.id)
  const { weightUnit } = useWeightSettings()

  const options = quickOptions || exercise.defaultQuickOptions
  const isWeighted = exercise.requiresWeight
  const isTimeBased = exercise.trackingType === 'duration'
  const unitLabel = isTimeBased ? 's' : ''

  // Get current PB for display
  const getCurrentPB = (): PersonalBest | null => {
    if (!personalBests) return null
    
    if (isWeighted && weightValue) {
      // For weighted exercises, show PB at current weight
      return personalBests.weightedPbs?.[weightValue] || null
    }
    
    // For non-weighted, show the single PB
    return personalBests.pb || null
  }

  const currentPB = getCurrentPB()

  /**
   * Handle logging exercise with optional weight
   */
  const handleLog = async (value: number) => {
    const weight = isWeighted && weightValue ? parseInt(weightValue, 10) : undefined
    
    // Validate weight for weighted exercises
    if (isWeighted && !weight) {
      return // Don't log if weight is required but not provided
    }
    
    const pbResult = await logExercise(exercise.id, value, weight)
    await addXp(exercise.id, value)
    
    // Show PB celebration if achieved
    if (pbResult.isNewPB) {
      setShowPBCelebration(true)
      setTimeout(() => setShowPBCelebration(false), 2000)
    }
  }

  const handleQuickAdd = async (value: number) => {
    await handleLog(value)
  }

  const handleCustomSubmit = async () => {
    const value = parseInt(customValue, 10)
    if (value > 0) {
      await handleLog(value)
      setCustomValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit()
    }
  }

  // XP progress calculation
  const currentLevelXp = getXpForCurrentLevel(progression.level)
  const nextLevelXp = getXpForNextLevel(progression.level)
  const xpInLevel = progression.xp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp

  // Check if quick add buttons should be disabled (weighted exercise without weight)
  const isQuickAddDisabled = isWeighted && !weightValue

  return (
    <div className={`exercise-card ${isAnimating ? 'pop-animation' : ''} ${showPBCelebration ? 'pb-celebration' : ''}`}>
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

      {/* PB Display */}
      <div className="pb-display" style={{ color: exercise.color }}>
        <span className="pb-icon">🏆</span>
        <span className="pb-label">PB:</span>
        <span className="pb-value">
          {formatPBDisplay(currentPB, isTimeBased, weightUnit)}
        </span>
        {showPBCelebration && (
          <span className="pb-new-badge">NEW!</span>
        )}
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
        {/* Weight input for weighted exercises */}
        {isWeighted && (
          <div className="weight-input-row">
            <label className="weight-label">Weight ({weightUnit}):</label>
            <input
              type="number"
              className="weight-input"
              placeholder={`Enter ${weightUnit}`}
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              min="1"
              max="999"
              aria-label={`Weight in ${weightUnit}`}
            />
          </div>
        )}

        <div className="quick-btns-row">
          {options.map((value) => (
            <button
              key={value}
              className="quick-btn"
              onClick={() => handleQuickAdd(value)}
              disabled={isQuickAddDisabled}
              aria-label={`Add ${value} ${isTimeBased ? 'seconds' : 'reps'}`}
              title={isQuickAddDisabled ? 'Enter weight first' : undefined}
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
            disabled={!customValue || isQuickAddDisabled}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

