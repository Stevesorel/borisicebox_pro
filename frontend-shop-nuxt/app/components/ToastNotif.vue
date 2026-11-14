<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', t.type]"
        >
          <span class="toast-icon">{{ icons[t.type] }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button @click="remove(t.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const store  = useToastStore()
const { toasts } = storeToRefs(store)
const { remove } = store

const icons = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
}
</script>

<style scoped>
.toast-container {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 9999; display: flex; flex-direction: column; gap: 10px;
  max-width: 380px;
}
.toast {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  font-size: 14px; font-weight: 500;
  backdrop-filter: blur(8px);
}
.toast.success { background: #f0fff4; border: 1px solid #c6f6d5; color: #276749; }
.toast.error   { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; }
.toast.warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.toast.info    { background: #ebf4ff; border: 1px solid #bee3f8; color: #2a69ac; }
.toast-icon { font-size: 16px; flex-shrink: 0; }
.toast-msg  { flex: 1; line-height: 1.4; }
.toast button { background: none; border: none; opacity: 0.5; cursor: pointer; font-size: 14px; padding: 0 2px; flex-shrink: 0; }
.toast button:hover { opacity: 1; }

/* Transitions */
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
</style>