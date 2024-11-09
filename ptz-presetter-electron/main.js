const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true
    },
  });

  win.loadFile('src/index.html');
}

// Cache löschen und dann das Hauptfenster erstellen
app.whenReady().then(() => {
  // Cache leeren
  session.defaultSession.clearCache().then(() => {
    console.log('Cache wurde erfolgreich gelöscht');
    createWindow(); // Hauptfenster nach Cache-Löschung öffnen
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