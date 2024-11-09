#!/bin/bash

# Erstellen der index.html
cat > src/index.html <<EOL
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PTZ Presetter</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="settings.css">
</head>
<body>
    <div id="settingsMenu">
        <button id="toggleSettingsBtn" onclick="toggleSettingsMenu()">Einstellungen</button>
        <h2>Einstellungen</h2>
        <div id="settingsContainer"></div>
        <button id="saveButton">Speichern</button>
    </div>
    <div id="mainContainer">
        <h1>PTZ Presetter</h1>
        <!-- Dynamische Kamera-Sektionen werden hier eingefügt -->
        <div id="cameraSections"></div>
    </div>
    <script src="renderer.js"></script>
</body>
</html>
EOL

echo "index.html erfolgreich erstellt."