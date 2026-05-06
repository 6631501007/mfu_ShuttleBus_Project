<template>
  <div class="history">
    <!-- HEADER -->
    <header class="header">
      <h2>Shuttle Bus History</h2>
    </header>

    <!-- FILTER -->
    <div class="filter">
      <input type="date" v-model="date" />
      <select v-model="selectedBus">
        <option value="">All Bus</option>
        <option v-for="bus in buses" :key="bus">{{ bus }}</option>
      </select>
    </div>

    <!-- TABLE -->
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Bus</th>
          <th>Route</th>
          <th>Passengers</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, i) in filteredHistory" :key="i">
          <td>{{ item.time }}</td>
          <td>{{ item.bus }}</td>
          <td>{{ item.route }}</td>
          <td>{{ item.passengers }}</td>
          <td :class="item.status">{{ item.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const date = ref('')
const selectedBus = ref('')

const buses = ['Bus A', 'Bus B', 'Bus C']

// mock data
const history = ref([
  { time: '08:00', bus: 'Bus A', route: 'Gate 1', passengers: 20, status: 'Normal' },
  { time: '09:00', bus: 'Bus B', route: 'Library', passengers: 40, status: 'Full' },
  { time: '10:00', bus: 'Bus C', route: 'Dorm', passengers: 15, status: 'Normal' },
])

const filteredHistory = computed(() => {
  return history.value.filter(item => {
    return (
      (!selectedBus.value || item.bus === selectedBus.value)
    )
  })
})
</script>

<style scoped>
.history {
  padding: 20px;
  font-family: Arial;
}

/* HEADER */
.header {
  margin-bottom: 20px;
}

/* FILTER */
.filter {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

th, td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

th {
  background: #f5f5f5;
}

/* STATUS COLOR */
.Normal {
  color: green;
}

.Full {
  color: red;
}
</style>