<template>
  <div class="app">
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
          <div>Language</div>
          <div>Log Out</div>
        </div>
      </div>
    </header>

    <!-- Map -->
    <div id="map"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
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
    <b>Station: 9 - Swimming Pool</b><br>
    People waiting now: 6<br>
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
    <b>Station: 9 - Swimming Pool</b><br>
    People waiting now: 6<br>
    No buses in the vicinity
  `)
})
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
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
}

.dropdown div {
  padding: 5px 10px;
  cursor: pointer;
}

/* Map */
#map {
  height: calc(100vh - 70px);
}
</style>