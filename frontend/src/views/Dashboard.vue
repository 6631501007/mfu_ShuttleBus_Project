<template>
  <div class="dashboard">
    <!-- HEADER -->
    <header class="header">
      <h2>Shuttle Bus Dashboard</h2>
      <button @click="logout">Logout</button>
    </header>

    <!-- MAIN -->
    <div class="main">
      <!-- MAP -->
      <div id="map" class="map">
      </div>

      <!-- RIGHT PANEL -->
      <div class="side">
        <!-- BUS STATUS -->
        <div class="card">
          <h3>Bus Status</h3>
          <div v-for="bus in buses" :key="bus.id" class="bus">
            <p><b>{{ bus.name }}</b></p>
            <p>👥 {{ bus.passengers }}/{{ bus.capacity }}</p>
            <p>🚦 {{ bus.status }}</p>
          </div>
        </div>

        <!-- ALERT -->
        <div class="card alert">
          <h3>Alerts</h3>
          <p v-if="alerts.length === 0">No alerts</p>
          <p v-for="(a, i) in alerts" :key="i">⚠️ {{ a }}</p>
        </div>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats">
      <div class="card">
        <h3>Total Passengers</h3>
        <p>{{ totalPassengers }}</p>
      </div>

      <div class="card">
        <h3>Peak Time</h3>
        <p>08:00 - 09:00</p>
      </div>

      <div class="card">
        <h3>Active Buses</h3>
        <p>{{ buses.length }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const buses = ref([
  { id: 1, name: 'Bus A', passengers: 25, capacity: 40, status: 'Running' },
  { id: 2, name: 'Bus B', passengers: 40, capacity: 40, status: 'Full' },
  { id: 3, name: 'Bus C', passengers: 10, capacity: 40, status: 'Idle' }
])

const alerts = ref([
  'Bus B is full',
  'Bus C delayed'
])

const totalPassengers = computed(() =>
  buses.value.reduce((sum, b) => sum + b.passengers, 0)
)

const logout = () => {
  alert('Logout')
}

onMounted(() => {
  const map = L.map('map').setView([20.045143993832916, 99.8942217297103], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  // marker รถ
  L.marker([20.045451319471645, 99.89126037506306])
    .addTo(map)
    .bindPopup('Bus A')
})

</script>

<style scoped>
.dashboard {
  font-family: Arial;
  padding: 20px;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* MAIN LAYOUT */
.main {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

/* MAP */
.map {
  flex: 2;
  height: 100;
  background: #eee;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* SIDE PANEL */
.side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* CARD */
.card {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
}

/* BUS ITEM */
.bus {
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

/* ALERT */
.alert {
  background: #ffe5e5;
}

/* STATS */
.stats {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stats .card {
  flex: 1;
  text-align: center;
}
</style>