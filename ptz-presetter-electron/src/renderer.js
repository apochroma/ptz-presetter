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

// Preset Bilder aktualisieren
async function updateCameraBlocks(cameras) {
  const settings = await window.electron.loadSettings();

  cameraContainer.innerHTML = ""; // Vorhandene Blöcke löschen
  cameras.forEach(camera => {
    const cameraBlock = document.createElement("div");
    cameraBlock.classList.add("camera-block");
    cameraBlock.innerHTML = `
      <div class="camera-title">Cam ${camera.id}</div>
      <div class="presets">
        ${Array.from({ length: 10 }).map((_, index) => {
          const presetNumber = index + 1;
          const imagePath = settings.cameras[camera.id - 1]?.presets?.[presetNumber]?.imagePath || 'images/empty.png';
          return `
            <div class="preset" data-preset="${presetNumber}">
              <div class="thumbnail-container">
                <a href="#" onclick="playPreset(${camera.id}, ${presetNumber})">
                  <img class="thumbnail" id="cam${camera.id}-preset${presetNumber}" src="${imagePath}" alt="Preset ${presetNumber}">
                  <span class="preset-label">Preset ${presetNumber}</span>
                </a>
                <div class="controls">
                  <button onclick="savePreset(${camera.id}, ${presetNumber})">💾</button>
                  <button onclick="deletePreset(${camera.id}, ${presetNumber})">🗑️</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    cameraContainer.appendChild(cameraBlock);
  });
}

// Funktion zum Speichern der Einstellungen
async function saveSettings() {
  // Bestehende Einstellungen laden
  const settings = await window.electron.loadSettings() || { cameras: [] };

  // Aktuelle Kamera-IDs und IPs aus der Settings-Sektion ermitteln
  const updatedCameras = [];
  const visibleCameraCount = document.querySelectorAll("#camera-settings > div").length;

  for (let i = 1; i <= visibleCameraCount; i++) {
    const ipField = document.getElementById(`cam${i}-ip`);
    if (ipField) {
      const cameraIP = ipField.value;
      let camera = settings.cameras.find(c => c.id === i);

      if (camera) {
        // Falls die Kamera existiert, aktualisiere die IP-Adresse
        camera.ip = cameraIP;
      } else {
        // Falls die Kamera neu ist, füge sie hinzu
        camera = { id: i, ip: cameraIP, presets: {} };
      }
      updatedCameras.push(camera);
    }
  }

  // JSON mit der neuen Kamera-Liste aktualisieren
  settings.cameras = updatedCameras;

  // Speichere die aktualisierten Einstellungen
  await window.electron.saveSettings(settings);
  console.log("Einstellungen gespeichert:", settings);

  // Hauptbildschirm aktualisieren
  updateCameraBlocks(settings.cameras);
}



// Funktion zum Laden der Einstellungen
async function loadSettings() {
  const settings = await window.electron.loadSettings();
  if (settings) {
    console.log('Einstellungen erfolgreich geladen:', settings);
    cameraCount = settings.cameras.length;
    cameraSettingsContainer.innerHTML = '';

    settings.cameras.forEach(camera => {
      const cameraField = document.createElement("div");
      cameraField.classList.add("camera-row");

      // Grundaufbau des Kamera-Felds
      cameraField.innerHTML = `
        <label for="cam${camera.id}-ip">Cam ${camera.id} IP:</label>
        <input type="text" id="cam${camera.id}-ip" value="${camera.ip}" class="camera-input">
      `;

      // Buttons je nach Kamera-ID hinzufügen
      if (camera.id === 3) {
        // Bei Kamera 3 nur den + Button anzeigen
        cameraField.innerHTML += `<button onclick="addCameraField()" class="camera-btn">+</button>`;
      } else if (camera.id > 3) {
        // Bei weiteren Kameras sowohl + als auch - Buttons anzeigen
        cameraField.innerHTML += `
          <button onclick="removeCameraField(${camera.id})" class="camera-btn">-</button>
          <button onclick="addCameraField()" class="camera-btn">+</button>
        `;
      }
      
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
  newCameraField.classList.add("camera-row");
  newCameraField.innerHTML = `
    <label for="cam${cameraCount}-ip">Cam ${cameraCount} IP:</label>
    <input type="text" id="cam${cameraCount}-ip" value="10.10.10.${100 + cameraCount}" class="camera-input">
    <button onclick="removeCameraField(${cameraCount})" class="camera-btn">-</button>
    <button onclick="addCameraField()" class="camera-btn">+</button>
  `;
  cameraSettingsContainer.appendChild(newCameraField);
}




// Funktion zum Entfernen eines Kamera-IP-Feldes
function removeCameraField(cameraId) {
  const cameraField = document.querySelector(`#cam${cameraId}-ip`).parentNode;
  cameraSettingsContainer.removeChild(cameraField);
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

async function savePreset(cameraNumber, presetNumber) {
  const ipField = document.getElementById(`cam${cameraNumber}-ip`);
  if (!ipField) {
    console.error(`IP-Adresse für Kamera ${cameraNumber} nicht gefunden`);
    return;
  }

  const cameraIP = ipField.value;
  const presetUrl = `http://${cameraIP}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&all=enabled`;
  const imageUrl = `http://${cameraIP}/-wvhttp-01-/image.cgi`;

  console.log(`Saving preset ${presetNumber} for camera ${cameraNumber} at ${presetUrl}`);

  try {
    const presetResponse = await fetch(presetUrl);
    if (!presetResponse.ok) {
      throw new Error(`Fehler beim Speichern des Presets: ${presetResponse.statusText}`);
    }
    console.log(`Preset ${presetNumber} erfolgreich gespeichert für Kamera ${cameraNumber}`);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Fehler beim Abrufen des Kamerabilds: ${imageResponse.statusText}`);
    }
    const blob = await imageResponse.blob();
    const reader = new FileReader();
    reader.onload = async function() {
      const imageData = reader.result.split(',')[1];
      const appDataPath = await window.electron.getUserDataPath();
      const imagePath = `${appDataPath}/preset-images/camera_${cameraNumber}_preset_${presetNumber}.jpg`;
      
      await window.electron.saveCameraImage(cameraNumber, presetNumber, imageData);

      // JSON laden und bestehende Struktur beibehalten
      const settings = await window.electron.loadSettings();
      if (!settings.cameras) settings.cameras = [];
      
      // Prüfen, ob Kamera bereits existiert, andernfalls hinzufügen
      let camera = settings.cameras.find(c => c.id === cameraNumber);
      if (!camera) {
        camera = { id: cameraNumber, ip: cameraIP, presets: {} };
        settings.cameras.push(camera);
      } else {
        camera.ip = cameraIP; // IP-Adresse aktualisieren, falls geändert
      }

      // Preset-Daten hinzufügen oder aktualisieren
      if (!camera.presets) camera.presets = {};
      camera.presets[presetNumber] = { imagePath: imagePath };

      // Einstellungen speichern
      await window.electron.saveSettings(settings);
      console.log(`Preset-Informationen für Kamera ${cameraNumber}, Preset ${presetNumber} wurden mit Bildpfad aktualisiert.`);

      // Anzeige aktualisieren
      updateCameraBlocks(settings.cameras);
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(`Fehler beim Speichern des Presets oder Bildabruf: ${error}`);
  }
}



// Funktion zum Löschen eines Presets
async function deletePreset(cameraNumber, presetNumber) {
  const ipField = document.getElementById(`cam${cameraNumber}-ip`);
  if (!ipField) {
    console.error(`IP-Adresse für Kamera ${cameraNumber} nicht gefunden`);
    return;
  }

  const cameraIP = ipField.value;
  const deleteUrl = `http://${cameraIP}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=&ptz=disabled`;

  console.log(`Deleting preset ${presetNumber} for camera ${cameraNumber} at ${deleteUrl}`);

  try {
    const response = await fetch(deleteUrl);
    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Presets: ${response.statusText}`);
    }
    console.log(`Preset ${presetNumber} erfolgreich gelöscht für Kamera ${cameraNumber}`);

    // Aktualisiere JSON, um das gelöschte Preset zu entfernen
    const settings = await window.electron.loadSettings();
    if (settings.cameras[cameraNumber - 1]?.presets?.[presetNumber]) {
      delete settings.cameras[cameraNumber - 1].presets[presetNumber];
      await window.electron.saveSettings(settings);
      console.log(`Preset-Informationen für Kamera ${cameraNumber}, Preset ${presetNumber} wurden gelöscht.`);

      // Bilddatei löschen
      await window.electron.deleteCameraImage(cameraNumber, presetNumber);

      // Aktualisiere die Anzeige
      updateCameraBlocks(settings.cameras); // Seite nach dem Löschen neu laden
    }
  } catch (error) {
    console.error(`Fehler beim Löschen des Presets: ${error}`);
  }
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
