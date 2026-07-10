<template>
  <div class="app-container">
    
    <!-- 1. มุมซ้ายบน: ปุ่มเลือกสายรถ (UI แบบแคปซูล) และปุ่ม Info -->
    <div class="floating-panel top-left">
      <div class="line-selector shadow-sm" @click="toggleLine">
        <span class="line-label">{{ lineTitle }}</span>
      </div>

      <div class="info-container">
        <div class="icon-circle info-icon shadow-sm" @click="toggleInfoMenu">
          <span>i</span>
        </div>

        <transition name="dropdown-fade">
          <div class="info-dropdown shadow-sm" v-if="isInfoMenuOpen">
            <div class="info-dropdown-header">
              <div class="info-dropdown-title">{{ lineInfoTitle }}</div>
              <div class="info-dropdown-subtitle">{{ t.stopsAndLandmarks }}</div>
            </div>
            <ul class="info-list">
              <li v-for="item in currentLineInfoItems()" :key="item">{{ item }}</li>
            </ul>
          </div>
        </transition>
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
            <span class="emoji-icon">{{ languageFlag }}</span>
            <span class="card-label">{{ languageLabel }}</span>
          </div>
          
          <!-- ปุ่ม Feedback -->
          <div class="menu-card action-card feedback-card shadow-sm" @click="openFeedbackModal">
            <i class='bx bxs-message-alt-error icon-dark-red'></i>
            <span class="card-label">{{ t.feedback }}</span>
          </div>
          
          <!-- ปุ่ม Destination -->
          <div class="menu-card action-card dest-card shadow-sm" @click.stop="toggleDestinationMenu">
            <i class='bx bxs-map icon-black'></i>
            <span class="card-label">{{ t.destination }}</span>
          </div>
          
          <!-- ปุ่ม Logout -->
          <div class="menu-card action-card logout-card shadow-sm" @click="logout">
            <i class='bx bx-log-out icon-red'></i>
            <span class="card-label">{{ t.logout }}</span>
          </div>
          
        </div>
      </transition>
    </div>

    <div class="modal-backdrop destination-modal-backdrop" v-if="isDestinationMenuOpen" @click.self="closeDestinationModal">
      <div class="destination-modal shadow">
        <div class="destination-modal-header">
          <div>
            <h2>{{ t.selectDestination }}</h2>
            <p>{{ t.chooseStation }}</p>
          </div>
          <button class="modal-close" type="button" @click="closeDestinationModal">
            <i class='bx bx-x'></i>
          </button>
        </div>

        <div v-if="stations.length" class="destination-list">
          <button
            v-for="station in stations"
            :key="getStationKey(station)"
            class="destination-item"
            :class="{ active: selectedDestination === getStationDisplayName(station) }"
            type="button"
            @click.stop="selectDestination(station)"
          >
            <span>{{ getStationDisplayName(station) }}</span>
            <small>{{ station.incomingBuses || t.noBusesIncoming }}</small>
          </button>
        </div>
        <div v-else class="destination-empty">{{ t.loadingStations }}</div>
      </div>
    </div>

    <div class="modal-backdrop" v-if="isFeedbackOpen" @click.self="closeFeedbackModal">
      <form class="feedback-modal shadow" @submit.prevent="submitFeedback">
        <div class="feedback-modal-header">
          <div>
            <h2>{{ t.sendFeedback }}</h2>
            <p>{{ t.feedbackPrompt }}</p>
          </div>
          <button class="modal-close" type="button" @click="closeFeedbackModal">
            <i class='bx bx-x'></i>
          </button>
        </div>

        <label class="feedback-field">
          <span>{{ t.message }}</span>
          <textarea
            v-model="feedbackMessage"
            rows="4"
            maxlength="500"
            :placeholder="t.feedbackPlaceholder"
            required
          ></textarea>
        </label>

        <div class="feedback-field">
          <span>{{ t.rating }}</span>
          <div class="rating-options">
            <button
              v-for="rating in 5"
              :key="rating"
              class="rating-btn"
              :class="{ active: feedbackRating === rating }"
              type="button"
              @click="feedbackRating = rating"
            >
              {{ rating }}
            </button>
          </div>
        </div>

        <p class="feedback-error" v-if="feedbackError">{{ feedbackError }}</p>
        <p class="feedback-success" v-if="feedbackSuccess">{{ feedbackSuccess }}</p>

        <button class="feedback-submit" type="submit" :disabled="isSubmittingFeedback">
          {{ isSubmittingFeedback ? t.sending : t.submitFeedback }}
        </button>
      </form>
    </div>

    <!-- 3. มุมขวาล่าง: ปุ่มระบุตำแหน่ง (Location) -->
    <div class="floating-btn bottom-right shadow" @click="centerMap">
      <i class='bx bx-target-lock locate-icon'></i>
    </div>

    <div class="route-panel shadow-sm">
      <div class="route-panel-title">{{ t.walkingRoute }}</div>
      <div class="route-mode-toggle">
        <button type="button" :class="{ active: routeMode === 'start' }" @click="routeMode = 'start'">
          {{ t.setStart }}
        </button>
        <button type="button" :class="{ active: routeMode === 'end' }" @click="routeMode = 'end'">
          {{ t.setDestination }}
        </button>
      </div>
      <div class="route-points">
        <div><b>{{ t.start }}:</b> {{ routeStart ? formatPoint(routeStart) : t.clickMap }}</div>
        <div><b>{{ t.end }}:</b> {{ routeEnd ? formatPoint(routeEnd) : t.clickMap }}</div>
      </div>
      <div class="route-actions">
        <button type="button" @click="useCurrentLocation" :disabled="isLocating">
          {{ isLocating ? t.locating : t.useGps }}
        </button>
        <button type="button" class="primary" @click="requestWalkingRoute" :disabled="!canRequestRoute || isRouting">
          {{ isRouting ? t.calculatingRoute : t.calculateRoute }}
        </button>
        <button type="button" @click="clearWalkingRoute">{{ t.clear }}</button>
      </div>
      <p class="route-error" v-if="routeError">{{ routeError }}</p>
      <div class="route-summary" v-if="routeResult">
        <span>{{ routeDistanceText }}</span>
        <span>{{ routeTimeText }}</span>
      </div>
    </div>

    <div class="marker-legend shadow-sm">
      <div class="legend-title">{{ t.markerStatus }}</div>
      <div class="legend-item">
        <svg class="legend-pin" viewBox="0 0 24 36" aria-hidden="true">
          <path fill="#16a34a" d="M12 0C5.4 0 0 5.4 0 12c0 8.6 12 24 12 24s12-15.4 12-24C24 5.4 18.6 0 12 0z"/>
        </svg>
        <span>{{ t.waiting0to4 }}</span>
      </div>
      <div class="legend-item">
        <svg class="legend-pin" viewBox="0 0 24 36" aria-hidden="true">
          <path fill="#ecc100" d="M12 0C5.4 0 0 5.4 0 12c0 8.6 12 24 12 24s12-15.4 12-24C24 5.4 18.6 0 12 0z"/>
        </svg>
        <span>{{ t.waiting5to8 }}</span>
      </div>
      <div class="legend-item">
        <svg class="legend-pin" viewBox="0 0 24 36" aria-hidden="true">
          <path fill="#dc2626" d="M12 0C5.4 0 0 5.4 0 12c0 8.6 12 24 12 24s12-15.4 12-24C24 5.4 18.6 0 12 0z"/>
        </svg>
        <span>{{ t.waiting9Plus }}</span>
      </div>
    </div>

    <!-- พื้นที่แผนที่ -->
    <div class="map-wrapper">
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { apiFetch } from '../service/api'
import { getStationMarkerColor } from '../lib/stationAlert'

// ===== ตัวแปร State =====
const isProfileMenuOpen = ref(false)
const isInfoMenuOpen = ref(false)
const isDestinationMenuOpen = ref(false)
const language = ref('en')
const stations = ref([])
const activeLine = ref(1)
const isFeedbackOpen = ref(false)
const feedbackMessage = ref('')
const feedbackRating = ref(5)
const feedbackError = ref('')
const feedbackSuccess = ref('')
const isSubmittingFeedback = ref(false)
const selectedDestination = ref('')
const routeMode = ref('start')
const routeStart = ref(null)
const routeEnd = ref(null)
const routeResult = ref(null)
const routeError = ref('')
const isRouting = ref(false)
const isLocating = ref(false)

const translations = {
  en: {
    languageLabel: 'English',
    languageFlag: '🇺🇸',
    line: 'Line',
    info: 'Info',
    stopsAndLandmarks: 'Stops and landmarks',
    feedback: 'Feedback',
    destination: 'Destination',
    logout: 'Logout',
    selectDestination: 'Select destination',
    chooseStation: 'Choose a station to zoom to it on the map.',
    selectedDestination: 'Selected destination',
    noBusesIncoming: 'No buses incoming',
    loadingStations: 'Loading stations...',
    sendFeedback: 'Send Feedback',
    feedbackPrompt: 'Tell the admin about your waiting experience.',
    message: 'Message',
    feedbackPlaceholder: 'Example: The waiting system is too slow',
    rating: 'Rating',
    sending: 'Sending...',
    submitFeedback: 'Submit Feedback',
    writeFeedbackMessage: 'Please write your feedback message.',
    unableToSendFeedback: 'Unable to send feedback',
    feedbackSent: 'Thank you. Your feedback was sent to the admin.',
    markerStatus: 'Marker status',
    waiting0to4: '0-4 people waiting',
    waiting5to8: '5-8 people waiting',
    waiting9Plus: '9+ people waiting',
    peopleWaitingNow: 'People waiting now:',
    loading: 'Loading...',
    user: 'USER',
    walkingRoute: 'Walking route',
    setStart: 'Set start',
    setDestination: 'Set destination',
    start: 'Start',
    end: 'End',
    clickMap: 'Click map',
    useGps: 'Use GPS',
    locating: 'Locating...',
    calculateRoute: 'Calculate',
    calculatingRoute: 'Calculating...',
    clear: 'Clear',
    routeFailed: 'Unable to calculate walking route'
  },
  th: {
    languageLabel: 'ไทย',
    languageFlag: '🇹🇭',
    line: 'สาย',
    info: 'ข้อมูล',
    stopsAndLandmarks: 'ป้ายหยุดรถและจุดสังเกต',
    feedback: 'ข้อเสนอแนะ',
    destination: 'ปลายทาง',
    logout: 'ออกจากระบบ',
    selectDestination: 'เลือกปลายทาง',
    chooseStation: 'เลือกสถานีเพื่อซูมไปยังตำแหน่งบนแผนที่',
    selectedDestination: 'ปลายทางที่เลือก',
    noBusesIncoming: 'ไม่มีรถบัสที่กำลังมา',
    loadingStations: 'กำลังโหลดสถานี...',
    sendFeedback: 'ส่งข้อเสนอแนะ',
    feedbackPrompt: 'แจ้งผู้ดูแลเกี่ยวกับประสบการณ์การรอของคุณ',
    message: 'ข้อความ',
    feedbackPlaceholder: 'ตัวอย่าง: ระบบแจ้งเวลารอนานเกินไป',
    rating: 'คะแนน',
    sending: 'กำลังส่ง...',
    submitFeedback: 'ส่งข้อเสนอแนะ',
    writeFeedbackMessage: 'กรุณาเขียนข้อความข้อเสนอแนะ',
    unableToSendFeedback: 'ไม่สามารถส่งข้อเสนอแนะได้',
    feedbackSent: 'ขอบคุณ ข้อเสนอแนะของคุณถูกส่งไปยังผู้ดูแลแล้ว',
    markerStatus: 'สถานะหมุด',
    waiting0to4: 'มีคนรอ 0-4 คน',
    waiting5to8: 'มีคนรอ 5-8 คน',
    waiting9Plus: 'มีคนรอ 9 คนขึ้นไป',
    peopleWaitingNow: 'จำนวนคนรอขณะนี้:',
    loading: 'กำลังโหลด...',
    user: 'ผู้ใช้',
    walkingRoute: 'เส้นทางเดิน',
    setStart: 'ตั้งจุดเริ่ม',
    setDestination: 'ตั้งปลายทาง',
    start: 'เริ่ม',
    end: 'ปลายทาง',
    clickMap: 'คลิกแผนที่',
    useGps: 'ใช้ GPS',
    locating: 'กำลังระบุตำแหน่ง...',
    calculateRoute: 'คำนวณ',
    calculatingRoute: 'กำลังคำนวณ...',
    clear: 'ล้าง',
    routeFailed: 'ไม่สามารถคำนวณเส้นทางเดินได้'
  }
}

const t = computed(() => translations[language.value])
const languageFlag = computed(() => t.value.languageFlag)
const languageLabel = computed(() => t.value.languageLabel)
const lineTitle = computed(() => `${t.value.line} ${activeLine.value}`)
const canRequestRoute = computed(() => Boolean(routeStart.value && routeEnd.value))
const routeDistanceText = computed(() => {
  if (!routeResult.value) return ''
  const meters = routeResult.value.distanceMeters || 0
  return meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters} m`
})
const routeTimeText = computed(() => {
  if (!routeResult.value) return ''
  return `${routeResult.value.estimatedWalkingTimeMinutes || 1} min`
})
const lineInfoTitle = computed(() => {
  return language.value === 'th'
    ? `${t.value.info}${t.value.line} ${activeLine.value}`
    : `${lineTitle.value} ${t.value.info}`
})

// ตัวแปรเก็บข้อมูล User (ดึงจาก Database)
const userName = ref(translations.en.loading)
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
let stationMarkers = []
let selectedStationMarker = null
let routeLayer = null
let routeStartMarker = null
let routeEndMarker = null
let currentLocationMarker = null

const defaultCenter = { lat: 20.0470, lng: 99.8940 }

const lineInfoItems = {
  1: {
    en: [
      'Dormitory Lamduan 2',
      'Dormitory Lamduan 7 (Exit)',
      'Junction 3 (Staff House)',
      'Museum D2 Building',
      'International Dormitory (Entrance)',
      'Chinese Center (Entrance)',
      'F Courtyard',
      'D1 Building',
      'Swimming Pool',
      'E2 Building (Entrance)',
      'C4 Meeting Room',
      'C5 Building',
      'E2 Building (Exit)',
      'M-square Building',
      'Chinese Center (Exit)',
      'International Dormitory (Exit)',
      'Lamduan Center',
      'Swimming Pool Entrance',
      'Dormitory Lamduan 7 (Entrance)',
      'Lamduan Canteen Center',
      '7-11 Lamduan'
    ],
    th: [
      'หอพักลำดวน 2',
      'หอพักลำดวน 7 (ทางออก)',
      'สามแยก 3 (บ้านพักบุคลากร)',
      'อาคารพิพิธภัณฑ์ D2',
      'หอพักนานาชาติ (ทางเข้า)',
      'ศูนย์จีน (ทางเข้า)',
      'ลาน F',
      'อาคาร D1',
      'สระว่ายน้ำ',
      'อาคาร E2 (ทางเข้า)',
      'ห้องประชุม C4',
      'อาคาร C5',
      'อาคาร E2 (ทางออก)',
      'อาคาร M-square',
      'ศูนย์จีน (ทางออก)',
      'หอพักนานาชาติ (ทางออก)',
      'ศูนย์ลำดวน',
      'ทางเข้าสระว่ายน้ำ',
      'หอพักลำดวน 7 (ทางเข้า)',
      'ศูนย์อาหารลำดวน',
      '7-11 ลำดวน'
    ]
  },
  2: {
    en: [
      'Dormitory Lamduan 2',
      'Dormitory Lamduan 7 (Exit)',
      'Junction 3 (Staff House)',
      'Museum D2 Building',
      'International Dormitory (Entrance)',
      'Chinese Center (Entrance)',
      'F Courtyard',
      'D1 Building',
      'Swimming Pool',
      'E2 Building (Entrance)',
      'E2 Building (Exit)',
      'M-square Building',
      'Chinese Center (Exit)',
      'International Dormitory (Exit)',
      'Lamduan Center',
      'Swimming Pool Entrance',
      'Dormitory Lamduan 7 (Entrance)',
      'Lamduan Canteen Center',
      '7-11 Lamduan',
      'Mae Fah Luang University Hospital'
    ],
    th: [
      'หอพักลำดวน 2',
      'หอพักลำดวน 7 (ทางออก)',
      'สามแยก 3 (บ้านพักบุคลากร)',
      'อาคารพิพิธภัณฑ์ D2',
      'หอพักนานาชาติ (ทางเข้า)',
      'ศูนย์จีน (ทางเข้า)',
      'ลาน F',
      'อาคาร D1',
      'สระว่ายน้ำ',
      'อาคาร E2 (ทางเข้า)',
      'อาคาร E2 (ทางออก)',
      'อาคาร M-square',
      'ศูนย์จีน (ทางออก)',
      'หอพักนานาชาติ (ทางออก)',
      'ศูนย์ลำดวน',
      'ทางเข้าสระว่ายน้ำ',
      'หอพักลำดวน 7 (ทางเข้า)',
      'ศูนย์อาหารลำดวน',
      '7-11 ลำดวน',
      'โรงพยาบาลมหาวิทยาลัยแม่ฟ้าหลวง'
    ]
  }
}

const stationNameTranslations = {
  en: {
    'Phiphitthaphan D2 Building': 'Museum D2 Building',
    'Dormitory Chin (Entrance)': 'International Dormitory (Entrance)',
    'Dormitory Chin (Exit)': 'International Dormitory (Exit)'
  },
  th: {
    'Dormitory Lamduan 2': 'หอพักลำดวน 2',
    'Dormitory Lamduan 7 (Exit)': 'หอพักลำดวน 7 (ทางออก)',
    'Junction 3 (Staff House)': 'สามแยก 3 (บ้านพักบุคลากร)',
    'Phiphitthaphan D2 Building': 'อาคารพิพิธภัณฑ์ D2',
    'Museum D2 Building': 'อาคารพิพิธภัณฑ์ D2',
    'Dormitory Chin (Entrance)': 'หอพักนานาชาติ (ทางเข้า)',
    'International Dormitory (Entrance)': 'หอพักนานาชาติ (ทางเข้า)',
    'Chinese Center (Entrance)': 'ศูนย์จีน (ทางเข้า)',
    'F Courtyard': 'ลาน F',
    'D1 Building': 'อาคาร D1',
    'Swimming Pool': 'สระว่ายน้ำ',
    'E2 Building (Entrance)': 'อาคาร E2 (ทางเข้า)',
    'C4 Meeting Room': 'ห้องประชุม C4',
    'C5 Building': 'อาคาร C5',
    'E2 Building (Exit)': 'อาคาร E2 (ทางออก)',
    'M-square Building': 'อาคาร M-square',
    'Chinese Center (Exit)': 'ศูนย์จีน (ทางออก)',
    'Dormitory Chin (Exit)': 'หอพักนานาชาติ (ทางออก)',
    'International Dormitory (Exit)': 'หอพักนานาชาติ (ทางออก)',
    'Lamduan Center': 'ศูนย์ลำดวน',
    'Swimming Pool Entrance': 'ทางเข้าสระว่ายน้ำ',
    'Dormitory Lamduan 7 (Entrance)': 'หอพักลำดวน 7 (ทางเข้า)',
    'Lamduan Canteen Center': 'ศูนย์อาหารลำดวน',
    '7-11 Lamduan': '7-11 ลำดวน',
    'Mae Fah Luang University Hospital': 'โรงพยาบาลมหาวิทยาลัยแม่ฟ้าหลวง'
  }
}

// ===== Functions จัดการ UI =====
const toggleProfileMenu = (e) => {
  e.stopPropagation()
  isProfileMenuOpen.value = !isProfileMenuOpen.value
  if (isProfileMenuOpen.value) {
    isInfoMenuOpen.value = false
  }
}

const toggleInfoMenu = (e) => {
  e.stopPropagation()
  isInfoMenuOpen.value = !isInfoMenuOpen.value
  if (isInfoMenuOpen.value) {
    isProfileMenuOpen.value = false
  }
}

const toggleDestinationMenu = (e) => {
  e.stopPropagation()
  isDestinationMenuOpen.value = !isDestinationMenuOpen.value
  if (isDestinationMenuOpen.value) {
    isInfoMenuOpen.value = false
    isProfileMenuOpen.value = false
  }
}

const closeDestinationModal = () => {
  isDestinationMenuOpen.value = false
}

const closeMenuOutside = (e) => {
  const clickedInsideProfile = e.target.closest('.profile-container')
  const clickedInsideInfo = e.target.closest('.info-container')

  if (!clickedInsideProfile && !clickedInsideInfo) {
    isProfileMenuOpen.value = false
    isInfoMenuOpen.value = false
    isDestinationMenuOpen.value = false
  }
}

const currentLineInfoItems = () => {
  return lineInfoItems[activeLine.value]?.[language.value] || []
}

const toggleLanguage = () => {
  const wasLoadingName = [translations.en.loading, translations.th.loading].includes(userName.value)
  const wasFallbackName = [translations.en.user, translations.th.user].includes(userName.value)

  language.value = language.value === 'en' ? 'th' : 'en'
  if (wasLoadingName) {
    userName.value = t.value.loading
  } else if (wasFallbackName) {
    userName.value = t.value.user
  }
  if (selectedStationMarker) {
    const selectedEntry = stationMarkers.find((entry) => entry.marker === selectedStationMarker)
    selectedDestination.value = selectedEntry ? getStationDisplayName(selectedEntry.station) : ''
  }
  refreshMapText()
}

const getStationDisplayName = (station) => {
  const stationName = station?.name
  if (!stationName) return t.value.selectedDestination
  return stationNameTranslations[language.value]?.[stationName] || stationName
}

const openFeedbackModal = () => {
  isFeedbackOpen.value = true
  isProfileMenuOpen.value = false
  feedbackError.value = ''
  feedbackSuccess.value = ''
}

const closeFeedbackModal = () => {
  if (isSubmittingFeedback.value) return
  isFeedbackOpen.value = false
}

const resetFeedbackForm = () => {
  feedbackMessage.value = ''
  feedbackRating.value = 5
}

const submitFeedback = async () => {
  const message = feedbackMessage.value.trim()

  if (!message) {
    feedbackError.value = t.value.writeFeedbackMessage
    return
  }

  try {
    isSubmittingFeedback.value = true
    feedbackError.value = ''
    feedbackSuccess.value = ''

    const res = await apiFetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message,
        rating: feedbackRating.value
      })
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || t.value.unableToSendFeedback)
    }

    resetFeedbackForm()
    feedbackSuccess.value = t.value.feedbackSent
  } catch (error) {
    console.error(error)
    feedbackError.value = error.message || t.value.unableToSendFeedback
  } finally {
    isSubmittingFeedback.value = false
  }
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
      userName.value = userData.name || userData.username || t.value.user
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

const getStationPopupHtml = (station, markerColor) => {
  return `
    <div style="font-family: 'Inter', sans-serif; font-size: 13px;">
      <b style="color: ${markerColor};">${getStationDisplayName(station)}</b><br>
      ${t.value.peopleWaitingNow} <b>${station.waitingPassengers || 0}</b><br>
      <span style="color: #6b7280; font-size: 12px;">${station.incomingBuses || t.value.noBusesIncoming}</span>
    </div>
  `
}

const refreshMapText = () => {
  stationMarkers.forEach(({ marker, station }) => {
    const markerColor = getStationMarkerColor(station.waitingPassengers || 0)
    marker.bindPopup(getStationPopupHtml(station, markerColor))
  })

  if (busMarker1) busMarker1.bindTooltip(`${t.value.line} 1`, { permanent: false, direction: 'top' })
  if (busMarker2) busMarker2.bindTooltip(`${t.value.line} 2`, { permanent: false, direction: 'top' })
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

const formatPoint = (point) => {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
}

const createRoutePointIcon = (label, color) => {
  const iconSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
      <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M15 1C7.3 1 1 7.3 1 15c0 10.2 14 26 14 26s14-15.8 14-26C29 7.3 22.7 1 15 1z"/>
      <text x="15" y="20" text-anchor="middle" font-size="12" font-family="Arial" font-weight="700" fill="#ffffff">${label}</text>
    </svg>
  `)

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38]
  })
}

const setRoutePoint = (type, latlng) => {
  const point = {
    lat: Number(latlng.lat),
    lng: Number(latlng.lng)
  }

  if (type === 'start') {
    routeStart.value = point
    routeMode.value = 'end'
  } else {
    routeEnd.value = point
  }

  routeError.value = ''
  routeResult.value = null
  if (routeLayer) {
    routeLayer.remove()
    routeLayer = null
  }
  drawRouteMarkers()
}

const drawRouteMarkers = () => {
  if (!map) return

  if (routeStartMarker) routeStartMarker.remove()
  if (routeEndMarker) routeEndMarker.remove()

  routeStartMarker = routeStart.value
    ? L.marker([routeStart.value.lat, routeStart.value.lng], {
      icon: createRoutePointIcon('A', '#2563eb'),
      draggable: true
    }).addTo(map)
    : null

  routeEndMarker = routeEnd.value
    ? L.marker([routeEnd.value.lat, routeEnd.value.lng], {
      icon: createRoutePointIcon('B', '#dc2626'),
      draggable: true
    }).addTo(map)
    : null

  if (routeStartMarker) {
    routeStartMarker.on('dragend', (event) => setRoutePoint('start', event.target.getLatLng()))
  }
  if (routeEndMarker) {
    routeEndMarker.on('dragend', (event) => setRoutePoint('end', event.target.getLatLng()))
  }
}

const drawWalkingRoute = (coordinates) => {
  if (!map) return
  if (routeLayer) routeLayer.remove()

  routeLayer = L.polyline(coordinates, {
    color: '#2563eb',
    weight: 6,
    opacity: 0.9
  }).addTo(map)

  map.fitBounds(routeLayer.getBounds(), {
    padding: [70, 70],
    maxZoom: 18
  })
}

const requestWalkingRoute = async () => {
  if (!canRequestRoute.value) return

  try {
    isRouting.value = true
    routeError.value = ''

    const params = new URLSearchParams({
      startLat: routeStart.value.lat,
      startLng: routeStart.value.lng,
      endLat: routeEnd.value.lat,
      endLng: routeEnd.value.lng
    })
    const res = await apiFetch(`/api/route?${params.toString()}`)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || t.value.routeFailed)
    }

    routeResult.value = data
    drawWalkingRoute(data.route.coordinates)
  } catch (error) {
    console.error(error)
    routeError.value = error.message || t.value.routeFailed
  } finally {
    isRouting.value = false
  }
}

const clearWalkingRoute = () => {
  routeStart.value = null
  routeEnd.value = null
  routeResult.value = null
  routeError.value = ''
  routeMode.value = 'start'

  if (routeLayer) routeLayer.remove()
  if (routeStartMarker) routeStartMarker.remove()
  if (routeEndMarker) routeEndMarker.remove()

  routeLayer = null
  routeStartMarker = null
  routeEndMarker = null
}

const useCurrentLocation = () => {
  if (!navigator.geolocation) {
    routeError.value = 'GPS is not available in this browser'
    return
  }

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const point = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      setRoutePoint('start', point)

      if (currentLocationMarker) currentLocationMarker.remove()
      currentLocationMarker = L.circleMarker([point.lat, point.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.9
      }).addTo(map)

      map.flyTo([point.lat, point.lng], 17, { duration: 1.2 })
      isLocating.value = false
    },
    (error) => {
      routeError.value = error.message || 'Unable to read GPS location'
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const getStationKey = (station) => {
  if (!station) return ''
  return station._id || station.id || station.name || `${station.location?.lat ?? ''}-${station.location?.lng ?? ''}`
}

const createStationIcon = (markerColor, isSelected = false) => {
  const pinWidth = isSelected ? 34 : 28
  const pinHeight = isSelected ? 49 : 41
  const iconSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${pinWidth}" height="${pinHeight}" viewBox="0 0 28 41">
      <path fill="${markerColor}" stroke="#ffffff" stroke-width="2" d="M14 1C6.8 1 1 6.8 1 14c0 9.5 13 26 13 26s13-16.5 13-26C27 6.8 21.2 1 14 1z"/>
      <circle cx="14" cy="14" r="5" fill="#ffffff"/>
    </svg>
  `)

  return L.icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${iconSvg}`,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight],
    popupAnchor: [0, -pinHeight + 4]
  })
}

const selectDestination = (station, marker = null) => {
  if (!station || !map) return

  const stationKey = getStationKey(station)
  const matchedMarker = marker || stationMarkers.find((entry) => entry.key === stationKey)?.marker

  if (selectedStationMarker) {
    const previousEntry = stationMarkers.find((entry) => entry.marker === selectedStationMarker)
    if (previousEntry) {
      const previousColor = getStationMarkerColor(previousEntry.station.waitingPassengers || 0)
      previousEntry.marker.setIcon(createStationIcon(previousColor, false))
    }
  }

  if (matchedMarker) {
    const markerColor = getStationMarkerColor(station.waitingPassengers || 0)
    matchedMarker.setIcon(createStationIcon(markerColor, true))
    selectedStationMarker = matchedMarker
    selectedDestination.value = getStationDisplayName(station)

    const lat = parseFloat(station.location?.lat)
    const lng = parseFloat(station.location?.lng)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setRoutePoint('end', { lat, lng })
      map.flyTo([lat, lng], 17, { duration: 1.2 })
      matchedMarker.openPopup()
    }
  }

  isDestinationMenuOpen.value = false
  isProfileMenuOpen.value = false
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

const handleMapClick = (event) => {
  setRoutePoint(routeMode.value, event.latlng)
}

const createMap = () => {
  if (map) { map.remove(); map = null }

  map = L.map('map', { zoomControl: false }).setView([defaultCenter.lat, defaultCenter.lng], 15)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map)

  map.on('click', handleMapClick)

  lineLayer1 = L.polyline(line1Coords, { color: '#8b0000', weight: 3, opacity: 0.9 })
  lineLayer2 = L.polyline(line2Coords, { color: '#f1c40f', weight: 3, opacity: 0.9, dashArray: '8, 4' })

  // ==========================================
  // 🚨 จุดที่ต้องแก้: กรองข้อมูลให้ยืดหยุ่นขึ้น
  // ==========================================
  console.log('📌 ข้อมูลสถานีที่ได้จาก API:', stations.value) // เช็กใน Console (F12) ว่ามีข้อมูลมาไหม

  stationMarkers = []
  selectedStationMarker = null
  selectedDestination.value = ''

  const validStations = stations.value.filter((s) => {
    if (!s.location || s.location.lat == null || s.location.lng == null) return false
    
    // แปลงให้เป็นตัวเลขเสมอ (แก้ปัญหา DB ส่งมาเป็น String)
    const lat = parseFloat(s.location.lat)
    const lng = parseFloat(s.location.lng)
    
    return !isNaN(lat) && !isNaN(lng) // ผ่านถ้าเป็นตัวเลขที่ถูกต้อง
  })

  console.log('📌 สถานีที่พิกัดถูกต้อง พร้อมปักหมุด:', validStations)

  // สร้างหมุดป้ายรถเมล์
  validStations.forEach((station) => {
    const markerColor = getStationMarkerColor(station.waitingPassengers || 0)
    const marker = L.marker([parseFloat(station.location.lat), parseFloat(station.location.lng)], {
      icon: createStationIcon(markerColor)
    }).addTo(map)

    marker.bindPopup(getStationPopupHtml(station, markerColor))
    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())
    marker.on('click', () => selectDestination(station, marker))

    stationMarkers.push({
      key: getStationKey(station),
      marker,
      station
    })
  })
  // ==========================================

  busMarker1 = L.marker(line1Coords[0], { icon: createBusIcon(), zIndexOffset: 1000 })
  busMarker1.bindTooltip(`${t.value.line} 1`, { permanent: false, direction: 'top' })

  busMarker2 = L.marker(line2Coords[0], { icon: createBusIcon(), zIndexOffset: 1000 })
  busMarker2.bindTooltip(`${t.value.line} 2`, { permanent: false, direction: 'top' })

  syncLineVisibility()

  // เริ่มแอนิเมชัน
  animFrame1 = animateBus(busMarker1, line1Coords, 0.003, 0)
  animFrame2 = animateBus(busMarker2, line2Coords, 0.004, 5)
  drawRouteMarkers()
  if (routeResult.value?.route?.coordinates?.length) {
    drawWalkingRoute(routeResult.value.route.coordinates)
  }
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

.info-container {
  position: relative;
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

.info-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: min(320px, 80vw);
  max-height: min(360px, 60vh);
  overflow-y: auto;
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 0;
  z-index: 1100;
}

.info-dropdown-header {
  padding: 6px 16px 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 6px;
}

.info-dropdown-title {
  font-size: 14px;
  font-weight: 700;
  color: #111;
}

.info-dropdown-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.info-list {
  list-style: none;
  padding: 0 4px;
  margin: 0;
}

.info-list li {
  padding: 8px 14px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.info-list li:nth-child(odd) {
  background: #fafafa;
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

.destination-modal-backdrop {
  z-index: 3000;
}

.destination-modal {
  width: min(460px, calc(100% - 24px));
  max-height: min(70vh, 560px);
  overflow: auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
}

.destination-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.destination-modal-header h2 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 20px;
}

.destination-modal-header p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.destination-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.destination-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  padding: 10px 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  color: #111827;
}

.destination-item span {
  font-size: 14px;
  font-weight: 600;
}

.destination-item small {
  font-size: 12px;
  color: #6b7280;
}

.destination-item.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.destination-empty {
  padding: 10px 4px;
  color: #6b7280;
  font-size: 13px;
}

.card-label { font-size: 14px; font-weight: 600; color: #111; }
.emoji-icon { font-size: 20px; }
.icon-dark-red { font-size: 22px; color: #a30000; }
.icon-black { font-size: 22px; color: #000; }
.icon-red { font-size: 22px; color: #d32f2f; }

/* แอนิเมชันตอนเปิด/ปิด Dropdown */
.dropdown-fade-enter-active, .dropdown-fade-leave-active { transition: all 0.3s ease; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ================== FEEDBACK MODAL ================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.42);
}

.feedback-modal {
  width: min(460px, 100%);
  background: #ffffff;
  border-radius: 12px;
  padding: 22px;
}

.feedback-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.feedback-modal-header h2 {
  margin: 0 0 4px;
  color: #111827;
  font-size: 22px;
}

.feedback-modal-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.modal-close {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  font-size: 22px;
}

.feedback-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.feedback-field span {
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.feedback-field textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 12px;
  color: #111827;
  font: inherit;
  outline: none;
}

.feedback-field textarea:focus {
  border-color: #a30000;
  box-shadow: 0 0 0 3px rgba(163, 0, 0, 0.12);
}

.rating-options {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.rating-btn {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font-weight: 700;
  cursor: pointer;
}

.rating-btn.active {
  border-color: #a30000;
  background: #fff0f0;
  color: #a30000;
}

.feedback-error,
.feedback-success {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 600;
}

.feedback-error {
  color: #dc2626;
}

.feedback-success {
  color: #059669;
}

.feedback-submit {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  background: #a30000;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.feedback-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

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
.route-panel {
  position: absolute;
  top: 88px;
  left: 24px;
  z-index: 1000;
  width: min(360px, calc(100vw - 48px));
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
}

.route-panel-title {
  color: #111827;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 10px;
}

.route-mode-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.route-mode-toggle button,
.route-actions button {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 10px;
}

.route-mode-toggle button.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.route-points {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #4b5563;
  font-size: 12px;
  margin-bottom: 10px;
}

.route-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 0.7fr;
  gap: 8px;
}

.route-actions button.primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.route-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.route-error {
  margin: 10px 0 0;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
}

.route-summary {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.route-summary span {
  border-radius: 999px;
  background: #f3f4f6;
  color: #111827;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
}

.marker-legend {
  position: absolute;
  bottom: 24px;
  left: 24px;
  z-index: 1000;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.legend-pin {
  width: 12px;
  height: 18px;
  flex-shrink: 0;
}

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
  .route-panel { top: 70px; left: 16px; width: calc(100vw - 32px); }
  .route-actions { grid-template-columns: 1fr; }
  .marker-legend { bottom: 16px; left: 16px; padding: 10px 12px; }
  
  .profile-dropdown {
    width: 230px; 
    max-height: calc(100dvh - 100px); 
    overflow-y: auto;
    padding-bottom: 10px; 
  }
  
  /* ปรับลูกศรให้ตรงกับรูปโปรไฟล์บนจอเล็ก */
  .user-info-card::before { right: 12px; }

  .feedback-modal {
    padding: 18px;
  }
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
