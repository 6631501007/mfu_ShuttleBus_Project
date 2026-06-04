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
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title-card">
                <i class='bx bxs-group'></i>
                <h3>Station Thresholds</h3>
              </div>
              <button class="btn-dark" @click="openAddModal">Add Zone</button>
            </div>
            <div class="threshold-list">
              <div class="threshold-item" v-for="(zone, index) in zones" :key="index">
                <div class="item-info">
                  <strong>{{ zone.name }}</strong>
                  <span>{{ zone.desc }}</span>
                </div>
                <div class="progress-section">
                  <div class="progress-bar-bg">
                    <div class="progress-fill" :class="zone.color"
                      :style="{ width: getPercentage(zone.currentPassengers, zone.limit) + '%' }"></div>
                    <div v-if="zone.criticalPercent" class="progress-marker"
                      :style="{ left: zone.criticalPercent + '%' }"></div>
                  </div>
                  <div class="progress-labels">
                    <span class="current">CURRENT: {{ getPercentage(zone.currentPassengers, zone.limit) }}%</span>
                    <span v-if="zone.criticalPercent" class="text-red">CRITICAL: {{ zone.criticalPercent }}%</span>
                    <span v-else class="limit-label">LIMIT: {{ zone.limit }}</span>
                  </div>
                </div>
                <div class="limit-box">
                  <span>Limit:</span>
                  <strong>{{ zone.limit }}</strong>
                </div>
                <i class='bx bx-pencil edit-icon' @click="openEditModal(index)"></i>
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
                <label class="switch"><input type="checkbox" checked><span class="slider"></span></label>
              </div>
              <p class="channel-desc">admin-ops@busstop.com</p>
              <span class="add-link">+ Add recipient</span>
            </div>
            <div class="channel-section">
              <div class="channel-row">
                <strong>SMS / MOBILE</strong>
                <label class="switch"><input type="checkbox"><span class="slider"></span></label>
              </div>
              <p class="channel-desc empty">No active numbers</p>
              <span class="add-link"><i class='bx bx-mobile'></i> Register device</span>
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
              <div class="hw-item" v-for="(hw, index) in hardware" :key="index">
                <i :class="['bx', 'hw-icon', hw.status === 'online' ? 'bx-check-circle online' : 'bx-error-triangle offline']"></i>
                <div class="hw-info"><strong :class="hw.status === 'offline' ? 'text-red' : ''">{{ hw.name }}</strong><span>{{ hw.details }}</span></div>
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
          <button class="btn-outline">Discard Changes</button>
          <button class="btn-dark-blue">Save Configuration</button>
        </div>
      </div>
    </main>

    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? 'Add New Zone' : 'Edit Zone' }}</h3>
          <i class='bx bx-x close-btn' @click="closeModal"></i>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Station Name</label><input type="text" v-model="formData.name"
              placeholder="e.g. Station 10" /></div>
          <div class="form-group"><label>Description</label><input type="text" v-model="formData.desc"
              placeholder="e.g. Main Waiting Area" /></div>
          <div class="form-group"><label>Passenger Limit</label><input type="number" v-model="formData.limit"
              placeholder="Enter max limit" /></div>
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
          <div class="form-group"><label>Device Name</label><input type="text" v-model="hardwareFormData.name"
              placeholder="e.g. Sensor-Unit-001" /></div>
          <div class="form-group"><label>Device Type</label>
            <select v-model="hardwareFormData.type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 8px;">
              <option value="sensor">Sensor</option>
              <option value="camera">Camera</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group"><label>IP Address</label><input type="text" v-model="hardwareFormData.ip"
              placeholder="e.g. 192.168.1.100" /></div>
          <div class="form-group"><label>Firmware Version</label><input type="text" v-model="hardwareFormData.fw"
              placeholder="e.g. v2.4.1" /></div>
          <div class="form-group"><label>Status</label>
            <select v-model="hardwareFormData.status" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 8px;">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const isDropdownOpen = ref(false);
const delayThreshold = ref(15);
const language = ref('English');

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English';
};

const hardware = ref([
  { name: 'Sensor-Unit-4882', type: 'sensor', details: 'FW v2.4.1 • 192.168.1.42', ip: '192.168.1.42', fw: 'v2.4.1', status: 'online' },
  { name: 'CAM-STATION-009', type: 'camera', details: 'FW v3.1.0 • 192.168.1.109', ip: '192.168.1.109', fw: 'v3.1.0', status: 'online' },
  { name: 'Sensor-Unit-2114', type: 'sensor', details: 'Disconnected • Last seen 2h ago', ip: '192.168.1.50', fw: 'v2.3.8', status: 'offline' }
]);

const isHardwareModalOpen = ref(false);
const hardwareModalMode = ref('add');
const hardwareEditIndex = ref(-1);
const hardwareFormData = ref({ name: '', type: 'sensor', ip: '', fw: '', status: 'online' });

const openAddHardwareModal = () => {
  hardwareModalMode.value = 'add';
  hardwareFormData.value = { name: '', type: 'sensor', ip: '', fw: '', status: 'online' };
  isHardwareModalOpen.value = true;
};

const openEditHardwareModal = (index) => {
  hardwareModalMode.value = 'edit';
  hardwareEditIndex.value = index;
  const hw = hardware.value[index];
  hardwareFormData.value = { name: hw.name, type: hw.type, ip: hw.ip, fw: hw.fw, status: hw.status };
  isHardwareModalOpen.value = true;
};

const closeHardwareModal = () => {
  isHardwareModalOpen.value = false;
};

const confirmHardwareModal = () => {
  if (!hardwareFormData.value.name) return;
  if (hardwareModalMode.value === 'add') {
    hardware.value.push({
      name: hardwareFormData.value.name,
      type: hardwareFormData.value.type,
      details: `FW ${hardwareFormData.value.fw} • ${hardwareFormData.value.ip}`,
      ip: hardwareFormData.value.ip,
      fw: hardwareFormData.value.fw,
      status: hardwareFormData.value.status
    });
  } else {
    const hw = hardware.value[hardwareEditIndex.value];
    hw.name = hardwareFormData.value.name;
    hw.type = hardwareFormData.value.type;
    hw.ip = hardwareFormData.value.ip;
    hw.fw = hardwareFormData.value.fw;
    hw.status = hardwareFormData.value.status;
    hw.details = `FW ${hardwareFormData.value.fw} • ${hardwareFormData.value.ip}`;
  }
  closeHardwareModal();
};

const deleteHardware = (index) => {
  hardware.value.splice(index, 1);
};

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};
onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));

const zones = ref([
  { name: 'Station: 14 - M-square', desc: 'Red Zone Area', currentPassengers: 382, limit: 450, color: 'red', criticalPercent: 90 },
  { name: 'Station: 9 - Swimming pool', desc: 'Main Route Wait Area', currentPassengers: 50, limit: 120, color: 'blue', criticalPercent: null },
  { name: 'VIP Terminal', desc: 'Premium Lounge Area', currentPassengers: 51, limit: 75, color: 'yellow', criticalPercent: null }
]);

const getPercentage = (current, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
};

const isModalOpen = ref(false);
const modalMode = ref('add');
const editIndex = ref(-1);
const formData = ref({ name: '', desc: '', limit: 100 });

const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = { name: '', desc: '', limit: 100 };
  isModalOpen.value = true;
};

const openEditModal = (index) => {
  modalMode.value = 'edit';
  editIndex.value = index;
  const z = zones.value[index];
  formData.value = { name: z.name, desc: z.desc, limit: z.limit };
  isModalOpen.value = true;
};

const closeModal = () => { isModalOpen.value = false; };

const confirmModal = () => {
  if (!formData.value.name) return;
  if (modalMode.value === 'add') {
    zones.value.push({
      name: formData.value.name,
      desc: formData.value.desc,
      currentPassengers: 0,
      limit: formData.value.limit,
      color: 'blue',
      criticalPercent: null
    });
  } else {
    const z = zones.value[editIndex.value];
    z.name = formData.value.name;
    z.desc = formData.value.desc;
    z.limit = formData.value.limit;
  }
  closeModal();
};
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}
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

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
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

.progress-marker {
  position: absolute;
  top: -2px;
  height: 12px;
  width: 2px;
  background: #dc2626;
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
.badge-dark {
  background: #0f172a;
  color: white;
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: bold;
  letter-spacing: .5px;
}

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

.refresh-icon {
  color: #9ca3af;
  font-size: 20px;
  cursor: pointer;
}

.hw-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.edit-icon,
.add-icon {
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}

.edit-icon:hover,
.add-icon:hover {
  color: #d72660;
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
</style>