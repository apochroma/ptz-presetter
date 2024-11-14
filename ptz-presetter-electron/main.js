const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Korrektes Preload-Skript
      contextIsolation: true, // Sicherheit verbessern
      nodeIntegration: false  // Node-Integration deaktivieren
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html')); // Index-Datei laden
}

// Cache leeren und Hauptfenster erstellen
app.whenReady().then(() => {
  session.defaultSession.clearCache().then(() => {
    console.log('Cache erfolgreich gelöscht');
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC-Handler für Benutzerpfad und Dateispeicherfunktionen
ipcMain.handle('getUserDataPath', () => app.getPath('userData'));

ipcMain.handle('save-settings', async (event, settings) => {
  const settingsPath = path.join(app.getPath('userData'), 'camera_settings.json');
  try {
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return 'Einstellungen erfolgreich gespeichert.';
  } catch (err) {
    return `Fehler beim Speichern: ${err.message}`;
  }
});

ipcMain.handle('load-settings', async () => {
  const settingsPath = path.join(app.getPath('userData'), 'camera_settings.json');
  try {
    const data = await fs.promises.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return null; // Null zurückgeben, wenn Datei nicht existiert
  }
});
