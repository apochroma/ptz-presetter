const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// IPC-Handler, um den `userData`-Pfad zu erhalten
ipcMain.handle('getUserDataPath', () => app.getPath('userData'));

// IPC-Handler zum Speichern der Einstellungen
ipcMain.handle('save-settings', async (event, settings) => {
  const settingsPath = path.join(app.getPath('userData'), 'camera_settings.json');
  try {
    await fs.promises.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return 'Einstellungen erfolgreich gespeichert.';
  } catch (err) {
    return `Fehler beim Speichern: ${err.message}`;
  }
});

// IPC-Handler zum Laden der Einstellungen
ipcMain.handle('load-settings', async () => {
  const settingsPath = path.join(app.getPath('userData'), 'camera_settings.json');
  try {
    const data = await fs.promises.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return null; // Null zurückgeben, wenn Datei nicht existiert
  }
});

// Hauptfenster erstellen
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Pfad zum Preload-Skript
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

// Beenden, wenn alle Fenster geschlossen sind (außer auf macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Fenster neu erstellen, wenn das Dock-Icon auf macOS angeklickt wird
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
