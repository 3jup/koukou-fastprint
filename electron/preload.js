const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  systemCheck: () => ipcRenderer.invoke('system-check'),

  autoInstall: (action) => ipcRenderer.invoke('auto-install', action),

  recheckSystem: () => ipcRenderer.invoke('recheck-system'),

  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  onSystemCheckResult: (callback) => {
    ipcRenderer.on('system-check-result', (event, result) => callback(result))
  },

  onInstallProgress: (callback) => {
    ipcRenderer.on('install-progress', (event, progress) => callback(progress))
  },

  onInstallError: (callback) => {
    ipcRenderer.on('install-error', (event, error) => callback(error))
  },

  onInstallCompleted: (callback) => {
    ipcRenderer.on('install-completed', (event, results) => callback(results))
  }
})
