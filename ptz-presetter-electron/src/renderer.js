// Funktion zum Umschalten des Einstellungsmenüs
function toggleSettings() {
  const settingsSection = document.getElementById('settings-section');
  const toggleButton = document.getElementById('toggle-settings-btn');

  // Überprüfen, ob das Menü sichtbar ist und die Rotation entsprechend anwenden
  if (settingsSection.classList.contains('visible')) {
    settingsSection.classList.remove('visible');
    toggleButton.classList.remove('rotate'); // Entfernt die Drehung beim Zuklappen
  } else {
    settingsSection.classList.add('visible');
    toggleButton.classList.add('rotate'); // Fügt die Drehung beim Aufklappen hinzu
  }
}

// Funktion zum Speichern der IP-Adressen aus den Eingabefeldern
function saveSettings() {
  const cam1Ip = document.getElementById('cam1-ip').value;
  const cam2Ip = document.getElementById('cam2-ip').value;
  const cam3Ip = document.getElementById('cam3-ip').value;

  // Hier können die IP-Adressen gespeichert werden (z.B. in eine Datei oder in die Konsole ausgegeben)
  console.log('Cam 1 IP:', cam1Ip);
  console.log('Cam 2 IP:', cam2Ip);
  console.log('Cam 3 IP:', cam3Ip);

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
