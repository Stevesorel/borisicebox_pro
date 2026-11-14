<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <div>
        <h2 class="dashboard__title">Dashboard</h2>
        <p class="dashboard__subtitle">Vue d'ensemble de votre activité</p>
      </div>
      <span class="dashboard__date">{{ today }}</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <div class="skeleton__icon"></div>
        <div class="skeleton__lines">
          <div class="skeleton__line skeleton__line--short"></div>
          <div class="skeleton__line skeleton__line--long"></div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div v-else class="stats-grid">
      <div class="stat-card stat-card--blue" style="animation-delay: 0s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ animValues.commandes }}</span>
          <span class="stat-card__label">Total commandes</span>
        </div>
        <div class="stat-card__trend trend--up">+12%</div>
      </div>

      <div class="stat-card stat-card--orange" style="animation-delay: 0.05s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ animValues.en_attente }}</span>
          <span class="stat-card__label">En attente</span>
        </div>
        <div class="stat-card__trend trend--warn">⚠️ Action</div>
      </div>

      <div class="stat-card stat-card--green" style="animation-delay: 0.1s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ animValues.livrees }}</span>
          <span class="stat-card__label">Livrées</span>
        </div>
        <div class="stat-card__trend trend--up">Succès</div>
      </div>

      <div class="stat-card stat-card--purple" style="animation-delay: 0.15s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ animValues.clients }}</span>
          <span class="stat-card__label">Clients</span>
        </div>
      </div>

      <div class="stat-card stat-card--pink" style="animation-delay: 0.2s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ animValues.produits }}</span>
          <span class="stat-card__label">Produits actifs</span>
        </div>
      </div>

      <div class="stat-card stat-card--teal" style="animation-delay: 0.25s">
        <div class="stat-card__icon-wrap">
          <div class="stat-card__icon-bg"></div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__value">{{ formatPrice(animValues.ventes) }}</span>
          <span class="stat-card__label">Ventes ce mois</span>
        </div>
      </div>
    </div>

    <!-- Commandes récentes -->
    <div class="card">
      <div class="card__header">
        <h3>Dernières commandes</h3>
        <router-link to="/commandes" class="card__link">Voir tout →</router-link>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Référence</th><th>Client</th><th>Total</th><th>Statut</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-for="(c, i) in stats.dernieres_commandes" :key="c.id" :style="{ animationDelay: i * 0.05 + 's' }" class="table-row-anim">
              <td><strong>{{ c.reference }}</strong></td>
              <td>{{ c.nom_client }}</td>
              <td><strong>{{ formatPrice(c.total) }}</strong></td>
              <td><span :class="['badge', 'badge--' + c.statut]">{{ statutLabel(c.statut) }}</span></td>
              <td class="text-muted">{{ formatDate(c.createdAt) }}</td>
            </tr>
            <tr v-if="!stats.dernieres_commandes?.length">
              <td colspan="5" class="text-center text-muted">Aucune commande pour le moment</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '../../services/api'

const stats = ref({})
const loading = ref(true)

// Valeurs animées
const animValues = ref({
  commandes: 0,
  en_attente: 0,
  livrees: 0,
  clients: 0,
  produits: 0,
  ventes: 0
})

const animateValue = (key, target) => {
  const duration = 800
  const start = animValues.value[key]
  const diff = target - start
  const steps = 30
  const increment = diff / steps
  let current = start

  const interval = setInterval(() => {
    current += increment
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      animValues.value[key] = target
      clearInterval(interval)
    } else {
      animValues.value[key] = Math.round(current)
    }
  }, duration / steps)
}

onMounted(async () => {
  try {
    const { data } = await api.get('/dashboard/stats')
    stats.value = data
    // Lancer les animations
    setTimeout(() => {
      animateValue('commandes', data.commandes?.total || 0)
      animateValue('en_attente', data.commandes?.en_attente || 0)
      animateValue('livrees', data.commandes?.livrees || 0)
      animateValue('clients', data.clients || 0)
      animateValue('produits', data.produits || 0)
      animateValue('ventes', data.ventes?.ce_mois || 0)
    }, 200)
  } catch (e) {
    console.error('Erreur dashboard:', e)
  } finally {
    loading.value = false
  }
})

const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const formatPrice = (v) => v ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '0 FCFA'
const formatDate  = (d) => new Date(d).toLocaleDateString('fr-FR')

const statutLabel = (s) => ({
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_livraison: 'En livraison',
  livree: 'Livrée',
  annulee: 'Annulée'
}[s] || s)
</script>

<style scoped>
.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.dashboard__title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.dashboard__subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 2px;
}

.dashboard__date {
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 10px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-transform: capitalize;
}

/* ============================================
   SKELETON
   ============================================ */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

@media (min-width: 600px) { .skeleton-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px) { .skeleton-grid { grid-template-columns: repeat(6, 1fr); } }

.skeleton-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.skeleton__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton__line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton__line--short { width: 60%; }
.skeleton__line--long { width: 80%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================================
   STATS GRID
   ============================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

@media (min-width: 600px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px) { .stats-grid { grid-template-columns: repeat(6, 1fr); } }

.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: cardIn 0.5s ease both;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.06;
  transition: all 0.5s ease;
}

.stat-card:hover::after {
  transform: scale(2.5);
}

.stat-card--blue::after { background: #3b82f6; }
.stat-card--orange::after { background: #f97316; }
.stat-card--green::after { background: #22c55e; }
.stat-card--purple::after { background: #8b5cf6; }
.stat-card--pink::after { background: #ec4899; }
.stat-card--teal::after { background: #14b8a6; }

.stat-card__icon-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  opacity: 0.12;
}

.stat-card--blue .stat-card__icon-bg { background: #3b82f6; }
.stat-card--blue svg { color: #3b82f6; }
.stat-card--orange .stat-card__icon-bg { background: #f97316; }
.stat-card--orange svg { color: #f97316; }
.stat-card--green .stat-card__icon-bg { background: #22c55e; }
.stat-card--green svg { color: #22c55e; }
.stat-card--purple .stat-card__icon-bg { background: #8b5cf6; }
.stat-card--purple svg { color: #8b5cf6; }
.stat-card--pink .stat-card__icon-bg { background: #ec4899; }
.stat-card--pink svg { color: #ec4899; }
.stat-card--teal .stat-card__icon-bg { background: #14b8a6; }
.stat-card--teal svg { color: #14b8a6; }

.stat-card__info {
  flex: 1;
  min-width: 0;
}

.stat-card__value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.stat-card__label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.stat-card__trend {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.trend--up { background: #f0fdf4; color: #15803d; }
.trend--warn { background: #fff7ed; color: #c2410c; }

@media (max-width: 599px) {
  .stat-card__trend { display: none; }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-card__icon-wrap { width: 38px; height: 38px; }
  .stat-card__value { font-size: 16px; }
}

/* ============================================
   TABLE
   ============================================ */
.card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.card__header h3 {
  font-size: 17px;
  font-weight: 700;
}

.card__link {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  transition: opacity 0.2s;
}

.card__link:hover { opacity: 0.7; }

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 550px;
}

th {
  text-align: left;
  padding: 10px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  border-bottom: 2px solid #f1f5f9;
}

td {
  padding: 13px 12px;
  font-size: 14px;
  border-bottom: 1px solid #f8fafc;
}

.text-muted { color: #94a3b8; font-size: 13px; }
.text-center { text-align: center; }

.table-row-anim {
  animation: rowIn 0.4s ease both;
}

@keyframes rowIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge--en_attente { background: #fff7ed; color: #c2410c; }
.badge--confirmee { background: #eff6ff; color: #1d4ed8; }
.badge--en_livraison { background: #f5f3ff; color: #6d28d9; }
.badge--livree { background: #f0fdf4; color: #15803d; }
.badge--annulee { background: #fef2f2; color: #dc2626; }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .dashboard__title { font-size: 22px; }
  .card { padding: 16px; }
}

/* Professional refresh */
.dashboard {
  padding: 8px 0;
}

.dashboard__header {
  margin-bottom: 20px;
}

.dashboard__date {
  border: 1px solid #dbe3ee;
  background: #fff;
  color: #475569;
}

.stat-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}
</style>