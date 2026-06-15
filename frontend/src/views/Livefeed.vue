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
            <span class="menu-label">Dashboard</span>
          </div>
          <div class="menu-item" @click="router.push('/analytics')">
            <i class='bx bx-line-chart menu-icon'></i>
            <span class="menu-label">Analytics</span>
          </div>
          <div class="menu-item" @click="router.push('/map')">
            <i class='bx bx-map-alt menu-icon'></i>
            <span class="menu-label">Map</span>
          </div>
          <div class="menu-item" @click="router.push('/livefeed')">
            <i class='bx bx-video menu-icon'></i>
            <span class="menu-label">Live Feed</span>
          </div>
          <div class="menu-item" @click="router.push('/feedback')">
            <i class='bx bx-message-square-dots menu-icon'></i>
            <span class="menu-label">Feedback</span>
          </div>
          <div class="menu-item" @click="router.push('/setting')">
            <i class='bx bx-cog menu-icon'></i>
            <span class="menu-label">Settings</span>
          </div>
        </nav>
      </div>

      <div class="user-card">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <p class="user-name">Admin User</p>
          <p class="user-role">Operational Lead</p>
        </div>
      </div>
    </aside>

    <!-- MAIN AREA -->
    <main class="main-content">

      <!-- TOPBAR (เหมือน Analytics) -->
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">Live Feed</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search stations or buses..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
            <div class="lang-switcher" @click="toggleLanguage">
              <i class='bx bx-globe'></i>
              <span class="lang-text">{{ language }}</span>
              <i class='bx bx-chevron-down'></i>
            </div>
          </div>

          <div class="profile-dropdown-container">
            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">
              <i class='bx bxs-user'></i>
            </div>
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div class="dropdown-item logout-item" @click="logout"><i class='bx bx-log-out'></i> Log out</div>
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <div class="lf-content">

        <!-- Section header -->
        <div class="section-header">
          <div>
            <h1 class="section-title">Terminal A - South Wing</h1>
            <p class="section-sub">Live monitoring of Gates 12–24 and Security Checkpoints</p>
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
                <div class="panel-label">Monitoring Zones</div>
                <span class="ai-status" :class="{ 'ai-status-live': detection.running }">
                  <span class="ai-status-dot"></span>
                  {{ detection.running ? 'AI Live' : 'AI Offline' }}
                </span>
              </div>
              <div class="zones-list">
                <div v-for="(zone, idx) in zones" :key="zone.name" class="zone-row"
                  :class="{ 'zone-row-active': idx === 0 && detection.running }">
                  <div class="zone-left">
                    <span class="zone-dot" :style="`background:${zone.color}`"></span>
                    <span class="zone-name">{{ zone.name }}</span>
                  </div>
                  <span class="zone-pax">{{ zone.pax }} pax</span>
                </div>
              </div>
              <div class="ai-meta">
                <span>{{ detection.running ? `Runtime ${detectionElapsed}` : 'Waiting for detector updates' }}</span>
                <span v-if="detection.lastSeenAt">Last signal {{ detectionLastSeen }}</span>
              </div>
            </div>

            <!-- Alert card -->
            <div class="alert-card">
              <div class="alert-label">Real-Time Alert</div>
              <div class="alert-title">Crowd Density High</div>
              <p class="alert-desc">Sector 4C is exceeding threshold. Automated dispatch suggested.</p>
              <button class="alert-btn">View Sector</button>
            </div>

          </div>

          <!-- CAMERA GRID -->
          <div class="camera-col">
            <button type="button" class="cam-card ai-stream-card" :class="{ 'ai-stream-card-live': detection.running }"
              :disabled="!canOpenAiStream" @click="openAiStream">
              <div class="ai-stream-placeholder">
                <div class="ai-blur-scene">
                  <div class="ai-blur-person ai-blur-person-1"></div>
                  <div class="ai-blur-person ai-blur-person-2"></div>
                  <div class="ai-blur-person ai-blur-person-3"></div>
                </div>
                <div class="ai-stream-veil"></div>
                <div class="ai-stream-prompt">
                  <i :class="detection.running ? 'bx bx-show' : 'bx bx-video-off'"></i>
                  <span>{{ detection.running ? 'Click to view live feed' : 'AI camera stream offline' }}</span>
                </div>
              </div>

              <div class="cam-top-bar">
                <div class="cam-top-left">
                  <span class="cam-status-badge" :class="detection.running ? 'badge-live' : 'badge-standby'">
                    <span v-if="detection.running" class="rec-dot"></span>
                    {{ detection.running ? 'AI ACTIVE' : 'OFFLINE' }}
                  </span>
                  <span class="cam-id-label">AI-001 | HUMAN DETECTOR</span>
                </div>
                <span class="cam-time">{{ liveTime }}</span>
              </div>
            </button>

            <div v-for="cam in cameras" :key="cam.id" class="cam-card">
              <div class="cam-bg" :style="`background:${cam.bg}`"></div>
              <div class="cam-grid-overlay"></div>
              <div class="cam-noise"></div>

              <!-- Silhouettes -->
              <div class="cam-people">
                <div v-for="(p, i) in cam.people" :key="i" :style="`width:${p.w}px; opacity:0.4`">
                  <svg :width="p.w" :height="p.w * 2.8" viewBox="0 0 10 28" fill="rgba(255,255,255,0.35)">
                    <ellipse cx="5" cy="4" rx="3.5" ry="3.5" />
                    <path d="M1 10 Q5 8 9 10 L8.5 22 H6.5 L5 16 L3.5 22 H1.5 Z" />
                  </svg>
                </div>
              </div>

              <!-- Bounding boxes -->
              <div v-if="cam.boxes" class="cam-boxes">
                <div v-for="box in cam.boxes" :key="box.id" class="bbox"
                  :style="`left:${box.x}%;top:${box.y}%;width:${box.w}%;height:${box.h}%;border-color:${box.color}`">
                  <span class="bbox-label" :style="`background:${box.color}`">{{ box.id }}</span>
                </div>
              </div>

              <!-- Top bar -->
              <div class="cam-top-bar">
                <div class="cam-top-left">
                  <span class="cam-status-badge" :class="cam.status === 'REC' ? 'badge-rec' : 'badge-standby'">
                    <span v-if="cam.status === 'REC'" class="rec-dot"></span>
                    {{ cam.status }}
                  </span>
                  <span class="cam-id-label">{{ cam.id }} | {{ cam.name }}</span>
                </div>
                <span class="cam-time">{{ liveTime }}</span>
              </div>

              <div class="cam-scan-line"></div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <div v-if="isAiStreamOpen" class="stream-modal-backdrop" @click.self="closeAiStream">
      <section class="stream-modal" role="dialog" aria-modal="true" aria-label="AI camera live feed">
        <header class="stream-modal-head">
          <div>
            <p class="stream-modal-kicker">AI-001 | HUMAN DETECTOR</p>
            <h3 class="stream-modal-title">Live Camera Feed</h3>
          </div>
          <button type="button" class="stream-close-btn" aria-label="Close live feed" @click="closeAiStream">
            <i class='bx bx-x'></i>
          </button>
        </header>

        <div class="stream-modal-body">
          <img v-if="resolvedStreamUrl" :src="resolvedStreamUrl" class="stream-modal-img" alt="Live AI stream" />
          <div v-else class="stream-modal-empty">
            <i class='bx bx-video-off'></i>
            <span>Live stream unavailable</span>
          </div>
        </div>

        <footer class="stream-modal-foot">
          <span class="cam-status-badge badge-live"><span class="rec-dot"></span> LIVE</span>
          <span>{{ detection.count }} pax detected</span>
          <span>Runtime {{ detectionElapsed }}</span>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch, apiUrl } from '../lib/api'

const router = useRouter()
const activeView = ref('grid')
const liveTime = ref('')
const isDropdownOpen = ref(false)
const language = ref('English')
const isAiStreamOpen = ref(false)
const detection = reactive({
  running: false,
  count: 0,
  elapsed: 0,
  lastSeenAt: null,
  streamUrl: ''
})

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English'
}

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false
}

const viewButtons = [
  {
    id: 'grid', label: 'Grid',
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="0.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/></svg>`
  },
  {
    id: 'focus', label: 'Focus',
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.4"/></svg>`
  }
]

const staticZones = [
  { name: 'Main Entry', pax: 142, color: '#4caf50' },
  { name: 'Security L1', pax: 89, color: '#ff9800' },
  { name: 'Duty Free B', pax: 312, color: '#d72660' },
  { name: 'Gate 14-16', pax: 42, color: '#00897b' }
]

const zones = computed(() => [
  {
    name: 'Detect Human AI',
    pax: detection.running ? detection.count : 0,
    color: detection.running ? '#16a34a' : '#9ca3af'
  },
  ...staticZones
])

const formatDuration = (seconds) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const s = Math.floor(safeSeconds % 60)
  return [h, m, s].map(value => String(value).padStart(2, '0')).join(':')
}

const detectionElapsed = computed(() => formatDuration(detection.elapsed))

const detectionLastSeen = computed(() => {
  if (!detection.lastSeenAt) return ''
  return new Date(detection.lastSeenAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const resolvedStreamUrl = computed(() => {
  if (!detection.streamUrl) return ''
  if (/^https?:\/\//i.test(detection.streamUrl)) return detection.streamUrl
  return apiUrl(detection.streamUrl)
})

const canOpenAiStream = computed(() => detection.running && Boolean(resolvedStreamUrl.value))

const openAiStream = () => {
  if (canOpenAiStream.value) isAiStreamOpen.value = true
}

const closeAiStream = () => {
  isAiStreamOpen.value = false
}

const cameras = [
  {
    id: 'CAM-001', name: 'SOUTH ENTRY', status: 'REC',
    bg: 'linear-gradient(135deg,#1a2030 0%,#0d1520 100%)',
    people: [{ w: 8 }, { w: 10 }, { w: 7 }, { w: 9 }],
    boxes: [
      { id: 'ID:4022', x: 55, y: 18, w: 16, h: 42, color: '#d72660' },
      { id: 'ID:4023', x: 74, y: 30, w: 14, h: 38, color: '#d72660' }
    ]
  },
  {
    id: 'CAM-014', name: 'SECURITY L1', status: 'REC',
    bg: 'linear-gradient(135deg,#1a2520 0%,#0d1a18 100%)',
    people: [{ w: 9 }, { w: 8 }, { w: 11 }, { w: 7 }, { w: 9 }],
    boxes: null
  },
  {
    id: 'CAM-022', name: 'DUTY FREE B', status: 'STANDBY',
    bg: 'linear-gradient(135deg,#1e1e28 0%,#141420 100%)',
    people: [{ w: 7 }, { w: 8 }, { w: 10 }, { w: 7 }, { w: 9 }, { w: 8 }],
    boxes: null
  },
  {
    id: 'CAM-008', name: 'GATE 14-16', status: 'REC',
    bg: 'linear-gradient(135deg,#1a1e20 0%,#10141a 100%)',
    people: [{ w: 9 }, { w: 7 }],
    boxes: null
  }
]

let timer = null
let detectionTimer = null
function updateTime() {
  const now = new Date()
  liveTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const loadDetectionStatus = async () => {
  try {
    const res = await apiFetch('/api/livefeed/detection')
    if (!res.ok) return

    const data = await res.json()
    detection.running = Boolean(data.running)
    detection.count = Number(data.count) || 0
    detection.elapsed = Number(data.elapsed) || 0
    detection.lastSeenAt = data.lastSeenAt || null
    detection.streamUrl = data.streamUrl || ''
    if (!detection.running) closeAiStream()
  } catch (error) {
    detection.running = false
    closeAiStream()
  }
}

onMounted(() => {
  updateTime()
  loadDetectionStatus()
  timer = setInterval(updateTime, 1000)
  detectionTimer = setInterval(loadDetectionStatus, 1000)
  document.addEventListener('click', closeDropdown)
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(detectionTimer)
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

.sidebar-top {}

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

.stream-modal-img {
  width: 100%;
  max-height: 64vh;
  display: block;
  object-fit: contain;
  background: #020617;
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
