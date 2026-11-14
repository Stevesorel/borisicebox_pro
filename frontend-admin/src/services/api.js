import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      window.location.href = '/login'
    }
    if (err.response?.status === 403 && window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard'
    }
    return Promise.reject(err)
  }
)

export default api

// 🔥 Fonction pour construire l'URL des images
export const imgUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const base = apiUrl.replace(/\/api\/?$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export const formatPrice = (v) => v ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '-'
