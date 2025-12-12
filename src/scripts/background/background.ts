/// <reference types="chrome"/>

// Ext & Flex - Background Service Worker
// Minimal setup for now - just logs initialization
// Future: Could add reminder notifications, idle detection, etc.

console.log('Ext & Flex background script initialized', new Date().toISOString())

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Ext & Flex extension installed')
  } else if (details.reason === 'update') {
    console.log('Ext & Flex extension updated to version', chrome.runtime.getManifest().version)
  }
})

// Keep the service worker alive for potential future features
// This is a no-op for now but sets up the infrastructure
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, Ext & Flex ready')
})
