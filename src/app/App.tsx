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
import { ExerciseStoreProvider, ProgressionStoreProvider } from '@/stores'

// Common components
import { Header, Footer, ViewToggle, ViewMode } from '@/components/common'

// Feature views
import { DashboardView } from '@/features/dashboard'
import { HistoryView } from '@/features/history'
import { SettingsView } from '@/features/settings'

/**
 * Root App component
 * Wraps everything in necessary providers
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ProgressionStoreProvider>
        <ExerciseStoreProvider>
          <TrainerApp />
        </ExerciseStoreProvider>
      </ProgressionStoreProvider>
    </ThemeProvider>
  )
}

/**
 * Main application content
 * Handles view routing and layout
 */
const TrainerApp: React.FC = () => {
  const [view, setView] = useState<ViewMode>('dashboard')

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView />
      case 'history':
        return <HistoryView />
      case 'settings':
        return <SettingsView />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="trainer-container">
      <Header />
      
      <ViewToggle view={view} onViewChange={setView} />

      {renderView()}

      <Footer />
    </div>
  )
}

export default App
