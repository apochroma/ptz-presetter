let appDataPath;
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

// Funktion zum Speichern der Einstellungen
async function saveSettings() {
  const cameras = [];
  for (let i = 1; i <= cameraCount; i++) {
    const ipField = document.getElementById(`cam${i}-ip`);
    if (ipField) {
      cameras.push({ id: i, ip: ipField.value });
    }
  }
  const settings = { cameras };
  const response = await window.electron.saveSettings(settings);
  console.log(response);
}

// Funktion zum Laden der Einstellungen
async function loadSettings() {
  const settings = await window.electron.loadSettings();
  if (settings) {
    console.log('Einstellungen erfolgreich geladen:', settings);
    cameraCount = settings.cameras.length;

    // Setze die Kamera-IP-Felder basierend auf den geladenen Einstellungen
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
  } else {
    console.log("Keine Einstellungen gefunden, Standardwerte verwenden.");
  }
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
  // Hole die IP-Adresse des gewünschten Kamera-Felds anhand der ID
  const ipField = document.getElementById(`cam${cameraNumber}-ip`);
  if (!ipField) {
    console.error(`IP-Adresse für Kamera ${cameraNumber} nicht gefunden`);
    return;
  }

  const cameraIP = ipField.value;
  const url = `http://${cameraIP}/-wvhttp-01-/control.cgi?p=${presetNumber}`;

  console.log(`Playing preset ${presetNumber} for camera ${cameraNumber} at ${url}`);

  // Sende den HTTP-Request an die Kamera-IP, um das Preset abzurufen
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fehler beim Abrufen des Presets: ${response.statusText}`);
      }
      console.log(`Preset ${presetNumber} erfolgreich aufgerufen für Kamera ${cameraNumber}`);
    })
    .catch(error => {
      console.error(`Fehler beim Aufrufen des Presets: ${error}`);
    });
}

// Funktion zum Sichern eines Presets
function savePreset(cameraNumber, presetNumber) {
  // Hole die IP-Adresse des gewünschten Kamera-Felds anhand der ID
  const ipField = document.getElementById(`cam${cameraNumber}-ip`);
  if (!ipField) {
    console.error(`IP-Adresse für Kamera ${cameraNumber} nicht gefunden`);
    return;
  }

  const cameraIP = ipField.value;
  const url = `http://${cameraIP}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&all=enabled`;

  console.log(`Saving preset ${presetNumber} for camera ${cameraNumber} at ${url}`);

  // Sende den HTTP-Request an die Kamera-IP, um das Preset zu speichern
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fehler beim Speichern des Presets: ${response.statusText}`);
      }
      console.log(`Preset ${presetNumber} erfolgreich gespeichert für Kamera ${cameraNumber}`);
    })
    .catch(error => {
      console.error(`Fehler beim Speichern des Presets: ${error}`);
    });
}


// Funktion zum Löschen eines Presets
function deletePreset(cameraNumber, presetNumber) {
  // Hole die IP-Adresse des gewünschten Kamera-Felds anhand der ID
  const ipField = document.getElementById(`cam${cameraNumber}-ip`);
  if (!ipField) {
    console.error(`IP-Adresse für Kamera ${cameraNumber} nicht gefunden`);
    return;
  }

  const cameraIP = ipField.value;
  const url = `http://${cameraIP}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=&ptz=disabled`;

  console.log(`Deleting preset ${presetNumber} for camera ${cameraNumber} at ${url}`);

  // Sende den HTTP-Request an die Kamera-IP, um das Preset zu löschen
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Fehler beim Löschen des Presets: ${response.statusText}`);
      }
      console.log(`Preset ${presetNumber} erfolgreich gelöscht für Kamera ${cameraNumber}`);
    })
    .catch(error => {
      console.error(`Fehler beim Löschen des Presets: ${error}`);
    });
}

// Initialisieren und Pfade festlegen, sobald das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
  cameraSettingsContainer = document.getElementById("camera-settings");
  cameraContainer = document.getElementById("camera-container");

  if (!cameraContainer) {
    console.error('camera-container Element nicht gefunden');
    return;
  }

  const saveButton = document.getElementById('save-button');
  if (!saveButton) {
    console.error('save-button Element nicht gefunden');
  } else {
    saveButton.addEventListener('click', saveSettings);
  }

  loadSettings(); // Einstellungen beim Laden abrufen
});
