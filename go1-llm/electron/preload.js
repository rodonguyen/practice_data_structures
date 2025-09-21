const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Notification methods
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  timerMarkTriggered: (data) => ipcRenderer.invoke('timer-mark-triggered', data),
  focusWindow: () => ipcRenderer.invoke('focus-window'),
  
  // Listen for main process messages
  onCreateQuickTimer: (callback) => ipcRenderer.on('create-quick-timer', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // App info
  getVersion: () => ipcRenderer.invoke('get-version')
});

// DOM ready notification
window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded');
});