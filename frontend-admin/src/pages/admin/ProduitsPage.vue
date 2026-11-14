<template>
  <div class="page">

    <!-- EN-TÊTE -->
    <div class="header">
      <h2 class="header__title">Produits <span class="header__count">{{ produitsFiltres.length }}</span></h2>
      <div class="header__actions">
        <button class="btn-export" @click="exportSelectedExcel" :disabled="!selectedCount">📥 Excel sélection</button>
        <button class="btn-export" @click="exportSelectedPdf" :disabled="!selectedCount">📄 PDF sélection</button>
        <button class="btn-add" @click="openModal()">+ Ajouter</button>
      </div>
    </div>

    <!-- FILTRES -->
    <div class="filters">
      <input v-model="searchQuery" type="text" placeholder="🔍 Rechercher..." class="input" />
      <select v-model="filtreCat" class="input">
        <option value="">📂 Toutes catégories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nom }}</option>
      </select>
      <select v-model="filtreStatut" class="input">
        <option value="">Tous statuts</option>
        <option value="actif">✅ Actif</option>
        <option value="inactif">❌ Inactif</option>
      </select>
      <label class="select-all">
        <input type="checkbox" :checked="allFilteredSelected" @change="toggleAllFiltered($event.target.checked)" />
        Tout sélectionner (filtre)
      </label>
    </div>

    <!-- LISTE PRODUITS -->
    <div class="grid">
      <div v-for="p in produitsFiltres" :key="p.id" class="card">
        <div class="card__img" @click="openModal(p)">
          <label class="card__check" @click.stop>
            <input type="checkbox" :checked="isSelected(p.id)" @change="toggleSelected(p.id, $event.target.checked)" />
          </label>
          <img v-if="p.image_principale" :src="imgUrl(p.image_principale)" :alt="p.nom" />
          <div v-else class="card__img-empty">📷</div>
          <span :class="['card__badge', p.actif ? 'card__badge--on' : 'card__badge--off']">
            {{ p.actif ? 'Actif' : 'Inactif' }}
          </span>
        </div>
        <div class="card__body">
          <p v-if="p.Categorie" class="card__cat">{{ p.Categorie.nom }}</p>
          <h3 class="card__name">{{ p.nom }}</h3>
          <p v-if="p.marque" class="card__brand">{{ p.marque }}</p>
          <p class="card__price">
            <span v-if="hasPromo(p)" class="card__price-old">{{ formatPrice(p.prix_base) }}</span>
            {{ formatPrice(hasPromo(p) ? p.prix_promo : p.prix_base) }}
            <span v-if="hasPromo(p)" class="card__promo-badge">Promo</span>
          </p>
          <div class="card__actions">
            <button class="btn-edit" @click="openModal(p)">✏️ Modifier</button>
            <button class="btn-del" @click="remove(p.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- AUCUN RÉSULTAT -->
    <div v-if="produitsFiltres.length === 0 && !loading" class="empty">
      <p>📦 Aucun produit trouvé.</p>
      <button class="btn-add" @click="openModal()">+ Ajouter un produit</button>
    </div>

    <!-- MODALE -->
    <div v-if="modal" class="overlay" @click.self="modal = false">
      <div class="modal">
        <div class="modal__head">
          <h3>{{ form.id ? '✏️ Modifier' : '➕ Ajouter' }} un produit</h3>
          <button class="modal__close" @click="modal = false">✕</button>
        </div>

        <div class="modal__body">
          <div class="row2">
            <div class="field">
              <label>Nom <span class="req">*</span></label>
              <input v-model="form.nom" @input="autoSlug" placeholder="Ex : Jus de mangue" class="input" />
            </div>
            <div class="field">
              <label>Slug</label>
              <input v-model="form.slug" placeholder="auto-généré" class="input" />
            </div>
            <div class="field">
              <label>Catégorie <span class="req">*</span></label>
              <select v-model="form.categorie_id" class="input">
                <option value="">— Choisir —</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="field">
              <label>Marque</label>
              <input v-model="form.marque" placeholder="Optionnel" class="input" />
            </div>
            <div class="field">
              <label>Prix (FCFA) <span class="req">*</span></label>
              <input v-model="form.prix_base" type="number" placeholder="15000" class="input" />
            </div>
            <div class="field">
              <label>Prix promo (FCFA)</label>
              <input v-model="form.prix_promo" type="number" placeholder="Ex: 12000" class="input" min="0" />
            </div>
            <div class="field">
              <label>Label promo</label>
              <input v-model="form.promo_label" placeholder="Ex: Offre spéciale" class="input" />
            </div>
            <div class="field">
              <label>Début promo</label>
              <input v-model="form.promo_debut" type="datetime-local" class="input" />
            </div>
            <div class="field">
              <label>Fin promo</label>
              <input v-model="form.promo_fin" type="datetime-local" class="input" />
            </div>
            <div class="field field--center">
              <label>Statut</label>
              <label class="toggle">
                <input type="checkbox" v-model="form.actif" />
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
                <span>{{ form.actif ? '✅ Actif' : '❌ Inactif' }}</span>
              </label>
            </div>
          </div>

          <div class="promo-box">
            <div class="promo-box__head">
              <strong>Prix de gros</strong>
              <label class="toggle">
                <input type="checkbox" v-model="form.prix_gros_actif" />
                <span class="toggle__track"><span class="toggle__thumb"></span></span>
                <span>{{ form.prix_gros_actif ? '✅ Activé' : '❌ Désactivé' }}</span>
              </label>
            </div>
            <div class="row2">
              <div class="field">
                <label>Quantité minimum</label>
                <input v-model="form.prix_gros_min_quantite" type="number" min="2" placeholder="Ex: 5" class="input" :disabled="!form.prix_gros_actif" />
              </div>
              <div class="field">
                <label>Prix unitaire de gros (FCFA)</label>
                <input v-model="form.prix_gros" type="number" min="0" placeholder="Ex: 10000" class="input" :disabled="!form.prix_gros_actif" />
              </div>
            </div>
            <p class="field__hint">
              Ce prix s'applique automatiquement dans le panier dès que le client atteint la quantité minimum.
            </p>
          </div>

          <div class="field">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Décris le produit..." class="input"></textarea>
          </div>

                        <!-- Personnalisation -->
            <div class="row2">
              <div class="field field--center">
                <label>Personnalisable</label>
                <label class="toggle">
                  <input type="checkbox" v-model="form.personnalisable" />
                  <span class="toggle__track"><span class="toggle__thumb"></span></span>
                  <span>{{ form.personnalisable ? '✅ Oui' : '❌ Non' }}</span>
                </label>
              </div>
              <div class="field" v-if="form.personnalisable">
                <label>Frais de personnalisation (FCFA)</label>
                <input
                  v-model="form.frais_personnalisation"
                  type="number"
                  placeholder="Ex: 1500"
                  class="input"
                  min="0"
                />
              </div>
            </div>




          <div class="field">
            <label v-if="form.id && existingImages.length">🖼️ Images existantes</label>
            <div v-if="form.id && existingImages.length" class="previews">
              <div
                v-for="img in existingImages"
                :key="img.id"
                class="preview"
                :class="{ 'preview--main': form.image_principale === img.url }"
              >
                <img :src="imgUrl(img.url)" />
                <button type="button" class="preview__main" @click="setExistingMainImage(img.url)">
                  {{ form.image_principale === img.url ? 'Image principale' : 'Définir principale' }}
                </button>
                <button type="button" class="preview__remove" @click="removeExistingImage(img.id)" title="Supprimer">✕</button>

                <div class="preview__couleur">
                  <input
                    v-model="img.couleur"
                    type="text"
                    placeholder="Couleur (ex: Rouge)"
                    class="preview__couleur-input"
                  />
                  <input
                    v-model="img.couleur_hex"
                    type="color"
                    class="preview__couleur-picker"
                    title="Choisir la couleur"
                  />
                </div>
              </div>
            </div>
            <p v-if="form.id && existingImages.length" class="field__hint">
              💡 Les couleurs des images existantes seront enregistrées quand tu cliques sur "Modifier".
            </p>
          </div>

          <div class="field">
            <label>📸 Images &amp; Couleurs</label>
            <div class="upload" @click="$refs.fi.click()" @dragover.prevent @drop.prevent="onDrop">
              <input ref="fi" type="file" multiple accept="image/*" @change="onFiles" hidden />
              <span>📤 Clique ou glisse des images ici</span>
            </div>

            <!-- Prévisualisation avec tagger couleur par image -->
            <div v-if="previews.length" class="previews">
              <div
                v-for="(u, i) in previews"
                :key="i"
                class="preview"
                :class="{ 'preview--main': form.image_principale === newImageMainValue(i) }"
              >
                <img :src="u" />
                <button type="button" class="preview__main" @click="setNewMainImage(i)">
                  {{ form.image_principale === newImageMainValue(i) ? 'Image principale' : 'Définir principale' }}
                </button>
                <button type="button" class="preview__remove" @click="removePreview(i)" title="Supprimer">✕</button>

                <!-- Couleur optionnelle -->
                <div class="preview__couleur">
                  <input
                    v-model="fileCouleurs[i]"
                    type="text"
                    placeholder="Couleur (ex: Rouge)"
                    class="preview__couleur-input"
                  />
                  <input
                    v-model="fileCouleurHexs[i]"
                    type="color"
                    class="preview__couleur-picker"
                    title="Choisir la couleur"
                  />
                </div>
              </div>
            </div>
            <p v-if="previews.length" class="field__hint">
              💡 Remplis le champ couleur seulement si le produit existe en plusieurs coloris.
            </p>
          </div>
        </div>

        <div class="modal__foot">
          <button class="btn-cancel" @click="modal = false">Annuler</button>
          <button class="btn-save" @click="save" :disabled="saving">
            {{ saving ? 'Enregistrement...' : (form.id ? '✅ Modifier' : '✅ Ajouter') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import api, { imgUrl, formatPrice } from '../../services/api'

const produits        = ref([])
const categories      = ref([])
const modal           = ref(false)
const form            = ref({})
const files           = ref([])
const previews        = ref([])
const existingImages  = ref([])
const existingImagesSnapshot = ref(new Map())
const fileCouleurs    = ref([])   // labels couleur par image
const fileCouleurHexs = ref([])   // hex couleur par image
const saving          = ref(false)
const loading         = ref(true)
const filtreCat       = ref('')
const filtreStatut    = ref('')
const searchQuery     = ref('')
const selectedProduitIds = ref([])
//const BASE_URL     = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const produitsFiltres = computed(() => {
  let r = produits.value
  if (filtreCat.value)                  r = r.filter(p => p.categorie_id === Number(filtreCat.value))
  if (filtreStatut.value === 'actif')   r = r.filter(p => p.actif)
  if (filtreStatut.value === 'inactif') r = r.filter(p => !p.actif)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(p => p.nom.toLowerCase().includes(q) || p.marque?.toLowerCase().includes(q))
  }
  return r
})
const selectedCount = computed(() => selectedProduitIds.value.length)
const filteredIds = computed(() => produitsFiltres.value.map(p => p.id))
const allFilteredSelected = computed(() =>
  filteredIds.value.length > 0 && filteredIds.value.every(id => selectedProduitIds.value.includes(id))
)

const PRODUCT_FIELDS = [
  'categorie_id', 'nom', 'slug', 'marque', 'description',
  'prix_base', 'prix_promo', 'promo_label', 'promo_debut', 'promo_fin',
  'prix_gros_actif', 'prix_gros_min_quantite', 'prix_gros',
  'actif', 'personnalisable', 'frais_personnalisation', 'image_principale'
]

const NEW_MAIN_PREFIX = '__new_image__'
const newImageMainValue = (index) => `${NEW_MAIN_PREFIX}${index}`
const isNewMainImage = (value) => typeof value === 'string' && value.startsWith(NEW_MAIN_PREFIX)
const selectedNewMainIndex = () => {
  if (!isNewMainImage(form.value.image_principale)) return null
  const index = Number(form.value.image_principale.replace(NEW_MAIN_PREFIX, ''))
  return Number.isInteger(index) && index >= 0 ? index : null
}

const productPayload = (source) => {
  const out = {}
  PRODUCT_FIELDS.forEach((f) => {
    if (source[f] !== undefined) out[f] = source[f]
  })
  if (isNewMainImage(out.image_principale)) delete out.image_principale
  if (out.image_principale === '') delete out.image_principale
  ;['prix_promo', 'promo_label', 'promo_debut', 'promo_fin', 'prix_gros_min_quantite', 'prix_gros'].forEach((f) => {
    if (out[f] === '') out[f] = null
  })
  return out
}

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const hasPromo = (p) => Number(p?.prix_promo) > 0 && Number(p?.prix_promo) < Number(p?.prix_base)

const loadAllProduits = async () => {
  const all = []
  let page = 1
  let pages = 1

  do {
    const { data } = await api.get('/produits', { params: { page, limit: 100 } })
    all.push(...(data.produits || []))
    pages = Number(data.pages || 1)
    page += 1
  } while (page <= pages)

  return all
}

const load = async () => {
  loading.value = true
  try {
    const [allProduits, c] = await Promise.all([loadAllProduits(), api.get('/categories')])
    produits.value = allProduits
    categories.value = c.data
  } finally { loading.value = false }
}

const normalizeHex = (hex) => /^#([0-9a-fA-F]{6})$/.test(hex || '') ? hex : '#ffffff'

const mapExistingImages = (images = []) =>
  images
    .slice()
    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
    .map(img => ({
      ...img,
      couleur: img.couleur || '',
      couleur_hex: normalizeHex(img.couleur_hex)
    }))

const snapshotExistingImageMeta = (images = []) => {
  const map = new Map()
  images.forEach((img) => {
    const couleur = img.couleur?.trim() || null
    map.set(img.id, {
      couleur,
      couleur_hex: couleur ? normalizeHex(img.couleur_hex) : null
    })
  })
  return map
}

const openModal = async (p = null) => {
  files.value           = []
  previews.value        = []
  existingImages.value  = []
  existingImagesSnapshot.value = new Map()
  fileCouleurs.value    = []
  fileCouleurHexs.value = []

  if (!p) {
    form.value = {
      nom: '', slug: '', categorie_id: '', marque: '', description: '',
      prix_base: '',
      prix_promo: '',
      promo_label: '',
      promo_debut: '',
      promo_fin: '',
      prix_gros_actif: false,
      prix_gros_min_quantite: '',
      prix_gros: '',
      image_principale: '',
      actif: true,
      personnalisable: false,
      frais_personnalisation: 0
    }
    modal.value = true
    return
  }

  try {
    const { data } = await api.get(`/produits/${p.id}`)
    form.value = {
      ...data,
      categorie_id: data.Categorie?.id || data.categorie_id,
      promo_debut: toDateTimeLocal(data.promo_debut),
      promo_fin: toDateTimeLocal(data.promo_fin)
    }
    existingImages.value = mapExistingImages(data.images)
    existingImagesSnapshot.value = snapshotExistingImageMeta(existingImages.value)
  } catch {
    form.value = {
      ...p,
      categorie_id: p.Categorie?.id,
      promo_debut: toDateTimeLocal(p.promo_debut),
      promo_fin: toDateTimeLocal(p.promo_fin)
    }
    existingImages.value = mapExistingImages(p.images)
    existingImagesSnapshot.value = snapshotExistingImageMeta(existingImages.value)
  }

  modal.value = true
}

const autoSlug = () => {
  if (!form.value.id)
    form.value.slug = form.value.nom.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const onFiles = (e) => {
  const added = Array.from(e.target.files)
  files.value    = [...files.value, ...added]
  previews.value = files.value.map(f => URL.createObjectURL(f))
  // Étendre les tableaux de couleurs pour les nouveaux fichiers (hex par défaut = blanc neutre)
  added.forEach(() => { fileCouleurs.value.push(''); fileCouleurHexs.value.push('#ffffff') })
  if (!form.value.image_principale && previews.value.length) form.value.image_principale = newImageMainValue(0)
}

const onDrop = (e) => {
  const added = Array.from(e.dataTransfer.files)
  files.value    = [...files.value, ...added]
  previews.value = files.value.map(f => URL.createObjectURL(f))
  added.forEach(() => { fileCouleurs.value.push(''); fileCouleurHexs.value.push('#ffffff') })
  if (!form.value.image_principale && previews.value.length) form.value.image_principale = newImageMainValue(0)
}

const removePreview = (i) => {
  const selectedIndex = selectedNewMainIndex()
  files.value.splice(i, 1)
  previews.value.splice(i, 1)
  fileCouleurs.value.splice(i, 1)
  fileCouleurHexs.value.splice(i, 1)
  if (selectedIndex === i) {
    form.value.image_principale = existingImages.value[0]?.url || (previews.value.length ? newImageMainValue(0) : '')
  } else if (selectedIndex !== null && selectedIndex > i) {
    form.value.image_principale = newImageMainValue(selectedIndex - 1)
  }
}

const appendCouleurs = (fd) => {
  // N'envoyer les couleurs que si au moins une est renseignée
  const hasCouleur = fileCouleurs.value.some(c => c && c.trim())
  if (hasCouleur) {
    fd.append('couleurs',    JSON.stringify(fileCouleurs.value.map(c => c?.trim() || null)))
    fd.append('couleur_hexs', JSON.stringify(fileCouleurHexs.value.map(h => h || null)))
  }
}

const appendMainImageIndex = (fd) => {
  const index = selectedNewMainIndex()
  if (index !== null) fd.append('main_image_index', String(index))
}

const setExistingMainImage = (url) => {
  form.value.image_principale = url
}

const setNewMainImage = (index) => {
  form.value.image_principale = newImageMainValue(index)
}

const imageMetaPayload = (img) => {
  const couleur = img.couleur?.trim() || null
  return {
    couleur,
    couleur_hex: couleur ? normalizeHex(img.couleur_hex) : null
  }
}

const sameImageMeta = (a, b) =>
  (a?.couleur || null) === (b?.couleur || null) &&
  (a?.couleur_hex || null) === (b?.couleur_hex || null)

const persistExistingImageMeta = async () => {
  if (!form.value.id || !existingImages.value.length) return
  const updates = existingImages.value
    .map((img) => {
      const payload = imageMetaPayload(img)
      const previous = existingImagesSnapshot.value.get(img.id)
      return { img, payload, previous }
    })
    .filter(({ payload, previous }) => !sameImageMeta(payload, previous))
  if (!updates.length) return
  await Promise.all(
    updates.map(({ img, payload }) =>
      api.patch(`/produits/${form.value.id}/images/${img.id}`, payload)
    )
  )
  existingImagesSnapshot.value = snapshotExistingImageMeta(existingImages.value)
}

const removeExistingImage = async (imageId) => {
  if (!form.value.id) return
  if (!confirm('Supprimer cette image ?')) return

  const deletedImage = existingImages.value.find(img => img.id === imageId)
  await api.delete(`/produits/${form.value.id}/images/${imageId}`)
  existingImages.value = existingImages.value.filter(img => img.id !== imageId)
  existingImagesSnapshot.value.delete(imageId)
  if (deletedImage && form.value.image_principale === deletedImage.url) {
    form.value.image_principale = existingImages.value[0]?.url || null
  }
  await load()
}

const save = async () => {
  saving.value = true
  try {
    if (form.value.id) {
      await api.put(`/produits/${form.value.id}`, productPayload(form.value))
      await persistExistingImageMeta()
      if (files.value.length) {
        const fd = new FormData()
        files.value.forEach(f => fd.append('images', f))
        appendCouleurs(fd)
        appendMainImageIndex(fd)
        await api.post(`/produits/${form.value.id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
    } else {
      const fd = new FormData()
      Object.entries(productPayload(form.value)).forEach(([k, v]) => fd.append(k, v ?? ''))
      files.value.forEach(f => fd.append('images', f))
      appendCouleurs(fd)
      appendMainImageIndex(fd)
      await api.post('/produits', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    modal.value = false
    load()
  } finally { saving.value = false }
}

const remove = async (id) => {
  if (confirm('Supprimer ce produit ?')) {
    await api.delete(`/produits/${id}`)
    selectedProduitIds.value = selectedProduitIds.value.filter(x => x !== id)
    load()
  }
}

const isSelected = (id) => selectedProduitIds.value.includes(id)
const toggleSelected = (id, checked) => {
  if (checked) {
    if (!selectedProduitIds.value.includes(id)) selectedProduitIds.value.push(id)
  } else {
    selectedProduitIds.value = selectedProduitIds.value.filter(x => x !== id)
  }
}
const toggleAllFiltered = (checked) => {
  if (checked) {
    const s = new Set([...selectedProduitIds.value, ...filteredIds.value])
    selectedProduitIds.value = [...s]
  } else {
    const current = new Set(filteredIds.value)
    selectedProduitIds.value = selectedProduitIds.value.filter(id => !current.has(id))
  }
}

const exportFile = async (type, selectedOnly = true) => {
  if (selectedOnly && !selectedProduitIds.value.length) {
    alert('Sélectionnez au moins un produit.')
    return
  }
  const token   = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  try {
    const qs = new URLSearchParams()
    if (selectedOnly) qs.set('ids', selectedProduitIds.value.join(','))
    const requestUrl = `${baseUrl}/produits/export/${type}${qs.toString() ? `?${qs.toString()}` : ''}`
    const res  = await fetch(requestUrl, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const blobUrl  = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: blobUrl, download: `produits.${type === 'excel' ? 'xlsx' : 'pdf'}` })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(blobUrl)
  } catch {
    alert("Erreur lors de l'export")
  }
}
const exportSelectedExcel = () => exportFile('excel', true)
const exportSelectedPdf = () => exportFile('pdf', true)

//const imgUrl      = (url) => `${BASE_URL}${url}`
//const formatPrice = (v)   => v ? `${Number(v).toLocaleString('fr-FR')} FCFA` : '—'

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

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header__title { font-size: 26px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 10px; }
.header__count { background: #3B82F6; color: #fff; font-size: 14px; font-weight: 700; padding: 3px 10px; border-radius: 30px; }
.header__actions { display: flex; gap: 8px; flex-wrap: wrap; }

.filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
.select-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 2px solid #E2E8F0;
  background: #fff;
  color: #475569;
  font-weight: 700;
  font-size: 13px;
}

.input {
  padding: 10px 14px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  background: #fff;
  color: #1E293B;
  transition: border-color 0.2s;
  width: 100%;
}
.input:focus { border-color: #3B82F6; outline: none; }
.filters .input { width: auto; flex: 1; min-width: 160px; }

.btn-add {
  background: #3B82F6; color: #fff; border: none; border-radius: 10px;
  padding: 10px 20px; font-size: 15px; font-weight: 700; font-family: inherit; cursor: pointer;
}
.btn-add:hover { background: #2563EB; }
.btn-export {
  padding: 10px 14px;
  border: 2px solid #E2E8F0;
  border-radius: 10px;
  background: #fff;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-export:hover:not(:disabled) { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }
.btn-export:disabled { opacity: .45; cursor: not-allowed; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }

.card {
  background: #fff; border-radius: 14px; overflow: hidden;
  border: 2px solid #E2E8F0; transition: box-shadow 0.2s, border-color 0.2s;
}
.card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.08); border-color: #3B82F6; }

.card__img { position: relative; aspect-ratio: 1; background: #F1F5F9; cursor: pointer; overflow: hidden; }
.card__img img { width: 100%; height: 100%; object-fit: cover; }
.card__img-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 44px; }
.card__check {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background: rgba(255,255,255,.9);
  border-radius: 8px;
  padding: 4px;
}

.card__badge { position: absolute; top: 8px; right: 8px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.card__badge--on  { background: #DCFCE7; color: #166534; }
.card__badge--off { background: #FEE2E2; color: #991B1B; }

.card__body { padding: 12px 14px 14px; }
.card__cat   { font-size: 11px; font-weight: 700; color: #3B82F6; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 4px; }
.card__name  { font-size: 15px; font-weight: 800; color: #1E293B; margin: 0 0 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card__brand { font-size: 12px; color: #94A3B8; margin: 0 0 6px; }
.card__price { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 16px; font-weight: 800; color: #F97316; margin: 0 0 10px; }
.card__price-old { color: #94A3B8; font-size: 12px; text-decoration: line-through; font-weight: 700; }
.card__promo-badge { background: #FEE2E2; color: #B91C1C; border-radius: 999px; padding: 2px 7px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.card__actions { display: flex; gap: 6px; }

.btn-edit {
  flex: 1; background: #EFF6FF; color: #3B82F6; border: 2px solid #BFDBFE;
  border-radius: 8px; padding: 7px; font-size: 13px; font-weight: 700;
  font-family: inherit; cursor: pointer; transition: all 0.15s;
}
.btn-edit:hover { background: #3B82F6; color: #fff; border-color: #3B82F6; }

.btn-del {
  background: #FFF1F2; color: #E11D48; border: 2px solid #FECDD3;
  border-radius: 8px; padding: 7px 10px; font-size: 14px; cursor: pointer; transition: all 0.15s;
}
.btn-del:hover { background: #E11D48; border-color: #E11D48; }

.empty { text-align: center; padding: 60px 20px; background: #fff; border-radius: 14px; border: 2px dashed #E2E8F0; }
.empty p { font-size: 18px; font-weight: 700; color: #94A3B8; margin-bottom: 16px; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.modal { background: #fff; border-radius: 18px; width: 100%; max-width: 600px; max-height: 92vh; overflow-y: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }

.modal__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 22px 16px; border-bottom: 2px solid #F1F5F9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal__head h3 { font-size: 18px; font-weight: 800; margin: 0; }
.modal__close {
  width: 32px; height: 32px; border-radius: 8px; border: 2px solid #E2E8F0;
  background: #F8FAFC; font-size: 13px; font-weight: 700; cursor: pointer; color: #64748B;
}
.modal__close:hover { background: #FEE2E2; border-color: #E11D48; color: #E11D48; }

.modal__body { padding: 18px 22px; }

.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
@media (max-width: 480px) { .row2 { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.field label { font-size: 13px; font-weight: 700; color: #475569; }
.field--center { justify-content: flex-end; }
.req { color: #E11D48; }

.toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 700; }
.toggle input { display: none; }
.toggle__track { width: 46px; height: 26px; border-radius: 30px; background: #E2E8F0; position: relative; transition: background 0.2s; flex-shrink: 0; }
.toggle input:checked ~ .toggle__track { background: #22C55E; }
.toggle__thumb { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.2s; }
.toggle input:checked ~ .toggle__track .toggle__thumb { transform: translateX(20px); }

.promo-box {
  margin: 8px 0 16px;
  padding: 16px;
  border: 2px solid #DBEAFE;
  border-radius: 14px;
  background: #EFF6FF;
}

.promo-box__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.promo-box__head strong {
  color: #1E3A8A;
  font-size: 15px;
}

.upload {
  border: 2px dashed #CBD5E1; border-radius: 10px; padding: 22px;
  text-align: center; cursor: pointer; font-size: 14px; font-weight: 700;
  color: #64748B; background: #F8FAFC; transition: all 0.2s;
}
.upload:hover { border-color: #3B82F6; background: #EFF6FF; color: #3B82F6; }

.previews { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }

.preview {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 110px;
  padding: 6px;
  border: 2px solid transparent;
  border-radius: 14px;
  background: #F8FAFC;
}
.preview img {
  width: 80px; height: 80px; object-fit: cover;
  border-radius: 10px; border: 2px solid #E2E8F0;
}
.preview--main {
  border-color: #22C55E;
  background: #F0FDF4;
  box-shadow: 0 8px 22px rgba(34, 197, 94, 0.16);
}
.preview--main img { border-color: #22C55E; }
.preview__main {
  width: 100%;
  padding: 5px 6px;
  border: 1px solid #BFDBFE;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1D4ED8;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
}
.preview--main .preview__main {
  border-color: #22C55E;
  background: #16A34A;
  color: #fff;
}
.preview__remove {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%; border: none;
  background: #E11D48; color: #fff; font-size: 9px; font-weight: 900; cursor: pointer;
}

.preview__couleur {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.preview__couleur-input {
  flex: 1;
  min-width: 0;
  padding: 4px 6px;
  font-size: 11px;
  border: 1.5px solid #E2E8F0;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 600;
  color: #1E293B;
  background: #F8FAFC;
}
.preview__couleur-input:focus { border-color: #3B82F6; outline: none; }

.preview__couleur-picker {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1.5px solid #E2E8F0;
  padding: 1px;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
}

.field__hint {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 8px;
  font-style: italic;
}

.modal__foot { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px 20px; border-top: 2px solid #F1F5F9; }

.btn-cancel {
  padding: 10px 20px; border: 2px solid #E2E8F0; border-radius: 10px;
  background: #F8FAFC; color: #64748B; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
}
.btn-cancel:hover { border-color: #94A3B8; }

.btn-save {
  padding: 10px 24px; background: #22C55E; color: #fff; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #16A34A; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 600px) {
  .page { padding: 16px 14px; }
  .filters { flex-direction: column; }
  .filters .input { width: 100%; }
  .grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .modal__head, .modal__body, .modal__foot { padding-left: 14px; padding-right: 14px; }
}

/* Professional refresh */
.page {
  background: transparent;
  min-height: auto;
  padding: 8px 0;
}

.header__title { font-size: 24px; }

.header__count {
  background: #dbeafe;
  color: #1d4ed8;
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.modal {
  border: 1px solid #dbe3ee;
}
</style>
