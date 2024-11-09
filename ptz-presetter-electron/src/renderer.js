const fs = require('fs');
const path = require('path');
const { app } = require('@electron/remote'); // Zugriff auf das Electron app-Modul

// Speicherort der Datei festlegen
const configFilePath = path.join(app.getPath('userData'), 'camera-config.json');

// Standard-IP-Adressen
let camIps = {
  cam1: '10.10.10.100',
  cam2: '10.10.10.101',
  cam3: '10.10.10.102'
};

// Funktion zum Laden der IP-Adressen aus der Datei
function loadSettings() {
  if (fs.existsSync(configFilePath)) {
    const data = fs.readFileSync(configFilePath);
    camIps = JSON.parse(data);
    document.getElementById('cam1-ip').value = camIps.cam1;
    document.getElementById('cam2-ip').value = camIps.cam2;
    document.getElementById('cam3-ip').value = camIps.cam3;
    console.log("Einstellungen geladen:", camIps);
  } else {
    console.log("Keine gespeicherten Einstellungen gefunden. Standardwerte werden verwendet.");
  }
}

// Funktion zum Speichern der IP-Adressen in die Datei
function saveSettings() {
  camIps.cam1 = document.getElementById('cam1-ip').value;
  camIps.cam2 = document.getElementById('cam2-ip').value;
  camIps.cam3 = document.getElementById('cam3-ip').value;

  fs.writeFileSync(configFilePath, JSON.stringify(camIps));
  console.log("Neue IPs gespeichert:", camIps);
  toggleSettings(); // Schließt das Einstellungsmenü nach dem Speichern
}

// Funktion zum Ein- und Ausklappen des Akkordeons
function toggleAccordion(button) {
  const presetsContainer = button.nextElementSibling;
  const isOpen = presetsContainer.style.display === "grid";

  // Anzeige ein- oder ausschalten
  presetsContainer.style.display = isOpen ? "none" : "grid";
  button.style.fontWeight = isOpen ? "normal" : "bold";

  // Dynamisches Ändern der Höhe
  const cameraBlock = button.parentElement;
  cameraBlock.style.maxHeight = isOpen ? "50px" : "500px"; // Geschätzte Werte für geschlossen und geöffnet
  cameraBlock.style.padding = isOpen ? "10px" : "15px";
}

// Funktion zum Anzeigen oder Verstecken der Einstellungen
function toggleSettings() {
  const settingsSection = document.getElementById('settings-section');
  settingsSection.classList.toggle('visible');
}

// Funktion zum Speichern eines Presets
async function savePreset(cameraIndex, presetNumber) {
  const ip = camIps[`cam${cameraIndex}`];
  const imageUrl = `http://${ip}/-wvhttp-01-/image.cgi`;
  const presetUrl = `http://${ip}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&all=enabled`;

  try {
    await fetch(presetUrl); // Speichert das Preset
    const response = await fetch(imageUrl); // Bild für Thumbnail herunterladen
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onloadend = () => {
      document.getElementById(`cam${cameraIndex}-preset${presetNumber}`).src = reader.result;
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(`Fehler beim Speichern des Presets ${presetNumber} für Kamera ${cameraIndex}:`, error);
  }
}

// Funktion zum Löschen eines Presets
async function deletePreset(cameraIndex, presetNumber) {
  const ip = camIps[`cam${cameraIndex}`];
  const deleteUrl = `http://${ip}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&name=&ptz=disabled`;

  try {
    await fetch(deleteUrl); // Löscht das Preset
    document.getElementById(`cam${cameraIndex}-preset${presetNumber}`).src = 'images/empty.png'; // Setzt das Thumbnail zurück
    console.log(`Preset ${presetNumber} für Kamera ${cameraIndex} gelöscht.`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Presets ${presetNumber} für Kamera ${cameraIndex}:`, error);
  }
}

// Funktion zum Ausführen eines Presets
async function playPreset(cameraIndex, presetNumber) {
  const ip = camIps[`cam${cameraIndex}`];
  const playUrl = `http://${ip}/-wvhttp-01-/info.cgi?item=p${presetNumber}`;

  try {
    await fetch(playUrl); // Preset ausführen
    console.log(`Preset ${presetNumber} für Kamera ${cameraIndex} ausgeführt.`);
  } catch (error) {
    console.error(`Fehler beim Ausführen des Presets ${presetNumber} für Kamera ${cameraIndex}:`, error);
  }
}

// Lädt die gespeicherten Einstellungen beim Start
window.onload = loadSettings;
