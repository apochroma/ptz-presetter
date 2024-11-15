const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

function ensureDefaultSettings() {
  // Pfad zur Konfigurationsdatei
  const settingsPath = path.join(app.getPath('userData'), 'camera_settings.json');

  // Überprüfen, ob die Datei existiert
  if (!fs.existsSync(settingsPath)) {
    console.log('Keine camera_settings.json gefunden. Erstelle Standardkonfiguration...');

    // Standardkonfiguration
    const defaultSettings = {
      cameras: [
        { id: 1, ip: '192.168.0.101', presets: {} },
        { id: 2, ip: '192.168.0.102', presets: {} },
        { id: 3, ip: '192.168.0.103', presets: {} }
      ]
    };

    // Datei erstellen
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    console.log('Standardkonfiguration erstellt:', settingsPath);
  } else {
    console.log('Einstellungen gefunden:', settingsPath);
  }
}

// Aufrufen, bevor die App vollständig geladen wird
app.on('ready', () => {
  ensureDefaultSettings();
});

// Speichern des Kamerabildes im Unterordner `preset-images`
ipcMain.handle('save-camera-image', async (event, cameraNumber, presetNumber, imageData) => {
  const appDataPath = app.getPath('userData');
  const imageDir = path.join(appDataPath, 'preset-images'); // Unterordner `preset-images` erstellen
  const filePath = path.join(imageDir, `camera_${cameraNumber}_preset_${presetNumber}.jpg`);

  try {
    // Prüfen, ob der Ordner `preset-images` existiert, und ihn bei Bedarf erstellen
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const buffer = Buffer.from(imageData, 'base64');
    await fs.promises.writeFile(filePath, buffer);
    console.log(`Kamerabild für Kamera ${cameraNumber}, Preset ${presetNumber} erfolgreich gespeichert unter ${filePath}`);
  } catch (error) {
    console.error(`Fehler beim Speichern des Kamerabilds: ${error.message}`);
  }
});

// Löschen des Kamerabildes im Unterordner `preset-images`
ipcMain.handle('delete-camera-image', async (event, cameraNumber, presetNumber) => {
  const appDataPath = app.getPath('userData');
  const imagePath = path.join(appDataPath, `preset-images/camera_${cameraNumber}_preset_${presetNumber}.jpg`);

  try {
    if (fs.existsSync(imagePath)) {
      await fs.promises.unlink(imagePath); // Bilddatei löschen
      console.log(`Kamerabild für Kamera ${cameraNumber}, Preset ${presetNumber} wurde gelöscht.`);
    }
  } catch (error) {
    console.error(`Fehler beim Löschen des Kamerabilds: ${error.message}`);
  }
});


ipcMain.handle('get-preset-images', async () => {
  const appDataPath = app.getPath('userData');
  const imageDir = path.join(appDataPath, 'preset-images');
  const images = {};

  try {
    // Überprüfen, ob der Ordner existiert
    if (fs.existsSync(imageDir)) {
      const files = await fs.promises.readdir(imageDir);
      files.forEach(file => {
        const match = file.match(/camera_(\d+)_preset_(\d+)\.jpg/);
        if (match) {
          const cameraNumber = parseInt(match[1], 10);
          const presetNumber = parseInt(match[2], 10);
          if (!images[cameraNumber]) images[cameraNumber] = {};
          images[cameraNumber][presetNumber] = path.join(imageDir, file);
        }
      });
    }
  } catch (error) {
    console.error(`Fehler beim Analysieren des Ordners preset-images: ${error.message}`);
  }
  
  return images; // Rückgabe eines Objekts mit Kamera- und Preset-Nummern als Schlüssel
});


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
