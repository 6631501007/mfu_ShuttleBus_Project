<template>
  <div class="app-container">
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

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">{{ t.mapTitle }}</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search stations or buses..." />
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

      <!-- Legend -->
      <div class="map-legend">
        <button
          class="legend-item legend-toggle"
          type="button"
          @click="toggleLine"
        >
          <span class="legend-label">{{ t.line }} {{ activeLine }}</span>
        </button>
      </div>

      <div class="map-wrapper">
        <div id="map"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import TopbarNotification from '../components/TopbarNotification.vue'
import { apiFetch } from '../service/api'
import { getStationMarkerColor } from '../lib/stationAlert'
import { useLanguage } from '../composables/useLanguage'

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
    languageName: 'English',
    logout: 'Log out',
    mapTitle: 'Map',
    searchPlaceholder: 'Search stations or buses...',
    line: 'Line',
    peopleWaitingNow: 'People waiting now:',
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
    languageName: 'ไทย',
    logout: 'ออกจากระบบ',
    mapTitle: 'แผนที่',
    searchPlaceholder: 'ค้นหาสถานีหรือรถบัส...',
    line: 'สาย',
    peopleWaitingNow: 'จำนวนคนรอขณะนี้:',
  }
};

const router = useRouter()
const isDropdownOpen = ref(false)
const { language, toggleLanguage: toggleSharedLanguage } = useLanguage()
const stations = ref([])
const activeLine = ref(1)
let map = null
let lineLayer1 = null
let lineLayer2 = null
let busMarker1 = null
let busMarker2 = null
let animFrame1 = null
let animFrame2 = null
const markerShadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href

const t = computed(() => translations[language.value]);

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false
  }
}

const toggleLanguage = () => {
  toggleSharedLanguage();
  refreshMapText();
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}

// ===== BUS ICON =====
const createBusIcon = () => {
  return L.icon({
    iconUrl: '/travel.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const createStationIcon = (waitingPassengers) => {
  const color = getStationMarkerColor(waitingPassengers)
  const iconSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12.5 0.75C6.02 0.75 0.75 6.02 0.75 12.5c0 8.75 11.75 27.75 11.75 27.75S24.25 21.25 24.25 12.5C24.25 6.02 18.98 0.75 12.5 0.75z"/>
      <circle cx="12.5" cy="12.5" r="4.6" fill="#ffffff"/>
    </svg>
  `)

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

const refreshMapText = () => {
  if (!map) return;
  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer.getPopup()) {
      const station = stations.value.find(s => s.name === layer.getPopup().getContent().match(/<b>(.*?)<\/b>/)?.[1]);
      if (station) layer.setPopupContent(getStationPopupHtml(station));
    }
  });
};

const getStationLatLng = (station) => {
  const lat = Number.parseFloat(station?.location?.lat)
  const lng = Number.parseFloat(station?.location?.lng)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

const setLayerVisibility = (layer, shouldShow) => {
  if (!map || !layer) return

  if (shouldShow && !map.hasLayer(layer)) {
    layer.addTo(map)
  } else if (!shouldShow && map.hasLayer(layer)) {
    map.removeLayer(layer)
  }
}

const syncLineVisibility = () => {
  setLayerVisibility(lineLayer1, activeLine.value === 1)
  setLayerVisibility(busMarker1, activeLine.value === 1)
  setLayerVisibility(lineLayer2, activeLine.value === 2)
  setLayerVisibility(busMarker2, activeLine.value === 2)
}

const toggleLine = () => {
  activeLine.value = activeLine.value === 1 ? 2 : 1
  syncLineVisibility()
}

// ===== LINE 1 ROUTE (red — วนในมหาวิทยาลัย) =====
// จาก Lamduan ↓ ลงมา D1 ↓ Gate ล่าง ↓ วนกลับขึ้น
const line1Coords = [
  [20.059122488586976, 99.89957519248625], //start at Lamduan
  [20.059016556456683, 99.89887599993799],
  [20.05882164115006, 99.89841588613203],
  [20.05846994552775, 99.89790164129006], 
  [20.05666908209837, 99.89663407286383],
  [20.055321964758665, 99.89635610134665], 
  [20.055152469211116, 99.89621626283699],
  [20.05506772136869, 99.89563435420006], 
  [20.05481983422042, 99.8947400963255],
  [20.05464610072599, 99.89436117907354], 
  [20.05420541002393, 99.89326502559464],
  [20.052887617366558, 99.89243265970515], 
  [20.051773163481492, 99.89175602173002],
  [20.050270793343998, 99.89107873503055], 
  [20.048902067507093, 99.89134487931362],
  [20.04887240458636, 99.89136292299227], 
  [20.04793590089854, 99.89201700636846],
  [20.047401964169126, 99.89217939946788], 
  [20.047304499334476, 99.89219744314654],
  [20.047054480568967, 99.89217037762856], 
  [20.046842599947563, 99.89210722475323],
  [20.046634956661205, 99.89200347360091], 
  [20.045901846517605, 99.89162906723776],
  [20.04532931123896, 99.89133773954178],
  [20.044803841000153, 99.89130165218447], 
  [20.044587719643353, 99.8913467613737],
  [20.04423599212999, 99.89151366540135],
  [20.04418937758115, 99.89226247806594],
  [20.04409614844196, 99.89294362693555],
  [20.04405377154333, 99.89302482354287],
  [20.043829173783752, 99.8935706448225],
  [20.043867313048587, 99.89348493734883],
  [20.043663903529104, 99.89419315173645],
  [20.04379950990253, 99.89472092940898],
  [20.043884263827803, 99.89503218286593],
  [20.04385883765503, 99.89550131851124],
  [20.043570674075788, 99.89592534495986],
  [20.043447780623808, 99.8962681748545],
  [20.043528297034236, 99.89642154612316],
  [20.043515583901872, 99.89645312259256],
  [20.043324887057974, 99.89663355937923],
  [20.043180804844585, 99.89665611397756],
  [20.043062148804893, 99.89662904845954],
  [20.04296891899652, 99.89645312259256],
  [20.043134189982535, 99.89559604785597],
  [20.04345625601969, 99.89505473749603],
  [20.043384214989768, 99.89488332254871],
  [20.04362576419501, 99.89423826103643],
  // turn back up right side
  [20.043642715014556, 99.89421570633219],
  [20.043663903529104, 99.89419315173645],
  [20.043867313048587, 99.89348493734883],
  [20.043829173783752, 99.8935706448225],
  [20.04405377154333, 99.89302482354287],
  [20.04409614844196, 99.89294362693555],
  [20.04418937758115, 99.89226247806594],
  [20.044210566007497, 99.89155877464874],
  [20.044189377574487, 99.8913783378621],
  [20.044558055917136, 99.89122496656353],
  [20.044998773700335, 99.89117534644721],
  [20.045439490246657, 99.8912836085192],
  [20.045943770187726, 99.89148208898746],
  [20.046397196964286, 99.89185649531976],
  [20.047054480568967, 99.89217037762856],
  [20.047304499334476, 99.89219744314654],
  [20.047401964169126, 99.89217939946788],
  [20.04793590089854, 99.89201700636846],
  [20.04887240458636, 99.89136292299227],
  [20.048902067507093, 99.89134487931362],
  [20.050270793343998, 99.89107873503055],
  [20.051773163481492, 99.89175602173002],
  [20.052887617366558, 99.89243265970515],
  [20.05420541002393, 99.89326502559464],
  [20.05464610072599, 99.89436117907354],
  [20.05481983422042, 99.8947400963255],
  [20.05506772136869, 99.89563435420006],
  [20.055152469211116, 99.89621626283699],
  [20.055321964758665, 99.89635610134665],
  [20.05666908209837, 99.89663407286383],
  [20.05846994552775, 99.89790164129006],
  [20.05882164115006, 99.89841588613203],
  [20.059016556456683, 99.89887599993799],
  [20.059122488586976, 99.89957519248625], // back to start
]

// ===== LINE 2 ROUTE (yellow — ถนนหลักกลาง) =====
const line2Coords = [
  [20.059122488586976, 99.89957519248625], //start at Lamduan 
  [20.059016556456683, 99.89887599993799],
  [20.05882164115006, 99.89841588613203],
  [20.05846994552775, 99.89790164129006], 
  [20.05666908209837, 99.89663407286383],
  [20.055321964758665, 99.89635610134665], 
  [20.055152469211116, 99.89621626283699],
  [20.05506772136869, 99.89563435420006], 
  [20.05481983422042, 99.8947400963255],
  [20.05464610072599, 99.89436117907354], 
  [20.05420541002393, 99.89326502559464],
  [20.052887617366558, 99.89243265970515], 
  [20.051773163481492, 99.89175602173002],
  [20.050270793343998, 99.89107873503055], 
  [20.048902067507093, 99.89134487931362],
  [20.04887240458636, 99.89136292299227], 
  [20.04793590089854, 99.89201700636846],
  [20.047401964169126, 99.89217939946788], 
  [20.047304499334476, 99.89219744314654],
  [20.047054480568967, 99.89217037762856], 
  [20.046842599947563, 99.89210722475323],
  [20.046634956661205, 99.89200347360091], 
  [20.045901846517605, 99.89162906723776],
  [20.04532931123896, 99.89133773954178],
  [20.044803841000153, 99.89130165218447], 
  [20.044587719643353, 99.8913467613737],
  [20.04423599212999, 99.89151366540135],
  [20.04403695987033, 99.8915970569913],
  [20.043871689834347, 99.89168276446496],
  [20.04321060792684, 99.89194439782362],
  [20.042354587507702, 99.89224662944123],
  [20.042057945676632, 99.89251277370855],
  [20.04179096755251, 99.89298190935385],
  [20.04174859003077, 99.89321647717648],
  [20.04159603085455, 99.89321647719025],
  [20.04138838063099, 99.89407355192684],
  [20.041269723237136, 99.8944795346968],
]

// ===== Animate bus along polyline =====
const animateBus = (marker, coords, speed, startOffset = 0) => {
  let index = startOffset
  let progress = 0

  const step = () => {
    if (!marker) return

    const from = coords[index % coords.length]
    const to = coords[(index + 1) % coords.length]

    const lat = from[0] + (to[0] - from[0]) * progress
    const lng = from[1] + (to[1] - from[1]) * progress
    marker.setLatLng([lat, lng])

    progress += speed
    if (progress >= 1) {
      progress = 0
      index = (index + 1) % coords.length
    }

    return requestAnimationFrame(step)
  }

  return requestAnimationFrame(step)
}

const getStationPopupHtml = (station) => {
  const markerColor = getStationMarkerColor(station.waitingPassengers);
  return `
      <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
        <b style="color: ${markerColor};">${station.name}</b><br>
        ${t.value.peopleWaitingNow} ${station.waitingPassengers}<br>
        <span style="color: #6b7280; font-size: 12px;">${station.incomingBuses}</span>
      </div>
    `;
};

const createMap = () => {
  if (map) {
    map.remove()
    map = null
  }

  const validStations = stations.value
    .map((station) => ({ ...station, location: getStationLatLng(station) }))
    .filter((station) => station.location)

  const center = validStations.length
    ? validStations[0].location
    : { lat: 20.0365, lng: 99.8950 }

  map = L.map('map').setView([center.lat, center.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  // Draw Line 1
  lineLayer1 = L.polyline(line1Coords, {
    color: '#c0392b',
    weight: 4,
    opacity: 0.85,
  })

  // Draw Line 2
  lineLayer2 = L.polyline(line2Coords, {
    color: '#e6a817',
    weight: 4,
    opacity: 0.85,
    dashArray: '8, 4',
  })

  // Station markers from API
  validStations.forEach((station) => {
    const marker = L.marker([station.location.lat, station.location.lng], {
      icon: createStationIcon(station.waitingPassengers),
    }).addTo(map)
    marker.bindPopup(getStationPopupHtml(station));

    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())
  })

  // Bus marker Line 1
  busMarker1 = L.marker(line1Coords[0], {
    icon: createBusIcon(),
    zIndexOffset: 1000,
  })
  busMarker1.bindTooltip(`${t.value.line} 1`, { permanent: false, direction: 'top' })

  // Bus marker Line 2
  busMarker2 = L.marker(line2Coords[0], {
    icon: createBusIcon(),
    zIndexOffset: 1000,
  })
  busMarker2.bindTooltip(`${t.value.line} 2`, { permanent: false, direction: 'top' })

  syncLineVisibility()

  // Animate
  animFrame1 = animateBus(busMarker1, line1Coords, 0.003, 0)
  animFrame2 = animateBus(busMarker2, line2Coords, 0.004, 5)
}

const loadStations = async () => {
  try {
    const res = await apiFetch('/api/map')
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Cannot load map data')
    stations.value = data.stations || []
  } catch (error) {
    console.error(error)
  }
  createMap()
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  loadStations()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  if (animFrame1) cancelAnimationFrame(animFrame1)
  if (animFrame2) cancelAnimationFrame(animFrame2)
  if (map) map.remove()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f7f7fa;
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
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 400;
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
  transition: 0.25s;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
}

.menu-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.menu-label {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
}

.menu-item:hover {
  background: #fff0f5;
  color: #d72660;
}

.menu-item:hover .menu-label {
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
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.user-role {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #888;
  margin: 2px 0 0;
  line-height: 1.3;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 32px;
}

/* ===== TOP HEADER ===== */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
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

.search-input::placeholder {
  color: #a1a1a1;
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
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #d72660;
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
  transition: all 0.2s;
}

.profile-circle:hover {
  background: #fff0f5;
  color: #d72660;
}

.dropdown-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 10000;
  border: 1px solid #f3f4f6;
}

.dropdown-item {
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.dropdown-item i {
  font-size: 18px;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.logout-item {
  color: #d72660;
}

.logout-item:hover {
  background: #fff0f5;
}

/* ===== LEGEND ===== */
.map-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-toggle {
  min-width: 92px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: #fff;
  color: #111827;
  padding: 9px 18px;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
}

.legend-toggle:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(17, 24, 39, 0.16);
}

.legend-toggle:active {
  transform: translateY(0);
  box-shadow: 0 5px 12px rgba(17, 24, 39, 0.1);
}

.legend-line {
  display: inline-block;
  width: 32px;
  height: 4px;
  border-radius: 2px;
}

.legend-line.line1 {
  background: #c0392b;
}

.legend-line.line2 {
  background: #e6a817;
}

.legend-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

/* ===== MAP WRAPPER ===== */
.map-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  z-index: 1;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
