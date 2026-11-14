<template>
  <div class="suivi-page">
    <div class="suivi-page__container">

      <!-- Hero -->
      <div class="suivi-hero">
        <h1 class="suivi-hero__title">{{ $t('tracking.title') }}</h1>
        <p class="suivi-hero__desc">
          {{ $t('tracking.desc') }}
        </p>

        <!-- Tabs -->
        <div class="suivi-tabs" role="tablist">
          <button
            :class="['suivi-tab', { 'suivi-tab--active': mode === 'reference' }]"
            @click="mode = 'reference'; reset()"
            role="tab"
            :aria-selected="mode === 'reference'"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M4 4H12V13L8 10L4 13V4Z"/>
            </svg>
            {{ $t('tracking.byRef') }}
          </button>
          <button
            :class="['suivi-tab', { 'suivi-tab--active': mode === 'telephone' }]"
            @click="mode = 'telephone'; reset()"
            role="tab"
            :aria-selected="mode === 'telephone'"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="2" y="1" width="12" height="14" rx="2"/><path d="M7 12H9"/>
            </svg>
            {{ $t('tracking.byPhone') }}
          </button>
        </div>

        <!-- Champ de recherche -->
        <div class="suivi-search">
          <div class="suivi-search__wrap">
            <svg class="suivi-search__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="8" cy="8" r="6"/><path d="M13 13L17 17"/>
            </svg>
            <input
              v-if="mode === 'reference'"
              v-model="query"
              :placeholder="$t('tracking.searchRef')"
              @keyup.enter="chercher"
              class="suivi-search__input"
            />
            <input
              v-else
              v-model="query"
              :placeholder="$t('tracking.searchPhone')"
              @keyup.enter="chercher"
              type="tel"
              class="suivi-search__input"
            />
            <button
              class="suivi-search__btn"
              @click="chercher"
              :disabled="loading"
            >
              <template v-if="loading">
                <span class="suivi-search__spinner"></span>
              </template>
              <template v-else>
                {{ $t('tracking.search') }}
              </template>
            </button>
          </div>
        </div>

        <p v-if="erreur" class="suivi-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="8" cy="8" r="7"/><path d="M8 5V9M8 11V11.01"/>
          </svg>
          {{ erreur }}
        </p>
      </div>

      <!-- ============================================ -->
      <!-- RÉSULTAT PAR RÉFÉRENCE                      -->
      <!-- ============================================ -->
      <div v-if="commande && mode === 'reference'" class="suivi-result">

        <div class="result-header">
          <div class="result-header__ref">
            <span class="result-header__label">{{ $t('tracking.ref') }}</span>
            <strong class="result-header__value">{{ commande.reference }}</strong>
          </div>
          <span :class="['status-badge', `status-badge--${commande.statut}`]">
            {{ statutLabel(commande.statut) }}
          </span>
        </div>

        <!-- Timeline -->
        <div class="timeline">
          <div
            v-for="(step, i) in steps"
            :key="i"
            :class="['timeline__step', { 'timeline__step--done': step.done, 'timeline__step--active': step.active }]"
          >
            <div class="timeline__step-left">
              <div class="timeline__step-icon">
                <svg v-if="step.done" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M3 8L6 11L13 5"/>
                </svg>
                <span v-else-if="step.active">{{ step.icon }}</span>
                <span v-else>○</span>
              </div>
              <div
                v-if="i < steps.length - 1"
                :class="['timeline__step-line', { 'timeline__step-line--done': step.done }]"
              ></div>
            </div>
            <div class="timeline__step-body">
              <strong>{{ step.label }}</strong>
              <span>{{ step.desc }}</span>
            </div>
          </div>
        </div>

        <!-- Détails -->
        <div class="detail-grid">
          <div class="detail-card">
            <h4 class="detail-card__title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="7" cy="5" r="3"/><path d="M2 13C2 10 4.5 8.5 7 8.5C9.5 8.5 12 10 12 13"/>
              </svg>
              {{ $t('tracking.client') }}
            </h4>
            <div class="detail-row">
              <span>{{ $t('tracking.name') }}</span><strong>{{ commande.nom_client }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ $t('tracking.address') }}</span><strong>{{ commande.adresse }}</strong>
            </div>
            <div v-if="commande.ZoneLivraison" class="detail-row">
              <span>{{ $t('tracking.zone') }}</span><strong>{{ commande.ZoneLivraison.nom }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ $t('tracking.phone') }}</span><strong>{{ commande.telephone }}</strong>
            </div>
          </div>

          <div class="detail-card">
            <h4 class="detail-card__title">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M2 2H4L5 5M5 5H12L10 10H4L5 5Z"/><circle cx="5" cy="12" r="1"/><circle cx="11" cy="12" r="1"/>
              </svg>
              {{ $t('tracking.items') }}
            </h4>
            <div v-for="d in commande.CommandeDetails" :key="d.id" class="detail-item">
              <div class="detail-item__left">
                <div class="detail-item__product">
                  <img v-if="detailImage(d)" :src="imgUrl(detailImage(d))" :alt="d.nom_produit" class="detail-item__image" />
                  <span>{{ d.nom_produit }} × {{ d.quantite }}</span>
                </div>
                <span v-if="d.personnalisation" class="detail-item__perso">✏️ {{ d.personnalisation }}</span>
              </div>
              <strong>{{ formatPrice(d.prix_total) }}</strong>
            </div>
            <div class="detail-item detail-item--total">
              <span>{{ $t('tracking.total') }}</span>
              <strong>{{ formatPrice(commande.total) }}</strong>
            </div>
          </div>
        </div>

        <p class="result-date">
          {{ $t('tracking.date') }} <strong>{{ formatDate(commande.createdAt) }}</strong>
        </p>
      </div>

      <!-- ============================================ -->
      <!-- RÉSULTATS PAR TÉLÉPHONE                     -->
      <!-- ============================================ -->
      <div v-if="commandes.length && mode === 'telephone'" class="suivi-result">

        <div class="phone-header">
          <h3 class="phone-header__title">{{ commandes.length }} {{ $t('tracking.found') }}</h3>
          <p class="phone-header__sub">{{ $t('tracking.forNumber') }} <strong>{{ query }}</strong></p>
        </div>

        <div
          v-for="c in commandes"
          :key="c.id"
          class="commande-card"
          :class="{ 'commande-card--expanded': selected?.id === c.id }"
        >
          <div class="commande-card__header" @click="voirDetail(c)">
            <div class="commande-card__ref">
              <span class="commande-card__ref-label">{{ $t('tracking.ref') }}</span>
              <strong>{{ c.reference }}</strong>
            </div>
            <div class="commande-card__info">
              <span class="commande-card__date">{{ formatDate(c.createdAt) }}</span>
              <strong class="commande-card__total">{{ formatPrice(c.total) }}</strong>
            </div>
            <span :class="['status-badge', 'status-badge--small', `status-badge--${c.statut}`]">
              {{ statutLabel(c.statut) }}
            </span>
            <svg
              class="commande-card__chevron"
              :class="{ 'commande-card__chevron--open': selected?.id === c.id }"
              width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            >
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

          <Transition name="expand">
            <div v-if="selected?.id === c.id" class="commande-card__body">

              <div class="timeline-mini">
                <div
                  v-for="(step, i) in stepsFor(c.statut)"
                  :key="i"
                  :class="['timeline-mini__step', { 'timeline-mini__step--done': step.done, 'timeline-mini__step--active': step.active }]"
                >
                  <div class="timeline-mini__icon">
                    <svg v-if="step.done" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <path d="M2 6L5 9L10 3"/>
                    </svg>
                    <span v-else-if="step.active">●</span>
                    <span v-else>○</span>
                  </div>
                  <span>{{ step.label }}</span>
                </div>
              </div>

              <div class="detail-grid">
                <div class="detail-card">
                  <h4 class="detail-card__title">{{ $t('tracking.client') }}</h4>
                  <div class="detail-row">
                    <span>{{ $t('tracking.name') }}</span><strong>{{ c.nom_client }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>{{ $t('tracking.address') }}</span><strong>{{ c.adresse }}</strong>
                  </div>
                  <div v-if="c.ZoneLivraison" class="detail-row">
                    <span>{{ $t('tracking.zone') }}</span><strong>{{ c.ZoneLivraison.nom }}</strong>
                  </div>
                </div>
                <div class="detail-card">
                  <h4 class="detail-card__title">{{ $t('tracking.items') }}</h4>
                  <div v-for="d in c.CommandeDetails" :key="d.id" class="detail-item">
                    <div class="detail-item__left">
                      <div class="detail-item__product">
                        <img v-if="detailImage(d)" :src="imgUrl(detailImage(d))" :alt="d.nom_produit" class="detail-item__image" />
                        <span>{{ d.nom_produit }} × {{ d.quantite }}</span>
                      </div>
                      <span v-if="d.personnalisation" class="detail-item__perso">✏️ {{ d.personnalisation }}</span>
                    </div>
                    <strong>{{ formatPrice(d.prix_total) }}</strong>
                  </div>
                  <div class="detail-item detail-item--total">
                    <span>{{ $t('tracking.total') }}</span><strong>{{ formatPrice(c.total) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'

import api, { formatPrice, imgUrl } from '@/services/api'

const route     = useRoute()
const { t, locale } = useI18n()
const mode      = ref('reference')
const query     = ref('')
const commande  = ref(null)
const commandes = ref([])
const selected  = ref(null)
const loading   = ref(false)
const erreur    = ref('')

onMounted(() => {
  if (route.query.ref) {
    query.value = route.query.ref
    mode.value  = 'reference'
    chercher()
  }
})

const reset = () => {
  query.value     = ''
  commande.value  = null
  commandes.value = []
  selected.value  = null
  erreur.value    = ''
}

const chercher = async () => {
  if (!query.value.trim()) return
  loading.value   = true
  erreur.value    = ''
  commande.value  = null
  commandes.value = []
  selected.value  = null

  try {
    if (mode.value === 'reference') {
      const { data } = await api.get(`/tracking/${query.value.trim()}`)
      commande.value = data
    } else {
      const { data } = await api.get(`/tracking/telephone/${query.value.trim()}`)
      commandes.value = data
    }
  } catch (e) {
    erreur.value = mode.value === 'reference'
      ? t('tracking.notFoundRef')
      : t('tracking.notFoundPhone')
  } finally {
    loading.value = false
  }
}

const voirDetail = (c) => {
  selected.value = selected.value?.id === c.id ? null : c
}

const detailImage = (d) => d?.image_produit || d?.Produit?.image_principale || null

const stepsFor = (statut) => {
  const order   = ['en_attente', 'confirmee', 'en_livraison', 'livree']
  const idx     = order.indexOf(statut)
  const annulee = statut === 'annulee'
  return [
    { label: t('tracking.timeline.received') },
    { label: t('tracking.timeline.confirmed') },
    { label: t('tracking.timeline.delivering') },
    { label: t('tracking.timeline.delivered') },
  ].map((s, i) => ({
    ...s,
    done:   !annulee && i < idx,
    active: !annulee && i === idx,
  }))
}

const steps = computed(() => {
  if (!commande.value) return []
  return stepsFor(commande.value.statut).map((s, i) => ({
    ...s,
    icon: ['📋', '✅', '🚚', '🎉'][i],
    desc: [
      t('tracking.timeline.receivedDesc'),
      t('tracking.timeline.confirmedDesc'),
      t('tracking.timeline.deliveringDesc'),
      t('tracking.timeline.deliveredDesc'),
    ][i]
  }))
})

const statutLabel = (s) => ({
  en_attente:    `⏳ ${t('tracking.status.en_attente')}`,
  confirmee:     `✅ ${t('tracking.status.confirmee')}`,
  en_livraison:  `🚚 ${t('tracking.status.en_livraison')}`,
  livree:        `🎉 ${t('tracking.status.livree')}`,
  annulee:       `❌ ${t('tracking.status.annulee')}`,
}[s] || s)

const formatDate = (d) => new Date(d).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'fr-FR', {
  day: '2-digit', month: 'long', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})
</script>

<style scoped>
/* ============================================
   LAYOUT
   ============================================ */
.suivi-page {
  padding: 40px 0 80px;
  min-height: 60vh;
  background: var(--bg-primary);
  transition: background 0.3s ease;
}

@media (min-width: 768px) {
  .suivi-page { padding: 56px 0 100px; }
}

.suivi-page__container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ============================================
   HERO
   ============================================ */
.suivi-hero {
  text-align: center;
  margin-bottom: 48px;
}

.detail-item__left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-item__product {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item__image {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.detail-item__perso {
  font-size: 11px;
  color: var(--accent);
  font-style: italic;
}


.suivi-hero__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 10px;
}

@media (min-width: 768px) {
  .suivi-hero__title { font-size: 36px; }
}

.suivi-hero__desc {
  color: var(--text-muted);
  margin-bottom: 28px;
  font-size: 15px;
}

/* Tabs */
.suivi-tabs {
  display: inline-flex;
  background: var(--bg-secondary);
  border-radius: 999px;
  padding: 5px;
  gap: 4px;
  margin-bottom: 24px;
}

.suivi-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.suivi-tab--active {
  background: var(--surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.suivi-tab:hover:not(.suivi-tab--active) {
  color: var(--text-secondary);
}

/* Search */
.suivi-search {
  max-width: 520px;
  margin: 0 auto;
}

.suivi-search__wrap {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.suivi-search__wrap:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.suivi-search__icon {
  margin-left: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.suivi-search__input {
  flex: 1;
  padding: 14px 12px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--text-primary);
  outline: none;
  min-width: 0;
}

.suivi-search__input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.suivi-search__btn {
  padding: 14px 24px;
  background: var(--accent);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.suivi-search__btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.suivi-search__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.suivi-search__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Error */
.suivi-error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
  background: #fef2f2;
  padding: 10px 18px;
  border-radius: 10px;
}

/* ============================================
   RESULT
   ============================================ */
.suivi-result {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
  gap: 12px;
}

.result-header__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.result-header__value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text-primary);
  font-family: monospace;
}

@media (min-width: 480px) {
  .result-header__value { font-size: 28px; }
}

/* Status badge */
.status-badge {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge--small {
  padding: 5px 12px;
  font-size: 11px;
}

.status-badge--en_attente   { background: #fff7ed; color: #c47f0a; }
.status-badge--confirmee    { background: #ebf4ff; color: #2b6cb0; }
.status-badge--en_livraison { background: #e9d8fd; color: #6b46c1; }
.status-badge--livree       { background: #f0fff4; color: #276749; }
.status-badge--annulee      { background: #fff5f5; color: #c53030; }

:global(.dark) .status-badge--en_attente   { background: rgba(196,127,10,0.15); color: #fbbf24; }
:global(.dark) .status-badge--confirmee    { background: rgba(43,108,176,0.15); color: #60a5fa; }
:global(.dark) .status-badge--en_livraison { background: rgba(107,70,193,0.15); color: #a78bfa; }
:global(.dark) .status-badge--livree       { background: rgba(39,103,73,0.15); color: #4ade80; }
:global(.dark) .status-badge--annulee      { background: rgba(197,48,48,0.15); color: #f87171; }

/* Timeline */
.timeline {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: var(--shadow-sm);
}

.timeline__step {
  display: flex;
  gap: 16px;
}

.timeline__step-left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline__step-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-weight: 700;
  transition: all 0.3s;
  flex-shrink: 0;
}

.timeline__step--done .timeline__step-icon {
  background: #f0fff4;
  border-color: #48bb78;
  color: #276749;
}

:global(.dark) .timeline__step--done .timeline__step-icon {
  background: rgba(72, 187, 120, 0.1);
}

.timeline__step--active .timeline__step-icon {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.timeline__step-line {
  width: 2px;
  flex: 1;
  min-height: 28px;
  background: var(--border);
  margin: 4px 0;
  transition: background 0.3s;
}

.timeline__step-line--done {
  background: #48bb78;
}

.timeline__step-body {
  flex: 1;
  padding: 8px 0 28px;
}

.timeline__step:last-child .timeline__step-body {
  padding-bottom: 0;
}

.timeline__step-body strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.timeline__step-body span {
  font-size: 13px;
  color: var(--text-muted);
}

.timeline__step--done .timeline__step-body strong { color: #276749; }
:global(.dark) .timeline__step--done .timeline__step-body strong { color: #4ade80; }

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .detail-grid { grid-template-columns: 1fr 1fr; }
}

.detail-card {
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 20px;
  transition: background 0.3s ease;
}

.detail-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.detail-row:last-child { border-bottom: none; }
.detail-row span { color: var(--text-muted); }
.detail-row strong { color: var(--text-primary); }

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.detail-item:last-of-type { border-bottom: none; }
.detail-item span { color: var(--text-muted); }
.detail-item strong { color: var(--text-primary); }

.detail-item--total {
  padding-top: 12px;
  font-size: 16px;
  font-weight: 700;
}

.detail-item--total strong { color: var(--accent); }

.result-date {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

/* ============================================
   PHONE RESULTS
   ============================================ */
.phone-header {
  text-align: center;
  margin-bottom: 4px;
}

.phone-header__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.phone-header__sub {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 14px;
}

.phone-header__sub strong {
  color: var(--accent);
}

/* Commande card */
.commande-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.commande-card:hover {
  box-shadow: var(--shadow-md);
}

.commande-card--expanded {
  border-color: var(--accent);
}

.commande-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  cursor: pointer;
  transition: background 0.2s;
  flex-wrap: wrap;
}

@media (min-width: 600px) {
  .commande-card__header { padding: 20px 24px; flex-wrap: nowrap; }
}

.commande-card__header:hover {
  background: var(--bg-secondary);
}

.commande-card__ref {
  min-width: 120px;
}

.commande-card__ref-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 3px;
}

.commande-card__ref strong {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--text-primary);
  font-family: monospace;
}

.commande-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.commande-card__date {
  font-size: 12px;
  color: var(--text-muted);
}

.commande-card__total {
  font-size: 14px;
  color: var(--text-primary);
}

.commande-card__chevron {
  color: var(--text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.commande-card__chevron--open {
  transform: rotate(180deg);
}

.commande-card__body {
  border-top: 1px solid var(--border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Timeline mini */
.timeline-mini {
  display: flex;
  align-items: center;
}

.timeline-mini__step {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.timeline-mini__step:not(:last-child)::after {
  content: '';
  flex: 1;
  height: 2px;
  background: var(--border);
  margin: 0 6px;
  transition: background 0.3s;
}

.timeline-mini__step--done::after {
  background: #48bb78;
}

.timeline-mini__icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: var(--bg-secondary);
  color: var(--text-muted);
  flex-shrink: 0;
}

.timeline-mini__step--done .timeline-mini__icon {
  background: #f0fff4;
  border-color: #48bb78;
  color: #276749;
}

.timeline-mini__step--active .timeline-mini__icon {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.timeline-mini__step span {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap;
}

.timeline-mini__step--done span { color: #276749; }
:global(.dark) .timeline-mini__step--done span { color: #4ade80; }

/* ============================================
   TRANSITIONS
   ============================================ */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 800px;
}

/* ============================================
   ANIMATIONS
   ============================================ */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 480px) {
  .suivi-tab {
    padding: 8px 16px;
    font-size: 13px;
  }

  .suivi-search__input {
    padding: 12px 10px;
    font-size: 13px;
  }

  .suivi-search__btn {
    padding: 12px 16px;
    font-size: 13px;
  }

  .timeline {
    padding: 24px 16px;
  }

  .timeline__step-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .result-header {
    padding: 16px;
  }

  .result-header__value {
    font-size: 20px;
  }

  .detail-card {
    padding: 14px;
  }

  .timeline-mini__step span {
    font-size: 10px;
  }
}
</style>