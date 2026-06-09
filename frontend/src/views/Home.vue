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
import { apiFetch } from '../lib/api'

const router = useRouter();
const isDropdownOpen = ref(false);
const stations = ref([]);
let map = null;

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

const createMap = () => {
  const initial = stations.value.length
    ? stations.value[0].location
    : { lat: 20.04498749707566, lng: 99.89428182346516 };

  map = L.map("map").setView([initial.lat, initial.lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  stations.value.forEach((station) => {
    const marker = L.marker([station.location.lat, station.location.lng]).addTo(map);
    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
        <b style="color: #d72660;">${station.name}</b><br>
        People waiting now: ${station.waitingPassengers}<br>
        <span style="color: #6b7280; font-size: 12px;">${station.incomingBuses}</span>
      </div>
    `);
  });
};

const loadHomeData = async () => {
  try {
    const res = await apiFetch('/api/home');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cannot load home data');
    stations.value = data.stations || [];
    createMap();
  } catch (error) {
    console.error(error);
    createMap();
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  loadHomeData();
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  if (map) map.remove();
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
  position: relative;
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
  position: relative;
}

.top-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  pointer-events: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 14px;
  padding: 12px 16px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(10px);
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
  pointer-events: auto;
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
  position: absolute;
  inset: 0;
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
  border: none;
  z-index: 1;
}

:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border-inline: 0;
  text-align: initial;
}
</style>
