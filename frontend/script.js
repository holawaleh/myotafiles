const API_BASE = 'https://myotafiles.onrender.com';

let firmwares = [];

document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  document.getElementById('isActive').addEventListener('change', updateActiveWarning);
});

function checkLoginStatus() {
  const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  loggedIn ? showDashboard() : showLogin();
}

function showLogin() {
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard() {
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('dashboardPage').classList.add('active');
  loadFirmwares();
}

function handleLogin() {
  sessionStorage.setItem('isLoggedIn', 'true');
  showDashboard();
}

function handleLogout() {
  sessionStorage.clear();
  showLogin();
}

/* UI helpers */
function showError(msg) {
  document.getElementById('errorText').textContent = msg;
  document.getElementById('errorBanner').classList.remove('hidden');
}

function closeError() {
  document.getElementById('errorBanner').classList.add('hidden');
}

function updateActiveWarning() {
  const uploadBtn = document.getElementById('uploadBtn');
  const isActive = document.getElementById('isActive').checked;
  uploadBtn.classList.toggle('active-warning', isActive);
}

/* Firmware */
async function loadFirmwares() {
  try {
    const res = await fetch(`${API_BASE}/api/firmware/`);
    if (!res.ok) throw new Error('Failed to load firmware');
    firmwares = await res.json();
    renderFirmwareList();
  } catch (err) {
    showError(err.message + ' (Render may be sleeping)');
  }
}

function renderFirmwareList() {
  const list = document.getElementById('firmwareList');
  if (!firmwares.length) {
    list.innerHTML = '<p class="empty-state">No firmware uploaded yet.</p>';
    return;
  }

  list.innerHTML = `
    <table>
      <thead>
        <tr><th>Device</th><th>Version</th><th>Status</th><th>Uploaded</th><th>File</th></tr>
      </thead>
      <tbody>
        ${firmwares.map(fw => `
          <tr>
            <td>${fw.device_type}</td>
            <td>${fw.version}</td>
            <td>${fw.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-inactive">Inactive</span>'}</td>
            <td>${new Date(fw.created_at).toLocaleString()}</td>
            <td><a href="${fw.bin_file}" target="_blank" class="download-link">Download</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

async function handleUpload() {
  const deviceType = document.getElementById('deviceType').value.trim();
  const version = document.getElementById('version').value.trim();
  const binFile = document.getElementById('binFile').files[0];
  const isActive = document.getElementById('isActive').checked;

  if (!binFile || !version) {
    showError('Version and .bin file required');
    return;
  }

  const uploadBtn = document.getElementById('uploadBtn');
  uploadBtn.disabled = true;

  const formData = new FormData();
  formData.append('device_type', deviceType);
  formData.append('version', version);
  formData.append('is_active', isActive);
  formData.append('bin_file', binFile);

  try {
    const res = await fetch(`${API_BASE}/api/firmware/`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    await loadFirmwares();
    closeError();
  } catch (err) {
    showError(err.message);
  } finally {
    uploadBtn.disabled = false;
  }
}
