import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_SETTINGS = {
  shop_name: 'Boris IceBox',
  shop_short_name: 'Boris',
  shop_highlight_name: 'IceBox',
  shop_slogan_fr: 'Bijoux, parfums et smartphones au Cameroun',
  shop_slogan_en: 'Jewelry, perfumes and smartphones in Cameroon',
  footer_description_fr: 'Votre boutique premium pour bijoux, parfums et smartphones. Qualite, confiance et livraison rapide.',
  footer_description_en: 'Your premium shop for jewelry, perfumes and smartphones. Quality, trust and fast delivery.',
  phone_display: '+237 656 771 727',
  phone_tel: '+237656771727',
  whatsapp_number: '237656771727',
  email: 'contact@borisicebox.com',
  address_fr: 'Yaounde, Cameroun',
  address_en: 'Yaounde, Cameroon',
  site_url: 'https://borisicebox.com',
  logo_url: '',
  favicon_url: '',
  og_image_url: '/og-image.webp',
  meta_title_fr: 'Boris IceBox - Boutique en ligne au Cameroun',
  meta_title_en: 'Boris IceBox - Online shop in Cameroon',
  meta_description_fr: 'Decouvrez nos produits de qualite livres partout au Cameroun.',
  meta_description_en: 'Discover our quality products delivered across Cameroon.',
  color_light_bg_primary: '#ffffff',
  color_light_bg_secondary: '#f9fafb',
  color_light_surface: '#ffffff',
  color_light_text_primary: '#111827',
  color_light_text_secondary: '#4b5563',
  color_light_accent: '#3b82f6',
  color_light_accent_hover: '#2563eb',
  color_dark_bg_primary: '#0f172a',
  color_dark_bg_secondary: '#1e293b',
  color_dark_surface: '#1e293b',
  color_dark_text_primary: '#f1f5f9',
  color_dark_text_secondary: '#cbd5e1',
  color_dark_accent: '#3b82f6',
  color_dark_accent_hover: '#60a5fa',
  color_footer_bg: '#111827',
  color_success: '#16a34a',
  color_danger: '#dc2626',
  color_whatsapp: '#25D366',
  social_instagram: '',
  social_facebook: '',
  social_tiktok: '',
  social_youtube: '',
  currency_code: 'XAF',
  currency_symbol: 'FCFA',
  currency_locale: 'fr-FR',
  payment_methods_fr: 'MTN Money, Orange Money, paiement a la livraison',
  payment_methods_en: 'MTN Money, Orange Money, cash on delivery',
  delivery_title_fr: 'Livraison rapide',
  delivery_title_en: 'Fast delivery',
  delivery_desc_fr: 'Livraison a Yaounde et partout au Cameroun selon la zone.',
  delivery_desc_en: 'Delivery in Yaounde and across Cameroon depending on the area.',
  whatsapp_order_template_fr: 'Bonjour, je souhaite commander chez {brand}.',
  whatsapp_order_template_en: 'Hello, I would like to order from {brand}.',
  chat_assistant_name: 'Ice',
  chat_welcome_fr: 'Bonjour, je suis {assistant}, votre assistant {brand}. Comment puis-je vous aider ?',
  chat_welcome_en: 'Hello, I am {assistant}, your {brand} assistant. How can I help?',
  chat_quick_questions_fr: 'Quels produits avez-vous ?|Quels sont les prix ?|Comment se passe la livraison ?',
  chat_quick_questions_en: 'What products do you have?|What are the prices?|How does delivery work?',
  legal_terms_fr: '',
  legal_terms_en: '',
  legal_privacy_fr: '',
  legal_privacy_en: '',
  legal_returns_fr: '',
  legal_returns_en: '',
  enable_chat: 'true',
  enable_whatsapp_fab: 'true',
  enable_dark_mode: 'true'
}

const esc = (value) => String(value || '').replace(/[<>&]/g, '')
const bool = (value) => value === true || value === 'true' || value === '1' || value === 1

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const settings = ref({ ...DEFAULT_SETTINGS })
  const loaded = ref(false)

  const applyThemeVariables = () => {
    if (!import.meta.client) return
    let style = document.getElementById('shop-theme-vars')
    if (!style) {
      style = document.createElement('style')
      style.id = 'shop-theme-vars'
      document.head.appendChild(style)
    }
    style.textContent = themeCss.value
    window.__SHOP_CURRENCY__ = {
      locale: settings.value.currency_locale || 'fr-FR',
      symbol: settings.value.currency_symbol || 'FCFA'
    }
  }

  const loadPublic = async (force = false) => {
    if (loaded.value && !force) return settings.value
    try {
      const config = useRuntimeConfig()
      const data = await $fetch('/shop-settings/public', {
        baseURL: config.public.apiBase
      })
      settings.value = { ...DEFAULT_SETTINGS, ...(data?.settings || {}) }
    } catch {
      settings.value = { ...DEFAULT_SETTINGS }
    } finally {
      loaded.value = true
      applyThemeVariables()
    }
    return settings.value
  }

  const whatsappLink = computed(() => `https://wa.me/${String(settings.value.whatsapp_number || '').replace(/\D/g, '')}`)
  const telLink = computed(() => `tel:${settings.value.phone_tel || settings.value.phone_display}`)
  const emailLink = computed(() => `mailto:${settings.value.email}`)
  const chatEnabled = computed(() => bool(settings.value.enable_chat))
  const whatsappFabEnabled = computed(() => bool(settings.value.enable_whatsapp_fab))
  const darkModeEnabled = computed(() => bool(settings.value.enable_dark_mode))

  const themeCss = computed(() => `
:root {
  --bg-primary: ${esc(settings.value.color_light_bg_primary)};
  --bg-secondary: ${esc(settings.value.color_light_bg_secondary)};
  --bg-tertiary: color-mix(in srgb, ${esc(settings.value.color_light_bg_secondary)} 82%, ${esc(settings.value.color_light_accent)} 18%);
  --surface: ${esc(settings.value.color_light_surface)};
  --surface-hover: color-mix(in srgb, ${esc(settings.value.color_light_surface)} 88%, ${esc(settings.value.color_light_accent)} 12%);
  --surface-elevated: ${esc(settings.value.color_light_surface)};
  --text-primary: ${esc(settings.value.color_light_text_primary)};
  --text-secondary: ${esc(settings.value.color_light_text_secondary)};
  --text-muted: color-mix(in srgb, ${esc(settings.value.color_light_text_secondary)} 72%, transparent);
  --border: color-mix(in srgb, ${esc(settings.value.color_light_text_secondary)} 18%, transparent);
  --border-hover: color-mix(in srgb, ${esc(settings.value.color_light_text_secondary)} 28%, transparent);
  --input-bg: ${esc(settings.value.color_light_surface)};
  --input-border: color-mix(in srgb, ${esc(settings.value.color_light_text_secondary)} 18%, transparent);
  --navbar-bg: color-mix(in srgb, ${esc(settings.value.color_light_surface)} 90%, transparent);
  --accent: ${esc(settings.value.color_light_accent)};
  --accent-hover: ${esc(settings.value.color_light_accent_hover)};
  --accent-light: color-mix(in srgb, ${esc(settings.value.color_light_accent)} 12%, transparent);
  --footer-bg: ${esc(settings.value.color_footer_bg)};
  --success: ${esc(settings.value.color_success)};
  --danger: ${esc(settings.value.color_danger)};
  --whatsapp: ${esc(settings.value.color_whatsapp)};
}
.dark {
  --bg-primary: ${esc(settings.value.color_dark_bg_primary)};
  --bg-secondary: ${esc(settings.value.color_dark_bg_secondary)};
  --bg-tertiary: color-mix(in srgb, ${esc(settings.value.color_dark_bg_secondary)} 82%, ${esc(settings.value.color_dark_accent)} 18%);
  --surface: ${esc(settings.value.color_dark_surface)};
  --surface-hover: color-mix(in srgb, ${esc(settings.value.color_dark_surface)} 86%, ${esc(settings.value.color_dark_accent)} 14%);
  --surface-elevated: ${esc(settings.value.color_dark_surface)};
  --text-primary: ${esc(settings.value.color_dark_text_primary)};
  --text-secondary: ${esc(settings.value.color_dark_text_secondary)};
  --text-muted: color-mix(in srgb, ${esc(settings.value.color_dark_text_secondary)} 72%, transparent);
  --border: color-mix(in srgb, ${esc(settings.value.color_dark_text_secondary)} 22%, transparent);
  --border-hover: color-mix(in srgb, ${esc(settings.value.color_dark_text_secondary)} 34%, transparent);
  --input-bg: ${esc(settings.value.color_dark_surface)};
  --input-border: color-mix(in srgb, ${esc(settings.value.color_dark_text_secondary)} 22%, transparent);
  --navbar-bg: color-mix(in srgb, ${esc(settings.value.color_dark_surface)} 90%, transparent);
  --accent: ${esc(settings.value.color_dark_accent)};
  --accent-hover: ${esc(settings.value.color_dark_accent_hover)};
  --accent-light: color-mix(in srgb, ${esc(settings.value.color_dark_accent)} 18%, transparent);
  --footer-bg: ${esc(settings.value.color_footer_bg)};
  --success: ${esc(settings.value.color_success)};
  --danger: ${esc(settings.value.color_danger)};
  --whatsapp: ${esc(settings.value.color_whatsapp)};
}
`)

  return {
    settings,
    loaded,
    loadPublic,
    applyThemeVariables,
    whatsappLink,
    telLink,
    emailLink,
    chatEnabled,
    whatsappFabEnabled,
    darkModeEnabled,
    themeCss
  }
})
