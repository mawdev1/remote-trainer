/**
 * Chrome Storage Wrapper
 * Base class for Chrome extension storage operations
 */

/// <reference types="chrome"/>

export type StorageArea = 'sync' | 'local' | 'session'

/**
 * Generic Chrome Storage wrapper class
 * Provides typed async access to Chrome's storage APIs
 */
export class ChromeStorage {
  private area: chrome.storage.StorageArea

  constructor(storageArea: StorageArea = 'local') {
    this.area = chrome.storage[storageArea]
  }

  /**
   * Get a single value by key
   */
  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      this.area.get(key, (result: { [key: string]: unknown }) => {
        resolve((result[key] as T) ?? null)
      })
    })
  }

  /**
   * Get multiple values by keys
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T>> {
    return new Promise((resolve) => {
      this.area.get(keys, (result: Record<string, T>) => {
        resolve(result)
      })
    })
  }

  /**
   * Get all values in this storage area
   */
  async getAll<T>(): Promise<Record<string, T>> {
    return new Promise((resolve) => {
      this.area.get(null, (result: Record<string, T>) => {
        resolve(result)
      })
    })
  }

  /**
   * Set a single key-value pair
   */
  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      this.area.set({ [key]: value }, () => {
        resolve()
      })
    })
  }

  /**
   * Set multiple key-value pairs
   */
  async setMultiple(items: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      this.area.set(items, () => {
        resolve()
      })
    })
  }

  /**
   * Remove a single key
   */
  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      this.area.remove(key, () => {
        resolve()
      })
    })
  }

  /**
   * Remove multiple keys
   */
  async removeMultiple(keys: string[]): Promise<void> {
    return new Promise((resolve) => {
      this.area.remove(keys, () => {
        resolve()
      })
    })
  }

  /**
   * Clear all data in this storage area
   */
  async clear(): Promise<void> {
    return new Promise((resolve) => {
      this.area.clear(() => {
        resolve()
      })
    })
  }

  /**
   * Listen for changes to storage
   */
  onChange(callback: (changes: Record<string, chrome.storage.StorageChange>) => void): () => void {
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      // Only trigger for this storage area
      const areaMap: Record<StorageArea, string> = {
        sync: 'sync',
        local: 'local',
        session: 'session',
      }
      if (areaName === areaMap[this.getAreaName()]) {
        callback(changes)
      }
    }

    chrome.storage.onChanged.addListener(listener)

    // Return unsubscribe function
    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }

  private getAreaName(): StorageArea {
    if (this.area === chrome.storage.sync) return 'sync'
    if (this.area === chrome.storage.session) return 'session'
    return 'local'
  }
}

// Pre-configured storage instances
export const syncStorage = new ChromeStorage('sync')
export const localStorage = new ChromeStorage('local')
export const sessionStorage = new ChromeStorage('session')

