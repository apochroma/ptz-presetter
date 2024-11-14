const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveCameraImage: (cameraNumber, presetNumber, imageData) => 
    ipcRenderer.invoke('save-camera-image', cameraNumber, presetNumber, imageData)
});