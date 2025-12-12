/**
 * DashboardView Component
 * Main dashboard showing stats summary and exercise cards
 * Now with progression system - unlocked and locked exercises!
 * Includes search functionality to filter exercises
 */

import React, { useState, useMemo } from 'react'
import { useProgressionStore } from '@/stores'
import { ExerciseCard, LockedExerciseCard } from '@/features/exercises'
import { getExerciseById } from '@/features/exercises'
import { ExerciseDefinition } from '@/types'
import { UnlockCelebration } from '@/features/progression'
import { StatsSummary } from './StatsSummary'
import { ProgressHeader } from './ProgressHeader'

export const DashboardView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { isLoading, getUnlockedExercises, getLockedExercises } = useProgressionStore()

  // Filter function for exercises
  const filterExercises = (exercises: (ExerciseDefinition | undefined)[], query: string) => {
    if (!query.trim()) return exercises.filter(Boolean) as ExerciseDefinition[]
    
    const lowerQuery = query.toLowerCase().trim()
    return exercises.filter((exercise): exercise is ExerciseDefinition => {
      if (!exercise) return false
      return (
        exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.subtitle.toLowerCase().includes(lowerQuery) ||
        exercise.category.toLowerCase().includes(lowerQuery)
      )
    })
  }

  // Get and filter exercises
  const { filteredUnlocked, filteredLocked } = useMemo(() => {
    const unlockedIds = getUnlockedExercises()
    const lockedIds = getLockedExercises()

    const unlockedExercises = unlockedIds.map(id => getExerciseById(id))
    const lockedExercises = lockedIds.map(id => getExerciseById(id))

    return {
      filteredUnlocked: filterExercises(unlockedExercises, searchQuery),
      filteredLocked: filterExercises(lockedExercises, searchQuery),
    }
  }, [getUnlockedExercises, getLockedExercises, searchQuery])

  if (isLoading) {
    return (
      <div className="loading-state">
        <p>Loading...</p>
      </div>
    )
  }

  const totalFiltered = filteredUnlocked.length + filteredLocked.length
  const hasSearch = searchQuery.trim().length > 0

  return (
    <>
      <UnlockCelebration />
      <ProgressHeader />
      <StatsSummary />
      
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {hasSearch && (
          <span className="search-results-count">
            {totalFiltered} result{totalFiltered !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Unlocked Exercises */}
      {filteredUnlocked.length > 0 && (
        <div className="exercise-grid">
          {filteredUnlocked.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
            />
          ))}
        </div>
      )}

      {/* No Results Message */}
      {hasSearch && totalFiltered === 0 && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p className="no-results-text">No exercises found for "{searchQuery}"</p>
          <button 
            className="no-results-clear"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </button>
        </div>
      )}

      {/* Locked Exercises Section */}
      {filteredLocked.length > 0 && (
        <>
          <div className="locked-section-header">
            <span className="locked-section-icon">🔒</span>
            <span className="locked-section-title">
              Locked ({filteredLocked.length} to unlock)
            </span>
          </div>
          <div className="exercise-grid">
            {filteredLocked.map((exercise) => (
              <LockedExerciseCard
                key={exercise.id}
                exercise={exercise}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}

