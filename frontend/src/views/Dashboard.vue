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
            <TopbarNotification />
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

      <div class="kpi-grid">
        <div
          class="kpi-card"
          v-for="kpi in kpis"
          :key="kpi.title"
          :class="{ 'status-card': kpi.type === 'warning' }"
        >
          <div class="kpi-header">
            <span class="kpi-title" :class="{ 'kpi-title-white': kpi.type === 'warning' }">{{ kpi.title }}</span>
            <div :class="['kpi-icon', { 'kpi-icon-white': kpi.type === 'warning' }]">
              <i :class="kpi.icon"></i>
            </div>
          </div>
          <div class="kpi-value" :class="{ 'kpi-value-white': kpi.type === 'warning' }">{{ kpi.value }}</div>
          <div :class="['kpi-trend', { 'kpi-trend-white': kpi.type === 'warning', positive: kpi.type === 'positive', neutral: kpi.type === 'neutral' }]">
            <i :class="kpi.indicator"></i> {{ kpi.trend }}
          </div>
        </div>
      </div>

      <div class="hourly-card">
        <div class="table-header">
          <div>
            <h3 class="chart-title">Hourly Queue Analytics</h3>
            <p class="chart-sub">Latest AI hourly records from live human detection</p>
          </div>
        </div>
        <div class="hourly-grid" v-if="hourlyAnalytics.length">
          <div class="hourly-item" v-for="item in hourlyAnalyticsDisplay" :key="`${item.station_id}-${item.timestamp}`">
            <div class="hourly-item-head">
              <strong>{{ item.station_id }}</strong>
              <span>{{ formatHour(item.timestamp) }}</span>
            </div>
            <div class="hourly-stats">
              <span><b>{{ item.current_queue_count }}</b> now</span>
              <span><b>{{ item.peak_queue_count }}</b> peak</span>
              <span><b>{{ item.total_persons_processed }}</b> processed</span>
            </div>
            <div class="hourly-foot">
              Avg wait {{ formatSeconds(item.avg_queue_time_seconds) }} · Peak {{ item.peak_time || '-' }}
            </div>
          </div>
        </div>
        <div class="noti-empty" v-else>No hourly analytics available yet.</div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">{{ activePassengerView === 'weekly' ? 'Weekly Passengers' : 'Monthly Passengers' }}</h3>
              <p class="chart-sub">Passenger traffic overview across all stations</p>
            </div>
            <div class="chart-toggles">
              <button class="toggle" :class="{ 'toggle-active': activePassengerView === 'weekly' }" @click="setPassengerView('weekly')">Weekly</button>
              <button class="toggle" :class="{ 'toggle-active': activePassengerView === 'monthly' }" @click="setPassengerView('monthly')">Monthly</button>
            </div>
          </div>
          <div class="bars-container">
            <div 
              class="bar-wrapper" 
              v-for="(item, index) in passengerChartData" 
              :key="item.label"
              @click="selectedChartIndex = index"
            >
              <div class="bar" :class="{ 'bar-active': item.active }" :style="{ height: item.height + '%' }"></div>
              <span class="bar-day" :class="{ 'bar-day-active': item.active }">{{ item.label }}</span>
              <span class="bar-val" :class="{ 'bar-val-active': item.active }">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title" style="margin-bottom:16px">Notifications</h3>
          <div class="noti-list">
            <div class="noti-item" v-for="item in notifications" :key="item.id">
              <div class="noti-icon"><i class='bx bxs-error'></i></div>
              <div class="noti-content">
                <strong class="noti-strong">{{ item.station }}</strong>
                <span class="noti-desc">{{ item.message }}</span>
                <span class="noti-time">People waiting now: {{ item.people }} people</span>
              </div>
            </div>
            <div class="noti-empty" v-if="notifications.length === 0">No notifications available.</div>
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
            <tr v-for="station in stations" :key="station.stationId">
              <td>
                <div class="zone-info">
                  <div class="zone-icon" :class="{ 'zone-icon-alert': station.status === 'alert' }">
                    <i class='bx bxs-map-pin' :style="{ color: station.status === 'alert' ? '#d72660' : '#6b7280' }"></i>
                  </div>
                  <div>
                    <strong class="zone-name">{{ station.name }}</strong>
                    <p class="zone-sub">{{ station.zone }} | {{ station.location?.lat.toFixed(4) }}, {{ station.location?.lng.toFixed(4) }}</p>
                  </div>
                </div>
              </td>
              <td :class="station.status === 'alert' ? 'td-alert' : 'td-normal'">{{ station.waitingPassengers }}</td>
              <td class="td-normal">{{ station.incomingBuses }}</td>
              <td><span class="badge" :class="station.status === 'alert' ? 'badge-alert' : 'badge-normal'">{{ station.status }}</span></td>
              <td><span class="action-link"><i class='bx bx-link-external'></i></span></td>
            </tr>
            <tr v-if="stations.length === 0">
              <td colspan="5">No station data available.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'
import TopbarNotification from '../components/TopbarNotification.vue'
import { apiFetch } from '../lib/api'
import { createRedStationNotification, isRedStation } from '../lib/stationAlert'

const router = useRouter()
const isDropdownOpen = ref(false);
const language = ref('English');

const activePassengerView = ref('weekly');
const selectedChartIndex = ref(null); // เพิ่มตัวแปรสำหรับเก็บ Index ของแท่งกราฟที่ถูกเลือก

const kpis = ref([
  { title: 'TOTAL PASSENGERS', value: '-', trend: 'Loading...', type: 'positive', icon: 'bx bxs-group', indicator: 'bx bx-up-arrow-alt' },
  { title: 'ACTIVE BUSES', value: '-', trend: 'Loading...', type: 'positive', icon: 'bx bxs-bus', indicator: 'bx bx-check-circle' },
  { title: 'STILL BUSES', value: '-', trend: 'Loading...', type: 'neutral', icon: 'bx bx-stop-circle', indicator: 'bx bx-time-five' },
  { title: 'MAINTAIN BUSES', value: '-', trend: 'Loading...', type: 'warning', icon: 'bx bxs-wrench', indicator: 'bx bx-cog' }
]);
const notifications = ref([]);
const stations = ref([]);
const buses = ref([]);
const weeklyChartData = ref([]);
const monthlyChartData = ref([]);
const hourlyAnalytics = ref([]);

// อัปเดตฟังก์ชันเพื่อให้รองรับการคลิกเลือก (Select) แท่งกราฟ
const normalizeChartData = (items, selectedIdx) => {
  const max = Math.max(...items.map(item => item.value), 1);
  
  // ถ้าไม่ได้เลือกอะไร ให้ค่าเริ่มต้นเป็นแท่งสุดท้าย (ขวาสุด)
  const activeIdx = selectedIdx !== null ? selectedIdx : items.length - 1;

  return items.map((item, index) => ({
    ...item,
    height: Math.round((item.value / max) * 100),
    active: index === activeIdx
  }));
};

const passengerChartData = computed(() => {
  return activePassengerView.value === 'weekly'
    ? normalizeChartData(weeklyChartData.value, selectedChartIndex.value)
    : normalizeChartData(monthlyChartData.value, selectedChartIndex.value);
});

const hourlyAnalyticsDisplay = computed(() => hourlyAnalytics.value.slice(0, 6));

const formatHour = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const formatSeconds = (value) => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

const mergeNotifications = (apiNotifications, stationItems) => {
  const redStationNotifications = stationItems
    .filter(isRedStation)
    .map(createRedStationNotification);

  const seenStations = new Set(redStationNotifications.map(item => item.station));
  const remainingNotifications = apiNotifications.filter(item => !seenStations.has(item.station));

  return [...redStationNotifications, ...remainingNotifications];
};

const loadDashboard = async () => {
  try {
    const res = await apiFetch('/api/dashboard');
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cannot load dashboard');

    const stationItems = data.stations || [];

    kpis.value = data.kpis || kpis.value;
    notifications.value = mergeNotifications(data.notifications || [], stationItems);
    stations.value = stationItems;
    buses.value = data.buses || [];
    weeklyChartData.value = data.passengerChart?.weekly || [];
    monthlyChartData.value = data.passengerChart?.monthly || [];
    hourlyAnalytics.value = data.hourlyAnalytics || [];
  } catch (error) {
    console.error(error);
  }
};

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;
};

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English';
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  loadDashboard();
});
onUnmounted(() => document.removeEventListener('click', closeDropdown));

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}
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
.profile-dropdown-container { position: relative; }
.profile-circle {
  width: 40px; height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 20px; color: #4b5563;
}
.profile-circle:hover {
  border-color: #d72660;
  background: #fff0f5;
  color: #d72660;
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

.hourly-card {
  background: #fff;
  padding: 22px;
  border-radius: 18px;
  border: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.hourly-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.hourly-item {
  border: 1px solid #eceff3;
  border-radius: 8px;
  padding: 14px;
  background: #fbfcfd;
  min-width: 0;
}

.hourly-item-head,
.hourly-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hourly-item-head strong {
  font-size: 13px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hourly-item-head span,
.hourly-foot {
  color: #6b7280;
  font-size: 12px;
}

.hourly-stats {
  margin-top: 14px;
}

.hourly-stats span {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.2;
}

.hourly-stats b {
  color: #d72660;
  display: block;
  font-size: 18px;
  line-height: 1;
  margin-bottom: 4px;
}

.hourly-foot {
  border-top: 1px solid #eceff3;
  margin-top: 12px;
  padding-top: 10px;
}

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
.chart-toggles { 
  background: #f3f4f6; 
  padding: 6px; 
  border-radius: 8px; 
  display: flex; 
  gap: 6px;
}
.toggle {
  padding: 8px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  background: transparent;
}
.toggle:hover {
  color: #4b5563;
  background: rgba(255, 255, 255, 0.5);
}
.toggle-active { 
  background: #fff; 
  color: #d72660; 
  font-weight: 600;
  border: 1px solid #d72660;
  box-shadow: 0 2px 8px rgba(215, 38, 96, 0.15);
}

/* Bars (มี Hover Effect & Cursor Pointer) */
.bars-container {
  display: flex; align-items: flex-end; justify-content: space-between;
  height: 200px; padding-top: 20px;
}
.bar-wrapper {
  display: flex; flex-direction: column; align-items: center;
  width: 100%; height: 100%; justify-content: flex-end; gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
/* เปลี่ยนสีเมื่อเอาเมาส์ชี้ (เฉพาะแท่งที่ไม่ได้ Active) */
.bar-wrapper:hover .bar:not(.bar-active) {
  background: #f9d8e4; 
}
.bar-wrapper:hover .bar-day:not(.bar-day-active),
.bar-wrapper:hover .bar-val:not(.bar-val-active) {
  color: #ff8cae; 
}
.bar { 
  width: 40px; 
  background: #e5e7eb; 
  border-radius: 4px 4px 0 0; 
  transition: all 0.3s ease; 
}
.bar-active { background: linear-gradient(to top, #d72660, #ff8cae); }
.bar-day {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  transition: color 0.3s ease;
}
.bar-day-active { color: #d72660; font-weight: 600; }
.bar-val {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: #9ca3af;
  transition: color 0.3s ease;
}
.bar-val-active { color: #d72660; font-weight: 700; }

/* Notifications (รองรับการเลื่อนสกอร์ลง) */
.noti-list { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  max-height: 230px; 
  overflow-y: auto; 
  padding-right: 6px; 
}
.noti-list::-webkit-scrollbar {
  width: 6px;
}
.noti-list::-webkit-scrollbar-track {
  background: #f3f4f6; 
  border-radius: 10px;
}
.noti-list::-webkit-scrollbar-thumb {
  background: #d1d5db; 
  border-radius: 10px;
}
.noti-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; 
}
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