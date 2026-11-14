import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({ toasts: [], _id: 0 }),
  actions: {
    add(message, type = 'info', duration = 4000) {
      const id = ++this._id
      this.toasts.push({ id, message, type })
      if (duration > 0) setTimeout(() => this.remove(id), duration)
    },
    remove(id) { this.toasts = this.toasts.filter(t => t.id !== id) },
    success(msg, d) { this.add(msg, 'success', d) },
    error(msg,   d) { this.add(msg, 'error',   d) },
    warning(msg, d) { this.add(msg, 'warning', d) },
    info(msg,    d) { this.add(msg, 'info',    d) },
  }
})