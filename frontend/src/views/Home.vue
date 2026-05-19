<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="brand">
        <h1 class="logo-title">Bus Stop</h1>
        <p class="logo-subtitle">PASSENGER INTELLIGENCE</p>
      </div>

      <nav class="nav-menu">
        <div class="nav-item">
          <i class='bx bxs-dashboard icon'></i> Dashboard
        </div>
        <div class="nav-item active">
          <i class='bx bx-map-alt icon'></i> Map
        </div>
        <div class="nav-item">
          <i class='bx bx-history icon'></i> History
        </div>
        <div class="nav-item">
          <i class='bx bx-cog icon'></i> Settings
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" placeholder="Search devices or zones..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
            
            <div class="lang-switcher">
              <i class='bx bx-globe'></i>
              <span>English</span>
              <i class='bx bx-chevron-down'></i>
            </div>
          </div>

          <div class="profile-dropdown-container">
            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">
              <i class='bx bxs-user'></i>
            </div>
            
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div class="dropdown-item"><i class='bx bx-user-circle'></i> Profile</div>
              <div class="dropdown-item"><i class='bx bx-transfer-alt'></i> Switch Accounts</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout-item" @click="logOut"><i class='bx bx-log-out'></i> Log out</div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();

// --- Profile Dropdown Logic ---
const isDropdownOpen = ref(false);

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

const logOut = () => {
  isDropdownOpen.value = false;
  router.push("/");
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);

  // --- Initialize Map ---
  const map = L.map("map").setView([20.04498749707566, 99.89428182346516], 15);

  // Map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // Marker 1
  const marker1 = L.marker([20.04582132999694, 99.89134391063925]).addTo(map);
  marker1.bindPopup(`
    <div style="font-family: Arial, sans-serif;">
      <b style="color: #dc2626;">Station: 14 - M-square Building</b><br>
      People waiting now: 13<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `);

  // Marker 2
  const marker2 = L.marker([20.04566810292221, 99.89155253753619]).addTo(map);
  marker2.bindPopup(`
    <div style="font-family: Arial, sans-serif;">
      <b style="color: #2563eb;">Station: 9 - Swimming Pool</b><br>
      People waiting now: 6<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `);

  // Marker 3
  const marker3 = L.marker([20.0473286489084, 99.8932291391427]).addTo(map);
  marker3.bindPopup(`
    <div style="font-family: Arial, sans-serif;">
      <b style="color: #10b981;">Station: 8 - D1 Building</b><br>
      People waiting now: 8<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
/* ================= นำเข้า Boxicons ================= */
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

/* ================= Base Layout ================= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f9;
  color: #333;
  overflow: hidden;
}

/* ================= Sidebar ================= */
.sidebar {
  width: 260px;
  background-color: #f8fafd;
  border-right: 1px solid #e1e5eb;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.brand {
  padding: 0 24px 30px;
}

.logo-title {
  color: #b91c1c;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.logo-subtitle {
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 1px;
}

.nav-menu {
  flex: 1;
}

.nav-item {
  padding: 12px 24px;
  margin: 4px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item .icon {
  font-size: 20px;
}

.nav-item:hover {
  background-color: #fce7f3;
  color: #b91c1c;
}

.nav-item.active {
  background-color: #b91c1c;
  color: white;
}

/* ================= Main Content & Header ================= */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* ป้องกันการเลื่อนแผนที่แล้วไปกระทบส่วนอื่น */
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.search-bar {
  background-color: #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
}

.search-bar i {
  color: #6b7280;
  font-size: 18px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: #4b5563;
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
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
  color: #1f2937;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
  margin-left: 8px;
}

.lang-switcher i.bx-globe { font-size: 18px; }
.lang-switcher i.bx-chevron-down { font-size: 20px; margin-left: -2px; }
.lang-switcher:hover { background-color: #f3f4f6; }

.profile-dropdown-container {
  position: relative;
  margin-left: 8px;
}

.profile-circle {
  width: 40px;
  height: 40px;
  background-color: #e5e7eb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 20px;
  color: #4b5563;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.profile-circle:hover {
  border-color: #b91c1c;
  background-color: #fce7f3;
  color: #b91c1c;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
  width: 200px;
  overflow: hidden;
  z-index: 9999; /* ปรับให้สูงกว่า Leaflet map */
  border: 1px solid #f3f4f6;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dropdown-item:hover { background-color: #f3f4f6; color: #b91c1c; }
.dropdown-divider { height: 1px; background-color: #e5e7eb; }
.logout-item { color: #dc2626; }
.logout-item:hover { background-color: #fef2f2; }

/* ================= Map Wrapper ================= */
.map-wrapper {
  flex: 1;
  padding: 0 32px 32px 32px;
  display: flex;
  flex-direction: column;
}

#map {
  flex: 1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e1e5eb;
  z-index: 1; /* ต่ำกว่า Dropdown Header */
}
</style>