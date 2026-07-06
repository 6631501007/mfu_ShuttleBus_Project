<template>
  <div class="app-container">
    
    <!-- 1. มุมซ้ายบน: ปุ่มเลือกสายรถ (UI แบบแคปซูล) และปุ่ม Info -->
    <div class="floating-panel top-left">
      <div class="line-selector shadow-sm" @click="toggleLine">
        <span class="line-label">Line {{ activeLine }}</span>
      </div>
      <div class="icon-circle info-icon shadow-sm">
        <span>i</span>
      </div>
    </div>

    <!-- 2. มุมขวาบน: รูปโปรไฟล์และ Dropdown Menu -->
    <div class="profile-container top-right">
      <div class="floating-profile shadow" @click="toggleProfileMenu">
        <!-- ดึงรูปจาก Database (ถ้ามี) -->
        <img :src="userAvatar" alt="Profile" />
      </div>

      <!-- เมนู Dropdown แบบแยกการ์ด (อิงจากภาพอ้างอิง) -->
      <transition name="dropdown-fade">
        <div class="profile-dropdown" v-if="isProfileMenuOpen">
          
          <!-- การ์ดชื่อและอีเมล (มีลูกศรชี้ขึ้น) -->
          <div class="menu-card user-info-card shadow-sm">
            <div class="user-name">{{ userName }}</div>
            <div class="user-email">{{ userEmail }}</div>
          </div>
          
          <!-- ปุ่มเปลี่ยนภาษา -->
          <div class="menu-card action-card lang-card shadow-sm" @click="toggleLanguage">
            <span class="emoji-icon">🇺🇸</span>
            <span class="card-label">{{ language }}</span>
          </div>
          
          <!-- ปุ่ม Feedback -->
          <div class="menu-card action-card feedback-card shadow-sm">
            <i class='bx bxs-message-alt-error icon-dark-red'></i>
            <span class="card-label">Feedback</span>
          </div>
          
          <!-- ปุ่ม Destination -->
          <div class="menu-card action-card dest-card shadow-sm">
            <i class='bx bxs-map icon-black'></i>
            <span class="card-label">Destination</span>
          </div>
          
          <!-- ปุ่ม Logout -->
          <div class="menu-card action-card logout-card shadow-sm" @click="logout">
            <i class='bx bx-log-out icon-red'></i>
            <span class="card-label">Logout</span>
          </div>
          
        </div>
      </transition>
    </div>

    <!-- 3. มุมขวาล่าง: ปุ่มระบุตำแหน่ง (Location) -->
    <div class="floating-btn bottom-right shadow" @click="centerMap">
      <i class='bx bx-target-lock locate-icon'></i>
    </div>

    <!-- พื้นที่แผนที่ -->
    <div class="map-wrapper">
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiFetch } from '../lib/api'
import { getStationMarkerColor } from '../lib/stationAlert'

// ===== ตัวแปร State =====
const isProfileMenuOpen = ref(false)
const language = ref('English')
const stations = ref([])
const activeLine = ref(1)

// ตัวแปรเก็บข้อมูล User (ดึงจาก Database)
const userName = ref('Loading...')
const userEmail = ref('')
const userAvatar = ref('https://i.pravatar.cc/150?img=11') // รูป Default

// ตัวแปรแผนที่
let map = null
let lineLayer1 = null
let lineLayer2 = null
let busMarker1 = null
let busMarker2 = null
let animFrame1 = null
let animFrame2 = null

const defaultCenter = { lat: 20.0470, lng: 99.8940 }

// ===== Functions จัดการ UI =====
const toggleProfileMenu = (e) => {
  e.stopPropagation()
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

const closeMenuOutside = (e) => {
  if (!e.target.closest('.profile-container')) {
    isProfileMenuOpen.value = false
  }
}

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English'
}

const logout = () => {
  console.log('Logging out...')
  localStorage.clear()
  window.location.href = '/'
}

// ===== Functions ดึงข้อมูลจาก API =====
const loadData = async () => {
  try {
    // 1. ดึงข้อมูล User จาก Database
    const userRes = await apiFetch('/api/user/me') 
    if (userRes.ok) {
      const userData = await userRes.json()
      userName.value = userData.name || userData.username || 'USER'
      userEmail.value = userData.email || ''
      if (userData.avatar) {
        userAvatar.value = userData.avatar
      }
    }

    // 2. เปลี่ยนตรงนี้! ให้ไปดึงแผนที่จากเส้นของ User แทน
    const mapRes = await apiFetch('/api/user-map') 
    if (mapRes.ok) {
      const mapData = await mapRes.json()
      stations.value = mapData.stations || []
    }
  } catch (error) {
    console.error('API Error:', error)
  }
  
  createMap()
}

// ===== พิกัดเส้นทางรถบัส (Line 1 & 2) =====
const line1Coords = [
  [20.059122, 99.899575], [20.059016, 99.898875], [20.058821, 99.898415],
  [20.058469, 99.897901], [20.056669, 99.896634], [20.055321, 99.896356],
  [20.055152, 99.896216], [20.055067, 99.895634], [20.054819, 99.894740],
  [20.054646, 99.894361], [20.054205, 99.893265], [20.052887, 99.892432],
  [20.051773, 99.891756], [20.050270, 99.891078], [20.048902, 99.891344],
  [20.048872, 99.891362], [20.047935, 99.892017], [20.047401, 99.892179],
  [20.047304, 99.892197], [20.047054, 99.892170], [20.046842, 99.892107],
  [20.046634, 99.892003], [20.045901, 99.891629], [20.045329, 99.891337],
  [20.044803, 99.891301], [20.044587, 99.891346], [20.044235, 99.891513],
  [20.044189, 99.892262], [20.044096, 99.892943], [20.044053, 99.893025],
  [20.043829, 99.893570], [20.043867, 99.893484], [20.043663, 99.894193],
  [20.043799, 99.894720], [20.043884, 99.895032], [20.043858, 99.895501],
  [20.043570, 99.895925], [20.043447, 99.896268], [20.043528, 99.896421],
  [20.043515, 99.896453], [20.043324, 99.896633], [20.043180, 99.896656],
  [20.043062, 99.896629], [20.042968, 99.896453], [20.043134, 99.895596],
  [20.043456, 99.895054], [20.043384, 99.894883], [20.043625, 99.894238],
  [20.043642, 99.894215], [20.043663, 99.894193], [20.043867, 99.893484],
  [20.043829, 99.893570], [20.044053, 99.893024], [20.044096, 99.892943],
  [20.044189, 99.892262], [20.044210, 99.891558], [20.044189, 99.891378],
  [20.044558, 99.891224], [20.044998, 99.891175], [20.045439, 99.891283],
  [20.045943, 99.891482], [20.046397, 99.891856], [20.047054, 99.892170],
  [20.047304, 99.892197], [20.047401, 99.892179], [20.047935, 99.892017],
  [20.048872, 99.891362], [20.048902, 99.891344], [20.050270, 99.891078],
  [20.051773, 99.891756], [20.052887, 99.892432], [20.054205, 99.893265],
  [20.054646, 99.894361], [20.054819, 99.894740], [20.055067, 99.895634],
  [20.055152, 99.896216], [20.055321, 99.896356], [20.056669, 99.896634],
  [20.058469, 99.897901], [20.058821, 99.898415], [20.059016, 99.898875],
  [20.059122, 99.899575]
]

const line2Coords = [
  [20.059122, 99.899575], [20.059016, 99.898875], [20.058821, 99.898415],
  [20.058469, 99.897901], [20.056669, 99.896634], [20.055321, 99.896356],
  [20.055152, 99.896216], [20.055067, 99.895634], [20.054819, 99.894740],
  [20.054646, 99.894361], [20.054205, 99.893265], [20.052887, 99.892432],
  [20.051773, 99.891756], [20.050270, 99.891078], [20.048902, 99.891344],
  [20.048872, 99.891362], [20.047935, 99.892017], [20.047401, 99.892179],
  [20.047304, 99.892197], [20.047054, 99.892170], [20.046842, 99.892107],
  [20.046634, 99.892003], [20.045901, 99.891629], [20.045329, 99.891337],
  [20.044803, 99.891301], [20.044587, 99.891346], [20.044235, 99.891513],
  [20.044036, 99.891597], [20.043871, 99.891682], [20.043210, 99.891944],
  [20.042354, 99.892246], [20.042057, 99.892512], [20.041790, 99.892981],
  [20.041748, 99.893216], [20.041596, 99.893216], [20.041388, 99.894073],
  [20.041269, 99.894479]
]

// ===== Functions แผนที่ =====
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

const centerMap = () => {
  if (map) {
    map.flyTo([defaultCenter.lat, defaultCenter.lng], 15, { duration: 1.5 })
  }
}

const createBusIcon = () => {
  return L.icon({
    iconUrl: '/travel.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// แอนิเมชันรถวิ่ง
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

const createMap = () => {
  if (map) { map.remove(); map = null }

  map = L.map('map', { zoomControl: false }).setView([defaultCenter.lat, defaultCenter.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  lineLayer1 = L.polyline(line1Coords, { color: '#8b0000', weight: 3, opacity: 0.9 })
  lineLayer2 = L.polyline(line2Coords, { color: '#f1c40f', weight: 3, opacity: 0.9, dashArray: '8, 4' })

  // ==========================================
  // 🚨 จุดที่ต้องแก้: กรองข้อมูลให้ยืดหยุ่นขึ้น
  // ==========================================
  console.log('📌 ข้อมูลสถานีที่ได้จาก API:', stations.value) // เช็กใน Console (F12) ว่ามีข้อมูลมาไหม

  const validStations = stations.value.filter((s) => {
    if (!s.location || s.location.lat == null || s.location.lng == null) return false
    
    // แปลงให้เป็นตัวเลขเสมอ (แก้ปัญหา DB ส่งมาเป็น String)
    const lat = parseFloat(s.location.lat)
    const lng = parseFloat(s.location.lng)
    
    return !isNaN(lat) && !isNaN(lng) // ผ่านถ้าเป็นตัวเลขที่ถูกต้อง
  })

  console.log('📌 สถานีที่พิกัดถูกต้อง พร้อมปักหมุด:', validStations)

  // สร้างหมุดป้ายรถเมล์
// สร้างหมุดป้ายรถเมล์แบบรูป "หมุดแผนที่ (Pin)"
  validStations.forEach((station) => {
    const markerColor = getStationMarkerColor(station.waitingPassengers || 0)
    
    // สร้างรูปหมุด (Pin) ด้วย SVG และเปลี่ยนสีตาม markerColor
    const iconSvg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="41" viewBox="0 0 28 41">
        <path fill="${markerColor}" stroke="#ffffff" stroke-width="2" d="M14 1C6.8 1 1 6.8 1 14c0 9.5 13 26 13 26s13-16.5 13-26C27 6.8 21.2 1 14 1z"/>
        <circle cx="14" cy="14" r="5" fill="#ffffff"/>
      </svg>
    `)

    const customIcon = L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
      iconSize: [28, 41],
      iconAnchor: [14, 41], // ปลายแหลมของหมุดปักตรงพิกัดเป๊ะๆ
      popupAnchor: [0, -38] // ให้ Popup ลอยเหนือหมุด
    })

    const marker = L.marker([parseFloat(station.location.lat), parseFloat(station.location.lng)], {
      icon: customIcon
    }).addTo(map)

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
        <b style="color: ${markerColor};">${station.name}</b><br>
        People waiting now: <b>${station.waitingPassengers || 0}</b><br>
        <span style="color: #6b7280; font-size: 12px;">${station.incomingBuses || 'No buses incoming'}</span>
      </div>
    `)
    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())
  })
  // ==========================================

  busMarker1 = L.marker(line1Coords[0], { icon: createBusIcon(), zIndexOffset: 1000 })
  busMarker1.bindTooltip('Line 1', { permanent: false, direction: 'top' })

  busMarker2 = L.marker(line2Coords[0], { icon: createBusIcon(), zIndexOffset: 1000 })
  busMarker2.bindTooltip('Line 2', { permanent: false, direction: 'top' })

  syncLineVisibility()

  // เริ่มแอนิเมชัน
  animFrame1 = animateBus(busMarker1, line1Coords, 0.003, 0)
  animFrame2 = animateBus(busMarker2, line2Coords, 0.004, 5)
}

// ===== Lifecycle Hooks =====
onMounted(() => {
  loadData()
  document.addEventListener('click', closeMenuOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOutside)
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
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh; 
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  background: #f7f7fa;
  /* รองรับรอยบากหน้าจอ (Notch) */
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}

/* เงา (Shadows) */
.shadow { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.shadow-sm { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }

/* ================== 1. มุมซ้ายบน ================== */
.floating-panel {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
}

.line-selector {
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.line-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-icon {
  width: 34px;
  height: 34px;
  background: #111;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-style: italic;
  font-family: serif;
  cursor: pointer;
}

/* ================== 2. มุมขวาบน (Profile & Dropdown) ================== */
.profile-container {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.floating-profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #000; 
  background: #fff;
  padding: 2px; 
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.floating-profile:active { transform: scale(0.95); }
.floating-profile img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

.profile-dropdown {
  margin-top: 8px; /* ระยะห่างจากรูปโปรไฟล์ */
  display: flex;
  flex-direction: column;
  gap: 10px; 
  width: 250px; 
  position: relative;
}

/* สไตล์การ์ดทั่วไปในเมนู */
.menu-card {
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s, filter 0.2s;
}

/* ข้อมูลผู้ใช้งาน (มีการทำลูกศรชี้ขึ้น) */
.user-info-card {
  background: #ffffff;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  position: relative;
}

/* สร้างลูกศร (Triangle) ชี้ไปหารูปโปรไฟล์ */
.user-info-card::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 17px; /* ตรงกับตำแหน่งกึ่งกลางรูปโปรไฟล์พอดี */
  border-width: 0 8px 8px 8px;
  border-style: solid;
  border-color: transparent transparent #ffffff transparent;
}

.user-name { font-weight: 700; color: #000; font-size: 15px; }
.user-email { font-size: 12px; color: #999; text-align: center; word-break: break-all; }

/* สีพื้นหลังการ์ดต่างๆ แบบในรูปต้นฉบับ */
.lang-card { background: #fff8e1; } /* สีเหลืองอ่อน */
.feedback-card { background: #f8f9fa; } /* สีขาวเทา */
.dest-card { background: #eaf4fd; } /* สีฟ้าอ่อน */
.logout-card { background: #fce4e4; } /* สีแดงอ่อน */

.card-label { font-size: 14px; font-weight: 600; color: #111; }
.emoji-icon { font-size: 20px; }
.icon-dark-red { font-size: 22px; color: #a30000; }
.icon-black { font-size: 22px; color: #000; }
.icon-red { font-size: 22px; color: #d32f2f; }

/* แอนิเมชันตอนเปิด/ปิด Dropdown */
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: all 0.3s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ================== 3. มุมขวาล่าง (Location Button) ================== */
.floating-btn {
  position: absolute;
  bottom: 32px;
  right: 24px;
  z-index: 1000;
  width: 48px;
  height: 48px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.locate-icon { font-size: 24px; color: #ff3b3b; }

/* ================== MAP WRAPPER ================== */
.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

#map { width: 100%; height: 100%; }

/* ==================================================
   📱 RESPONSIVE ADJUSTMENTS (สำหรับมือถือ)
================================================== */
@media (max-width: 600px) {
  .floating-panel { top: 16px; left: 16px; }
  .profile-container { top: 16px; right: 16px; }
  .floating-btn { bottom: 24px; right: 16px; }
  
  .profile-dropdown {
    width: 230px; 
    max-height: calc(100dvh - 100px); 
    overflow-y: auto;
    padding-bottom: 10px; 
  }
  
  /* ปรับลูกศรให้ตรงกับรูปโปรไฟล์บนจอเล็ก */
  .user-info-card::before { right: 12px; }
}

/* ==================================================
   🖱️ HOVER EFFECTS (เฉพาะเครื่องที่ใช้เมาส์)
================================================== */
@media (hover: hover) and (pointer: fine) {
  .action-card:hover { transform: translateY(-2px); filter: brightness(0.95); }
  .line-selector:hover { background: #f0f0f0; }
  .floating-btn:hover { background: #f0f0f0; }
}
</style>