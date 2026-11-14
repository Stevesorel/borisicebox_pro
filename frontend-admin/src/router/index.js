import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../pages/LoginPage.vue') },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',          redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('../pages/admin/DashboardPage.vue'), meta: { scope: 'dashboard' } },
      { path: 'categories',component: () => import('../pages/admin/CategoriesPage.vue'), meta: { scope: 'catalogue' } },
      { path: 'produits',  component: () => import('../pages/admin/ProduitsPage.vue'), meta: { scope: 'catalogue' } },
      { path: 'marketing', component: () => import('../pages/admin/MarketingPage.vue'), meta: { scope: 'catalogue' } },
      { path: 'shop-settings', component: () => import('../pages/admin/ShopSettingsPage.vue'), meta: { scope: 'homepage' } },
      { path: 'commandes', component: () => import('../pages/admin/CommandesPage.vue'), meta: { scope: 'commandes' } },
      { path: 'zones',     component: () => import('../pages/admin/ZonesPage.vue'), meta: { scope: 'catalogue' } },
      { path: 'whatsapp', component: () => import('../pages/admin/WhatsappCommandesPage.vue'), meta: { scope: 'commandes' } },
      { path: 'accueil-config', component: () => import('../pages/admin/AccueilConfigPage.vue'), meta: { scope: 'homepage' } },
      { path: 'admins', component: () => import('../pages/admin/AdminUsersPage.vue'), meta: { scope: 'superadmin' } },
      { path: 'audit-logs', component: () => import('../pages/admin/AuditLogsPage.vue'), meta: { scope: 'superadmin' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (auth.token && !auth.sessionChecked) {
    await auth.ensureSession()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login'
  if (to.path === '/login' && auth.isAuthenticated) return auth.defaultRoute

  // Superadmin : accès complet à toutes les sections admin.
  if (to.meta.requiresAuth && auth.isSuperAdmin) return true

  if (to.meta.requiresAuth) {
    const scope = to.meta.scope
    const allowed =
      scope === 'dashboard' ? auth.canAccessDashboard
      : scope === 'homepage' ? auth.canManageHomepage
      : scope === 'catalogue' ? auth.canManageCatalogue
      : scope === 'commandes' ? auth.canManageCommandes
      : scope === 'superadmin' ? auth.isSuperAdmin
      : true
    if (!allowed) return auth.defaultRoute
  }
})

export default router
