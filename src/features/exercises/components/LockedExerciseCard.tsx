/**
 * LockedExerciseCard Component
 * Shows a locked exercise with unlock requirements
 */

import React from 'react'
import { ExerciseDefinition } from '@/types'
import { useUnlockInfo } from '@/stores'

interface LockedExerciseCardProps {
  /** Exercise definition from registry */
  exercise: ExerciseDefinition
}

export const LockedExerciseCard: React.FC<LockedExerciseCardProps> = ({
  exercise,
}) => {
  const { requirement, progress, isReady } = useUnlockInfo(exercise.id)

  return (
    <div className={`exercise-card locked ${isReady ? 'ready-to-unlock' : ''}`}>
      <div className="exercise-header">
        <div
          className="exercise-icon locked-icon"
          style={{
            background: `linear-gradient(135deg, ${exercise.color}40 0%, ${exercise.colorEnd}40 100%)`,
          }}
        >
          <span className="lock-overlay">🔒</span>
          <span className="hidden-emoji">{exercise.icon}</span>
        </div>
        <div className="exercise-header-text">
          <h3 className="exercise-title locked-title">{exercise.name}</h3>
          <p className="exercise-subtitle">{exercise.subtitle}</p>
        </div>
      </div>

      {/* Unlock Progress */}
      <div className="unlock-progress-container">
        <div 
          className="unlock-progress-bar"
          style={{
            width: `${progress}%`,
            background: isReady 
              ? `linear-gradient(90deg, #22c55e 0%, #16a34a 100%)`
              : `linear-gradient(90deg, ${exercise.color}80 0%, ${exercise.colorEnd}80 100%)`,
          }}
        />
      </div>

      <div className="unlock-requirement">
        <span className="requirement-icon">{isReady ? '✨' : '🎯'}</span>
        <span className="requirement-text">
          {isReady ? 'Ready to unlock!' : requirement?.description || 'Unknown requirement'}
        </span>
        <span className="requirement-progress">{progress}%</span>
      </div>

      {isReady && (
        <div className="unlock-hint">
          Complete any exercise to unlock!
        </div>
      )}
    </div>
  )
}

