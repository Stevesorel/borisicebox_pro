export const ROLE_SUPERADMIN = 'superadmin'
export const ROLE_GESTIONNAIRE = 'gestionnaire' // Legacy full access
export const ROLE_CATALOGUE = 'catalogue'
export const ROLE_COMMANDES = 'commandes'

export const isSuperAdmin = (role) => role === ROLE_SUPERADMIN

export const canManageCatalogue = (role) =>
  [ROLE_SUPERADMIN, ROLE_GESTIONNAIRE, ROLE_CATALOGUE].includes(role)

export const canManageCommandes = (role) =>
  [ROLE_SUPERADMIN, ROLE_GESTIONNAIRE, ROLE_COMMANDES].includes(role)

export const canAccessDashboard = (role) =>
  [ROLE_SUPERADMIN, ROLE_GESTIONNAIRE].includes(role)

export const canManageHomepage = (role) =>
  [ROLE_SUPERADMIN, ROLE_GESTIONNAIRE].includes(role)

export const getDefaultRouteByRole = (role) => {
  if (isSuperAdmin(role)) return '/dashboard'
  if (role === ROLE_GESTIONNAIRE) return '/dashboard'
  if (role === ROLE_COMMANDES) return '/commandes'
  if (role === ROLE_CATALOGUE) return '/produits'
  if (canManageCommandes(role)) return '/commandes'
  if (canManageCatalogue(role)) return '/produits'
  return '/dashboard'
}
