<template>
  <div class="err-wrap">
    <span>{{ icon }}</span>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <button v-if="retry" class="btn-outline" @click="$emit('retry')">
      🔄 Réessayer
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon:    { type: String,  default: '⚠️' },
  title:   { type: String,  default: 'Une erreur est survenue' },
  message: { type: String,  default: 'Impossible de charger les données.' },
  retry:   { type: Boolean, default: true },
})
defineEmits(['retry'])
</script>

<style scoped>
.err-wrap {
  text-align: center; padding: 64px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.err-wrap span   { font-size: 52px; }
.err-wrap h3     { font-family: var(--font-head); font-size: 20px; font-weight: 700; }
.err-wrap p      { color: var(--text-muted); font-size: 15px; max-width: 340px; line-height: 1.5; }
</style>