<template>
  <div class="app-container">
    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="logo">
            <h1 class="logo-title">Bus<span class="logo-span">Stop</span></h1>
            <p class="logo-sub">PASSENGER INTELLIGENCE</p>
          </div>
        </div>

        <div class="header-right">
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
const isDropdownOpen = ref(false);

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

const logOut = () => {
  isDropdownOpen.value = false;
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  router.push("/");
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);

  const map = L.map("map").setView([20.04498749707566, 99.89428182346516], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const marker1 = L.marker([20.04582132999694, 99.89134391063925]).addTo(map);
  marker1.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: #d72660;">Station: 14 - M-square Building</b><br>
      People waiting now: 13<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `);

  const marker2 = L.marker([20.04566810292221, 99.89155253753619]).addTo(map);
  marker2.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: #2563eb;">Station: 9 - Swimming Pool</b><br>
      People waiting now: 6<br>
      <span style="color: #6b7280; font-size: 12px;">No buses in the vicinity</span>
    </div>
  `);

  const marker3 = L.marker([20.0473286489084, 99.8932291391427]).addTo(map);
  marker3.bindPopup(`
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  background-color: #f7f7fa;
  color: #333;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

.header-right {
  display: flex;
  align-items: center;
}

.profile-dropdown-container {
  position: relative;
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
  border-color: #d72660;
  background-color: #fff0f5;
  color: #d72660;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 9999;
  border: 1px solid #f3f4f6;
}

.dropdown-item {
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dropdown-item i {
  font-size: 18px;
}
.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #d72660;
}
.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
}
.logout-item {
  color: #d72660;
}
.logout-item:hover {
  background-color: #fff0f5;
}

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
  z-index: 1;
}
</style>