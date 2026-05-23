<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="logo">
          <h1 class="logo-title">Bus<span class="logo-span">Stop</span></h1>
          <p class="logo-sub">PASSENGER INTELLIGENCE</p>
        </div>

        <nav class="menu">
          <div class="menu-item menu-active">
            <i class='bx bx-grid-alt menu-icon'></i>
            <span class="menu-label">Dashboard</span>
          </div>
          <div class="menu-item">
            <i class='bx bx-line-chart menu-icon'></i>
            <span class="menu-label">Analytics</span>
          </div>
          <div class="menu-item">
            <i class='bx bx-video menu-icon'></i>
            <span class="menu-label">Live Feed</span>
          </div>
          <div class="menu-item">
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

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">Dashboard</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search stations or buses..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
            <div class="lang-switcher">
              <i class='bx bx-globe'></i>
              <span class="lang-text">English</span>
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
            <span class="kpi-title kpi-title-white">MAINTAIN BUSES</span>
            <div class="kpi-icon kpi-icon-white"><i class='bx bxs-wrench'></i></div>
          </div>
          <div class="kpi-value kpi-value-white">10</div>
          <div class="kpi-trend kpi-trend-white"><i class='bx bx-cog bx-spin'></i> Under maintenance</div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Weekly Passengers</h3>
              <p class="chart-sub">Passenger traffic overview across all stations</p>
            </div>
            <div class="chart-toggles">
              <span class="toggle toggle-active">Weekly</span>
              <span class="toggle">Monthly</span>
            </div>
          </div>
          <div class="bars-container">
            <div class="bar-wrapper"><div class="bar" style="height:22%"></div><span class="bar-day">Mon</span><span class="bar-val">10</span></div>
            <div class="bar-wrapper"><div class="bar" style="height:88%"></div><span class="bar-day">Tue</span><span class="bar-val">40</span></div>
            <div class="bar-wrapper"><div class="bar" style="height:44%"></div><span class="bar-day">Wed</span><span class="bar-val">20</span></div>
            <div class="bar-wrapper"><div class="bar" style="height:77%"></div><span class="bar-day">Thu</span><span class="bar-val">35</span></div>
            <div class="bar-wrapper"><div class="bar" style="height:55%"></div><span class="bar-day">Fri</span><span class="bar-val">25</span></div>
            <div class="bar-wrapper"><div class="bar bar-active" style="height:100%"></div><span class="bar-day bar-day-active">Sat</span><span class="bar-val bar-val-active">45</span></div>
            <div class="bar-wrapper"><div class="bar" style="height:33%"></div><span class="bar-day">Sun</span><span class="bar-val">15</span></div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title" style="margin-bottom:16px">Notifications</h3>
          <div class="noti-list">
            <div class="noti-item" v-for="i in 3" :key="i">
              <div class="noti-icon"><i class='bx bxs-error'></i></div>
              <div class="noti-content">
                <strong class="noti-strong">Station: 14 - M-square</strong>
                <span class="noti-desc">Building Red Zone !!!</span>
                <span class="noti-time">People waiting now: 20 people</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
          <h3 class="chart-title">Active Stations Detail</h3>
          <div class="legend">
            <span class="legend-item"><span class="dot dot-green"></span> Normal</span>
            <span class="legend-item"><span class="dot dot-red"></span> Alert</span>
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
            <tr>
              <td>
                <div class="zone-info">
                  <div class="zone-icon zone-icon-alert"><i class='bx bxs-map-pin' style="color:#d72660"></i></div>
                  <div>
                    <strong class="zone-name">Station: 14 - M-square</strong>
                    <p class="zone-sub">Red Zone Area</p>
                  </div>
                </div>
              </td>
              <td class="td-alert">20</td>
              <td class="td-normal">0 mins away</td>
              <td><span class="badge badge-alert">Alert</span></td>
              <td><span class="action-link"><i class='bx bx-link-external'></i></span></td>
            </tr>
            <tr>
              <td>
                <div class="zone-info">
                  <div class="zone-icon"><i class='bx bxs-map-pin' style="color:#6b7280"></i></div>
                  <div>
                    <strong class="zone-name">Station 9</strong>
                    <p class="zone-sub">Main Route Coordinates [20.0458, 99.8913]</p>
                  </div>
                </div>
              </td>
              <td class="td-normal">12</td>
              <td class="td-normal">5 mins away</td>
              <td><span class="badge badge-normal">Normal</span></td>
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
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;
};
onMounted(() => document.addEventListener('click', closeDropdown));
onUnmounted(() => document.removeEventListener('click', closeDropdown));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

/* === Reset === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* === Layout === */
.app-container {
  display: flex;
  height: 100vh;
  background: #f7f7fa;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #333;
  overflow: hidden;
}

/* ========================================
   SIDEBAR — copy จาก history.vue 1:1
   ======================================== */
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

/* Logo */
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

/* Menu */
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

/* User card */
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

/* === Main === */
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
.header-left { display: flex; align-items: center; gap: 32px; }
.header-title {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
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
.search-icon { font-size: 18px; color: #6b7280; }
.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #4b5563;
}
.header-right { display: flex; align-items: center; gap: 20px; }
.action-icons { display: flex; gap: 16px; align-items: center; }
.icon-btn { cursor: pointer; font-size: 22px; color: #6b7280; }
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #1f2937;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  background: #fff;
}
.lang-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}
.profile-dropdown-container { position: relative; }
.profile-circle {
  width: 40px; height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 20px; color: #4b5563;
}
.dropdown-menu {
  position: absolute; top: 50px; right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  border-radius: 12px; width: 200px; overflow: hidden;
  z-index: 100; border: 1px solid #f3f4f6;
}
.dropdown-item {
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
}
.dropdown-item i { font-size: 18px; }
.dropdown-item:hover { background: #f3f4f6; color: #d72660; }
.dropdown-divider { height: 1px; background: #e5e7eb; }
.logout-item { color: #d72660; }
.logout-item:hover { background: #fff0f5; }

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}
.kpi-card {
  background: #fff;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid #f0f0f0;
}
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.kpi-title {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #888;
  letter-spacing: .5px;
}
.kpi-icon {
  background: #fff0f5;
  color: #d72660;
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}
.kpi-value {
  font-family: 'Inter', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  line-height: 1;
}
.kpi-trend {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  display: flex; align-items: center; gap: 4px;
}
.positive { color: #28b463; }
.neutral { color: #6b7280; }
.status-card { background: linear-gradient(135deg, #d72660, #a81d4a); }
.kpi-title-white { color: rgba(255,255,255,.8) !important; }
.kpi-icon-white { background: rgba(255,255,255,.2); color: #fff; }
.kpi-value-white { color: #fff; }
.kpi-trend-white { color: #fff; }

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  margin-bottom: 24px;
}
.chart-card {
  background: #fff;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid #f0f0f0;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.chart-title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}
.chart-sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin: 4px 0 0;
}
.chart-toggles { background: #f3f4f6; padding: 4px; border-radius: 6px; display: flex; }
.toggle {
  padding: 4px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
}
.toggle-active { background: #fff; color: #d72660; font-weight: 600; }

/* Bars */
.bars-container {
  display: flex; align-items: flex-end; justify-content: space-between;
  height: 200px; padding-top: 20px;
}
.bar-wrapper {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; height: 100%; justify-content: flex-end; gap: 8px;
}
.bar { width: 40px; background: #e5e7eb; border-radius: 4px 4px 0 0; }
.bar-active { background: linear-gradient(to top, #d72660, #ff8cae); }
.bar-day {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
}
.bar-day-active { color: #d72660; font-weight: 600; }
.bar-val {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #9ca3af;
}
.bar-val-active { color: #d72660; font-weight: 700; }

/* Notifications */
.noti-list { display: flex; flex-direction: column; gap: 12px; }
.noti-item {
  display: flex; gap: 12px; padding: 12px;
  border-radius: 12px;
  background: #fff1f5;
  border-left: 4px solid #d72660;
}
.noti-icon { font-size: 20px; color: #d72660; padding-top: 2px; }
.noti-content { display: flex; flex-direction: column; gap: 4px; }
.noti-strong {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
.noti-desc {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #d72660;
}
.noti-time {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #6b7280;
}

/* Table */
.table-card {
  background: #fff;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid #f0f0f0;
}
.table-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.legend { display: flex; gap: 16px; }
.legend-item {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  display: flex; align-items: center;
}
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.dot-green { background: #28b463; }
.dot-red { background: #d72660; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  letter-spacing: .5px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}
.data-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #374151;
}
.zone-info { display: flex; align-items: center; gap: 12px; }
.zone-icon {
  width: 36px; height: 36px;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; font-size: 18px;
}
.zone-icon-alert { background: #fff0f5; }
.zone-name {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.zone-sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-top: 2px;
}
.td-alert {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #d72660;
}
.td-normal {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #374151;
}
.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
}
.badge-normal { background: #e4f9ec; color: #28b463; }
.badge-alert { background: #fff0f5; color: #d72660; }
.action-link {
  color: #6b7280; cursor: pointer;
  font-size: 18px;
  display: flex; align-items: center;
}
</style>