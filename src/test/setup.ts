/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom'

// Mock Chrome Storage API
const mockStorage: Record<string, unknown> = {}

const createMockStorageArea = () => ({
  get: jest.fn((keys: string | string[] | null, callback?: (result: Record<string, unknown>) => void) => {
    return new Promise<Record<string, unknown>>((resolve) => {
      const result: Record<string, unknown> = {}
      if (keys === null) {
        Object.assign(result, mockStorage)
      } else if (typeof keys === 'string') {
        result[keys] = mockStorage[keys]
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => {
          result[key] = mockStorage[key]
        })
      }
      if (callback) callback(result)
      resolve(result)
    })
  }),
  set: jest.fn((items: Record<string, unknown>, callback?: () => void) => {
    return new Promise<void>((resolve) => {
      Object.assign(mockStorage, items)
      if (callback) callback()
      resolve()
    })
  }),
  remove: jest.fn((keys: string | string[], callback?: () => void) => {
    return new Promise<void>((resolve) => {
      const keysArray = typeof keys === 'string' ? [keys] : keys
      keysArray.forEach((key) => {
        delete mockStorage[key]
      })
      if (callback) callback()
      resolve()
    })
  }),
  clear: jest.fn((callback?: () => void) => {
    return new Promise<void>((resolve) => {
      Object.keys(mockStorage).forEach((key) => {
        delete mockStorage[key]
      })
      if (callback) callback()
      resolve()
    })
  }),
})

// Define chrome global
const mockChrome = {
  storage: {
    local: createMockStorageArea(),
    sync: createMockStorageArea(),
    session: createMockStorageArea(),
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  runtime: {
    onInstalled: { addListener: jest.fn() },
    onStartup: { addListener: jest.fn() },
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
  },
}

// @ts-expect-error - Mocking chrome global
global.chrome = mockChrome

// Helper to clear mock storage between tests
export const clearMockStorage = () => {
  Object.keys(mockStorage).forEach((key) => {
    delete mockStorage[key]
  })
}

// Helper to seed mock storage
export const seedMockStorage = (data: Record<string, unknown>) => {
  Object.assign(mockStorage, data)
}

// Reset mocks before each test
beforeEach(() => {
  clearMockStorage()
  jest.clearAllMocks()
})

