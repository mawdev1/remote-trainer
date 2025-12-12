/**
 * Header Component
 * App header with title, date, and theme toggle
 */

import React from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'
import { SunIcon, MoonIcon } from './icons'
import { formatDateLong } from '@/lib/utils/dates'

interface HeaderProps {
  /** Optional custom date to display */
  date?: Date
}

export const Header: React.FC<HeaderProps> = ({ date = new Date() }) => {
  const { theme, setTheme } = useTheme()

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

  return (
    <header className="app-header">
      <div>
        <h1 className="app-title">
          <span className="gradient-text font-display">Ext</span> & Flex
        </h1>
        <p className="date-display">{dateString}</p>
      </div>
      <button
        className="settings-btn"
        onClick={toggleTheme}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}

