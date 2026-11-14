// frontend-shop/src/composables/useSocket.js
import { io } from 'socket.io-client'
import { ref } from 'vue'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null
const isConnected = ref(false)

export function useSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    })

    socket.on('connect', () => {
      const token = localStorage.getItem('token')
      socket.emit('join', 'admin', { token })
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      console.log('🔴 Admin déconnecté')
      isConnected.value = false
    })

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Erreur socket:', err.message)
    })
  }

  const on = (event, callback) => {
    socket.on(event, callback)
  }

  const off = (event, callback) => {
    socket.off(event, callback)
  }

  return { socket, isConnected, on, off }
}