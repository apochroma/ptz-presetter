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

  // Stelle sicher, dass die Einstellungen korrekt geladen sind
  if (!settings || !settings.cameras) {
    console.error("Einstellungen konnten nicht geladen werden.");
    return;
  }

  // Kameras nach `order` sortieren
  const sortedCameras = settings.cameras.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

  cameraContainer.innerHTML = ""; // Vorhandene Blöcke löschen

  sortedCameras.forEach(camera => {
    // Kamera-Einstellungen abrufen
    const cameraSettings = settings.cameras.find(c => c.id === camera.id);
    if (!cameraSettings) {
      console.error(`Einstellungen für Kamera ${camera.id} nicht gefunden.`);
      return;
    }

    const visiblePresetCount = cameraSettings.visiblePresetCount || 10;

    // Kamera-Block erstellen
    const cameraBlock = document.createElement("div");
    cameraBlock.classList.add("camera-block");
    cameraBlock.setAttribute("draggable", "true");
    cameraBlock.setAttribute("data-id", camera.id);

    // Drag-and-Drop-Event-Listener
    cameraBlock.addEventListener("dragstart", handleDragStart);
    cameraBlock.addEventListener("dragover", handleDragOver);
    cameraBlock.addEventListener("drop", handleDrop);

    // Kamera-Inhalt erstellen
    cameraBlock.innerHTML = `
      <div class="camera-title">
        Cam ${camera.id}</br>
        <small class="camera-ip">${cameraSettings.ip}</small>
      </div>
      <div class="presets">
        ${Array.from({ length: visiblePresetCount }).map((_, index) => {
          const presetNumber = index + 1;
          const preset = cameraSettings.presets[presetNumber];
          const imagePath = preset?.imagePath || 'images/empty.png';

          return `
            <div class="preset" id="cam${camera.id}-preset${presetNumber}" data-preset="${presetNumber}">
              <div class="thumbnail-container">
                <a href="#" onclick="playPreset(${camera.id}, ${presetNumber}, event)">
                  <img class="thumbnail" src="${imagePath}" alt="Preset ${presetNumber}">
                  <span class="preset-label">Preset ${presetNumber}</span>
                </a>
                <div class="controls">
                  <button title="Preset ${presetNumber} von der Kamera ${camera.id} mit der IP ${cameraSettings.ip} sichern" onclick="savePreset(${camera.id}, ${presetNumber})">💾</button>
                  <button title="Preset ${presetNumber} von der Kamera ${camera.id} mit der IP ${cameraSettings.ip} löschen" onclick="deletePreset(${camera.id}, ${presetNumber})">🗑️</button>
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

// START OF Drag Routines
let draggedElement = null;

function handleDragStart(event) {
  draggedElement = event.target.closest(".camera-block");
  if (draggedElement) {
    draggedElement.classList.add("dragging");
  }
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();

  const container = document.getElementById("camera-container");
  const targetElement = event.target.closest(".camera-block");

  // Wenn kein Ziel gefunden wurde oder die Ziel- und Drag-Elemente identisch sind
  if (!targetElement || draggedElement === targetElement) {
    if (draggedElement) {
      draggedElement.classList.remove("dragging");
      draggedElement = null;
    }
    return;
  }

  // Tausche die Positionen im DOM
  const draggedIndex = [...container.children].indexOf(draggedElement);
  const targetIndex = [...container.children].indexOf(targetElement);

  if (draggedIndex < targetIndex) {
    container.insertBefore(draggedElement, targetElement.nextSibling);
  } else {
    container.insertBefore(draggedElement, targetElement);
  }

  // Aktualisiere die Reihenfolge in der JSON
  updateCameraOrder();

  // Entferne Transparenz und die Klasse `dragging`
  draggedElement.classList.remove("dragging");
  draggedElement = null;
}

function handleDragEnd() {
  // Stelle sicher, dass die Klasse `dragging` entfernt wird, wenn der Benutzer das Drag beendet
  if (draggedElement) {
    draggedElement.classList.remove("dragging");
    draggedElement = null;
  }
}

document.addEventListener("dragend", handleDragEnd);

// END OF Drag Routines

// Aktualisiert die Reihenfolge der Kameras basierend auf Drag-and-Drop
async function updateCameraOrder() {
  const container = document.getElementById("camera-container");
  const cameraBlocks = Array.from(container.children);

  // Lese die aktuelle Reihenfolge aus dem DOM
  const updatedOrder = cameraBlocks.map((block, index) => {
    const id = parseInt(block.getAttribute("data-id"), 10);
    return { id, order: index };
  });

  // Aktualisiere die JSON-Daten
  const settings = await window.electron.loadSettings();
  settings.cameras.forEach(camera => {
    const newOrder = updatedOrder.find(o => o.id === camera.id)?.order;
    if (newOrder !== undefined) {
      camera.order = newOrder;
    }
  });

  // Speichere die aktualisierte JSON
  await window.electron.saveSettings(settings);
  console.log("Neue Sortierreihenfolge gespeichert:", settings.cameras);
}



// Funktion zum Speichern der Einstellungen
async function saveSettings() {
  // Bestehende Einstellungen laden oder neues Objekt erstellen
  const settings = await window.electron.loadSettings() || { cameras: [] };

  // Aktuelle Kamera-IDs und IPs aus der Settings-Sektion ermitteln
  const updatedCameras = [];
  const cameraFields = document.querySelectorAll("#camera-settings > .camera-row");

  let allValid = true; // Flag zur Überprüfung, ob alle Eingaben gültig sind
  const seenIPs = new Set(); // Set zur Verfolgung bereits eingegebener IPs

  cameraFields.forEach((field, index) => {
    const ipField = field.querySelector("input[type='text']");
    const presetCountField = field.querySelector("select");

    if (ipField && presetCountField) {
      const cameraIP = ipField.value.trim(); // Eingabe trimmen
      const visiblePresetCount = parseInt(presetCountField.value, 10); // Dropdown-Wert lesen
      const cameraId = index + 1; // ID basierend auf Position festlegen

      // Überprüfung der IP-Adresse
      if (!isValidIPv4(cameraIP)) {
        ipField.classList.add('invalid-ip'); // Ungültige Eingabe markieren
        console.error(`Ungültige IP-Adresse für Kamera ${cameraId}: ${cameraIP}`);
        allValid = false;
      } else if (seenIPs.has(cameraIP)) {
        ipField.classList.add('invalid-ip'); // Markiere doppelte IP als ungültig
        console.error(`Doppelte IP-Adresse gefunden: ${cameraIP}`);
        allValid = false;
      } else {
        ipField.classList.remove('invalid-ip'); // Markierung entfernen, wenn gültig
        seenIPs.add(cameraIP); // IP-Adresse zu "gesehen" hinzufügen

        // Kamera-Daten aktualisieren oder hinzufügen
        let camera = settings.cameras.find(c => c.id === cameraId);

        if (camera) {
          // Falls die Kamera existiert, aktualisiere die IP-Adresse
          camera.ip = cameraIP;
          camera.visiblePresetCount = visiblePresetCount; // Sichtbare Presets aktualisieren
        } else {
          // Falls die Kamera neu ist, füge sie hinzu
          camera = { id: cameraId, ip: cameraIP, presets: {}, visiblePresetCount: visiblePresetCount };
        }

        // Aktualisiere oder initialisiere Preset-Details
        for (let i = 1; i <= 10; i++) {
          if (!camera.presets[i]) {
            camera.presets[i] = { imagePath: 'images/empty.png', visible: i <= visiblePresetCount };
          } else {
            camera.presets[i].visible = i <= visiblePresetCount;
          }
        }

        // Aktualisierte oder neue Kamera zur Liste hinzufügen
        updatedCameras.push(camera);
      }
    }
  });

  if (!allValid) {
    alert("Bitte korrigieren Sie die ungültigen oder doppelten IP-Adressen, bevor Sie speichern.");
    return; // Speicherung abbrechen, wenn ungültige oder doppelte IPs vorhanden sind
  }

  // Entfernte Kameras filtern (z.B., falls Kamera entfernt wurde)
  settings.cameras = updatedCameras;

  // Speichere die aktualisierten Einstellungen
  await window.electron.saveSettings(settings);
  console.log("Einstellungen gespeichert:", settings);

  // Hauptbildschirm aktualisieren
  updateCameraBlocks(settings.cameras);

// Schließe das Settings-Menü mit der bestehenden toggleSettings-Funktion
  toggleSettings();
}

//Überprüfung einer validen IP Adresse
function isValidIPv4(ip) {
  const octets = ip.split(".");
  if (octets.length !== 4) return false;

  for (const octet of octets) {
    const value = Number(octet);
    if (isNaN(value) || value < 0 || value > 255) return false;
  }

  return true;
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
        <select title="Wähle die Anzahl sichtbare Presets aus" id="cam${camera.id}-preset-count">
          ${Array.from({ length: 10 }).map((_, i) => `
            <option value="${i + 1}" ${camera.visiblePresetCount === i + 1 ? 'selected' : ''}>
              ${i + 1}
            </option>`).join('')}
        </select>
      `;

      // Buttons je nach Kamera-ID hinzufügen
      if (camera.id === 1 || camera.id === 2) {
        cameraField.innerHTML += `<div class="button-placeholder"></div><div class="button-placeholder"></div>`;
      } else if (camera.id === 3) {
        cameraField.innerHTML += `<div class="button-placeholder"></div>`;
        cameraField.innerHTML += `<button onclick="addCameraField()" class="camera-btn">+</button>`;
      } else {
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
  cameraCount++; // Erhöhe die Kameraanzahl
  const newCameraField = document.createElement("div");
  newCameraField.classList.add("camera-row");

  // Neues Kamera-Feld mit ID basierend auf cameraCount erstellen
  newCameraField.innerHTML = `
    <label for="cam${cameraCount}-ip">Cam ${cameraCount} IP:</label>
    <input type="text" id="cam${cameraCount}-ip" value="10.10.10.${100 + cameraCount}" class="camera-input">
    <select title="Wähle die Anzahl sichtbare Presets aus" id="cam${cameraCount}-preset-count" class="preset-dropdown">
      ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i + 1 === 10 ? "selected" : ""}>${i + 1}</option>`).join("")}
    </select>
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

  if (event) {
    event.preventDefault();
  }

  //Highlight active Preset
  highlightPreset(cameraNumber, presetNumber);

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

  loadSettings(); // Einstellungen beim Laden abrufen
});

// Funktion zum Hervorheben des zuletzt ausgeführten Presets
function highlightPreset(cameraId, presetNumber) {
  // Entferne die aktive Klasse von allen Presets der Kamera
  const cameraPresets = document.querySelectorAll(`[id^="cam${cameraId}-preset"]`);
  cameraPresets.forEach(preset => {
    preset.classList.remove('active-preset');
  });

  // Füge die aktive Klasse zum ausgewählten Preset hinzu
  const selectedPreset = document.querySelector(`#cam${cameraId}-preset${presetNumber}`);
  if (selectedPreset) {
    selectedPreset.classList.add('active-preset');
  } else {
    console.error(`Preset ${presetNumber} für Kamera ${cameraId} nicht gefunden`);
  }
}