<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">🚌</div>
      <div class="menu">
        <div class="item">🏷️</div>
        <div class="item">📍</div>
        <div class="item active">🕒</div>
        <div class="item">⚙️</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <h1>History</h1>
        <div class="profile">👤</div>
      </header>

      <!-- Top Section -->
      <div class="top">
        <!-- Calendar -->
        <div class="calendar">
          <div class="cal-header">
            <button @click="prevMonth">‹</button>

            <select v-model="month">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>

            <select v-model="year">
              <option v-for="y in 5" :key="y">{{ 2023 + y }}</option>
            </select>

            <button @click="nextMonth">›</button>
          </div>

          <div class="grid">
            <div v-for="d in days" :key="d"
                 :class="['day', selectedDay === d ? 'active' : '']"
                 @click="selectedDay = d">
              {{ d }}
            </div>
          </div>
        </div>

        <!-- Filter -->
        <div class="filter">
          <span>{{ selectedDate }}</span>
          <select v-model="busFilter">
            <option value="all">All bus</option>
            <option value="A">Bus A</option>
            <option value="B">Bus B</option>
            <option value="B">Bus c</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>BUS</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Station</th>
              <th>Driver name</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(row, i) in filteredData" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ row.bus }}</td>
              <td>{{ row.route }}</td>
              <td>{{ row.depart }}</td>
              <td>{{ row.arrive }}</td>
              <td>{{ row.station }}</td>
              <td>{{ row.driver }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const month = ref(9)
const year = ref(2025)
const selectedDay = ref(13)
const busFilter = ref("all")

const days = Array.from({ length: 30 }, (_, i) => i + 1)

const selectedDate = computed(() => {
  return `${selectedDay.value}/${month.value}/${year.value}`
})

const data = ref([
  { bus: "BUS A", route: "LINE 1", depart: "8.00", arrive: "9.00", station: 1, driver: "Mr.Yod" },
  { bus: "BUS B", route: "LINE 2", depart: "9.00", arrive: "10.00", station: 2, driver: "Mr.Gun" },
  { bus: "BUS C", route: "LINE 1", depart: "10.00", arrive: "11.00", station: 3, driver: "Mr.Chad" }
])

const filteredData = computed(() => {
  if (busFilter.value === "all") return data.value
  return data.value.filter(d => d.bus.includes(busFilter.value))
})

const prevMonth = () => {
  if (month.value > 1) month.value--
}

const nextMonth = () => {
  if (month.value < 12) month.value++
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  font-family: Arial;
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
  margin: 15px 0;
  cursor: pointer;
}

/* Main */
.main {
  flex: 1;
  background: #eee;
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
}

/* Top */
.top {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

/* Calendar */
.calendar {
  background: #ddd;
  padding: 10px;
  border-radius: 10px;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  background: #eee;
  border-radius: 5px;
}

.day.active {
  background: black;
  color: white;
}

/* Filter */
.filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Table */
.table {
  background: #ddd;
  padding: 10px;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #aaa;
  text-align: center;
}
</style>