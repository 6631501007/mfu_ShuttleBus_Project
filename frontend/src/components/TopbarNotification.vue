<template>
  <div
    class="notification-container"
    @mouseenter="isOpen = true"
  >
    <button class="notification-btn" type="button" @click="isOpen = !isOpen">
      <i class="bx bx-bell icon-btn"></i>
      <span v-if="notifications.length" class="notification-badge">{{ notifications.length }}</span>
    </button>

    <div
      class="notification-dropdown"
      v-show="isOpen"
      @mouseenter="isOpen = true"
      @mouseleave="isOpen = false"
    >
      <div class="notification-header">Notifications</div>
      <div v-if="notifications.length" class="notification-list">
        <div class="notification-item" v-for="item in notifications" :key="item.id">
          <div class="notification-icon"><i class="bx bxs-error"></i></div>
          <div class="notification-content">
            <strong class="notification-title">{{ item.station }}</strong>
            <span class="notification-desc">{{ item.message }}</span>
            <span class="notification-meta">People waiting now: {{ item.people }} people</span>
          </div>
        </div>
      </div>
      <div v-else class="notification-empty">No notifications available.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiFetch } from '../lib/api'
import { createRedStationNotification, isRedStation } from '../lib/stationAlert'

const isOpen = ref(false)
const notifications = ref([])

const loadNotifications = async () => {
  try {
    const res = await apiFetch('/api/dashboard')
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Cannot load notifications')

    notifications.value = (data.stations || [])
      .filter(isRedStation)
      .map(createRedStationNotification)
  } catch (error) {
    console.error(error)
  }
}

const closeDropdown = (e) => {
  if (!e.target.closest('.notification-container')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  loadNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.notification-container {
  position: relative;
}

.notification-btn {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.icon-btn {
  cursor: pointer;
  font-size: 22px;
  color: #6b7280;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #d72660;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #d72660;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 42px;
  right: -8px;
  width: 320px;
  max-height: 360px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(17, 24, 39, 0.16);
  z-index: 10000;
}

.notification-dropdown::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
}

.notification-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-left: 4px solid #d72660;
  border-radius: 12px;
  background: #fff1f5;
  margin-bottom: 12px;
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-icon {
  font-size: 20px;
  color: #d72660;
  padding-top: 2px;
}

.notification-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

.notification-desc {
  font-size: 12px;
  font-weight: 600;
  color: #d72660;
}

.notification-meta,
.notification-empty {
  font-size: 12px;
  color: #6b7280;
}

.notification-empty {
  padding: 16px;
  text-align: center;
}
</style>
