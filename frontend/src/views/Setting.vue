<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="brand">
        <h1 class="logo-title">Bus Stop</h1>
        <p class="logo-subtitle">PASSENGER INTELLIGENCE</p>
      </div>

      <nav class="nav-menu">
        <div class="nav-item">
          <i class='bx bxs-dashboard icon'></i> Dashboard
        </div>
        <div class="nav-item">
          <i class='bx bx-map-alt icon'></i> Map
        </div>
        <div class="nav-item">
          <i class='bx bx-history icon'></i> History
        </div>
        <div class="nav-item active">
          <i class='bx bx-cog icon'></i> Settings
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" placeholder="Search devices or zones..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
            <div class="lang-switcher">
              <i class='bx bx-globe'></i>
              <span>English</span>
              <i class='bx bx-chevron-down'></i>
            </div>
          </div>

          <div class="profile-dropdown-container">
            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">
              <i class='bx bxs-user'></i>
            </div>
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div class="dropdown-item"><i class='bx bx-user-circle'></i> Profile</div>
              <div class="dropdown-item"><i class='bx bx-transfer-alt'></i> Switch Accounts</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout-item"><i class='bx bx-log-out'></i> Log out</div>
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
              <div class="header-title">
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
                    <div 
                      class="progress-fill" 
                      :class="zone.color" 
                      :style="{ width: getPercentage(zone.currentPassengers, zone.limit) + '%' }"
                    ></div>
                    <div v-if="zone.criticalPercent" class="progress-marker" :style="{ left: zone.criticalPercent + '%' }"></div>
                  </div>
                  <div class="progress-labels">
                    <span class="current">CURRENT: {{ getPercentage(zone.currentPassengers, zone.limit) }}%</span>
                    <span v-if="zone.criticalPercent" class="critical text-red">CRITICAL: {{ zone.criticalPercent }}%</span>
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
              <div class="header-title">
                <i class='bx bx-bell'></i>
                <h3>Notification Channels</h3>
              </div>
            </div>

            <div class="channel-section">
              <div class="channel-row">
                <strong>EMAIL ALERTS</strong>
                <label class="switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </label>
              </div>
              <p class="channel-desc">admin-ops@busstop.com</p>
              <span class="add-link">+ Add recipient</span>
            </div>

            <div class="channel-section">
              <div class="channel-row">
                <strong>SMS / MOBILE</strong>
                <label class="switch">
                  <input type="checkbox">
                  <span class="slider"></span>
                </label>
              </div>
              <p class="channel-desc empty">No active numbers</p>
              <span class="add-link"><i class='bx bx-mobile'></i> Register device</span>
            </div>

            <div class="queue-threshold-section">
              <strong>Queue Delay Threshold</strong>
              <div class="range-slider-container">
                <input type="range" min="1" max="60" value="15" class="range-slider">
                <span class="range-value text-red">15m</span>
              </div>
              <p class="range-desc text-red">Trigger alert when wait time exceeds 15 minutes.</p>
            </div>
          </div>
        </div>

        <div class="settings-grid bottom-grid">
          <div class="setting-card">
            <div class="card-header">
              <div class="header-title">
                <i class='bx bx-broadcast'></i>
                <h3>Connected Hardware</h3>
              </div>
              <span class="badge dark">128 ONLINE</span>
            </div>

            <div class="hardware-list">
              <div class="hw-item">
                <i class='bx bx-check-circle hw-icon online'></i>
                <div class="hw-info">
                  <strong>Sensor-Unit-4882</strong>
                  <span>FW v2.4.1 • 192.168.1.42</span>
                </div>
              </div>
              <div class="hw-item">
                <i class='bx bx-check-circle hw-icon online'></i>
                <div class="hw-info">
                  <strong>CAM-STATION-009</strong>
                  <span>FW v3.1.0 • 192.168.1.109</span>
                </div>
              </div>
              <div class="hw-item">
                <i class='bx bx-error-triangle hw-icon offline'></i>
                <div class="hw-info text-red">
                  <strong>Sensor-Unit-2114</strong>
                  <span class="text-gray">Disconnected • Last seen 2h ago</span>
                </div>
                <i class='bx bx-refresh refresh-icon'></i>
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
          <div class="form-group">
            <label>Station Name</label>
            <input type="text" v-model="formData.name" placeholder="e.g. Station 10" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" v-model="formData.desc" placeholder="e.g. Main Waiting Area" />
          </div>
          <div class="form-group">
            <label>Passenger Limit</label>
            <input type="number" v-model="formData.limit" placeholder="Enter max limit" />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-outline" @click="closeModal">Cancel</button>
          <button class="btn-dark-blue" @click="confirmModal">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- Dropdown Profile ---
const isDropdownOpen = ref(false);
const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));

// --- Data โซนสถานี ---
const zones = ref([
  {
    name: 'Station: 14 - M-square',
    desc: 'Red Zone Area',
    currentPassengers: 382, // 85% of 450
    limit: 450,
    color: 'red',
    criticalPercent: 90
  },
  {
    name: 'Station 9',
    desc: 'Main Route Wait Area',
    currentPassengers: 50, // ~42% of 120
    limit: 120,
    color: 'blue',
    criticalPercent: null
  },
  {
    name: 'VIP Terminal',
    desc: 'Premium Lounge Area',
    currentPassengers: 51, // ~68% of 75
    limit: 75,
    color: 'yellow',
    criticalPercent: null
  }
]);

// คำนวณเปอร์เซ็นต์
const getPercentage = (current, limit) => {
  if (!limit || limit <= 0) return 0;
  const pct = Math.round((current / limit) * 100);
  return pct > 100 ? 100 : pct; // ไม่ให้เกิน 100% เวลาแสดงผล
};

// --- จัดการ Modal (Pop-up) ---
const isModalOpen = ref(false);
const modalMode = ref('add'); // 'add' | 'edit'
const editIndex = ref(-1);

const formData = ref({
  name: '',
  desc: '',
  limit: 100
});

const openAddModal = () => {
  modalMode.value = 'add';
  formData.value = { name: '', desc: '', limit: 100 };
  isModalOpen.value = true;
};

const openEditModal = (index) => {
  modalMode.value = 'edit';
  editIndex.value = index;
  const targetZone = zones.value[index];
  formData.value = { 
    name: targetZone.name, 
    desc: targetZone.desc, 
    limit: targetZone.limit 
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmModal = () => {
  if (!formData.value.name) return; // ดักไม่ให้ชื่อว่าง

  if (modalMode.value === 'add') {
    zones.value.push({
      name: formData.value.name,
      desc: formData.value.desc,
      currentPassengers: 0, // เริ่มต้นด้วย 0 คน
      limit: formData.value.limit,
      color: 'blue', // สีเริ่มต้นสำหรับโซนใหม่
      criticalPercent: null
    });
  } else if (modalMode.value === 'edit') {
    const targetZone = zones.value[editIndex.value];
    targetZone.name = formData.value.name;
    targetZone.desc = formData.value.desc;
    targetZone.limit = formData.value.limit;
  }
  
  closeModal();
};
</script>

<style scoped>
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

* { box-sizing: border-box; margin: 0; padding: 0; }

.app-container {
  display: flex; height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f9; color: #333; overflow: hidden;
}

/* Sidebar */
.sidebar { width: 260px; background-color: #f8fafd; border-right: 1px solid #e1e5eb; display: flex; flex-direction: column; padding: 20px 0; }
.brand { padding: 0 24px 30px; }
.logo-title { color: #b91c1c; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
.logo-subtitle { font-size: 10px; color: #6b7280; letter-spacing: 1px; }
.nav-menu { flex: 1; }
.nav-item { padding: 12px 24px; margin: 4px 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; color: #4b5563; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
.nav-item .icon { font-size: 20px; }
.nav-item:hover { background-color: #fce7f3; color: #b91c1c; }
.nav-item.active { background-color: #b91c1c; color: white; }

.text-red { color: #dc2626 !important; }
.text-gray { color: #6b7280 !important; }

/* Main Content & Header */
.main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; position: relative; }
.top-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; }
.search-bar { background-color: #e5e7eb; padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px; width: 300px; }
.search-bar i { color: #6b7280; font-size: 18px; }
.search-bar input { border: none; background: transparent; outline: none; width: 100%; color: #4b5563; }
.header-right { display: flex; align-items: center; gap: 20px; }
.action-icons { display: flex; gap: 16px; align-items: center; }
.icon-btn { cursor: pointer; font-size: 22px; color: #6b7280; transition: transform 0.2s; }
.icon-btn:hover { transform: scale(1.1); color: #1f2937; }
.lang-switcher { display: flex; align-items: center; gap: 6px; border: 2px solid #1f2937; border-radius: 20px; padding: 4px 12px; cursor: pointer; font-weight: 500; color: #1f2937; background-color: white; transition: all 0.2s; margin-left: 8px; }
.lang-switcher i.bx-globe { font-size: 18px; }
.profile-dropdown-container { position: relative; margin-left: 8px; }
.profile-circle { width: 40px; height: 40px; background-color: #e5e7eb; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 20px; color: #4b5563; transition: all 0.2s; }
.profile-circle:hover { color: #b91c1c; background-color: #fce7f3; }
.dropdown-menu { position: absolute; top: 50px; right: 0; background-color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; width: 200px; overflow: hidden; z-index: 100; border: 1px solid #f3f4f6; }
.dropdown-item { padding: 12px 16px; font-size: 14px; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 10px; }
.dropdown-item:hover { background-color: #f3f4f6; color: #b91c1c; }
.dropdown-divider { height: 1px; background-color: #e5e7eb; }
.logout-item { color: #dc2626; }

/* Settings Page */
.settings-page { padding: 0 32px 100px 32px; max-width: 1400px; }
.page-title { margin-bottom: 24px; }
.page-title h2 { font-size: 26px; color: #111827; font-weight: 800; }
.page-title p { color: #6b7280; font-size: 14px; margin-top: 4px; }
.settings-grid { display: grid; gap: 24px; margin-bottom: 24px; }
.top-grid { grid-template-columns: 2fr 1fr; }
.bottom-grid { grid-template-columns: 1fr 2fr; }
.setting-card { background-color: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 24px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header-title { display: flex; align-items: center; gap: 10px; color: #111827; }
.header-title i { font-size: 20px; color: #4b5563; }
.btn-dark { background-color: #0f172a; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-dark:hover { background-color: #1e293b; }

/* Threshold List */
.threshold-list { display: flex; flex-direction: column; gap: 12px; }
.threshold-item { background-color: #f9fafb; border-radius: 8px; padding: 16px; display: flex; align-items: center; gap: 20px; transition: all 0.2s; }
.threshold-item:hover { background-color: #f3f4f6; }
.item-info { flex: 1; display: flex; flex-direction: column; }
.item-info strong { font-size: 14px; color: #111827; }
.item-info span { font-size: 12px; color: #6b7280; margin-top: 2px; }
.progress-section { flex: 2; display: flex; flex-direction: column; gap: 6px; }
.progress-bar-bg { height: 8px; background-color: #e5e7eb; border-radius: 4px; position: relative; }
.progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s ease; }
.progress-fill.red { background-color: #dc2626; }
.progress-fill.blue { background-color: #3b82f6; }
.progress-fill.yellow { background-color: #f59e0b; }
.progress-marker { position: absolute; top: -2px; height: 12px; width: 2px; background-color: #dc2626; }
.progress-labels { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; }
.progress-labels .current { color: #4b5563; }
.progress-labels .limit-label { color: #9ca3af; }
.limit-box { display: flex; align-items: center; gap: 8px; font-size: 14px; width: 80px; }
.limit-box span { color: #6b7280; }
.limit-box strong { font-size: 16px; }
.edit-icon { color: #9ca3af; font-size: 20px; cursor: pointer; transition: 0.2s; }
.edit-icon:hover { color: #111827; transform: scale(1.1); }

/* Switch & Hardware */
.channel-section { margin-bottom: 24px; }
.channel-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.channel-row strong { font-size: 12px; color: #4b5563; }
.channel-desc { font-size: 14px; color: #111827; margin-bottom: 8px; }
.channel-desc.empty { color: #9ca3af; }
.add-link { font-size: 13px; color: #4b5563; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 4px; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #e5e7eb; border-radius: 24px; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: .4s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
input:checked + .slider { background-color: #0f172a; }
input:checked + .slider:before { transform: translateX(20px); }
.queue-threshold-section { padding-top: 16px; border-top: 1px dashed #e5e7eb; }
.queue-threshold-section strong { font-size: 12px; color: #dc2626; display: block; margin-bottom: 12px; }
.range-slider-container { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
.range-slider { flex: 1; accent-color: #dc2626; }
.range-value { font-weight: bold; font-size: 14px; }
.badge.dark { background-color: #0f172a; color: white; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.hardware-list { display: flex; flex-direction: column; gap: 20px; }
.hw-item { display: flex; align-items: center; gap: 16px; }
.hw-icon { font-size: 24px; }
.hw-icon.online { color: #10b981; }
.hw-icon.offline { color: #dc2626; }
.hw-info { display: flex; flex-direction: column; flex: 1; }
.hw-info strong { font-size: 14px; color: #111827; }
.hw-info span { font-size: 12px; color: #6b7280; }

/* Bottom Action Bar */
.action-bar { position: absolute; bottom: 0; left: 0; right: 0; background-color: white; padding: 16px 32px; display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid #e5e7eb; box-shadow: 0 -4px 12px rgba(0,0,0,0.02); }
.action-right { display: flex; gap: 12px; }
.btn-outline { background-color: white; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: #4b5563; transition: 0.2s; }
.btn-outline:hover { background-color: #f9fafb; }
.btn-dark-blue { background-color: #0f172a; color: white; border: none; padding: 8px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-dark-blue:hover { background-color: #1e293b; }

/* ================= Modal Styles ================= */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
}

.close-btn {
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover {
  color: #dc2626;
  transform: scale(1.1);
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
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #0f172a;
}

.modal-actions {
  padding: 16px 24px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>