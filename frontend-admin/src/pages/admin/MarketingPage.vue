<template>
  <div class="page">
    <div class="header">
      <div>
        <h1 class="title">Marketing</h1>
        <p class="subtitle">Promotions globales, annonces et événements visibles sur la boutique</p>
      </div>
      <button class="btn-primary" @click="openModal()">+ Ajouter</button>
    </div>

    <div class="filters">
      <button :class="['filter-btn', { active: filtreType === '' }]" @click="filtreType = ''">Tout</button>
      <button :class="['filter-btn', { active: filtreType === 'annonce' }]" @click="filtreType = 'annonce'">Annonces</button>
      <button :class="['filter-btn', { active: filtreType === 'evenement' }]" @click="filtreType = 'evenement'">Événements</button>
    </div>

    <div v-if="loading" class="state">Chargement...</div>
    <div v-else-if="itemsFiltres.length === 0" class="state">Aucun contenu marketing.</div>

    <div v-else class="grid">
      <article v-for="item in itemsFiltres" :key="item.id" class="card" :class="{ 'card--off': !item.actif }">
        <div class="card__top">
          <span class="type" :class="`type--${item.type}`">{{ item.type === 'evenement' ? 'Événement' : 'Annonce' }}</span>
          <span class="status">{{ item.actif ? 'Actif' : 'Inactif' }}</span>
        </div>
        <h3>{{ item.titre_fr }}</h3>
        <p v-if="item.contenu_fr">{{ item.contenu_fr }}</p>
        <div class="meta">
          <span v-if="item.badge_fr">Badge: {{ item.badge_fr }}</span>
          <span v-if="item.date_debut">Début: {{ formatDate(item.date_debut) }}</span>
          <span v-if="item.date_fin">Fin: {{ formatDate(item.date_fin) }}</span>
          <span>Ordre: {{ item.ordre || 0 }}</span>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="openModal(item)">Modifier</button>
          <button class="btn-del" @click="remove(item.id)">Supprimer</button>
        </div>
      </article>
    </div>

    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal__head">
          <h2>{{ form.id ? 'Modifier' : 'Ajouter' }} un contenu</h2>
          <button @click="modal = false">✕</button>
        </div>

        <div class="modal__body">
          <div class="row2">
            <label class="field">
              Type
              <select v-model="form.type" class="input">
                <option value="annonce">Annonce</option>
                <option value="evenement">Événement</option>
              </select>
            </label>
            <label class="field">
              Ordre
              <input v-model.number="form.ordre" type="number" class="input" />
            </label>
          </div>

          <div class="row2">
            <label class="field">
              Titre FR *
              <input v-model="form.titre_fr" class="input" maxlength="160" />
            </label>
            <label class="field">
              Titre EN
              <input v-model="form.titre_en" class="input" maxlength="160" />
            </label>
          </div>

          <div class="row2">
            <label class="field">
              Badge FR
              <input v-model="form.badge_fr" class="input" placeholder="Ex: Nouveau" maxlength="60" />
            </label>
            <label class="field">
              Badge EN
              <input v-model="form.badge_en" class="input" placeholder="Ex: New" maxlength="60" />
            </label>
          </div>

          <div class="row2">
            <label class="field">
              Texte FR
              <textarea v-model="form.contenu_fr" class="input" rows="4" maxlength="1000"></textarea>
            </label>
            <label class="field">
              Texte EN
              <textarea v-model="form.contenu_en" class="input" rows="4" maxlength="1000"></textarea>
            </label>
          </div>

          <label class="field">
            Lien optionnel
            <input v-model="form.lien" class="input" placeholder="/boutique ou https://..." />
          </label>

          <div class="row2">
            <label class="field">
              Date début
              <input v-model="form.date_debut" type="datetime-local" class="input" />
            </label>
            <label class="field">
              Date fin
              <input v-model="form.date_fin" type="datetime-local" class="input" />
            </label>
          </div>

          <label class="toggle">
            <input v-model="form.actif" type="checkbox" />
            <span>{{ form.actif ? 'Actif' : 'Inactif' }}</span>
          </label>
        </div>

        <div class="modal__foot">
          <button class="btn-cancel" @click="modal = false">Annuler</button>
          <button class="btn-primary" :disabled="saving || !form.titre_fr" @click="save">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'

const items = ref([])
const loading = ref(true)
const saving = ref(false)
const modal = ref(false)
const filtreType = ref('')
const form = ref({})

const itemsFiltres = computed(() =>
  filtreType.value ? items.value.filter(item => item.type === filtreType.value) : items.value
)

const formatDate = (value) => new Date(value).toLocaleString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/marketing')
    items.value = data
  } finally {
    loading.value = false
  }
}

const openModal = (item = null) => {
  form.value = item
    ? {
        ...item,
        date_debut: toDateTimeLocal(item.date_debut),
        date_fin: toDateTimeLocal(item.date_fin)
      }
    : {
        type: 'annonce',
        titre_fr: '',
        titre_en: '',
        contenu_fr: '',
        contenu_en: '',
        badge_fr: '',
        badge_en: '',
        lien: '',
        date_debut: '',
        date_fin: '',
        ordre: 0,
        actif: true
      }
  modal.value = true
}

const payload = () => ({
  ...form.value,
  date_debut: form.value.date_debut || null,
  date_fin: form.value.date_fin || null
})

const save = async () => {
  saving.value = true
  try {
    form.value.id
      ? await api.put(`/marketing/${form.value.id}`, payload())
      : await api.post('/marketing', payload())
    modal.value = false
    await load()
  } finally {
    saving.value = false
  }
}

const remove = async (id) => {
  const item = items.value.find(content => content.id === id)
  const label = item?.titre_fr ? `"${item.titre_fr}"` : 'ce contenu marketing'
  if (!confirm(`Supprimer ${label} ?`)) return
  if (!confirm('Cette action est définitive. Confirmer la suppression ?')) return
  await api.delete(`/marketing/${id}`)
  await load()
}

onMounted(load)
</script>

<style scoped>
.page { padding: 8px 0; }
.header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
.title { margin: 0 0 4px; font-size: 26px; font-weight: 800; color: #0f172a; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }
.btn-primary { border: 0; border-radius: 11px; padding: 10px 16px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; font-weight: 800; cursor: pointer; }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.filters { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.filter-btn { border: 1px solid #dbe4ef; background: #fff; color: #334155; border-radius: 999px; padding: 8px 14px; font-weight: 700; cursor: pointer; }
.filter-btn.active { background: #eff6ff; color: #1d4ed8; border-color: #93c5fd; }
.state { padding: 36px; text-align: center; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06); }
.card--off { opacity: 0.62; }
.card__top, .actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.type, .status { border-radius: 999px; padding: 3px 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.type--annonce { background: #dbeafe; color: #1d4ed8; }
.type--evenement { background: #ffedd5; color: #c2410c; }
.status { background: #f1f5f9; color: #475569; }
.card h3 { margin: 14px 0 8px; font-size: 18px; color: #0f172a; }
.card p { margin: 0 0 12px; color: #475569; line-height: 1.5; }
.meta { display: flex; flex-direction: column; gap: 4px; color: #64748b; font-size: 12px; margin-bottom: 14px; }
.btn-edit, .btn-del, .btn-cancel { border: 0; border-radius: 9px; padding: 8px 12px; font-weight: 800; cursor: pointer; }
.btn-edit { background: #eff6ff; color: #1d4ed8; }
.btn-del { background: #fee2e2; color: #b91c1c; }
.btn-cancel { background: #f1f5f9; color: #334155; }
.overlay { position: fixed; inset: 0; z-index: 200; background: rgba(15, 23, 42, 0.5); display: flex; align-items: center; justify-content: center; padding: 18px; }
.modal { width: min(840px, 100%); max-height: 92vh; overflow: auto; background: #fff; border-radius: 18px; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28); }
.modal__head, .modal__foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #e2e8f0; }
.modal__foot { border-top: 1px solid #e2e8f0; border-bottom: 0; justify-content: flex-end; }
.modal__head h2 { margin: 0; font-size: 20px; }
.modal__head button { border: 0; background: #f1f5f9; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; }
.modal__body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
.input { border: 2px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font: inherit; color: #0f172a; background: #f8fafc; text-transform: none; letter-spacing: 0; font-weight: 500; }
.input:focus { outline: none; border-color: #3b82f6; background: #fff; }
.toggle { display: flex; align-items: center; gap: 8px; font-weight: 800; color: #334155; }
@media (max-width: 720px) { .row2 { grid-template-columns: 1fr; } }
</style>
