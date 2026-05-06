<template>
  <div class="home">
    <!-- HEADER -->
    <header class="header">
      <h2>Shuttle Bus System</h2>
      <button @click="goLogin">Login</button>
    </header>

    <!-- MAP -->
    <div id="map" class="map"></div>

    <!-- INFO -->
    <div class="info">
      <div class="card">
        <h3>🚌 Available Buses</h3>
        <p>{{ buses.length }} buses running</p>
      </div>

      <div class="card">
        <h3>⏱️ Next Arrival</h3>
        <p>~ 5 minutes</p>
      </div>

      <div class="card">
        <h3>📍 Popular Stop</h3>
        <p>Gate 1</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const buses = ref([
  { id: 1, name: 'Bus A', lat: 13.7367, lng: 100.5231 },
  { id: 2, name: 'Bus B', lat: 13.7380, lng: 100.5200 }
])

const goLogin = () => {
  router.push('/')
}

onMounted(() => {
  const map = L.map('map').setView([20.045143993832916, 99.8942217297103], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  // แสดงรถทุกคัน
  buses.value.forEach(bus => {
    L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(bus.name)
  })

  setTimeout(() => {
    map.invalidateSize()
  }, 100)
})
</script>

<style scoped>
.home {
  font-family: Arial;
  padding: 20px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* MAP */
.map {
  height: 350px;
  margin-top: 15px;
  border-radius: 10px;
}

/* INFO */
.info {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.card {
  flex: 1;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}
</style>