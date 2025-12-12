/**
 * Header Component
 * App header with title, date, active time indicator, and theme toggle
 */

import React from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'
import { SunIcon, MoonIcon } from './icons'
import { formatDateLong } from '@/lib/utils/dates'
import { useActiveTime } from '@/lib/hooks'
import { useSettingsSection } from '@/stores'

interface HeaderProps {
  /** Optional custom date to display */
  date?: Date
}

export const Header: React.FC<HeaderProps> = ({ date = new Date() }) => {
  const { theme, setTheme } = useTheme()
  const { activeTimeFormatted, activeTimeMs } = useActiveTime()
  const reminderSettings = useSettingsSection('reminders')

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      // system - toggle to opposite of current
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'light' : 'dark')
    }
  }

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const dateString = formatDateLong(date)

  // Calculate urgency level for active time styling
  const intervalMs = reminderSettings.intervalMinutes * 60 * 1000
  const activePercentage = (activeTimeMs / intervalMs) * 100
  const urgencyClass = activePercentage >= 100 ? 'urgent' : activePercentage >= 75 ? 'warning' : ''

  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">
          <span className="gradient-text font-display">Ext</span> & Flex
        </h1>
        <p className="date-display">{dateString}</p>
      </div>
      
      <div className="header-right">
        {/* Active Time Indicator - only show if reminders are enabled */}
        {reminderSettings.enabled && (
          <div className={`active-time-indicator ${urgencyClass}`} title="Active browsing time since last exercise">
            <span className="active-time-icon">⏱️</span>
            <span className="active-time-value">{activeTimeFormatted}</span>
          </div>
        )}

        <button
          className="settings-btn"
          onClick={toggleTheme}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}

