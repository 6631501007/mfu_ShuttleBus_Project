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
        <h2>Dashboard</h2>
        <div class="profile">👤</div>
      </header>

      <!-- Cards -->
      <div class="cards">
        <div class="card">Total Passengers<br><b>99</b></div>
        <div class="card">Active Buses<br><b>3</b></div>
        <div class="card">Still Buses<br><b>4</b></div>
        <div class="card">Maintain Buses<br><b>10</b></div>
      </div>

      <!-- Content -->
      <div class="content">
        <!-- Left -->
        <div class="left">
          <div id="map"></div>
          <canvas id="chart"></canvas>
        </div>

        <!-- Notifications -->
        <div class="right">
          <h3>Notifications</h3>

          <div class="noti" v-for="i in 3" :key="i">
            <b>Station: 14 - M-square</b><br>
            Building Red Zone !!!<br>
            People waiting now: 20 people
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="history">
        History
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import Chart from "chart.js/auto"

const useRouter_var = useRouter()

onMounted(() => {
  // 🗺️ Map
  const map = L.map("map").setView([20.0458, 99.8913], 15)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map)

  L.marker([20.0458, 99.8913]).addTo(map)
    .bindPopup("Station 9")

  // 📊 Chart
  new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
      datasets: [{
        label: "Passengers",
        data: [10, 40, 20, 35, 25, 45, 15],
        fill: true,
        tension: 0.4
      }]
    }
  })
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: Arial;
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

/* Main */
.main {
  flex: 1;
  background: #eee;
  padding: 10px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 10px 0;
}

.card {
  background: #ddd;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

/* Content */
.content {
  display: flex;
  gap: 10px;
}

.left {
  flex: 2;
}

#map {
  height: 250px;
  margin-bottom: 10px;
}

canvas {
  background: white;
  border-radius: 10px;
}

/* Right */
.right {
  flex: 1;
  background: #ddd;
  padding: 10px;
  border-radius: 10px;
}

.noti {
  background: #ccc;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
}

/* History */
.history {
  margin-top: 10px;
  background: #ddd;
  height: 120px;
  border-radius: 10px;
}
</style>