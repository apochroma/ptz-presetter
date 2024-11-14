const fs = window.electron.fs;
const path = window.electron.path;

let appDataPath;
let settingsFilePath;
let cameraCount = 3; // Variable für die Anzahl der Kameras
let cameraSettingsContainer;
let cameraContainer;

// Funktion zum Umschalten des Einstellungsmenüs
function toggleSettings() {
  const settingsSection = document.getElementById('settings-section');
  const toggleButton = document.getElementById('toggle-settings-btn');
  
  // Umschalten der Sichtbarkeit
  if (settingsSection.classList.contains('visible')) {
    settingsSection.classList.remove('visible');
    toggleButton.textContent = '>';
  } else {
    settingsSection.classList.add('visible');
    toggleButton.textContent = '<';
  }
}

// Den `userData`-Pfad vom Main-Prozess abrufen und Einstellungen initialisieren
async function initializePaths() {
  appDataPath = await window.electron.getUserDataPath();
  settingsFilePath = path.join(appDataPath, 'camera_settings.json');
  console.log('App Data Path:', appDataPath); // <-- Hier eingefügt
  loadSettings(); // Laden der Einstellungen
}

// Funktion zum Speichern der Einstellungen in einer JSON-Datei
function saveSettings() {
  console.log('Speichern wird ausgeführt');
  console.log('cameraCount:', cameraCount);

  const cameras = [];
  for (let i = 1; i <= cameraCount; i++) {
    const ipField = document.getElementById(`cam${i}-ip`);
    if (ipField) {
      cameras.push({ id: i, ip: ipField.value });
    }
  }

  const settings = { cameras };
  const settingsJSON = JSON.stringify(settings, null, 2);

  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }

  fs.writeFile(settingsFilePath, settingsJSON, (err) => {
    if (err) {
      console.error('Fehler beim Speichern der Einstellungen:', err);
    } else {
      console.log('Einstellungen erfolgreich gespeichert.');
    }
  });
}

// Funktion zum Laden der Einstellungen aus einer JSON-Datei
function loadSettings() {
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }

  if (!fs.existsSync(settingsFilePath)) {
    const defaultSettings = {
      cameras: [
        { id: 1, ip: "10.10.10.100" },
        { id: 2, ip: "10.10.10.101" },
        { id: 3, ip: "10.10.10.102" }
      ]
    };
    console.log('Creating Default Settings File:', settingsFilePath);
    fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));
  }

  fs.readFile(settingsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Fehler beim Laden der Einstellungen:', err);
    } else {
      const settings = JSON.parse(data);
      cameraCount = settings.cameras.length;

      cameraSettingsContainer.innerHTML = '';
      
      settings.cameras.forEach((camera, index) => {
        const cameraField = document.createElement("div");
        cameraField.innerHTML = `
          <label for="cam${camera.id}-ip">Cam ${camera.id} IP:</label>
          <input type="text" id="cam${camera.id}-ip" value="${camera.ip}">
          ${index >= 2 ? `<button onclick="addCameraField()">+</button>` : ''}
          ${index >= 3 ? `<button onclick="removeCameraField(${camera.id})">-</button>` : ''}
          <br>
        `;
        cameraSettingsContainer.appendChild(cameraField);
      });

      updateCameraBlocks(settings.cameras);
    }
  });
}

// Funktion zum Hinzufügen eines neuen Kamera-IP-Feldes
function addCameraField() {
  cameraCount++;
  const newCameraField = document.createElement("div");
  newCameraField.innerHTML = `
    <label for="cam${cameraCount}-ip">Cam ${cameraCount} IP:</label>
    <input type="text" id="cam${cameraCount}-ip" value="10.10.10.${100 + cameraCount}">
    <button onclick="addCameraField()">+</button>
    <button onclick="removeCameraField(${cameraCount})">-</button>
    <br>
  `;
  cameraSettingsContainer.appendChild(newCameraField);
}

// Funktion zum Entfernen eines Kamera-IP-Feldes
function removeCameraField(id) {
  if (id > 3) {
    const field = document.getElementById(`cam${id}-ip`).parentNode;
    cameraSettingsContainer.removeChild(field);
    cameraCount--;
  }
}

// Funktion zur Aktualisierung der Kamera-Blöcke im Hauptfenster
function updateCameraBlocks(cameras) {
  cameraContainer.innerHTML = ""; // Vorhandene Blöcke löschen
  cameras.forEach(camera => {
    const cameraBlock = document.createElement("div");
    cameraBlock.classList.add("camera-block");
    cameraBlock.innerHTML = `
      <div class="camera-title">Cam ${camera.id}</div>
      <div class="presets">
        ${Array.from({ length: 10 }).map((_, index) => `
          <div class="preset" data-preset="${index + 1}">
            <div class="thumbnail-container">
              <a href="#" onclick="playPreset(${camera.id}, ${index + 1})">
                <img class="thumbnail" id="cam${camera.id}-preset${index + 1}" src="images/empty.png" alt="Preset ${index + 1}">
                <span class="preset-label">Preset ${index + 1}</span>
              </a>
              <div class="controls">
                <button onclick="savePreset(${camera.id}, ${index + 1})">💾</button>
                <button onclick="deletePreset(${camera.id}, ${index + 1})">🗑️</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    cameraContainer.appendChild(cameraBlock);
  });
}

// Funktion zum Abspielen eines Presets
function playPreset(cameraNumber, presetNumber) {
  console.log(`Playing preset ${presetNumber} for camera ${cameraNumber}`);
}

// Funktion zum Speichern eines Presets
function savePreset(cameraNumber, presetNumber) {
  console.log(`Saving preset ${presetNumber} for camera ${cameraNumber}`);
}

// Funktion zum Löschen eines Presets
function deletePreset(cameraNumber, presetNumber) {
  console.log(`Deleting preset ${presetNumber} for camera ${cameraNumber}`);
}

// Initialisieren und Pfade festlegen, sobald das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
  cameraSettingsContainer = document.getElementById("camera-settings");
  cameraContainer = document.getElementById("camera-container");
  console.log('Camera Container:', cameraContainer); // Optional für weitere Debug-Infos

  // Speicher-Button-Event hinzufügen, nachdem DOM geladen ist
  document.getElementById('save-button').addEventListener('click', saveSettings);

  initializePaths();
  console.log('App Data Path:', appDataPath); // Falls Debugging in der Hauptfunktion notwendig ist
});
