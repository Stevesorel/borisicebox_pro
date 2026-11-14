<template>
  <div class="home">

    <!-- ========================================== -->
    <!-- HERO                                       -->
    <!-- ========================================== -->
    <section class="hero">
      <div class="hero__image">
        <img
          :src="currentHeroImage"
          :alt="homeText('hero_titre_2')"
          fetchpriority="high"
          decoding="async"
          width="1920"
          height="1080"
          @error="handleImageError"
        />
      </div>
      <div class="hero__overlay"></div>

      <div class="hero__container">

        <!-- Colonne gauche : texte -->
        <div class="hero__content">
          <span class="hero__badge">{{ homeText('hero_badge') }}</span>
          <h1 class="hero__title">
            {{ homeText('hero_titre_1') }}<br>
            {{ homeText('hero_titre_2') }}<br>
            <em>{{ homeText('hero_titre_em') }}</em>
          </h1>
          <p class="hero__desc">{{ homeText('hero_desc') }}</p>
          <p class="hero__desc hero__desc--promo"><strong>{{ homeText('hero_promo') }}</strong></p>
          <div class="hero__actions">
            <NuxtLinkLocale to="/boutique" class="hero__btn hero__btn--primary">
              {{ $t('hero.cta') }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4L11 8L6 12"/></svg>
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/panier" class="hero__btn hero__btn--outline">
              <span aria-hidden="true">🛒</span>
              {{ $t('hero.cart') }}
            </NuxtLinkLocale>
          </div>
        </div>

        <!-- Colonne droite : carrousel produits (sens droite) -->
        <div class="hero__visual">
          <div
            v-if="loopedHeroProducts.length"
            class="hero__products"
          >
            <div class="hero__products-header">
              <span class="hero__products-dot" aria-hidden="true"></span>
              <strong>{{ $t('hero.cardTitle') }}</strong>
              <span v-if="produits.length" class="hero__products-count">
                {{ produits.length }} {{ $t('boutique.available') }}
              </span>
            </div>

            <div
              class="hero__products-carousel"
              @mouseenter="pauseHeroProducts = true"
              @mouseleave="pauseHeroProducts = false"
              @focusin="pauseHeroProducts = true"
              @focusout="pauseHeroProducts = false"
            >
              <div
                class="hero__products-track"
                :class="{ 'is-paused': pauseHeroProducts }"
                :style="{ animationDuration: heroProductsTrackDuration }"
              >
                <div
                  v-for="(p, index) in loopedHeroProducts"
                  :key="`hero-prod-${p.id}-${index}`"
                  class="hero__products-item"
                  :aria-hidden="index >= heroPopupBase.length ? 'true' : undefined"
                >
                  <ProduitCard :produit="p" />
                </div>
              </div>
            </div>

            <div class="hero__products-footer">
              <NuxtLinkLocale to="/boutique" class="hero__products-link">
                {{ $t('home.seeAll') }}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 2L8 6L4 10"/></svg>
              </NuxtLinkLocale>
            </div>
          </div>

          <!-- Skeleton pendant le chargement -->
          <div v-else class="hero__products hero__products--loading">
            <div class="hero__products-header">
              <span class="hero__products-dot" aria-hidden="true"></span>
              <strong>{{ $t('hero.cardTitle') }}</strong>
            </div>
            <div class="hero__products-carousel">
              <div class="hero__products-track">
                <div v-for="i in 4" :key="i" class="hero__products-item hero__products-item--skeleton">
                  <div class="hero-skeleton__img"></div>
                  <div class="hero-skeleton__body">
                    <div class="hero-skeleton__line hero-skeleton__line--short"></div>
                    <div class="hero-skeleton__line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Dots navigation -->
      <div v-if="heroImages.length > 1" class="hero__dots" :aria-label="$t('carousel.nav')">
        <button
          v-for="(_, index) in heroImages"
          :key="index"
          type="button"
          :class="{ 'is-active': index === activeHeroIndex }"
          :aria-label="$t('carousel.goTo', { n: index + 1 })"
          @click="activeHeroIndex = index"
        ></button>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- ANNONCES & ÉVÉNEMENTS (sens <--)           -->
    <!-- ========================================== -->
    <section v-if="marketingItems.length" class="marketing-strip">
      <div v-if="marketingItems.length === 1" class="marketing-strip__single">
        <article class="marketing-card" :class="`marketing-card--${marketingItems[0].type}`">
          <div class="marketing-card__icon" aria-hidden="true">
            {{ marketingItems[0].type === 'evenement' ? '🎉' : '📣' }}
          </div>
          <div class="marketing-card__body">
            <span class="marketing-card__badge">{{ marketingText(marketingItems[0], 'badge') || (marketingItems[0].type === 'evenement' ? 'Event' : 'Info') }}</span>
            <h2>{{ marketingText(marketingItems[0], 'titre') }}</h2>
            <p v-if="marketingText(marketingItems[0], 'contenu')">{{ marketingText(marketingItems[0], 'contenu') }}</p>
          </div>
          <NuxtLinkLocale v-if="marketingItems[0].lien" :to="marketingItems[0].lien" class="marketing-card__link">
            {{ $t('home.learnMore') }}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8H13M9 4L13 8L9 12"/></svg>
          </NuxtLinkLocale>
        </article>
      </div>

      <div
        v-else
        class="marketing-strip__carousel"
        @mouseenter="pauseMarketing = true"
        @mouseleave="pauseMarketing = false"
        @focusin="pauseMarketing = true"
        @focusout="pauseMarketing = false"
      >
        <div
          class="marketing-strip__track"
          :class="{ 'is-paused': pauseMarketing }"
          :style="{ animationDuration: marketingTrackDuration }"
        >
          <article
            v-for="(item, index) in loopedMarketing"
            :key="`${item.id}-${index}`"
            class="marketing-card"
            :class="`marketing-card--${item.type}`"
            :aria-hidden="index >= marketingBase.length ? 'true' : undefined"
          >
            <div class="marketing-card__icon" aria-hidden="true">
              {{ item.type === 'evenement' ? '🎉' : '📣' }}
            </div>
            <div class="marketing-card__body">
              <span class="marketing-card__badge">{{ marketingText(item, 'badge') || (item.type === 'evenement' ? 'Event' : 'Info') }}</span>
              <h2>{{ marketingText(item, 'titre') }}</h2>
              <p v-if="marketingText(item, 'contenu')">{{ marketingText(item, 'contenu') }}</p>
            </div>
            <NuxtLinkLocale v-if="item.lien" :to="item.lien" class="marketing-card__link">
              {{ $t('home.learnMore') }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8H13M9 4L13 8L9 12"/></svg>
            </NuxtLinkLocale>
          </article>
        </div>
      </div>
    </section>

    <!-- Offre flottante -->
    <Transition name="floating-offer">
      <aside
        v-if="floatingOfferVisible && featuredMarketing"
        class="floating-offer"
        :class="`floating-offer--${featuredMarketing.type}`"
        aria-live="polite"
        :aria-label="marketingText(featuredMarketing, 'titre')"
      >
        <button class="floating-offer__close" type="button" :aria-label="$t('nav.close')" @click="closeFloatingOffer">✕</button>
        <div class="floating-offer__icon" aria-hidden="true">
          {{ featuredMarketing.type === 'evenement' ? '🎉' : '📣' }}
        </div>
        <div class="floating-offer__content">
          <span class="floating-offer__badge">{{ marketingText(featuredMarketing, 'badge') || (featuredMarketing.type === 'evenement' ? 'Event' : 'Info') }}</span>
          <h2>{{ marketingText(featuredMarketing, 'titre') }}</h2>
          <p v-if="marketingText(featuredMarketing, 'contenu')">{{ marketingText(featuredMarketing, 'contenu') }}</p>
          <NuxtLinkLocale v-if="featuredMarketing.lien" :to="featuredMarketing.lien" class="floating-offer__link" @click="closeFloatingOffer">
            {{ $t('home.learnMore') }}
          </NuxtLinkLocale>
        </div>
      </aside>
    </Transition>

    <!-- ========================================== -->
    <!-- CATÉGORIES (sens droite)                      -->
    <!-- ========================================== -->
    <section class="section section--categories">
      <div class="section__bg section__bg--categories"></div>
      <div class="section__overlay"></div>
      <div class="section__container">
        <div class="section__header">
          <h2 class="section__title">{{ $t('home.categories') }}</h2>
          <NuxtLinkLocale to="/boutique" class="section__link">
            {{ $t('home.seeAll') }}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 3L9 7L5 11"/></svg>
          </NuxtLinkLocale>
        </div>
        <div v-if="loadingCats" class="categories-skeletons">
          <div v-for="i in 6" :key="i" class="skeleton skeleton--cat"></div>
        </div>
        <div
          v-else-if="categories.length"
          class="categories-carousel"
          @mouseenter="pauseCategories = true"
          @mouseleave="pauseCategories = false"
          @focusin="pauseCategories = true"
          @focusout="pauseCategories = false"
        >
          <div
            class="categories-track"
            :class="{ 'is-paused': pauseCategories }"
            :style="{ animationDuration: categoriesTrackDuration }"
          >
            <NuxtLinkLocale
              v-for="(cat, index) in loopedCategories"
              :key="`${cat.id}-${index}`"
              :to="{ path: '/boutique', query: { cat: cat.id } }"
              class="category-card"
              :aria-hidden="index >= categoriesBase.length ? 'true' : undefined"
              :tabindex="index >= categoriesBase.length ? -1 : undefined"
            >
              <span class="category-card__icon" aria-hidden="true">🏷️</span>
              <span class="category-card__name">{{ cat.nom }}</span>
            </NuxtLinkLocale>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- NOUVEAUTÉS (sens <--)                      -->
    <!-- ========================================== -->
    <section class="nouveautes">
      <div class="nouveautes__bg">
        <div class="nouveautes__bg-gradient"></div>
        <div class="nouveautes__bg-pattern"></div>
      </div>

      <ClientOnly>
        <div v-if="showParticles" class="nouveautes__particles" aria-hidden="true">
          <span v-for="particle in particles" :key="particle.id" class="nouveautes__particle" :style="particle.style"></span>
        </div>
      </ClientOnly>

      <div class="nouveautes__container">
        <div class="nouveautes__header">
          <div class="nouveautes__header-top">
            <span class="nouveautes__badge">
              <span class="nouveautes__badge-dot"></span>
              ✨ {{ $t('home.news') }}
            </span>
            <span v-if="!loadingProds && produits.length" class="nouveautes__count">
              {{ produits.length }} {{ $t('boutique.available') }}
            </span>
          </div>
          <h2 class="nouveautes__title">
            {{ homeText('nouveautes_titre') }}<br>
            <span class="nouveautes__title-highlight">{{ homeText('nouveautes_em') }}</span>
          </h2>
          <p class="nouveautes__desc">{{ homeText('nouveautes_desc') }}</p>
          <NuxtLinkLocale to="/boutique" class="nouveautes__link">
            <span>{{ $t('home.seeAllNews') }}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9H15M11 5L15 9L11 13"/></svg>
          </NuxtLinkLocale>
        </div>

        <div v-if="loadingProds" class="nouveautes__track-wrap">
          <div class="nouveautes__track">
            <div v-for="i in 5" :key="i" class="nouveautes__item">
              <div class="nouveautes__skeleton">
                <div class="nouveautes__skeleton-img"></div>
                <div class="nouveautes__skeleton-body">
                  <div class="nouveautes__skeleton-line nouveautes__skeleton-line--short"></div>
                  <div class="nouveautes__skeleton-line"></div>
                  <div class="nouveautes__skeleton-line nouveautes__skeleton-line--medium"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="produits.length"
          class="nouveautes__carousel"
          @mouseenter="pauseProducts = true"
          @mouseleave="pauseProducts = false"
          @focusin="pauseProducts = true"
          @focusout="pauseProducts = false"
        >
          <div
            class="nouveautes__track"
            :class="{ 'is-paused': pauseProducts }"
            :style="{ animationDuration: productsTrackDuration }"
          >
            <div
              v-for="(p, index) in loopedProduits"
              :key="`${p.id}-${index}`"
              class="nouveautes__item"
              :aria-hidden="index >= productsBase.length ? 'true' : undefined"
            >
              <span class="nouveautes__item-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 0L6 3.5L9.5 4.5L6 5.5L5 9L4 5.5L0.5 4.5L4 3.5Z"/></svg>
                {{ $t('product.new') }}
              </span>
              <ProduitCard :produit="p" />
            </div>
          </div>
        </div>

        <div v-else class="nouveautes__empty">
          <div class="nouveautes__empty-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="6" y="6" width="36" height="36" rx="6"/><path d="M15 21L21 27L33 15"/></svg>
          </div>
          <h3 class="nouveautes__empty-title">{{ $t('home.noNewsTitle') }}</h3>
          <p class="nouveautes__empty-desc">{{ $t('home.noNewsDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- AVANTAGES                                  -->
    <!-- ========================================== -->
    <section class="section section--features">
      <div class="section__bg section__bg--features"></div>
      <div class="section__overlay"></div>
      <div class="section__container">
        <div class="section__header section__header--centered">
          <span class="section__badge">💎 {{ $t('home.whyChooseUs') }}</span>
          <h2 class="section__title section__title--large">{{ $t('home.excellenceTitle') }}</h2>
        </div>
        <div class="features-grid">
          <article v-for="i in 4" :key="i" class="feature">
            <div class="feature__icon-wrap">
              <div class="feature__icon-circle"></div>
              <span class="feature__icon" aria-hidden="true">{{ homeText(`avantage_${i}_icon`) }}</span>
            </div>
            <div class="feature__content">
              <h3 class="feature__title">{{ homeText(`avantage_${i}_titre`) }}</h3>
              <p class="feature__desc">{{ homeText(`avantage_${i}_desc`) }}</p>
            </div>
            <div class="feature__hover-line"></div>
          </article>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api, { imgUrl } from '@/services/api'
import ProduitCard from '@/components/ProduitCard.vue'
import { useSocket } from '@/composables/useSocket'
import { useShopSettingsStore } from '@/stores/shopSettings'

const { on, off } = useSocket()
const { t, locale } = useI18n()
const shop = useShopSettingsStore()
const showParticles = ref(false)

// ============================================
// DONNÉES
// ============================================
const categories      = ref([])
const produits        = ref([])
const carousel        = ref([])
const marketingItems  = ref([])
const floatingOfferVisible = ref(false)
const floatingOfferTimer   = ref(null)
const loadingCats     = ref(true)
const loadingProds    = ref(true)
const pageConfigLoaded = ref(false)
const activeHeroIndex  = ref(0)
const heroTimer        = ref(null)

const config = ref({
  hero_badge:       `🚚 ${t('home.defaults.heroBadge')}`,
  hero_titre_1:     t('home.defaults.heroTitle1'),
  hero_titre_2:     t('home.defaults.heroTitle2'),
  hero_titre_em:    t('home.defaults.heroTitleEm'),
  hero_desc:        t('home.defaults.heroDesc'),
  hero_promo:       `🎉 ${t('home.defaults.heroPromo')}`,
  nouveautes_titre: t('home.defaults.newsTitle'),
  nouveautes_em:    t('home.defaults.newsEm'),
  nouveautes_desc:  t('home.defaults.newsDesc'),
  avantage_1_icon: '🚚', avantage_1_titre: t('home.defaults.deliveryTitle'), avantage_1_desc: t('home.defaults.deliveryDesc'),
  avantage_2_icon: '✅', avantage_2_titre: t('home.defaults.qualityTitle'),  avantage_2_desc: t('home.defaults.qualityDesc'),
  avantage_3_icon: '🔒', avantage_3_titre: t('home.defaults.paymentTitle'), avantage_3_desc: t('home.defaults.paymentDesc'),
  avantage_4_icon: '💬', avantage_4_titre: t('home.defaults.supportTitle'), avantage_4_desc: t('home.defaults.supportDesc'),
})

const particles = [
  { id: 1, style: { left: '12%', animationDelay: '0.4s', animationDuration: '9s'  } },
  { id: 2, style: { left: '38%', animationDelay: '2.1s', animationDuration: '11s' } },
  { id: 3, style: { left: '62%', animationDelay: '1.2s', animationDuration: '10s' } },
  { id: 4, style: { left: '86%', animationDelay: '3.4s', animationDuration: '9s'  } },
]

// ============================================
// CARROUSELS
// ============================================
const pauseProducts     = ref(false)
const pauseMarketing    = ref(false)
const pauseCategories   = ref(false)
const pauseHeroProducts = ref(false)

const fillToMinimum = (arr, min) => {
  if (!arr.length) return []
  const out = []
  while (out.length < min) out.push(...arr)
  return out.slice(0, Math.max(arr.length, min))
}

// Fisher-Yates : un vrai mélange, sans biais (contrairement à sort(() => Math.random()-0.5))
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Nouveautés (carrousel #4 — sens <--)
const productsBase       = computed(() => fillToMinimum(produits.value, 6))
const loopedProduits     = computed(() => [...productsBase.value, ...productsBase.value])
const productsTrackDuration = computed(() => `${Math.max(productsBase.value.length * 4, 24)}s`)

// Marketing (carrousel #2 — sens <--)
const marketingBase      = computed(() => fillToMinimum(marketingItems.value, 4))
const loopedMarketing    = computed(() => [...marketingBase.value, ...marketingBase.value])
const marketingTrackDuration = computed(() => `${Math.max(marketingBase.value.length * 5, 20)}s`)

// Catégories (carrousel #3 — sens -->)
const categoriesBase     = computed(() => fillToMinimum(categories.value, 6))
const loopedCategories   = computed(() => [...categoriesBase.value, ...categoriesBase.value])
const categoriesTrackDuration = computed(() => `${Math.max(categoriesBase.value.length * 3, 16)}s`)

// Hero produits (carrousel #1 — sens -->)
const heroRandomProducts = computed(() => {
  if (!produits.value.length) return []
  return shuffle(produits.value).slice(0, 8)
})
const heroPopupBase      = computed(() => fillToMinimum(heroRandomProducts.value, 4))
const loopedHeroProducts = computed(() => [...heroPopupBase.value, ...heroPopupBase.value])
const heroProductsTrackDuration = computed(() => `${Math.max(heroPopupBase.value.length * 3.5, 18)}s`)

// ============================================
// HELPERS i18n
// ============================================
const homeText = (key) => {
  const lk = locale.value === 'en' ? `${key}_en` : key
  return config.value[lk] || config.value[key] || ''
}
const marketingText = (item, field) => {
  const s = locale.value === 'en' ? 'en' : 'fr'
  return item?.[`${field}_${s}`] || item?.[`${field}_fr`] || ''
}
const featuredMarketing = computed(() => marketingItems.value[0] || null)

const maybeShowFloatingOffer = () => {
  if (!import.meta.client || !featuredMarketing.value) return
  const key = `floating-offer-closed-${featuredMarketing.value.id}`
  if (sessionStorage.getItem(key) === '1') return
  if (floatingOfferTimer.value) clearTimeout(floatingOfferTimer.value)
  floatingOfferTimer.value = setTimeout(() => { floatingOfferVisible.value = true }, 1800)
}
const closeFloatingOffer = () => {
  floatingOfferVisible.value = false
  if (import.meta.client && featuredMarketing.value)
    sessionStorage.setItem(`floating-offer-closed-${featuredMarketing.value.id}`, '1')
}

// ============================================
// IMAGES HERO
// ============================================
const heroImages = computed(() => {
  const urls = carousel.value
    .filter(img => img?.url)
    .sort((a, b) => Number(a.ordre ?? 0) - Number(b.ordre ?? 0) || Number(a.id) - Number(b.id))
    .map(img => imgUrl(img.url))
  return urls.length ? urls : ['/hero.webp']
})
const currentHeroImage = computed(() => heroImages.value[activeHeroIndex.value] || '/hero.webp')
const handleImageError = (e) => {
  if (!e?.target?.src?.endsWith('/hero.webp')) e.target.src = '/hero.webp'
}

// ============================================
// NORMALISATION DES DONNÉES
// Utilisé à la fois par le SSR et le fallback client : une seule source de
// vérité pour éviter que les deux chemins de chargement divergent.
// ============================================
const applyCategories = (raw) => {
  const list = Array.isArray(raw) ? raw : (raw?.data || [])
  categories.value = list.filter(c => c.actif).slice(0, 8)
}
const applyProduits = (raw) => {
  produits.value = raw?.produits || raw?.data?.produits || []
}
const applyPageConfig = (raw) => {
  if (!raw?.config) return
  config.value = { ...config.value, ...raw.config }
  carousel.value = Array.isArray(raw.carousel) ? raw.carousel : []
  pageConfigLoaded.value = true
}
const applyMarketing = (raw) => {
  marketingItems.value = Array.isArray(raw) ? raw : []
  maybeShowFloatingOffer()
}

// ============================================
// WEBSOCKETS
// ============================================
const handleProduitAdded = (p) => {
  if (!p?.actif || produits.value.find(x => x.id === p.id)) return
  produits.value.unshift(p)
  if (produits.value.length > 12) produits.value = produits.value.slice(0, 12)
}
const loadMarketing = async () => {
  try {
    const { data } = await api.get('/marketing/public')
    applyMarketing(data)
  } catch (e) { console.error('Marketing:', e) }
}
on('produit:added', handleProduitAdded)
on('marketing:updated', loadMarketing)
onUnmounted(() => {
  off('produit:added', handleProduitAdded)
  off('marketing:updated', loadMarketing)
})

// ============================================
// CHARGEMENT CLIENT (fallback si pas de données SSR)
// ============================================
const loadData = async () => {
  const [cats, prods, page, mkt] = await Promise.allSettled([
    api.get('/categories'),
    api.get('/produits', { params: { actif: 1, page: 1, limit: 12 } }),
    api.get('/page-accueil'),
    api.get('/marketing/public'),
  ])
  if (cats.status  === 'fulfilled') applyCategories(cats.value.data)
  if (prods.status === 'fulfilled') applyProduits(prods.value.data)
  if (page.status  === 'fulfilled') applyPageConfig(page.value.data)
  if (mkt.status   === 'fulfilled') applyMarketing(mkt.value.data)
  loadingCats.value  = false
  loadingProds.value = false
}

// ============================================
// CHARGEMENT SSR
// ============================================
const { data: ssrData } = await useAsyncData('index', async () => {
  const rc = useRuntimeConfig()
  const [cats, prods, pageConfig, marketing] = await Promise.all([
    $fetch(`${rc.apiBaseInternal}/categories`).catch(() => null),
    $fetch(`${rc.apiBaseInternal}/produits?actif=1&page=1&limit=12`).catch(() => null),
    $fetch(`${rc.apiBaseInternal}/page-accueil`).catch(() => null),
    $fetch(`${rc.apiBaseInternal}/marketing/public`).catch(() => null),
  ])
  return { cats, prods, pageConfig, marketing }
})
if (ssrData.value) {
  applyCategories(ssrData.value.cats)
  applyProduits(ssrData.value.prods)
  applyPageConfig(ssrData.value.pageConfig)
  applyMarketing(ssrData.value.marketing)
  loadingCats.value  = false
  loadingProds.value = false
}

// SEO
useHead(computed(() => ({
  title: locale.value === 'en' ? shop.settings.meta_title_en : shop.settings.meta_title_fr,
  link: currentHeroImage.value ? [{ rel: 'preload', as: 'image', href: currentHeroImage.value, fetchpriority: 'high' }] : [],
  meta: [
    { name: 'description', content: locale.value === 'en' ? shop.settings.meta_description_en : shop.settings.meta_description_fr },
    { property: 'og:title', content: locale.value === 'en' ? shop.settings.meta_title_en : shop.settings.meta_title_fr },
    { property: 'og:description', content: locale.value === 'en' ? shop.settings.meta_description_en : shop.settings.meta_description_fr },
    { property: 'og:image', content: shop.settings.og_image_url ? imgUrl(shop.settings.og_image_url) : undefined },
    { property: 'og:url', content: shop.settings.site_url },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ].filter(i => i.content),
})))

// ============================================
// LIFECYCLE
// ============================================
const startHeroTimer = () => {
  stopHeroTimer()
  if (heroImages.value.length <= 1) return
  heroTimer.value = setInterval(() => {
    activeHeroIndex.value = (activeHeroIndex.value + 1) % heroImages.value.length
  }, 6000)
}
const stopHeroTimer = () => {
  if (heroTimer.value) clearInterval(heroTimer.value)
  heroTimer.value = null
}
// Coupe le timer quand l'onglet n'est pas visible : pas de calcul ni de
// changement de DOM inutile en arrière-plan (CPU + batterie sur mobile).
const handleVisibilityChange = () => {
  if (document.hidden) stopHeroTimer()
  else startHeroTimer()
}

onMounted(() => {
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) showParticles.value = true
  if (!produits.value.length && !categories.value.length) {
    loadData()
  } else if (!pageConfigLoaded.value) {
    api.get('/page-accueil')
      .then(({ data }) => applyPageConfig(data))
      .catch(e => console.error('Config:', e))
  }
  if (!marketingItems.value.length) loadMarketing()
  else maybeShowFloatingOffer()

  startHeroTimer()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})
onUnmounted(() => {
  stopHeroTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  clearTimeout(floatingOfferTimer.value)
})
</script>

<style scoped>
/* ============================================================
   VARIABLES LOCALES
   --card-w     : cartes hero produits + nouveautés
   --cat-card-w : cartes catégories (réduites)
   --ad-card-w  : cartes annonces/marketing (réduites)
   ============================================================ */
.home {
  --card-w: 200px;
  --cat-card-w: 128px;
  --ad-card-w: 248px;
}

@media (max-width: 1023px) { .home { --card-w: 180px; --cat-card-w: 112px; --ad-card-w: 224px; } }
@media (max-width: 767px)  { .home { --card-w: 160px; --cat-card-w: 100px; --ad-card-w: 208px; } }
@media (max-width: 479px)  { .home { --card-w: 140px; --cat-card-w: 92px;  --ad-card-w: 188px; } }

/* ============================================================
   1. HERO — structure & fond
   ============================================================ */
.hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__image { position: absolute; inset: 0; z-index: 0; }
.hero__image img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%);
}
:global(:root:not(.dark)) .hero__overlay {
  background: linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.58) 50%, rgba(255,255,255,0.76) 100%);
}

/* ============================================================
   2. HERO — layout conteneur
   ============================================================ */
.hero__container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 40px;
  align-items: center;
  padding: 56px 32px 88px;
}

/* ============================================================
   3. HERO — colonne texte
   ============================================================ */
.hero__content { display: flex; flex-direction: column; }

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 18px;
  border: 1px solid rgba(255,255,255,0.22);
  width: fit-content;
}
:global(:root:not(.dark)) .hero__badge { background: rgba(0,0,0,0.04); color: #111827; border-color: rgba(0,0,0,0.1); }

.hero__title {
  font-size: clamp(24px, 3.5vw, 48px);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: #fff;
  margin-bottom: 14px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
:global(:root:not(.dark)) .hero__title { color: #111827; text-shadow: none; }
.hero__title em { color: var(--accent); font-style: normal; }

.hero__desc {
  color: rgba(255,255,255,0.85);
  font-size: 15px;
  line-height: 1.65;
  max-width: 400px;
  margin-bottom: 8px;
}
:global(:root:not(.dark)) .hero__desc { color: #374151; }
.hero__desc--promo { margin-bottom: 0; }

.hero__actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 22px; }

.hero__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.25s ease;
  border: none;
  cursor: pointer;
}
.hero__btn--primary {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 18px color-mix(in srgb, var(--accent) 45%, transparent);
}
.hero__btn--primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--accent) 55%, transparent);
}
.hero__btn--outline {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  border: 2px solid rgba(255,255,255,0.32);
}
.hero__btn--outline:hover { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.6); transform: translateY(-2px); }
:global(:root:not(.dark)) .hero__btn--outline { background: rgba(0,0,0,0.04); color: #374151; border-color: rgba(0,0,0,0.15); }
:global(:root:not(.dark)) .hero__btn--outline:hover { background: rgba(0,0,0,0.07); border-color: var(--accent); color: var(--accent); }

/* ============================================================
   4. HERO — colonne carrousel
   ============================================================ */
.hero__visual { min-width: 0; width: 100%; display: flex; align-items: stretch; }

.hero__products {
  width: 100%;
  min-width: 0;
  background: rgba(10, 18, 35, 0.52);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 56px rgba(0,0,0,0.32);
  display: flex;
  flex-direction: column;
}
:global(:root:not(.dark)) .hero__products {
  background: rgba(255,255,255,0.76);
  border-color: rgba(0,0,0,0.07);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 24px 56px rgba(0,0,0,0.09);
}

.hero__products-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 13px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
:global(:root:not(.dark)) .hero__products-header { border-bottom-color: rgba(0,0,0,0.06); }

.hero__products-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
  animation: dotPulseHero 2.4s ease-in-out infinite;
}
@keyframes dotPulseHero {
  0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.22); }
  50%       { box-shadow: 0 0 0 6px rgba(16,185,129,0.06); }
}
.hero__products-header strong {
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,255,255,0.88);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
}
:global(:root:not(.dark)) .hero__products-header strong { color: #111827; }

.hero__products-count {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.07);
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  white-space: nowrap;
}
:global(:root:not(.dark)) .hero__products-count { color: #6b7280; background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.08); }

.hero__products-carousel {
  overflow: hidden;
  flex: 1;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
}

/* Sens #1 : --> (reverse par rapport à l'animation de base, qui va vers la gauche) */
.hero__products-track {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  width: max-content;
  animation: heroProductsScroll 24s linear infinite reverse;
}
.hero__products-track.is-paused { animation-play-state: paused; }
@keyframes heroProductsScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.hero__products-item { flex: 0 0 var(--card-w); width: var(--card-w); }
.hero__products-item--skeleton {
  background: rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
}
:global(:root:not(.dark)) .hero__products-item--skeleton { background: #f3f4f6; border-color: #e5e7eb; }

.hero__products-item :deep(.prod-card) { width: 100% !important; min-width: unset !important; max-width: unset !important; }

.hero-skeleton__img {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
:global(:root:not(.dark)) .hero-skeleton__img { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; }
.hero-skeleton__body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.hero-skeleton__line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
:global(:root:not(.dark)) .hero-skeleton__line { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; }
.hero-skeleton__line--short { width: 55%; }

.hero__products-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
:global(:root:not(.dark)) .hero__products-footer { border-top-color: rgba(0,0,0,0.05); }
.hero__products-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; color: var(--accent); text-decoration: none;
  transition: gap 0.2s, color 0.2s;
}
.hero__products-link:hover { gap: 7px; color: var(--accent-hover); }

/* ============================================================
   5. HERO — dots navigation
   ============================================================ */
.hero__dots {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.hero__dots button {
  width: 8px; height: 8px; padding: 0; border: 0;
  border-radius: 999px; background: rgba(255,255,255,0.45);
  cursor: pointer; transition: all 0.25s ease;
}
.hero__dots button.is-active { width: 22px; background: var(--accent); }

/* ============================================================
   6. MARKETING STRIP (sens #2 : <--)
   ============================================================ */
.marketing-strip {
  position: relative;
  padding: 28px 0;
  z-index: 4;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border);
}
:global(.dark) .marketing-strip { background: linear-gradient(180deg, var(--bg-primary) 0%, #0f172a 100%); }

.marketing-strip__single { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

.marketing-strip__carousel {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
}
.marketing-strip__track {
  display: flex; gap: 12px; padding: 0 24px;
  width: max-content;
  animation: marketingScroll 24s linear infinite;
}
.marketing-strip__track.is-paused { animation-play-state: paused; }
@keyframes marketingScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.marketing-card {
  position: relative; display: flex; flex-direction: column;
  align-items: flex-start; gap: 9px;
  flex: 0 0 var(--ad-card-w); min-height: 190px;
  padding: 16px 18px 18px;
  border: 2px solid transparent; border-radius: 18px;
  background: linear-gradient(135deg, var(--surface), var(--bg-secondary)) padding-box,
              linear-gradient(135deg, color-mix(in srgb, var(--accent) 75%, transparent), rgba(147,51,234,0.55)) border-box;
  box-shadow: 0 12px 30px rgba(15,23,42,0.13);
  overflow: hidden; isolation: isolate;
}
.marketing-card--evenement {
  background: linear-gradient(135deg, var(--surface), var(--bg-secondary)) padding-box,
              linear-gradient(135deg, #f97316, #f59e0b) border-box;
}
:global(.dark) .marketing-card--annonce {
  background: linear-gradient(135deg, var(--surface), #0f172a) padding-box,
              linear-gradient(135deg, color-mix(in srgb, var(--accent) 80%, white 10%), #a78bfa) border-box;
}
:global(.dark) .marketing-card--evenement {
  background: linear-gradient(135deg, var(--surface), #0f172a) padding-box,
              linear-gradient(135deg, #fb923c, #facc15) border-box;
}

.marketing-card__icon {
  width: 44px; height: 44px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 12px; background: color-mix(in srgb, var(--accent) 12%, transparent); font-size: 22px;
}
.marketing-card--evenement .marketing-card__icon { background: rgba(249,115,22,0.12); }

.marketing-card__badge {
  display: inline-flex; width: fit-content; border-radius: 999px;
  padding: 3px 9px; margin-bottom: 4px;
  background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent);
  font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
}
.marketing-card--evenement .marketing-card__badge { background: rgba(249,115,22,0.1); color: #ea580c; }

.marketing-card__body { min-width: 0; width: 100%; flex: 1 1 auto; }
.marketing-card__body h2 {
  margin: 0 0 4px; color: var(--text-primary);
  font-size: clamp(14px, 1.3vw, 17px); font-weight: 800; line-height: 1.2; letter-spacing: -0.02em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.marketing-card__body p {
  margin: 0; color: var(--text-secondary); font-size: 12.5px; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.marketing-card__link {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  margin-top: auto; align-self: flex-start;
  color: #fff; background: var(--accent); border-radius: 999px;
  padding: 7px 14px; font-size: 12.5px; font-weight: 700;
  text-decoration: none; white-space: nowrap;
  box-shadow: 0 5px 16px color-mix(in srgb, var(--accent) 35%, transparent); transition: all 0.2s ease;
}
.marketing-card--evenement .marketing-card__link { background: #ea580c; box-shadow: 0 5px 16px rgba(234,88,12,0.22); }
.marketing-card__link:hover { color: #fff; transform: translateY(-2px); filter: brightness(1.06); }
.marketing-strip__single .marketing-card { max-width: 380px; margin: 0 auto; }

/* ============================================================
   7. OFFRE FLOTTANTE
   ============================================================ */
.floating-offer {
  position: fixed; left: 24px;
  bottom: calc(env(safe-area-inset-bottom) + 24px);
  z-index: 85; width: min(370px, calc(100vw - 48px));
  display: grid; grid-template-columns: auto 1fr; gap: 14px;
  padding: 16px; border: 2px solid transparent; border-radius: 20px;
  background: linear-gradient(135deg, var(--surface), var(--bg-secondary)) padding-box,
              linear-gradient(135deg, var(--accent), #8b5cf6) border-box;
  box-shadow: 0 20px 52px rgba(15,23,42,0.22); color: var(--text-primary);
}
:global(.dark) .floating-offer { background: linear-gradient(135deg, var(--surface), #0f172a) padding-box, linear-gradient(135deg, var(--accent), #a78bfa) border-box; }
.floating-offer--evenement { background: linear-gradient(135deg, var(--surface), var(--bg-secondary)) padding-box, linear-gradient(135deg, #f97316, #f59e0b) border-box; }
:global(.dark) .floating-offer--evenement { background: linear-gradient(135deg, var(--surface), #0f172a) padding-box, linear-gradient(135deg, #fb923c, #facc15) border-box; }
.floating-offer__close {
  position: absolute; top: 10px; right: 10px; width: 26px; height: 26px;
  border: 0; border-radius: 50%; background: rgba(15,23,42,0.08);
  color: var(--text-primary); font-weight: 900; font-size: 11px;
  cursor: pointer; display: grid; place-items: center; transition: background 0.2s;
}
.floating-offer__close:hover { background: rgba(15,23,42,0.14); }
:global(.dark) .floating-offer__close { background: rgba(255,255,255,0.12); color: #f8fafc; }
.floating-offer__icon { width: 50px; height: 50px; display: grid; place-items: center; border-radius: 15px; background: color-mix(in srgb, var(--accent) 12%, transparent); font-size: 25px; }
.floating-offer--evenement .floating-offer__icon { background: rgba(249,115,22,0.12); }
.floating-offer__content { padding-right: 20px; }
.floating-offer__badge { display: inline-flex; width: fit-content; margin-bottom: 6px; padding: 3px 8px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; }
.floating-offer--evenement .floating-offer__badge { background: rgba(249,115,22,0.1); color: #ea580c; }
.floating-offer h2 { margin: 0 0 4px; color: var(--text-primary); font-size: 18px; line-height: 1.15; font-weight: 900; letter-spacing: -0.025em; }
.floating-offer p { margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.45; }
.floating-offer__link { display: inline-flex; margin-top: 10px; padding: 8px 13px; border-radius: 999px; background: var(--accent); color: #fff; font-size: 13px; font-weight: 900; text-decoration: none; transition: filter 0.2s; }
.floating-offer--evenement .floating-offer__link { background: #ea580c; }
.floating-offer__link:hover { filter: brightness(1.1); }
.floating-offer-enter-active, .floating-offer-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.floating-offer-enter-from, .floating-offer-leave-to { opacity: 0; transform: translateY(18px) scale(0.96); }

/* ============================================================
   8. SECTIONS COMMUNES
   ============================================================ */
.section { position: relative; padding: 60px 0; overflow: hidden; }
.section__bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; z-index: 0; }
.section__bg--categories {
  background-image:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 55%),
    linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 88%, var(--accent) 12%), var(--bg-primary));
}
.section__bg--features {
  background-image:
    radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 50%),
    linear-gradient(160deg, var(--bg-secondary), color-mix(in srgb, var(--bg-primary) 90%, var(--accent) 10%));
}
.section__overlay { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: rgba(0,0,0,0.63); }
:global(:root:not(.dark)) .section__overlay { background: rgba(255,255,255,0.8); }
.section__container { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.section__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 10px; }
.section__header--centered { justify-content: center; text-align: center; flex-direction: column; }
.section__badge { display: inline-block; background: rgba(255,255,255,0.14); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #fff; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2); width: fit-content; }
:global(:root:not(.dark)) .section__badge { background: rgba(0,0,0,0.04); color: var(--accent); border-color: rgba(0,0,0,0.08); }
.section__title { font-size: 24px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.28); }
:global(:root:not(.dark)) .section__title { color: #111827; text-shadow: none; }
.section__title--large { font-size: 28px; }
.section__link { display: inline-flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; transition: all 0.2s; }
.section__link:hover { gap: 8px; color: var(--accent-hover); }

/* ============================================================
   9. CATÉGORIES (sens #3 : -->)
   ============================================================ */
.categories-skeletons { display: flex; gap: 10px; overflow: hidden; }
.categories-carousel {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
}
.categories-track {
  display: flex; gap: 12px; padding: 4px 24px; width: max-content;
  animation: categoriesScroll 22s linear infinite reverse;
}
.categories-track.is-paused { animation-play-state: paused; }
@keyframes categoriesScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.category-card {
  flex: 0 0 var(--cat-card-w); width: var(--cat-card-w);
  background: rgba(255,255,255,0.12); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.18); border-radius: 14px; padding: 18px 10px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  text-decoration: none; color: #fff; font-weight: 600; font-size: 12.5px;
  transition: all 0.3s ease; text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.category-card:hover { background: rgba(255,255,255,0.22); border-color: rgba(255,255,255,0.4); transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.22); }
:global(:root:not(.dark)) .category-card { background: rgba(255,255,255,0.82); border-color: rgba(0,0,0,0.06); color: #374151; text-shadow: none; }
:global(:root:not(.dark)) .category-card:hover { background: #fff; border-color: var(--accent); color: var(--accent); box-shadow: 0 12px 28px rgba(0,0,0,0.08); }
.category-card__icon { font-size: 24px; }
.category-card__name {
  text-align: center;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ============================================================
   10. NOUVEAUTÉS (sens #4 : <--)
   ============================================================ */
.nouveautes { position: relative; padding: 80px 0 100px; overflow: hidden; background: var(--bg-primary); }
.nouveautes__bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.nouveautes__bg-gradient {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 20% 20%, color-mix(in srgb, var(--accent) 7%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(147,51,234,0.04) 0%, transparent 50%);
}
:global(.dark) .nouveautes__bg-gradient {
  background: radial-gradient(ellipse at 20% 20%, color-mix(in srgb, var(--accent) 12%, transparent) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(147,51,234,0.07) 0%, transparent 50%);
}
.nouveautes__bg-pattern { position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0); background-size: 32px 32px; }
:global(.dark) .nouveautes__bg-pattern { background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0); }
.nouveautes__particles { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.nouveautes__particle { position: absolute; bottom: -10px; width: 3px; height: 3px; background: var(--accent); border-radius: 50%; opacity: 0; animation: nouveautesFloat 8s ease-in-out infinite; }
@keyframes nouveautesFloat { 0% { transform: translateY(0) scale(1); opacity: 0; } 10% { opacity: 0.12; } 90% { opacity: 0.12; } 100% { transform: translateY(-500px) scale(0); opacity: 0; } }

.nouveautes__container { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; padding: 0 24px; }
.nouveautes__header { text-align: center; margin-bottom: 48px; }
.nouveautes__header-top { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.nouveautes__badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: color-mix(in srgb, var(--accent) 8%, transparent); color: var(--accent); border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid color-mix(in srgb, var(--accent) 12%, transparent); }
.nouveautes__badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: dotPulse 2s ease-in-out infinite; }
@keyframes dotPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.6); } }
.nouveautes__count { font-size: 12px; font-weight: 600; color: var(--text-muted); padding: 4px 12px; background: var(--bg-secondary); border-radius: 999px; border: 1px solid var(--border); }
.nouveautes__title { font-size: clamp(26px, 3vw, 42px); font-weight: 800; color: var(--text-primary); line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 12px; }
.nouveautes__title-highlight { background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.nouveautes__desc { font-size: 15px; color: var(--text-muted); margin-bottom: 24px; }
.nouveautes__link { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--accent); text-decoration: none; transition: all 0.3s ease; padding: 10px 22px; border-radius: 999px; border: 2px solid var(--accent); }
.nouveautes__link:hover { background: var(--accent); color: #fff; transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 30%, transparent); }

.nouveautes__carousel {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
  mask-image: linear-gradient(90deg, transparent, #000 24px, #000 calc(100% - 24px), transparent);
}
.nouveautes__track-wrap { overflow: hidden; }
.nouveautes__track {
  display: flex; gap: 16px; padding: 8px 24px;
  width: max-content;
  animation: nouveautesScroll 28s linear infinite;
}
.nouveautes__track.is-paused { animation-play-state: paused; }
@keyframes nouveautesScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.nouveautes__item {
  position: relative;
  flex: 0 0 var(--card-w);
  width: var(--card-w);
  display: flex;
}
.nouveautes__item :deep(.prod-card) { width: 100% !important; min-width: unset !important; max-width: unset !important; height: 100%; }

.nouveautes__item-badge {
  position: absolute; top: 10px; right: 10px; z-index: 5;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 9px; background: linear-gradient(135deg, #10b981, #059669);
  color: #fff; border-radius: 6px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  box-shadow: 0 3px 10px rgba(16,185,129,0.3); pointer-events: none;
}
.nouveautes__item-badge svg { animation: starSpin 4s linear infinite; }
@keyframes starSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.nouveautes__skeleton { background: var(--surface); border-radius: 14px; overflow: hidden; border: 1px solid var(--border); width: 100%; }
.nouveautes__skeleton-img { aspect-ratio: 1/1; background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%); background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite; }
.nouveautes__skeleton-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 9px; }
.nouveautes__skeleton-line { height: 13px; border-radius: 6px; background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%); background-size: 200% 100%; animation: shimmer 1.8s ease-in-out infinite; }
.nouveautes__skeleton-line--short  { width: 40%; }
.nouveautes__skeleton-line--medium { width: 70%; }
.nouveautes__empty { text-align: center; padding: 60px 24px; }
.nouveautes__empty-icon { color: var(--text-muted); margin-bottom: 16px; opacity: 0.4; }
.nouveautes__empty-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.nouveautes__empty-desc { color: var(--text-muted); font-size: 14px; }

/* ============================================================
   11. SKELETONS
   ============================================================ */
.skeleton { position: relative; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; border-radius: 14px; overflow: hidden; }
:global(:root:not(.dark)) .skeleton { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skeleton--cat { height: 90px; flex: 0 0 var(--cat-card-w); }

/* ============================================================
   12. FEATURES
   ============================================================ */
.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.feature { position: relative; text-align: center; padding: 36px 20px 28px; border-radius: 20px; background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.12); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); overflow: hidden; cursor: default; }
.feature::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 0; height: 3px; background: linear-gradient(90deg, transparent, var(--accent), transparent); border-radius: 0 0 3px 3px; transition: width 0.4s ease; }
.feature:hover::before { width: 80%; }
.feature:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.24); transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
:global(:root:not(.dark)) .feature { background: rgba(255,255,255,0.76); border-color: rgba(0,0,0,0.06); box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
:global(:root:not(.dark)) .feature:hover { background: #fff; border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
.feature__icon-wrap { position: relative; width: 64px; height: 64px; margin: 0 auto 18px; display: flex; align-items: center; justify-content: center; }
.feature__icon-circle { position: absolute; inset: 0; background: var(--accent-light); border-radius: 50%; opacity: 0.3; transition: all 0.4s ease; }
.feature:hover .feature__icon-circle { transform: scale(1.2); opacity: 0.5; }
.feature__icon { font-size: 28px; position: relative; z-index: 1; transition: transform 0.4s ease; }
.feature:hover .feature__icon { transform: scale(1.15) rotate(-5deg); }
.feature__title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 7px; }
:global(:root:not(.dark)) .feature__title { color: #111827; }
.feature__desc { font-size: 13px; color: rgba(255,255,255,0.72); line-height: 1.6; }
:global(:root:not(.dark)) .feature__desc { color: #4b5563; }
.feature__hover-line { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 0; height: 2px; background: var(--accent); border-radius: 2px 2px 0 0; transition: width 0.4s ease; }
.feature:hover .feature__hover-line { width: 60%; }

/* ============================================================
   13. RESPONSIVE
   ============================================================ */
@media (min-width: 1024px) {
  .hero { min-height: 660px; }
  .features-grid { grid-template-columns: repeat(4, 1fr); gap: 22px; }
  .section__title { font-size: 27px; }
  .section__title--large { font-size: 33px; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .hero { min-height: 580px; }
  .hero__container { grid-template-columns: minmax(240px, 380px) 1fr; gap: 28px; padding: 44px 24px 80px; }
  .features-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}

@media (max-width: 767px) {
  .hero { min-height: unset; align-items: flex-start; }
  .hero__container { grid-template-columns: 1fr; gap: 20px; padding: 32px 16px 72px; }
  .hero__content { order: 1; }
  .hero__visual   { order: 2; }
  .hero__title { font-size: clamp(22px, 7vw, 34px); }
  .hero__desc  { font-size: 14px; max-width: 100%; }
  .hero__actions { flex-direction: column; align-items: stretch; margin-top: 16px; }
  .hero__btn    { width: 100%; justify-content: center; padding: 12px 20px; }
  .hero__products { border-radius: 18px; }
  .hero__products-header { padding: 10px 14px 10px; }
  .hero__products-count  { display: none; }

  .marketing-strip { padding: 18px 0; }
  .marketing-card  { min-height: auto; padding: 13px 14px; border-radius: 14px; }
  .marketing-card__icon { width: 38px; height: 38px; font-size: 19px; border-radius: 10px; }
  .marketing-card__link { width: 100%; justify-content: center; }

  .section { padding: 44px 0; }
  .section__title { font-size: 20px; }
  .section__title--large { font-size: 22px; }

  .features-grid { gap: 12px; }
  .feature { padding: 26px 14px 22px; }
  .feature__icon-wrap { width: 54px; height: 54px; margin-bottom: 14px; }
  .feature__icon { font-size: 25px; }
  .feature__title { font-size: 14px; }
  .feature__desc  { font-size: 12px; }

  .nouveautes { padding: 52px 0 68px; }
  .nouveautes__header { margin-bottom: 28px; }
  .nouveautes__title  { font-size: 22px; }
  .nouveautes__item-badge { font-size: 9px; padding: 3px 7px; top: 6px; right: 6px; }
  .category-card { padding: 14px 8px; }
  .category-card__icon { font-size: 21px; }
  .category-card__name { font-size: 11px; }

  .floating-offer {
    left: 12px; right: 12px; bottom: calc(env(safe-area-inset-bottom) + 80px);
    width: auto; padding: 13px; border-radius: 16px; gap: 12px;
  }
  .floating-offer h2 { font-size: 16px; }
  .floating-offer p  { font-size: 13px; }
}

@media (max-width: 479px) {
  .hero__container { padding: 26px 12px 64px; gap: 16px; }
  .hero__badge { font-size: 12px; padding: 6px 12px; }
  .hero__products-header strong { font-size: 10px; letter-spacing: 0.06em; }
  .hero__products-track { gap: 8px; padding: 10px 12px; }

  .features-grid { grid-template-columns: 1fr; gap: 10px; }
  .feature { padding: 22px 16px 18px; }

  .nouveautes__track { gap: 12px; padding: 8px 16px; }
  .marketing-strip__track { gap: 8px; }
  .categories-track { gap: 8px; }
}

@media (max-width: 379px) {
  .hero__container { padding: 22px 10px 58px; }
  .features-grid   { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__btn, .category-card, .feature, .marketing-card__link, .nouveautes__link { transition: none !important; }
  .hero__products-dot, .nouveautes__badge-dot, .nouveautes__particle, .nouveautes__item-badge svg { animation: none !important; }
  .hero__products-track, .nouveautes__track, .marketing-strip__track, .categories-track { animation: none !important; }
}
</style>