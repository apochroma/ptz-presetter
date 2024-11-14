const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveCameraImage: (cameraNumber, presetNumber, imageData) => 
    ipcRenderer.invoke('save-camera-image', cameraNumber, presetNumber, imageData),
  getPresetImages: () => ipcRenderer.invoke('get-preset-images'),
  deleteCameraImage: (cameraNumber, presetNumber) => 
    ipcRenderer.invoke('delete-camera-image', cameraNumber, presetNumber)
});