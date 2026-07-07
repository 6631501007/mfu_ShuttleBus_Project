<template>
  <div class="app-container">
    <aside class="sidebar">
      <div>
        <div class="logo">
          <h1>Bus<span>Stop</span></h1>
          <p>PASSENGER INTELLIGENCE</p>
        </div>
        <nav class="menu">
          <div class="menu-item" @click="router.push('/dashboard')">
            <i class='bx bx-grid-alt'></i>
            <span>Dashboard</span>
          </div>
          <div class="menu-item" @click="router.push('/analytics')">
            <i class='bx bx-line-chart'></i>
            <span>Analytics</span>
          </div>
          <div class="menu-item" @click="router.push('/map')">
            <i class='bx bx-map-alt'></i>
            <span>Map</span>
          </div>
          <div class="menu-item" @click="router.push('/livefeed')">
            <i class='bx bx-video'></i>
            <span>Live Feed</span>
          </div>
          <div class="menu-item" @click="router.push('/feedback')">
            <i class='bx bx-message-square-dots'></i>
            <span>Feedback</span>
          </div>
          <div class="menu-item" @click="router.push('/setting')">
            <i class='bx bx-cog'></i>
            <span>Settings</span>
          </div>
        </nav>
      </div>
      <div class="user-card">
        <div class="avatar">A</div>
        <div>
          <h4>Admin User</h4>
          <p>Operational Lead</p>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">Settings</h2>
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" placeholder="Search devices or zones..." />
          </div>
        </div>
        <div class="header-right">
          <div class="action-icons">
            <TopbarNotification />
            <div class="lang-switcher" @click="toggleLanguage">
              <i class='bx bx-globe'></i>
              <span>{{ language }}</span>
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

      <div class="settings-page">
        <div class="page-title">
          <h2>System Settings</h2>
          <p>Configure operational parameters and automated alert triggers.</p>
        </div>

        <div class="settings-grid top-grid">
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bxs-group'></i>
                <h3>Station Thresholds</h3>
              </div>
              <button class="btn-dark" @click="openAddModal">Add Station</button>
            </div>
            <div class="threshold-list">
              <div v-if="stations.length === 0" class="empty-state">
                <p>No stations found.</p>
              </div>
              <div class="threshold-item" v-for="station in stations" :key="station._id">
                <div class="item-info">
                  <strong>{{ station.name }}</strong>
                  <span>{{ station.desc || station.description || '—' }}</span>
                </div>
                <div class="progress-section">
                  <div class="progress-bar-bg">
                    <div class="progress-fill" :class="getProgressColor(station.waitingPassengers)"
                      :style="{ width: getPercentage(station.waitingPassengers, station.capacity) + '%' }"></div>
                  </div>
                  <div class="progress-labels">
                    <span class="current">CURRENT: {{ station.waitingPassengers ?? 0 }} People</span>
                    <span class="limit-label">CAPACITY: {{ station.capacity ?? '—' }}</span>
                  </div>
                </div>
                <div class="limit-box">
                  <span>Now:</span>
                  <strong>{{ station.waitingPassengers ?? 0 }}</strong>
                </div>
                <div class="item-actions">
                  <i class='bx bx-pencil edit-icon' @click="openEditModal(station)" title="Edit"></i>
                  <i class='bx bx-trash delete-icon' @click="deleteStation(station._id)" title="Delete"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bx-bell'></i>
                <h3>Notification Channels</h3>
              </div>
            </div>
            <div class="channel-section">
              <div class="channel-row">
                <strong>EMAIL ALERTS</strong>
                <label class="switch"><input type="checkbox" v-model="notificationChannels.emailEnabled"><span
                    class="slider"></span></label>
              </div>
              <p class="channel-desc">{{ notificationChannels.emails.length ? notificationChannels.emails.join(', ') :
                'No active email recipients' }}</p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                <span v-for="(email, idx) in notificationChannels.emails" :key="idx" class="tag-item">
                  {{ email }}
                  <i class='bx bx-x' @click="removeEmail(idx)" style="cursor:pointer; margin-left:4px;"></i>
                </span>
              </div>
              <span class="add-link" @click="openNotificationModal('email')">+ Add recipient</span>
            </div>

            <div class="queue-threshold-section">
              <strong>Queue Delay Threshold</strong>
              <div class="range-slider-container">
                <input type="range" min="1" max="60" v-model="delayThreshold" class="range-slider">
                <span class="range-value text-red">{{ delayThreshold }}m</span>
              </div>
              <p class="range-desc text-red">Trigger alert when wait time exceeds {{ delayThreshold }} minutes.</p>
            </div>
          </div>
        </div>

        <div class="settings-grid bottom-grid">
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bx-broadcast'></i>
                <h3>Connected Hardware</h3>
              </div>
              <button class="btn-dark" @click="openAddHardwareModal">+ Add Hardware</button>
            </div>
            <div class="hardware-list">
              <div class="hw-item" v-for="(hw, index) in hardware" :key="hw.deviceId || index">
                <i
                  :class="['bx', 'hw-icon', hw.status === 'online' ? 'bx-check-circle online' : 'bx-error-triangle offline']"></i>
                <div class="hw-info">
                  <strong :class="hw.status === 'offline' ? 'text-red' : ''">{{ hw.name }}</strong>
                  <span>{{ hw.details }}</span>
                  <span v-if="hw.type === 'camera' && hw.rtspUrl" class="hw-rtsp">{{ hw.rtspUrl }}</span>
                </div>
                <div class="hw-actions">
                  <i class='bx bx-pencil edit-icon' @click="openEditHardwareModal(index)" title="Edit"></i>
                  <i class='bx bx-trash delete-icon' @click="deleteHardware(hw, index)" title="Delete"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bx-selection'></i>
                <h3>Live Feed Counting Grid</h3>
              </div>
            </div>
            <div class="livefeed-config">
              <div v-if="cameraHardware.length === 0" class="zone-reference-empty standalone">
                <i class='bx bx-camera-off'></i>
                <span>Add a camera hardware device to configure its counting grid</span>
              </div>
              <div class="livefeed-toolbar" v-if="cameraHardware.length > 0">
                <div class="form-group compact">
                  <label>Camera Hardware</label>
                  <select v-model="selectedLivefeedHardwareId">
                    <option v-for="camera in cameraHardware" :key="camera.deviceId" :value="camera.deviceId">
                      {{ camera.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group compact">
                  <label>Dwell Time Before Count</label>
                  <input type="number" min="1" v-model.number="selectedLivefeed.dwellSeconds" :disabled="!selectedLivefeedHardware" />
                </div>
                <label class="image-upload-btn">
                  <i class='bx bx-image-add'></i>
                  Upload Camera Image
                  <input type="file" accept="image/*" :disabled="!selectedLivefeedHardware" @change="handleReferenceImageUpload" />
                </label>
                <button v-if="selectedLivefeed.referenceImage" class="btn-outline small" type="button" @click="clearReferenceImage">
                  Clear Image
                </button>
              </div>

              <div v-if="selectedLivefeedHardware" class="zone-editor" ref="zoneEditorRef" @pointerdown="startZoneEditorPointer">
                <img v-if="selectedLivefeed.referenceImage" :src="selectedLivefeed.referenceImage" class="zone-reference-image" alt="" />
                <div v-else class="zone-reference-empty">
                  <i class='bx bx-image'></i>
                  <span>Upload a camera reference image</span>
                </div>
                <div
                  v-for="(zone, index) in selectedLivefeed.zones"
                  :key="index"
                  class="zone-editor-box"
                  :class="{ 'zone-editor-box-disabled': !zone.enabled }"
                  :data-zone-index="index"
                  data-action="move"
                  :style="zonePreviewStyle(zone)"
                >
                  <span>{{ selectedLivefeedHardware.name }}</span>
                  <button
                    v-for="handle in resizeHandles"
                    :key="handle"
                    type="button"
                    class="zone-resize-handle"
                    :class="`zone-resize-${handle}`"
                    :data-zone-index="index"
                    :data-action="handle"
                    :aria-label="`Resize ${zone.name}`"
                  ></button>
                </div>
              </div>

              <div v-if="selectedLivefeedHardware" v-for="(zone, index) in selectedLivefeed.zones" :key="index" class="zone-config-row">
                <div class="zone-config-head">
                  <strong>{{ selectedLivefeedHardware.name }}</strong>
                  <label class="zone-enabled"><input type="checkbox" v-model="zone.enabled" /> Enabled</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="slide-up">
        <div class="action-bar" v-if="hasUnsavedChanges">
          <div class="action-right">
            <button class="btn-outline" @click="discardChanges">Discard Changes</button>
            <button class="btn-dark-blue" @click="saveSettings">Save Configuration</button>
          </div>
        </div>
      </transition>
    </main>

    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? 'Add New Station' : 'Edit Station' }}</h3>
          <i class='bx bx-x close-btn' @click="closeModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Station Name</label>
            <input type="text" v-model="formData.name" placeholder="e.g. Station A" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" v-model="formData.desc" placeholder="e.g. Main Waiting Area" />
          </div>
          <div class="form-group">
            <label>Capacity (Passenger Limit)</label>
            <input type="number" v-model.number="formData.capacity" placeholder="e.g. 100" min="1" />
          </div>
          <div class="form-group" v-if="modalMode === 'add'">
            <label>Initial Waiting Passengers</label>
            <input type="number" v-model.number="formData.waitingPassengers" placeholder="e.g. 0" min="0" />
          </div>
          <div class="form-group">
            <label>Pick Station Location</label>
            <div id="station-modal-map" class="modal-map"></div>
            <p class="map-help">Click on the map to choose the station position. This will appear on the Map page.</p>
            <div class="location-coordinates">
              <span>Lat: {{ formData.location.lat.toFixed(6) }}</span>
              <span>Lng: {{ formData.location.lng.toFixed(6) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-outline" @click="closeModal">Cancel</button>
          <button class="btn-dark-blue" @click="confirmModal">Confirm</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="isHardwareModalOpen" @click.self="closeHardwareModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ hardwareModalMode === 'add' ? 'Add Hardware' : 'Edit Hardware' }}</h3>
          <i class='bx bx-x close-btn' @click="closeHardwareModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Device Name</label>
            <input type="text" v-model="hardwareFormData.name" placeholder="e.g. Sensor-Unit-001" />
          </div>
          <div class="form-group">
            <label>Device Type</label>
            <select v-model="hardwareFormData.type"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;">
              <option value="sensor">Sensor</option>
              <option value="camera">Camera</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>IP Address</label>
            <input type="text" v-model="hardwareFormData.ip" placeholder="e.g. 192.168.1.100" />
          </div>
          <div class="form-group">
            <label>RTSP URL</label>
            <input type="text" v-model="hardwareFormData.rtspUrl" placeholder="rtsp://user:pass@camera-ip/path" />
          </div>
          <div class="form-group">
            <label>Firmware Version</label>
            <input type="text" v-model="hardwareFormData.fw" placeholder="e.g. v2.4.1" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="hardwareFormData.status"
              style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-outline" @click="closeHardwareModal">Cancel</button>
          <button class="btn-dark-blue" @click="confirmHardwareModal">Confirm</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="isNotificationModalOpen" @click.self="closeNotificationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Email Recipient</h3>
          <i class='bx bx-x close-btn' @click="closeNotificationModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Email Address</label>
            <input 
              type="text" 
              v-model="newChannelValue" 
              placeholder="e.g. admin@example.com"
              @keyup.enter="addNotificationChannel"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-outline" @click="closeNotificationModal">Cancel</button>
          <button class="btn-dark-blue" @click="addNotificationChannel">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TopbarNotification from '../components/TopbarNotification.vue'
import { apiFetch } from '../lib/api'

const router = useRouter();

// ── UI state ──────────────────────────────────────────────
const isDropdownOpen = ref(false);
const language = ref('English');
const hasUnsavedChanges = ref(false); 
let isFetching = false; 
const dirtyGeneralSettings = ref(false);
const dirtyHardwareSettings = ref(false);
const dirtyStationSettings = ref(false);

// ── Settings (notification + hardware) ───────────────────
const delayThreshold = ref(15);
const notificationChannels = ref({
  emailEnabled: false,
  emails: []
});
const hardware = ref([]);
const zoneEditorRef = ref(null);
const resizeHandles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const livefeedGridColor = '#16a34a';
const selectedLivefeedHardwareId = ref('');
const livefeed = ref({
  dwellSeconds: 30,
  referenceImage: '',
  zones: [
    { name: 'Counting Zone', x: 20, y: 20, width: 60, height: 60, color: livefeedGridColor, enabled: true }
  ]
});
let zoneDragState = null;

// ── Stations (Station Thresholds) ─────────────────────────
const stations = ref([]);
const defaultStationLocation = { lat: 20.04498749707566, lng: 99.89428182346516 };

// ── Station Modal ─────────────────────────────────────────
const isModalOpen = ref(false);
const modalMode = ref('add');          // 'add' | 'edit'
const editStationId = ref(null);
const modalMap = ref(null);
let modalMarker = null;
const selectedLocation = ref({ ...defaultStationLocation });
const formData = ref({ name: '', desc: '', capacity: 100, waitingPassengers: 0, location: { ...defaultStationLocation } });

// ── Notification Channel Modal (Email Only) ───────────────
const isNotificationModalOpen = ref(false);
const newChannelValue = ref('');

// ── Hardware Modal ────────────────────────────────────────
const isHardwareModalOpen = ref(false);
const hardwareModalMode = ref('add');
const hardwareEditIndex = ref(-1);
const hardwareFormData = ref({ _id: '', deviceId: '', name: '', type: 'camera', ip: '', rtspUrl: '', fw: '', status: 'offline', livefeed: undefined });

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English';
};

const getPercentage = (current, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round(((current ?? 0) / limit) * 100));
};

const getProgressColor = (current) => {
  const passengers = current ?? 0;
  if (passengers >= 9) return 'red';
  if (passengers >= 5) return 'yellow';
  return 'green'; 
};

const normalizeZone = (zone, index = 0, zoneName = '') => {
  const width = Math.min(100, Math.max(1, Number(zone?.width) || 1));
  const height = Math.min(100, Math.max(1, Number(zone?.height) || 1));
  const x = Math.min(100 - width, Math.max(0, Number(zone?.x) || 0));
  const y = Math.min(100 - height, Math.max(0, Number(zone?.y) || 0));
  return {
    name: zoneName || zone?.name || `Counting Zone ${index + 1}`,
    x,
    y,
    width,
    height,
    color: livefeedGridColor,
    enabled: zone?.enabled !== false
  };
};

const normalizeLivefeedConfig = (config = {}, zoneName = '') => ({
  dwellSeconds: Math.max(1, Number(config?.dwellSeconds) || 30),
  referenceImage: typeof config?.referenceImage === 'string' ? config.referenceImage : '',
  zones: (Array.isArray(config?.zones) && config.zones.length
    ? config.zones.slice(0, 1)
    : [{ name: zoneName || 'Counting Zone', x: 20, y: 20, width: 60, height: 60, color: livefeedGridColor, enabled: true }]
  ).map((zone, index) => normalizeZone(zone, index, zoneName))
});

const numbersMatch = (left, right, tolerance = 0.001) => (
  Math.abs((Number(left) || 0) - (Number(right) || 0)) <= tolerance
);

const livefeedZonesMatch = (leftZones = [], rightZones = []) => {
  const left = leftZones[0];
  const right = rightZones[0];
  if (!left || !right) return !left && !right;

  return numbersMatch(left.x, right.x) &&
    numbersMatch(left.y, right.y) &&
    numbersMatch(left.width, right.width) &&
    numbersMatch(left.height, right.height) &&
    (left.enabled !== false) === (right.enabled !== false);
};

const cameraHardware = computed(() => hardware.value.filter(item => item.type === 'camera'));

const selectedLivefeedHardware = computed(() => (
  cameraHardware.value.find(item => item.deviceId === selectedLivefeedHardwareId.value) ||
  cameraHardware.value[0] ||
  null
));

const selectedLivefeed = computed(() => selectedLivefeedHardware.value?.livefeed || livefeed.value);

const getHardwareStateKey = (hw = {}, index = 0) => {
  const mongoId = typeof hw?._id === 'string' ? hw._id : hw?._id?.$oid;
  return String(hw?.deviceId || mongoId || index);
};

const findMatchingHardware = (items = [], target = {}, targetIndex = 0) => (
  items.find((item, index) => (
    item.deviceId === target.deviceId ||
    getHardwareStateKey(item, index) === getHardwareStateKey(target, targetIndex)
  ))
);

const readApiJson = async (res, actionLabel = 'API request') => {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.trim().slice(0, 80);
    const looksLikeHtml = snippet.startsWith('<!DOCTYPE') || snippet.startsWith('<html') || snippet.startsWith('<');
    throw new Error(looksLikeHtml
      ? `${actionLabel} returned the website HTML instead of API JSON. Please restart the backend/frontend dev servers and check VITE_API_BASE_URL.`
      : `${actionLabel} returned invalid JSON.`);
  }
};

const updateReferenceImagePreview = (value = '') => {
  const wasFetching = isFetching;
  isFetching = true;
  selectedLivefeed.value.referenceImage = value;
  nextTick(() => {
    isFetching = wasFetching;
  });
};

const hydrateHardwareReferenceImages = async () => {
  const wasFetching = isFetching;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 20000);
  isFetching = true;

  try {
    const res = await apiFetch('/api/settings/hardware?includeReferenceImages=true', {
      signal: controller.signal
    });
    const fullHardware = await res.json();
    if (!res.ok || !Array.isArray(fullHardware)) return;

    hardware.value = hardware.value.map((item, index) => {
      const fullItem = fullHardware.find(candidate => (
        candidate.deviceId === item.deviceId ||
        getHardwareApiId(candidate, index) === getHardwareApiId(item, index)
      ));
      if (!fullItem?.livefeed) return item;

      return {
        ...item,
        livefeed: normalizeLivefeedConfig(fullItem.livefeed, item.name)
      };
    });
  } catch (error) {
    if (error.name !== 'AbortError') console.error(error);
  } finally {
    window.clearTimeout(timeoutId);
    nextTick(() => {
      isFetching = wasFetching;
    });
  }
};

const ensureHardwareLivefeedConfigs = (fallbackLivefeed = livefeed.value) => {
  hardware.value = hardware.value.map((item) => {
    if (item.type !== 'camera') return item;
    return {
      ...item,
      livefeed: normalizeLivefeedConfig(item.livefeed || fallbackLivefeed, item.name)
    };
  });

  const selectedStillExists = cameraHardware.value.some(item => item.deviceId === selectedLivefeedHardwareId.value);
  if (!selectedStillExists) {
    selectedLivefeedHardwareId.value = cameraHardware.value[0]?.deviceId || '';
  }
};

const zonePreviewStyle = (zone) => ({
  left: `${Math.max(0, Number(zone.x) || 0)}%`,
  top: `${Math.max(0, Number(zone.y) || 0)}%`,
  width: `${Math.max(1, Number(zone.width) || 1)}%`,
  height: `${Math.max(1, Number(zone.height) || 1)}%`,
  borderColor: livefeedGridColor,
  color: livefeedGridColor,
  backgroundColor: `${livefeedGridColor}22`
});

const handleReferenceImageUpload = (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image file');
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    alert('Please choose an image smaller than 4 MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    updateReferenceImagePreview(String(reader.result || ''));
  };
  reader.readAsDataURL(file);
};

const clearReferenceImage = () => {
  updateReferenceImagePreview('');
};

const startZoneEditorPointer = (event) => {
  if (!selectedLivefeedHardware.value) return;
  const target = event.target.closest('[data-zone-index]');
  if (!target || !zoneEditorRef.value) return;

  const zoneIndex = Number(target.dataset.zoneIndex);
  const zone = selectedLivefeed.value.zones[zoneIndex];
  if (!zone) return;

  const rect = zoneEditorRef.value.getBoundingClientRect();
  zoneDragState = {
    pointerId: event.pointerId,
    action: target.dataset.action || 'move',
    zoneIndex,
    rect,
    startX: event.clientX,
    startY: event.clientY,
    startZone: { ...zone }
  };

  target.setPointerCapture?.(event.pointerId);
  window.addEventListener('pointermove', moveZoneEditorPointer);
  window.addEventListener('pointerup', stopZoneEditorPointer, { once: true });
};

const moveZoneEditorPointer = (event) => {
  if (!zoneDragState || event.pointerId !== zoneDragState.pointerId) return;
  const zone = selectedLivefeed.value.zones[zoneDragState.zoneIndex];
  if (!zone) return;

  const dx = ((event.clientX - zoneDragState.startX) / zoneDragState.rect.width) * 100;
  const dy = ((event.clientY - zoneDragState.startY) / zoneDragState.rect.height) * 100;
  const start = zoneDragState.startZone;
  let x = Number(start.x) || 0;
  let y = Number(start.y) || 0;
  let width = Number(start.width) || 1;
  let height = Number(start.height) || 1;

  if (zoneDragState.action === 'move') {
    x += dx;
    y += dy;
  } else {
    if (zoneDragState.action.includes('w')) {
      x += dx;
      width -= dx;
    }
    if (zoneDragState.action.includes('e')) width += dx;
    if (zoneDragState.action.includes('n')) {
      y += dy;
      height -= dy;
    }
    if (zoneDragState.action.includes('s')) height += dy;
  }

  Object.assign(zone, normalizeZone({ ...zone, x, y, width, height }, zoneDragState.zoneIndex, selectedLivefeedHardware.value?.name || ''));
};

const stopZoneEditorPointer = () => {
  zoneDragState = null;
  window.removeEventListener('pointermove', moveZoneEditorPointer);
};


// ─────────────────────────────────────────────────────────
// API & Data Loading (Merged and Fixed)
// ─────────────────────────────────────────────────────────
const loadStations = async () => {
  try {
    const res = await apiFetch('/api/stations');
    if (!res.ok) throw new Error('Cannot load stations');
    stations.value = await res.json();
  } catch (error) {
    console.error(error);
  }
};

const loadSettings = async () => {
  try {
    const [settingsRes, hardwareRes] = await Promise.all([
      apiFetch('/api/settings'),
      apiFetch('/api/settings/hardware')
    ]);
    const data = await settingsRes.json();
    const hardwareData = await hardwareRes.json();
    if (!settingsRes.ok) throw new Error(data.message || 'Cannot load settings');
    if (!hardwareRes.ok) throw new Error(hardwareData.message || 'Cannot load hardware settings');
    notificationChannels.value = data.notificationChannels || {
      emailEnabled: false, smsEnabled: false, emails: [], mobiles: []
    };
    delayThreshold.value = data.delayThreshold ?? 15;
    hardware.value = Array.isArray(hardwareData) ? hardwareData : [];
    livefeed.value = {
      dwellSeconds: data.livefeed?.dwellSeconds ?? 30,
      referenceImage: data.livefeed?.referenceImage || '',
      zones: (Array.isArray(data.livefeed?.zones) && data.livefeed.zones.length
        ? data.livefeed.zones
        : [{ name: 'Counting Zone', x: 20, y: 20, width: 60, height: 60, color: livefeedGridColor, enabled: true }]
      ).map(normalizeZone)
    };
    ensureHardwareLivefeedConfigs(livefeed.value);
    hydrateHardwareReferenceImages();
  } catch (error) {
    console.error(error);
  }
};

const reloadAllData = async () => {
  isFetching = true;
  try {
    await Promise.all([loadStations(), loadSettings()]);
  } catch (error) {
    console.error(error);
  } finally {
    nextTick(() => {
      dirtyGeneralSettings.value = false;
      dirtyHardwareSettings.value = false;
      dirtyStationSettings.value = false;
      hasUnsavedChanges.value = false;
      isFetching = false;
    });
  }
};

const verifySavedHardwareConfigs = async (saveTargets = []) => {
  if (!saveTargets.length) return;

  await Promise.all(saveTargets.map(async ({ item, index, livefeedConfig }) => {
    let savedLivefeedStatus = null;

    try {
      const statusRes = await apiFetch(`/api/settings/hardware/${getHardwareApiId(item, index)}/livefeed/status`);
      const statusData = await readApiJson(statusRes, `Verifying ${item.name}`);
      if (statusRes.ok && statusData.livefeed) {
        savedLivefeedStatus = statusData.livefeed;
      }
    } catch (error) {
      console.warn(error);
    }

    if (!savedLivefeedStatus) {
      const hardwareRes = await apiFetch('/api/settings/hardware?includeReferenceImages=true');
      const savedHardware = await readApiJson(hardwareRes, 'Verifying saved camera settings');
      if (!hardwareRes.ok || !Array.isArray(savedHardware)) {
        throw new Error(savedHardware.message || `Could not verify saved settings for ${item.name}`);
      }

      const savedItem = findMatchingHardware(savedHardware, item, index);
      if (!savedItem?.livefeed) {
        throw new Error(`Could not verify saved settings for ${item.name}`);
      }

      savedLivefeedStatus = {
        ...savedItem.livefeed
      };
    }

    const savedLivefeed = normalizeLivefeedConfig(savedLivefeedStatus, item.name);
    if (!numbersMatch(savedLivefeed.dwellSeconds, livefeedConfig.dwellSeconds) ||
      !livefeedZonesMatch(savedLivefeed.zones, livefeedConfig.zones)) {
      throw new Error(`Camera grid settings were not saved for ${item.name}`);
    }
  }));
};

const verifySavedGeneralSettings = async () => {
  const res = await apiFetch('/api/settings');
  const savedSettings = await readApiJson(res, 'Verifying general settings');
  if (!res.ok) throw new Error(savedSettings.message || 'Could not verify saved general settings');

  const savedEmails = savedSettings.notificationChannels?.emails || [];
  const currentEmails = notificationChannels.value.emails || [];
  const emailsMatch = savedEmails.length === currentEmails.length &&
    savedEmails.every((email, index) => email === currentEmails[index]);

  if ((savedSettings.notificationChannels?.emailEnabled || false) !== (notificationChannels.value.emailEnabled || false) ||
    !emailsMatch ||
    Number(savedSettings.delayThreshold ?? 15) !== Number(delayThreshold.value ?? 15)) {
    throw new Error('General settings were not saved');
  }
};

const verifySavedStations = async () => {
  const res = await apiFetch('/api/stations');
  const savedStations = await readApiJson(res, 'Verifying station settings');
  if (!res.ok || !Array.isArray(savedStations)) {
    throw new Error(savedStations.message || 'Could not verify saved stations');
  }

  if (savedStations.length !== stations.value.length) {
    throw new Error('Station settings were not saved');
  }
};

const saveSettings = async () => {
  try {
    if (!dirtyGeneralSettings.value &&
      !dirtyHardwareSettings.value &&
      !dirtyStationSettings.value) {
      alert('No configuration changes to save');
      return;
    }

    const hardwareSaveTargets = hardware.value
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => item.type === 'camera')
      .map(({ item, index }) => {
        const livefeedConfig = normalizeLivefeedConfig(item.livefeed || livefeed.value, item.name);
        delete livefeedConfig.referenceImage;

        return { item, index, livefeedConfig };
      });

    if (dirtyGeneralSettings.value) {
      const settingsPayload = {
        notificationChannels: notificationChannels.value,
        delayThreshold: delayThreshold.value,
        livefeed: {
          dwellSeconds: Math.max(1, Number(livefeed.value.dwellSeconds) || 30),
          zones: livefeed.value.zones.slice(0, 1).map((zone, index) => normalizeZone(zone, index))
        }
      };

      const settingsRes = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsPayload)
      });
      const settingsData = await readApiJson(settingsRes, 'Saving general settings');
      if (!settingsRes.ok) throw new Error(settingsData.message || 'Cannot save general settings');
      await verifySavedGeneralSettings();
    }

    if (dirtyHardwareSettings.value) {
      await Promise.all(
        hardwareSaveTargets.map(async ({ item, index, livefeedConfig }) => {
          const res = await apiFetch(`/api/settings/hardware/${getHardwareApiId(item, index)}/livefeed`, {
            method: 'PUT',
            body: JSON.stringify(livefeedConfig)
          });
          const data = await readApiJson(res, `Saving livefeed grid for ${item.name}`);
          if (!res.ok) throw new Error(data.message || `Cannot save livefeed grid for ${item.name}`);
          return data;
        })
      );
      await verifySavedHardwareConfigs(hardwareSaveTargets);
    }

    if (dirtyStationSettings.value) {
      const stationsRes = await apiFetch('/api/stations-bulk', {
        method: 'PUT',
        body: JSON.stringify({ stations: stations.value })
      });
      const stationsData = await readApiJson(stationsRes, 'Saving station settings');
      if (!stationsRes.ok) throw new Error(stationsData.message || 'Cannot save stations');
      await verifySavedStations();
    }

    alert('Settings saved and verified successfully');
    await reloadAllData();
  } catch (error) {
    console.error(error);
    alert(error.message || 'Unable to save settings');
  }
};

const discardChanges = async () => {
  await reloadAllData(); 
};

// State Change Tracking
const markAsUnsaved = (type) => {
  if (isFetching) return;

  if (type === 'stations') dirtyStationSettings.value = true;
  if (type === 'general') dirtyGeneralSettings.value = true;
  if (type === 'hardware') dirtyHardwareSettings.value = true;
  hasUnsavedChanges.value = true;
};

watch(stations, () => markAsUnsaved('stations'), { deep: true });
watch(notificationChannels, () => markAsUnsaved('general'), { deep: true });
watch(delayThreshold, () => markAsUnsaved('general'));
watch(hardware, () => markAsUnsaved('hardware'), { deep: true });


// ─────────────────────────────────────────────────────────
// Station Functions
// ─────────────────────────────────────────────────────────
const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = {
    name: '', desc: '', capacity: 100, waitingPassengers: 0, location: { ...defaultStationLocation }
  };
  selectedLocation.value = { ...formData.value.location };
  isModalOpen.value = true;
  nextTick(initModalMap);
};

const openEditModal = (station) => {
  modalMode.value = 'edit';
  editStationId.value = station._id;
  formData.value = {
    name: station.name,
    desc: station.desc || station.description || '',
    capacity: station.capacity ?? 100,
    waitingPassengers: station.waitingPassengers ?? 0,
    location: station.location && station.location.lat != null && station.location.lng != null
      ? { ...station.location }
      : { ...defaultStationLocation }
  };
  selectedLocation.value = { ...formData.value.location };
  isModalOpen.value = true;
  nextTick(initModalMap);
};

const closeModal = () => {
  isModalOpen.value = false;
  destroyModalMap();
};

const confirmModal = () => {
  if (!formData.value.name) return;

  if (modalMode.value === 'add') {
    stations.value.push({
      _id: `pending-${Date.now()}`,
      stationId: 'ST-' + Date.now(),
      name: formData.value.name,
      desc: formData.value.desc,
      capacity: formData.value.capacity,
      waitingPassengers: formData.value.waitingPassengers ?? 0,
      status: 'normal',
      zone: formData.value.zone || 'Unknown',
      location: formData.value.location || { lat: 0, lng: 0 },
      incomingBuses: 'N/A'
    });
  } else {
    const index = stations.value.findIndex((station) => station._id === editStationId.value);
    if (index !== -1) {
      stations.value[index] = {
        ...stations.value[index],
        name: formData.value.name,
        desc: formData.value.desc,
        capacity: formData.value.capacity,
        location: formData.value.location || stations.value[index].location
      };
    }
  }
  closeModal();
};

const deleteStation = (id) => {
  if (!confirm('Delete this station?')) return;
  stations.value = stations.value.filter((station) => station._id !== id);
};


// ─────────────────────────────────────────────────────────
// Notification Channel Functions
// ─────────────────────────────────────────────────────────
const openNotificationModal = () => {
  newChannelValue.value = '';
  isNotificationModalOpen.value = true;
};

const closeNotificationModal = () => {
  isNotificationModalOpen.value = false;
  newChannelValue.value = '';
};

const addNotificationChannel = () => {
  const value = newChannelValue.value.trim();
  if (!value) {
    alert('Please enter a value');
    return;
  }
  if (notificationChannels.value.emails.includes(value)) {
    alert('This email already exists');
    return;
  }
  notificationChannels.value.emails.push(value);
  closeNotificationModal();
};

const removeEmail = (index) => {
  notificationChannels.value.emails.splice(index, 1);
};


// ─────────────────────────────────────────────────────────
// Hardware Modal
// ─────────────────────────────────────────────────────────
const getHardwareApiId = (hw, index) => {
  const mongoId = typeof hw?._id === 'string' ? hw._id : hw?._id?.$oid;
  const id = mongoId || hw?.deviceId || index;
  return encodeURIComponent(String(id));
};

const toHardwareFormData = (hw = {}) => ({
  _id: hw._id || '',
  deviceId: hw.deviceId || '',
  name: hw.name || '',
  type: hw.type || 'sensor',
  ip: hw.ip || '',
  rtspUrl: hw.rtspUrl || '',
  fw: hw.fw || '',
  status: hw.status || 'offline',
  livefeed: hw.livefeed
});

const openAddHardwareModal = () => {
  hardwareModalMode.value = 'add';
  hardwareEditIndex.value = -1;
  hardwareFormData.value = { _id: '', deviceId: '', name: '', type: 'camera', ip: '', rtspUrl: '', fw: '', status: 'offline', livefeed: undefined };
  isHardwareModalOpen.value = true;
};

const openEditHardwareModal = (index) => {
  hardwareModalMode.value = 'edit';
  hardwareEditIndex.value = index;
  const hw = hardware.value[index];
  hardwareFormData.value = toHardwareFormData(hw);
  isHardwareModalOpen.value = true;
};

const closeHardwareModal = () => { isHardwareModalOpen.value = false; };

const confirmHardwareModal = async () => {
  if (!hardwareFormData.value.name) return;
  if (hardwareFormData.value.type === 'camera' && hardwareFormData.value.status === 'online' && !hardwareFormData.value.rtspUrl.trim()) {
    alert('RTSP URL is required before a camera can be set online');
    return;
  }
  const existingHardware = hardware.value[hardwareEditIndex.value] || {};
  const hardwareLivefeed = hardwareFormData.value.type === 'camera'
    ? normalizeLivefeedConfig(
      hardwareFormData.value.livefeed || existingHardware.livefeed || livefeed.value,
      hardwareFormData.value.name
    )
    : undefined;
  const payload = {
    deviceId: hardwareFormData.value.deviceId || `hw-${Date.now()}`,
    name: hardwareFormData.value.name,
    type: hardwareFormData.value.type,
    ip: hardwareFormData.value.ip,
    status: hardwareFormData.value.status,
    rtspUrl: hardwareFormData.value.rtspUrl.trim(),
    fw: hardwareFormData.value.fw,
    details: [
      hardwareFormData.value.fw ? `FW ${hardwareFormData.value.fw}` : '',
      hardwareFormData.value.ip,
      hardwareFormData.value.type === 'camera' && hardwareFormData.value.rtspUrl.trim() ? 'RTSP configured' : ''
    ].filter(Boolean).join(' • '),
    livefeed: hardwareLivefeed
  };

  try {
    const isAdd = hardwareModalMode.value === 'add';
    const endpoint = isAdd
      ? '/api/settings/hardware'
      : `/api/settings/hardware/${getHardwareApiId(hardwareFormData.value, hardwareEditIndex.value)}`;
    const res = await apiFetch(endpoint, {
      method: isAdd ? 'POST' : 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cannot save hardware');

    hardware.value = Array.isArray(data.settings?.hardware) ? data.settings.hardware : hardware.value;
    ensureHardwareLivefeedConfigs(livefeed.value);
    closeHardwareModal();
  } catch (error) {
    console.error(error);
    alert('Unable to save hardware');
  }
};

const deleteHardware = async (hw, index) => {
  if (!confirm('Delete this hardware?')) return;
  try {
    const res = await apiFetch(`/api/settings/hardware/${getHardwareApiId(hw, index)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cannot delete hardware');

    hardware.value = Array.isArray(data.settings?.hardware) ? data.settings.hardware : [];
    ensureHardwareLivefeedConfigs(livefeed.value);
  } catch (error) {
    console.error(error);
    alert(error.message || 'Unable to delete hardware');
  }
};

// ─────────────────────────────────────────────────────────
// Auth / Dropdown & Map Cleanup
// ─────────────────────────────────────────────────────────
const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  router.push('/');
};

const destroyModalMap = () => {
  if (modalMap.value) {
    modalMap.value.off();
    modalMap.value.remove();
    modalMap.value = null;
    modalMarker = null;
  }
};

const initModalMap = () => {
  const mapElement = document.getElementById('station-modal-map');
  if (!mapElement) return;

  if (modalMap.value) {
    destroyModalMap();
  }

  const initialLocation = formData.value.location || defaultStationLocation;
  modalMap.value = L.map(mapElement).setView([initialLocation.lat, initialLocation.lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(modalMap.value);

  modalMarker = L.marker([initialLocation.lat, initialLocation.lng]).addTo(modalMap.value);
  modalMarker.bindPopup('Selected station location').openPopup();

  modalMap.value.on('click', (e) => {
    selectedLocation.value = { lat: e.latlng.lat, lng: e.latlng.lng };
    formData.value.location = { ...selectedLocation.value };

    if (modalMarker) {
      modalMarker.setLatLng(e.latlng).openPopup();
    } else {
      modalMarker = L.marker(e.latlng).addTo(modalMap.value);
      modalMarker.bindPopup('Selected station location').openPopup();
    }
  });
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  reloadAllData(); 
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  window.removeEventListener('pointermove', moveZoneEditorPointer);
  destroyModalMap();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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

.logo h1 {
  font-size: 26px;
  color: #d72660;
  font-weight: 700;
}

.logo span {
  color: #444;
}

.logo p {
  margin-top: 3px;
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
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
  font-size: 16px;
  font-weight: 500;
}

.menu-item:hover {
  background: #fff0f5;
  color: #d72660;
  font-weight: 600;
}

.menu-item i {
  font-size: 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #d72660;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.user-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.user-card p {
  font-size: 12px;
  color: #888;
}

/* ===== TOPBAR ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 26px;
  background: #f7f7fa;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
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

.search-bar i {
  color: #6b7280;
  font-size: 18px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  color: #4b5563;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
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
  transition: 0.2s;
}

.icon-btn:hover {
  color: #1f2937;
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

.lang-switcher span {
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
  transition: background .2s;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.logout-item {
  color: #d72660;
}

/* ===== SETTINGS CONTENT ===== */
.settings-page {
  padding: 0 26px 40px 26px;
}

.page-title {
  margin-bottom: 24px;
}

.page-title h2 {
  font-size: 26px;
  color: #111827;
  font-weight: 800;
}

.page-title p {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.settings-grid {
  display: grid;
  gap: 24px;
  margin-bottom: 24px;
}

.top-grid {
  grid-template-columns: 2fr 1fr;
}

.bottom-grid {
  grid-template-columns: 1fr 2fr;
}

.setting-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #f0f0f0;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title-card {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title-card i {
  font-size: 20px;
  color: #4b5563;
}

.header-title-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.btn-dark {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

/* Threshold */
.threshold-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.threshold-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: 0.2s;
}

.threshold-item:hover {
  background: #f3f4f6;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-info strong {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.item-info span {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.progress-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar-bg {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.red {
  background: #dc2626;
}

.progress-fill.green {
  background: #10b981;
}

.progress-fill.yellow {
  background: #f59e0b;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
}

.progress-labels .current {
  color: #4b5563;
}

.progress-labels .limit-label {
  color: #9ca3af;
}

.text-red {
  color: #dc2626 !important;
}

.limit-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  width: 80px;
}

.limit-box span {
  color: #6b7280;
  font-size: 13px;
}

.limit-box strong {
  font-size: 16px;
  font-weight: 700;
}

.item-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.edit-icon {
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.edit-icon:hover {
  color: #111827;
}

.delete-icon {
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.delete-icon:hover {
  color: #d72660;
}

/* Notification */
.channel-section {
  margin-bottom: 24px;
}

.channel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.channel-row strong {
  font-size: 12px;
  color: #4b5563;
  font-weight: 700;
  letter-spacing: .5px;
}

.channel-desc {
  font-size: 14px;
  color: #111827;
  margin-bottom: 8px;
}

.channel-desc.empty {
  color: #9ca3af;
}

.add-link {
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #e5e7eb;
  border-radius: 24px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: .4s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked+.slider {
  background: #0f172a;
}

input:checked+.slider:before {
  transform: translateX(20px);
}

.queue-threshold-section {
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
}

.queue-threshold-section strong {
  font-size: 12px;
  color: #dc2626;
  display: block;
  margin-bottom: 12px;
  font-weight: 700;
}

.range-slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.range-slider {
  flex: 1;
  accent-color: #d72660;
}

.range-value {
  font-weight: bold;
  font-size: 14px;
}

.range-desc {
  font-size: 12px;
}

/* Hardware */
.hardware-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hw-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hw-icon {
  font-size: 24px;
}

.hw-icon.online {
  color: #10b981;
}

.hw-icon.offline {
  color: #dc2626;
}

.hw-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.hw-info strong {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.hw-info span {
  font-size: 12px;
  color: #6b7280;
}

.hw-rtsp {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hw-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

/* Action Bar Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Action Bar */
.action-bar {
  position: sticky;
  bottom: 0;
  margin-top: auto; 
  background: #fff;
  padding: 16px 26px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}

.action-right {
  display: flex;
  gap: 12px;
}

.btn-outline {
  background: #fff;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #4b5563;
  font-family: 'Inter', sans-serif;
  transition: 0.2s;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-dark-blue {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: 0.2s;
}

.btn-dark-blue:hover {
  background: #1e293b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 400px;
  border-radius: 18px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  color: #111827;
  font-weight: 700;
}

.close-btn {
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover {
  color: #dc2626;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0f172a;
}

.livefeed-config {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.livefeed-toolbar {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group.compact {
  max-width: 220px;
}

.image-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #0f172a;
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.image-upload-btn input {
  display: none;
}

.btn-outline.small {
  height: 40px;
  padding: 0 12px;
  font-size: 12px;
}

.zone-editor {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background:
    linear-gradient(rgba(15, 23, 42, .08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, .08) 1px, transparent 1px),
    #eef2f7;
  background-size: 10% 10%;
  overflow: hidden;
  touch-action: none;
}

.zone-reference-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #020617;
  user-select: none;
  pointer-events: none;
}

.zone-reference-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
}

.zone-reference-empty i {
  font-size: 34px;
  color: #9ca3af;
}

.zone-reference-empty.standalone {
  position: static;
  min-height: 140px;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
}

.zone-editor-box {
  position: absolute;
  min-width: 28px;
  min-height: 28px;
  border: 2px dashed #16a34a;
  border-radius: 5px;
  cursor: move;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, .45);
}

.zone-editor-box-disabled {
  opacity: .42;
}

.zone-editor-box span {
  position: absolute;
  left: 8px;
  top: 8px;
  max-width: calc(100% - 16px);
  padding: 4px 8px;
  border-radius: 5px;
  background: rgba(15, 23, 42, .82);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
}

.zone-resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 1px 4px rgba(15, 23, 42, .4);
}

.zone-resize-nw,
.zone-resize-se {
  cursor: nwse-resize;
}

.zone-resize-ne,
.zone-resize-sw {
  cursor: nesw-resize;
}

.zone-resize-n,
.zone-resize-s {
  cursor: ns-resize;
}

.zone-resize-e,
.zone-resize-w {
  cursor: ew-resize;
}

.zone-resize-nw { left: -7px; top: -7px; }
.zone-resize-n { left: calc(50% - 6px); top: -7px; }
.zone-resize-ne { right: -7px; top: -7px; }
.zone-resize-e { right: -7px; top: calc(50% - 6px); }
.zone-resize-se { right: -7px; bottom: -7px; }
.zone-resize-s { left: calc(50% - 6px); bottom: -7px; }
.zone-resize-sw { left: -7px; bottom: -7px; }
.zone-resize-w { left: -7px; top: calc(50% - 6px); }

.zone-config-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.zone-config-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.zone-config-head input[type="text"],
.zone-grid-inputs input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
}

.zone-enabled {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.zone-grid-inputs {
  display: grid;
  grid-template-columns: repeat(5, minmax(70px, 1fr));
  gap: 10px;
}

.zone-grid-inputs label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #6b7280;
  font-size: 11px;
  font-weight: 800;
}

.zone-grid-inputs input[type="color"] {
  width: 100%;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
}

.zone-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 6;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background:
    linear-gradient(rgba(15, 23, 42, .08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, .08) 1px, transparent 1px),
    #fff;
  background-size: 10% 25%;
  overflow: hidden;
}

.zone-preview-box {
  position: absolute;
  border: 2px dashed #16a34a;
  border-radius: 4px;
}

.modal-map {
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 10px;
  border: 1px solid #e5e7eb;
}

.map-help {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
}

.location-coordinates {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 13px;
  color: #374151;
}

.modal-actions {
  padding: 16px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
}

.tag-item i:hover {
  color: #d72660;
  cursor: pointer;
}
</style>
