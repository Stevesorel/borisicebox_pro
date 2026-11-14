<template>
  <div class="shop-layout">
    <!-- NAVBAR PREMIUM -->
    <header class="navbar" :class="{ 'navbar--scrolled': scrolled, 'navbar--menu-open': mobileOpen }">
      <div class="navbar__container">
        
        <!-- Logo -->
        <NuxtLinkLocale to="/" class="navbar__brand" :aria-label="$t('nav.brandHome')">
          <img v-if="logoSrc" :src="logoSrc" :alt="brandName" class="navbar__logo" />
          <span v-else class="navbar__brand-text">
            <span class="navbar__brand-name">{{ shop.settings.shop_short_name }}</span>
            <span class="navbar__brand-highlight">{{ shop.settings.shop_highlight_name }}</span>
          </span>
        </NuxtLinkLocale>

        <!-- Navigation Desktop -->
        <nav class="navbar__nav">
          <NuxtLinkLocale to="/" class="navbar__link" exact-active-class="navbar__link--active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 6L8 1L15 6"/><path d="M3 5V14H7V11H9V14H13V5"/></svg>
            <span>{{ $t('nav.home') }}</span>
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/boutique" class="navbar__link" active-class="navbar__link--active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
            <span>{{ $t('nav.shop') }}</span>
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/suivi" class="navbar__link" active-class="navbar__link--active">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 4V8L11 10"/></svg>
            <span>{{ $t('nav.tracking') }}</span>
          </NuxtLinkLocale>
        </nav>

        <!-- Actions -->
        <div class="navbar__actions">
          <!-- Recherche -->
          <button class="navbar__icon-btn" @click="searchOpen = !searchOpen" :aria-label="$t('nav.search')" :title="$t('nav.search')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          <!-- Panier -->
          <NuxtLinkLocale to="/panier" class="navbar__cart" :aria-label="$t('nav.cart')" :title="$t('nav.cart')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <ClientOnly>
              <Transition name="cart-badge-pop">
                <span v-if="panier.count > 0" class="navbar__badge">{{ panier.count > 99 ? '99+' : panier.count }}</span>
              </Transition>
            </ClientOnly>
          </NuxtLinkLocale>

          <!-- Toggles (visibles desktop et mobile) -->
          <div class="navbar__toggles">
            <LangToggle />
            <ClientOnly>
              <ThemeToggle v-if="shop.darkModeEnabled" />
            </ClientOnly>
          </div>

          <!-- Burger Mobile -->
          <button class="navbar__burger" @click="mobileOpen = !mobileOpen" :aria-label="mobileOpen ? $t('nav.closeMenu') : $t('nav.openMenu')" :title="mobileOpen ? $t('nav.close') : $t('nav.menu')">
            <div class="navbar__burger-lines" :class="{ 'navbar__burger-lines--open': mobileOpen }">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Barre de recherche -->
      <Transition name="search-slide">
        <div v-if="searchOpen" class="search-bar">
          <div class="search-bar__inner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input 
              ref="searchInputRef" 
              v-model.trim="searchQuery" 
              type="search" 
              :placeholder="$t('nav.searchPlaceholder')" 
              @keyup.enter="goSearch" 
              @keydown.escape="searchOpen = false"
            />
            <kbd class="search-bar__kbd">ESC</kbd>
            <button class="search-bar__close" @click="searchOpen = false" :aria-label="$t('nav.closeSearch')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Menu Mobile Premium -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false">
        <div class="mobile-panel" @click.stop>
          <!-- En-tête -->
          <div class="mobile-panel__header">
            <div class="mobile-panel__brand">
              <img v-if="logoSrc" :src="logoSrc" :alt="brandName" class="mobile-panel__logo" />
              <span v-else class="mobile-panel__brand-name">{{ shop.settings.shop_short_name }} <strong>{{ shop.settings.shop_highlight_name }}</strong></span>
            </div>
            <button class="mobile-panel__close" @click="mobileOpen = false" :aria-label="$t('nav.closeMenu')">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Liens -->
          <nav class="mobile-panel__nav">
            <NuxtLinkLocale to="/" @click="mobileOpen = false" exact-active-class="mobile-panel__link--active" class="mobile-panel__link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 8L10 1L19 8"/><path d="M3 7V18H9V14H11V14H17V7"/></svg>
              <span>{{ $t('nav.home') }}</span>
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/boutique" @click="mobileOpen = false" active-class="mobile-panel__link--active" class="mobile-panel__link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="1" width="7" height="7" rx="1.5"/><rect x="12" y="1" width="7" height="7" rx="1.5"/><rect x="1" y="12" width="7" height="7" rx="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5"/></svg>
              <span>{{ $t('nav.shop') }}</span>
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/suivi" @click="mobileOpen = false" active-class="mobile-panel__link--active" class="mobile-panel__link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 5V10L13 13"/></svg>
              <span>{{ $t('nav.tracking') }}</span>
            </NuxtLinkLocale>
            <NuxtLinkLocale to="/panier" @click="mobileOpen = false" class="mobile-panel__link mobile-panel__link--cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              <span>{{ $t('nav.cart') }}</span>
              <ClientOnly>
                <span v-if="panier.count > 0" class="mobile-panel__badge">{{ panier.count }}</span>
              </ClientOnly>
            </NuxtLinkLocale>
          </nav>

          <!-- Footer mobile -->
          <div class="mobile-panel__footer">
            <a :href="shop.whatsappLink" target="_blank" class="mobile-panel__wa-btn">
              <WhatsAppIcon size="22" />
              <span>{{ $t('footer.whatsapp') }}</span>
            </a>
            <div class="mobile-panel__info">
              <span>📞 {{ shop.settings.phone_display }}</span>
              <span>📍 {{ localizedAddress }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Contenu principal -->
    <main class="main-content">
  <slot />
</main>

    <!-- WhatsApp FAB -->
    <a v-if="shop.whatsappFabEnabled" :href="shop.whatsappLink" target="_blank" class="wa-fab" :aria-label="$t('footer.whatsapp')" title="WhatsApp">
      <WhatsAppIcon size="24" />
      <span class="wa-fab__pulse"></span>
    </a>

    <!-- Chat Widget (chargé après le contenu principal) -->
    <ClientOnly>
      <ChatWidget v-if="shop.chatEnabled && showChat" />
    </ClientOnly>

    <!-- Footer Premium -->
    <footer class="footer">
      <div class="footer__container">
        <div class="footer__grid">
          <!-- Marque -->
          <div class="footer__brand">
            <div class="footer__brand-top">
              <span class="footer__name">{{ shop.settings.shop_short_name }} <strong>{{ shop.settings.shop_highlight_name }}</strong></span>
            </div>
            <p class="footer__desc">{{ localizedFooterDescription }}</p>
            <div class="footer__social">
              <a :href="shop.whatsappLink" target="_blank" class="footer__social-link" aria-label="WhatsApp">
                <WhatsAppIcon size="18" />
              </a>
              <a v-for="social in socialLinks" :key="social.label" :href="social.href" target="_blank" class="footer__social-link" :aria-label="social.label">
                {{ social.icon }}
              </a>
            </div>
          </div>

          <!-- Navigation -->
          <div class="footer__col">
            <h4>{{ $t('footer.nav') }}</h4>
            <NuxtLinkLocale to="/">{{ $t('nav.home') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/boutique">{{ $t('nav.shop') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/suivi">{{ $t('nav.tracking') }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/panier">{{ $t('nav.cart') }}</NuxtLinkLocale>
          </div>

          <!-- Contact -->
          <div class="footer__col">
            <h4>{{ $t('footer.contact') }}</h4>
            <a :href="shop.whatsappLink" target="_blank" class="footer__contact-item">
              <WhatsAppIcon size="16" />
              <span>WhatsApp</span>
            </a>
            <a :href="shop.telLink" class="footer__contact-item">
              <span>📞</span>
              <span>{{ shop.settings.phone_display }}</span>
            </a>
            <span class="footer__contact-item">
              <span>📍</span>
              <span>{{ localizedAddress }}</span>
            </span>
            <a :href="shop.emailLink" class="footer__contact-item">
              <span>✉️</span>
              <span>{{ shop.settings.email }}</span>
            </a>
          </div>

          <div class="footer__col">
            <h4>{{ localizedDeliveryTitle }}</h4>
            <p class="footer__small-text">{{ localizedDeliveryDescription }}</p>
            <h4 class="footer__sub-title">Paiement</h4>
            <p class="footer__small-text">{{ localizedPaymentMethods }}</p>
          </div>
        </div>

        <div class="footer__bottom">
          <p>© {{ new Date().getFullYear() }} {{ brandName }} — {{ $t('footer.rights') }}</p>
          <div class="footer__legal">
            <NuxtLinkLocale to="/legal/conditions">Conditions</NuxtLinkLocale>
            <NuxtLinkLocale to="/legal/confidentialite">Confidentialité</NuxtLinkLocale>
            <NuxtLinkLocale to="/legal/retours">Retours</NuxtLinkLocale>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

import { usePanierStore } from '../stores/panier'
import { useShopSettingsStore } from '@/stores/shopSettings'
import { imgUrl } from '@/services/api'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LangToggle from '@/components/LangToggle.vue'
const ChatWidget = defineAsyncComponent(() => import('@/components/ChatWidget.vue'))

const panier = usePanierStore()
const shop = useShopSettingsStore()
const showChat = ref(false)

const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()

const scrolled = ref(false)
const searchOpen = ref(false)
const mobileOpen = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)

let scrollTimer = null

const brandName = computed(() => shop.settings.shop_name || `${shop.settings.shop_short_name} ${shop.settings.shop_highlight_name}`.trim())
const logoSrc = computed(() => shop.settings.logo_url ? imgUrl(shop.settings.logo_url) : '')
const localizedAddress = computed(() => locale.value === 'en' ? shop.settings.address_en : shop.settings.address_fr)
const localizedFooterDescription = computed(() =>
  locale.value === 'en' ? shop.settings.footer_description_en : shop.settings.footer_description_fr
)
const localizedPaymentMethods = computed(() => locale.value === 'en' ? shop.settings.payment_methods_en : shop.settings.payment_methods_fr)
const localizedDeliveryTitle = computed(() => locale.value === 'en' ? shop.settings.delivery_title_en : shop.settings.delivery_title_fr)
const localizedDeliveryDescription = computed(() => locale.value === 'en' ? shop.settings.delivery_desc_en : shop.settings.delivery_desc_fr)
const localizedMetaTitle = computed(() => locale.value === 'en' ? shop.settings.meta_title_en : shop.settings.meta_title_fr)
const localizedMetaDescription = computed(() =>
  locale.value === 'en' ? shop.settings.meta_description_en : shop.settings.meta_description_fr
)
const socialLinks = computed(() => [
  { label: 'Instagram', href: shop.settings.social_instagram, icon: 'IG' },
  { label: 'Facebook', href: shop.settings.social_facebook, icon: 'FB' },
  { label: 'TikTok', href: shop.settings.social_tiktok, icon: 'TT' },
  { label: 'YouTube', href: shop.settings.social_youtube, icon: 'YT' }
].filter(item => item.href))

useHead(() => ({
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk}` : localizedMetaTitle.value,
  meta: [
    { name: 'application-name', content: brandName.value },
    { name: 'description', content: localizedMetaDescription.value },
    { property: 'og:site_name', content: brandName.value },
    { property: 'og:image', content: shop.settings.og_image_url ? imgUrl(shop.settings.og_image_url) : undefined }
  ].filter(item => item.content),
  link: shop.settings.favicon_url ? [{ rel: 'icon', href: imgUrl(shop.settings.favicon_url) }] : [],
}))

const onScroll = () => {
  if (scrollTimer) return
  scrollTimer = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 20
    scrollTimer = null
  })
}

const onResize = () => { 
  if (window.innerWidth >= 768) {
    mobileOpen.value = false
  }
}

const onKeydown = (e) => { 
  if (e.key === 'Escape') { 
    searchOpen.value = false
    mobileOpen.value = false 
  }
}

onMounted(() => {
  shop.applyThemeVariables()
  if (!shop.darkModeEnabled) document.documentElement.classList.remove('dark')
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  document.addEventListener('keydown', onKeydown)

  if (shop.chatEnabled) {
    const mountChat = () => { showChat.value = true }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(mountChat, { timeout: 2500 })
    } else {
      setTimeout(mountChat, 1200)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKeydown)
  if (scrollTimer) cancelAnimationFrame(scrollTimer)
})

// Bloquer le scroll quand le menu mobile est ouvert
watch(mobileOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

watch(searchOpen, async (isOpen) => { 
  if (isOpen) { 
    await nextTick()
    searchInputRef.value?.focus() 
  }
})

watch(() => shop.themeCss, () => {
  shop.applyThemeVariables()
})

const goSearch = () => {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ path: localePath('/boutique'), query: { q } })
  searchOpen.value = false
  searchQuery.value = ''
}
</script>

<style scoped>
/* ============================================
   LAYOUT
   ============================================ */
.shop-layout { 
  display: flex; 
  flex-direction: column; 
  min-height: 100vh; 
  background: var(--bg-primary); 
}

.main-content { 
  flex: 1; 
  padding-top: 64px;
}

/* ============================================
   NAVBAR PREMIUM
   ============================================ */
.navbar { 
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100; 
  background: var(--navbar-bg); 
  backdrop-filter: blur(20px); 
  -webkit-backdrop-filter: blur(20px); 
  border-bottom: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}

.navbar--scrolled { 
  border-bottom-color: var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06);
}

:global(.dark) .navbar--scrolled {
  box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3);
}

.navbar__container { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 0 16px; 
  height: 64px; 
  gap: 16px;
}

@media (min-width: 768px) {
  .navbar__container { padding: 0 32px; gap: 24px; }
}

/* Logo */
.navbar__brand { 
  display: flex; 
  align-items: center; 
  text-decoration: none; 
  flex-shrink: 0;
}

.navbar__logo {
  width: auto;
  max-width: 150px;
  height: 38px;
  object-fit: contain;
}

.navbar__brand-text {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.navbar__brand-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.navbar__brand-highlight {
  font-size: 18px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -0.02em;
}

/* Navigation Desktop */
.navbar__nav { 
  display: none; 
  gap: 4px; 
  align-items: center;
}

@media (min-width: 768px) { 
  .navbar__nav { display: flex; } 
}

.navbar__link { 
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none; 
  font-size: 13px; 
  font-weight: 500; 
  color: var(--text-secondary); 
  padding: 8px 14px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.navbar__link svg {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.navbar__link:hover { 
  color: var(--text-primary); 
  background: var(--bg-secondary);
}

.navbar__link:hover svg {
  opacity: 1;
}

.navbar__link--active { 
  color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}

.navbar__link--active svg {
  opacity: 1;
  color: var(--accent);
}

/* Actions */
.navbar__actions { 
  display: flex; 
  align-items: center; 
  gap: 2px; 
}

.navbar__icon-btn { 
  width: 38px; 
  height: 38px; 
  border-radius: 10px; 
  border: none; 
  background: none; 
  color: var(--text-secondary); 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: all 0.2s ease; 
}

.navbar__icon-btn:hover { 
  background: var(--bg-secondary); 
  color: var(--text-primary); 
}

/* Panier */
.navbar__cart { 
  position: relative; 
  width: 38px; 
  height: 38px; 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: var(--text-secondary); 
  text-decoration: none; 
  transition: all 0.2s ease; 
}

.navbar__cart:hover { 
  background: var(--bg-secondary); 
  color: var(--text-primary); 
}

.navbar__badge { 
  position: absolute; 
  top: -2px; 
  right: -2px; 
  min-width: 18px; 
  height: 18px; 
  border-radius: 999px; 
  background: #ef4444; 
  color: #fff; 
  font-size: 10px; 
  font-weight: 700; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border: 2px solid var(--navbar-bg); 
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(239,68,68,0.3);
}

/* Animation badge panier */
.cart-badge-pop-enter-active {
  animation: cartBadgePop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-badge-pop-leave-active {
  animation: cartBadgePop 0.2s ease reverse;
}

@keyframes cartBadgePop {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* ✅ TOGGLES - VISIBLES SUR MOBILE ET DESKTOP */
.navbar__toggles {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* Burger */
.navbar__burger { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  width: 38px; 
  height: 38px; 
  border-radius: 10px; 
  border: none; 
  background: none; 
  cursor: pointer; 
  color: var(--text-primary); 
}

.navbar__burger:hover { 
  background: var(--bg-secondary); 
}

@media (min-width: 768px) { 
  .navbar__burger { display: none; } 
}

.navbar__burger-lines {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 20px;
}

.navbar__burger-lines span {
  display: block;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.navbar__burger-lines--open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__burger-lines--open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.navbar__burger-lines--open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ============================================
   BARRE DE RECHERCHE
   ============================================ */
.search-bar { 
  border-top: 1px solid var(--border); 
  background: var(--surface); 
}

.search-bar__inner { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 10px 16px; 
  display: flex; 
  gap: 12px; 
  align-items: center; 
}

@media (min-width: 768px) {
  .search-bar__inner { padding: 10px 32px; }
}

.search-bar__inner svg { 
  color: var(--text-muted); 
  flex-shrink: 0; 
}

.search-bar__inner input { 
  flex: 1; 
  border: none; 
  background: transparent; 
  font-size: 15px; 
  color: var(--text-primary); 
  outline: none;
  font-family: inherit;
}

.search-bar__inner input::placeholder { 
  color: var(--text-muted); 
}

.search-bar__kbd {
  display: none;
  padding: 3px 8px;
  border-radius: 5px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  border: 1px solid var(--border);
}

@media (min-width: 768px) {
  .search-bar__kbd { display: block; }
}

.search-bar__close { 
  background: none; 
  border: none; 
  color: var(--text-muted); 
  cursor: pointer; 
  padding: 6px; 
  border-radius: 8px; 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-bar__close:hover { 
  background: var(--bg-secondary); 
  color: var(--text-primary); 
}

/* Animation recherche */
.search-slide-enter-active { 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
}

.search-slide-leave-active { 
  transition: all 0.2s ease; 
}

.search-slide-enter-from, 
.search-slide-leave-to { 
  opacity: 0; 
  transform: translateY(-10px); 
}

/* ============================================
   MENU MOBILE PREMIUM
   ============================================ */
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.mobile-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 88vw;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0,0,0,0.15);
}

.mobile-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.mobile-panel__brand-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.mobile-panel__brand-name strong {
  color: var(--accent);
}

.mobile-panel__logo {
  width: auto;
  max-width: 160px;
  height: 44px;
  object-fit: contain;
}

.mobile-panel__close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.mobile-panel__close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.mobile-panel__nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.mobile-panel__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.mobile-panel__link svg {
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.mobile-panel__link:hover {
  background: var(--bg-secondary);
}

.mobile-panel__link:hover svg {
  opacity: 1;
}

.mobile-panel__link--active {
  color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}

.mobile-panel__link--active svg {
  opacity: 1;
  color: var(--accent);
}

.mobile-panel__link--cart {
  position: relative;
}

.mobile-panel__badge {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.mobile-panel__footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-panel__wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: #25D366;
  color: #fff;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
  box-shadow: 0 4px 16px rgba(37,211,102,0.3);
  transition: all 0.3s ease;
}

.mobile-panel__wa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37,211,102,0.4);
}

.mobile-panel__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

/* Animations menu mobile */
.mobile-menu-enter-active {
  transition: opacity 0.3s ease;
}

.mobile-menu-enter-active .mobile-panel {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-leave-active {
  transition: opacity 0.25s ease;
}

.mobile-menu-leave-active .mobile-panel {
  transition: transform 0.25s ease;
}

.mobile-menu-enter-from {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-panel {
  transform: translateX(100%);
}

.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-leave-to .mobile-panel {
  transform: translateX(100%);
}

/* ============================================
   PAGE TRANSITION
   ============================================ */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ============================================
   WHATSAPP FAB
   ============================================ */
.wa-fab { 
  position: fixed; 
  bottom: calc(env(safe-area-inset-bottom) + 24px); 
  right: 24px; 
  width: 56px; 
  height: 56px; 
  border-radius: 50%; 
  background: #25D366; 
  color: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  box-shadow: 0 4px 20px rgba(37,211,102,0.4); 
  z-index: 90; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  overflow: hidden;
}

.wa-fab:hover { 
  transform: scale(1.08); 
  box-shadow: 0 8px 28px rgba(37,211,102,0.5); 
}

.wa-fab__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid #25D366;
  opacity: 0;
  animation: waPulse 2s ease-out infinite;
}

@keyframes waPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.4); opacity: 0; }
}

@media (max-width: 480px) { 
  .wa-fab { 
    right: 16px; 
    bottom: calc(env(safe-area-inset-bottom) + 16px); 
    width: 48px; 
    height: 48px; 
    border-radius: 50%;
  }
}

/* ============================================
   FOOTER PREMIUM
   ============================================ */
.footer { 
  background: var(--footer-bg); 
  color: var(--footer-text); 
  margin-top: 80px; 
  border-top: 1px solid var(--border);
}

.footer__container { 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 56px 20px 28px; 
}

@media (min-width: 768px) {
  .footer__container { padding: 56px 32px 28px; }
}

.footer__grid { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 40px; 
}

@media (min-width: 640px) { 
  .footer__grid { grid-template-columns: 1fr 1fr; } 
}

@media (min-width: 900px) { 
  .footer__grid { grid-template-columns: 2fr 1fr 1fr; gap: 56px; } 
}

.footer__brand { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.footer__name { 
  font-size: 22px; 
  font-weight: 700; 
  color: #fff; 
}

.footer__name strong { 
  color: var(--accent); 
}

.footer__desc { 
  font-size: 14px; 
  color: var(--footer-text-muted); 
  line-height: 1.7; 
  max-width: 360px;
}

.footer__social {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.footer__social-link {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  color: var(--whatsapp);
  font-size: 11px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.footer__social-link:hover {
  background: var(--whatsapp);
  color: #fff;
  transform: translateY(-2px);
}

.footer__col { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.footer__col h4 { 
  font-size: 11px; 
  font-weight: 700; 
  text-transform: uppercase; 
  letter-spacing: 0.1em; 
  color: var(--footer-text-muted); 
  margin-bottom: 6px; 
}

.footer__sub-title {
  margin-top: 10px;
}

.footer__small-text {
  color: var(--footer-text);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.footer__col a { 
  font-size: 14px; 
  color: var(--footer-text); 
  text-decoration: none; 
  transition: color 0.2s ease; 
}

.footer__col a:hover { 
  color: var(--accent); 
}

.footer__contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--footer-text);
  text-decoration: none;
}

a.footer__contact-item:hover {
  color: var(--accent);
}

.footer__bottom { 
  border-top: 1px solid rgba(255,255,255,0.06); 
  margin-top: 48px; 
  padding-top: 24px; 
  text-align: center; 
  font-size: 13px; 
  color: var(--footer-text-muted); 
}

.footer__legal {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.footer__legal a {
  color: var(--footer-text-muted);
  font-weight: 700;
}

.footer__legal a:hover {
  color: var(--accent);
}

/* ============================================
   RESPONSIVE GLOBAL
   ============================================ */
@media (max-width: 480px) {
  .navbar__container {
    padding: 0 12px;
    gap: 8px;
  }
  
  .navbar__brand-name,
  .navbar__brand-highlight {
    font-size: 16px;
  }
  
  .footer { margin-top: 56px; }
  .footer__container { padding: 40px 16px 24px; }
}
</style>
