const ipCams = ["10.10.10.100", "10.10.10.101", "10.10.10.102"];

async function savePreset(cameraIndex, presetNumber) {
  const ip = ipCams[cameraIndex - 1];
  const imageUrl = `http://${ip}/-wvhttp-01-/image.cgi`;
  const presetUrl = `http://${ip}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&all=enabled`;

  try {
    await fetch(presetUrl); // Speichern des Presets
    const response = await fetch(imageUrl); // Bild herunterladen
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

async function deletePreset(cameraIndex, presetNumber) {
  const ip = ipCams[cameraIndex - 1];
  const deleteUrl = `http://${ip}/-wvhttp-01-/preset/set?&p=${presetNumber}&name=${presetNumber}&name=&ptz=disabled`;

  try {
    await fetch(deleteUrl); // Löschen des Presets
    // Setze das Thumbnail auf das Standardbild zurück
    document.getElementById(`cam${cameraIndex}-preset${presetNumber}`).src = 'images/empty.png';
    console.log(`Preset ${presetNumber} für Kamera ${cameraIndex} gelöscht.`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Presets ${presetNumber} für Kamera ${cameraIndex}:`, error);
  }
}
