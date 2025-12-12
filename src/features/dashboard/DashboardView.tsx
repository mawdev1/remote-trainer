/**
 * DashboardView Component
 * Main dashboard showing stats summary and exercise cards
 */

import React from 'react'
import { useExerciseStore } from '@/stores'
import { ExerciseCard } from '@/features/exercises'
import { StatsSummary } from './StatsSummary'

export const DashboardView: React.FC = () => {
  const { enabledExercises, isLoading } = useExerciseStore()

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <StatsSummary />
      
      {enabledExercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
        />
      ))}
    </>
  )
}

