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
            <i class='bx bx-bell icon-btn'></i>
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
          <!-- ===== STATION THRESHOLDS (ใช้ Station API) ===== -->
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
                    <div class="progress-fill" :class="getProgressColor(station.waitingPassengers, station.capacity)"
                      :style="{ width: getPercentage(station.waitingPassengers, station.capacity) + '%' }"></div>
                  </div>
                  <div class="progress-labels">
                    <span class="current">CURRENT: {{ getPercentage(station.waitingPassengers, station.capacity)
                      }}%</span>
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

          <!-- ===== NOTIFICATION CHANNELS ===== -->
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
            <div class="channel-section">
              <div class="channel-row">
                <strong>SMS / MOBILE</strong>
                <label class="switch"><input type="checkbox" v-model="notificationChannels.smsEnabled"><span
                    class="slider"></span></label>
              </div>
              <p class="channel-desc" :class="{ empty: notificationChannels.mobiles.length === 0 }">
                {{ notificationChannels.mobiles.length ? notificationChannels.mobiles.join(', ') : 'No active numbers'
                }}
              </p>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                <span v-for="(mobile, idx) in notificationChannels.mobiles" :key="idx" class="tag-item">
                  {{ mobile }}
                  <i class='bx bx-x' @click="removeMobile(idx)" style="cursor:pointer; margin-left:4px;"></i>
                </span>
              </div>
              <span class="add-link" @click="openNotificationModal('mobile')"><i class='bx bx-mobile'></i> Register device</span>
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
          <!-- ===== CONNECTED HARDWARE ===== -->
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bx-broadcast'></i>
                <h3>Connected Hardware</h3>
              </div>
              <button class="btn-dark" @click="openAddHardwareModal">+ Add Hardware</button>
            </div>
            <div class="hardware-list">
              <div class="hw-item" v-for="(hw, index) in hardware" :key="index">
                <i
                  :class="['bx', 'hw-icon', hw.status === 'online' ? 'bx-check-circle online' : 'bx-error-triangle offline']"></i>
                <div class="hw-info">
                  <strong :class="hw.status === 'offline' ? 'text-red' : ''">{{ hw.name }}</strong>
                  <span>{{ hw.details }}</span>
                </div>
                <div class="hw-actions">
                  <i class='bx bx-pencil edit-icon' @click="openEditHardwareModal(index)" title="Edit"></i>
                  <i class='bx bx-trash delete-icon' @click="deleteHardware(index)" title="Delete"></i>
                </div>
              </div>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      <div class="action-bar">
        <div class="action-right">
          <button class="btn-outline" @click="discardChanges">Discard Changes</button>
          <button class="btn-dark-blue" @click="saveSettings">Save Configuration</button>
        </div>
      </div>
    </main>

    <!-- ===== STATION MODAL (Add / Edit) ===== -->
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
        </div>
        <div class="modal-actions">
          <button class="btn-outline" @click="closeModal">Cancel</button>
          <button class="btn-dark-blue" @click="confirmModal">Confirm</button>
        </div>
      </div>
    </div>

    <!-- ===== HARDWARE MODAL ===== -->
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

    <!-- ===== NOTIFICATION CHANNEL MODAL ===== -->
    <div class="modal-overlay" v-if="isNotificationModalOpen" @click.self="closeNotificationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ notificationModalType === 'email' ? 'Add Email Recipient' : 'Add Mobile Number' }}</h3>
          <i class='bx bx-x close-btn' @click="closeNotificationModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ notificationModalType === 'email' ? 'Email Address' : 'Mobile Number' }}</label>
            <input 
              type="text" 
              v-model="newChannelValue" 
              :placeholder="notificationModalType === 'email' ? 'e.g. admin@example.com' : 'e.g. +66812345678'"
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ── UI state ──────────────────────────────────────────────
const isDropdownOpen = ref(false);
const language = ref('English');

// ── Settings (notification + hardware) ───────────────────
const delayThreshold = ref(15);
const notificationChannels = ref({
  emailEnabled: false,
  smsEnabled: false,
  emails: [],
  mobiles: []
});
const hardware = ref([]);

// ── Stations (Station Thresholds) ─────────────────────────
const stations = ref([]);

// ── Station Modal ─────────────────────────────────────────
const isModalOpen = ref(false);
const modalMode = ref('add');           // 'add' | 'edit'
const editStationId = ref(null);
const formData = ref({ name: '', desc: '', capacity: 100, waitingPassengers: 0 });

// ── Notification Channel Modal ───────────────────────────
const isNotificationModalOpen = ref(false);
const notificationModalType = ref('email');  // 'email' | 'mobile'
const newChannelValue = ref('');

// ── Hardware Modal ────────────────────────────────────────
const isHardwareModalOpen = ref(false);
const hardwareModalMode = ref('add');
const hardwareEditIndex = ref(-1);
const hardwareFormData = ref({ name: '', type: 'sensor', ip: '', fw: '', status: 'online' });

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

const getProgressColor = (current, capacity) => {
  const pct = getPercentage(current, capacity);
  if (pct >= 90) return 'red';
  if (pct >= 70) return 'yellow';
  return 'blue';
};

// ─────────────────────────────────────────────────────────
// Station API
// ─────────────────────────────────────────────────────────
const loadStations = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/stations');
    if (!res.ok) throw new Error('Cannot load stations');
    stations.value = await res.json();
  } catch (error) {
    console.error(error);
  }
};

const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = { name: '', desc: '', capacity: 100, waitingPassengers: 0 };
  isModalOpen.value = true;
};

const openEditModal = (station) => {
  modalMode.value = 'edit';
  editStationId.value = station._id;
  formData.value = {
    name: station.name,
    desc: station.desc || station.description || '',
    capacity: station.capacity ?? 100,
    waitingPassengers: station.waitingPassengers ?? 0
  };
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; };

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
        capacity: formData.value.capacity
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
// Settings API (notification + hardware)
// ─────────────────────────────────────────────────────────
const loadSettings = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/settings');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cannot load settings');
    notificationChannels.value = data.notificationChannels || {
      emailEnabled: false, smsEnabled: false, emails: [], mobiles: []
    };
    delayThreshold.value = data.delayThreshold ?? 15;
    hardware.value = data.hardware || [];
  } catch (error) {
    console.error(error);
  }
};

const saveSettings = async () => {
  try {
    const settingsPayload = {
      notificationChannels: notificationChannels.value,
      delayThreshold: delayThreshold.value,
      hardware: hardware.value
    };

    const settingsRes = await fetch('http://localhost:3000/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsPayload)
    });
    const settingsData = await settingsRes.json();
    if (!settingsRes.ok) throw new Error(settingsData.message || 'Cannot save settings');

    const stationsRes = await fetch('http://localhost:3000/api/stations-bulk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stations: stations.value })
    });
    const stationsData = await stationsRes.json();
    if (!stationsRes.ok) throw new Error(stationsData.message || 'Cannot save stations');

    alert('Settings saved successfully');
    await loadSettings();
    await loadStations();
  } catch (error) {
    console.error(error);
    alert('Unable to save settings');
  }
};

// ─────────────────────────────────────────────────────────
// Notification Channel Functions
// ─────────────────────────────────────────────────────────
const openNotificationModal = (type) => {
  notificationModalType.value = type;
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

  if (notificationModalType.value === 'email') {
    if (notificationChannels.value.emails.includes(value)) {
      alert('This email already exists');
      return;
    }
    notificationChannels.value.emails.push(value);
  } else if (notificationModalType.value === 'mobile') {
    if (notificationChannels.value.mobiles.includes(value)) {
      alert('This mobile number already exists');
      return;
    }
    notificationChannels.value.mobiles.push(value);
  }

  closeNotificationModal();
};

const removeEmail = (index) => {
  notificationChannels.value.emails.splice(index, 1);
};

const removeMobile = (index) => {
  notificationChannels.value.mobiles.splice(index, 1);
};

const discardChanges = () => {
  loadSettings();
  loadStations();
};

// ─────────────────────────────────────────────────────────
// Hardware Modal
// ─────────────────────────────────────────────────────────
const openAddHardwareModal = () => {
  hardwareModalMode.value = 'add';
  hardwareFormData.value = { name: '', type: 'sensor', ip: '', fw: '', status: 'online' };
  isHardwareModalOpen.value = true;
};

const openEditHardwareModal = (index) => {
  hardwareModalMode.value = 'edit';
  hardwareEditIndex.value = index;
  const hw = hardware.value[index];
  hardwareFormData.value = { name: hw.name, type: hw.type || 'sensor', ip: hw.ip || '', fw: hw.fw || '', status: hw.status };
  isHardwareModalOpen.value = true;
};

const closeHardwareModal = () => { isHardwareModalOpen.value = false; };

const confirmHardwareModal = () => {
  if (!hardwareFormData.value.name) return;
  const payload = {
    name: hardwareFormData.value.name,
    type: hardwareFormData.value.type,
    ip: hardwareFormData.value.ip,
    status: hardwareFormData.value.status,
    fw: hardwareFormData.value.fw,
    details: `FW ${hardwareFormData.value.fw} • ${hardwareFormData.value.ip}`
  };

  if (hardwareModalMode.value === 'add') {
    hardware.value.push(payload);
  } else if (hardwareEditIndex.value >= 0) {
    hardware.value[hardwareEditIndex.value] = {
      ...hardware.value[hardwareEditIndex.value],
      ...payload
    };
  }

  closeHardwareModal();
};

const deleteHardware = (index) => {
  if (!confirm('Delete this hardware?')) return;
  hardware.value.splice(index, 1);
};

// ─────────────────────────────────────────────────────────
// Auth / Dropdown
// ─────────────────────────────────────────────────────────
const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  router.push('/');
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  loadStations();
  loadSettings();
});

onUnmounted(() => document.removeEventListener('click', closeDropdown));
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
  padding: 0 26px 100px 26px;
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

.progress-fill.blue {
  background: #3b82f6;
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

.hw-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

/* Action Bar */
.action-bar {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 16px 26px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
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

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: 'Inter', sans-serif;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #0f172a;
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