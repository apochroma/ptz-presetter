const fs = require('fs');
const path = require('path');

// Pfad zur JSON-Datei für die Kamera-Einstellungen
const settingsPath = path.join(__dirname, 'camera_settings.json');

// Funktion zum Laden der Kamera-Einstellungen aus der JSON-Datei
function loadCameraSettings() {
    if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath);
        return JSON.parse(data);
    } else {
        // Standard-Einstellungen, falls die Datei nicht existiert
        return { cameras: [{ ip: '10.10.10.100' }, { ip: '10.10.10.101' }, { ip: '10.10.10.102' }] };
    }
}

// Funktion zum Speichern der Kamera-Einstellungen in der JSON-Datei
function saveCameraSettings(settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

// Funktion, um die geladenen Kamera-Einstellungen auf die UI anzuwenden
function applyCameraSettings(settings) {
    const cam1Input = document.getElementById('cam1-ip');
    const cam2Input = document.getElementById('cam2-ip');
    const cam3Input = document.getElementById('cam3-ip');

    // Setze die IP-Werte in die Eingabefelder
    cam1Input.value = settings.cameras[0].ip;
    cam2Input.value = settings.cameras[1].ip;
    cam3Input.value = settings.cameras[2].ip;
}

// Event-Listener für das Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    const settings = loadCameraSettings();
    applyCameraSettings(settings);
});

// Funktion, um das Einstellungsmenü ein- und auszublenden
function toggleSettings() {
    const settingsSection = document.getElementById('settings-section');
    const toggleButton = document.getElementById('toggle-settings-btn');

    if (settingsSection.classList.contains('visible')) {
        settingsSection.classList.remove('visible');
        toggleButton.classList.remove('rotate');
    } else {
        settingsSection.classList.add('visible');
        toggleButton.classList.add('rotate');
    }
}

// Funktion zum Speichern der IP-Einstellungen, wenn der Speichern-Button geklickt wird
function saveSettings() {
    const cam1Ip = document.getElementById('cam1-ip').value;
    const cam2Ip = document.getElementById('cam2-ip').value;
    const cam3Ip = document.getElementById('cam3-ip').value;

    // Speichere die IPs in die JSON-Datei
    const settings = { cameras: [{ ip: cam1Ip }, { ip: cam2Ip }, { ip: cam3Ip }] };
    saveCameraSettings(settings);

    console.log('Einstellungen gespeichert:', settings);

    // Optional: Schließe das Menü nach dem Speichern automatisch
    toggleSettings();
}

// Funktion zum Abspielen eines Presets
function playPreset(cameraNumber, presetNumber) {
    console.log(`Playing preset ${presetNumber} for camera ${cameraNumber}`);
    // Hier könnte der Code hinzugefügt werden, um die Kamera zum entsprechenden Preset zu bewegen
}

// Funktion zum Speichern eines Presets
function savePreset(cameraNumber, presetNumber) {
    console.log(`Saving preset ${presetNumber} for camera ${cameraNumber}`);
    // Hier könnte der Code hinzugefügt werden, um die aktuelle Position als Preset zu speichern
}

// Funktion zum Löschen eines Presets
function deletePreset(cameraNumber, presetNumber) {
    console.log(`Deleting preset ${presetNumber} for camera ${cameraNumber}`);
    // Hier könnte der Code hinzugefügt werden, um das gespeicherte Preset zu löschen
}

// Event-Listener für den Speichern-Button
document.getElementById('saveButton').addEventListener('click', saveSettings);
