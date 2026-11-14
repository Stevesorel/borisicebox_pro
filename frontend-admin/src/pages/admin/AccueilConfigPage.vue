<template>
  <div class="page">

    <!-- EN-TÊTE -->
    <div class="header">
      <h2 class="header__title">Page d'accueil</h2>
      <button class="btn-save" @click="sauvegarder" :disabled="saving">
        {{ saving ? 'Enregistrement...' : 'Sauvegarder' }}
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else class="sections">

      <!-- ============================== -->
      <!-- HERO                           -->
      <!-- ============================== -->
      <div class="card">
        <h3 class="card__title">🦸 Section Hero</h3>
        <div class="localized-grid">
          <div v-for="field in heroFields" :key="field.key" class="localized-field">
            <span class="localized-field__label">{{ field.label }}</span>
            <div class="localized-field__inputs">
              <div class="field">
                <label>FR</label>
                <input v-model="config[field.key]" class="input" />
              </div>
              <div class="field">
                <label>EN</label>
                <input v-model="config[`${field.key}_en`]" class="input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================== -->
      <!-- CARROUSEL                      -->
      <!-- ============================== -->
      <div class="card">
        <h3 class="card__title">🎠 Carrousel</h3>

        <!-- Upload -->
        <div class="upload" @click="$refs.carouselInput.click()" @dragover.prevent @drop.prevent="onDrop">
          <input ref="carouselInput" type="file" multiple accept="image/*" @change="uploadImages" hidden />
          <span>📤 Clique ou glisse des images ici</span>
        </div>

        <!-- Grille images -->
        <div v-if="carousel.length" class="carousel-grid">
          <div v-for="(img, index) in carousel" :key="img.id" class="carousel-item">
            <img :src="imgUrl(img.url)" :alt="'Image ' + img.id" />
            <button class="carousel-item__del" @click="supprimerCarousel(img.id)">✕</button>
            <span class="carousel-item__order">{{ index + 1 }}</span>
            <div class="carousel-item__actions">
              <button :disabled="index === 0 || savingOrder" @click="moveCarousel(index, index - 1)">↑</button>
              <button :disabled="index === carousel.length - 1 || savingOrder" @click="moveCarousel(index, index + 1)">↓</button>
            </div>
          </div>
        </div>
        <p v-else class="empty-msg">Aucune image dans le carrousel.</p>
      </div>

      <!-- ============================== -->
      <!-- NOUVEAUTÉS                     -->
      <!-- ============================== -->
      <div class="card">
        <h3 class="card__title">✨ Section Nouveautés</h3>
        <div class="localized-grid">
          <div v-for="field in nouveautesFields" :key="field.key" class="localized-field">
            <span class="localized-field__label">{{ field.label }}</span>
            <div class="localized-field__inputs">
              <div class="field">
                <label>FR</label>
                <input v-model="config[field.key]" class="input" />
              </div>
              <div class="field">
                <label>EN</label>
                <input v-model="config[`${field.key}_en`]" class="input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================== -->
      <!-- AVANTAGES                      -->
      <!-- ============================== -->
      <div class="card">
        <h3 class="card__title">💎 Section Avantages</h3>
        <div v-for="i in 4" :key="i" class="avantage">
          <div class="avantage__num">{{ i }}</div>
          <div class="grid3">
            <div class="field">
              <label>Icône FR</label>
              <input v-model="config[`avantage_${i}_icon`]" class="input input--emoji" />
            </div>
            <div class="field">
              <label>Icône EN</label>
              <input v-model="config[`avantage_${i}_icon_en`]" class="input input--emoji" />
            </div>
            <div class="field">
              <label>Titre FR</label>
              <input v-model="config[`avantage_${i}_titre`]" class="input" />
            </div>
            <div class="field">
              <label>Titre EN</label>
              <input v-model="config[`avantage_${i}_titre_en`]" class="input" />
            </div>
            <div class="field">
              <label>Description FR</label>
              <input v-model="config[`avantage_${i}_desc`]" class="input" />
            </div>
            <div class="field">
              <label>Description EN</label>
              <input v-model="config[`avantage_${i}_desc_en`]" class="input" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="'toast--' + toast.type">
        {{ toast.msg }}
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const loading = ref(true)
const saving  = ref(false)
const savingOrder = ref(false)
const config  = ref({})
const carousel = ref([])
const toast   = ref(null)
const carouselInput = ref(null)

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const imgUrl = (url) => url?.startsWith('http') ? url : `${BASE_URL}${url}`

const heroFields = [
  { key: 'hero_badge', label: 'Badge' },
  { key: 'hero_promo', label: 'Texte promo' },
  { key: 'hero_titre_1', label: 'Titre ligne 1' },
  { key: 'hero_titre_2', label: 'Titre ligne 2' },
  { key: 'hero_titre_em', label: 'Titre mis en évidence' },
  { key: 'hero_desc', label: 'Description' }
]

const nouveautesFields = [
  { key: 'nouveautes_titre', label: 'Titre' },
  { key: 'nouveautes_em', label: 'Titre mis en évidence' },
  { key: 'nouveautes_desc', label: 'Description' }
]

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/page-accueil')
    config.value  = { ...data.config }
    carousel.value = normalizeCarousel(data.carousel)
  } catch {
    showToast('Erreur de chargement', 'error')
  } finally {
    loading.value = false
  }
}

const sauvegarder = async () => {
  saving.value = true
  try {
    await api.put('/page-accueil', { config: config.value })
    showToast('Configuration sauvegardée ✅')
  } catch {
    showToast('Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const uploadImages = async (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return
  const fd = new FormData()
  files.forEach(f => fd.append('images', f))
  try {
    const { data } = await api.post('/page-accueil/carousel', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    carousel.value = normalizeCarousel([...carousel.value, ...data])
    showToast(`${data.length} image(s) ajoutée(s) ✅`)
  } catch {
    showToast('Erreur upload', 'error')
  }
  e.target.value = ''
}

const onDrop = async (e) => {
  const files = Array.from(e.dataTransfer.files)
  if (!files.length) return
  const fd = new FormData()
  files.forEach(f => fd.append('images', f))
  try {
    const { data } = await api.post('/page-accueil/carousel', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    carousel.value = normalizeCarousel([...carousel.value, ...data])
    showToast(`${data.length} image(s) ajoutée(s) ✅`)
  } catch {
    showToast('Erreur upload', 'error')
  }
}

const supprimerCarousel = async (id) => {
  if (!confirm('Supprimer cette image ?')) return
  try {
    await api.delete(`/page-accueil/carousel/${id}`)
    carousel.value = normalizeCarousel(carousel.value.filter(i => i.id !== id))
    showToast('Image supprimée')
  } catch {
    showToast('Erreur suppression', 'error')
  }
}

const normalizeCarousel = (items = []) =>
  [...items]
    .sort((a, b) => Number(a.ordre ?? 0) - Number(b.ordre ?? 0) || Number(a.id) - Number(b.id))
    .map((item, index) => ({ ...item, ordre: index }))

const persistCarouselOrder = async () => {
  savingOrder.value = true
  try {
    await api.put('/page-accueil/carousel/ordre', {
      ordre: carousel.value.map((item, index) => ({ id: item.id, ordre: index }))
    })
    showToast('Ordre du carrousel mis à jour')
  } catch {
    showToast('Erreur lors du réordonnancement', 'error')
    await load()
  } finally {
    savingOrder.value = false
  }
}

const moveCarousel = async (from, to) => {
  if (to < 0 || to >= carousel.value.length || savingOrder.value) return
  const next = [...carousel.value]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  carousel.value = next.map((img, index) => ({ ...img, ordre: index }))
  await persistCarouselOrder()
}

onMounted(load)
</script>

<style scoped>
* { box-sizing: border-box; }

.page {
  background: #F7F9FC;
  min-height: 100vh;
  padding: 28px 24px;
  color: #1E293B;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.header__title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}

.btn-save {
  padding: 10px 24px;
  background: #22C55E;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) { background: #16A34A; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.loading {
  text-align: center;
  padding: 60px;
  color: #64748B;
  font-size: 16px;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #E2E8F0;
}

.card__title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #F1F5F9;
  color: #0F172A;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.grid3 {
  display: grid;
  grid-template-columns: 90px 90px 1fr 1fr 1fr 1fr;
  gap: 14px;
  flex: 1;
}

@media (max-width: 600px) {
  .grid2 { grid-template-columns: 1fr; }
  .grid3 { grid-template-columns: 1fr; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field--full {
  grid-column: 1 / -1;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.input {
  padding: 10px 14px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #F8FAFC;
  color: #1E293B;
  transition: border-color 0.2s;
  width: 100%;
}

.input:focus { border-color: #3B82F6; outline: none; background: #fff; }
.input--emoji { font-size: 20px; text-align: center; }

.localized-grid {
  display: grid;
  gap: 16px;
}

.localized-field {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 14px;
  align-items: start;
  padding: 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.localized-field__label {
  font-size: 13px;
  font-weight: 800;
  color: #0F172A;
  padding-top: 28px;
}

.localized-field__inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 760px) {
  .localized-field,
  .localized-field__inputs {
    grid-template-columns: 1fr;
  }

  .localized-field__label {
    padding-top: 0;
  }
}

/* Upload */
.upload {
  border: 2px dashed #CBD5E1;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
  background: #F8FAFC;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.upload:hover { border-color: #3B82F6; background: #EFF6FF; color: #3B82F6; }

/* Carrousel grid */
.carousel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.carousel-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #E2E8F0;
  aspect-ratio: 1/1;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-item__del {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #EF4444;
  color: #fff;
  border: none;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.carousel-item__del:hover { background: #DC2626; transform: scale(1.1); }

.carousel-item__order {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.carousel-item__actions {
  position: absolute;
  right: 6px;
  bottom: 6px;
  display: flex;
  gap: 4px;
}

.carousel-item__actions button {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.carousel-item__actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.empty-msg {
  text-align: center;
  color: #94A3B8;
  font-size: 14px;
  padding: 20px;
}

/* Avantages */
.avantage {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #F1F5F9;
}

.avantage:last-child { border-bottom: none; }

.avantage__num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #EFF6FF;
  color: #3B82F6;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 22px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 14px 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  z-index: 999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.toast--success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
.toast--error   { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(20px); }
.toast-leave-to     { opacity: 0; }

@media (max-width: 600px) {
  .page { padding: 16px 12px; }
  .carousel-grid { grid-template-columns: repeat(3, 1fr); }
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

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.btn-save {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
}

.btn-save:hover:not(:disabled) { filter: brightness(1.04); }
</style>
