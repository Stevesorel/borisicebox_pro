
<template>
  <div class="merci-page">
    <div class="merci-page__container">
      
      <div class="merci-card">
        
        <div class="merci-card__icon-wrap">
          <div class="merci-card__icon-circle"></div>
          <span class="merci-card__icon" aria-hidden="true">🎉</span>
        </div>

        <h1 class="merci-card__title">{{ $t('orderSuccess.title') }}</h1>
        <p class="merci-card__desc">{{ $t('orderSuccess.desc') }}</p>

        <div v-if="reference" class="merci-card__ref">
          <span class="merci-card__ref-label">{{ $t('orderSuccess.ref') }}</span>
          <strong class="merci-card__ref-value">{{ reference }}</strong>
          <button 
            class="merci-card__ref-copy" 
            @click="copyReference"
            :title="copied ? $t('orderSuccess.copied') : $t('orderSuccess.copy')"
          >
            <svg v-if="!copied" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="5" y="5" width="9" height="9" rx="1"/><path d="M2 11V3H10"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 8L6 11L13 5"/>
            </svg>
          </button>
        </div>

        <div class="merci-card__infos">
          <div class="info-item">
            <span class="info-item__icon" aria-hidden="true">🚚</span>
            <div class="info-item__content">
              <strong>{{ $t('orderSuccess.delivery') }}</strong>
              <p>{{ $t('orderSuccess.deliveryDesc') }}</p>
            </div>
          </div>
          
          <div class="info-item">
            <span class="info-item__icon" aria-hidden="true">📞</span>
            <div class="info-item__content">
              <strong>{{ $t('orderSuccess.help') }}</strong>
              <p>{{ $t('orderSuccess.helpDesc') }} <a :href="shop.telLink">{{ shop.settings.phone_display }}</a></p>
            </div>
          </div>
        </div>

        <div class="merci-card__actions">
          <NuxtLinkLocale
            v-if="reference"
            :to="{ path: '/suivi', query: { ref: reference } }" 
            class="merci-card__btn merci-card__btn--primary"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="1" y="3" width="16" height="12" rx="2"/><path d="M6 9H12M9 6V12"/>
            </svg>
            {{ $t('orderSuccess.track') }}
          </NuxtLinkLocale>
          
          <NuxtLinkLocale to="/boutique" class="merci-card__btn merci-card__btn--accent">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 3H5L6 7M6 7H15L13 13H5L6 7Z"/><circle cx="7" cy="16" r="1.5"/><circle cx="14" cy="16" r="1.5"/>
            </svg>
            {{ $t('orderSuccess.continue') }}
          </NuxtLinkLocale>
          
          <NuxtLinkLocale to="/" class="merci-card__btn merci-card__btn--outline">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M2 9L9 2L16 9"/><path d="M4 7V16H8V12H10V16H14V7"/>
            </svg>
            {{ $t('orderSuccess.home') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShopSettingsStore } from '@/stores/shopSettings'

const shop = useShopSettingsStore()
await shop.loadPublic()

const route     = useRoute()
const reference = computed(() => route.query.ref || '')
const copied    = ref(false)

const copyReference = async () => {
  if (!reference.value) return
  try {
    await navigator.clipboard.writeText(reference.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const input = document.createElement('input')
    input.value = reference.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
/* ============================================
   LAYOUT
   ============================================ */
.merci-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--bg-primary);
  transition: background 0.3s ease;
}

.merci-page__container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* ============================================
   CARD
   ============================================ */
.merci-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  animation: cardIn 0.5s ease;
}

@media (max-width: 480px) {
  .merci-card {
    padding: 32px 20px;
    border-radius: 20px;
  }
}

/* Icône */
.merci-card__icon-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.merci-card__icon-circle {
  position: absolute;
  inset: 0;
  background: #fef3c7;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

:global(.dark) .merci-card__icon-circle {
  background: rgba(251, 191, 36, 0.15);
}

.merci-card__icon {
  font-size: 52px;
  position: relative;
  z-index: 1;
  animation: bounce 0.6s ease;
}

/* Titre */
.merci-card__title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

@media (min-width: 480px) {
  .merci-card__title { font-size: 30px; }
}

.merci-card__desc {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 28px;
  font-size: 15px;
}

/* Référence */
.merci-card__ref {
  background: var(--accent-light);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

:global(.dark) .merci-card__ref {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.2);
}

.merci-card__ref-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.merci-card__ref-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  font-family: monospace;
}

@media (min-width: 480px) {
  .merci-card__ref-value { font-size: 26px; }
}

.merci-card__ref-copy {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.merci-card__ref-copy:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* Infos */
.merci-card__infos {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  text-align: left;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: var(--bg-tertiary);
}

.info-item__icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-item__content strong {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.info-item__content p {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
}

.info-item__content a {
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;
}

.info-item__content a:hover {
  text-decoration: underline;
}

/* Actions */
.merci-card__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.merci-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.merci-card__btn--primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.merci-card__btn--primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.merci-card__btn--accent {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.merci-card__btn--accent:hover {
  background: #fde68a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

:global(.dark) .merci-card__btn--accent {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

:global(.dark) .merci-card__btn--accent:hover {
  background: rgba(251, 191, 36, 0.25);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
}

.merci-card__btn--outline {
  background: var(--surface);
  color: var(--text-secondary);
  border: 2px solid var(--border);
}

.merci-card__btn--outline:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounce {
  0%   { transform: scale(0); }
  50%  { transform: scale(1.25); }
  75%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 0.35; }
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 380px) {
  .merci-card {
    padding: 24px 16px;
  }

  .merci-card__icon-wrap {
    width: 72px;
    height: 72px;
    margin-bottom: 16px;
  }

  .merci-card__icon {
    font-size: 38px;
  }

  .merci-card__title {
    font-size: 22px;
  }

  .merci-card__ref-value {
    font-size: 18px;
  }

  .merci-card__btn {
    padding: 12px 16px;
    font-size: 13px;
  }
}
</style>