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
          <h2 class="header-title">Feedback</h2>
          <div class="search-bar">
            <i class='bx bx-search search-icon'></i>
            <input class="search-input" type="text" placeholder="Search feedback..." />
          </div>
        </div>

        <div class="header-right">
          <div class="action-icons">
            <i class='bx bx-bell icon-btn'></i>
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

      <div class="feedback-page">
        <!-- HEADER -->
        <div class="feedback-header">
          <div>
            <h1 class="page-title">User Feedback</h1>
            <p class="page-subtitle">ดูข้อเสนอแนะจากผู้ใช้และติดตามสถานะการตอบกลับได้ที่นี่</p>
          </div>
        </div>

        <!-- SUMMARY -->
        <div class="feedback-summary">
          <div class="summary-item">
            <span class="summary-label">New feedback</span>
            <span class="summary-value">{{ summary.newFeedback }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Resolved</span>
            <span class="summary-value">{{ summary.resolved }}</span>
          </div>
        </div>

        <!-- SUBMIT FORM -->
        <div class="feedback-form">
          <div class="form-row">
            <input v-model="newFeedback.userName" type="text" placeholder="Your name" />
            <select v-model="newFeedback.rating">
              <option value="1">⭐ Rating: 1</option>
              <option value="2">⭐ Rating: 2</option>
              <option value="3">⭐ Rating: 3</option>
              <option value="4">⭐ Rating: 4</option>
              <option value="5">⭐ Rating: 5</option>
            </select>
          </div>
          <textarea v-model="newFeedback.message" placeholder="Write your feedback here..."></textarea>
          <button class="btn-dark" @click="submitFeedback">Submit Feedback</button>
        </div>

        <!-- FEEDBACK ITEMS -->
        <div class="feedback-list">
          <div v-if="feedbacks.length === 0" class="empty-state">No feedback available.</div>
          <div class="feedback-item" v-for="item in feedbacks" :key="item._id">
            <div class="feedback-header-row">
              <div class="feedback-user">
                <div class="user-avatar-small">{{ item.userName?.slice(0, 2) }}</div>
                <div>
                  <p class="user-name-feedback">{{ item.userName }}</p>
                  <p class="feedback-date">{{ formatDate(item.createdAt) }}</p>
                </div>
              </div>
              <div class="feedback-status" :class="item.status === 'resolved' ? 'resolved' : 'new'">{{ item.status }}</div>
            </div>
            <div class="feedback-message">
              <p class="feedback-text">{{ item.message }}</p>
              <p class="feedback-rating">⭐ Rating: {{ item.rating }}/5</p>
            </div>
            <div class="feedback-response" v-if="item.response">
              <p class="response-label">Response:</p>
              <p class="response-text">{{ item.response }}</p>
            </div>
            <div class="feedback-actions" v-if="item.status !== 'resolved'">
              <button class="btn-action btn-reply">
                <i class='bx bx-message-dots'></i> Reply
              </button>
              <button class="btn-action btn-resolve" @click="resolveFeedback(item._id)">
                <i class='bx bx-check'></i> Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDropdownOpen = ref(false)
const language = ref('English')
const feedbacks = ref([])
const summary = ref({ newFeedback: 0, resolved: 0 })
const newFeedback = ref({ userName: '', message: '', rating: 3 })

const closeDropdown = (e) => {
  if (!e.target.closest('.profile-dropdown-container')) {
    isDropdownOpen.value = false
  }
}

const toggleLanguage = () => {
  language.value = language.value === 'English' ? 'Thai' : 'English'
}

const loadFeedbacks = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/feedback')
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Unable to load feedback')

    feedbacks.value = data.feedbacks || []
    summary.value = data.summary || { newFeedback: 0, resolved: 0 }
  } catch (error) {
    console.error(error)
  }
}

const submitFeedback = async () => {
  if (!newFeedback.value.userName || !newFeedback.value.message) {
    alert('Please enter your name and feedback message.')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFeedback.value)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Cannot submit feedback')

    newFeedback.value = { userName: '', message: '', rating: 3 }
    await loadFeedbacks()
  } catch (error) {
    console.error(error)
    alert('Unable to submit feedback')
  }
}

const resolveFeedback = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Cannot resolve feedback')
    await loadFeedbacks()
  } catch (error) {
    console.error(error)
    alert('Unable to resolve feedback')
  }
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
  loadFeedbacks()
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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
  transition: 0.25s;
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

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 32px;
  overflow-y: auto;
}

/* ===== TOP HEADER ===== */
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
  flex: 1;
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

.search-input::placeholder {
  color: #a1a1a1;
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
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #d72660;
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
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* Profile Dropdown */
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
  transition: all 0.2s;
}

.profile-circle:hover {
  background: #fff0f5;
  color: #d72660;
}

.dropdown-menu {
  position: absolute;
  top: 60px;
  right: 0;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 200px;
  overflow: hidden;
  z-index: 10000;
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
  transition: all 0.2s;
}

.dropdown-item i {
  font-size: 18px;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: #d72660;
}

.logout-item {
  color: #d72660;
}

.logout-item:hover {
  background: #fff0f5;
}

/* ===== FEEDBACK PAGE ===== */
.feedback-page {
  flex: 1;
  overflow-y: auto;
}

.feedback-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.page-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.feedback-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-label {
  display: block;
  color: #6b7280;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
  color: #d72660;
}

/* FEEDBACK LIST */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.feedback-item:hover {
  border-color: #d72660;
  box-shadow: 0 4px 16px rgba(215, 38, 96, 0.1);
}

.feedback-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.feedback-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d72660;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name-feedback {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.feedback-date {
  font-size: 12px;
  color: #9ca3af;
  margin: 2px 0 0;
}

.feedback-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.feedback-status.new {
  background: #fecaca;
  color: #dc2626;
}

.feedback-status.resolved {
  background: #d1fae5;
  color: #059669;
}

.feedback-message {
  margin-bottom: 16px;
}

.feedback-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 3px solid #d72660;
}

.feedback-rating {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.feedback-response {
  margin-bottom: 16px;
  padding: 12px;
  background: #f0fdf4;
  border-radius: 10px;
  border-left: 3px solid #10b981;
}

.response-label {
  font-size: 12px;
  font-weight: 600;
  color: #059669;
  margin: 0 0 4px;
}

.response-text {
  font-size: 13px;
  color: #047857;
  margin: 0;
  line-height: 1.5;
}

.feedback-actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #d72660;
  color: #d72660;
  background: #fff0f5;
}

.btn-reply {
  flex: 1;
}

.btn-resolve {
  flex: 1;
}
</style>
