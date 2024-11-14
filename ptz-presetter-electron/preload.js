const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveImage: (buffer, cameraNumber, presetNumber) => ipcRenderer.invoke('save-image', { buffer, cameraNumber, presetNumber })
});