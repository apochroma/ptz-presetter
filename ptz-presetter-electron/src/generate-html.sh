#!/bin/bash

# Name der Ausgabedatei
output_file="index.html"

# HTML-Beginn
cat <<EOF > $output_file
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>PTZ Presetter</title>
  <!-- Verweise auf die CSS-Dateien für das allgemeine Design und das Einstellungsmenü -->
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="settings.css">
</head>
<body>
  <h1>PTZ Presetter</h1>

  <!-- Umschalt-Icon für das Einstellungsmenü -->
  <button id="toggle-settings-btn" onclick="toggleSettings()">></button>

  <!-- Einstellungs-Sektion -->
  <div id="settings-section" class="settings-section">
    <h2>Einstellungen</h2>
    <label for="cam1-ip">Cam 1 IP:</label>
    <input type="text" id="cam1-ip" value="10.10.10.100">
    <br>
    <label for="cam2-ip">Cam 2 IP:</label>
    <input type="text" id="cam2-ip" value="10.10.10.101">
    <br>
    <label for="cam3-ip">Cam 3 IP:</label>
    <input type="text" id="cam3-ip" value="10.10.10.102">
    <br>
    <button onclick="saveSettings()">Speichern</button>
  </div>

  <div id="camera-container">
EOF

# Funktion zum Erstellen eines Kamera-Blocks mit Presets
generate_camera_block() {
  local camera_number=$1
  echo "    <div class='camera-block'>" >> $output_file
  echo "      <div class='camera-title'>Cam $camera_number</div>" >> $output_file
  echo "      <div class='presets'>" >> $output_file

  # Erzeuge 10 Presets für die Kamera
  for preset_number in {1..10}; do
    cat <<EOF >> $output_file
        <div class='preset' data-preset='$preset_number'>
          <div class='thumbnail-container'>
            <a href='#' onclick='playPreset($camera_number, $preset_number)'>
              <img class='thumbnail' id='cam${camera_number}-preset${preset_number}' src='images/empty.png' alt='Preset $preset_number'>
              <span class='preset-label'>Preset $preset_number</span>
            </a>
            <div class='controls'>
              <button onclick='savePreset($camera_number, $preset_number)'>💾</button>
              <button onclick='deletePreset($camera_number, $preset_number)'>🗑️</button>
            </div>
          </div>
        </div>
EOF
  done

  echo "      </div>" >> $output_file
  echo "    </div>" >> $output_file
}

# Erzeuge Blöcke für Kameras 1 bis 3
for camera_number in {1..3}; do
  generate_camera_block $camera_number
done

# HTML-Ende mit nur dem externen JavaScript-Import
cat <<EOF >> $output_file
  </div>
  <script src="renderer.js"></script>
</body>
</html>
EOF

echo "HTML-Datei wurde erfolgreich als $output_file erstellt."
