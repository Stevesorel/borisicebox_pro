<template>
  <main class="legal-page">
    <div class="legal-page__container">
      <NuxtLinkLocale to="/" class="legal-page__back">{{ $t('product.backToShop') }}</NuxtLinkLocale>
      <article class="legal-card">
        <h1>{{ pageTitle }}</h1>
        <p v-if="content" class="legal-card__content">{{ content }}</p>
        <p v-else class="legal-card__empty">Ce contenu peut être configuré depuis l'admin.</p>
      </article>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useShopSettingsStore } from '@/stores/shopSettings'

const route = useRoute()
const { locale } = useI18n()
const shop = useShopSettingsStore()
await shop.loadPublic()

const type = computed(() => String(route.params.type || 'conditions'))
const pageTitle = computed(() => {
  if (type.value === 'confidentialite') return locale.value === 'en' ? 'Privacy policy' : 'Politique de confidentialité'
  if (type.value === 'retours') return locale.value === 'en' ? 'Returns and refunds' : 'Retours et remboursements'
  return locale.value === 'en' ? 'Terms and conditions' : 'Conditions générales'
})
const content = computed(() => {
  const suffix = locale.value === 'en' ? 'en' : 'fr'
  if (type.value === 'confidentialite') return shop.settings[`legal_privacy_${suffix}`]
  if (type.value === 'retours') return shop.settings[`legal_returns_${suffix}`]
  return shop.settings[`legal_terms_${suffix}`]
})

useHead(() => ({
  title: `${pageTitle.value} - ${shop.settings.shop_name}`,
  meta: [{ name: 'description', content: pageTitle.value }]
}))
</script>

<style scoped>
.legal-page {
  min-height: 70vh;
  padding: 96px 16px 64px;
  background: var(--bg-primary);
}
.legal-page__container {
  max-width: 900px;
  margin: 0 auto;
}
.legal-page__back {
  display: inline-flex;
  margin-bottom: 18px;
  color: var(--accent);
  font-weight: 800;
}
.legal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 28px;
  box-shadow: var(--shadow-md);
}
.legal-card h1 {
  margin: 0 0 18px;
  color: var(--text-primary);
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1.15;
}
.legal-card__content {
  white-space: pre-line;
  color: var(--text-secondary);
  line-height: 1.8;
}
.legal-card__empty {
  color: var(--text-muted);
  font-weight: 700;
}
</style>
