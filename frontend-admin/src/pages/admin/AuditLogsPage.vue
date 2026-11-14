<template>
  <div class="page">
    <div class="header">
      <div>
        <h2>Traçabilité admin</h2>
        <p>Historique des actions par utilisateur</p>
      </div>
    </div>

    <div class="filters">
      <input v-model.trim="q" class="input" placeholder="Rechercher (action, référence, id...)" @keyup.enter="load(1)" />
      <select v-model="adminId" class="input">
        <option value="">Tous les utilisateurs</option>
        <option v-for="a in admins" :key="a.id" :value="String(a.id)">
          {{ a.nom }} ({{ a.email }})
        </option>
      </select>
      <select v-model="entityType" class="input">
        <option value="">Tous types</option>
        <option value="commande">Commande</option>
        <option value="whatsapp_commande">Commande WhatsApp</option>
        <option value="admin">Utilisateur admin</option>
        <option value="produit">Produit</option>
        <option value="categorie">Catégorie</option>
        <option value="zone">Zone</option>
        <option value="page_accueil">Page d'accueil</option>
        <option value="marketing">Marketing</option>
        <option value="shop_settings">Paramètres boutique</option>
      </select>
      <select v-model="action" class="input">
        <option value="">Toutes actions</option>
        <option v-for="item in availableActions" :key="item" :value="item">
          {{ formatActionLabel(item) }}
        </option>
      </select>
      <input v-model="fromDate" type="date" class="input" />
      <input v-model="toDate" type="date" class="input" />
      <button class="btn" @click="load(1)">Filtrer</button>
      <button class="btn btn--soft" @click="resetFilters">Réinitialiser</button>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card kpi-card--period">
        <p class="kpi-card__label">Période</p>
        <p class="kpi-card__value">{{ periodLabel }}</p>
      </div>
      <div class="kpi-card kpi-card--products">
        <p class="kpi-card__label">Produits ajoutés</p>
        <p class="kpi-card__value">{{ totalProductCreations }}</p>
      </div>
      <div class="kpi-card kpi-card--status">
        <p class="kpi-card__label">Changements statut</p>
        <p class="kpi-card__value">{{ totalCommandeStatusChanges }}</p>
      </div>
      <div class="kpi-card kpi-card--cancel">
        <p class="kpi-card__label">Annulations</p>
        <p class="kpi-card__value">{{ totalCommandeCancellations }}</p>
      </div>
      <div class="kpi-card kpi-card--logs">
        <p class="kpi-card__label">Logs trouvés</p>
        <p class="kpi-card__value">{{ total }}</p>
      </div>
    </div>

    <div class="stats-card" v-if="productCreationsByUser.length">
      <div class="stats-head">
        <h3>Produits ajoutés par utilisateur</h3>
        <div class="stats-actions">
          <button class="btn btn--stats" @click="exportProductCreationsExcel">📥 Export Excel</button>
          <button class="btn btn--stats" @click="exportProductCreationsPdf">📄 Export PDF</button>
        </div>
      </div>
      <div class="stats-wrap">
        <div v-for="item in productCreationsByUser" :key="item.admin_id || 'system'" class="stats-item">
          <p class="stats-item__name">
            {{ item.admin_email ? `${item.admin_nom} (${item.admin_email})` : item.admin_nom }}
          </p>
          <p class="stats-item__count">{{ item.total }} produit{{ item.total > 1 ? 's' : '' }}</p>
        </div>
      </div>
    </div>

    <div class="stats-card" v-if="commandeStatusChangesByUser.length">
      <div class="stats-head">
        <h3>Changements de statut commandes par utilisateur</h3>
        <div class="stats-actions">
          <button class="btn btn--stats" @click="exportCommandeStatusChangesExcel">📥 Export Excel</button>
          <button class="btn btn--stats" @click="exportCommandeStatusChangesPdf">📄 Export PDF</button>
        </div>
      </div>
      <div class="stats-wrap">
        <div v-for="item in commandeStatusChangesByUser" :key="`status-${item.admin_id || 'system'}`" class="stats-item">
          <p class="stats-item__name">
            {{ item.admin_email ? `${item.admin_nom} (${item.admin_email})` : item.admin_nom }}
          </p>
          <p class="stats-item__count">{{ item.total }} changement{{ item.total > 1 ? 's' : '' }}</p>
        </div>
      </div>
    </div>

    <div class="stats-card" v-if="commandeCancellationsByUser.length">
      <div class="stats-head">
        <h3>Annulations de commandes par utilisateur</h3>
        <div class="stats-actions">
          <button class="btn btn--stats" @click="exportCommandeCancellationsExcel">📥 Export Excel</button>
          <button class="btn btn--stats" @click="exportCommandeCancellationsPdf">📄 Export PDF</button>
        </div>
      </div>
      <div class="stats-wrap">
        <div v-for="item in commandeCancellationsByUser" :key="`cancel-${item.admin_id || 'system'}`" class="stats-item">
          <p class="stats-item__name">
            {{ item.admin_email ? `${item.admin_nom} (${item.admin_email})` : item.admin_nom }}
          </p>
          <p class="stats-item__count">{{ item.total }} annulation{{ item.total > 1 ? 's' : '' }}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Action</th>
              <th>Cible</th>
              <th>Référence</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="muted">{{ formatDate(log.createdAt) }}</td>
              <td>{{ log.actor ? `${log.actor.nom} (${log.actor.email})` : 'Système' }}</td>
              <td><span class="chip">{{ log.action }}</span></td>
              <td>{{ entityLabel(log.entity_type) }} #{{ log.entity_id }}</td>
              <td>{{ log.entity_reference || '—' }}</td>
              <td class="details">{{ summarizeMeta(log.meta) }}</td>
            </tr>
            <tr v-if="!logs.length">
              <td colspan="6" class="empty">Aucun log trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <span>{{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }} sur {{ total }}</span>
        <div class="buttons">
          <button :disabled="page === 1" @click="load(page - 1)">←</button>
          <button
            v-for="p in pages"
            :key="p"
            :class="{ active: p === page }"
            @click="load(p)"
          >{{ p }}</button>
          <button :disabled="page === totalPages" @click="load(page + 1)">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'

const logs = ref([])
const admins = ref([])
const availableActions = ref([])
const productCreationsByUser = ref([])
const commandeStatusChangesByUser = ref([])
const commandeCancellationsByUser = ref([])
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const limit = ref(20)

const q = ref('')
const adminId = ref('')
const entityType = ref('')
const action = ref('')
const fromDate = ref('')
const toDate = ref('')

const sumStats = (rows = []) => rows.reduce((sum, row) => sum + Number(row.total || 0), 0)
const totalProductCreations = computed(() => sumStats(productCreationsByUser.value))
const totalCommandeStatusChanges = computed(() => sumStats(commandeStatusChangesByUser.value))
const totalCommandeCancellations = computed(() => sumStats(commandeCancellationsByUser.value))
const periodLabel = computed(() => {
  if (fromDate.value && toDate.value) return `${fromDate.value} -> ${toDate.value}`
  if (fromDate.value) return `Depuis ${fromDate.value}`
  if (toDate.value) return `Jusqu'au ${toDate.value}`
  return 'Toute période'
})

const pages = computed(() => {
  const count = Math.min(totalPages.value, 7)
  const start = Math.max(1, page.value - 3)
  return Array.from({ length: count }, (_, i) => start + i).filter(p => p <= totalPages.value)
})

const entityLabel = (type) => {
  if (type === 'commande') return 'Commande'
  if (type === 'whatsapp_commande') return 'Commande WhatsApp'
  if (type === 'admin') return 'Admin'
  if (type === 'produit') return 'Produit'
  if (type === 'categorie') return 'Catégorie'
  if (type === 'zone') return 'Zone'
  if (type === 'page_accueil') return "Page d'accueil"
  if (type === 'marketing') return 'Marketing'
  if (type === 'shop_settings') return 'Paramètres boutique'
  return type
}

const summarizeMeta = (meta) => {
  if (!meta) return '—'
  if (meta.from || meta.to) return `${meta.from || '—'} -> ${meta.to || '—'}`
  if (Array.isArray(meta.changed_keys)) return `Clés modifiées: ${meta.changed_keys.join(', ')}`
  if (Array.isArray(meta.updated_fields)) return `Champs modifiés: ${meta.updated_fields.join(', ')}`
  if (meta.image_url) return `${meta.image_url}${meta.was_main ? ' (principale)' : ''}`
  if (meta.note_admin) return String(meta.note_admin).slice(0, 120)
  if (meta.email) return `${meta.nom || ''} ${meta.email}`.trim()
  return JSON.stringify(meta).slice(0, 120)
}

const formatDate = (d) => new Date(d).toLocaleString('fr-FR')
const formatActionLabel = (value) => String(value || '').replace(/_/g, ' ')

const buildParams = (nextPage = 1) => {
  const params = { page: nextPage, limit: limit.value }
  if (q.value) params.q = q.value
  if (adminId.value) params.admin_id = adminId.value
  if (entityType.value) params.entity_type = entityType.value
  if (action.value) params.action = action.value
  if (fromDate.value) params.from = fromDate.value
  if (toDate.value) params.to = toDate.value
  return params
}

const buildStatsExportParams = () => {
  const params = new URLSearchParams()
  if (adminId.value) params.set('admin_id', adminId.value)
  if (fromDate.value) params.set('from', fromDate.value)
  if (toDate.value) params.set('to', toDate.value)
  return params
}

const load = async (nextPage = 1) => {
  const { data } = await api.get('/admin-audit', { params: buildParams(nextPage) })
  logs.value = data.logs || []
  availableActions.value = data.available_actions || []
  productCreationsByUser.value = data.product_creations_by_user || []
  commandeStatusChangesByUser.value = data.commande_status_changes_by_user || []
  commandeCancellationsByUser.value = data.commande_cancellations_by_user || []
  page.value = Number(data.page || nextPage)
  total.value = Number(data.total || 0)
  totalPages.value = Number(data.pages || 1)
}

const loadAdmins = async () => {
  const { data } = await api.get('/admins')
  admins.value = data || []
}

const exportProductCreationsExcel = async () => {
  await exportStatsFile('product-creations', 'excel')
}

const exportProductCreationsPdf = async () => {
  await exportStatsFile('product-creations', 'pdf')
}

const exportCommandeStatusChangesExcel = async () => {
  await exportStatsFile('commande-status-changes', 'excel')
}

const exportCommandeStatusChangesPdf = async () => {
  await exportStatsFile('commande-status-changes', 'pdf')
}

const exportCommandeCancellationsExcel = async () => {
  await exportStatsFile('commande-cancellations', 'excel')
}

const exportCommandeCancellationsPdf = async () => {
  await exportStatsFile('commande-cancellations', 'pdf')
}

const exportStatsFile = async (scope, type) => {
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  try {
    const params = buildStatsExportParams()
    const url = `${baseUrl}/admin-audit/export/${scope}/${type}${params.toString() ? `?${params.toString()}` : ''}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const filenamePrefix = scope === 'product-creations'
      ? 'produits-par-utilisateur'
      : scope === 'commande-status-changes'
        ? 'changements-statut-commandes'
        : 'annulations-commandes'
    const a = Object.assign(document.createElement('a'), {
      href: blobUrl,
      download: `${filenamePrefix}.${type === 'excel' ? 'xlsx' : 'pdf'}`
    })
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    alert(`Erreur lors de l'export ${type === 'excel' ? 'Excel' : 'PDF'}`)
  }
}

const resetFilters = async () => {
  q.value = ''
  adminId.value = ''
  entityType.value = ''
  action.value = ''
  fromDate.value = ''
  toDate.value = ''
  await load(1)
}

onMounted(async () => {
  await Promise.all([loadAdmins(), load(1)])
})
</script>

<style scoped>
.page { padding: 8px 0; }
.header h2 { margin: 0; }
.header p { margin: 4px 0 12px; color: #64748b; }

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
.input {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 13px;
  font-family: inherit;
}
.btn {
  border: 2px solid #3b82f6;
  background: #3b82f6;
  color: #fff;
  border-radius: 10px;
  padding: 9px 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn--soft {
  border-color: #e2e8f0;
  background: #fff;
  color: #475569;
}

.stats-card {
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 14px;
  margin-bottom: 14px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
.kpi-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 10px 12px;
}
.kpi-card--period { border-color: #cbd5e1; background: #f8fafc; }
.kpi-card--products { border-color: #bbf7d0; background: #f0fdf4; }
.kpi-card--status { border-color: #bfdbfe; background: #eff6ff; }
.kpi-card--cancel { border-color: #fecaca; background: #fef2f2; }
.kpi-card--logs { border-color: #ddd6fe; background: #f5f3ff; }
.kpi-card__label {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.kpi-card__value {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 900;
}
.kpi-card--products .kpi-card__value { color: #166534; }
.kpi-card--status .kpi-card__value { color: #1d4ed8; }
.kpi-card--cancel .kpi-card__value { color: #b91c1c; }
.kpi-card--logs .kpi-card__value { color: #6d28d9; }
.stats-card h3 {
  margin: 0;
  font-size: 14px;
  color: #0f172a;
}
.stats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.stats-actions {
  display: flex;
  gap: 8px;
}
.btn--stats {
  border-color: #e2e8f0;
  background: #fff;
  color: #475569;
  padding: 7px 10px;
  font-size: 12px;
}
.btn--stats:hover {
  border-color: #3b82f6;
  color: #1d4ed8;
  background: #eff6ff;
}
.stats-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
}
.stats-item {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  background: #f8fafc;
}
.stats-item__name {
  margin: 0;
  color: #334155;
  font-size: 12px;
  word-break: break-word;
}
.stats-item__count {
  margin: 6px 0 0;
  color: #1d4ed8;
  font-weight: 800;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 900px; }
th, td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: left; font-size: 13px; }
th { text-transform: uppercase; letter-spacing: .06em; color: #64748b; font-size: 11px; }
.muted { color: #64748b; white-space: nowrap; }
.chip { background: #eff6ff; color: #1d4ed8; border-radius: 999px; padding: 4px 8px; font-size: 12px; font-weight: 700; }
.details { color: #475569; max-width: 320px; }
.empty { text-align: center; color: #94a3b8; }

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}
.buttons { display: flex; gap: 6px; }
.buttons button {
  border: 2px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-weight: 700;
}
.buttons button.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: #fff;
}

@media (max-width: 700px) {
  .stats-head {
    flex-direction: column;
    align-items: flex-start;
  }
  .stats-actions {
    width: 100%;
  }
  .btn--stats {
    flex: 1;
  }
}
</style>
