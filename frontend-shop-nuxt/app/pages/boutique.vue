<template>
  <div class="boutique">
    <div class="boutique__container">

      <!-- Header -->
      <div class="boutique__header">
        <div>
          <h1 class="boutique__title">{{ $t('boutique.title') }}</h1>
          <p class="boutique__count">{{ total }} {{ $t('boutique.available') }}</p>
        </div>

        <!-- Bouton filtre mobile -->
        <button
          class="boutique__filter-toggle"
          @click="openFilters"
          :aria-label="$t('boutique.filters')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 5H17M6 10H14M8 15H12"/>
          </svg>
          {{ $t('boutique.filters') }}
          <span v-if="activeFiltersCount > 0" class="boutique__filter-badge">{{ activeFiltersCount }}</span>
        </button>
      </div>

      <!-- FIX: État d'erreur réseau visible par l'utilisateur -->
      <div v-if="fetchError" class="error-state">
        <span class="error-state__icon" aria-hidden="true">⚠️</span>
        <h3 class="error-state__title">{{ $t('boutique.errorTitle') }}</h3>
        <p class="error-state__desc">{{ $t('boutique.errorDesc') }}</p>
        <button class="error-state__btn" @click="reloadData">{{ $t('boutique.errorBtn') }}</button>
      </div>

      <div v-else class="boutique__body">

        <!-- Overlay mobile -->
        <div
          v-if="showFilters"
          class="boutique__overlay"
          @click="closeFilters"
        ></div>

        <!-- Sidebar filtres -->
        <aside
          class="filters"
          :class="{ 'filters--open': showFilters }"
          role="complementary"
          :aria-label="$t('boutique.filters')"
        >
          <div class="filters__header">
            <h3>{{ $t('boutique.filters') }}</h3>
            <button
              class="filters__close"
              @click="closeFilters"
              :aria-label="$t('nav.close')"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M5 5L15 15M5 15L15 5"/>
              </svg>
            </button>
          </div>

          <!-- Recherche -->
          <div class="filter-block">
            <h4 class="filter-block__title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="5"/><path d="M11 11L14 14"/></svg>
              {{ $t('boutique.search') }}
            </h4>
            <div class="filter-block__search-wrap">
              <!-- FIX: v-model sur searchInput (raw), le computed debouncé est séparé -->
              <input
                v-model="searchInput"
                :placeholder="$t('boutique.searchPlaceholder')"
                class="filter-block__search"
              />
              <svg v-if="searchInput" class="filter-block__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" @click="searchInput = ''" aria-label="Effacer">
                <path d="M4 4L12 12M4 12L12 4"/>
              </svg>
            </div>
          </div>

          <!-- Catégories -->
          <div class="filter-block">
            <h4 class="filter-block__title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
              {{ $t('boutique.categories') }}
            </h4>
            <div class="filter-block__options">
              <label
                class="filter-option"
                :class="{ 'filter-option--active': catId === null }"
              >
                <input type="radio" v-model="catId" :value="null" />
                <span class="filter-option__dot"></span>
                <span>{{ $t('boutique.all') }}</span>
              </label>
              <label
                v-for="c in categories"
                :key="c.id"
                class="filter-option"
                :class="{ 'filter-option--active': catId === c.id }"
              >
                <input type="radio" v-model="catId" :value="c.id" />
                <span class="filter-option__dot"></span>
                <span>{{ c.nom }}</span>
              </label>
            </div>
          </div>

          <!-- Prix -->
          <div class="filter-block">
            <h4 class="filter-block__title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="7"/><path d="M8 2V14M2 8H14"/></svg>
              {{ $t('boutique.maxPrice') }}
            </h4>
            <div class="filter-block__range-wrap">
              <!-- FIX: .number pour forcer le cast en Number -->
              <input
                type="range"
                v-model.number="prixMax"
                :min="0"
                :max="maxPrix"
                step="500"
                class="filter-block__range"
              />
              <div class="filter-block__range-labels">
                <span>0 FCFA</span>
                <span class="filter-block__range-val">{{ Number(prixMax).toLocaleString('fr-FR') }} FCFA</span>
              </div>
            </div>
          </div>

          <!-- Reset -->
          <button class="filters__reset" @click="resetFiltres">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2V6H6"/><path d="M14 14V10H10"/><path d="M6 2C3.5 2 1.5 4 1.5 6.5M10 14C12.5 14 14.5 12 14.5 9.5"/></svg>
            {{ $t('boutique.reset') }}
          </button>
        </aside>

        <!-- Grille produits -->
        <div class="products-area">

          <div v-if="!initialLoading && produits.length > 0" class="products-area__toolbar">
            <span class="products-area__result">{{ total }} {{ $t('boutique.results') }}</span>
            <span v-if="refreshing" class="products-area__refreshing">{{ $t('boutique.loading') }}</span>
          </div>

          <!-- Skeleton -->
          <div v-if="initialLoading" class="products-grid">
            <div v-for="i in ITEMS_PER_PAGE" :key="i" class="skeleton"></div>
          </div>

          <!-- FIX: v-else-if + v-else pour éviter le double rendu -->
          <div v-else-if="produits.length === 0 && !refreshing" class="empty">
            <span class="empty__icon" aria-hidden="true">🔍</span>
            <h3 class="empty__title">{{ $t('boutique.empty') }}</h3>
            <p class="empty__desc">{{ $t('boutique.emptyDesc') }}</p>
            <button class="empty__btn" @click="resetFiltres">{{ $t('boutique.emptyBtn') }}</button>
          </div>

          <!-- v-else — s'affiche UNIQUEMENT si !loading && produits.length > 0 -->
          <template v-else>
            <TransitionGroup name="product-list" tag="div" class="products-grid" :class="{ 'products-grid--refreshing': refreshing }">
              <!-- animationDelay plafonné à 10 éléments max -->
              <div
                v-for="(p, i) in produits"
                :key="p.id"
                class="product-wrapper"
              >
                <ProduitCard :produit="p" />
              </div>
            </TransitionGroup>

            <!-- PAGINATION -->
            <div v-if="totalPages > 1" class="pagination" role="navigation" :aria-label="$t('boutique.pagination')">
              <!-- Précédent -->
              <button
                class="pagination__btn"
                :class="{ 'pagination__btn--disabled': currentPage === 1 }"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
                :aria-label="$t('boutique.prevPage')"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 3L5 8L10 13"/></svg>
              </button>

              <!-- Pages -->
              <button
                v-for="page in visiblePages"
                :key="page"
                class="pagination__btn"
                :class="{
                  'pagination__btn--active': page === currentPage,
                  'pagination__btn--ellipsis': page === '...'
                }"
                :disabled="page === '...'"
                @click="page !== '...' && goToPage(page)"
                :aria-current="page === currentPage ? 'page' : undefined"
              >
                {{ page }}
              </button>

              <!-- Suivant -->
              <button
                class="pagination__btn"
                :class="{ 'pagination__btn--disabled': currentPage === totalPages }"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
                :aria-label="$t('boutique.nextPage')"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3L11 8L6 13"/></svg>
              </button>
            </div>

            <!-- Info pagination 
            <p v-if="totalPages > 1" class="pagination__info">
              {{ $t('boutique.pageInfo', { from: pageFrom, to: pageTo, total }) }}
            </p>
            -->
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

import api from '@/services/api'
import ProduitCard from '@/components/ProduitCard.vue'
import { useSocket } from '@/composables/useSocket'
import { useShopSettingsStore } from '@/stores/shopSettings'

const ITEMS_PER_PAGE = 24

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { on, off } = useSocket()
const { t, locale } = useI18n()
const shop = useShopSettingsStore()

const produits = ref([])
const categories = ref([])
const loading = ref(true)
const refreshing = ref(false)
const hasLoadedOnce = ref(false)
const fetchError = ref(false)
const showFilters = ref(false)

const total = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)

const searchInput = ref('')
const search = ref('')
const catId = ref(null)
const maxPrix = ref(500000)
const prixMax = ref(500000)
const prixMaxUserTouched = ref(false)

const syncGuard = ref(false)
let searchTimer = null
let priceTimer = null
let produitRequestId = 0

const initialLoading = computed(() => loading.value && !hasLoadedOnce.value)

const activeFiltersCount = computed(() => {
  let count = 0
  if (searchInput.value.trim()) count++
  if (catId.value !== null) count++
  if (prixMaxUserTouched.value && Number(prixMax.value) < Number(maxPrix.value)) count++
  return count
})

const pageFrom = computed(() => {
  if (!total.value) return 0
  return (currentPage.value - 1) * ITEMS_PER_PAGE + 1
})

const pageTo = computed(() => {
  if (!total.value) return 0
  return Math.min(currentPage.value * ITEMS_PER_PAGE, total.value)
})

const visiblePages = computed(() => {
  const totalP = totalPages.value
  const cur = currentPage.value
  if (totalP <= 7) return Array.from({ length: totalP }, (_, i) => i + 1)

  const pages = []
  if (cur <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', totalP)
  } else if (cur >= totalP - 3) {
    pages.push(1, '...', totalP - 4, totalP - 3, totalP - 2, totalP - 1, totalP)
  } else {
    pages.push(1, '...', cur - 1, cur, cur + 1, '...', totalP)
  }
  return pages
})

const queryToState = (query) => {
  syncGuard.value = true
  searchInput.value = typeof query.q === 'string' ? query.q : ''
  search.value = searchInput.value.trim()

  const parsedCat = parseInt(query.cat, 10)
  catId.value = Number.isFinite(parsedCat) ? parsedCat : null

  const parsedPage = parseInt(query.page, 10)
  currentPage.value = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
}

const buildProduitParams = (page = 1) => {
  const params = { page, limit: ITEMS_PER_PAGE, actif: 1 }
  const q = search.value.trim()
  if (q) params.q = q
  if (catId.value !== null) params.categorie = catId.value
  if (prixMaxUserTouched.value) params.prix_max = Math.max(0, Number(prixMax.value) || 0)
  return params
}

const buildProduitParamsFromQuery = (query, page = 1) => {
  const params = { page, limit: ITEMS_PER_PAGE, actif: 1 }
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  if (q) params.q = q
  const parsedCat = parseInt(query.cat, 10)
  if (Number.isFinite(parsedCat)) params.categorie = parsedCat
  return params
}

const applyProduitsPayload = (data, page = 1) => {
  produits.value = data?.produits || []
  total.value = Number(data?.total || 0)
  totalPages.value = Math.max(1, Number(data?.pages || 1))
  currentPage.value = Math.min(page, totalPages.value)

  const serverMax = Number(data?.max_prix || 0)
  if (serverMax > 0) {
    syncGuard.value = true
    maxPrix.value = serverMax
    if (!prixMaxUserTouched.value || Number(prixMax.value) > serverMax) {
      prixMax.value = serverMax
    }
    syncGuard.value = false
  }
}

const skipInitialClientFetch = ref(false)

const { data: ssrData } = await useAsyncData(
  'boutique-initial',
  async () => {
    const page = (() => {
      const parsed = parseInt(route.query.page, 10)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
    })()
    const params = buildProduitParamsFromQuery(route.query, page)
    const [cats, prods] = await Promise.all([
      $fetch(`${runtimeConfig.apiBaseInternal}/categories`).catch(() => []),
      $fetch(`${runtimeConfig.apiBaseInternal}/produits`, { params }).catch(() => null),
    ])
    return { cats, prods, page }
  },
  { server: true }
)

if (ssrData.value?.prods) {
  queryToState(route.query)
  const cats = Array.isArray(ssrData.value.cats) ? ssrData.value.cats : []
  categories.value = cats.filter(c => c.actif)
  applyProduitsPayload(ssrData.value.prods, ssrData.value.page || 1)
  hasLoadedOnce.value = true
  loading.value = false
  skipInitialClientFetch.value = true
}

const loadCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    categories.value = Array.isArray(data) ? data.filter(c => c.actif) : []
  } catch {
    categories.value = []
  }
}

const loadProduits = async (page = 1) => {
  const requestId = ++produitRequestId
  const firstLoad = !hasLoadedOnce.value && produits.value.length === 0
  loading.value = firstLoad
  refreshing.value = !firstLoad
  fetchError.value = false
  try {
    const { data } = await api.get('/produits', { params: buildProduitParams(page) })
    if (requestId !== produitRequestId) return
    applyProduitsPayload(data, page)

    if (page > totalPages.value) {
      await loadProduits(totalPages.value)
      return
    }
  } catch (error) {
    if (requestId !== produitRequestId) return
    console.error('Erreur de chargement:', error)
    produits.value = []
    total.value = 0
    totalPages.value = 1
    fetchError.value = true
  } finally {
    if (requestId === produitRequestId) {
      loading.value = false
      refreshing.value = false
      hasLoadedOnce.value = true
    }
  }
}

async function reloadData() {
  await loadProduits(currentPage.value || 1)
}

useHead(computed(() => ({
  title: locale.value === 'en'
    ? `Shop - ${shop.settings.shop_name}`
    : `Boutique - ${shop.settings.shop_name}`,
  meta: [
    {
      name: 'description',
      content: locale.value === 'en' ? shop.settings.meta_description_en : shop.settings.meta_description_fr
    },
    { property: 'og:title', content: locale.value === 'en' ? `Shop - ${shop.settings.shop_name}` : `Boutique - ${shop.settings.shop_name}` },
    { property: 'og:description', content: locale.value === 'en' ? shop.settings.meta_description_en : shop.settings.meta_description_fr },
    { property: 'og:url', content: `${String(shop.settings.site_url || '').replace(/\/$/, '')}/boutique` },
    { property: 'og:type', content: 'website' },
  ]
})))

watch(
  () => route.query,
  async () => {
    queryToState(route.query)
    await nextTick()
    syncGuard.value = false
    if (skipInitialClientFetch.value) {
      skipInitialClientFetch.value = false
      return
    }
    if (!import.meta.client && ssrData.value?.prods) return
    await loadProduits(currentPage.value || 1)
  },
  { immediate: true }
)

onMounted(() => {
  if (!categories.value.length) loadCategories()
})

watch(searchInput, (val) => {
  if (syncGuard.value) return
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = val.trim()
  }, 300)
})

watch(search, async () => {
  if (syncGuard.value) return
  await loadProduits(1)
})

watch(catId, async () => {
  if (syncGuard.value) return
  await loadProduits(1)
  if (import.meta.client && window.innerWidth < 900) closeFilters()
})

watch(prixMax, () => {
  if (syncGuard.value) return
  if (Number(prixMax.value) < Number(maxPrix.value)) prixMaxUserTouched.value = true
  clearTimeout(priceTimer)
  priceTimer = setTimeout(async () => {
    await loadProduits(1)
  }, 250)
})

watch(totalPages, async (newTotal) => {
  if (currentPage.value > newTotal) {
    await loadProduits(newTotal)
  }
})

const handleProduitAdded = async () => {
  if (currentPage.value !== 1) return
  if (activeFiltersCount.value > 0) return
  await loadProduits(1)
}
on('produit:added', handleProduitAdded)

onUnmounted(() => {
  off('produit:added', handleProduitAdded)
  document.body.style.overflow = ''
  clearTimeout(searchTimer)
  clearTimeout(priceTimer)
})

function goToPage(page) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  loadProduits(page)
  nextTick(() => {
    document.querySelector('.products-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function resetFiltres() {
  syncGuard.value = true
  searchInput.value = ''
  search.value = ''
  catId.value = null
  prixMaxUserTouched.value = false
  prixMax.value = maxPrix.value
  syncGuard.value = false
  loadProduits(1)
}

function openFilters() {
  showFilters.value = true
  document.body.style.overflow = 'hidden'
}

function closeFilters() {
  showFilters.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
/* ============================================
   VARIABLES LOCALES
   ============================================ */
.boutique {
  --navbar-h: 64px; /* FIX: variable centralisée, facile à modifier */
}

/* ============================================
   LAYOUT
   ============================================ */
.boutique {
  padding: 40px 0 80px;
  min-height: 60vh;
  background: var(--bg-primary);
  transition: background 0.3s ease;
  width: 100%;
}

@media (min-width: 768px) {
  .boutique { padding: 56px 0 100px; }
}

.boutique__container {
  width: 100%;
  margin: 0;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .boutique__container { padding: 0 24px; }
}

/* ============================================
   HEADER
   ============================================ */
.boutique__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.boutique__title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .boutique__title { font-size: 36px; }
}

.boutique__count {
  color: var(--text-muted);
  margin-top: 4px;
  font-size: 14px;
}

.boutique__filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.boutique__filter-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.boutique__filter-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 900px) {
  .boutique__filter-toggle { display: none; }
}

/* ============================================
   ÉTAT D'ERREUR (FIX: nouveau)
   ============================================ */
.error-state {
  text-align: center;
  padding: 80px 24px;
}

.error-state__icon { font-size: 56px; display: block; margin-bottom: 16px; }
.error-state__title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.error-state__desc { color: var(--text-muted); margin-bottom: 24px; font-size: 14px; }
.error-state__btn {
  padding: 12px 24px;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.error-state__btn:hover { opacity: 0.9; }

/* ============================================
   BODY
   ============================================ */
.boutique__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  position: relative;
}

@media (min-width: 900px) {
  .boutique__body {
    grid-template-columns: 260px 1fr;
    gap: 24px;
  }
}

.boutique__overlay {
  display: none;
}

@media (max-width: 899px) {
  .boutique__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    backdrop-filter: blur(2px);
  }
}

/* ============================================
   FILTRES
   ============================================ */
.filters {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  position: static;
  transition: transform 0.3s ease;
}

@media (max-width: 899px) {
  .filters {
    position: fixed;
    /* FIX: utilise la variable --navbar-h au lieu de 64px hardcodé */
    top: var(--navbar-h);
    left: 0;
    bottom: 0;
    width: 320px;
    max-width: 85vw;
    z-index: 60;
    border-radius: 0 16px 16px 0;
    transform: translateX(-100%);
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .filters--open { transform: translateX(0); }
}

@media (min-width: 900px) {
  /* FIX: utilise la variable --navbar-h */
  .filters { position: sticky; top: calc(var(--navbar-h) + 24px); }
}

.filters__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.filters__header h3 { font-size: 18px; font-weight: 700; color: var(--text-primary); }

.filters__close {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: var(--bg-secondary); color: var(--text-secondary);
  cursor: pointer; transition: all 0.2s ease;
}

.filters__close:hover { background: var(--border); color: var(--text-primary); }

@media (min-width: 900px) {
  .filters__header, .filters__close { display: none; }
}

.filter-block {
  margin-bottom: 24px; padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.filter-block:last-of-type { border-bottom: none; margin-bottom: 20px; padding-bottom: 0; }

.filter-block__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 14px;
}

.filter-block__search-wrap { position: relative; }

.filter-block__search {
  width: 100%; padding: 11px 36px 11px 14px;
  border: 2px solid var(--border); border-radius: 12px;
  font-size: 14px; background: var(--input-bg); color: var(--text-primary);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.filter-block__search:focus {
  border-color: var(--accent); outline: none;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.filter-block__search::placeholder { color: var(--text-muted); }

.filter-block__search-icon {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%); cursor: pointer;
  color: var(--text-muted); transition: color 0.2s;
}

.filter-block__search-icon:hover { color: var(--text-primary); }

.filter-block__options {
  display: flex; flex-direction: column; gap: 2px;
  max-height: 200px; overflow-y: auto;
}

.filter-option {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; cursor: pointer;
  font-size: 14px; color: var(--text-secondary); transition: all 0.2s ease;
}

.filter-option:hover { background: var(--bg-secondary); color: var(--text-primary); }
.filter-option--active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.filter-option input[type="radio"] { display: none; }

.filter-option__dot {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--border); display: flex;
  align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.2s ease;
}

.filter-option__dot::after {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); transform: scale(0); transition: transform 0.2s ease;
}

.filter-option--active .filter-option__dot { border-color: var(--accent); }
.filter-option--active .filter-option__dot::after { transform: scale(1); }

.filter-block__range-wrap { padding: 0 2px; }
.filter-block__range { width: 100%; accent-color: var(--accent); margin-bottom: 8px; cursor: pointer; }

.filter-block__range-labels {
  display: flex; justify-content: space-between;
  font-size: 11px; color: var(--text-muted);
}

.filter-block__range-val { font-weight: 700; color: var(--accent); font-size: 12px; }

.filters__reset {
  width: 100%; padding: 12px;
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: 12px; font-size: 13px; font-weight: 600;
  color: var(--text-secondary); cursor: pointer;
  transition: all 0.2s ease; display: flex;
  align-items: center; justify-content: center; gap: 8px;
}

.filters__reset:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

/* ============================================
   PRODUCTS AREA
   ============================================ */
.products-area__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.products-area__result { font-size: 13px; color: var(--text-muted); }
.products-area__refreshing {
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
}

/* ============================================
   GRID
   ============================================ */
.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  align-items: stretch;
}

.products-grid--refreshing {
  opacity: 0.72;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

@media (min-width: 500px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
}

@media (min-width: 768px) {
  .products-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
}

@media (min-width: 1024px) {
  .products-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
}

@media (min-width: 1280px) {
  .products-grid { grid-template-columns: repeat(5, 1fr); gap: 12px; }
}

@media (min-width: 1600px) {
  .products-grid { grid-template-columns: repeat(6, 1fr); gap: 12px; }
}

@media (min-width: 1920px) {
  .products-grid { grid-template-columns: repeat(7, 1fr); gap: 14px; }
}

/* ============================================
   PRODUCT CARD
   ============================================ */
.product-wrapper {
  height: 100%;
}

:deep(.prod-card) {
  height: 100%; display: flex; flex-direction: column;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.prod-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  border-color: var(--accent);
}

:deep(.prod-img-wrap) { aspect-ratio: 1/1; background: var(--bg-secondary); overflow: hidden; }
:deep(.prod-img) { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
:deep(.prod-card:hover .prod-img) { transform: scale(1.04); }

:deep(.prod-info) { flex: 1; display: flex; flex-direction: column; padding: 10px 10px 6px; }
:deep(.prod-cat) { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 6px; opacity: 0.8; }
:deep(.prod-prix-wrap) { margin-bottom: 8px; }
:deep(.prod-prix) { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
:deep(.prod-prix-actuel) { font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
:deep(.prod-prix-ancien) { font-size: 12px; color: var(--text-muted); text-decoration: line-through; font-weight: 400; }
:deep(.prod-prix-reduction) { font-size: 10px; font-weight: 600; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; }
:deep(.prod-nom) { font-size: 13px; font-weight: 500; color: var(--text-primary); line-height: 1.4; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
:deep(.prod-marque) { font-size: 11px; color: var(--text-muted); font-weight: 400; margin-bottom: auto; opacity: 0.7; }

:deep(.prod-footer) { padding: 8px 10px 10px; margin-top: auto; display: flex; justify-content: center; }
:deep(.btn-add) {
  width: 90%; background: var(--accent); color: #fff;
  padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
  border: none; cursor: pointer; transition: all 0.2s ease;
  text-align: center; letter-spacing: 0.02em; white-space: nowrap;
}
:deep(.btn-add:hover) { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.2); }
:deep(.btn-add:active) { transform: translateY(0); }
:deep(.btn-cart-quick) { display: none; }

/* ============================================
   PAGINATION (nouveau)
   ============================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.pagination__btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 36px; height: 36px; padding: 0 8px;
  border: 1px solid var(--border); border-radius: 8px;
  background: var(--surface); color: var(--text-primary);
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease;
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}

.pagination__btn--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 700;
}

.pagination__btn--active:hover {
  background: var(--accent);
  color: #fff;
}

.pagination__btn--disabled,
.pagination__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination__btn--ellipsis {
  cursor: default;
  border-color: transparent;
  background: transparent;
}

.pagination__info {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty {
  text-align: center;
  padding: 80px 24px;
  grid-column: 1 / -1;
}

.empty__icon { font-size: 56px; display: block; margin-bottom: 16px; }
.empty__title { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.empty__desc { color: var(--text-muted); margin-bottom: 24px; font-size: 14px; }
.empty__btn {
  padding: 12px 24px; background: var(--surface); border: 2px solid var(--border);
  border-radius: 12px; font-size: 14px; font-weight: 600; color: var(--text-primary);
  cursor: pointer; transition: all 0.2s ease;
}
.empty__btn:hover { border-color: var(--accent); color: var(--accent); }

/* ============================================
   SKELETON
   ============================================ */
.skeleton {
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 10px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================================
   TRANSITIONS
   ============================================ */
.product-list-enter-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.product-list-leave-active { transition: all 0.3s ease; }
.product-list-enter-from  { opacity: 0; transform: translateY(16px) scale(0.95); }
.product-list-leave-to    { opacity: 0; transform: scale(0.9); }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 899px) {
  .boutique__header {
    position: sticky;
    /* FIX: utilise la variable au lieu de 64px hardcodé */
    top: var(--navbar-h);
    z-index: 30;
    background: var(--bg-primary);
    padding: 12px 0;
    margin-bottom: 16px;
  }
}

@media (max-width: 640px) {
  .products-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
  :deep(.btn-add) { width: 92%; }
  .pagination__btn { min-width: 32px; height: 32px; font-size: 13px; }
}

@media (max-width: 380px) {
  .products-grid { grid-template-columns: 1fr; max-width: 320px; margin: 0 auto; }
  :deep(.btn-add) { width: 90%; }
}

@media (max-width: 480px) {
  .boutique { padding: 24px 0 60px; }
  .boutique__title { font-size: 24px; }
  .boutique__filter-toggle { padding: 8px 14px; font-size: 13px; }
  .empty { padding: 48px 16px; }
  .empty__icon { font-size: 40px; }
}
</style>
