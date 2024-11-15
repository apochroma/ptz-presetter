#!/bin/bash

# Benutzerabfragen
default_app_name="PTZ Presetter"
read -p "Gib den Namen der App ein [${default_app_name}]: " app_name
app_name=${app_name:-$default_app_name}

default_icon_path="/Users/cdp/Desktop/ptz-presetter/ptz-presetter-electron/src/PTZ Presetter.icns"
read -p "Gib den vollständigen Pfad zum Icon [${default_icon_path}]: " icon_path
icon_path=${icon_path:-$default_icon_path}

default_platform="darwin"
read -p "Gib die Plattform ein (z.B. darwin für macOS, win32 für Windows, linux): [${default_platform}]: " platform
platform=${platform:-$default_platform}

# Standardarchitektur auf x64 setzen
arch="x64"

# Electron-Packager-Befehl ausführen
npx electron-packager . "$app_name" --icon="$icon_path" --platform="$platform" --arch="$arch" --out=dist --overwrite

# Abschlussmeldung
echo "Die App \"$app_name\" wurde erfolgreich für die Plattform \"$platform\" erstellt und in den Ordner 'dist' gespeichert."
