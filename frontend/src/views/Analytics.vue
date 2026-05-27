<template>
  <div class="dashboard">
    <!-- SIDEBAR -->
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

          <div class="menu-item" @click="router.push('/livefeed')">
            <i class='bx bx-video'></i>
            <span>Live Feed</span>
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

    <!-- MAIN -->
    <main class="main">
      <!-- TOPBAR -->
      <header class="top-header">
        <div class="header-left">
          <h2 class="header-title">Analytics</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search analytics..." />
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
              <div class="dropdown-item logout-item" @click="logout"><i class='bx bx-log-out'></i> Log out</div>
            </div>
          </div>
        </div>
      </header>

      <!-- PAGE TITLE -->
      <section class="page-title">
        <div>
          <h1>Historical Performance</h1>
          <p>
            Analyze long-term trends and spatial occupancy patterns
          </p>
        </div>

        <button class="export-btn">
          <i class='bx bx-download'></i>
          Export Report
        </button>
      </section>

      <!-- FILTER -->
      <section class="filters">
        <!-- DATE -->
        <div class="filter-group">
          <label>DATE RANGE</label>

          <div class="select-box">
            <i class='bx bx-calendar'></i>

            <select>
              <option>Oct 01, 2023 - Oct 31, 2023</option>
              <option>Nov 01, 2023 - Nov 30, 2023</option>
              <option>Dec 01, 2023 - Dec 31, 2023</option>
            </select>

            <i class='bx bx-chevron-down arrow'></i>
          </div>
        </div>

        <!-- TERMINAL -->
        <div class="filter-group">
          <label>TERMINAL</label>

          <div class="select-box">

            <select>
              <option>All Main Concourses</option>
              <option>Terminal A</option>
              <option>Terminal B</option>
              <option>Terminal C</option>
            </select>

            <i class='bx bx-chevron-down arrow'></i>
          </div>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats">
        <div class="stat-card">
          <div class="stat-top">
            <span>AVG PASSENGER FLOW</span>
            <i class='bx bx-group'></i>
          </div>

          <h2>12,482</h2>

          <div class="stat-bottom">
            <span class="green">+4.2%</span>
            <p>Passengers per day (Monthly Avg)</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <span>PEAK OCCUPANCY</span>
            <i class='bx bx-line-chart'></i>
          </div>

          <h2>84%</h2>

          <div class="stat-bottom">
            <span class="red">-12%</span>
            <p>Max density reached in Gate B</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <span>WAIT TIME (AVG)</span>
            <i class='bx bx-time-five'></i>
          </div>

          <h2>6.5m</h2>

          <div class="stat-bottom">
            <span class="green">-0.8m</span>
            <p>Security checkpoint duration</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-top">
            <span>TOTAL ENTRIES</span>
            <i class='bx bx-log-in'></i>
          </div>

          <h2>386.9K</h2>

          <div class="stat-bottom">
            <span class="green">+27K</span>
            <p>Total scans for selected period</p>
          </div>
        </div>
      </section>

      <!-- GRAPH -->
      <section class="graph-section">
        <div class="graph-card large">
          <div class="card-header">
            <div>
              <h3>Passenger Flow Trends</h3>
              <p>Daily volume across all monitored sensors</p>
            </div>

            <div class="legend">
              <span>
                <div class="dot pink"></div>Current
              </span>
              <span>
                <div class="dot gray"></div>Previous
              </span>
            </div>
          </div>

          <div class="graph-area">
            <svg viewBox="0 0 600 250" preserveAspectRatio="none">
              <path d="M0 220 
                   C80 150, 140 160, 200 190
                   C260 220, 320 50, 400 90
                   C470 120, 520 250, 600 70" fill="none" stroke="#d72660" stroke-width="5" stroke-linecap="round" />

              <path d="M0 210
                   C80 190, 140 170, 200 180
                   C260 190, 320 130, 400 150
                   C470 170, 520 200, 600 180" fill="none" stroke="#d8b6c3" stroke-width="3" stroke-dasharray="10"
                stroke-linecap="round" />
            </svg>

            <div class="tooltip">14.2</div>
          </div>

          <div class="weeks">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        <!-- PEAK -->
        <div class="graph-card peak-card">
          <div class="card-header">
            <div>
              <h3>Peak Hour Analysis</h3>
              <p>Distribution of traffic by hour of day</p>
            </div>
          </div>

          <div class="peak-chart">
            <div class="peak-item" v-for="n in 8" :key="n">
              <div class="peak-bar" :style="{ height: 40 + n * 12 + 'px' }"></div>
            </div>
          </div>

          <div class="recommend-box">
            <div class="circle"></div>
            Staffing increase recommended between 11AM - 1PM
          </div>
        </div>
      </section>

      <!-- BOTTOM -->
      <section class="bottom-section">
        <!-- MAP -->
        <div class="graph-card map-card">
          <div class="card-header">
            <div>
              <h3>Congestion Heat Map</h3>
              <p>
                Spatial distribution of passenger density across the facility
              </p>
            </div>
          </div>

          <div class="map">
            <div class="heat red"></div>
            <div class="heat yellow"></div>

            <div class="label top">SECURITY A</div>
            <div class="label bottom">CHECK-IN</div>
          </div>
        </div>

        <!-- RANK -->
        <div class="graph-card rank-card">
          <div class="density">
            Density Scale
            <div class="density-bar"></div>
          </div>

          <div class="rank-list">
            <div class="rank-item">
              <div class="rank-number red-bg">1</div>

              <div class="rank-info">
                <h4>Security Terminal B</h4>
                <p>92% Peak / Avg 144 Max</p>
              </div>

              <i class='bx bx-error-circle red-text'></i>
            </div>

            <div class="rank-item">
              <div class="rank-number yellow-bg">2</div>

              <div class="rank-info">
                <h4>Gate B10-B14</h4>
                <p>84% Peak / 350 Pax</p>
              </div>

              <i class='bx bx-error-circle yellow-text'></i>
            </div>

            <div class="rank-item">
              <div class="rank-number green-bg">3</div>

              <div class="rank-info">
                <h4>Duty Free Center</h4>
                <p>42% Peak / 170 Pax</p>
              </div>

              <i class='bx bx-check-circle green-text'></i>
            </div>
          </div>

          <button class="audit-btn">
            VIEW FULL AUDIT LOG
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const isDropdownOpen = ref(false);

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;
};

onMounted(() => document.addEventListener('click', closeDropdown));
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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}

body {
  background: #f6f6f8;
}

.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f7f7fa;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ececec;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  background: #fff;
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
}

.user-card h4 {
  font-size: 14px;
}

.user-card p {
  font-size: 12px;
  color: #888;
}

/* MAIN */
.main {
  flex: 1;
  padding: 26px;
}

/* TOPBAR */
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
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 100;
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
  transition: background .2s;
}

.dropdown-item i {
  font-size: 18px;
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

.logout-item:hover {
  background: #fff0f5;
}

/* PAGE TITLE */
.page-title {
  margin-top: 34px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-title h2 {
  font-size: 20px;
  color: #333;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  background: white;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  width: 260px;
  border: 1px solid #eee;
}

.search-box input {
  border: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
}

.top-actions i {
  font-size: 22px;
  color: #777;
}

.top-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ddd;
}

/* PAGE TITLE */
.page-title {
  margin-top: 34px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.page-title h1 {
  color: #d72660;
  font-size: 36px;
}

.page-title p {
  margin-top: 8px;
  color: #888;
}

.export-btn {
  background: #d72660;
  color: white;
  border: none;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.filters {
  margin-top: 24px;
  display: flex;
  gap: 18px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  letter-spacing: .5px;
}

.select-box {
  position: relative;
  width: 270px;
  height: 50px;
  background: white;
  border: 1px solid #ececec;
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 0 14px;
}

.select-box select {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  appearance: none;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  padding-left: 28px;
}

.select-box i {
  position: absolute;
  color: #888;
}

.select-box .bx-calendar {
  left: 14px;
}

.arrow {
  right: 14px;
  pointer-events: none;
}

/* STATS */
.stats {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 11px;
  font-weight: 600;
}

.stat-top i {
  font-size: 18px;
}

.stat-card h2 {
  margin-top: 16px;
  font-size: 36px;
  color: #222;
}

.stat-bottom {
  margin-top: 10px;
}

.stat-bottom p {
  margin-top: 6px;
  color: #999;
  font-size: 12px;
}

.green {
  color: #28b463;
  font-weight: 600;
}

.red {
  color: #d72660;
  font-weight: 600;
}

/* GRAPH SECTION */
.graph-section {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.graph-card {
  background: white;
  border-radius: 22px;
  padding: 22px;
  border: 1px solid #f0f0f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
}

.card-header h3 {
  font-size: 16px;
  color: #333;
}

.card-header p {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.legend {
  display: flex;
  gap: 14px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pink {
  background: #d72660;
}

.gray {
  background: #d8b6c3;
}

/* SVG GRAPH */
.graph-area {
  position: relative;
  margin-top: 20px;
  height: 260px;
}

svg {
  width: 100%;
  height: 100%;
}

.tooltip {
  position: absolute;
  top: 70px;
  left: 52%;
  transform: translateX(-50%);
  background: #d72660;
  color: white;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.weeks {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #888;
  font-size: 13px;
}

/* PEAK */
.peak-chart {
  height: 250px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 20px;
}

.peak-item {
  width: 32px;
}

.peak-bar {
  width: 100%;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(to top,
      #d72660,
      #ff8cae);
}

.recommend-box {
  margin-top: 20px;
  background: #fff1f5;
  border-radius: 14px;
  padding: 14px;
  color: #d72660;
  font-size: 13px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.circle {
  width: 10px;
  height: 10px;
  background: #d72660;
  border-radius: 50%;
}

/* BOTTOM */
.bottom-section {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

/* MAP */
.map {
  margin-top: 20px;
  height: 320px;
  border-radius: 18px;
  background: #f1f1f3;
  position: relative;
  overflow: hidden;
}

.heat {
  position: absolute;
  border-radius: 50%;
  filter: blur(35px);
}

.red {
  width: 140px;
  height: 140px;
  background: rgba(215, 38, 96, .55);
  top: 70px;
  left: 240px;
}

.yellow {
  width: 120px;
  height: 120px;
  background: rgba(255, 196, 0, .45);
  bottom: 40px;
  left: 120px;
}

.label {
  position: absolute;
  background: #d72660;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.label.top {
  top: 120px;
  left: 270px;
}

.label.bottom {
  bottom: 70px;
  left: 100px;
}

/* RANK */
.rank-card {
  display: flex;
  flex-direction: column;
}

.density {
  font-size: 12px;
  color: #999;
}

.density-bar {
  width: 100%;
  height: 8px;
  margin-top: 8px;
  border-radius: 20px;
  background: linear-gradient(to right,
      #4ade80,
      #facc15,
      #ef4444);
}

.rank-list {
  margin-top: 24px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.rank-number {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.red-bg {
  background: #ffe4eb;
  color: #d72660;
}

.yellow-bg {
  background: #fff5d8;
  color: #ffb700;
}

.green-bg {
  background: #e4f9ec;
  color: #28b463;
}

.rank-info h4 {
  font-size: 14px;
}

.rank-info p {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.red-text {
  color: #d72660;
  margin-left: auto;
  font-size: 20px;
}

.yellow-text {
  color: #ffb700;
  margin-left: auto;
  font-size: 20px;
}

.green-text {
  color: #28b463;
  margin-left: auto;
  font-size: 20px;
}

.audit-btn {
  margin-top: auto;
  border: none;
  background: #fff1f5;
  color: #d72660;
  border-radius: 14px;
  padding: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .graph-section,
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    gap: 20px;
  }

  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}
</style>