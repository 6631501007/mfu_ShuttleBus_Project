<template>
  <div style="display:flex; height:100vh; overflow:hidden; font-family:'JetBrains Mono','Fira Mono','Courier New',monospace; background:#ebebeb;">

    <!-- SIDEBAR -->
    <aside
      style="display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; transition:width 0.3s; border-right:1px solid #e0e0e0; background:#f5f5f5;"
      :style="{ width: sidebarCollapsed ? '56px' : '176px' }"
    >
      <!-- Logo -->
      <div style="display:flex; align-items:center; gap:8px; padding:16px 12px; border-bottom:1px solid #e0e0e0; min-height:64px;">
        <div style="flex-shrink:0; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; background:#d91e63;">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div v-if="!sidebarCollapsed" style="overflow:hidden;">
          <div style="font-size:13px; font-weight:700; line-height:1; letter-spacing:-0.02em; color:#d91e63;">FlowMetrics</div>
          <div style="font-size:10px; color:#9ca3af; line-height:1.3; margin-top:2px; letter-spacing:0.04em;">Passenger<br>Intelligence</div>
        </div>
      </div>

      <!-- Nav -->
      <nav style="flex:1; padding:12px 6px; display:flex; flex-direction:column; gap:2px;">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeNav = item.id"
          style="width:100%; display:flex; align-items:center; gap:10px; padding:10px 8px; border-radius:6px; font-size:12px; font-weight:500; border:none; cursor:pointer; transition:all 0.15s; position:relative; letter-spacing:0.03em;"
          :style="activeNav === item.id
            ? 'background:#ffe8f0; color:#1f2937;'
            : 'background:transparent; color:#6b7280;'"
          @mouseenter="e => { if(activeNav !== item.id) e.currentTarget.style.background='#f3f4f6'; e.currentTarget.style.color='#374151'; }"
          @mouseleave="e => { if(activeNav !== item.id) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; } }"
        >
          <span
            v-if="activeNav === item.id"
            style="position:absolute; left:0; top:4px; bottom:4px; width:3px; border-radius:0 2px 2px 0; background:#d91e63;"
          ></span>
          <span style="flex-shrink:0; width:16px; height:16px; display:flex; align-items:center; justify-content:center;" v-html="item.icon"></span>
          <span v-if="!sidebarCollapsed" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{{ item.label }}</span>
        </button>
      </nav>

      <!-- System Status -->
      <div style="padding:8px; border-top:1px solid #e0e0e0;">
        <div style="border-radius:6px; padding:8px; background:#ebebeb;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:8px; height:8px; border-radius:50%; flex-shrink:0; background:#4caf50; box-shadow:0 0 4px #4caf5088;"></span>
            <span v-if="!sidebarCollapsed" style="font-size:11px; color:#6b7280; letter-spacing:0.04em;">System Status</span>
          </div>
          <div v-if="!sidebarCollapsed" style="font-size:11px; font-weight:600; color:#374151; margin-top:2px; padding-left:14px;">Optimal</div>
        </div>
      </div>
    </aside>

    <!-- MAIN AREA -->
    <div style="display:flex; flex-direction:column; flex:1; min-width:0; overflow:hidden;">

      <!-- TOP HEADER -->
      <header style="display:flex; align-items:center; gap:12px; padding:0 20px; border-bottom:1px solid #e0e0e0; background:#f5f5f5; height:64px; flex-shrink:0;">
        <!-- Hamburger -->
        <button @click="sidebarCollapsed = !sidebarCollapsed" style="color:#9ca3af; background:none; border:none; cursor:pointer; flex-shrink:0; display:flex; align-items:center; padding:4px;">
          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
            <rect x="2" y="4" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>

        <!-- Breadcrumb -->
        <div style="display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#374151; letter-spacing:0.1em; text-transform:uppercase; flex-shrink:0;">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="#d91e63"/>
            <rect x="8" y="1" width="5" height="5" rx="1" fill="#d91e63" opacity=".4"/>
            <rect x="1" y="8" width="5" height="5" rx="1" fill="#d91e63" opacity=".4"/>
            <rect x="8" y="8" width="5" height="5" rx="1" fill="#d91e63" opacity=".4"/>
          </svg>
          APC &amp; Queue Monitor
        </div>

        <!-- Divider -->
        <div style="width:1px; height:20px; background:#e0e0e0; flex-shrink:0;"></div>

        <!-- Search -->
        <div style="flex:1; max-width:260px; position:relative;">
          <svg style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#9ca3af;" width="13" height="13" fill="none" viewBox="0 0 13 13">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search cameras..."
            style="width:100%; padding:6px 12px 6px 32px; font-size:11px; border-radius:6px; border:1px solid #e0e0e0; background:white; color:#374151; font-family:inherit; outline:none; box-sizing:border-box; letter-spacing:0.03em;"
          />
        </div>

        <div style="flex:1;"></div>

        <!-- Icons -->
        <div style="display:flex; align-items:center; gap:12px;">
          <button style="position:relative; color:#9ca3af; background:none; border:none; cursor:pointer; display:flex; align-items:center;">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="13" cy="4" r="2.5" fill="#d91e63"/>
            </svg>
          </button>
          <button style="color:#9ca3af; background:none; border:none; cursor:pointer; display:flex; align-items:center;">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 7.5c0-1.1.9-2 2-2 1.1 0 2 .9 2 2S10.1 10.5 9 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="9" cy="13" r="1" fill="currentColor"/>
            </svg>
          </button>
          <!-- Profile -->
          <div style="display:flex; align-items:center; gap:8px; padding-left:8px; border-left:1px solid #e0e0e0;">
            <div style="text-align:right;">
              <div style="font-size:11px; font-weight:600; color:#374151; letter-spacing:0.03em;">Admin Panel</div>
              <div style="font-size:9px; color:#9ca3af; letter-spacing:0.08em; text-transform:uppercase;">Operational Lead</div>
            </div>
            <div style="width:32px; height:32px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#d91e63,#ff6b9d); overflow:hidden;">
              <img src="https://i.pravatar.cc/32?img=68" alt="AP" style="width:100%; height:100%; object-fit:cover;" @error="e => e.target.style.display='none'" />
            </div>
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <main style="flex:1; overflow:auto; padding:16px; background:#ebebeb;">

        <!-- Section header -->
        <div style="display:flex; flex-wrap:wrap; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px;">
          <div>
            <h1 style="font-size:13px; font-weight:700; letter-spacing:0.03em; color:#d91e63; margin:0;">Terminal A - South Wing</h1>
            <p style="font-size:11px; color:#6b7280; letter-spacing:0.03em; margin:4px 0 0;">Live monitoring of Gates 12–24 and Security Checkpoints</p>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button
              v-for="btn in viewButtons"
              :key="btn.id"
              @click="activeView = btn.id"
              style="display:flex; align-items:center; gap:6px; padding:6px 12px; font-size:11px; font-weight:600; border-radius:6px; border:1px solid; cursor:pointer; transition:all 0.15s; letter-spacing:0.03em; font-family:inherit;"
              :style="activeView === btn.id
                ? 'background:#d91e63; color:white; border-color:#d91e63;'
                : 'background:white; color:#374151; border-color:#e0e0e0;'"
            >
              <span v-html="btn.icon"></span>
              {{ btn.label }}
              <span v-if="btn.id === 'heatmap'" style="width:10px; height:10px; border-radius:50%;" :style="activeView === 'heatmap' ? 'background:rgba(255,255,255,0.5);' : 'background:#d91e63;'"></span>
            </button>
          </div>
        </div>

        <!-- Lower grid: zones + cameras -->
        <div style="display:flex; gap:16px; min-height:0;">

          <!-- LEFT COLUMN -->
          <div style="display:flex; flex-direction:column; gap:12px; flex-shrink:0; width:210px;">

            <!-- Monitoring Zones -->
            <div style="border-radius:8px; padding:12px; background:white; border:1px solid #e5e7eb;">
              <div style="font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:12px;">Monitoring Zones</div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div
                  v-for="zone in zones"
                  :key="zone.name"
                  style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:6px; font-size:11px; background:#f9fafb;"
                >
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:10px; height:10px; border-radius:50%; flex-shrink:0;" :style="`background:${zone.color};`"></span>
                    <span style="color:#374151; font-weight:500; letter-spacing:0.02em;">{{ zone.name }}</span>
                  </div>
                  <span style="font-weight:700; color:#1f2937; font-variant-numeric:tabular-nums;">{{ zone.pax }} pax</span>
                </div>
              </div>
            </div>

            <!-- Alert card -->
            <div style="border-radius:8px; padding:12px; background:#d91e63;">
              <div style="font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#fecdd3; margin-bottom:4px;">Real-Time Alert</div>
              <div style="font-size:13px; font-weight:700; color:white; letter-spacing:0.02em; margin-bottom:6px;">Crowd Density High</div>
              <p style="font-size:11px; color:#fecdd3; line-height:1.5; margin:0 0 12px;">
                Sector 4C is exceeding threshold. Automated dispatch suggested.
              </p>
              <button style="width:100%; padding:6px 0; font-size:11px; font-weight:700; letter-spacing:0.05em; border-radius:6px; border:none; cursor:pointer; background:white; color:#d91e63; font-family:inherit; transition:opacity 0.15s;"
                @mouseenter="e => e.currentTarget.style.opacity='0.9'"
                @mouseleave="e => e.currentTarget.style.opacity='1'"
              >
                View Sector
              </button>
            </div>
          </div>

          <!-- CAMERA GRID -->
          <div style="flex:1; display:flex; flex-direction:column; gap:12px; min-width:0; overflow-y:auto;">
            <div
              v-for="cam in cameras"
              :key="cam.id"
              style="position:relative; border-radius:8px; overflow:hidden; flex-shrink:0; aspect-ratio:16/6;"
            >
              <!-- Dark background -->
              <div style="position:absolute; inset:0;" :style="`background:${cam.bg};`"></div>
              <!-- Grid overlay -->
              <div style="position:absolute; inset:0; opacity:0.1; background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px); background-size:20px 20px;"></div>
              <!-- Noise -->
              <div style="position:absolute; inset:0; opacity:0.2; background:radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,200,150,0.06) 0%, transparent 50%);"></div>

              <!-- Silhouette people -->
              <div style="position:absolute; bottom:0; left:0; right:0; display:flex; align-items:flex-end; justify-content:space-around; padding:0 16px 4px; height:55%;">
                <div v-for="(p, i) in cam.people" :key="i" style="opacity:0.4;" :style="`width:${p.w}px;`">
                  <svg :width="p.w" :height="p.w*2.8" viewBox="0 0 10 28" fill="rgba(255,255,255,0.35)">
                    <ellipse cx="5" cy="4" rx="3.5" ry="3.5"/>
                    <path d="M1 10 Q5 8 9 10 L8.5 22 H6.5 L5 16 L3.5 22 H1.5 Z"/>
                  </svg>
                </div>
              </div>

              <!-- Bounding boxes -->
              <div v-if="cam.boxes" style="position:absolute; inset:0;">
                <div
                  v-for="box in cam.boxes"
                  :key="box.id"
                  style="position:absolute; border-width:1.5px; border-style:solid;"
                  :style="`left:${box.x}%;top:${box.y}%;width:${box.w}%;height:${box.h}%; border-color:${box.color};`"
                >
                  <span style="position:absolute; top:-16px; left:0; color:white; font-size:8px; padding:1px 4px; line-height:1; font-family:monospace;" :style="`background:${box.color};`">{{ box.id }}</span>
                </div>
              </div>

              <!-- Top label bar -->
              <div style="position:absolute; top:0; left:0; right:0; display:flex; align-items:center; justify-content:space-between; padding:8px; background:linear-gradient(to bottom,rgba(0,0,0,0.7),transparent);">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span
                    style="display:flex; align-items:center; gap:4px; padding:2px 6px; border-radius:3px; color:white; font-weight:700; font-size:8px; letter-spacing:0.08em;"
                    :style="`background:${cam.status === 'REC' ? '#d91e63' : '#555'};`"
                  >
                    <span v-if="cam.status === 'REC'" style="width:6px; height:6px; border-radius:50%; background:white;" :style="{ animation: 'pulse 1.2s ease-in-out infinite' }"></span>
                    {{ cam.status }}
                  </span>
                  <span style="color:white; font-weight:700; font-size:9px; letter-spacing:0.08em; text-shadow:0 1px 3px rgba(0,0,0,0.8);">{{ cam.id }} | {{ cam.name }}</span>
                </div>
                <span style="color:#d1d5db; font-size:8px; font-variant-numeric:tabular-nums;">{{ liveTime }}</span>
              </div>

              <!-- Bottom scan line -->
              <div style="position:absolute; bottom:0; left:0; right:0; height:24px; opacity:0.3; background:linear-gradient(to top,rgba(0,200,100,0.15),transparent);"></div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const sidebarCollapsed = ref(false)
const activeNav = ref('live-feed')
const activeView = ref('heatmap')
const liveTime = ref('')

const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: `<svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: `<svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="1" y="8" width="2.5" height="5" rx="0.5" fill="currentColor"/><rect x="5.5" y="5" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="10" y="2" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'live-feed', label: 'Live Feed',
    icon: `<svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="3" fill="currentColor"/><path d="M2.5 4A6.5 6.5 0 0011.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 10A6.5 6.5 0 0111.5 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`
  },
  {
    id: 'settings', label: 'Settings',
    icon: `<svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
  }
]

const viewButtons = [
  {
    id: 'grid', label: 'Grid',
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="0.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/><rect x="6.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.2"/></svg>`
  },
  {
    id: 'focus', label: 'Focus',
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.4"/></svg>`
  },
  {
    id: 'heatmap', label: 'Heatmap View',
    icon: `<svg width="11" height="11" fill="none" viewBox="0 0 11 11"><path d="M5.5 1C3 1 1 3 1 5.5S3 10 5.5 10 10 8 10 5.5 8 1 5.5 1z" fill="currentColor" opacity="0.3"/><path d="M5.5 3C4 3 3 4 3 5.5S4 8 5.5 8 8 7 8 5.5 7 3 5.5 3z" fill="currentColor" opacity="0.5"/><circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/></svg>`
  }
]

const zones = [
  { name: 'Main Entry',  pax: 142, color: '#4caf50' },
  { name: 'Security L1', pax: 89,  color: '#ff9800' },
  { name: 'Duty Free B', pax: 312, color: '#c41c3b' },
  { name: 'Gate 14-16',  pax: 42,  color: '#00897b' }
]

const cameras = [
  {
    id: 'CAM-001', name: 'SOUTH ENTRY', status: 'REC',
    bg: 'linear-gradient(135deg,#1a2030 0%,#0d1520 100%)',
    people: [{w:8},{w:10},{w:7},{w:9}],
    boxes: [
      { id: 'ID:4022', x:55, y:18, w:16, h:42, color:'#d91e63' },
      { id: 'ID:4023', x:74, y:30, w:14, h:38, color:'#d91e63' }
    ]
  },
  {
    id: 'CAM-014', name: 'SECURITY L1', status: 'REC',
    bg: 'linear-gradient(135deg,#1a2520 0%,#0d1a18 100%)',
    people: [{w:9},{w:8},{w:11},{w:7},{w:9}],
    boxes: null
  },
  {
    id: 'CAM-022', name: 'DUTY FREE B', status: 'STANDBY',
    bg: 'linear-gradient(135deg,#1e1e28 0%,#141420 100%)',
    people: [{w:7},{w:8},{w:10},{w:7},{w:9},{w:8}],
    boxes: null
  },
  {
    id: 'CAM-008', name: 'GATE 14-16', status: 'REC',
    bg: 'linear-gradient(135deg,#1a1e20 0%,#10141a 100%)',
    people: [{w:9},{w:7}],
    boxes: null
  }
]

let timer = null
function updateTime() {
  const now = new Date()
  liveTime.value = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

* {
  box-sizing: border-box;
}

input:focus {
  border-color: #f9a8d4 !important;
}

button:hover svg {
  color: #374151;
}
</style>