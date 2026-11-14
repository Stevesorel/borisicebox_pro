<template>
  <button class="lang-toggle" @click="toggleLang" :title="locale === 'fr' ? 'Switch to English' : 'Passer en Français'">
    <span class="lang-toggle__flag">{{ locale === 'fr' ? '🇫🇷' : '🇬🇧' }}</span>
    <!-- <span class="lang-toggle__code">{{ locale === 'fr' ? 'FR' : 'EN' }}</span> -->
  </button>
</template>

<script setup>
const { locale, setLocale } = useI18n()
const toggleLang = () => {
  const newLocale = locale.value === 'fr' ? 'en' : 'fr'
  setLocale(newLocale)
  if (process.client) localStorage.setItem('locale', newLocale)
}
</script>

<style scoped>
.lang-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  transition: all 0.2s ease;
}
.lang-toggle:hover {
  border-color: var(--accent);
}
.lang-toggle__flag {
  font-size: 16px;
}
.lang-toggle__code {
  font-size: 12px;
}
</style>