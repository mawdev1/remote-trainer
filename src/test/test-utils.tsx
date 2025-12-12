/**
 * Test Utilities
 * Helper functions and custom render for testing
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ExerciseStoreProvider } from '@/stores'

/**
 * All providers wrapper for tests
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ExerciseStoreProvider>
        {children}
      </ExerciseStoreProvider>
    </ThemeProvider>
  )
}

/**
 * Custom render function that wraps components in all providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render with custom render
export { customRender as render }

