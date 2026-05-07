<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <router-link to="/dashboard" class="logo">🚌</router-link>
      <div class="menu">
        <router-link to="/dashboard" class="item" title="Dashboard">📊</router-link>
        <router-link to="/home" class="item" title="Map">🗺️</router-link>
        <router-link to="/history" class="item" title="History">🕒</router-link>
        <router-link to="/" class="item" title="Sign Out">🚪</router-link>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <div class="left">
          <span class="icon">🚌</span>
          <h1>Shuttle Bus System</h1>
        </div>

        <div class="right">
          <div class="profile" @click="toggleMenu">
            👤
          </div>

          <div v-if="showMenu" class="dropdown">
            <div @click="changeLanguage">Language</div>
            <div @click="logOut">Log Out</div>
          </div>
        </div>
      </header>

      <!-- Map -->
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const router = useRouter()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const changeLanguage = () => {
  alert("Language feature coming soon")
  showMenu.value = false
}

const logOut = () => {
  showMenu.value = false
  router.push("/")
}

onMounted(() => {
  const map = L.map("map").setView([20.04498749707566, 99.89428182346516], 15)

  // Map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map)

  // Marker (ตัวอย่าง)
  const marker1 = L.marker([20.04582132999694, 99.89134391063925]).addTo(map)

  marker1.bindPopup(`
    <b>Station: 14 - M-square Building</b><br>
    People waiting now: 13<br>
    No buses in the vicinity
  `)

  // จุดอื่นๆ (แดง)
  const marker2 = L.marker([20.04566810292221, 99.89155253753619]).addTo(map)

  marker2.bindPopup(`
    <b>Station: 9 - Swimming Pool</b><br>
    People waiting now: 6<br>
    No buses in the vicinity
  `)

  const marker3 = L.marker([20.0473286489084, 99.8932291391427]).addTo(map)

  marker3.bindPopup(`
    <b>Station: 8 - D1 Building</b><br>
    People waiting now: 8<br>
    No buses in the vicinity
  `)
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 100px;
  background: #ff2d55;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
}

.logo {
  font-size: 40px;
  margin: 20px 0;
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
}

.menu .item {
  font-size: 32px;
  cursor: pointer;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 15px 0;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.menu .item:hover {
  color: white;
  transform: scale(1.1);
}

.menu .item:global(.router-link-active) {
  color: white;
  border-left-color: white;
  background: rgba(255, 255, 255, 0.25);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ff4d5a;
  color: white;
  padding: 15px 20px;
}

.left {
  display: flex;
  align-items: center;
}

.left .icon {
  font-size: 24px;
  margin-right: 10px;
}

.right {
  position: relative;
}

.profile {
  cursor: pointer;
  font-size: 22px;
}

/* Dropdown */
.dropdown {
  position: absolute;
  right: 0;
  top: 40px;
  background: #ddd;
  padding: 10px;
  border-radius: 5px;
  z-index: 10;
}

.dropdown div {
  padding: 5px 10px;
  cursor: pointer;
}

.dropdown div:hover {
  background: #ccc;
  border-radius: 3px;
}

/* Map */
#map {
  height: calc(100vh - 70px);
  flex: 1;
}
</style>