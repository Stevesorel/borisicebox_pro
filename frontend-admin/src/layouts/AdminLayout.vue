<template>
  <div class="admin-layout" :class="{ 'sidebar--open': sidebarOpen }">
    <!-- Overlay mobile -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__brand">
        <span class="sidebar__brand-icon">{{ shopName.charAt(0) }}</span>
        <strong>{{ shopName }}</strong>
      </div>

      <nav class="sidebar__nav">
        <router-link v-if="auth.canAccessDashboard" to="/dashboard" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </router-link>

        <router-link v-if="auth.isSuperAdmin" to="/admins" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="7" r="4"/><path d="M17 11c1.7 0 3-1.3 3-3s-1.3-3-3-3"/><path d="M2 21c0-3.3 3.1-6 7-6s7 2.7 7 6"/><path d="M17 21c0-2-1-3.8-2.6-5"/></svg>
          Utilisateurs
        </router-link>

        <router-link v-if="auth.isSuperAdmin" to="/audit-logs" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3h18v18H3z"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
          Traçabilité
        </router-link>

           <router-link v-if="auth.canManageCommandes" to="/commandes" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Commandes
        </router-link>
        
          <router-link v-if="auth.isSuperAdmin" to="/whatsapp" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          WhatsApp
        </router-link>
         



        <router-link v-if="auth.canManageCatalogue" to="/produits" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>
          Produits
        </router-link>
        <router-link v-if="auth.canAccessDashboard" to="/marketing" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19V5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></svg>
          Marketing
        </router-link>
        <router-link v-if="auth.canManageCatalogue" to="/categories" class="sidebar__link" @click="closeSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
          Catégories
        </router-link>
        <router-link v-if="auth.canManageCatalogue" to="/zones" class="sidebar__link" @click="closeSidebar">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/></svg>
  Zones
</router-link>

<router-link v-if="auth.isSuperAdmin" to="/accueil-config" class="sidebar__link" @click="closeSidebar">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9H21M9 21V9"/></svg>
  Page d'accueil
</router-link>

<router-link v-if="auth.isSuperAdmin" to="/shop-settings" class="sidebar__link" @click="closeSidebar">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.9.3l-.1.1A2 2 0 014.2 17l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 017 4.2l.1.1a1.7 1.7 0 001.9.3h.1A1.7 1.7 0 0010 3.1V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5h.1a1.7 1.7 0 001.9-.3l.1-.1A2 2 0 0119.8 7l-.1.1a1.7 1.7 0 00-.3 1.9v.1a1.7 1.7 0 001.5.9h.1a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>
  Paramètres boutique
</router-link>

      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__user">
          <span class="sidebar__avatar">{{ auth.admin?.nom?.charAt(0) }}</span>
          <div>
            <p class="sidebar__user-name">{{ auth.admin?.nom }}</p>
            <p class="sidebar__user-role">{{ roleLabel }}</p>
          </div>
        </div>
        <button @click="logout" class="sidebar__logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <!-- Top bar mobile -->
      <div class="topbar">
        <button class="topbar__burger" @click="sidebarOpen = !sidebarOpen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="topbar__title">{{ shopName }} Admin</span>
      </div>
      <div class="main__content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import api from '../services/api'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)
const shopName = ref('Boutique')
const roleLabel = computed(() => {
  const role = auth.admin?.role
  if (role === 'superadmin') return 'Super admin'
  if (role === 'gestionnaire') return 'Gestionnaire'
  if (role === 'catalogue') return 'Catalogue'
  if (role === 'commandes') return 'Commandes'
  return role || 'Admin'
})

const closeSidebar = () => { sidebarOpen.value = false }

const logout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/shop-settings/public')
    shopName.value = data.settings?.shop_name || 'Boutique'
  } catch {
    shopName.value = 'Boutique'
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: transparent;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 270px;
  background: linear-gradient(180deg, #0b1228 0%, #111c3d 100%);
  color: #dbe4ff;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

@media (min-width: 900px) {
  .sidebar {
    position: sticky;
    transform: translateX(0);
    height: 100vh;
    border-right: 1px solid rgba(148, 163, 184, 0.25);
  }
}

.sidebar--open .sidebar {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(2px);
  z-index: 45;
}

@media (min-width: 900px) {
  .sidebar-overlay { display: none; }
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  font-size: 17px;
  letter-spacing: 0.02em;
}

.sidebar__brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
}

.sidebar__nav {
  flex: 1;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 11px;
  color: #b8c6e8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sidebar__link:hover {
  background: rgba(148, 163, 184, 0.18);
  color: #fff;
}
.sidebar__link.router-link-active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.sidebar__footer {
  padding: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.sidebar__user-name { color: #fff; font-size: 13px; font-weight: 600; }
.sidebar__user-role { color: #a5b4d9; font-size: 11px; text-transform: capitalize; }

.sidebar__logout {
  width: 100%;
  padding: 9px;
  background: rgba(148, 163, 184, 0.18);
  color: #dbe4ff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.sidebar__logout:hover {
  background: #dc2626;
  color: #fff;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 15;
}

@media (min-width: 900px) {
  .topbar { display: none; }
}

.topbar__burger {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  color: #334155;
  cursor: pointer;
  padding: 6px;
}

.topbar__title {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.main__content {
  flex: 1;
  padding: 22px;
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .main__content { padding: 14px; }
}
</style>