/**
 * ViewToggle Component
 * Tab-style toggle for switching between views
 */

import React from 'react'

export type ViewMode = 'dashboard' | 'history' | 'settings'

interface ViewToggleProps {
  /** Current active view */
  view: ViewMode
  /** Callback when view changes */
  onViewChange: (view: ViewMode) => void
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => (
  <div className="view-toggle" role="tablist">
    <button
      role="tab"
      aria-selected={view === 'dashboard'}
      className={view === 'dashboard' ? 'active' : ''}
      onClick={() => onViewChange('dashboard')}
    >
      Dashboard
    </button>
    <button
      role="tab"
      aria-selected={view === 'history'}
      className={view === 'history' ? 'active' : ''}
      onClick={() => onViewChange('history')}
    >
      History
    </button>
    <button
      role="tab"
      aria-selected={view === 'settings'}
      className={view === 'settings' ? 'active' : ''}
      onClick={() => onViewChange('settings')}
    >
      ⚙️ Settings
    </button>
  </div>
)

