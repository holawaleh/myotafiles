// Configuration
const API_BASE = 'https://myotafiles.onrender.com';

// State
let firmwares = [];
let isLoggedIn = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    
    // Add enter key listener for login
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

// Check if user is logged in
function checkLoginStatus() {
    isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login page
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
    loadFirmwares();
}

// Handle login
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Signing in...';
    loginSpinner.classList.remove('hidden');
    
    // Simulate login (replace with actual API call when auth is implemented)
    setTimeout(() => {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        isLoggedIn = true;
        
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Sign In';
        loginSpinner.classList.add('hidden');
        
        showDashboard();
    }, 1000);
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    isLoggedIn = false;
    
    // Clear form
    document.getElementById('deviceType').value = 'esp_test';
    document.getElementById('version').value = '';
    document.getElementById('binFile').value = '';
    document.getElementById('isActive').checked = true;
    
    // Clear login form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    showLogin();
}

// Show login error
function showLoginError(message) {
    const errorBanner = document.getElementById('loginError');
    const errorText = document.getElementById('loginErrorText');
    errorText.textContent = message;
    errorBanner.classList.remove('hidden');
}

// Close login error
function closeLoginError() {
    document.getElementById('loginError').classList.add('hidden');
}

// Show error
function showError(message) {
    const errorBanner = document.getElementById('errorBanner');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorBanner.classList.remove('hidden');
}

// Close error
function closeError() {
    document.getElementById('errorBanner').classList.add('hidden');
}

// Load firmwares from API
async function loadFirmwares() {
    const listContainer = document.getElementById('firmwareList');
    const refreshBtn = document.getElementById('refreshBtn');
    const refreshIcon = document.getElementById('refreshIcon');
    
    refreshBtn.disabled = true;
    refreshIcon.style.animation = 'spin 1s linear infinite';
    
    if (firmwares.length === 0) {
        listContainer.innerHTML = `
            <div class="loading">
                <svg class="spinner" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Loading firmware...</p>
            </div>
        `;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/firmware/`);
        
        if (!response.ok) {
            throw new Error('Failed to load firmware');
        }
        
        firmwares = await response.json();
        renderFirmwareList();
        closeError();
    } catch (err) {
        showError(err.message + ' (Render might be sleeping - try refresh)');
        
        if (firmwares.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>Failed to load firmware. Click refresh to try again.</p>
                </div>
            `;
        }
    } finally {
        refreshBtn.disabled = false;
        refreshIcon.style.animation = '';
    }
}

// Render firmware list
function renderFirmwareList() {
    const listContainer = document.getElementById('firmwareList');
    
    if (firmwares.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p>No firmware uploaded yet. Upload your first .bin file above.</p>
            </div>
        `;
        return;
    }
    
    const rows = firmwares.map(fw => {
        const date = new Date(fw.created_at);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        const statusBadge = fw.is_active 
            ? `<span class="badge badge-active">
                 <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>
                 Active
               </span>`
            : `<span class="badge badge-inactive">
                 <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>
                 Inactive
               </span>`;
        
        return `
            <tr>
                <td><span class="device-type">${fw.device_type}</span></td>
                <td><span class="version">${fw.version}</span></td>
                <td>${statusBadge}</td>
                <td style="color: #9ca3af; font-size: 0.875rem;">${dateStr} ${timeStr}</td>
                <td>
                    <a href="${fw.bin_file}" target="_blank" rel="noopener noreferrer" class="download-link">
                        Download
                    </a>
                </td>
            </tr>
        `;
    }).join('');
    
    listContainer.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Device</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Uploaded</th>
                        <th>File</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Handle firmware upload
async function handleUpload() {
    const deviceType = document.getElementById('deviceType').value.trim();
    const version = document.getElementById('version').value.trim();
    const binFile = document.getElementById('binFile').files[0];
    const isActive = document.getElementById('isActive').checked;
    
    if (!binFile) {
        showError('Please select a .bin file');
        return;
    }
    
    if (!version) {
        showError('Please enter a version');
        return;
    }
    
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadBtnText = document.getElementById('uploadBtnText');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadSpinner = document.getElementById('uploadSpinner');
    
    uploadBtn.disabled = true;
    uploadBtnText.textContent = 'Uploading...';
    uploadIcon.classList.add('hidden');
    uploadSpinner.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('device_type', deviceType);
    formData.append('version', version);
    formData.append('is_active', isActive);
    formData.append('bin_file', binFile);
    
    try {
        const response = await fetch(`${API_BASE}/api/firmware/`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
        
        // Reset form
        document.getElementById('version').value = '';
        document.getElementById('binFile').value = '';
        document.getElementById('isActive').checked = true;
        
        // Reload list
        await loadFirmwares();
        closeError();
    } catch (err) {
        showError('Upload failed: ' + err.message);
    } finally {
        uploadBtn.disabled = false;
        uploadBtnText.textContent = 'Upload Firmware';
        uploadIcon.classList.remove('hidden');
        uploadSpinner.classList.add('hidden');
    }
}