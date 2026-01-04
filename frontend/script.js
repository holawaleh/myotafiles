const API_BASE = "https://myotafiles.onrender.com";

/* ================= AUTH FLOW ================= */

document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  document.getElementById("isActive")
    .addEventListener("change", updateActiveWarning);
});

function checkLoginStatus() {
  const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  loggedIn ? showDashboard() : showLogin();
}

function showLogin() {
  document.getElementById("loginPage").classList.add("active");
  document.getElementById("dashboardPage").classList.remove("active");
}

function showDashboard() {
  document.getElementById("loginPage").classList.remove("active");
  document.getElementById("dashboardPage").classList.add("active");
  loadFirmwares();
  loadOTALogs();
}

function handleLogin() {
  sessionStorage.setItem("isLoggedIn", "true");
  showDashboard();
}

function handleLogout() {
  sessionStorage.clear();
  showLogin();
}

/* ================= UI HELPERS ================= */

function showError(msg) {
  document.getElementById("errorText").textContent = msg;
  document.getElementById("errorBanner").classList.remove("hidden");
}

function closeError() {
  document.getElementById("errorBanner").classList.add("hidden");
}

function updateActiveWarning() {
  const btn = document.getElementById("uploadBtn");
  const active = document.getElementById("isActive").checked;
  btn.classList.toggle("active-warning", active);
}

/* ================= FIRMWARE ================= */

async function loadFirmwares() {
  try {
    const res = await fetch(`${API_BASE}/api/firmware/`);
    if (!res.ok) throw new Error("Failed to load firmware");
    const data = await res.json();
    renderFirmwareList(data);
  } catch (err) {
    showError(err.message);
  }
}

function renderFirmwareList(list) {
  if (!list.length) {
    document.getElementById("firmwareList").innerHTML =
      "<p class='subtitle'>No firmware uploaded yet</p>";
    return;
  }

  document.getElementById("firmwareList").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Device</th>
          <th>Version</th>
          <th>Status</th>
          <th>Uploaded</th>
          <th>File</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${list.map(fw => `
          <tr>
            <td>${fw.device_type}</td>
            <td>${fw.version}</td>
            <td>
              <span class="badge ${fw.is_active ? "badge-active" : "badge-inactive"}">
                ${fw.is_active ? "Active" : "Inactive"}
              </span>
            </td>
            <td>${new Date(fw.created_at).toLocaleString()}</td>
            <td>
              <a href="${fw.bin_file}" target="_blank" class="download-link">
                Download
              </a>
            </td>
            <td>
              ${
                fw.is_active
                  ? "<span class='subtitle'>—</span>"
                  : `<button class="btn-secondary" onclick="rollbackFirmware(${fw.id})">
                       Rollback
                     </button>`
              }
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function rollbackFirmware(firmwareId) {
  if (!confirm("Rollback to this firmware? Devices will update automatically.")) {
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/firmware/${firmwareId}/activate/`,
      { method: "POST" }
    );

    if (!res.ok) throw new Error("Rollback failed");

    loadFirmwares();
    loadOTALogs();
  } catch (err) {
    showError(err.message);
  }
}




async function handleUpload() {
  const deviceType = document.getElementById("deviceType").value.trim();
  const version = document.getElementById("version").value.trim();
  const file = document.getElementById("binFile").files[0];
  const isActive = document.getElementById("isActive").checked;
  const btn = document.getElementById("uploadBtn");

  if (!file || !version) {
    showError("Version and firmware file are required");
    return;
  }

  btn.disabled = true;

  const formData = new FormData();
  formData.append("device_type", deviceType);
  formData.append("version", version);
  formData.append("is_active", isActive);
  formData.append("bin_file", file);

  try {
    const res = await fetch(`${API_BASE}/api/firmware/`, {
      method: "POST",
      body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    closeError();
    loadFirmwares();
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
  }
}

/* ================= OTA LOGS ================= */

async function loadOTALogs() {
  try {
    const res = await fetch(`${API_BASE}/api/ota/log/`);
    if (!res.ok) throw new Error("Failed to load OTA logs");
    const logs = await res.json();
    renderOTALogs(logs);
  } catch {
    document.getElementById("otaLogList").innerHTML =
      "<p class='subtitle'>No OTA logs available</p>";
  }
}

function renderOTALogs(logs) {
  if (!logs.length) {
    document.getElementById("otaLogList").innerHTML =
      "<p class='subtitle'>No OTA activity yet</p>";
    return;
  }

  document.getElementById("otaLogList").innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Device ID</th>
          <th>Type</th>
          <th>Version</th>
          <th>Status</th>
          <th>Time</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => `
          <tr>
            <td>${log.device_id}</td>
            <td>${log.device_type}</td>
            <td>${log.from_version} → ${log.to_version}</td>
            <td class="${log.status === "success" ? "log-success" : "log-failure"}">
              ${log.status.toUpperCase()}
            </td>
            <td>${new Date(log.created_at).toLocaleString()}</td>
            <td class="log-message">${log.message || "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}
