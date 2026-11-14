import { defineStore } from 'pinia'
import api from '../services/api'
import {
  isSuperAdmin,
  canAccessDashboard,
  canManageHomepage,
  canManageCatalogue,
  canManageCommandes,
  getDefaultRouteByRole
} from '../utils/roles'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    admin: JSON.parse(localStorage.getItem('admin') || 'null'),
    sessionChecked: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.admin?.role || null,
    isSuperAdmin: (state) => isSuperAdmin(state.admin?.role),
    canAccessDashboard: (state) => canAccessDashboard(state.admin?.role),
    canManageHomepage: (state) => canManageHomepage(state.admin?.role),
    canManageCatalogue: (state) => canManageCatalogue(state.admin?.role),
    canManageCommandes: (state) => canManageCommandes(state.admin?.role),
    defaultRoute: (state) => getDefaultRouteByRole(state.admin?.role)
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post('/auth/login', { email, password })
      this.token = data.token
      this.admin = data.admin
      this.sessionChecked = true
      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
    },
    async ensureSession() {
      if (!this.token) {
        this.sessionChecked = true
        return false
      }
      if (this.sessionChecked && this.admin) return true
      try {
        const { data } = await api.get('/auth/me')
        this.admin = data.admin || null
        if (this.admin) localStorage.setItem('admin', JSON.stringify(this.admin))
        this.sessionChecked = true
        return !!this.admin
      } catch {
        this.logout()
        this.sessionChecked = true
        return false
      }
    },
    logout() {
      this.token = null
      this.admin = null
      this.sessionChecked = true
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
    }
  }
})
