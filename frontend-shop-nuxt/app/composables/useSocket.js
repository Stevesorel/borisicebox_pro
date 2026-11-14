import { io } from 'socket.io-client'
import { ref } from 'vue'

let socket = null
const isConnected = ref(false)
let listenersAttached = false

function attachSocketListeners() {
  if (!socket || listenersAttached) return
  listenersAttached = true

  socket.on('connect', () => {
    isConnected.value = true
    socket.emit('join', 'shop')
  })

  socket.on('disconnect', () => {
    isConnected.value = false
  })

  socket.on('connect_error', (err) => {
    console.warn('⚠️ Erreur socket:', err.message)
  })
}

function ensureSocket() {
  if (!import.meta.client) return null
  if (socket) return socket

  const config = useRuntimeConfig()
  const apiBase = config.public?.apiBase || 'https://api.borisicebox.com/api'
  const SOCKET_URL = config.public?.socketBase || apiBase.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  })

  attachSocketListeners()
  return socket
}

function connectSocket() {
  const s = ensureSocket()
  if (s && !s.connected) s.connect()
  return s
}

export function useSocket() {
  if (!import.meta.client) {
    return {
      socket: null,
      isConnected,
      on: () => {},
      off: () => {},
    }
  }

  const on = (event, callback) => {
    const s = connectSocket()
    s?.on(event, callback)
  }

  const off = (event, callback) => {
    socket?.off(event, callback)
  }

  return { socket: ensureSocket(), isConnected, on, off }
}
