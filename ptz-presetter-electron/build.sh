#!/bin/bash

# Benutzerabfragen
read -p "Gib den Namen der App ein: " app_name
read -p "Gib den vollständigen Pfad zum Icon (z.B. /Pfad/zum/Icon.icns): " icon_path
read -p "Gib die Plattform ein (z.B. darwin für macOS, win32 für Windows, linux): " platform

# Standardarchitektur auf x64 setzen
arch="x64"

# Electron-Packager-Befehl ausführen
npx electron-packager . "$app_name" --icon="$icon_path" --platform="$platform" --arch="$arch" --out=dist --overwrite

# Abschlussmeldung
echo "Die App \"$app_name\" wurde erfolgreich für die Plattform \"$platform\" erstellt und in den Ordner 'dist' gespeichert."
