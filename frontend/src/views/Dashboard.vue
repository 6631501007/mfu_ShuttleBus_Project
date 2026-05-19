<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="brand">
        <h1 class="logo-title">Bus Stop</h1>
        <p class="logo-subtitle">PASSENGER INTELLIGENCE</p>
      </div>

      <nav class="nav-menu">
        <div class="nav-item active">
          <i class='bx bxs-dashboard icon'></i> Dashboard
        </div>
        <div class="nav-item">
          <i class='bx bx-map-alt icon'></i> Map
        </div>
        <div class="nav-item">
          <i class='bx bx-history icon'></i> History
        </div>
        <div class="nav-item">
          <i class='bx bx-cog icon'></i> Settings
        </div>
      </nav>
      
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2>Dashboard</h2>
          <div class="search-bar">
            <i class='bx bx-search'></i>
            <input type="text" placeholder="Search stations or buses..." />
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

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">TOTAL PASSENGERS</span>
            <div class="kpi-icon"><i class='bx bxs-group'></i></div>
          </div>
          <div class="kpi-value">99</div>
          <div class="kpi-trend positive"><i class='bx bx-up-arrow-alt'></i> Current waiting</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">ACTIVE BUSES</span>
            <div class="kpi-icon"><i class='bx bxs-bus'></i></div>
          </div>
          <div class="kpi-value">3</div>
          <div class="kpi-trend positive"><i class='bx bx-check-circle'></i> On route</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">STILL BUSES</span>
            <div class="kpi-icon"><i class='bx bx-stop-circle'></i></div>
          </div>
          <div class="kpi-value">4</div>
          <div class="kpi-trend neutral"><i class='bx bx-time-five'></i> Standby at station</div>
        </div>

        <div class="kpi-card status-card">
          <div class="kpi-header">
            <span class="kpi-title text-white">MAINTAIN BUSES</span>
            <div class="kpi-icon status-icon"><i class='bx bxs-wrench'></i></div>
          </div>
          <div class="kpi-value text-white">10</div>
          <div class="kpi-trend text-white"><i class='bx bx-cog bx-spin'></i> Under maintenance</div>
        </div>
      </div>

      <div class="charts-grid">
        
        <div class="chart-card occupancy-chart">
          <div class="chart-header">
            <div>
              <h3>Weekly Passengers</h3>
              <p>Passenger traffic overview across all stations</p>
            </div>
            <div class="chart-toggles">
              <span class="toggle active">Weekly</span>
              <span class="toggle">Monthly</span>
            </div>
          </div>
          <div class="bars-container">
            <div class="bar-wrapper"><div class="bar" style="height: 22%;"></div><span>Mon</span><span class="bar-val">10</span></div>
            <div class="bar-wrapper"><div class="bar" style="height: 88%;"></div><span>Tue</span><span class="bar-val">40</span></div>
            <div class="bar-wrapper"><div class="bar" style="height: 44%;"></div><span>Wed</span><span class="bar-val">20</span></div>
            <div class="bar-wrapper"><div class="bar" style="height: 77%;"></div><span>Thu</span><span class="bar-val">35</span></div>
            <div class="bar-wrapper"><div class="bar" style="height: 55%;"></div><span>Fri</span><span class="bar-val">25</span></div>
            <div class="bar-wrapper"><div class="bar active-bar" style="height: 100%;"></div><span class="active-text">Sat</span><span class="bar-val text-red font-bold">45</span></div>
            <div class="bar-wrapper"><div class="bar" style="height: 33%;"></div><span>Sun</span><span class="bar-val">15</span></div>
          </div>
        </div>

        <div class="chart-card notifications-card">
          <h3>Notifications</h3>
          <div class="noti-list">
            <div class="noti-item alert-bg" v-for="i in 3" :key="i">
              <div class="noti-icon text-red"><i class='bx bxs-error'></i></div>
              <div class="noti-content">
                <strong>Station: 14 - M-square</strong>
                <span class="noti-desc text-red">Building Red Zone !!!</span>
                <span class="noti-time">People waiting now: 20 people</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3>Active Stations Detail</h3>
          <div class="legend">
            <span class="legend-item"><span class="dot green"></span> Normal</span>
            <span class="legend-item"><span class="dot red"></span> Alert</span>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>STATION NAME</th>
              <th>WAITING PASSENGERS</th>
              <th>INCOMING BUSES</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr class="alert-row">
              <td>
                <div class="zone-info">
                  <div class="zone-icon alert-icon-bg"><i class='bx bxs-map-pin text-red'></i></div>
                  <div>
                    <strong>Station: 14 - M-square</strong>
                    <p>Red Zone Area</p>
                  </div>
                </div>
              </td>
              <td class="text-red font-bold">20</td>
              <td>0 mins away</td>
              <td><span class="badge alert">Alert</span></td>
              <td><span class="action-link"><i class='bx bx-link-external'></i></span></td>
            </tr>
            <tr>
              <td>
                <div class="zone-info">
                  <div class="zone-icon"><i class='bx bxs-map-pin'></i></div>
                  <div>
                    <strong>Station 9</strong>
                    <p>Main Route Coordinates [20.0458, 99.8913]</p>
                  </div>
                </div>
              </td>
              <td>12</td>
              <td>5 mins away</td>
              <td><span class="badge normal">Normal</span></td>
              <td><span class="action-link"><i class='bx bx-link-external'></i></span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isDropdownOpen = ref(false);

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
/* ================= นำเข้า Boxicons ================= */
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

/* ================= Base Layout ================= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f9;
  color: #333;
  overflow: hidden;
}

/* ================= Sidebar ================= */
.sidebar {
  width: 260px;
  background-color: #f8fafd;
  border-right: 1px solid #e1e5eb;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.brand {
  padding: 0 24px 30px;
}

.logo-title {
  color: #b91c1c;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.logo-subtitle {
  font-size: 10px;
  color: #6b7280;
  letter-spacing: 1px;
}

.nav-menu {
  flex: 1;
}

.nav-item {
  padding: 12px 24px;
  margin: 4px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item .icon {
  font-size: 20px;
}

.nav-item:hover {
  background-color: #fce7f3;
  color: #b91c1c;
}

.nav-item.active {
  background-color: #b91c1c;
  color: white;
}

.text-red { color: #dc2626 !important; }

/* ================= Main Content ================= */
.main-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

/* Header */
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

.header-left h2 {
  font-size: 20px;
  color: #1f2937;
  font-weight: bold;
}

.search-bar {
  background-color: #e5e7eb;
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
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
  color: #1f2937;
}

/* ================= Language Switcher ================= */
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
  margin-left: 8px;
}

.lang-switcher i.bx-globe {
  font-size: 18px;
}

.lang-switcher i.bx-chevron-down {
  font-size: 20px;
  margin-left: -2px;
}

.lang-switcher:hover {
  background-color: #f3f4f6;
}

/* Profile Dropdown */
.profile-dropdown-container {
  position: relative;
  margin-left: 8px;
}

.profile-circle {
  width: 40px;
  height: 40px;
  background-color: #e5e7eb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 20px;
  color: #4b5563;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.profile-circle:hover {
  border-color: #b91c1c;
  background-color: #fce7f3;
  color: #b91c1c;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
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
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-item i {
  font-size: 18px;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #b91c1c;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
}

.logout-item {
  color: #dc2626;
}

.logout-item:hover {
  background-color: #fef2f2;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.kpi-icon {
  background-color: #fce7f3;
  color: #b91c1c;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.kpi-trend {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.positive { color: #10b981; }
.negative { color: #ef4444; }
.neutral { color: #6b7280; }

.status-card {
  background: linear-gradient(135deg, #c8102e, #990d22);
  color: white;
}

.status-card .kpi-icon {
  background-color: rgba(255,255,255,0.2);
  color: white;
}

.text-white { color: white !important; }

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.chart-header h3 {
  font-size: 16px;
  color: #1f2937;
}

.chart-header p {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.chart-toggles {
  background-color: #f3f4f6;
  padding: 4px;
  border-radius: 6px;
  display: flex;
}

.toggle {
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
}

.toggle.active {
  background-color: white;
  color: #b91c1c;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* CSS Bar Chart */
.bars-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding-top: 20px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
  gap: 8px;
}

.bar {
  width: 40px;
  background-color: #e5e7eb;
  border-radius: 4px 4px 0 0;
  transition: background-color 0.3s, height 0.3s;
}

.bar:hover {
  background-color: #d1d5db;
}

.bar.active-bar {
  background-color: #b91c1c;
}

.bar-wrapper span {
  font-size: 12px;
  color: #6b7280;
}

.bar-val {
  font-size: 10px !important;
  color: #9ca3af !important;
  margin-top: -4px;
}

.active-text {
  color: #b91c1c !important;
  font-weight: bold;
}

/* Notifications Card */
.notifications-card h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.noti-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.noti-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9fafb;
  border-left: 4px solid #d1d5db;
}

.noti-item.alert-bg {
  background-color: #fef2f2;
  border-left-color: #dc2626;
}

.noti-icon {
  font-size: 20px;
  padding-top: 2px;
}

.noti-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.noti-content strong {
  font-size: 13px;
  color: #1f2937;
}

.noti-desc {
  font-size: 12px;
  font-weight: 600;
}

.noti-time {
  font-size: 11px;
  color: #6b7280;
}

/* Data Table */
.table-card {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  font-size: 16px;
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}
.dot.green { background-color: #10b981; }
.dot.red { background-color: #ef4444; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
}

.data-table tbody tr {
  transition: background-color 0.2s;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.zone-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-icon {
  width: 36px;
  height: 36px;
  background-color: #f3f4f6;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}

.alert-icon-bg {
  background-color: #fee2e2;
}

.zone-info strong {
  display: block;
  font-size: 14px;
}

.zone-info p {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.font-bold { font-weight: 700; }

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge.normal {
  background-color: #d1fae5;
  color: #065f46;
}

.badge.alert {
  background-color: #fee2e2;
  color: #991b1b;
}

.action-link {
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-link:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}
</style>