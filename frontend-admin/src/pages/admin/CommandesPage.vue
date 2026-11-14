<template>
  <div class="page">

    <!-- EN-TÊTE -->
    <div class="header">
      <h2 class="header__title">Commandes <span class="header__count">{{ total }}</span></h2>
      <div class="header__actions">
        <select v-model="filtre" @change="load(1)" class="input">
          <option value="">Tous les statuts</option>
          <option value="en_attente">⏳ En attente</option>
          <option value="confirmee">✅ Confirmée</option>
          <option value="livree">🚚 Livrée</option>
          <option value="annulee">❌ Annulée</option>
        </select>
        <button class="btn-export" @click="exportSelectedExcel" :disabled="!selectedCount">📥 Excel sélection</button>
        <button class="btn-export" @click="exportSelectedPdf" :disabled="!selectedCount">📄 PDF sélection</button>
        <button class="btn-export" @click="exportExcel">📥 Excel (tout)</button>
        <button class="btn-export" @click="exportPdf">📄 PDF (tout)</button>
      </div>
    </div>

    <!-- TABLEAU -->
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="th-check">
                <input type="checkbox" :checked="allCurrentChecked" @change="toggleAllCurrent($event.target.checked)" />
              </th>
              <th>Référence</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Zone</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in commandes" :key="c.id">
              <td class="td-check">
                <input type="checkbox" :checked="isSelected(c.id)" @change="toggleSelected(c.id, $event.target.checked)" />
              </td>
              <td><strong class="ref">{{ c.reference }}</strong></td>
              <td>{{ c.nom_client }}</td>
              <td class="muted">{{ c.telephone }}</td>
              <td class="muted">{{ c.ZoneLivraison?.nom || '—' }}</td>
              <td><strong>{{ formatPrice(c.total) }}</strong></td>
              <td>
                <select
                  :value="c.statut"
                  @change="updateStatut(c, $event.target.value)"
                  :class="['badge', c.statut]"
                >
                  <option value="en_attente" :disabled="!canChangeStatut(c.statut, 'en_attente')">⏳ En attente</option>
                  <option value="confirmee" :disabled="!canChangeStatut(c.statut, 'confirmee')">✅ Confirmée</option>
                  <option value="livree" :disabled="!canChangeStatut(c.statut, 'livree')">🚚 Livrée</option>
                  <option value="annulee" :disabled="!canChangeStatut(c.statut, 'annulee')">❌ Annulée</option>
                </select>
              </td>
              <td class="muted">{{ formatDate(c.createdAt) }}</td>
              <td class="actions-cell">
                <button class="btn-voir" @click="voir(c)" title="Voir le détail">👁️ Voir</button>
                <button class="btn-del" @click="remove(c.id)" title="Supprimer">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="pagination" v-if="totalPages > 1">
        <span class="pagination__info">{{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }} sur {{ total }}</span>
        <div class="pagination__btns">
          <button :disabled="page === 1" @click="load(page - 1)">←</button>
          <button
            v-for="p in pages" :key="p"
            :class="{ active: p === page }"
            @click="load(p)"
          >{{ p }}</button>
          <button :disabled="page === totalPages" @click="load(page + 1)">→</button>
        </div>
      </div>
    </div>

    <!-- MODALE DÉTAIL -->
    <div v-if="detail" class="overlay" @click.self="detail = null">
      <div class="modal">
        <div class="modal__head">
          <h3>📦 Commande {{ detail.reference }}</h3>
          <button class="modal__close" @click="detail = null">✕</button>
        </div>

        <div class="modal__info">
          <div class="info-row"><span>👤 Client</span><strong>{{ detail.nom_client }}</strong></div>
          <div class="info-row"><span>📞 Téléphone</span><strong>{{ detail.telephone }}</strong></div>
          <div class="info-row"><span>📍 Adresse</span><strong>{{ detail.adresse }}</strong></div>
          <div class="info-row"><span>🚚 Zone</span><strong>{{ detail.ZoneLivraison?.nom }} ({{ formatPrice(detail.ZoneLivraison?.frais) }})</strong></div>
        </div>

        <table class="detail-table">
          <thead>
            <tr><th>Produit</th><th>Prix</th><th>Qté</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr v-for="d in detail.CommandeDetails" :key="d.id">
              <td>
                <div class="detail-product">
                  <img
                    v-if="detailImage(d)"
                    :src="imgUrl(detailImage(d))"
                    :alt="d.nom_produit"
                    class="detail-product__img"
                  />
                  <span>{{ d.nom_produit }}</span>
                </div>
                <span v-if="d.personnalisation" class="perso">🎨 {{ d.personnalisation }}</span>
              </td>
              <td>{{ formatPrice(d.prix_unitaire) }}</td>
              <td>{{ d.quantite }}</td>
              <td><strong>{{ formatPrice(d.prix_total) }}</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">Total</td>
              <td><strong>{{ formatPrice(detail.total) }}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="audit-box">
          <h4>Historique des actions</h4>
          <div v-if="detail.audit_logs?.length" class="audit-list">
            <div v-for="log in detail.audit_logs" :key="log.id" class="audit-item">
              <div class="audit-item__line">
                <strong>{{ auditLabel(log) }}</strong>
                <span>{{ formatDate(log.createdAt) }}</span>
              </div>
              <div class="audit-item__meta">
                <span>{{ log.admin?.nom || 'Système' }}</span>
                <span v-if="log.meta?.from || log.meta?.to">
                  {{ log.meta?.from || '—' }} → {{ log.meta?.to || '—' }}
                </span>
                <span v-if="log.meta?.note_admin">{{ log.meta.note_admin }}</span>
              </div>
            </div>
          </div>
          <p v-else class="audit-empty">Aucun historique.</p>
        </div>
      </div>
    </div>

    <div v-if="cancelFlow.open" class="cancel-overlay" @click.self="closeCancelModal">
      <div class="cancel-modal">
        <h4>Motif d'annulation</h4>
        <p>Merci de préciser pourquoi la commande est annulée.</p>
        <textarea
          v-model.trim="cancelFlow.reason"
          rows="4"
          placeholder="Ex: client injoignable, rupture de stock..."
        />
        <div class="cancel-actions">
          <button class="btn-cancel" @click="closeCancelModal">Retour</button>
          <button class="btn-confirm" @click="confirmCancelStatus">Confirmer l'annulation</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api, { imgUrl } from '../../services/api'

const commandes   = ref([])
const filtre      = ref('')
const detail      = ref(null)
const page        = ref(1)
const totalPages  = ref(1)
const total       = ref(0)
const limit       = ref(10)
const selectedIds = ref([])
const cancelFlow  = ref({
  open: false,
  commande: null,
  targetStatut: null,
  reason: ''
})
const TRANSITIONS = {
  en_attente: ['confirmee', 'annulee'],
  confirmee: ['livree', 'annulee'],
  livree: [],
  annulee: []
}

const pages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const selectedCount = computed(() => selectedIds.value.length)
const currentIds = computed(() => commandes.value.map(c => c.id))
const allCurrentChecked = computed(() =>
  currentIds.value.length > 0 && currentIds.value.every(id => selectedIds.value.includes(id))
)

const load = async (p = 1) => {
  page.value = p
  const params = { page: p, limit: limit.value }
  if (filtre.value) params.statut = filtre.value
  const { data } = await api.get('/commandes', { params })
  commandes.value  = data.commandes
  total.value      = data.total
  totalPages.value = data.pages
}

const applyStatusChange = async (commande, statut, noteAdmin = '') => {
  const payload = noteAdmin ? { statut, note_admin: noteAdmin } : { statut }
  try {
    await api.patch(`/commandes/${commande.id}/statut`, payload)
    await load(page.value)
    if (detail.value?.id === commande.id) await voir({ id: commande.id })
  } catch (err) {
    alert(err.response?.data?.message || 'Transition de statut refusée')
    await load(page.value)
  }
}

const closeCancelModal = async () => {
  cancelFlow.value = { open: false, commande: null, targetStatut: null, reason: '' }
  await load(page.value)
}

const confirmCancelStatus = async () => {
  const reason = cancelFlow.value.reason?.trim()
  if (!reason) {
    alert("Le motif d'annulation est obligatoire")
    return
  }
  const commande = cancelFlow.value.commande
  if (!commande) return
  await applyStatusChange(commande, 'annulee', reason)
  cancelFlow.value = { open: false, commande: null, targetStatut: null, reason: '' }
}

const updateStatut = async (commande, statut) => {
  if (statut === 'annulee' && commande.statut !== 'annulee') {
    cancelFlow.value = { open: true, commande, targetStatut: statut, reason: '' }
    return
  }
  await applyStatusChange(commande, statut)
}

const voir = async (c) => {
  const { data } = await api.get(`/commandes/${c.id}`)
  detail.value = data
}

const remove = async (id) => {
  if (confirm('Supprimer cette commande ?')) {
    await api.delete(`/commandes/${id}`)
    selectedIds.value = selectedIds.value.filter(x => x !== id)
    load(page.value)
  }
}

const isSelected = (id) => selectedIds.value.includes(id)
const toggleSelected = (id, checked) => {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}
const toggleAllCurrent = (checked) => {
  if (checked) {
    const s = new Set([...selectedIds.value, ...currentIds.value])
    selectedIds.value = [...s]
  } else {
    const current = new Set(currentIds.value)
    selectedIds.value = selectedIds.value.filter(id => !current.has(id))
  }
}

const exportFile = async (type, selectedOnly = false) => {
  if (selectedOnly && !selectedIds.value.length) {
    alert('Sélectionnez au moins une commande.')
    return
  }
  const token   = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  try {
    const qs = new URLSearchParams()
    if (selectedOnly) qs.set('ids', selectedIds.value.join(','))
    const requestUrl = `${baseUrl}/commandes/export/${type}${qs.toString() ? `?${qs.toString()}` : ''}`
    const res  = await fetch(requestUrl, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const blobUrl  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: blobUrl, download: `commandes.${type === 'excel' ? 'xlsx' : 'pdf'}` })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(blobUrl)
  } catch { alert('Erreur lors de l\'export') }
}

const exportExcel = () => exportFile('excel')
const exportPdf   = () => exportFile('pdf')
const exportSelectedExcel = () => exportFile('excel', true)
const exportSelectedPdf   = () => exportFile('pdf', true)

const detailImage = (d) => d?.image_produit || d?.Produit?.image_principale || null
const canChangeStatut = (from, to) => from === to || (TRANSITIONS[from] || []).includes(to)
const auditLabel = (log) => {
  if (log.action === 'status_changed') return 'Changement de statut'
  if (log.action === 'note_added') return 'Note ajoutée'
  if (log.action === 'created') return 'Commande créée'
  if (log.action === 'deleted') return 'Commande supprimée'
  return log.action
}

const formatPrice = (v) => v ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '—'
const formatDate  = (d) => new Date(d).toLocaleDateString('fr-FR')

onMounted(() => load(1))
</script>

<style scoped>
* { box-sizing: border-box; }

.page {
  background: #F7F9FC;
  min-height: 100vh;
  padding: 28px 24px;
  color: #1E293B;
}

/* EN-TÊTE */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.header__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.header__count {
  background: #3B82F6;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 30px;
}
.header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.input {
  padding: 9px 14px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  background: #fff;
  color: #1E293B;
  transition: border-color 0.2s;
}
.input:focus { border-color: #3B82F6; outline: none; }

.btn-export {
  padding: 9px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;
}
.btn-export:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }

/* CARTE TABLEAU */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 0;
  border: 2px solid #E2E8F0;
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

thead { background: #F8FAFC; }

th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748B;
  text-align: left;
  border-bottom: 2px solid #E2E8F0;
}
.th-check, .td-check {
  width: 44px;
  text-align: center;
}

td {
  padding: 13px 16px;
  font-size: 14px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}

tbody tr:last-child td { border-bottom: none; }
tbody tr:hover { background: #FAFBFC; }

.ref { color: #3B82F6; font-size: 13px; letter-spacing: 0.03em; }
.muted { color: #94A3B8; font-size: 13px; }

/* BADGE STATUT */
.badge {
  padding: 5px 10px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
.badge.en_attente { background: #FFF7ED; color: #C2410C; border-color: #FED7AA; }
.badge.confirmee  { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
.badge.livree     { background: #F0FDF4; color: #15803D; border-color: #BBF7D0; }
.badge.annulee    { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }

/* ACTIONS */
.actions-cell { display: flex; gap: 6px; align-items: center; }

.btn-voir {
  background: #EFF6FF;
  color: #3B82F6;
  border: 2px solid #BFDBFE;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-voir:hover { background: #3B82F6; color: #fff; border-color: #3B82F6; }

.btn-del {
  background: #FFF1F2;
  color: #E11D48;
  border: 2px solid #FECDD3;
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-del:hover { background: #E11D48; border-color: #E11D48; }

/* PAGINATION */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 2px solid #F1F5F9;
  flex-wrap: wrap;
  gap: 10px;
}
.pagination__info { font-size: 13px; color: #64748B; font-weight: 600; }
.pagination__btns { display: flex; gap: 5px; }
.pagination__btns button {
  padding: 7px 12px;
  border-radius: 8px;
  border: 2px solid #E2E8F0;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  color: #475569;
}
.pagination__btns button:hover:not(:disabled) { border-color: #3B82F6; color: #3B82F6; }
.pagination__btns button:disabled { opacity: 0.35; cursor: not-allowed; }
.pagination__btns button.active { background: #3B82F6; color: #fff; border-color: #3B82F6; }

/* MODALE */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 16px;
}
.modal {
  background: #fff;
  border-radius: 18px;
  width: 100%; max-width: 580px;
  max-height: 92vh; overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.modal__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 22px 16px;
  border-bottom: 2px solid #F1F5F9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal__head h3 { font-size: 17px; font-weight: 800; margin: 0; }
.modal__close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 2px solid #E2E8F0; background: #F8FAFC;
  font-size: 13px; font-weight: 700; cursor: pointer; color: #64748B;
}
.modal__close:hover { background: #FEE2E2; border-color: #E11D48; color: #E11D48; }

.modal__info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 18px 22px;
  background: #F8FAFC;
  border-bottom: 2px solid #F1F5F9;
}
.info-row {
  display: flex; flex-direction: column; gap: 3px;
}
.info-row span { font-size: 12px; color: #64748B; font-weight: 700; }
.info-row strong { font-size: 14px; color: #1E293B; }

.detail-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}
.detail-table th {
  padding: 10px 22px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B;
  text-align: left;
  border-bottom: 2px solid #F1F5F9;
  background: #F8FAFC;
}
.detail-table td {
  padding: 12px 22px;
  font-size: 14px;
  border-bottom: 1px solid #F1F5F9;
}
.detail-table tfoot td {
  font-size: 15px;
  font-weight: 700;
  padding: 14px 22px;
  border-top: 2px solid #E2E8F0;
  border-bottom: none;
  background: #F8FAFC;
}

.detail-product {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-product__img {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #E2E8F0;
  flex-shrink: 0;
}

.perso {
  display: inline-block;
  margin-top: 4px;
  margin-left: 4px;
  padding: 3px 8px;
  background: #FEF3C7;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #92400E;
}

.audit-box {
  padding: 14px 22px 18px;
  border-top: 2px solid #F1F5F9;
}
.audit-box h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1E293B;
}
.audit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.audit-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 10px;
}
.audit-item__line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.audit-item__meta {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: #64748B;
}
.audit-empty {
  margin: 0;
  font-size: 12px;
  color: #94A3B8;
}

.cancel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
  padding: 16px;
}
.cancel-modal {
  width: min(480px, 96vw);
  background: #fff;
  border-radius: 14px;
  border: 2px solid #E2E8F0;
  padding: 16px;
}
.cancel-modal h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #1E293B;
}
.cancel-modal p {
  margin: 0 0 10px;
  font-size: 13px;
  color: #64748B;
}
.cancel-modal textarea {
  width: 100%;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
}
.cancel-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-cancel,
.btn-confirm {
  border-radius: 9px;
  padding: 8px 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
.btn-cancel {
  background: #fff;
  border: 2px solid #E2E8F0;
  color: #475569;
}
.btn-confirm {
  background: #DC2626;
  border: 2px solid #DC2626;
  color: #fff;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .page { padding: 16px 12px; }
  .header { flex-direction: column; align-items: flex-start; }
  .header__actions { width: 100%; flex-direction: column; }
  .input, .btn-export { width: 100%; }
  .modal__info { grid-template-columns: 1fr; }
  .modal__head, .detail-table th, .detail-table td, .detail-table tfoot td { padding-left: 14px; padding-right: 14px; }
}

/* Professional refresh */
.page {
  background: transparent;
  min-height: auto;
  padding: 8px 0;
}

.header__title {
  font-size: 24px;
}

.header__count {
  background: #dbeafe;
  color: #1d4ed8;
}

.input,
.btn-export,
.btn-voir,
.btn-del {
  border-radius: 10px;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

tbody tr:hover {
  background: #f8fafc;
}

.modal {
  border: 1px solid #dbe3ee;
}
</style>