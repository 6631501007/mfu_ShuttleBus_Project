<template>
  <div class="lf-app">

    <!-- SIDEBAR (เหมือน Analytics) -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="logo">
          <h1 class="logo-title">Bus<span class="logo-span">Stop</span></h1>
          <p class="logo-sub">PASSENGER INTELLIGENCE</p>
        </div>

        <nav class="menu">
          <div class="menu-item" @click="router.push('/dashboard')">
            <i class='bx bx-grid-alt menu-icon'></i>
            <span class="menu-label">{{ t.dashboard }}</span>
          </div>
          <div class="menu-item" @click="router.push('/analytics')">
            <i class='bx bx-line-chart menu-icon'></i>
            <span class="menu-label">{{ t.analytics }}</span>
          </div>
          <div class="menu-item" @click="router.push('/map')">
            <i class='bx bx-map-alt menu-icon'></i>
            <span class="menu-label">{{ t.map }}</span>
          </div>
          <div class="menu-item" @click="router.push('/livefeed')">
            <i class='bx bx-video menu-icon'></i>
            <span class="menu-label">{{ t.liveFeed }}</span>
          </div>
          <div class="menu-item" @click="router.push('/feedback')">
            <i class='bx bx-message-square-dots menu-icon'></i>
            <span class="menu-label">{{ t.feedback }}</span>
          </div>
          <div class="menu-item" @click="router.push('/setting')">
            <i class='bx bx-cog menu-icon'></i>
            <span class="menu-label">{{ t.settings }}</span>
          </div>
        </nav>
      </div>

      <div class="user-card">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <p class="user-name">{{ t.adminUser }}</p>
          <p class="user-role">{{ t.operationalLead }}</p>
        </div>
      </div>
    </aside>

    <!-- MAIN AREA -->
    <main class="main-content">

      <!-- TOPBAR (เหมือน Analytics) -->
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">{{ t.pageTitle }}</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" :placeholder="t.searchPlaceholder" />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <TopbarNotification />
            <div class="lang-switcher" @click="toggleLanguage">
              <i class='bx bx-globe'></i>
              <span class="lang-text">{{ t.languageName }}</span>
              <i class='bx bx-chevron-down'></i>
            </div>
          </div>

          <div class="profile-dropdown-container">
            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">
              <i class='bx bxs-user'></i>
            </div>
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div class="dropdown-item logout-item" @click="logout"><i class='bx bx-log-out'></i> {{ t.logout }}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <div class="lf-content">

        <!-- Section header -->
        <div class="section-header">
          <div>
            <h1 class="section-title">{{ t.sectionTitle }}</h1>
            <p class="section-sub">{{ t.sectionSubtitle }}</p>
          </div>
          <div class="view-btns">
            <button v-for="btn in viewButtons" :key="btn.id" @click="activeView = btn.id" class="view-btn"
              :class="{ 'view-btn-active': activeView === btn.id }">
              <span v-html="btn.icon"></span>
              {{ btn.label }}
              <span v-if="btn.id === 'heatmap'" class="heatmap-dot"
                :class="{ 'heatmap-dot-active': activeView === 'heatmap' }"></span>
            </button>
          </div>
        </div>

        <!-- Lower grid -->
        <div class="lower-grid">

          <!-- LEFT COLUMN -->
          <div class="left-col">

            <!-- Monitoring Zones -->
            <div class="panel">
              <div class="panel-head">
                <div class="panel-label">{{ t.monitoringZones }}</div>
                <span class="ai-status" :class="{ 'ai-status-live': aiRunning }">
                  <span class="ai-status-dot"></span>
                  {{ aiRunning ? t.aiLive : t.aiOffline }}
                </span>
              </div>
              <div class="zones-list">
                <div v-for="(zone, idx) in zones" :key="zone.name" class="zone-row"
                  :class="{ 'zone-row-active': zone.pax > 0 }">
                  <div class="zone-left">
                    <span class="zone-dot" :style="`background:${zone.color}`"></span>
                    <span class="zone-name">{{ zone.name }}</span>
                  </div>
                  
                </div>
              </div>
              <div class="ai-meta">
                <span>{{ aiRunning ? t.cameraAiActive(activeCameraCount) : t.waitingForUpdates }}</span>
                <span v-if="detectionLastSeen">{{ t.lastSignal(detectionLastSeen) }}</span>
              </div>
            </div>



          </div>

          <!-- CAMERA GRID -->
          <div class="camera-col">
            <button
              v-for="cam in cameras"
              :key="cam.deviceId"
              type="button"
              class="cam-card ai-stream-card hardware-stream-card"
              :class="{ 'ai-stream-card-live': cam.running }"
              :disabled="!cam.running"
              @click="openHardwareStream(cam)"
            >
              <div class="ai-stream-placeholder">
                <div class="ai-blur-scene"></div>
                <div class="ai-stream-veil"></div>
                <div class="ai-stream-prompt">
                  <i :class="cam.running ? 'bx bx-show' : 'bx bx-video-off'"></i>
                  <span>{{ cam.running ? t.clickToView : t.cameraOffline }}</span>
                </div>
              </div>

              <div class="cam-top-bar">
                <div class="cam-top-left">
                  <span class="cam-status-badge" :class="cam.running ? 'badge-live' : 'badge-standby'">
                    <span v-if="cam.running" class="rec-dot"></span>
                    {{ cam.running ? t.aiActiveBadge : t.offlineBadge }}
                  </span>
                  <span class="cam-id-label">{{ cam.deviceId }} | {{ cameraDisplayName(cam) }}</span>
                </div>
                <span class="cam-time">{{ liveTime }}</span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </main>

    <div v-if="isAiStreamOpen" class="stream-modal-backdrop" @click.self="closeAiStream">
      <section class="stream-modal" role="dialog" aria-modal="true" aria-label="AI camera live feed">
        <header class="stream-modal-head">
          <div>
            <p class="stream-modal-kicker">{{ selectedCamera?.deviceId }} | {{ t.humanDetector }}</p>
            <h3 class="stream-modal-title">{{ cameraDisplayName(selectedCamera) || t.liveCameraFeed }}</h3>
          </div>
          <button type="button" class="stream-close-btn" :aria-label="t.closeLiveFeed" @click="closeAiStream">
            <i class='bx bx-x'></i>
          </button>
        </header>

        <div class="stream-modal-body">
          <div v-if="activeStreamUrl" class="stream-video-wrap">
            <img :src="activeStreamUrl" class="stream-modal-img" alt="Live AI stream" />
            <div class="stream-overlay" aria-hidden="true">
              <div
                v-for="zone in overlayZones"
                :key="zone.name"
                class="stream-zone-box"
                :style="zoneStyle(zone)"
              >
                <span>{{ zoneDisplayName(zone, selectedCamera) }}</span>
              </div>
              <div
                v-for="(person, idx) in overlayDetections"
                :key="`${person.bbox.x}-${person.bbox.y}-${idx}`"
                class="stream-detection-box"
                :class="{ 'stream-detection-box-counted': person.counted }"
                :style="boxStyle(person.bbox)"
              >
                <span class="stream-detection-label">
                  {{ t.person }} {{ formatConfidence(person.confidence) }} {{ person.dwellSeconds ? `${Math.floor(person.dwellSeconds)}s` : '' }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="stream-modal-empty">
            <i class='bx bx-video-off'></i>
            <span>{{ t.streamUnavailable }}</span>
          </div>
        </div>

        <footer class="stream-modal-foot">
          <span class="cam-status-badge badge-live"><span class="rec-dot"></span> {{ t.liveBadge }}</span>
          <span>{{ t.paxCounted(selectedDetection.count) }}</span>
          <span>{{ t.runtime(selectedDetectionElapsed) }}</span>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import TopbarNotification from '../components/TopbarNotification.vue'
import { apiFetch, apiUrl } from '../service/api'

const router = useRouter()
const activeView = ref('grid')
const liveTime = ref('')
const isDropdownOpen = ref(false)
const language = ref('en')
const isAiStreamOpen = ref(false)
const cameras = ref([])
const selectedCamera = ref(null)

const translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    map: 'Map',
    liveFeed: 'Live Feed',
    feedback: 'Feedback',
    settings: 'Settings',
    adminUser: 'Admin User',
    operationalLead: 'Operational Lead',
    logout: 'Log out',
    languageName: 'English',
    searchPlaceholder: 'Search stations or buses...',
    pageTitle: 'Live Feed',
    sectionTitle: 'Terminal A - South Wing',
    sectionSubtitle: 'Live monitoring of Gates 12–24 and Security Checkpoints',
    viewGrid: 'Grid',
    viewFocus: 'Focus',
    monitoringZones: 'Monitoring Zones',
    aiLive: 'AI Live',
    aiOffline: 'AI Offline',
    cameraAiActive: (count) => `${count} camera AI active`,
    waitingForUpdates: 'Waiting for detector updates',
    lastSignal: (time) => `Last signal ${time}`,
    clickToView: 'Click to view camera',
    cameraOffline: 'Camera offline',
    aiActiveBadge: 'AI ACTIVE',
    offlineBadge: 'OFFLINE',
    humanDetector: 'HUMAN DETECTOR',
    liveCameraFeed: 'Live Camera Feed',
    closeLiveFeed: 'Close live feed',
    person: 'Person',
    streamUnavailable: 'Live stream unavailable',
    liveBadge: 'LIVE',
    paxCounted: (count) => `${count} pax counted`,
    runtime: (time) => `Runtime ${time}`,
  },
  th: {
    dashboard: 'แดชบอร์ด',
    analytics: 'การวิเคราะห์',
    map: 'แผนที่',
    liveFeed: 'ฟีดสด',
    feedback: 'ข้อเสนอแนะ',
    settings: 'การตั้งค่า',
    adminUser: 'ผู้ดูแลระบบ',
    operationalLead: 'หัวหน้าฝ่ายปฏิบัติการ',
    logout: 'ออกจากระบบ',
    languageName: 'ไทย',
    searchPlaceholder: 'ค้นหาสถานีหรือรถบัส...',
    pageTitle: 'ฟีดสด',
    sectionTitle: 'อาคารผู้โดยสาร A - ปีกใต้',
    sectionSubtitle: 'การตรวจสอบสดของประตู 12–24 และจุดตรวจความปลอดภัย',
    viewGrid: 'ตาราง',
    viewFocus: 'โฟกัส',
    monitoringZones: 'โซนที่ตรวจสอบ',
    aiLive: 'AI ทำงานอยู่',
    aiOffline: 'AI ออฟไลน์',
    cameraAiActive: (count) => `AI กล้อง ${count} ตัวทำงานอยู่`,
    waitingForUpdates: 'กำลังรอการอัปเดตจากตัวตรวจจับ',
    lastSignal: (time) => `สัญญาณล่าสุด ${time}`,
    clickToView: 'คลิกเพื่อดูกล้อง',
    cameraOffline: 'กล้องออฟไลน์',
    aiActiveBadge: 'AI ทำงาน',
    offlineBadge: 'ออฟไลน์',
    humanDetector: 'ตัวตรวจจับบุคคล',
    liveCameraFeed: 'ฟีดสดจากกล้อง',
    closeLiveFeed: 'ปิดฟีดสด',
    person: 'บุคคล',
    streamUnavailable: 'ไม่สามารถใช้งานฟีดสดได้',
    liveBadge: 'สด',
    paxCounted: (count) => `นับแล้ว ${count} คน`,
    runtime: (time) => `รันไทม์ ${time}`,
  }
};

const t = computed(() => translations[language.value]);

const toggleLanguage = () => {
  language.value = language.value === 'en' ? 'th' : 'en';
}

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false
}

const viewButtons = [
  {
    id: 'grid', label: computed(() => t.value.viewGrid),
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="0.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/></svg>`
  },
  {
    id: 'focus', label: computed(() => t.value.viewFocus),
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.4"/></svg>`
  }
]

const displayNameFrom = (value, fallback = '') => {
  if (Array.isArray(value)) return displayNameFrom(value[0], fallback)
  if (value && typeof value === 'object') return displayNameFrom(value.name, fallback)

  const text = String(value || '').trim()
  if (!text) return fallback

  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      return displayNameFrom(JSON.parse(text), fallback)
    } catch {
      return fallback || text
    }
  }

  return text
}

const cameraDisplayName = (camera) => displayNameFrom(camera?.name, camera?.deviceId || '')
const zoneDisplayName = (zone, camera) => displayNameFrom(zone?.name, cameraDisplayName(camera) || 'Counting Zone')

const zones = computed(() => (
  cameras.value.map(camera => ({
    name: cameraDisplayName(camera),
    pax: camera.detection?.running ? Number(camera.detection.count) || 0 : 0,
    color: camera.detection?.running ? '#16a34a' : '#9ca3af'
  }))
))

const aiRunning = computed(() => cameras.value.some(camera => camera.detection?.running))
const activeCameraCount = computed(() => cameras.value.filter(camera => camera.detection?.running).length)

const formatDuration = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const s = Math.floor(safeSeconds % 60)
  return [h, m, s].map(value => String(value).padStart(2, '0')).join(':')
}

const selectedDetection = computed(() => selectedCamera.value?.detection || {
  running: false,
  count: 0,
  elapsed: 0,
  lastSeenAt: null,
  streamUrl: '',
  frameWidth: 0,
  frameHeight: 0,
  detections: [],
  zones: []
})

const detectionLastSeen = computed(() => {
  const latestSeen = cameras.value
    .map(camera => camera.detection?.lastSeenAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0]
  if (!latestSeen) return ''
  return new Date(latestSeen).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const selectedDetectionElapsed = computed(() => formatDuration(Number(selectedDetection.value.elapsed) || 0))

const activeStreamUrl = computed(() => {
  if (selectedCamera.value?.streamUrl) {
    return /^https?:\/\//i.test(selectedCamera.value.streamUrl)
      ? selectedCamera.value.streamUrl
      : apiUrl(selectedCamera.value.streamUrl)
  }
  return ''
})

const overlayDetections = computed(() => {
  const current = selectedDetection.value
  if (!current.running || !current.frameWidth || !current.frameHeight) return []
  return Array.isArray(current.detections) ? current.detections.filter(item => item?.bbox) : []
})

const overlayZones = computed(() => {
  const current = selectedDetection.value
  if (!current.running) return []
  return Array.isArray(current.zones) ? current.zones.filter(zone => zone?.enabled !== false) : []
})

const boxStyle = (bbox) => {
  const current = selectedDetection.value
  const frameWidth = Math.max(Number(current.frameWidth) || 1, 1)
  const frameHeight = Math.max(Number(current.frameHeight) || 1, 1)
  const x = Math.max(0, Number(bbox.x) || 0)
  const y = Math.max(0, Number(bbox.y) || 0)
  const width = Math.max(0, Number(bbox.width) || 0)
  const height = Math.max(0, Number(bbox.height) || 0)

  return {
    left: `${(x / frameWidth) * 100}%`,
    top: `${(y / frameHeight) * 100}%`,
    width: `${(width / frameWidth) * 100}%`,
    height: `${(height / frameHeight) * 100}%`
  }
}

const zoneStyle = (zone) => ({
  left: `${Math.max(0, Number(zone.x) || 0)}%`,
  top: `${Math.max(0, Number(zone.y) || 0)}%`,
  width: `${Math.max(1, Number(zone.width) || 1)}%`,
  height: `${Math.max(1, Number(zone.height) || 1)}%`,
  borderColor: zone.color || '#16a34a',
  color: zone.color || '#16a34a'
})

const formatConfidence = (confidence) => {
  const value = Number(confidence)
  if (!Number.isFinite(value) || value <= 0) return ''
  return `${Math.round(value * 100)}%`
}

const openHardwareStream = (camera) => {
  if (!camera?.running || !camera.streamUrl) return
  selectedCamera.value = camera
  isAiStreamOpen.value = true
}

const closeAiStream = () => {
  isAiStreamOpen.value = false
  selectedCamera.value = null
}

let timer = null
let cameraTimer = null
let isLoadingCameras = false
function updateTime() {
  const now = new Date()
  liveTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const loadCameras = async () => {
  if (isLoadingCameras) return
  isLoadingCameras = true
  try {
    const res = await apiFetch('/api/livefeed/cameras')
    if (!res.ok) return

    const data = await res.json()
    cameras.value = Array.isArray(data.cameras) ? data.cameras : []
    if (selectedCamera.value) {
      const freshCamera = cameras.value.find(camera => camera.deviceId === selectedCamera.value.deviceId)
      if (!freshCamera?.running) closeAiStream()
      else selectedCamera.value = freshCamera
    }
  } catch (error) {
    cameras.value = []
  } finally {
    isLoadingCameras = false
  }
}

onMounted(() => {
  updateTime()
  loadCameras()
  timer = setInterval(updateTime, 1000)
  cameraTimer = setInterval(loadCameras, 2000)
  document.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(cameraTimer)
  document.removeEventListener('click', closeDropdown)
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ===== LAYOUT ===== */
.lf-app {
  display: flex;
  height: 100vh;
  background: #f7f7fa;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ececec;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
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
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
  margin-top: 3px;
}

.menu {
  margin-top: 40px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 12px;
  color: #666;
  cursor: pointer;
  transition: .25s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
}

.menu-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.menu-label {
  font-size: 16px;
  font-weight: 400;
}

.menu-item:hover,
.menu-item.active {
  background: #fff0f5;
  color: #d72660;
}

.menu-item:hover .menu-label,
.menu-item.active .menu-label {
  font-weight: 600;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #d72660;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.user-role {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
  line-height: 1.3;
}

/* ===== MAIN WRAP ===== */
/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

/* ===== TOPBAR ===== */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
}

.search-bar {
  background: #e5e7eb;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 300px;
}

.search-icon {
  font-size: 18px;
  color: #6b7280;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #4b5563;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-btn {
  cursor: pointer;
  font-size: 22px;
  color: #6b7280;
}

.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}

.lang-switcher:hover {
  border-color: #d72660;
  color: #d72660;
}

.lang-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.profile-dropdown-container {
  position: relative;
}

.profile-circle {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #4b5563;
  border: 2px solid transparent;
  transition: all .2s;
}

.profile-circle:hover {
  border-color: #d72660;
  background: #fff0f5;
  color: #d72660;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 100;
  border: 1px solid #f3f4f6;
}

.dropdown-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-item i {
  font-size: 18px;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
}

.logout-item {
  color: #d72660;
}

.logout-item:hover {
  background: #fff0f5;
}

/* ===== CONTENT ===== */

/* Section header */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #d72660;
  margin: 0;
}

.section-sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}

.view-btns {
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all .15s;
}

.view-btn:hover {
  background: #fff0f5;
  color: #d72660;
  border-color: #d72660;
}

.view-btn-active {
  background: #d72660 !important;
  color: #fff !important;
  border-color: #d72660 !important;
}

.heatmap-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d72660;
}

.heatmap-dot-active {
  background: rgba(255, 255, 255, .6);
}

/* ===== LOWER GRID ===== */
.lower-grid {
  display: flex;
  gap: 16px;
  min-height: 0;
}

/* Left col */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  width: 220px;
}

.panel {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.panel-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #9ca3af;
}

.ai-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 10px;
  font-weight: 700;
}

.ai-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.ai-status-live {
  background: #dcfce7;
  color: #15803d;
}

.zones-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.zone-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 12px;
  border: 1px solid transparent;
  transition: background .2s, border-color .2s, box-shadow .2s;
}

.zone-row-active {
  background: #ecfdf5;
  border-color: #16a34a;
  box-shadow: 0 0 0 1px rgba(22, 163, 74, .18), 0 0 18px rgba(22, 163, 74, .35);
  animation: zone-active-pulse 1.8s ease-in-out infinite;
}

.zone-row-active .zone-name,
.zone-row-active .zone-pax {
  color: #166534;
}

.zone-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zone-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zone-name {
  color: #374151;
  font-weight: 500;
}

.zone-pax {
  font-weight: 700;
  color: #1f2937;
}

.ai-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 11px;
  line-height: 1.35;
}

.alert-card {
  background: #d72660;
  border-radius: 16px;
  padding: 14px;
}

.alert-label {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #fecdd3;
  margin-bottom: 4px;
}

.alert-title {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.alert-desc {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #fecdd3;
  line-height: 1.5;
  margin: 0 0 12px;
}

.alert-btn {
  width: 100%;
  padding: 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  background: #fff;
  color: #d72660;
  cursor: pointer;
  transition: opacity .15s;
}

.alert-btn:hover {
  opacity: .9;
}

/* Camera col */
.camera-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  overflow-y: auto;
}

.cam-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  aspect-ratio: 16/6;
}

.ai-stream-card {
  width: 100%;
  display: block;
  padding: 0;
  background: #111827;
  border: 1px solid rgba(156, 163, 175, .35);
  cursor: pointer;
  text-align: left;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}

.ai-stream-card:disabled {
  cursor: not-allowed;
}

.ai-stream-card:not(:disabled):hover {
  transform: translateY(-1px);
}

.ai-stream-card-live {
  border-color: rgba(22, 163, 74, .65);
  box-shadow: 0 0 0 1px rgba(22, 163, 74, .18);
}

.ai-stream-placeholder {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ai-blur-scene {
  position: absolute;
  inset: 0;
  filter: blur(12px);
  transform: scale(1.06);
  background:
    linear-gradient(160deg, rgba(15, 23, 42, .18), rgba(17, 24, 39, .82)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .05) 0 1px, transparent 1px 48px),
    linear-gradient(135deg, #1b2738 0%, #121826 48%, #18251f 100%);
}

.ai-blur-scene::before,
.ai-blur-scene::after {
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  height: 28%;
  border: 1px solid rgba(255, 255, 255, .12);
  border-width: 1px 0;
}

.ai-blur-scene::before {
  top: 24%;
}

.ai-blur-scene::after {
  bottom: 18%;
}

.ai-blur-person {
  position: absolute;
  bottom: 14%;
  width: 32px;
  height: 74px;
  border-radius: 999px 999px 12px 12px;
  background: rgba(226, 232, 240, .5);
  box-shadow: 0 -28px 0 -8px rgba(226, 232, 240, .55);
}

.ai-blur-person-1 {
  left: 28%;
  height: 66px;
  opacity: .55;
}

.ai-blur-person-2 {
  left: 49%;
  height: 82px;
  opacity: .72;
}

.ai-blur-person-3 {
  left: 68%;
  height: 58px;
  opacity: .45;
}

.ai-stream-veil {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, .46);
}

.ai-stream-prompt {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .6);
}

.ai-stream-prompt i {
  font-size: 30px;
}

.cam-bg {
  position: absolute;
  inset: 0;
}

.cam-grid-overlay {
  position: absolute;
  inset: 0;
  opacity: .1;
  background-image: linear-gradient(rgba(255, 255, 255, .05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.cam-noise {
  position: absolute;
  inset: 0;
  opacity: .2;
  background: radial-gradient(ellipse at 30% 40%, rgba(255, 255, 255, .08) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(0, 200, 150, .06) 0%, transparent 50%);
}

.cam-people {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 16px 4px;
  height: 55%;
}

.cam-boxes {
  position: absolute;
  inset: 0;
}

.bbox {
  position: absolute;
  border-width: 1.5px;
  border-style: solid;
}

.bbox-label {
  position: absolute;
  top: -16px;
  left: 0;
  color: #fff;
  font-size: 8px;
  padding: 1px 4px;
  line-height: 1;
  font-family: monospace;
}

.cam-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, .7), transparent);
}

.cam-top-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cam-status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 3px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 8px;
  letter-spacing: .08em;
}

.badge-rec {
  background: #d72660;
}

.badge-live {
  background: #16a34a;
}

.badge-standby {
  background: #555;
}

.rec-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: pulse 1.2s ease-in-out infinite;
}

.cam-id-label {
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: .08em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, .8);
}

.cam-time {
  color: #d1d5db;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.cam-scan-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  opacity: .3;
  background: linear-gradient(to top, rgba(0, 200, 100, .15), transparent);
}

.stream-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, .72);
}

.stream-modal {
  width: min(980px, 100%);
  max-height: min(88vh, 760px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
  background: #0f172a;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .35);
}

.stream-modal-head,
.stream-modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  color: #e5e7eb;
}

.stream-modal-head {
  border-bottom: 1px solid rgba(148, 163, 184, .22);
}

.stream-modal-kicker {
  margin: 0 0 2px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .08em;
}

.stream-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.stream-close-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(148, 163, 184, .3);
  border-radius: 8px;
  background: rgba(15, 23, 42, .65);
  color: #e5e7eb;
  cursor: pointer;
}

.stream-close-btn i {
  font-size: 24px;
}

.stream-modal-body {
  min-height: 280px;
  background: #020617;
}

.stream-video-wrap {
  position: relative;
  width: 100%;
  background: #020617;
}

.stream-modal-img {
  width: 100%;
  max-height: 64vh;
  display: block;
  object-fit: contain;
  background: #020617;
}

.stream-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.stream-detection-box {
  position: absolute;
  min-width: 28px;
  min-height: 28px;
  border: 2px solid #22c55e;
  box-shadow:
    0 0 0 1px rgba(2, 6, 23, .75),
    0 0 18px rgba(34, 197, 94, .32);
}

.stream-detection-box-counted {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(2, 6, 23, .75),
    0 0 18px rgba(245, 158, 11, .38);
}

.stream-detection-label {
  position: absolute;
  left: -2px;
  bottom: 100%;
  max-width: 180px;
  padding: 3px 6px;
  border-radius: 4px 4px 0 0;
  background: #22c55e;
  color: #04130a;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.stream-zone-box {
  position: absolute;
  border: 2px dashed currentColor;
  background: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 4px;
  pointer-events: none;
}

.stream-zone-box span {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(15, 23, 42, .82);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.stream-modal-empty {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-weight: 700;
}

.stream-modal-empty i {
  font-size: 32px;
}

.stream-modal-foot {
  justify-content: flex-start;
  border-top: 1px solid rgba(148, 163, 184, .22);
  color: #cbd5e1;
  font-size: 12px;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .3;
  }
}

@keyframes zone-active-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
  }
}

</style>
