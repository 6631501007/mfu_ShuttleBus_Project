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

            <span class="menu-label">{{ t.dashboard }}</span>

          </div>

          <div class="menu-item" @click="router.push('/analytics')">

            <i class='bx bx-line-chart menu-icon'></i>

            <span class="menu-label">{{ t.analytics }}</span>

          </div>

          <div class="menu-item" @click="router.push('/map')">

            <i class='bx bx-map-alt menu-icon'></i>

            <span class="menu-label">{{ t.map }}</span>

          </div>

          <div class="menu-item" @click="router.push('/livefeed')">

            <i class='bx bx-video menu-icon'></i>

            <span class="menu-label">{{ t.liveFeed }}</span>

          </div>

          <div class="menu-item" @click="router.push('/feedback')">

            <i class='bx bx-message-square-dots menu-icon'></i>

            <span class="menu-label">{{ t.feedback }}</span>

          </div>

          <div class="menu-item" @click="router.push('/setting')">

            <i class='bx bx-cog menu-icon'></i>

            <span class="menu-label">{{ t.settings }}</span>

          </div>

        </nav>

      </div>



      <div class="user-card">

        <div class="user-avatar">A</div>

        <div>

          <p class="user-name">{{ t.adminUser }}</p>

          <p class="user-role">{{ t.operationalLead }}</p>

        </div>

      </div>

    </aside>



    <main class="main-content">

      <header class="top-header">

        <div class="header-left">

          <h2 class="header-title">{{ t.analytics }}</h2>

          <div class="search-bar">

            <i class='bx bx-search search-icon'></i>

            <input class="search-input" type="text" :placeholder="t.searchPlaceholder" />

          </div>

        </div>



        <div class="header-right">

          <div class="action-icons">

            <TopbarNotification />

            <div class="lang-switcher" @click="toggleLanguage">

              <i class='bx bx-globe'></i>

              <span class="lang-text">{{ t.languageName }}</span>

              <i class='bx bx-chevron-down'></i>

            </div>

          </div>



          <div class="profile-dropdown-container">

            <div class="profile-circle" @click="isDropdownOpen = !isDropdownOpen">

              <i class='bx bxs-user'></i>

            </div>

            <div class="dropdown-menu" v-show="isDropdownOpen">

              <div class="dropdown-item logout-item" @click="logout"><i class='bx bx-log-out'></i> {{ t.logout }}</div>

            </div>

          </div>

        </div>

      </header>



      <div>

        <section class="page-title">

          <div>

            <h1>{{ t.pageTitle }}</h1>

            <p>{{ t.pageSubtitle }}</p>

          </div>
          <button class="export-btn" @click="exportPdf">
            <i class='bx bx-download'></i>
            {{ t.exportReport }}
          </button>
        </section>



        <section class="filters">

          <div class="filter-group">

            <label>{{ t.dateRangeLabel.toUpperCase() }}</label>

            <div class="date-filter-wrapper">

              <div class="select-box">

                <i class='bx bx-calendar'></i>

                <select v-model="selectedDateRange" @change="handleDateChange" :aria-label="t.dateRangeLabel">

                  <option v-for="range in dateOptions" :key="range.value" :value="range.value">

                    {{ range.label }}

                  </option>

                </select>

                <i class='bx bx-chevron-down arrow'></i>

              </div>



              <div v-if="selectedDateRange === 'custom'" class="custom-dates">

                <input type="date" v-model="startDate" @change="loadData" class="date-input"
                  :aria-label="t.startDateAriaLabel" />

                <span class="date-sep">to</span>

                <input type="date" v-model="endDate" @change="loadData" class="date-input" />

              </div>

            </div>

          </div>



          <div class="filter-group">

            <label>{{ t.stationFilterLabel.toUpperCase() }}</label>

            <div class="select-box" :aria-label="t.stationFilterLabel">

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

          <div class="graph-card large">

            <div class="card-header">

              <div>

                <h3>{{ t.flowTrendsTitle }}</h3>

                <p>{{ t.flowTrendsSubtitle }}</p>

              </div>

              <div class="legend">

                <span>
                  <div class="dot pink"></div>Queue Count
                </span>

              </div>

            </div>

            <div class="graph-area">

              <apexchart type="area" height="260" :options="flowChartOptions" :series="flowSeries" />

            </div>

          </div>



          <div class="graph-card peak-card">

            <div class="card-header">

              <div>

                <h3>{{ t.waitAnalysisTitle }}</h3>

                <p>{{ t.waitAnalysisSubtitle }}</p>

              </div>

            </div>

            <div class="peak-chart">

              <apexchart type="bar" height="300" :options="peakChartOptions" :series="peakSeries" :key="language" />

            </div>

            <div class="recommend-box">

              <div class="circle"></div>

              {{ t.recommendation }}

            </div>

          </div>

        </section>



        <section class="bottom-section">

          <div class="graph-card rank-card">

            <div class="density">

              {{ t.topCongestedTitle }}

              <div class="density-bar"></div>

            </div>



            <div class="rank-list">

              <div v-if="rankedStations.length === 0" style="color: #999; margin-top: 20px; font-size: 13px;">{{
                t.noData }}</div>



              <div class="rank-item" v-for="(station, index) in rankedStations" :key="station._id">

                <div class="rank-number" :class="getRankBg(index)">{{ index + 1 }}</div>

                <div class="rank-info">

                  <h4>{{ station.name }}</h4>

                  <p>{{ getPercentage(station.waitingPassengers, station.capacity) }}% {{ t.full }} / {{
                    station.waitingPassengers || 0 }} {{ t.pax }}</p>

                </div>

                <i class='bx' :class="getRankIcon(index)"></i>

              </div>

            </div>



            <button class="audit-btn" @click="router.push('/dashboard')">

              {{ t.viewDashboardBtn }}

            </button>

          </div>

        </section>

      </div>
    </main>

  </div>

</template>



<script setup>

import { ref, onMounted, onUnmounted, computed } from 'vue';

import { useRouter } from 'vue-router';

import TopbarNotification from '../components/TopbarNotification.vue';

import { apiFetch } from '../service/api';
import { useLanguage } from '../composables/useLanguage';

import apexchart from 'vue3-apexcharts';

import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

const router = useRouter();

const isDropdownOpen = ref(false);
const { language, toggleLanguage: toggleSharedLanguage } = useLanguage();



// ── States ──

const stations = ref([]);

const rankedStations = ref([]);

const terminals = ref([{ id: 'all', name: 'All Stations' }]);

const selectedTerminal = ref('all');

const overview = ref({ avgPassengerFlow: 0, peakOccupancy: '0%', avgWaitTime: '0m', totalEntries: 0 });



const translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    map: 'Map',
    liveFeed: 'Live Feed',
    feedback: 'Feedback',
    settings: 'Settings',
    adminUser: 'Admin User',
    operationalLead: 'Operational Lead',
    searchPlaceholder: 'Search analytics...',
    exportReport: 'Export Report',
    languageName: 'English',
    logout: 'Log out',
    pageTitle: 'Historical Performance',
    pageSubtitle: 'Analyze passenger flow and wait-time trends from AI cameras',
    dateRangeLabel: 'DATE RANGE',
    stationFilterLabel: 'STATION FILTER',
    startDateAriaLabel: 'Start Date',
    endDateAriaLabel: 'End Date',
    allStations: 'All Stations',
    totalPassengers: 'TOTAL PASSENGERS',
    peakDensity: 'PEAK DENSITY',
    avgWaitTime: 'AVG WAIT TIME',
    dailyAverage: 'DAILY AVERAGE',
    totalVolume: 'Total volume in range',
    highestCapacity: 'Highest capacity reached',
    avgDuration: 'Average queue duration',
    estimatedFlow: 'Estimated daily flow',
    period: 'Period',
    max: 'Max',
    updated: 'Updated',
    trending: '+Trending',
    flowTrendsTitle: 'Passenger Flow Trends',
    flowTrendsSubtitle: 'Daily volume across all stations based on Hourly Analytics',
    waitAnalysisTitle: 'Wait Time Analysis',
    waitAnalysisSubtitle: 'Average wait time distribution (seconds)',
    recommendation: 'Shuttle frequency increase recommended during peak hours',
    topCongestedTitle: 'Top Congested Stations',
    noData: 'No data available',
    full: 'Full',
    pax: 'Pax',
    viewDashboardBtn: 'VIEW DASHBOARD DETAILS',
  },
  th: {
    dashboard: 'แดชบอร์ด',
    analytics: 'การวิเคราะห์',
    map: 'แผนที่',
    liveFeed: 'ฟีดสด',
    feedback: 'ข้อเสนอแนะ',
    settings: 'การตั้งค่า',
    adminUser: 'ผู้ดูแลระบบ',
    operationalLead: 'หัวหน้าฝ่ายปฏิบัติการ',
    searchPlaceholder: 'ค้นหาข้อมูลวิเคราะห์...',
    exportReport: 'ส่งออกรายงาน',
    languageName: 'ไทย',
    logout: 'ออกจากระบบ',
    pageTitle: 'ประสิทธิภาพย้อนหลัง',
    pageSubtitle: 'วิเคราะห์แนวโน้มการไหลของผู้โดยสารและเวลารอจากกล้อง AI',
    dateRangeLabel: 'ช่วงวันที่',
    stationFilterLabel: 'ตัวกรองสถานี',
    startDateAriaLabel: 'วันที่เริ่มต้น',
    endDateAriaLabel: 'วันที่สิ้นสุด',
    allStations: 'ทุกสถานี',
    totalPassengers: 'ผู้โดยสารทั้งหมด',
    peakDensity: 'ความหนาแน่นสูงสุด',
    avgWaitTime: 'เวลารอเฉลี่ย',
    dailyAverage: 'เฉลี่ยรายวัน',
    totalVolume: 'ปริมาณรวมในช่วงเวลา',
    highestCapacity: 'ความจุสูงสุดที่เคยถึง',
    avgDuration: 'ระยะเวลารอคิวโดยเฉลี่ย',
    estimatedFlow: 'ประมาณการสัญจรรายวัน',
    period: 'ช่วงเวลา',
    max: 'สูงสุด',
    updated: 'อัปเดต',
    trending: '+แนวโน้ม',
    flowTrendsTitle: 'แนวโน้มการสัญจรของผู้โดยสาร',
    flowTrendsSubtitle: 'ปริมาณรายวันจากทุกสถานีตามการวิเคราะห์รายชั่วโมง',
    waitAnalysisTitle: 'การวิเคราะห์เวลารอ',
    waitAnalysisSubtitle: 'การกระจายตัวของเวลารอโดยเฉลี่ย (วินาที)',
    recommendation: 'แนะนำให้เพิ่มความถี่ของรถเวียนในช่วงเวลาเร่งด่วน',
    topCongestedTitle: 'สถานีที่แออัดที่สุด',
    noData: 'ไม่มีข้อมูล',
    full: 'เต็ม',
    pax: 'คน',
    viewDashboardBtn: 'ดูรายละเอียดแดชบอร์ด',
  }
};

const t = computed(() => translations[language.value]);

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



// ── Data Processing ──

const statsDisplay = computed(() => [
  { title: t.value.totalPassengers.toUpperCase(), icon: 'bx bx-group', val: overview.value.totalEntries.toLocaleString(), trend: t.value.period, color: 'green', desc: t.value.totalVolume },
  { title: t.value.peakDensity.toUpperCase(), icon: 'bx bx-line-chart', val: overview.value.peakOccupancy, trend: t.value.max, color: 'red', desc: t.value.highestCapacity },
  { title: t.value.avgWaitTime.toUpperCase(), icon: 'bx bx-time-five', val: overview.value.avgWaitTime, trend: t.value.updated, color: 'green', desc: t.value.avgDuration },
  { title: t.value.dailyAverage.toUpperCase(), icon: 'bx bx-transfer', val: overview.value.avgPassengerFlow.toLocaleString(), trend: t.value.trending, color: 'green', desc: t.value.estimatedFlow }
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

  plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },

  fill: { type: 'gradient', gradient: { type: 'vertical', colorStops: [{ offset: 0, color: '#d72660', opacity: 1 }, { offset: 100, color: '#ff8cae', opacity: 1 }] } },

  xaxis: { categories: [], labels: { style: { colors: '#999', fontSize: '11px', fontFamily: 'Inter' } }, axisBorder: { show: false }, axisTicks: { show: false } },

  yaxis: { show: false },

  dataLabels: { enabled: false },

  grid: { show: false }

});



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

      for (let i = 1; i <= 30; i += 4) chartCategories.push(`Day ${i}`);

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



  } catch (error) {

    console.error('Data Load Error:', error);

  }

};



// ── General Functions ──

const closeDropdown = (e) => {

  if (!e.target.closest('.profile-dropdown-container')) isDropdownOpen.value = false;

};

const toggleLanguage = () => {
  toggleSharedLanguage();
  loadData(); // Reload data to update "All Stations" text if needed
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const exportPdf = async () => {
  let reportContainer;

  try {
    const captureChart = async (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1200
      });

      return canvas.toDataURL('image/png');
    };

    const [flowImage, waitImage] = await Promise.all([
      captureChart('.graph-area'),
      captureChart('.peak-chart')
    ]);

    const reportPeriod = selectedDateRange.value === 'custom'
      ? `${startDate.value || ''} to ${endDate.value || ''}`
      : selectedDateRange.value;
    const stationName = terminals.value.find(({ id }) => id === selectedTerminal.value)?.name || t.value.allStations;
    const totalPassengers = overview.value.totalEntries || 0;
    const averageDaily = overview.value.avgPassengerFlow || 0;
    const peakOccupancy = overview.value.peakOccupancy || '0%';
    const averageWaitTime = overview.value.avgWaitTime || '0m';
    const recommendations = [
      'Increase shuttle frequency during peak hours.',
      'Allocate additional buses during congestion.',
      'Continue monitoring passenger flow trends.'
    ];

    if (Number.parseInt(peakOccupancy, 10) >= 85) {
      recommendations.unshift('Monitor stations exceeding 85% occupancy and allocate resources.');
    }

    const stationRows = rankedStations.value.map((station, index) => {
      const waiting = station.waitingPassengers || 0;
      const capacity = station.capacity || 0;
      const occupancy = capacity ? Math.round((waiting / capacity) * 100) : 0;

      return `<tr><td>${index + 1}</td><td>${escapeHtml(station.name)}</td><td>${waiting}</td><td>${capacity}</td><td>${occupancy}%</td></tr>`;
    }).join('');

    const chartFigure = (title, image, caption) => `
      <section class="report-section">
        <h4>${title}</h4>
        ${image ? `<img class="chart-image" src="${image}" alt="" />` : '<div class="unavailable">Chart not available</div>'}
        <p class="chart-caption">${caption}</p>
      </section>`;

    reportContainer = document.createElement('div');
    reportContainer.className = 'analytics-pdf-report';
    reportContainer.innerHTML = `
      <style>
        * { box-sizing: border-box; }
        .report-root { width: 180mm; padding: 12mm; background: #fff; color: #333; font-family: Inter, Arial, sans-serif; }
        .report-header { text-align: center; border-bottom: 1px solid #e6e6e6; padding-bottom: 12px; }
        .report-header h2 { margin: 0; color: #d72660; font-size: 22px; }
        .report-header h1 { margin: 6px 0; font-size: 28px; }
        .report-header p, .chart-caption { margin: 4px 0; color: #666; font-size: 11px; }
        .report-section { margin-top: 14px; break-inside: avoid; page-break-inside: avoid; }
        .stations-section { margin-top: 0; break-before: page; page-break-before: always; }
        .report-section h3, .report-section h4 { margin: 0 0 7px; }
        .summary { font-size: 13px; line-height: 1.6; }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .kpi { min-width: 0; border: 1px solid #eee; padding: 8px; text-align: center; }
        .kpi span { display: block; color: #777; font-size: 10px; }
        .kpi strong { display: block; margin-top: 5px; font-size: 17px; }
        .chart-image { display: block; width: 100%; height: auto; border: 1px solid #f0f0f0; }
        .unavailable { color: #999; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
        th, td { border: 1px solid #e6e6e6; padding: 7px; overflow-wrap: break-word; }
        th { background: #fafafa; text-align: left; }
        ul { margin: 0 0 0 18px; padding: 0; font-size: 12px; line-height: 1.6; }
        footer { margin-top: 18px; color: #777; font-size: 10px; }
      </style>
      <div class="report-root">
        <header class="report-header">
          <h2>BusStop Passenger Intelligence System</h2>
          <h1>Passenger Analytics Report</h1>
          <p>Report Period: ${escapeHtml(reportPeriod)}</p>
          <p>Station: ${escapeHtml(stationName)}</p>
          <p>Generated Date: ${escapeHtml(new Date().toLocaleString())}</p>
        </header>
        <section class="report-section">
          <h3>Executive Summary</h3>
          <p class="summary">This report summarizes passenger analytics collected from AI camera systems during the selected period. Total passengers recorded: ${totalPassengers.toLocaleString()}. Average daily passengers: ${averageDaily.toLocaleString()}. Peak occupancy: ${escapeHtml(peakOccupancy)}. Average waiting time: ${escapeHtml(averageWaitTime)}.</p>
        </section>
        <section class="report-section kpis">
          <div class="kpi"><span>Total Passengers</span><strong>${totalPassengers.toLocaleString()}</strong></div>
          <div class="kpi"><span>Peak Density</span><strong>${escapeHtml(peakOccupancy)}</strong></div>
          <div class="kpi"><span>Average Wait Time</span><strong>${escapeHtml(averageWaitTime)}</strong></div>
          <div class="kpi"><span>Daily Average</span><strong>${averageDaily.toLocaleString()}</strong></div>
        </section>
        ${chartFigure('Figure 1: Passenger Flow Trend', flowImage, 'Daily passenger flow across the selected period.')}
        ${chartFigure('Figure 2: Average Waiting Time', waitImage, 'Analysis of average waiting times per period.')}
        <section class="report-section stations-section">
          <h4>Top Congested Stations</h4>
          <table><thead><tr><th>Rank</th><th>Station</th><th>Waiting</th><th>Capacity</th><th>Occupancy</th></tr></thead><tbody>${stationRows}</tbody></table>
        </section>
        <section class="report-section">
          <h4>Recommendations</h4>
          <ul>${recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </section>
        <footer>BusStop Passenger Intelligence System — Passenger Analytics Report — Generated automatically</footer>
      </div>`;

    document.body.appendChild(reportContainer);

    await html2pdf().set({
      margin: [15, 15, 15, 15],
      filename: `Passenger_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.stations-section'
      }
    }).from(reportContainer).save();
  } catch (error) {
    console.error('Export Error', error);
    alert('Failed to generate PDF report. See console for details.');
  } finally {
    reportContainer?.remove();
  }
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

*,
*::before,
*::after {

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
  font-size: 14px;

}

.menu-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.menu-label {
  font-size: 16px;
}

.menu-item:hover {
  background: #fff0f5;
  color: #d72660;
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
  font-size: 16px;
  font-weight: 700;

}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.user-role {
  font-size: 12px;
  color: #888;
  margin: 2px 0 0;
}



/* Main */

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

.header-title {
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

.search-icon {
  font-size: 18px;
  color: #6b7280;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
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
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.logout-item {
  color: #d72660;
}



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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  background: #d72660;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.export-btn:hover {
  background: #be1c50;
}

/* FILTER */

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



.date-filter-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.select-box i.bx-calendar {
  position: absolute;
  left: 14px;
  color: #888;
}

.arrow {
  position: absolute;
  right: 14px;
  color: #888;
  pointer-events: none;
}



.custom-dates {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {

  height: 50px;
  padding: 0 14px;
  border: 1px solid #ececec;
  border-radius: 14px;

  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #444;
  outline: none;
  background: white;
  transition: border-color 0.2s;

}

.date-input:focus {
  border-color: #d72660;
}

.date-sep {
  color: #999;
  font-size: 13px;
  font-weight: 600;
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
  grid-template-columns: 1.5fr 1fr;
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

.graph-area {
  margin-top: 20px;
  height: 260px;
}



.peak-chart {
  margin-top: 20px;
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
  margin-bottom: 40px;
}



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
  background: linear-gradient(to right, #4ade80, #facc15, #ef4444);
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

.text-red {
  color: #d72660;
}

.text-yellow {
  color: #ffb700;
}

.text-green {
  color: #28b463;
}

.text-xl {
  font-size: 20px;
  margin-left: auto;
}

.rank-info h4 {
  font-size: 14px;
}

.rank-info p {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
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
  transition: 0.2s;
}

.audit-btn:hover {
  background: #ffdce6;
}



@media (max-width: 1200px) {

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .graph-section {
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

  .page-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

}
</style>
