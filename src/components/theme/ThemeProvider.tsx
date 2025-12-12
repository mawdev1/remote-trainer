import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ext-theme') as Theme | null
      if (stored) setTheme(stored)
    } catch (e) {
      // Ignore storage access errors (e.g., in restricted contexts)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark())
    root.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('ext-theme', theme)
    } catch (e) {
      // Ignore storage access errors
    }
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


