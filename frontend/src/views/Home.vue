<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">🚌</div>
      <div class="menu">
        <router-link to="/dashboard" class="item">🏷️</router-link>
        <router-link to="/home" class="item active">📍</router-link>
        <router-link to="/history" class="item">🕒</router-link>
        <div class="item">⚙️</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <h1>Shuttle Bus System</h1>
        <div class="profile">
          <span>Welcome, {{ user?.username }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </header>

      <!-- Map -->
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const router = useRouter();
const user = ref(null);

// Load user data
const userData = localStorage.getItem("user");
if (userData) {
  user.value = JSON.parse(userData);
}

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/");
};

onMounted(() => {
  const map = L.map("map").setView([20.04498749707566, 99.89428182346516], 15);

  // Map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // Station markers
  const marker1 = L.marker([20.04582132999694, 99.89134391063925]).addTo(map);

  marker1.bindPopup(`
    <b>Station 14: M-square Building</b><br>
    People waiting now: 8<br>
    Next bus in 5 minutes
  `);

  const marker2 = L.marker([20.04566810292221, 99.89155253753619]).addTo(map);

  marker2.bindPopup(`
    <b>Station 9: Swimming Pool</b><br>
    People waiting now: 12<br>
    Bus just arrived
  `);

  const marker3 = L.marker([20.0473286489084, 99.8932291391427]).addTo(map);

  marker3.bindPopup(`
    <b>Station 8: D1 Building</b><br>
    People waiting now: 15<br>
    No buses in the vicinity
  `);
});
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 70px;
  background: #ff2d55;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  font-size: 28px;
  margin: 20px 0;
}

.menu .item {
  margin: 20px 0;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  font-size: 24px;
}

/* Main */
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

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout-btn {
  background: #ff2d55;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

/* Map */
#map {
  flex: 1;
  height: 100%;
}
</style>