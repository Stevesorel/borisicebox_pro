<template>
  <div class="produit-page">
    <div class="produit-page__container">

      <!-- Loading -->
      <div v-if="loading" class="produit-loading">
        <div class="produit-loading__gallery">
          <div class="skeleton skeleton--main"></div>
          <div class="produit-loading__thumbs">
            <div class="skeleton skeleton--thumb"></div>
            <div class="skeleton skeleton--thumb"></div>
            <div class="skeleton skeleton--thumb"></div>
          </div>
        </div>
        <div class="produit-loading__info">
          <div class="skeleton skeleton--cat"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--price"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text-short"></div>
          <div class="skeleton skeleton--btn"></div>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="produit-error">
        <div class="produit-error__icon-wrap">
          <span aria-hidden="true">😕</span>
          <div class="produit-error__circle"></div>
        </div>
        <h2 class="produit-error__title">{{ $t('product.notFound') }}</h2>
        <p class="produit-error__desc">{{ erreur }}</p>
        <NuxtLinkLocale to="/boutique" class="produit-error__btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M11 4L5 10M5 4L11 10"/>
          </svg>
          {{ $t('product.backToShop') }}
        </NuxtLinkLocale>
      </div>

      <!-- Contenu -->
      <template v-else-if="produit">

        <!-- Fil d'Ariane -->
        <nav class="breadcrumb" :aria-label="$t('product.breadcrumb')">
          <NuxtLinkLocale to="/" class="breadcrumb__link">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M1 7L7 1L13 7"/><path d="M3 5V13H8V10H10V13H11V5"/>
            </svg>
            {{ $t('product.home') }}
          </NuxtLinkLocale>
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
          <NuxtLinkLocale to="/boutique" class="breadcrumb__link">{{ $t('product.shop') }}</NuxtLinkLocale>
          <template v-if="produit.Categorie">
            <span class="breadcrumb__sep" aria-hidden="true">/</span>
            <span class="breadcrumb__link">{{ produit.Categorie.nom }}</span>
          </template>
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
          <span class="breadcrumb__current">{{ produit.nom }}</span>
        </nav>

        <div class="produit-layout">

          <!-- ── GALERIE ── -->
          <div class="produit-gallery">
            <div class="produit-gallery__main" @mouseenter="zoomHintVisible = true" @mouseleave="zoomHintVisible = false">
              <img
                v-if="imgActive"
                :src="imgActive"
                :alt="produit.nom"
                class="produit-gallery__main-img"
                fetchpriority="high"
                decoding="async"
                @error="handleImageError"
              />
              <div v-else class="produit-gallery__placeholder">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>

              <!-- Badges -->
              <div class="produit-gallery__badges" :aria-label="$t('product.promotions')">
                <span v-if="hasPromo" class="badge badge--promo">
                  {{ produit.promo_label || $t('product.salePercent', { percent: promoPercent }) }}
                </span>
                <span v-if="produit.nouveau" class="badge badge--new">{{ $t('product.new') }}</span>
              </div>

              <!-- Zoom hint -->
              <div class="produit-gallery__zoom-hint" :class="{ 'is-visible': zoomHintVisible }" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="9" cy="9" r="5"/><path d="M13 13L18 18M9 6V12M6 9H12"/>
                </svg>
              </div>
            </div>

            <!-- Sélecteur de couleurs -->
            <div v-if="aDesCouleurs" class="produit-gallery__couleurs">
              <p class="couleurs-label">
                {{ $t('product.color') }} :&nbsp;<strong>{{ couleurActive || couleurGroupes.find(g => g.couleur)?.couleur }}</strong>
              </p>
              <div class="couleurs-swatches">
                <button
                  v-for="g in couleurGroupes.filter(g => g.couleur)"
                  :key="g.couleur"
                  class="swatch"
                  :class="{ 'swatch--active': couleurActive === g.couleur }"
                  :style="{ background: g.couleur_hex || '#ccc' }"
                  :title="g.couleur"
                  @click="selectCouleur(g)"
                  :aria-label="g.couleur"
                  :aria-pressed="couleurActive === g.couleur"
                ></button>
              </div>
            </div>

            <!-- Miniatures -->
            <div v-if="produit.images?.length > 1" class="produit-gallery__thumbs" role="listbox" aria-label="Images du produit">
              <button
                v-for="img in (aDesCouleurs
                  ? couleurGroupes.find(g => g.couleur === (couleurActive || couleurGroupes.find(g2 => g2.couleur)?.couleur))?.images || []
                  : produit.images)"
                :key="img.id"
                class="thumb"
                :class="{ 'thumb--active': imageSelectionneePath === img.url }"
                @click="selectImage(img)"
                role="option"
                :aria-selected="imageSelectionneePath === img.url"
              >
                <img :src="productImageUrl(img, 'thumb')" :alt="`${produit.nom} - ${img.couleur || $t('product.imageView')}`" loading="lazy" decoding="async" />
              </button>
            </div>
          </div>

          <!-- ── INFOS ── -->
          <div class="produit-info">

            <!-- En-tête catégorie + note -->
            <div class="produit-info__header">
              <span v-if="produit.Categorie" class="tag-categorie">{{ produit.Categorie.nom }}</span>
              <div v-if="produit.note" class="rating" :aria-label="$t('product.rating', { note: produit.note })">
                <svg
                  v-for="i in 5"
                  :key="i"
                  width="15" height="15" viewBox="0 0 16 16"
                  :fill="i <= Math.round(produit.note) ? '#f59e0b' : 'none'"
                  stroke="#f59e0b"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z"/>
                </svg>
                <span class="rating__text">{{ produit.note }}/5</span>
              </div>
            </div>

            <div class="produit-heading-row">
              <h1 class="produit-info__title">{{ produit.nom }}</h1>
              <!-- Prix -->
              <div class="produit-info__prix">
                <template v-if="hasPromo">
                  <del class="prix-old">{{ formatPrice(produit.prix_base) }}</del>
                  <strong class="prix-current prix-current--promo">{{ formatPrice(effectivePrice) }}</strong>
                  <span class="prix-save">{{ $t('product.save', { amount: formatPrice(produit.prix_base - effectivePrice) }) }}</span>
                </template>
                <template v-else>
                  <strong class="prix-current">{{ formatPrice(produit.prix_base) }}</strong>
                </template>
              </div>
            </div>
            <p v-if="produit.marque" class="produit-info__marque">
              {{ $t('product.by') }} <strong>{{ produit.marque }}</strong>
            </p>

            <div v-if="hasWholesaleOffer" class="wholesale-card">
              <span class="wholesale-card__badge">{{ $t('product.wholesaleBadge') }}</span>
              <p>
                {{ $t('product.wholesaleText', {
                  count: produit.prix_gros_min_quantite,
                  price: formatPrice(produit.prix_gros)
                }) }}
              </p>
            </div>

            <hr class="produit-info__divider" aria-hidden="true" />

            <!-- Personnalisation visible avant l'achat -->
            <div v-if="produit.personnalisable" class="produit-info__perso">
              <div class="perso-header">
                <h3 class="perso-title">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M2 11L11 2L14 5L5 14L2 14L2 11Z"/>
                  </svg>
                  {{ $t('product.engraving') }}
                </h3>
                <span class="perso-badge">{{ $t('product.optional') }}</span>
              </div>
              <p class="perso-desc">{{ $t('product.personalizationDesc') }}</p>

              <div v-if="produit.frais_personnalisation > 0" class="perso-prix">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <circle cx="7" cy="7" r="6"/><path d="M7 4V7L9 9"/>
                </svg>
                {{ $t('product.engravingFee') }} <strong>{{ formatPrice(produit.frais_personnalisation) }}</strong>
              </div>

              <textarea
                v-model="personnalisation"
                :placeholder="$t('product.personalizationPlaceholder')"
                class="perso-textarea"
                rows="3"
                maxlength="20"
              ></textarea>
              <div class="perso-footer">
                <span class="perso-counter">{{ $t('product.personalizationCounter', { count: personnalisation.length }) }}</span>
                <span class="perso-info">{{ $t('product.personalizationInfo') }}</span>
              </div>
            </div>

            <div class="achat-card">
              <!-- Actions -->
              <div class="produit-info__actions">
                <button
                  class="btn-cart"
                  @click="addToCart"
                  :disabled="produit.stock === 0"
                  :aria-label="produit.stock === 0 ? $t('product.unavailableAria') : $t('product.addToCart')"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="7" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>
                    <path d="M1 1H3.5L6 13H18L20 5H5"/>
                  </svg>
                  {{ produit.stock === 0 ? $t('product.unavailable') : $t('product.addToCart') }}
                </button>

                <button
                  class="btn-wishlist"
                  @click="toggleWishlist"
                  :class="{ 'btn-wishlist--active': isWishlisted }"
                  :aria-label="isWishlisted ? $t('product.removeFromWishlist') : $t('product.addToWishlist')"
                  :aria-pressed="isWishlisted"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" :fill="isWishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                    <path d="M17 4C15.5 2.5 13 2.5 10 5C7 2.5 4.5 2.5 3 4C1 6 1 9 3 11L10 18L17 11C19 9 19 6 17 4Z"/>
                  </svg>
                </button>
              </div>

              <!-- Quantité -->
              <div class="produit-info__qty">
                <p class="section-label">{{ $t('product.quantity') }}</p>
                <div class="qty-selector">
                  <button
                    class="qty-selector__btn"
                    @click="qty > 1 ? qty-- : null"
                    :disabled="qty <= 1 || produit.stock === 0"
                    :aria-label="$t('product.decreaseQuantity')"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <path d="M3 8H13"/>
                    </svg>
                  </button>
                  <span class="qty-selector__value" aria-live="polite">{{ qty }}</span>
                  <button
                    class="qty-selector__btn"
                    @click="qty++"
                    :disabled="produit.stock === 0"
                    :aria-label="$t('product.increaseQuantity')"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                      <path d="M8 3V13M3 8H13"/>
                    </svg>
                  </button>
                </div>
              </div>

              <NuxtLinkLocale to="/panier" class="btn-view-cart">
                {{ $t('product.viewCart') }}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                  <path d="M3 8H13M10 5L13 8L10 11"/>
                </svg>
              </NuxtLinkLocale>

              <!-- Toast -->
              <Transition name="toast">
                <div v-if="added" class="toast" role="status" aria-live="polite">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                    <path d="M3 10L8 15L17 4"/>
                  </svg>
                  {{ $t('product.added') }}
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <section v-if="produit.description" class="produit-details-panel">
          <!-- Description -->
          <div v-if="produit.description" class="produit-info__desc">
            <p class="section-label">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M2 4H14M2 8H14M2 12H10"/>
              </svg>
              {{ $t('product.description') }}
            </p>
            <p class="desc-text">{{ produit.description }}</p>
          </div>

        </section>

        <!-- Produits similaires -->
        <section v-if="produitsSimilaires?.length" class="produit-similaires" aria-labelledby="similaires-title">
          <h2 id="similaires-title" class="similaires-title">{{ $t('product.similar') }}</h2>
          <div class="similaires-grid">
            <ProduitCard v-for="p in produitsSimilaires" :key="p.id" :produit="p" />
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api, { imgUrl, productImageUrl, productDisplayImage, formatPrice } from '@/services/api'
import { usePanierStore } from '@/stores/panier'
import { useShopSettingsStore } from '@/stores/shopSettings'
import ProduitCard from '@/components/ProduitCard.vue'

definePageMeta({
  key: (route) => route.fullPath
})

const route  = useRoute()
const panier = usePanierStore()
const shop = useShopSettingsStore()
await shop.loadPublic()
const config = useRuntimeConfig()
const { t } = useI18n()

const produit               = ref(null)
const produitsSimilaires    = ref([])
const loading               = ref(true)
const erreur                = ref('')
const qty                   = ref(1)
const added                 = ref(false)
const imgActive             = ref('')
const imageSelectionneePath = ref('')
const couleurActive         = ref(null)
const personnalisation      = ref('')
const isWishlisted          = ref(false)
const imageVersion          = ref(Date.now())
const zoomHintVisible       = ref(false)

const couleurGroupes = computed(() => {
  const imgs = produit.value?.images || []
  const groupes = {}
  imgs.forEach(img => {
    const key = img.couleur || '__sans__'
    if (!groupes[key]) groupes[key] = { couleur: img.couleur, couleur_hex: img.couleur_hex, images: [] }
    groupes[key].images.push(img)
  })
  return Object.values(groupes)
})

const aDesCouleurs = computed(() => couleurGroupes.value.some(g => g.couleur))

const hasPromo = computed(() => {
  if (!produit.value) return false
  const promo = Number(produit.value.prix_promo)
  const base = Number(produit.value.prix_base)
  if (!promo || !base || promo >= base) return false
  const now = Date.now()
  const start = produit.value.promo_debut ? new Date(produit.value.promo_debut).getTime() : null
  const end = produit.value.promo_fin ? new Date(produit.value.promo_fin).getTime() : null
  return (!start || start <= now) && (!end || end >= now)
})

const effectivePrice = computed(() => hasPromo.value ? Number(produit.value.prix_promo) : Number(produit.value?.prix_base || 0))
const promoPercent = computed(() => Math.round((1 - effectivePrice.value / Number(produit.value?.prix_base || 1)) * 100))
const hasWholesaleOffer = computed(() => {
  if (!produit.value?.prix_gros_actif) return false
  const min = Number(produit.value.prix_gros_min_quantite)
  const wholesalePrice = Number(produit.value.prix_gros)
  return min > 1 && wholesalePrice > 0 && wholesalePrice < effectivePrice.value
})

const groupeCouleurActif = computed(() => {
  if (!aDesCouleurs.value) return null
  const fallback = couleurGroupes.value.find(g => g.couleur)
  return couleurGroupes.value.find(g => g.couleur === couleurActive.value) || fallback || null
})

const selectCouleur = (groupe) => {
  couleurActive.value = groupe.couleur
  if (groupe.images.length) selectImage(groupe.images[0])
}

const selectImage = (img) => {
  if (!img?.url) return
  imageSelectionneePath.value = img.url
  imgActive.value = productImageUrl(img, 'large')
}

const load = async () => {
  const slug = routeSlug.value
  if (!slug) return
  loading.value = true
  erreur.value = ''
  produit.value = null
  couleurActive.value = null
  imageSelectionneePath.value = ''
  imageVersion.value = Date.now()
  try {
    const { data } = await api.get(`/produits/slug/${slug}`)
    produit.value = data
    if (data.image_principale) {
      imageSelectionneePath.value = data.image_principale
      imgActive.value = productDisplayImage(data, 'large') + '?v=' + imageVersion.value
    }
    const mainImage = (data.images || []).find(img => img.url === data.image_principale)
    const premierGroupe = (data.images || []).find(img => img.couleur)
    if (mainImage?.couleur) {
      couleurActive.value = mainImage.couleur
    } else if (!data.image_principale && premierGroupe) {
      couleurActive.value = premierGroupe.couleur
      selectImage(premierGroupe)
    }
    if (data.Categorie?.id) {
      try {
        const similaires = await api.get(`/produits?categorie=${data.Categorie.id}&limit=4&exclude=${data.id}`)
        produitsSimilaires.value = similaires.data.produits || similaires.data || []
      } catch { produitsSimilaires.value = [] }
    }
    checkWishlist(data.id)
  } catch (e) {
    erreur.value = e.response?.status === 404
      ? t('product.notFoundDesc')
      : t('product.loadError')
  } finally {
    loading.value = false
  }
}

const handleImageError = () => { imgActive.value = '' }

const checkWishlist = (produitId) => {
  if (!import.meta.client) return
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    isWishlisted.value = wishlist.includes(produitId)
  } catch { isWishlisted.value = false }
}

const toggleWishlist = () => {
  if (!import.meta.client || !produit.value) return
  try {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
    if (isWishlisted.value) {
      const i = wishlist.indexOf(produit.value.id)
      if (i > -1) wishlist.splice(i, 1)
    } else {
      wishlist.push(produit.value.id)
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    isWishlisted.value = !isWishlisted.value
  } catch {}
}

const addToCart = () => {
  if (produit.value.stock === 0) return
  const couleur     = groupeCouleurActif.value?.couleur || null
  const couleur_hex = groupeCouleurActif.value?.couleur_hex || null
  const img         = imageSelectionneePath.value || produit.value.image_principale
  panier.ajouter({
    ...produit.value,
    prix_promo: hasPromo.value ? produit.value.prix_promo : null,
    image_selectionnee: img,
    image_principale:   img,
    personnalisation:   personnalisation.value || null,
    couleur,
    couleur_hex,
  }, qty.value)
  added.value = true
  setTimeout(() => { added.value = false }, 2500)
}

const routeSlug = computed(() =>
  Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
)

const { data: ssrData } = await useAsyncData(
  () => `produit-${routeSlug.value || ''}`,
  async () => {
    try {
      if (!routeSlug.value) return null
      return await $fetch(`${config.apiBaseInternal}/produits/slug/${routeSlug.value}`)
    } catch { return null }
  },
  { server: true, watch: [routeSlug] }
)

if (ssrData.value) {
  produit.value = ssrData.value
  if (ssrData.value.image_principale) {
    imageSelectionneePath.value = ssrData.value.image_principale
    imgActive.value = productDisplayImage(ssrData.value, 'large')
  }
  const mainImage = (ssrData.value.images || []).find(img => img.url === ssrData.value.image_principale)
  const premierGroupe = (ssrData.value.images || []).find(img => img.couleur)
  if (mainImage?.couleur) {
    couleurActive.value = mainImage.couleur
  } else if (!ssrData.value.image_principale && premierGroupe) {
    couleurActive.value = premierGroupe.couleur
    selectImage(premierGroupe)
  }
  loading.value = false
}

useHead(computed(() => {
  if (!produit.value) return {
    title: t('product.metaDefaultTitle'),
    meta: [{ name: 'description', content: t('product.metaDefaultDesc') }]
  }
  return {
    title: `${produit.value.nom} - ${shop.settings.shop_name}`,
    meta: [
      { name: 'description', content: produit.value.description?.slice(0, 155) || `${produit.value.nom} - ${shop.settings.shop_name}` },
      { property: 'og:title',       content: `${produit.value.nom} - ${shop.settings.shop_name}` },
      { property: 'og:description', content: produit.value.description?.slice(0, 155) || '' },
      { property: 'og:image',       content: productDisplayImage(produit.value, 'large') },
      { property: 'og:url',         content: `${String(shop.settings.site_url || '').replace(/\/$/, '')}/produit/${produit.value.slug}` },
      { property: 'og:type',        content: 'product' },
      { name: 'twitter:card',       content: 'summary_large_image' },
    ]
  }
}))

onMounted(() => {
  if (produit.value) {
    if (produit.value.Categorie?.id) {
      api.get(`/produits?categorie=${produit.value.Categorie.id}&limit=4&exclude=${produit.value.id}`)
        .then(r => { produitsSimilaires.value = r.data.produits || r.data || [] })
        .catch(() => { produitsSimilaires.value = [] })
    }
    checkWishlist(produit.value.id)
  }
})

watch(routeSlug, () => {
  if (!routeSlug.value) return
  qty.value = 1
  personnalisation.value = ''
  load()
}, { immediate: true })
</script>

<style scoped>
/* ============================================================
   VARIABLES — tokens locaux au composant
   ============================================================ */
.produit-page {
  /* Couleurs */
  --accent:       #3b82f6;
  --accent-hover: #2563eb;
  --accent-light: rgba(59, 130, 246, 0.08);

  --text-primary:   var(--text-primary,   #111827);
  --text-secondary: var(--text-secondary, #374151);
  --text-muted:     var(--text-muted,     #6b7280);

  --bg-primary:   var(--bg-primary,   #ffffff);
  --bg-secondary: var(--bg-secondary, #f9fafb);
  --bg-tertiary:  var(--bg-tertiary,  #f3f4f6);

  --surface:      var(--surface,      #ffffff);
  --border:       var(--border,       #e5e7eb);

  --input-bg:     var(--input-bg,     #ffffff);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);

  /* Mise en page */
  padding:    32px 0 80px;
  min-height: 60vh;
  background: var(--bg-primary);
}

@media (min-width: 768px) {
  .produit-page { padding: 48px 0 100px; }
}

/* ============================================================
   CONTENEUR
   ============================================================ */
.produit-page__container {
  max-width: 1200px;
  margin:  0 auto;
  padding: 0 16px;
}

@media (min-width: 480px)  { .produit-page__container { padding: 0 24px; } }
@media (min-width: 768px)  { .produit-page__container { padding: 0 32px; } }
@media (min-width: 1280px) { .produit-page__container { padding: 0 48px; } }

/* ============================================================
   BREADCRUMB
   ============================================================ */
.breadcrumb {
  display:     flex;
  align-items: center;
  flex-wrap:   wrap;
  gap:         6px;
  font-family: var(--font-ui);
  font-size:   12px;
  color:       var(--text-muted);
  margin-bottom: 28px;
}

@media (min-width: 768px) {
  .breadcrumb { margin-bottom: 36px; font-size: 13px; }
}

.breadcrumb__link {
  display:     inline-flex;
  align-items: center;
  gap:         4px;
  color:       var(--text-muted);
  text-decoration: none;
  white-space: nowrap;
  transition:  color 0.2s ease;
}

.breadcrumb__link:hover { color: var(--accent); }

.breadcrumb__sep {
  color:       var(--border);
  flex-shrink: 0;
  font-size:   11px;
  user-select: none;
}

.breadcrumb__current {
  color:         var(--text-secondary);
  font-weight:   600;
  white-space:   nowrap;
  overflow:      hidden;
  text-overflow: ellipsis;
  max-width:     200px;
}

@media (min-width: 480px) { .breadcrumb__current { max-width: none; } }

/* ============================================================
   SKELETON
   ============================================================ */
.produit-loading {
  display:               grid;
  grid-template-columns: 1fr;
  gap:                   28px;
}

@media (min-width: 768px) {
  .produit-loading {
    grid-template-columns: 1fr 1fr;
    gap:                   48px;
  }
}

.produit-loading__thumbs {
  display:    flex;
  gap:        8px;
  margin-top: 12px;
}

.produit-loading__info {
  display:        flex;
  flex-direction: column;
  gap:            14px;
  padding-top:    8px;
}

.skeleton {
  background:      linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation:       shimmer 1.6s ease-in-out infinite;
  border-radius:   var(--radius-md);
}

.skeleton--main        { aspect-ratio: 1/1; border-radius: var(--radius-xl); }
.skeleton--thumb       { width: 64px; height: 64px; border-radius: var(--radius-md); }
.skeleton--cat         { width: 100px; height: 22px; border-radius: 999px; }
.skeleton--title       { width: 80%; height: 34px; }
.skeleton--price       { width: 150px; height: 30px; }
.skeleton--text        { width: 100%; height: 78px; }
.skeleton--text-short  { width: 60%; height: 16px; }
.skeleton--btn         { width: 100%; height: 50px; border-radius: var(--radius-lg); }

/* ============================================================
   ERREUR
   ============================================================ */
.produit-error {
  text-align: center;
  padding:    80px 20px;
}

.produit-error__icon-wrap {
  position:       relative;
  width:          96px;
  height:         96px;
  margin:         0 auto 24px;
  display:        flex;
  align-items:    center;
  justify-content: center;
}

.produit-error__icon-wrap span {
  font-size: 44px;
  position:  relative;
  z-index:   1;
}

.produit-error__circle {
  position:      absolute;
  inset:         0;
  background:    var(--accent-light);
  border-radius: 50%;
  animation:     pulse 2s ease-in-out infinite;
}

.produit-error__title {
  font-size:     22px;
  font-weight:   700;
  color:         var(--text-primary);
  margin-bottom: 8px;
}

.produit-error__desc {
  font-family:   var(--font-ui);
  font-size:     14px;
  color:         var(--text-muted);
  margin-bottom: 24px;
}

.produit-error__btn {
  display:         inline-flex;
  align-items:     center;
  gap:             8px;
  padding:         12px 24px;
  background:      var(--surface);
  border:          2px solid var(--border);
  border-radius:   var(--radius-lg);
  font-family:     var(--font-ui);
  font-size:       14px;
  font-weight:     600;
  color:           var(--text-primary);
  text-decoration: none;
  transition:      all 0.25s ease;
}

.produit-error__btn:hover {
  border-color:    var(--accent);
  color:           var(--accent);
  transform:       translateY(-1px);
}

/* ============================================================
   LAYOUT PRODUIT
   ============================================================ */
.produit-layout {
  display:               grid;
  grid-template-columns: 1fr;
  gap:                   32px;
  align-items:           start;
}

@media (min-width: 768px) {
  .produit-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap:                   52px;
  }
}

@media (min-width: 1024px) {
  .produit-layout {
    grid-template-columns: minmax(0, 55%) minmax(0, 1fr);
    gap:                   64px;
  }
}

/* ============================================================
   GALERIE
   ============================================================ */
.produit-gallery__main {
  position:      relative;
  background:    var(--bg-secondary);
  border-radius: var(--radius-xl);
  overflow:      hidden;
  aspect-ratio:  1 / 1;
  cursor:        zoom-in;
  border:        1px solid var(--border);
}

.produit-gallery__main-img {
  width:      100%;
  height:     100%;
  object-fit: cover;
  display:    block;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.produit-gallery__main:hover .produit-gallery__main-img {
  transform: scale(1.5);
}

.produit-gallery__placeholder {
  width:           100%;
  height:          100%;
  display:         flex;
  align-items:     center;
  justify-content: center;
  color:           var(--text-muted);
  opacity:         0.45;
}

/* Badges */
.produit-gallery__badges {
  position:       absolute;
  top:            12px;
  left:           12px;
  display:        flex;
  flex-direction: column;
  gap:            6px;
  z-index:        2;
}

.badge {
  display:        inline-block;
  padding:        5px 10px;
  border-radius:  var(--radius-sm);
  font-family:    var(--font-ui);
  font-size:      11px;
  font-weight:    700;
  letter-spacing: 0.03em;
}

.badge--promo { background: #ef4444; color: #fff; }
.badge--new   { background: #10b981; color: #fff; }

/* Zoom hint */
.produit-gallery__zoom-hint {
  position:        absolute;
  bottom:          12px;
  right:           12px;
  background:      rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius:   50%;
  width:           36px;
  height:          36px;
  display:         flex;
  align-items:     center;
  justify-content: center;
  color:           #fff;
  opacity:         0;
  transition:      opacity 0.25s ease;
  pointer-events:  none;
}

.produit-gallery__zoom-hint.is-visible { opacity: 1; }

/* Couleurs */
.produit-gallery__couleurs { margin-top: 16px; }

.couleurs-label {
  font-family:   var(--font-ui);
  font-size:     13px;
  color:         var(--text-muted);
  margin-bottom: 10px;
}

.couleurs-label strong { color: var(--text-primary); font-weight: 700; }

.couleurs-swatches {
  display:   flex;
  gap:       8px;
  flex-wrap: wrap;
}

.swatch {
  width:         32px;
  height:        32px;
  border-radius: 50%;
  border:        3px solid var(--border);
  cursor:        pointer;
  padding:       0;
  transition:    all 0.2s var(--ease-spring);
  outline:       2px solid transparent;
  outline-offset: 2px;
}

.swatch:hover {
  transform:       scale(1.15);
  border-color:    var(--text-muted);
}

.swatch--active {
  border-color:    var(--accent) !important;
  outline-color:   var(--accent-light);
  transform:       scale(1.1);
}

/* Miniatures */
.produit-gallery__thumbs {
  display:    flex;
  gap:        8px;
  margin-top: 12px;
  flex-wrap:  wrap;
}

.thumb {
  width:         64px;
  height:        64px;
  border-radius: var(--radius-md);
  overflow:      hidden;
  border:        2px solid transparent;
  cursor:        pointer;
  padding:       0;
  background:    none;
  transition:    all 0.2s ease;
  flex-shrink:   0;
}

.thumb:hover {
  border-color: var(--accent);
  transform:    translateY(-2px);
}

.thumb--active {
  border-color: var(--accent);
  box-shadow:   0 0 0 3px var(--accent-light);
}

.thumb img {
  width:      100%;
  height:     100%;
  object-fit: cover;
  display:    block;
}

/* ============================================================
   INFOS PRODUIT
   ============================================================ */
.produit-info { padding-top: 4px; }

/* En-tête */
.produit-info__header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  flex-wrap:       wrap;
  gap:             10px;
  margin-bottom:   14px;
}

.tag-categorie {
  display:        inline-block;
  background:     var(--accent-light);
  color:          var(--accent);
  padding:        5px 12px;
  border-radius:  999px;
  font-family:    var(--font-ui);
  font-size:      11px;
  font-weight:    700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rating {
  display:     flex;
  align-items: center;
  gap:         3px;
}

.rating__text {
  font-family: var(--font-ui);
  font-size:   13px;
  font-weight: 600;
  color:       var(--text-primary);
  margin-left: 4px;
}

/* Titre */
.produit-info__title {
  font-size:     26px;
  font-weight:   800;
  letter-spacing: -0.02em;
  line-height:   1.2;
  color:         var(--text-primary);
  margin-bottom: 8px;
}

@media (min-width: 480px) { .produit-info__title { font-size: 30px; } }
@media (min-width: 768px) { .produit-info__title { font-size: 34px; } }

/* Marque */
.produit-info__marque {
  font-family:   var(--font-ui);
  font-size:     14px;
  color:         var(--text-muted);
  margin-bottom: 20px;
}

.produit-info__marque strong { color: var(--text-primary); font-weight: 600; }

.wholesale-card {
  display: grid;
  gap: 8px;
  margin: 0 0 18px;
  padding: 14px 16px;
  border: 2px solid color-mix(in srgb, #22C55E 36%, var(--border));
  border-radius: var(--radius-lg);
  background:
    linear-gradient(135deg, color-mix(in srgb, #22C55E 14%, transparent), color-mix(in srgb, #38BDF8 12%, transparent)),
    var(--surface);
  color: var(--text-primary);
}

.wholesale-card__badge {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: #16A34A;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.wholesale-card p {
  margin: 0;
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.45;
}

/* Séparateur */
.produit-info__divider {
  border:          none;
  border-top:      1px solid var(--border);
  margin:          0 0 20px;
}

/* Prix */
.produit-info__prix {
  display:       flex;
  align-items:   baseline;
  flex-wrap:     wrap;
  gap:           10px;
  margin-bottom: 20px;
}

.prix-current {
  font-size:     30px;
  font-weight:   800;
  letter-spacing: -0.02em;
  color:         var(--text-primary);
}

@media (min-width: 768px) { .prix-current { font-size: 34px; } }

.prix-current--promo { color: #ef4444; }

.prix-old {
  font-size:       18px;
  color:           var(--text-muted);
  text-decoration: line-through;
  font-weight:     400;
}

.prix-save {
  display:        inline-block;
  padding:        4px 10px;
  background:     #fef2f2;
  color:          #dc2626;
  border-radius:  999px;
  font-family:    var(--font-ui);
  font-size:      11px;
  font-weight:    600;
}

/* Labels de section */
.section-label {
  display:        flex;
  align-items:    center;
  gap:            6px;
  font-family:    var(--font-ui);
  font-size:      12px;
  font-weight:    700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color:          var(--text-muted);
  margin-bottom:  10px;
}

/* Description */
.produit-info__desc { margin-bottom: 20px; }

.desc-text {
  font-size:   15px;
  color:       var(--text-secondary);
  line-height: 1.75;
}

/* ============================================================
   PERSONNALISATION
   ============================================================ */
.produit-info__perso {
  margin-bottom:  22px;
  padding:        18px 20px;
  background:     var(--bg-secondary);
  border-radius:  var(--radius-lg);
  border:         1px solid var(--border);
  transition:     border-color 0.25s ease, box-shadow 0.25s ease;
}

.produit-info__perso:focus-within {
  border-color: var(--accent);
  box-shadow:   0 0 0 3px var(--accent-light);
}

.perso-header {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-bottom:   8px;
  flex-wrap:       wrap;
  gap:             8px;
}

.perso-title {
  display:        flex;
  align-items:    center;
  gap:            6px;
  font-family:    var(--font-ui);
  font-size:      13px;
  font-weight:    700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color:          var(--text-primary);
  margin:         0;
}

.perso-badge {
  font-family:    var(--font-ui);
  font-size:      10px;
  font-weight:    600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding:        3px 10px;
  border-radius:  999px;
  background:     var(--accent-light);
  color:          var(--accent);
}

.perso-desc {
  font-family:   var(--font-ui);
  font-size:     13px;
  color:         var(--text-muted);
  margin-bottom: 12px;
  line-height:   1.5;
}

.perso-prix {
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  font-family:   var(--font-ui);
  font-size:     13px;
  font-weight:   500;
  color:         var(--accent);
  background:    var(--accent-light);
  padding:       6px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.perso-prix strong { font-weight: 700; }

.perso-textarea {
  width:         100%;
  padding:       12px 14px;
  border:        2px solid var(--border);
  border-radius: var(--radius-md);
  font-size:     14px;
  font-family:   inherit;
  background:    var(--input-bg);
  color:         var(--text-primary);
  resize:        vertical;
  line-height:   1.6;
  transition:    border-color 0.2s ease;
  box-sizing:    border-box;
}

.perso-textarea:focus {
  border-color: var(--accent);
  outline:      none;
}

.perso-textarea::placeholder {
  color: var(--text-muted);
}

.perso-footer {
  display:         flex;
  justify-content: space-between;
  align-items:     center;
  margin-top:      8px;
  gap:             8px;
  flex-wrap:       wrap;
}

.perso-counter {
  font-family: var(--font-ui);
  font-size:   11px;
  color:       var(--text-muted);
}

.perso-info {
  font-family: var(--font-ui);
  font-size:   11px;
  color:       var(--accent);
  font-style:  italic;
}

/* ============================================================
   QUANTITÉ
   ============================================================ */
.produit-info__qty { margin-bottom: 22px; }

.qty-selector {
  display:       inline-flex;
  align-items:   center;
  border:        2px solid var(--border);
  border-radius: 999px;
  overflow:      hidden;
  background:    var(--surface);
}

.qty-selector__btn {
  display:         flex;
  align-items:     center;
  justify-content: center;
  width:           44px;
  height:          44px;
  background:      var(--bg-secondary);
  border:          none;
  color:           var(--text-primary);
  cursor:          pointer;
  transition:      all 0.2s ease;
  flex-shrink:     0;
}

.qty-selector__btn:hover:not(:disabled) {
  background: var(--accent-light);
  color:      var(--accent);
}

.qty-selector__btn:disabled {
  opacity: 0.4;
  cursor:  not-allowed;
}

.qty-selector__value {
  min-width:   52px;
  text-align:  center;
  font-size:   16px;
  font-weight: 700;
  color:       var(--text-primary);
}

/* ============================================================
   ACTIONS
   ============================================================ */
.produit-info__actions {
  display:   flex;
  gap:       10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.btn-cart {
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             10px;
  flex:            1;
  min-width:       180px;
  padding:         14px 22px;
  background:      var(--accent);
  color:           #fff;
  border:          none;
  border-radius:   var(--radius-lg);
  font-family:     var(--font-ui);
  font-size:       14px;
  font-weight:     700;
  letter-spacing:  0.02em;
  cursor:          pointer;
  white-space:     nowrap;
  transition:      all 0.3s var(--ease-out);
  box-shadow:      0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-cart:hover:not(:disabled) {
  background:  var(--accent-hover);
  transform:   translateY(-2px);
  box-shadow:  0 6px 20px rgba(59, 130, 246, 0.4);
}

.btn-cart:active:not(:disabled) { transform: translateY(0); }

.btn-cart:disabled {
  opacity: 0.5;
  cursor:  not-allowed;
  box-shadow: none;
}

.btn-wishlist {
  width:           50px;
  height:          50px;
  flex-shrink:     0;
  border-radius:   var(--radius-lg);
  border:          2px solid var(--border);
  background:      var(--surface);
  color:           var(--text-muted);
  cursor:          pointer;
  display:         flex;
  align-items:     center;
  justify-content: center;
  transition:      all 0.25s ease;
}

.btn-wishlist:hover {
  border-color: var(--accent);
  color:        var(--accent);
  background:   var(--accent-light);
}

.btn-wishlist--active {
  background:   #fef2f2;
  border-color: #ef4444;
  color:        #ef4444;
}

.btn-view-cart {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             8px;
  padding:         11px 20px;
  background:      var(--surface);
  color:           var(--text-primary);
  border:          2px solid var(--border);
  border-radius:   var(--radius-md);
  font-family:     var(--font-ui);
  font-size:       13px;
  font-weight:     600;
  text-decoration: none;
  transition:      all 0.25s ease;
  margin-bottom:   16px;
  width:           100%;
}

.btn-view-cart:hover {
  border-color: var(--accent);
  color:        var(--accent);
}

/* Toast */
.toast {
  display:       inline-flex;
  align-items:   center;
  gap:           10px;
  background:    #f0fdf4;
  color:         #166534;
  border:        1px solid #bbf7d0;
  border-radius: var(--radius-md);
  padding:       12px 16px;
  font-family:   var(--font-ui);
  font-size:     14px;
  font-weight:   600;
  margin-bottom: 18px;
  width:         100%;
  box-sizing:    border-box;
}

.toast-enter-active { transition: all 0.35s var(--ease-out); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(-8px); }
.toast-leave-to     { opacity: 0; }

/* Garanties */
.produit-info__garanties {
  display:     flex;
  flex-wrap:   wrap;
  gap:         14px;
  padding-top: 18px;
  border-top:  1px solid var(--border);
}

.garantie-item {
  display:     flex;
  align-items: center;
  gap:         7px;
  font-family: var(--font-ui);
  font-size:   12px;
  font-weight: 500;
  color:       var(--text-muted);
}

.garantie-item svg { color: var(--accent); flex-shrink: 0; }

/* ============================================================
   PRODUITS SIMILAIRES
   ============================================================ */
.produit-similaires {
  margin-top:  72px;
  padding-top: 40px;
  border-top:  1px solid var(--border);
}

.similaires-title {
  font-size:     22px;
  font-weight:   800;
  color:         var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}

.similaires-grid {
  display:               grid;
  grid-template-columns: repeat(2, 1fr);
  gap:                   12px;
}

@media (min-width: 640px) {
  .similaires-grid {
    grid-template-columns: repeat(3, 1fr);
    gap:                   16px;
  }
}

@media (min-width: 1024px) {
  .similaires-grid {
    grid-template-columns: repeat(4, 1fr);
    gap:                   20px;
  }
}

/* ============================================================
   ANIMATIONS
   ============================================================ */
@keyframes shimmer {
  0%   { background-position:  200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1);    opacity: 0.5; }
  50%       { transform: scale(1.1); opacity: 0.3; }
}

/* ============================================================
   RESPONSIVE — petits écrans
   ============================================================ */
@media (max-width: 479px) {
  .produit-page { padding: 20px 0 60px; }

  .produit-info__title  { font-size: 22px; }
  .prix-current         { font-size: 26px; }

  .produit-info__perso  { padding: 14px 16px; }

  /* Actions pleine largeur */
  .produit-info__actions { flex-direction: column; }
  .btn-cart     { min-width: unset; flex: none; width: 100%; }
  .btn-wishlist { width: 100%; border-radius: var(--radius-lg); }

  .produit-similaires  { margin-top: 48px; padding-top: 28px; }
  .similaires-title    { font-size: 18px; }
  .similaires-grid     { gap: 10px; }

  .thumb { width: 56px; height: 56px; }
  .produit-gallery__thumbs { gap: 6px; }
}

@media (max-width: 359px) {
  .produit-info__title { font-size: 20px; }
  .prix-current        { font-size: 22px; }
  .garantie-item       { font-size: 11px; }
}

/* ============================================================
   REFONTE COMMERCIALE — page produit plus vendeuse
   ============================================================ */
.produit-page {
  padding: 22px 0 96px;
  background:
    radial-gradient(circle at 8% 0%, rgba(59, 130, 246, 0.12), transparent 34%),
    radial-gradient(circle at 100% 18%, rgba(139, 92, 246, 0.10), transparent 30%),
    linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 44%);
}

.produit-page__container {
  max-width: 1240px;
}

.breadcrumb {
  width: fit-content;
  max-width: 100%;
  margin-bottom: 18px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 999px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(12px);
}

.produit-layout {
  position: relative;
  grid-template-columns: minmax(0, 1.05fr) minmax(380px, 0.82fr);
  gap: clamp(28px, 4vw, 64px);
  align-items: start;
}

.produit-gallery {
  position: relative;
}

.produit-gallery::before {
  content: "";
  position: absolute;
  inset: -14px;
  z-index: 0;
  border-radius: 32px;
  background:
    linear-gradient(135deg, rgba(59, 130, 246, 0.14), rgba(139, 92, 246, 0.08)),
    var(--surface);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.10);
}

.produit-gallery > * {
  position: relative;
  z-index: 1;
}

.produit-gallery__main {
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 30px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.18)),
    var(--bg-secondary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.produit-gallery__main-img {
  object-fit: cover;
}

.produit-gallery__main:hover .produit-gallery__main-img {
  transform: scale(1.08);
}

.produit-gallery__badges {
  top: 16px;
  left: 16px;
}

.badge {
  padding: 7px 12px;
  border-radius: 999px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
}

.produit-gallery__zoom-hint {
  right: 16px;
  bottom: 16px;
  width: 42px;
  height: 42px;
}

.produit-gallery__couleurs {
  margin-top: 24px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.06);
}

.swatch {
  width: 38px;
  height: 38px;
  border-width: 4px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.produit-gallery__thumbs {
  margin-top: 18px;
  padding: 12px;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  border: 1px solid var(--border);
  border-radius: 22px;
}

.thumb {
  width: 76px;
  height: 76px;
  border-radius: 16px;
  background: var(--bg-secondary);
}

.thumb--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-light), 0 12px 24px rgba(59, 130, 246, 0.16);
}

.produit-info {
  position: sticky;
  top: 92px;
  padding: clamp(22px, 3vw, 32px);
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
  border-radius: 30px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.10);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.produit-info__header {
  margin-bottom: 12px;
}

.tag-categorie {
  padding: 7px 13px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
}

.produit-info__title {
  margin-bottom: 10px;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.045em;
}

.produit-info__marque {
  margin-bottom: 18px;
}

.produit-info__divider {
  margin-bottom: 18px;
}

.produit-info__prix {
  align-items: center;
  margin-bottom: 18px;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--bg-secondary), color-mix(in srgb, var(--accent-light) 56%, var(--bg-secondary)));
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
  border-radius: 22px;
}

.prix-current {
  font-size: clamp(34px, 4vw, 48px);
  line-height: 1;
  color: var(--accent);
}

.prix-old {
  font-size: 16px;
}

.prix-save {
  padding: 6px 12px;
  font-weight: 800;
}

.achat-card {
  position: relative;
  margin-bottom: 0;
  padding: 16px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), var(--surface)),
    var(--surface);
  border: 1px solid color-mix(in srgb, var(--accent) 16%, var(--border));
  border-radius: 24px;
  box-shadow: 0 20px 46px rgba(59, 130, 246, 0.12);
}

.achat-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  border-radius: 24px 24px 0 0;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
}

.produit-info__qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.produit-info__qty .section-label {
  margin-bottom: 0;
}

.qty-selector {
  height: 48px;
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.qty-selector__btn {
  width: 48px;
  height: 48px;
}

.qty-selector__value {
  min-width: 56px;
}

.produit-info__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-cart {
  min-height: 56px;
  min-width: 0;
  padding: 16px 22px;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.035em;
  background: linear-gradient(135deg, var(--accent), #1d4ed8 56%, #8b5cf6);
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.32);
}

.btn-cart:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 24px 44px rgba(37, 99, 235, 0.40);
}

.btn-wishlist {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--bg-secondary);
}

.btn-view-cart {
  margin-bottom: 0;
  border-radius: 16px;
  background: transparent;
}

.toast {
  margin: 12px 0 0;
  border-radius: 16px;
}

.produit-details-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
  gap: 18px;
  margin-top: 36px;
  padding: 18px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 30px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.produit-details-panel .produit-info__desc,
.produit-details-panel .produit-info__perso {
  margin-bottom: 0;
  padding: 18px;
  background: linear-gradient(180deg, var(--bg-secondary), color-mix(in srgb, var(--surface) 86%, var(--bg-secondary)));
  border: 1px solid var(--border);
  border-radius: 22px;
}

.desc-text {
  font-size: 14px;
  line-height: 1.8;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
}

.perso-textarea {
  min-height: 104px;
  border-radius: 16px;
}

.produit-info__garanties {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
}

.garantie-item {
  justify-content: center;
  min-height: 54px;
  padding: 8px;
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 18px;
}

.produit-similaires {
  margin-top: 64px;
}

.similaires-title {
  font-size: clamp(24px, 3vw, 34px);
  text-align: center;
}

.similaires-grid {
  gap: 18px;
}

@media (max-width: 1023px) {
  .produit-layout {
    grid-template-columns: 1fr;
  }

  .produit-info {
    position: relative;
    top: auto;
  }

  .produit-details-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .produit-page {
    padding-top: 16px;
    padding-bottom: 110px;
  }

  .breadcrumb {
    margin-bottom: 14px;
    border-radius: 18px;
  }

  .produit-gallery::before {
    inset: -8px;
    border-radius: 24px;
  }

  .produit-gallery__main {
    border-radius: 22px;
  }

  .thumb {
    width: 58px;
    height: 58px;
    border-radius: 13px;
  }

  .produit-info {
    padding: 18px;
    border-radius: 24px;
  }

  .produit-info__title {
    font-size: 28px;
  }

  .produit-info__prix {
    padding: 12px;
  }

  .prix-current {
    font-size: 32px;
  }

  .achat-card {
    padding: 14px;
  }

  .produit-info__qty {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .qty-selector {
    width: 100%;
    justify-content: space-between;
  }

  .produit-info__actions {
    grid-template-columns: 1fr;
  }

  .btn-wishlist {
    width: 100%;
  }

  .produit-info__garanties {
    grid-template-columns: 1fr;
  }

  .produit-details-panel {
    margin-top: 24px;
    padding: 12px;
    border-radius: 22px;
  }

  .desc-text {
    -webkit-line-clamp: 6;
  }

}

/* ============================================================
   VERSION SIMPLE ET EFFICACE
   ============================================================ */
.produit-page {
  padding: 24px 0 72px;
  background: var(--bg-secondary);
}

.produit-page__container {
  max-width: 1180px;
}

.breadcrumb {
  margin-bottom: 18px;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.produit-layout {
  grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
  gap: 28px;
}

.produit-gallery::before {
  content: none;
}

.produit-gallery__main {
  border: 2px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: none;
}

.produit-gallery__main:hover .produit-gallery__main-img {
  transform: scale(1.03);
}

.produit-gallery__couleurs,
.produit-gallery__thumbs {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 16px;
  box-shadow: none;
}

.thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 2px solid var(--border);
}

.thumb--active {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.produit-info {
  position: relative;
  top: auto;
  padding: 22px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 18px;
  box-shadow: none;
  backdrop-filter: none;
}

.produit-info__title {
  font-size: clamp(26px, 3.4vw, 38px);
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.produit-heading-row {
  display: block;
}

.produit-info__prix {
  margin-bottom: 14px;
  padding: 12px 0 0;
  background: transparent;
  border: 0;
  border-top: 2px solid var(--border);
  border-radius: 0;
}

.prix-current {
  font-size: clamp(30px, 4vw, 40px);
  color: var(--text-primary);
}

.produit-info__perso {
  margin: 14px 0;
  padding: 16px;
  background: color-mix(in srgb, var(--accent-light) 58%, var(--surface));
  border: 3px solid #60a5fa;
  border-radius: 16px;
  box-shadow: none;
}

.perso-header {
  margin-bottom: 8px;
}

.perso-title {
  color: var(--accent-hover);
}

.perso-badge,
.perso-prix {
  background: var(--surface);
  border: 2px solid #93c5fd;
  color: var(--accent-hover);
}

.perso-textarea {
  min-height: 86px;
  border: 3px solid #60a5fa;
  border-radius: 12px;
  background: var(--surface);
  color: var(--text-primary);
}

.perso-textarea:focus {
  border-color: var(--accent-hover);
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.22);
}

:global(.dark) .produit-info__perso {
  background: rgba(30, 58, 95, 0.62);
  border-color: #60a5fa;
}

:global(.dark) .perso-title,
:global(.dark) .perso-info,
:global(.dark) .perso-prix,
:global(.dark) .perso-badge {
  color: #bfdbfe;
}

:global(.dark) .perso-desc,
:global(.dark) .perso-counter {
  color: #cbd5e1;
}

:global(.dark) .perso-badge,
:global(.dark) .perso-prix,
:global(.dark) .perso-textarea {
  background: #0f172a;
  border-color: #60a5fa;
}

.achat-card {
  margin-top: 14px;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.achat-card::before {
  content: none;
}

.produit-info__qty {
  margin: 10px 0 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 14px;
}

.qty-selector {
  height: 44px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 12px;
  box-shadow: none;
}

.qty-selector__btn {
  width: 44px;
  height: 44px;
}

.produit-info__actions {
  grid-template-columns: minmax(0, 1fr) 52px;
  gap: 10px;
  margin-bottom: 0;
}

.btn-cart {
  min-height: 58px;
  border-radius: 14px;
  background: #1d4ed8;
  border: 3px solid #1e40af;
  box-shadow: 0 10px 22px rgba(29, 78, 216, 0.24);
}

.btn-cart:hover:not(:disabled) {
  background: #1e40af;
  transform: none;
  box-shadow: 0 12px 26px rgba(29, 78, 216, 0.30);
}

.btn-wishlist {
  width: 52px;
  height: 52px;
  border: 2px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
}

.btn-view-cart {
  border: 2px solid var(--border);
  border-radius: 12px;
}

.produit-info__garanties {
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
}

.garantie-item {
  justify-content: flex-start;
  min-height: auto;
  padding: 10px 12px;
  text-align: left;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 12px;
}

.produit-details-panel {
  display: block;
  margin-top: 22px;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: none;
}

.produit-details-panel .produit-info__desc {
  padding: 18px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 16px;
}

.desc-text {
  display: block;
  overflow: visible;
  line-height: 1.7;
}

.produit-similaires {
  margin-top: 42px;
  padding-top: 28px;
}

.similaires-title {
  text-align: left;
  font-size: 24px;
}

@media (max-width: 1023px) {
  .produit-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .produit-page {
    padding: 16px 0 56px;
  }

  .produit-info {
    padding: 16px;
  }

  .produit-info__header {
    margin-bottom: 8px;
  }

  .produit-heading-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
  }

  .produit-info__title {
    margin: 0;
    font-size: 20px;
    line-height: 1.18;
  }

  .produit-info__prix {
    justify-content: flex-end;
    margin: 0;
    padding: 0;
    border-top: 0;
    text-align: right;
  }

  .prix-current {
    font-size: 20px;
    white-space: nowrap;
  }

  .prix-old,
  .prix-save {
    display: none;
  }

  .produit-info__marque {
    margin-top: 6px;
    margin-bottom: 10px;
  }

  .produit-info__divider {
    margin-bottom: 12px;
  }

  .produit-info__perso {
    margin: 10px 0 12px;
    padding: 13px;
    border-width: 3px;
    border-radius: 14px;
  }

  .perso-desc {
    margin-bottom: 10px;
  }

  .perso-textarea {
    min-height: 78px;
  }

  .produit-info__actions {
    grid-template-columns: minmax(0, 1fr) 52px;
  }

  .btn-wishlist {
    width: 52px;
  }

  .btn-cart {
    min-height: 56px;
  }
}
</style>