/**
 * App Component
 * Main application entry point
 * 
 * This is now a thin shell that composes providers and views.
 * All business logic lives in stores and feature modules.
 */

import React, { useState } from 'react'

// Providers
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ExerciseStoreProvider } from '@/stores'

// Common components
import { Header, Footer, ViewToggle, ViewMode } from '@/components/common'

// Feature views
import { DashboardView } from '@/features/dashboard'
import { HistoryView } from '@/features/history'

/**
 * Root App component
 * Wraps everything in necessary providers
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ExerciseStoreProvider>
        <TrainerApp />
      </ExerciseStoreProvider>
    </ThemeProvider>
  )
}

/**
 * Main application content
 * Handles view routing and layout
 */
const TrainerApp: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard')

  return (
    <div className="trainer-container">
      <Header />
      
      <ViewToggle view={view} onViewChange={setView} />

      {view === 'dashboard' ? (
        <DashboardView />
      ) : (
        <HistoryView />
      )}

      <Footer />
    </div>
  )
}

export default App
