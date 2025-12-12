import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BackgroundStyle } from '@/types'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
  background: BackgroundStyle
  setBackground: (b: BackgroundStyle) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

const BACKGROUND_CLASSES = ['bg-minimal', 'bg-aurora', 'bg-gradient', 'bg-cosmos', 'bg-waves']

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system')
  const [background, setBackground] = useState<BackgroundStyle>('aurora')

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('ext-theme') as Theme | null
      if (storedTheme) setTheme(storedTheme)
      
      const storedBg = localStorage.getItem('ext-background') as BackgroundStyle | null
      if (storedBg) setBackground(storedBg)
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

  useEffect(() => {
    const body = document.body
    // Remove all background classes
    BACKGROUND_CLASSES.forEach(cls => body.classList.remove(cls))
    // Add the selected background class
    body.classList.add(`bg-${background}`)
    try {
      localStorage.setItem('ext-background', background)
    } catch (e) {
      // Ignore storage access errors
    }
  }, [background])

  const value = useMemo(() => ({ theme, setTheme, background, setBackground }), [theme, background])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


