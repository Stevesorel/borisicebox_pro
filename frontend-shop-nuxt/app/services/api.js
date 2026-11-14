import axios from 'axios'

// Résolution de l'URL de base selon le contexte (SSR ou client).
// - SSR  : process.env.NUXT_PUBLIC_API_BASE (injecté depuis .env au démarrage)
// - Client : window.__NUXT__.config.public.apiBase (injecté par Nuxt dans la page)
const resolveApiBase = () => {
  if (typeof window !== 'undefined') {
    return (
      window.__NUXT__?.config?.public?.apiBase ||
      import.meta.env?.NUXT_PUBLIC_API_BASE ||
      'https://api.borisicebox.com/api'
    )
  }
  return process.env.NUXT_API_BASE_INTERNAL
    || process.env.NUXT_PUBLIC_API_BASE
    || 'https://api.borisicebox.com/api'
}

const api = axios.create({
  baseURL: resolveApiBase(),
  timeout: 10000,
})

api.interceptors.request.use(config => {
  if (import.meta.client) {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (import.meta.client) {
      import('@/stores/toast').then(({ useToastStore }) => {
        const toast = useToastStore()
        if (!err.response) {
          toast.error('Serveur inaccessible. Vérifiez votre connexion.', 6000)
          return
        }
        const status = err.response?.status
        if (status === 401) {
          localStorage.removeItem('token')
          toast.warning('Session expirée. Veuillez vous reconnecter.')
          window.location.href = '/login'
        } else if (status === 403) {
          toast.error('Accès refusé.')
        } else if (status >= 500) {
          toast.error('Erreur serveur. Veuillez réessayer plus tard.', 6000)
        }
      })
    }
    return Promise.reject(err)
  }
)

export default api

// Construit l'URL absolue d'une image servie par le backend.
// En dev : http://localhost:5000/uploads/…
// En prod : https://api.borisicebox.com/uploads/…
const resolveAssetBase = () => {
  if (typeof window !== 'undefined') {
    return window.__NUXT__?.config?.public?.apiBase
      || import.meta.env?.NUXT_PUBLIC_API_BASE
      || 'https://api.borisicebox.com/api'
  }
  return process.env.NUXT_API_BASE_INTERNAL
    || process.env.NUXT_PUBLIC_API_BASE
    || 'https://api.borisicebox.com/api'
}

export const imgUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return resolveAssetBase().replace(/\/api\/?$/, '') + path
}

/** Vignette (listes) ou grande version (fiche produit / OG). */
export const productImageUrl = (imageOrPath, size = 'thumb') => {
  if (!imageOrPath) return ''
  if (typeof imageOrPath === 'string') {
    return imgUrl(imageOrPath)
  }
  const path = size === 'large'
    ? (imageOrPath.url_large || imageOrPath.url)
    : imageOrPath.url
  return imgUrl(path)
}

export const productDisplayImage = (produit, size = 'thumb') => {
  if (!produit) return ''
  const path = size === 'large'
    ? (produit.image_principale_large || produit.image_principale)
    : produit.image_principale
  return imgUrl(path)
}

export const formatPrice = (v) => {
  if (v === undefined || v === null) return '-'
  const currency = typeof window !== 'undefined' ? window.__SHOP_CURRENCY__ : null
  const locale = currency?.locale || 'fr-FR'
  const symbol = currency?.symbol || 'FCFA'
  return `${Number(v).toLocaleString(locale)} ${symbol}`
}
