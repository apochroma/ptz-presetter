let cameraCount = 3;
const cameraSettingsContainer = document.getElementById("camera-settings");
const cameraContainer = document.getElementById("camera-container");

function toggleSettings() {
  const settingsSection = document.getElementById('settings-section');
  const toggleButton = document.getElementById('toggle-settings-btn');
  settingsSection.classList.toggle('visible');
  toggleButton.classList.toggle('rotate');
}

function addCameraField() {
  cameraCount++;
  const newCameraField = document.createElement("div");
  newCameraField.innerHTML = `
    <label for="cam${cameraCount}-ip">Cam ${cameraCount} IP:</label>
    <input type="text" id="cam${cameraCount}-ip" value="10.10.10.${100 + cameraCount}">
    <button onclick="addCameraField()">+</button>
    <button onclick="removeCameraField(${cameraCount})">-</button>
    <br>
  `;
  cameraSettingsContainer.appendChild(newCameraField);
}

function removeCameraField(id) {
  if (id > 3) {
    const field = document.getElementById(`cam${id}-ip`).parentNode;
    cameraSettingsContainer.removeChild(field);
    cameraCount--;
  }
}

function saveSettings() {
  const cameras = [];
  for (let i = 1; i <= cameraCount; i++) {
    const ipField = document.getElementById(`cam${i}-ip`);
    if (ipField) {
      cameras.push({ id: i, ip: ipField.value });
    }
  }
  const settings = { cameras };
  const settingsJSON = JSON.stringify(settings);

  // Zum Speichern in einer Datei
  // Für eine Node.js App könnte fs.writeFileSync genutzt werden, hier ist es simuliert
  console.log("Settings gespeichert:", settingsJSON);

  updateCameraBlocks(cameras);
}

function updateCameraBlocks(cameras) {
  cameraContainer.innerHTML = ""; // Lösche vorhandene Blöcke
  cameras.forEach(camera => {
    const cameraBlock = document.createElement("div");
    cameraBlock.classList.add("camera-block");
    cameraBlock.innerHTML = `
      <div class="camera-title">Cam ${camera.id}</div>
      <div class="presets">
        ${Array.from({ length: 10 }).map((_, index) => `
          <div class="preset" data-preset="${index + 1}">
            <div class="thumbnail-container">
              <a href="#" onclick="playPreset(${camera.id}, ${index + 1})">
                <img class="thumbnail" id="cam${camera.id}-preset${index + 1}" src="images/empty.png" alt="Preset ${index + 1}">
                <span class="preset-label">Preset ${index + 1}</span>
              </a>
              <div class="controls">
                <button onclick="savePreset(${camera.id}, ${index + 1})">💾</button>
                <button onclick="deletePreset(${camera.id}, ${index + 1})">🗑️</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    cameraContainer.appendChild(cameraBlock);
  });
}

function playPreset(cameraNumber, presetNumber) {
  console.log(`Playing preset ${presetNumber} for camera ${cameraNumber}`);
}

function savePreset(cameraNumber, presetNumber) {
  console.log(`Saving preset ${presetNumber} for camera ${cameraNumber}`);
}

function deletePreset(cameraNumber, presetNumber) {
  console.log(`Deleting preset ${presetNumber} for camera ${cameraNumber}`);
}
