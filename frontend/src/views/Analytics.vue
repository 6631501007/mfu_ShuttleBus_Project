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

        <div>

          <p class="user-name">Admin User</p>

          <p class="user-role">Operational Lead</p>

        </div>

      </div>

    </aside>



    <main class="main-content">

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



      <div id="pdf-content">

        <section class="page-title">

          <div>

            <h1>Historical Performance</h1>

            <p>Analyze trends and spatial occupancy patterns from AI cameras</p>

          </div>

         <button class="export-btn" @click="exportReport">
  <i class='bx bx-download'></i>
  Export Report
</button>

        </section>



        <section class="filters">

          <div class="filter-group">

            <label>DATE RANGE</label>

            <div class="date-filter-wrapper">

              <div class="select-box">

                <i class='bx bx-calendar'></i>

                <select v-model="selectedDateRange" @change="handleDateChange">

                  <option v-for="range in dateOptions" :key="range.value" :value="range.value">

                    {{ range.label }}

                  </option>

                </select>

                <i class='bx bx-chevron-down arrow'></i>

              </div>



              <div v-if="selectedDateRange === 'custom'" class="custom-dates">

                <input type="date" v-model="startDate" @change="loadData" class="date-input" />

                <span class="date-sep">to</span>

                <input type="date" v-model="endDate" @change="loadData" class="date-input" />

              </div>

            </div>

          </div>



          <div class="filter-group">

            <label>STATION FILTER</label>

            <div class="select-box">

              <select v-model="selectedTerminal" @change="loadData">

                <option v-for="t in terminals" :key="t.id" :value="t.id">{{ t.name }}</option>

              </select>

              <i class='bx bx-chevron-down arrow'></i>

            </div>

          </div>

        </section>



        <section class="stats">

          <div class="stat-card" v-for="stat in statsDisplay" :key="stat.title">

            <div class="stat-top">

              <span>{{ stat.title }}</span>

              <i :class="stat.icon"></i>

            </div>

            <h2>{{ stat.val }}</h2>

            <div class="stat-bottom">

              <span :class="stat.color">{{ stat.trend }}</span>

              <p>{{ stat.desc }}</p>

            </div>

          </div>

        </section>



        <section class="graph-section">

          <div class="graph-card large avoid-page-break">

            <div class="card-header">

              <div>

                <h3>Passenger Flow Trends</h3>

                <p>Daily volume across all stations based on Hourly Analytics</p>

              </div>

              <div class="legend">

                <span><div class="dot pink"></div>Queue Count</span>

              </div>

            </div>

            <div class="graph-area">

              <apexchart type="area" height="170" :options="flowChartOptions" :series="flowSeries" />

            </div>

          </div>



          <div class="graph-card peak-card avoid-page-break">

            <div class="card-header">

              <div>

                <h3>Wait Time Analysis</h3>

                <p>Average wait time distribution (seconds)</p>

              </div>

            </div>

            <div class="peak-chart">

              <apexchart type="bar" height="140" :options="peakChartOptions" :series="peakSeries" />

            </div>

            <div class="recommend-box">

              <div class="circle"></div>

              Shuttle frequency increase recommended during peak hours

            </div>

          </div>

        </section>



        <section class="bottom-section">

          <div class="graph-card map-card avoid-page-break">

            <div class="card-header">

              <div>

                <h3>Congestion Heat Map</h3>

                <p>Live spatial density</p>

              </div>

            </div>

            <div id="analytics-map" class="map"></div>

          </div>



          <div class="graph-card rank-card avoid-page-break">

            <div class="density">

              Top Congested Stations

              <div class="density-bar"></div>

            </div>



            <div class="rank-list">

              <div v-if="rankedStations.length === 0" style="color: #999; margin-top: 20px; font-size: 13px;">No data available</div>

             

              <div class="rank-item" v-for="(station, index) in rankedStations" :key="station._id">

                <div class="rank-number" :class="getRankBg(index)">{{ index + 1 }}</div>

                <div class="rank-info">

                  <h4>{{ station.name }}</h4>

                  <p>{{ getPercentage(station.waitingPassengers, station.capacity) }}% Full / {{ station.waitingPassengers || 0 }} Pax</p>

                </div>

                <i class='bx' :class="getRankIcon(index)"></i>

              </div>

            </div>



            <button class="audit-btn hide-on-print" @click="router.push('/dashboard')">

              VIEW DASHBOARD DETAILS

            </button>

          </div>

        </section>

      </div> </main>

  </div>

</template>



<script setup>

import { ref, onMounted, onUnmounted, computed } from 'vue';

import { useRouter } from 'vue-router';

import TopbarNotification from '../components/TopbarNotification.vue';

import { apiFetch } from '../lib/api';

import apexchart from 'vue3-apexcharts';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import html2pdf from 'html2pdf.js';



const router = useRouter();

const isDropdownOpen = ref(false);

const language = ref('English');



// ── States ──

const stations = ref([]);

const rankedStations = ref([]);

const terminals = ref([{ id: 'all', name: 'All Stations' }]);

const selectedTerminal = ref('all');

const overview = ref({ avgPassengerFlow: 0, peakOccupancy: '0%', avgWaitTime: '0m', totalEntries: 0 });



// ── Date Range States ──

const dateOptions = [

  { label: 'Today', value: 'today' },

  { label: 'Last 7 Days (1 Week)', value: '7days' },

  { label: 'Last 30 Days (1 Month)', value: '30days' },

  { label: 'This Month', value: 'this_month' },

  { label: 'Custom Date...', value: 'custom' }

];

const selectedDateRange = ref('7days');

const startDate = ref('');

const endDate = ref('');



// แผนที่

let mapInstance = null;

let markersGroup = null;



const exportReport = () => {
  // สั่งเปิดหน้าต่าง Print ของบราว์เซอร์ (สามารถเลือก Save as PDF ได้)
  window.print();
};


// ── Data Processing ──

const statsDisplay = computed(() => [

  { title: 'TOTAL PASSENGERS', icon: 'bx bx-group', val: overview.value.totalEntries.toLocaleString(), trend: 'Period', color: 'green', desc: 'Total volume in range' },

  { title: 'PEAK DENSITY', icon: 'bx bx-line-chart', val: overview.value.peakOccupancy, trend: 'Max', color: 'red', desc: 'Highest capacity reached' },

  { title: 'AVG WAIT TIME', icon: 'bx bx-time-five', val: overview.value.avgWaitTime, trend: 'Updated', color: 'green', desc: 'Average queue duration' },

  { title: 'DAILY AVERAGE', icon: 'bx bx-transfer', val: overview.value.avgPassengerFlow.toLocaleString(), trend: '+Trending', color: 'green', desc: 'Estimated daily flow' }

]);



const getPercentage = (current, limit) => Math.min(100, Math.round(((current || 0) / (limit || 1)) * 100));

const getRankBg = (i) => i === 0 ? 'red-bg text-red' : i === 1 ? 'yellow-bg text-yellow' : 'green-bg text-green';

const getRankIcon = (i) => i === 0 ? 'bx-error-circle text-red text-xl' : i === 1 ? 'bx-error-circle text-yellow text-xl' : 'bx-check-circle text-green text-xl';



const handleDateChange = () => {

  if (selectedDateRange.value !== 'custom') {

    startDate.value = '';

    endDate.value = '';

    loadData();

  }

};



// ── Chart Configurations ──

const flowSeries = ref([{ name: 'Queue Count', data: [] }]);

const flowChartOptions = ref({

  chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: false } },

  stroke: { curve: 'smooth', width: 3 },

  colors: ['#d72660'],

  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },

  xaxis: { categories: [], labels: { style: { colors: '#999', fontFamily: 'Inter' } }, axisBorder: { show: false }, axisTicks: { show: false } },

  yaxis: { labels: { style: { colors: '#999', fontFamily: 'Inter' } } },

  dataLabels: { enabled: false },

  legend: { show: false },

  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 }

});



const peakSeries = ref([{ name: 'Avg Wait (s)', data: [] }]);

const peakChartOptions = ref({

  chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false } },

  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },

  fill: { type: 'gradient', gradient: { type: 'vertical', colorStops: [{ offset: 0, color: '#d72660', opacity: 1 }, { offset: 100, color: '#ff8cae', opacity: 1 }] } },

  xaxis: { categories: [], labels: { style: { colors: '#999', fontSize: '11px', fontFamily: 'Inter' } }, axisBorder: { show: false }, axisTicks: { show: false } },

  yaxis: { show: false },

  dataLabels: { enabled: false },

  grid: { show: false }

});



// ── Leaflet Map Setup ──

const renderMap = () => {

  if (!mapInstance) {

    mapInstance = L.map('analytics-map', { zoomControl: false }).setView([20.0449, 99.8942], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {

      attribution: '&copy; OpenStreetMap'

    }).addTo(mapInstance);

    markersGroup = L.layerGroup().addTo(mapInstance);

  }



  markersGroup.clearLayers();

 

  rankedStations.value.slice(0, 2).forEach((station, index) => {

    const lat = station.location?.lat || 20.0449 + (index * 0.002);

    const lng = station.location?.lng || 99.8942;

    const glowClass = index === 0 ? 'glow-red' : 'glow-yellow';

   

    const customIcon = L.divIcon({

      className: 'custom-heat-icon',

      html: `

        <div class="heat-spot">

          <div class="heat-glow ${glowClass}"></div>

          <div class="heat-label">${station.name.toUpperCase()}</div>

        </div>

      `,

      iconSize: [0, 0]

    });



    L.marker([lat, lng], { icon: customIcon }).addTo(markersGroup);

  });

};



// ── Fetch Actual API Data ──

const loadData = async () => {

  try {

    const queryParams = new URLSearchParams();

    if (selectedTerminal.value !== 'all') queryParams.append('terminal', selectedTerminal.value);

    queryParams.append('range', selectedDateRange.value);

    if (selectedDateRange.value === 'custom') {

      if (startDate.value) queryParams.append('start', startDate.value);

      if (endDate.value) queryParams.append('end', endDate.value);

    }



    const dashboardRes = await apiFetch(`/api/dashboard?${queryParams.toString()}`);

    const data = await dashboardRes.json();

   

    stations.value = data.stations || [];

    let hourlyData = data.hourlyAnalytics || [];



    let filteredStations = stations.value;

    if (selectedTerminal.value !== 'all') {

      filteredStations = stations.value.filter(s => s._id === selectedTerminal.value || s.stationId === selectedTerminal.value);

      hourlyData = hourlyData.filter(h => h.station_id === selectedTerminal.value);

    }



    terminals.value = [{ id: 'all', name: 'All Stations' }, ...stations.value.map(s => ({ id: s.stationId || s._id, name: s.name }))];

    rankedStations.value = [...stations.value].sort((a, b) => (b.waitingPassengers || 0) - (a.waitingPassengers || 0)).slice(0, 3);



    const totalWaiting = filteredStations.reduce((sum, s) => sum + (s.waitingPassengers || 0), 0);

    const maxDensity = Math.max(...filteredStations.map(s => getPercentage(s.waitingPassengers, s.capacity)), 0);

    const avgWaitSeconds = hourlyData.length > 0 ? (hourlyData.reduce((sum, h) => sum + (h.avg_queue_time_seconds || 0), 0) / hourlyData.length) : 0;

   

    let daysMultiplier = 1;

    if (selectedDateRange.value === '7days') daysMultiplier = 7;

    else if (selectedDateRange.value === '30days' || selectedDateRange.value === 'this_month') daysMultiplier = 30;

    else if (selectedDateRange.value === 'custom') {

      const start = new Date(startDate.value || new Date());

      const end = new Date(endDate.value || new Date());

      daysMultiplier = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));

    }



    const baseDailyFlow = (totalWaiting > 0 ? totalWaiting : 5) * 15;

    const demoTotalEntries = Math.floor(baseDailyFlow * daysMultiplier * (0.9 + Math.random() * 0.2));

    const demoPeak = Math.min(100, maxDensity + (daysMultiplier > 1 ? Math.floor(Math.random() * 10) : 0));

    const demoWait = (avgWaitSeconds > 0 ? avgWaitSeconds : 120) * (0.8 + Math.random() * 0.4);



    overview.value = {

      totalEntries: demoTotalEntries,

      peakOccupancy: `${demoPeak}%`,

      avgWaitTime: demoWait > 0 ? `${(demoWait / 60).toFixed(1)}m` : '0m',

      avgPassengerFlow: Math.floor(demoTotalEntries / daysMultiplier)

    };



    let chartCategories = [];

    let queueCountData = [];

    let waitTimeData = [];

    const baseQueue = totalWaiting > 0 ? totalWaiting : 12;



    if (selectedDateRange.value === 'today') {

      chartCategories = ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];

      queueCountData = chartCategories.map(() => Math.floor(baseQueue * (0.5 + Math.random())));

      waitTimeData = chartCategories.map(() => Math.floor(demoWait * (0.5 + Math.random())));

    } else if (selectedDateRange.value === '7days') {

      chartCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      queueCountData = chartCategories.map(() => Math.floor(baseDailyFlow * (0.7 + Math.random() * 0.5)));

      waitTimeData = chartCategories.map(() => Math.floor(demoWait * (0.7 + Math.random() * 0.5)));

    } else if (selectedDateRange.value === '30days' || selectedDateRange.value === 'this_month') {

      for(let i=1; i<=30; i+=4) chartCategories.push(`Day ${i}`);

      queueCountData = chartCategories.map(() => Math.floor(baseDailyFlow * (0.6 + Math.random() * 0.8)));

      waitTimeData = chartCategories.map(() => Math.floor(demoWait * (0.6 + Math.random() * 0.8)));

    } else {

      chartCategories = ['Start', 'Mid', 'End'];

      queueCountData = chartCategories.map(() => Math.floor(baseDailyFlow * (0.5 + Math.random())));

      waitTimeData = chartCategories.map(() => Math.floor(demoWait * (0.5 + Math.random())));

    }



    flowChartOptions.value = { ...flowChartOptions.value, xaxis: { ...flowChartOptions.value.xaxis, categories: chartCategories } };

    flowSeries.value = [{ name: 'Volume', data: queueCountData }];

    peakChartOptions.value = { ...peakChartOptions.value, xaxis: { ...peakChartOptions.value.xaxis, categories: chartCategories } };

    peakSeries.value = [{ name: 'Avg Wait (s)', data: waitTimeData }];



    renderMap();

  } catch (error) {

    console.error('Data Load Error:', error);

  }

};



// ── General Functions ──

const closeDropdown = (e) => {

  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;

};

const toggleLanguage = () => {

  language.value = language.value === 'English' ? 'Thai' : 'English';

};



onMounted(() => {

  document.addEventListener('click', closeDropdown);

  loadData();

});



onUnmounted(() => {

  document.removeEventListener('click', closeDropdown);

});



const logout = () => {

  localStorage.removeItem('token');

  localStorage.removeItem('role');

  router.push('/');

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

.logo-title { font-size: 26px; font-weight: 700; color: #d72660; line-height: 1.2; margin: 0; }

.logo-span { color: #444; }

.logo-sub { font-size: 11px; font-weight: 400; color: #999; letter-spacing: 1px; margin-top: 3px; }



/* Menu */

.menu { margin-top: 40px; }

.menu-item {

  display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 10px;

  border-radius: 12px; color: #666; cursor: pointer; transition: .25s; font-size: 14px;

}

.menu-icon { font-size: 20px; flex-shrink: 0; }

.menu-label { font-size: 16px; }

.menu-item:hover { background: #fff0f5; color: #d72660; font-weight: 600; }



/* User card */

.user-card { display: flex; align-items: center; gap: 12px; }

.user-avatar {

  width: 44px; height: 44px; border-radius: 50%; background: #d72660; color: #fff;

  display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700;

}

.user-name { font-size: 14px; font-weight: 600; color: #333; margin: 0; }

.user-role { font-size: 12px; color: #888; margin: 2px 0 0; }



/* Main */

.main-content { flex: 1; padding: 24px 32px; overflow-y: auto; }



/* Header */

.top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

.header-left { display: flex; align-items: center; gap: 32px; }

.header-title { font-size: 20px; font-weight: 600; color: #1f2937; margin: 0; }

.search-bar { background: #e5e7eb; padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px; width: 300px; }

.search-icon { font-size: 18px; color: #6b7280; }

.search-input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; color: #4b5563; }

.header-right { display: flex; align-items: center; gap: 20px; }

.action-icons { display: flex; gap: 16px; align-items: center; }

.lang-switcher {

  display: flex; align-items: center; gap: 6px; border: 2px solid #1f2937; border-radius: 20px;

  padding: 4px 12px; cursor: pointer; background: #fff; transition: all 0.2s;

}

.lang-switcher:hover { border-color: #d72660; color: #d72660; }

.lang-text { font-size: 14px; font-weight: 500; color: #1f2937; }

.profile-dropdown-container { position: relative; }

.profile-circle {

  width: 40px; height: 40px; background: #e5e7eb; border-radius: 50%;

  display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: #4b5563;

}

.profile-circle:hover { border-color: #d72660; background: #fff0f5; color: #d72660; }

.dropdown-menu {

  position: absolute; top: 50px; right: 0; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.1);

  border-radius: 12px; width: 200px; overflow: hidden; z-index: 100; border: 1px solid #f3f4f6;

}

.dropdown-item { padding: 12px 16px; font-size: 14px; color: #374151; cursor: pointer; display: flex; align-items: center; gap: 10px; }

.dropdown-item:hover { background: #f3f4f6; color: #d72660; }

.logout-item { color: #d72660; }



.page-title { margin-top: 34px; display: flex; justify-content: space-between; align-items: center; padding: 15px 0; }

.page-title h1 { color: #d72660; font-size: 36px; }

.page-title p { margin-top: 8px; color: #888; }

.export-btn {

  background: #d72660; color: white; border: none; padding: 14px 18px; border-radius: 12px;

  font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;

}

.export-btn:hover { background: #be1c50; }



/* FILTER */

.filters { margin-top: 24px; display: flex; gap: 18px; }

.filter-group { display: flex; flex-direction: column; gap: 8px; }

.filter-group label { font-size: 11px; font-weight: 700; color: #999; letter-spacing: .5px; }



.date-filter-wrapper { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.select-box {

  position: relative; width: 270px; height: 50px; background: white; border: 1px solid #ececec;

  border-radius: 14px; display: flex; align-items: center; padding: 0 14px;

}

.select-box select {

  width: 100%; height: 100%; border: none; outline: none; background: transparent;

  appearance: none; font-size: 14px; color: #444; cursor: pointer; padding-left: 28px;

}

.select-box i.bx-calendar { position: absolute; left: 14px; color: #888; }

.arrow { position: absolute; right: 14px; color: #888; pointer-events: none; }



.custom-dates { display: flex; align-items: center; gap: 10px; }

.date-input {

  height: 50px; padding: 0 14px; border: 1px solid #ececec; border-radius: 14px;

  font-family: 'Inter', sans-serif; font-size: 14px; color: #444; outline: none; background: white; transition: border-color 0.2s;

}

.date-input:focus { border-color: #d72660; }

.date-sep { color: #999; font-size: 13px; font-weight: 600; }



/* STATS */

.stats { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

.stat-card { background: white; border-radius: 18px; padding: 12px; border: 1px solid #f0f0f0; }

.stat-top { display: flex; justify-content: space-between; color: #888; font-size: 11px; font-weight: 600; }

.stat-top i { font-size: 18px; }

.stat-card h2 { margin-top: 16px; font-size: 24px; color: #222; }

.stat-bottom { margin-top: 10px; }

.stat-bottom p { margin-top: 6px; color: #999; font-size: 12px; }

.green { color: #28b463; font-weight: 600; }

.red { color: #d72660; font-weight: 600; }



/* GRAPH SECTION */

.graph-section { margin-top: 10px; display: grid; grid-template-columns: 2fr 1fr; gap: 18px; }

.graph-card { background: white; border-radius: 22px; padding: 14px; border: 1px solid #f0f0f0; }

.card-header { display: flex; justify-content: space-between; }

.card-header h3 { font-size: 16px; color: #333; }

.card-header p { margin-top: 4px; font-size: 12px; color: #999; }

.legend { display: flex; gap: 14px; }

.legend span { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #888; }

.dot { width: 10px; height: 10px; border-radius: 50%; }

.pink { background: #d72660; }

.graph-area { margin-top: 20px; height: 260px; }



.peak-chart { margin-top: 20px; }

.recommend-box {

  margin-top: 20px; background: #fff1f5; border-radius: 14px; padding: 14px;

  color: #d72660; font-size: 13px; display: flex; gap: 10px; align-items: center;

}

.circle { width: 10px; height: 10px; background: #d72660; border-radius: 50%; }



/* BOTTOM */

.bottom-section { margin-top: 10px; display: grid; grid-template-columns: 2fr 1fr; gap: 18px; margin-bottom: 40px; }



/* MAP */

.map {

  margin-top: 20px; height: 180px; border-radius: 18px; position: relative;

  overflow: hidden; border: 1px solid #f0f0f0; z-index: 1;

}



.rank-card { display: flex; flex-direction: column; }

.density { font-size: 12px; color: #999; }

.density-bar { width: 100%; height: 8px; margin-top: 8px; border-radius: 20px; background: linear-gradient(to right, #4ade80, #facc15, #ef4444); }

.rank-list { margin-top: 24px; }

.rank-item { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }

.rank-number { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; }

.red-bg { background: #ffe4eb; color: #d72660; }

.yellow-bg { background: #fff5d8; color: #ffb700; }

.green-bg { background: #e4f9ec; color: #28b463; }

.text-red { color: #d72660; }

.text-yellow { color: #ffb700; }

.text-green { color: #28b463; }

.text-xl { font-size: 20px; margin-left: auto; }

.rank-info h4 { font-size: 14px; }

.rank-info p { margin-top: 4px; font-size: 12px; color: #999; }

.audit-btn { margin-top: auto; border: none; background: #fff1f5; color: #d72660; border-radius: 14px; padding: 14px; font-weight: 600; cursor: pointer; transition: 0.2s;}

.audit-btn:hover { background: #ffdce6; }



/* คลาสป้องกันการโดนตัดหน้ากระดาษ */

.avoid-page-break {

  page-break-inside: avoid;

  break-inside: avoid;

}



/* =========================================
   PRINT / EXPORT STYLES (ทำงานเฉพาะตอนกด Print/PDF)
========================================= */
@media print {
  /* 1. ซ่อนส่วนประกอบ UI ที่ไม่จำเป็น */
  .sidebar, .top-header, .filters, .export-btn {
    display: none !important;
  }

  /* 2. บังคับให้หน้าเว็บขยายให้พอดีกับกระดาษ A4 (รวมหน้าเดียว) */
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  body, .app-container, .main-content {
    background: white !important;
    width: 100% !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  /* 3. ลดขนาด Font และ Padding เพื่ออัดข้อมูลให้ลงหน้าเดียว */
  .main-content {
    font-size: 10pt !important;
  }

  .page-title { margin-top: 0 !important; margin-bottom: 15px !important; }

  /* 4. จัด Layout ใหม่ให้เป็น Grid ที่แน่นขึ้น */
  .stats {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 10px !important;
  }

  .graph-section, .bottom-section {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important; /* บีบให้กราฟอยู่ข้างกันจะได้ไม่ยาวเกิน */
    gap: 10px !important;
  }

  /* 5. ปรับการ์ดให้มีขนาดเล็กลง */
  .stat-card, .graph-card {
    padding: 10px !important;
    margin-bottom: 10px !important;
    border: 1px solid #eee !important;
  }

  .stat-card h2 { font-size: 20px !important; margin-top: 5px !important; }
  
  /* 6. ปรับขนาดกราฟ ApexCharts ให้เล็กลงเพื่อประหยัดพื้นที่ */
  .graph-area, .peak-chart {
    height: 150px !important;
  }

  /* 7. บังคับสีพื้นหลังและสีของกราฟให้ติดออกมาด้วย */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}


@media (max-width: 1200px) {

  .stats { grid-template-columns: repeat(2, 1fr); }

  .graph-section, .bottom-section { grid-template-columns: 1fr; }

}

@media (max-width: 768px) {

  .sidebar { display: none; }

  .stats { grid-template-columns: 1fr; }

  .page-title { flex-direction: column; align-items: flex-start; gap: 20px; }

}

</style>



<style>

.custom-heat-icon {

  background: transparent;

  border: none;

}

.heat-spot {

  position: absolute;

  transform: translate(-50%, -50%);

  display: flex;

  align-items: center;

  justify-content: center;

}

/* แก้จากการใช้ filter: blur() เป็น radial-gradient เพื่อให้ PDF แคปรูปได้สมบูรณ์แบบ */

.heat-glow {

  position: absolute;

  border-radius: 50%;

  z-index: 1;

}

.glow-red {

  width: 180px;

  height: 180px;

  background: radial-gradient(circle, rgba(215, 38, 96, 0.7) 0%, rgba(215, 38, 96, 0) 70%);

}

.glow-yellow {

  width: 150px;

  height: 150px;

  background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 215, 0, 0) 70%);

}

.heat-label {

  position: relative;

  z-index: 2;

  background: #d72660;

  color: white;

  padding: 8px 14px;

  border-radius: 8px;

  font-size: 12px;

  font-weight: 700;

  white-space: nowrap;

  box-shadow: 0 4px 10px rgba(215, 38, 96, 0.3);

}

</style>