<template>
  <div class="page">
    <div class="header">
      <div>
        <h2>Utilisateurs admin</h2>
        <p>Gestion des comptes et des rôles</p>
      </div>
      <button class="btn-primary" @click="openCreate">+ Nouvel admin</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in admins" :key="u.id">
            <td><strong>{{ u.nom }}</strong></td>
            <td>{{ u.email }}</td>
            <td><span class="badge">{{ roleLabel(u.role) }}</span></td>
            <td>
              <span :class="['status', u.actif ? 'status--on' : 'status--off']">
                {{ u.actif ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td>{{ formatDate(u.createdAt) }}</td>
            <td class="actions">
              <button class="btn-edit" @click="openEdit(u)">Modifier</button>
              <button class="btn-del" @click="removeUser(u)" :disabled="u.id === auth.admin?.id">Supprimer</button>
            </td>
          </tr>
          <tr v-if="!admins.length">
            <td colspan="6" class="empty">Aucun utilisateur admin.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modal" class="overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal__head">
          <h3>{{ form.id ? 'Modifier admin' : 'Créer admin' }}</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <div class="field">
          <label>Nom</label>
          <input v-model.trim="form.nom" type="text" />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model.trim="form.email" type="email" />
        </div>
        <div class="field">
          <label>Rôle</label>
          <select v-model="form.role">
            <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
        <div class="field">
          <label>{{ form.id ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe' }}</label>
          <input v-model="form.password" type="password" minlength="8" />
        </div>
        <div class="field field--row">
          <label>Compte actif</label>
          <input v-model="form.actif" type="checkbox" />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="modal__actions">
          <button class="btn-secondary" @click="closeModal">Annuler</button>
          <button class="btn-primary" @click="save" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const admins = ref([])
const modal = ref(false)
const saving = ref(false)
const error = ref('')
const form = ref({
  id: null,
  nom: '',
  email: '',
  role: 'catalogue',
  actif: true,
  password: ''
})

const roles = [
  { value: 'superadmin', label: 'Super admin' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'commandes', label: 'Commandes' }
]

const roleLabel = (role) => roles.find(r => r.value === role)?.label || role
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

const load = async () => {
  const { data } = await api.get('/admins')
  admins.value = data
}

const resetForm = () => {
  error.value = ''
  form.value = {
    id: null,
    nom: '',
    email: '',
    role: 'catalogue',
    actif: true,
    password: ''
  }
}

const openCreate = () => {
  resetForm()
  modal.value = true
}

const openEdit = (admin) => {
  error.value = ''
  form.value = {
    id: admin.id,
    nom: admin.nom,
    email: admin.email,
    role: admin.role,
    actif: admin.actif,
    password: ''
  }
  modal.value = true
}

const closeModal = () => {
  modal.value = false
  resetForm()
}

const save = async () => {
  error.value = ''
  if (!form.value.nom) return (error.value = 'Le nom est requis')
  if (!form.value.email) return (error.value = "L'email est requis")
  if (!form.value.id && !form.value.password) return (error.value = 'Le mot de passe est requis')
  if (form.value.password && form.value.password.length < 8) {
    return (error.value = 'Le mot de passe doit faire au moins 8 caractères')
  }

  saving.value = true
  try {
    const payload = {
      nom: form.value.nom,
      email: form.value.email,
      role: form.value.role,
      actif: form.value.actif
    }
    if (form.value.password) payload.password = form.value.password

    if (form.value.id) await api.put(`/admins/${form.value.id}`, payload)
    else await api.post('/admins', payload)

    closeModal()
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de sauvegarde'
  } finally {
    saving.value = false
  }
}

const removeUser = async (admin) => {
  if (admin.id === auth.admin?.id) return
  if (!confirm(`Supprimer ${admin.nom} ?`)) return
  try {
    await api.delete(`/admins/${admin.id}`)
    await load()
  } catch (err) {
    alert(err.response?.data?.message || 'Impossible de supprimer')
  }
}

onMounted(load)
</script>

<style scoped>
.page { padding: 8px 0; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header h2 { margin: 0; }
.header p { margin: 4px 0 0; color: #64748b; }

.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: auto; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08); }
table { width: 100%; border-collapse: collapse; min-width: 760px; }
th, td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: left; }
th { font-size: 12px; color: #64748b; text-transform: uppercase; }
.empty { text-align: center; color: #94a3b8; }

.badge { padding: 4px 8px; border-radius: 7px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; }
.status { padding: 4px 8px; border-radius: 7px; font-size: 12px; font-weight: 700; }
.status--on { background: #f0fdf4; color: #15803d; }
.status--off { background: #fef2f2; color: #dc2626; }
.actions { display: flex; gap: 8px; }

.btn-primary,
.btn-secondary,
.btn-edit,
.btn-del {
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  font-family: inherit;
}
.btn-primary { background: #3b82f6; color: #fff; padding: 9px 14px; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #475569; border-color: #e2e8f0; padding: 9px 14px; }
.btn-edit { background: #eff6ff; color: #1d4ed8; padding: 6px 10px; }
.btn-del { background: #fef2f2; color: #dc2626; padding: 6px 10px; }
.btn-del:disabled { opacity: .5; cursor: not-allowed; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { width: min(520px, 95vw); background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #dbe3ee; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22); }
.modal__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.btn-close { border: 2px solid #e2e8f0; background: #fff; border-radius: 8px; width: 32px; height: 32px; cursor: pointer; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
.field input, .field select { border: 2px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
.field--row { flex-direction: row; align-items: center; justify-content: space-between; }
.error { color: #dc2626; background: #fef2f2; padding: 8px 10px; border-radius: 8px; }
.modal__actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }

@media (max-width: 700px) {
  .header { flex-direction: column; align-items: flex-start; }
  .btn-primary { width: 100%; }
}
</style>
