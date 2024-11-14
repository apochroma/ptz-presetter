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

ipcMain.handle('save-image', async (event, { buffer, cameraNumber, presetNumber }) => {
  try {
    // Speicherpfad für das Bild im Application Support-Verzeichnis
    const imageDir = path.join(app.getPath('userData'), 'images');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const imagePath = path.join(imageDir, `camera${cameraNumber}_preset${presetNumber}.jpg`);
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    return `Bild erfolgreich gespeichert unter ${imagePath}`;
  } catch (error) {
    throw new Error(`Fehler beim Speichern des Bildes: ${error.message}`);
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
