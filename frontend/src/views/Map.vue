<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="logo">
          <h1 class="logo-title">Bus<span class="logo-span">Stop</span></h1>
          <p class="logo-sub">PASSENGER INTELLIGENCE</p>
        </div>

        <nav class="menu">
          <div class="menu-item" @click="router.push('/dashboard')">
            <i class='bx bx-grid-alt menu-icon'></i>
            <span class="menu-label">Dashboard</span>
          </div>
          <div class="menu-item" @click="router.push('/analytics')">
            <i class='bx bx-line-chart menu-icon'></i>
            <span class="menu-label">Analytics</span>
          </div>
          <div class="menu-item" @click="router.push('/map')">
            <i class='bx bx-map-alt menu-icon'></i>
            <span class="menu-label">Map</span>
          </div>
          <div class="menu-item" @click="router.push('/livefeed')">
            <i class='bx bx-video menu-icon'></i>
            <span class="menu-label">Live Feed</span>
          </div>
          <div class="menu-item" @click="router.push('/feedback')">
            <i class='bx bx-message-square-dots menu-icon'></i>
            <span class="menu-label">Feedback</span>
          </div>
          <div class="menu-item" @click="router.push('/setting')">
            <i class='bx bx-cog menu-icon'></i>
            <span class="menu-label">Settings</span>
          </div>
        </nav>
      </div>

      <div class="user-card">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <p class="user-name">Admin User</p>
          <p class="user-role">Operational Lead</p>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">Map</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search stations or buses..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
            <div class="lang-switcher" @click="toggleLanguage">
              <i class='bx bx-globe'></i>
              <span class="lang-text">{{ language }}</span>
              <i class='bx bx-chevron-down'></i>
            </div>
          </div>

          <div class="profile-dropdown-container">
            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">
              <i class='bx bxs-user'></i>
            </div>
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div class="dropdown-item logout-item" @click="logout"><i class='bx bx-log-out'></i> Log out</div>
            </div>
          </div>
        </div>
      </header>

      <div class="map-wrapper">
        <div id="map"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const isDropdownOpen = ref(false)
const language = ref('English')

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false
  }
}

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English'
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)

  // Initialize map
  const map = L.map('map').setView([20.04498749707566, 99.89428182346516], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  const marker1 = L.marker([20.04582132999694, 99.89134391063925]).addTo(map)
  marker1.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: #d72660;">Station: 14 - M-square Building</b><br>
      People waiting now: 13<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `)

  const marker2 = L.marker([20.04566810292221, 99.89155253753619]).addTo(map)
  marker2.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: #2563eb;">Station: 9 - Swimming Pool</b><br>
      People waiting now: 6<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `)

  const marker3 = L.marker([20.0473286489084, 99.8932291391427]).addTo(map)
  marker3.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: #10b981;">Station: 8 - D1 Building</b><br>
      People waiting now: 8<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f7f7fa;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ececec;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
}

/* Logo */
.logo-title {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #d72660;
  line-height: 1.2;
  margin: 0;
}

.logo-span {
  color: #444;
}

.logo-sub {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #999;
  letter-spacing: 1px;
  margin-top: 3px;
}

/* Menu */
.menu {
  margin-top: 40px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 12px;
  color: #666;
  cursor: pointer;
  transition: 0.25s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
}

.menu-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.menu-label {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
}

.menu-item:hover {
  background: #fff0f5;
  color: #d72660;
}

.menu-item:hover .menu-label {
  font-weight: 600;
}

/* User card */
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #d72660;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.user-role {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #888;
  margin: 2px 0 0;
  line-height: 1.3;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 32px;
  overflow-y: auto;
}

/* ===== TOP HEADER ===== */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}

.header-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
}

.search-bar {
  background: #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
}

.search-icon {
  font-size: 18px;
  color: #6b7280;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #4b5563;
}

.search-input::placeholder {
  color: #a1a1a1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-btn {
  cursor: pointer;
  font-size: 22px;
  color: #6b7280;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #d72660;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}

.lang-switcher:hover {
  border-color: #d72660;
  color: #d72660;
}

.lang-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* Profile Dropdown */
.profile-dropdown-container {
  position: relative;
}

.profile-circle {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #4b5563;
  transition: all 0.2s;
}

.profile-circle:hover {
  background: #fff0f5;
  color: #d72660;
}

.dropdown-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 10000;
  border: 1px solid #f3f4f6;
}

.dropdown-item {
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.dropdown-item i {
  font-size: 18px;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.logout-item {
  color: #d72660;
}

.logout-item:hover {
  background: #fff0f5;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}

/* ===== MAP WRAPPER ===== */
.map-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
