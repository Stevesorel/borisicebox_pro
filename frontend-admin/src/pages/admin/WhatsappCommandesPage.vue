<template>
  <div class="wa-page">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <div class="icon-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <div>
          <h2 class="page-title">Commandes WhatsApp</h2>
          <span class="page-count">{{ total }} commande{{ total > 1 ? 's' : '' }}</span>
        </div>
      </div>
      <div class="page-header__right">
        <div class="filter-wrap">
          <svg class="filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          <select v-model="filtreStatut" @change="load(1)" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="contacte">Contacté</option>
            <option value="confirmee">Confirmée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card stat-card--warning">
        <div class="stat-card__dot"></div>
        <div class="stat-card__value">{{ stats.en_attente }}</div>
        <div class="stat-card__label">En attente</div>
        <svg class="stat-card__bg-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" fill="none" stroke="white" stroke-width="2"/></svg>
      </div>
      <div class="stat-card stat-card--info">
        <div class="stat-card__dot"></div>
        <div class="stat-card__value">{{ stats.contacte }}</div>
        <div class="stat-card__label">Contactés</div>
        <svg class="stat-card__bg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
      </div>
      <div class="stat-card stat-card--success">
        <div class="stat-card__dot"></div>
        <div class="stat-card__value">{{ stats.confirmee }}</div>
        <div class="stat-card__label">Confirmées</div>
        <svg class="stat-card__bg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div class="stat-card stat-card--danger">
        <div class="stat-card__dot"></div>
        <div class="stat-card__value">{{ stats.annulee }}</div>
        <div class="stat-card__label">Annulées</div>
        <svg class="stat-card__bg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
    </div>

    <!-- Tableau -->
    <div class="table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Articles</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in commandes" :key="c.id" :class="{ 'row--traite': c.traite }">
              <td>
                <span class="ref-badge">{{ c.reference }}</span>
              </td>
              <td>
                <div class="client-cell">
                  <div class="client-avatar">{{ c.nom_client?.charAt(0)?.toUpperCase() }}</div>
                  <span>{{ c.nom_client }}</span>
                </div>
              </td>
              <td>
                <a :href="'https://wa.me/' + c.telephone?.replace(/[^0-9]/g,'')" target="_blank" class="tel-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  {{ c.telephone }}
                </a>
              </td>
              <td>
                <div class="articles-cell">
                  <span class="articles-count">{{ c.nombre_articles }} art.</span>
                  <div class="articles-tags">
                    <span v-for="p in c.produits?.slice(0,2)" :key="p.nom" class="article-tag">{{ p.quantite }}× {{ p.nom }}</span>
                    <span v-if="c.produits?.length > 2" class="article-tag article-tag--more">+{{ c.produits.length - 2 }}</span>
                  </div>
                </div>
              </td>
              <td><span class="price">{{ formatPrice(c.total) }}</span></td>
              <td>
                <select :value="c.statut" @change="updateStatut(c, $event.target.value)" :class="['status-select', 'status-select--' + c.statut]">
                  <option value="en_attente" :disabled="!canChangeStatut(c.statut, 'en_attente')">En attente</option>
                  <option value="contacte" :disabled="!canChangeStatut(c.statut, 'contacte')">Contacté</option>
                  <option value="confirmee" :disabled="!canChangeStatut(c.statut, 'confirmee')">Confirmée</option>
                  <option value="annulee" :disabled="!canChangeStatut(c.statut, 'annulee')">Annulée</option>
                </select>
              </td>
              <td><span class="date-cell">{{ formatDate(c.createdAt) }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="action-btn" @click="voirDetail(c)" title="Voir le détail">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="action-btn action-btn--danger" @click="remove(c.id)" title="Supprimer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="commandes.length === 0">
              <td colspan="8">
                <div class="empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <p>Aucune commande WhatsApp</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="pagination">
        <span class="pagination-info">{{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }} sur {{ total }}</span>
        <div class="pagination-btns">
          <button class="pag-btn" :disabled="page === 1" @click="load(page - 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button v-for="p in pagesArray" :key="p" :class="['pag-btn', { 'pag-btn--active': p === page }]" @click="load(p)">{{ p }}</button>
          <button class="pag-btn" :disabled="page === pages" @click="load(page + 1)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal détail -->
    <Transition name="modal">
      <div v-if="detail" class="modal-overlay" @click.self="detail = null">
        <div class="modal-box">

          <div class="modal-header">
            <div class="modal-header__left">
              <div class="modal-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <h3 class="modal-title">{{ detail.reference }}</h3>
                <span :class="['modal-status', 'modal-status--' + detail.statut]">{{ statutLabel(detail.statut) }}</span>
              </div>
            </div>
            <button @click="detail = null" class="modal-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">

            <!-- Client -->
            <div class="modal-section">
              <p class="section-label">Client</p>
              <div class="info-row">
                <div class="info-block">
                  <span class="info-key">Nom complet</span>
                  <strong class="info-val">{{ detail.nom_client }}</strong>
                </div>
                <div class="info-block">
                  <span class="info-key">WhatsApp</span>
                  <a :href="'https://wa.me/' + detail.telephone?.replace(/[^0-9]/g,'')" target="_blank" class="wa-cta">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {{ detail.telephone }}
                  </a>
                </div>
                <div class="info-block" v-if="detail.date_contact">
                  <span class="info-key">Contacté le</span>
                  <strong class="info-val">{{ formatDate(detail.date_contact) }}</strong>
                </div>
              </div>
            </div>

            <!-- Produits -->
            <div class="modal-section">
              <p class="section-label">Produits commandés</p>
              <div class="products-table-wrap">
                <table class="products-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix unitaire</th>
                      <th>Qté</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in detail.produits" :key="p.nom">
                      <td>
                        <div class="product-line">
                          <img v-if="p.image_produit" :src="imgUrl(p.image_produit)" :alt="p.nom" class="product-line__img" />
                          <strong>{{ p.nom }}</strong>
                        </div>
                        <span v-if="p.personnalisation" class="perso-chip">{{ p.personnalisation }}</span>
                      </td>
                      <td>{{ formatPrice(p.prix_unitaire) }}</td>
                      <td><span class="qty-badge">{{ p.quantite }}</span></td>
                      <td><strong class="price-green">{{ formatPrice(p.prix_total) }}</strong></td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" class="total-label">Total commande</td>
                      <td><strong class="price-green price-green--lg">{{ formatPrice(detail.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Note admin -->
            <div class="modal-section">
              <p class="section-label">Note admin</p>
              <textarea class="note-area" v-model="noteAdmin" placeholder="Ajouter une note interne..." rows="3"></textarea>
              <button class="save-btn" @click="saveNote" :disabled="!noteAdmin.trim()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Sauvegarder la note
              </button>
            </div>

            <div class="modal-section">
              <p class="section-label">Historique des actions</p>
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
      </div>
    </Transition>

    <div v-if="cancelFlow.open" class="cancel-overlay" @click.self="closeCancelModal">
      <div class="cancel-modal">
        <h4>Motif d'annulation</h4>
        <p>Merci de renseigner un motif avant d'annuler cette commande.</p>
        <textarea
          v-model.trim="cancelFlow.reason"
          rows="4"
          placeholder="Ex: client injoignable, commande doublon..."
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

const commandes = ref([])
const filtreStatut = ref('')
const detail = ref(null)
const noteAdmin = ref('')
const page = ref(1)
const pages = ref(1)
const total = ref(0)
const limit = ref(20)
const cancelFlow = ref({
  open: false,
  commande: null,
  reason: ''
})
const TRANSITIONS = {
  en_attente: ['contacte', 'confirmee', 'annulee'],
  contacte: ['confirmee', 'annulee'],
  confirmee: ['annulee'],
  annulee: []
}

const stats = computed(() => {
  const s = { en_attente: 0, contacte: 0, confirmee: 0, annulee: 0 }
  commandes.value.forEach(c => { if (s[c.statut] !== undefined) s[c.statut]++ })
  return s
})

const pagesArray = computed(() => Array.from({ length: pages.value }, (_, i) => i + 1))

const load = async (p = 1) => {
  page.value = p
  const params = { page: p, limit: limit.value }
  if (filtreStatut.value) params.statut = filtreStatut.value
  const { data } = await api.get('/whatsapp-commandes', { params })
  commandes.value = data.commandes
  total.value = data.total
  pages.value = data.pages
}

const applyStatusChange = async (commande, statut, note = null) => {
  const payload = note ? { statut, note_admin: note } : { statut }
  try {
    await api.patch(`/whatsapp-commandes/${commande.id}/statut`, payload)
    await load(page.value)
    if (detail.value?.id === commande.id) await voirDetail({ id: commande.id })
  } catch (err) {
    alert(err.response?.data?.message || 'Transition de statut refusée')
    await load(page.value)
  }
}

const closeCancelModal = async () => {
  cancelFlow.value = { open: false, commande: null, reason: '' }
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
  cancelFlow.value = { open: false, commande: null, reason: '' }
}

const updateStatut = async (commande, statut) => {
  if (statut === 'annulee' && commande.statut !== 'annulee') {
    cancelFlow.value = { open: true, commande, reason: detail.value?.note_admin || '' }
    return
  }
  await applyStatusChange(commande, statut)
}

const voirDetail = async (c) => {
  const { data } = await api.get(`/whatsapp-commandes/${c.id}`)
  detail.value = data
  noteAdmin.value = data.note_admin || ''
}

const saveNote = async () => {
  if (!noteAdmin.value.trim()) return
  try {
    await api.patch(`/whatsapp-commandes/${detail.value.id}/statut`, { statut: detail.value.statut, note_admin: noteAdmin.value })
    detail.value.note_admin = noteAdmin.value
    await voirDetail({ id: detail.value.id })
  } catch (err) {
    alert(err.response?.data?.message || 'Impossible de sauvegarder la note')
  }
}

const remove = async (id) => {
  if (confirm('Supprimer cette commande WhatsApp ?')) {
    await api.delete(`/whatsapp-commandes/${id}`)
    load(page.value)
  }
}

const formatPrice = (v) => v ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '—'
const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const statutLabel = (s) => ({ en_attente: 'En attente', contacte: 'Contacté', confirmee: 'Confirmée', annulee: 'Annulée' }[s] || s)
const canChangeStatut = (from, to) => from === to || (TRANSITIONS[from] || []).includes(to)
const auditLabel = (log) => {
  if (log.action === 'status_changed') return 'Changement de statut'
  if (log.action === 'note_updated') return 'Note modifiée'
  if (log.action === 'created') return 'Commande créée'
  if (log.action === 'deleted') return 'Commande supprimée'
  return log.action
}

onMounted(() => load(1))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

/* ─── ROOT ─────────────────────────────────────────────── */
.wa-page {
  max-width: 1340px;
  padding: 0 4px;
  color: #0f172a;
}

/* ─── HEADER ─────────────────────────────────────────────── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-badge {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.35);
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1;
  margin: 0 0 3px;
}

.page-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.filter-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.filter-select {
  padding: 10px 14px 10px 34px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  background: #fff;
  color: #0f172a;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  -webkit-appearance: none;
}

.filter-select:focus {
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.12);
  outline: none;
}

/* ─── STATS ─────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px 20px 18px;
  position: relative;
  overflow: hidden;
  border: 1.5px solid #f1f5f9;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.07);
}

.stat-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-bottom: 14px;
}

.stat-card__value {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-card__label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card__bg-icon {
  position: absolute;
  right: -8px;
  bottom: -8px;
  width: 64px;
  height: 64px;
  opacity: 0.08;
}

.stat-card--warning { border-top: 3px solid #f59e0b; }
.stat-card--warning .stat-card__dot { background: #f59e0b; }
.stat-card--warning .stat-card__value { color: #b45309; }
.stat-card--warning .stat-card__bg-icon { color: #f59e0b; }

.stat-card--info { border-top: 3px solid #3b82f6; }
.stat-card--info .stat-card__dot { background: #3b82f6; }
.stat-card--info .stat-card__value { color: #1d4ed8; }
.stat-card--info .stat-card__bg-icon { color: #3b82f6; }

.stat-card--success { border-top: 3px solid #25D366; }
.stat-card--success .stat-card__dot { background: #25D366; }
.stat-card--success .stat-card__value { color: #15803d; }
.stat-card--success .stat-card__bg-icon { color: #25D366; }

.stat-card--danger { border-top: 3px solid #ef4444; }
.stat-card--danger .stat-card__dot { background: #ef4444; }
.stat-card--danger .stat-card__value { color: #b91c1c; }
.stat-card--danger .stat-card__bg-icon { color: #ef4444; }

/* ─── TABLE CARD ─────────────────────────────────────────────── */
.table-card {
  background: #fff;
  border-radius: 18px;
  border: 1.5px solid #f1f5f9;
  overflow: hidden;
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

thead {
  background: #f8fafc;
  border-bottom: 1.5px solid #e2e8f0;
}

th {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 14px 16px;
  font-size: 13.5px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

tbody tr {
  transition: background 0.15s;
}

tbody tr:hover { background: #fafcff; }

tbody tr:last-child td { border-bottom: none; }

.row--traite { opacity: 0.45; }

/* ─── TABLE CELLS ─────────────────────────────────────────────── */
.ref-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 9px;
  border-radius: 6px;
  white-space: nowrap;
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.client-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tel-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #15803d;
  font-weight: 600;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.tel-link:hover { color: #128C7E; }

.articles-cell { display: flex; flex-direction: column; gap: 4px; }
.articles-count { font-size: 11px; color: #94a3b8; font-weight: 600; }
.articles-tags { display: flex; flex-wrap: wrap; gap: 3px; }

.article-tag {
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.article-tag--more {
  background: #e0e7ff;
  color: #4338ca;
  font-weight: 700;
}

.price {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

.date-cell {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

/* ─── STATUS SELECT ─────────────────────────────────────────────── */
.status-select {
  padding: 5px 10px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  -webkit-appearance: none;
}

.status-select:focus { outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }

.status-select--en_attente { background: #fef3c7; color: #92400e; border-color: #fde68a; }
.status-select--contacte   { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
.status-select--confirmee  { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.status-select--annulee    { background: #fee2e2; color: #991b1b; border-color: #fecaca; }

/* ─── ROW ACTIONS ─────────────────────────────────────────────── */
.row-actions { display: flex; gap: 6px; }

.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.action-btn--danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* ─── EMPTY STATE ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px;
  color: #cbd5e1;
}

.empty-state p { font-size: 14px; color: #94a3b8; }

/* ─── PAGINATION ─────────────────────────────────────────────── */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1.5px solid #f1f5f9;
}

.pagination-info { font-size: 12px; color: #94a3b8; font-weight: 500; }

.pagination-btns { display: flex; gap: 5px; }

.pag-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  transition: all 0.2s;
}

.pag-btn:hover:not(:disabled) {
  border-color: #25D366;
  color: #15803d;
  background: #f0fdf4;
}

.pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.pag-btn--active {
  background: #25D366;
  border-color: #25D366;
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);
}

/* ─── MODAL ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
}

.modal-box {
  background: #fff;
  border-radius: 22px;
  width: 100%;
  max-width: 660px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 32px 80px rgba(0,0,0,0.22);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 26px 0;
}

.modal-header__left { display: flex; align-items: center; gap: 14px; }

.modal-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(37, 211, 102, 0.3);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  margin: 0 0 5px;
}

.modal-status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 9px;
  border-radius: 5px;
}

.modal-status--en_attente { background: #fef3c7; color: #92400e; }
.modal-status--contacte   { background: #dbeafe; color: #1e40af; }
.modal-status--confirmee  { background: #dcfce7; color: #15803d; }
.modal-status--annulee    { background: #fee2e2; color: #991b1b; }

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-close:hover { background: #fee2e2; border-color: #fecaca; color: #dc2626; }

.modal-body { padding: 20px 26px 28px; display: flex; flex-direction: column; gap: 24px; }

.modal-section {}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
  margin: 0 0 10px;
}

.info-row { display: flex; flex-wrap: wrap; gap: 10px; }

.info-block {
  flex: 1;
  min-width: 140px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1.5px solid #f1f5f9;
}

.info-key {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-bottom: 5px;
}

.info-val { font-size: 14px; font-weight: 600; color: #0f172a; }

.wa-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #dcfce7;
  color: #15803d;
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  margin-top: 2px;
  transition: background 0.2s;
}

.wa-cta:hover { background: #bbf7d0; }

/* ─── PRODUCTS TABLE ─────────────────────────────────────────────── */
.products-table-wrap {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table thead { background: #f8fafc; }

.products-table th {
  padding: 10px 14px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
  text-align: left;
  border-bottom: 1.5px solid #e2e8f0;
}

.products-table td {
  padding: 12px 14px;
  font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}

.products-table tbody tr:last-child td { border-bottom: none; }

.products-table tfoot { background: #f8fafc; border-top: 1.5px solid #e2e8f0; }

.products-table tfoot td { padding: 12px 14px; font-size: 13px; }

.perso-chip {
  display: inline-block;
  font-size: 10px;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 7px;
  border-radius: 4px;
  margin-left: 6px;
}

.product-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-line__img {
  width: 34px;
  height: 34px;
  border-radius: 7px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}

.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  border-radius: 7px;
}

.price-green {
  color: #15803d;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}
.price-green--lg { font-size: 15px; }
.total-label { color: #64748b; font-weight: 600; font-size: 13px; }

/* ─── NOTE ─────────────────────────────────────────────── */
.note-area {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13px;
  color: #0f172a;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.note-area:focus {
  border-color: #25D366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.12);
  outline: none;
}

.save-btn {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
}

.save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.audit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.audit-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
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
  color: #64748b;
}
.audit-empty {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.cancel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 350;
  padding: 16px;
}
.cancel-modal {
  width: min(500px, 96vw);
  background: #fff;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  padding: 16px;
}
.cancel-modal h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #0f172a;
}
.cancel-modal p {
  margin: 0 0 10px;
  font-size: 13px;
  color: #64748b;
}
.cancel-modal textarea {
  width: 100%;
  border: 2px solid #e2e8f0;
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
  border: 2px solid #e2e8f0;
  color: #475569;
}
.btn-confirm {
  background: #dc2626;
  border: 2px solid #dc2626;
  color: #fff;
}

/* ─── MODAL TRANSITIONS ─────────────────────────────────────────────── */
.modal-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; transform: scale(0.94) translateY(12px); }
.modal-leave-to { opacity: 0; transform: scale(0.96); }

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 16px; }
  .stat-card__value { font-size: 26px; }
  .modal-box { border-radius: 18px; }
  .modal-header, .modal-body { padding-left: 18px; padding-right: 18px; }
  .info-row { flex-direction: column; }
  .pagination { flex-direction: column; gap: 10px; }
}

@media (max-width: 420px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .page-title { font-size: 18px; }
}

/* Professional refresh */
.wa-page {
  max-width: none;
  padding: 8px 0;
}

.icon-badge {
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(37, 211, 102, 0.22);
}

.stats-grid {
  gap: 12px;
}

.stat-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.table-card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.modal-box {
  border: 1px solid #dbe3ee;
}
</style>