<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h1 class="title">Zones de livraison</h1>
        <p class="subtitle">{{ zones.length }} zone{{ zones.length !== 1 ? 's' : '' }} configurée{{ zones.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-ajouter" @click="openModal()">
        + Ajouter une zone
      </button>
    </div>

    <!-- GRID -->
    <div class="grid" v-if="zones.length > 0">
      <div
        v-for="(z, i) in zones"
        :key="z.id"
        class="carte"
        :class="{ 'carte--inactive': !z.actif }"
        :style="{ animationDelay: i * 0.07 + 's' }"
      >
        <span class="carte-statut">{{ z.actif ? 'Actif' : 'Inactif' }}</span>
        <div class="carte-emoji">{{ String(z.nom || 'Z').charAt(0).toUpperCase() }}</div>

        <!-- nom -->
        <div class="carte-nom">{{ z.nom }}</div>

        <!-- frais -->
        <div class="carte-frais">
          <span class="frais-label">Livraison</span>
          <span class="frais-val">{{ formatPrice(z.frais) }}</span>
        </div>

        <!-- actions -->
        <div class="carte-actions">
          <button class="btn-edit" @click="openModal(z)" title="Modifier">✏️</button>
          <button class="btn-del"  @click="remove(z.id)"  title="Supprimer">🗑️</button>
        </div>
      </div>
    </div>

    <!-- VIDE -->
    <div class="vide" v-if="zones.length === 0">
      <div class="vide-emoji">🗺️</div>
      <p class="vide-titre">Aucune zone de livraison</p>
      <p class="vide-sub">Ajoutez votre première zone pour commencer les livraisons !</p>
      <button class="btn-ajouter btn-ajouter--sm" @click="openModal()">+ Ajouter une zone</button>
    </div>

    <!-- MODAL -->
    <Transition name="pop">
      <div v-if="modal" class="overlay" @click.self="modal = false">
        <div class="modal">

          <div class="modal-titre">
            {{ form.id ? 'Modifier la zone' : 'Nouvelle zone de livraison' }}
          </div>

          <div class="champ">
            <label>Nom de la zone</label>
            <input v-model="form.nom" placeholder="Ex : Yaoundé Centre" />
          </div>

          <div class="champ">
            <label>Frais de livraison (FCFA)</label>
            <input v-model="form.frais" type="number" placeholder="Ex : 1000" />
            <span class="champ-hint">Montant payé par le client à la livraison</span>
          </div>

          <div class="champ">
            <label>Statut</label>
            <label class="toggle">
              <input type="checkbox" v-model="form.actif" />
              <span class="toggle-piste">
                <span class="toggle-rond"></span>
              </span>
              <span class="toggle-texte">{{ form.actif ? 'Zone active' : 'Zone inactive' }}</span>
            </label>
          </div>

          <div class="modal-actions">
            <button class="btn-annuler" @click="modal = false">Annuler</button>
            <button class="btn-sauver" @click="save">{{ form.id ? 'Enregistrer' : 'Créer la zone' }}</button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const zones  = ref([])
const modal  = ref(false)
const form   = ref({})

const load = async () => {
  const { data } = await api.get('/zones')
  zones.value = data
}

const openModal = (z = null) => {
  form.value = z ? { ...z } : { nom: '', frais: '', actif: true }
  modal.value = true
}

const save = async () => {
  form.value.id
    ? await api.put(`/zones/${form.value.id}`, form.value)
    : await api.post('/zones', form.value)
  modal.value = false
  load()
}

const remove = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer cette zone ?')) {
    await api.delete(`/zones/${id}`)
    load()
  }
}

const formatPrice = (v) => `${Number(v).toLocaleString('fr-FR')} FCFA`

onMounted(load)
</script>

<style scoped>
.page {
  padding: 8px 0;
}

.orb { display: none; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.btn-ajouter {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28);
}
.btn-ajouter:hover { filter: brightness(1.05); }
.btn-ajouter--sm { margin-top: 18px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.carte {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.carte:hover {
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.12);
}

.carte--inactive { opacity: 0.7; }

.carte-statut {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #334155;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 2px 6px;
}

.carte-emoji {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}

.carte-nom {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

.carte-frais {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
  width: 100%;
}

.frais-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.frais-val {
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
  white-space: nowrap;
}

.carte-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.btn-edit,
.btn-del {
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-edit { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.btn-edit:hover { background: #dbeafe; }
.btn-del  { background: #fff1f2; color: #be123c; border-color: #fecdd3; }
.btn-del:hover  { background: #ffe4e6; }

.vide {
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 56px 20px;
}
.vide-emoji  { font-size: 46px; margin-bottom: 12px; }
.vide-titre  { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
.vide-sub    { font-size: 14px; color: #64748b; margin: 0; }

.overlay {
  position: fixed; inset: 0;
  background: rgba(2, 6, 23, 0.52);
  display: flex;
  align-items: center; justify-content: center;
  z-index: 200;
  padding: 14px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #dbe1ea;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  padding: 22px 20px;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-titre {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.champ {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.champ label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.champ input {
  padding: 10px 12px;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.champ input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.16);
  outline: none;
}
.champ input::placeholder { color: #94a3b8; }

.champ-hint {
  font-size: 11px;
  color: #94a3b8;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  margin-top: 2px;
}
.toggle input { display: none; }

.toggle-piste {
  width: 46px;
  height: 26px;
  background: #dbe3ee;
  border-radius: 999px;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.toggle input:checked ~ .toggle-piste { background: #22c55e; }

.toggle-rond {
  position: absolute;
  top: 3px; left: 3px;
  width: 20px; height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.22);
  transition: transform 0.2s;
}
.toggle input:checked ~ .toggle-piste .toggle-rond { transform: translateX(20px); }

.toggle-texte {
  font-size: 13px;
  color: #334155;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 6px;
}

.btn-annuler {
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid #dbe3ee;
  background: white;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-annuler:hover { background: #f8fafc; border-color: #cbd5e1; }

.btn-sauver {
  padding: 9px 14px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
  transition: filter 0.15s;
}
.btn-sauver:hover { filter: brightness(1.04); }

.pop-enter-active { transition: all 0.2s ease; }
.pop-leave-active { transition: all 0.15s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
}

@media (max-width: 760px) {
  .title { font-size: 22px; }
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .modal { padding: 18px 16px; }
}

@media (max-width: 500px) {
  .header { align-items: flex-start; }
  .btn-ajouter { width: 100%; }
}
</style>