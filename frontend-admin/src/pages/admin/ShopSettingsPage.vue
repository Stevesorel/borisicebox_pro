<template>
  <div class="page">
    <div class="header">
      <div>
        <h2 class="header__title">Paramètres boutique</h2>
        <p class="header__desc">Rends cette boutique réutilisable pour n'importe quel client.</p>
      </div>
      <button class="btn-save" @click="save" :disabled="saving || loading">
        {{ saving ? 'Enregistrement...' : 'Sauvegarder' }}
      </button>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else class="sections">
      <section class="card">
        <h3 class="card__title">Identité</h3>
        <div class="grid3">
          <div class="field">
            <label>Nom complet</label>
            <input v-model="settings.shop_name" class="input" placeholder="Ex: Boris IceBox" />
          </div>
          <div class="field">
            <label>Nom partie 1</label>
            <input v-model="settings.shop_short_name" class="input" placeholder="Ex: Boris" />
          </div>
          <div class="field">
            <label>Nom accentué</label>
            <input v-model="settings.shop_highlight_name" class="input" placeholder="Ex: IceBox" />
          </div>
        </div>
        <div class="grid2">
          <div class="field">
            <label>Slogan FR</label>
            <input v-model="settings.shop_slogan_fr" class="input" />
          </div>
          <div class="field">
            <label>Slogan EN</label>
            <input v-model="settings.shop_slogan_en" class="input" />
          </div>
        </div>
        <div class="grid3">
          <div class="field">
            <label>Logo URL</label>
            <input v-model="settings.logo_url" class="input" placeholder="/uploads/logo.png ou https://..." />
            <input type="file" accept="image/*" @change="uploadAsset($event, 'logo')" />
          </div>
          <div class="field">
            <label>Favicon URL</label>
            <input v-model="settings.favicon_url" class="input" placeholder="/favicon.svg" />
            <input type="file" accept="image/*" @change="uploadAsset($event, 'favicon')" />
          </div>
          <div class="field">
            <label>Image partage social</label>
            <input v-model="settings.og_image_url" class="input" placeholder="/og-image.webp" />
            <input type="file" accept="image/*" @change="uploadAsset($event, 'og')" />
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Contacts</h3>
        <div class="grid3">
          <div class="field">
            <label>Téléphone affiché</label>
            <input v-model="settings.phone_display" class="input" placeholder="+237 656 771 727" />
          </div>
          <div class="field">
            <label>Lien téléphone</label>
            <input v-model="settings.phone_tel" class="input" placeholder="+237656771727" />
          </div>
          <div class="field">
            <label>WhatsApp</label>
            <input v-model="settings.whatsapp_number" class="input" placeholder="237656771727" />
          </div>
        </div>
        <div class="grid3">
          <div class="field">
            <label>Email</label>
            <input v-model="settings.email" class="input" type="email" />
          </div>
          <div class="field">
            <label>Adresse FR</label>
            <input v-model="settings.address_fr" class="input" />
          </div>
          <div class="field">
            <label>Adresse EN</label>
            <input v-model="settings.address_en" class="input" />
          </div>
          <div class="field">
            <label>URL publique de la boutique</label>
            <input v-model="settings.site_url" class="input" placeholder="https://ma-boutique.com" />
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Réseaux sociaux</h3>
        <div class="grid4">
          <div class="field">
            <label>Instagram</label>
            <input v-model="settings.social_instagram" class="input" placeholder="https://instagram.com/..." />
          </div>
          <div class="field">
            <label>Facebook</label>
            <input v-model="settings.social_facebook" class="input" placeholder="https://facebook.com/..." />
          </div>
          <div class="field">
            <label>TikTok</label>
            <input v-model="settings.social_tiktok" class="input" placeholder="https://tiktok.com/@..." />
          </div>
          <div class="field">
            <label>YouTube</label>
            <input v-model="settings.social_youtube" class="input" placeholder="https://youtube.com/..." />
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">SEO et footer</h3>
        <div class="grid2">
          <div class="field">
            <label>Titre SEO FR</label>
            <input v-model="settings.meta_title_fr" class="input" />
          </div>
          <div class="field">
            <label>Titre SEO EN</label>
            <input v-model="settings.meta_title_en" class="input" />
          </div>
          <div class="field">
            <label>Description SEO FR</label>
            <textarea v-model="settings.meta_description_fr" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Description SEO EN</label>
            <textarea v-model="settings.meta_description_en" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Description footer FR</label>
            <textarea v-model="settings.footer_description_fr" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Description footer EN</label>
            <textarea v-model="settings.footer_description_en" class="input textarea"></textarea>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Couleurs</h3>
        <div class="theme-grid">
          <div>
            <h4>Mode clair</h4>
            <ColorField v-for="field in lightColorFields" :key="field.key" v-model="settings[field.key]" :label="field.label" />
          </div>
          <div>
            <h4>Mode sombre</h4>
            <ColorField v-for="field in darkColorFields" :key="field.key" v-model="settings[field.key]" :label="field.label" />
          </div>
        </div>
        <div class="grid4 color-extra">
          <ColorField v-for="field in extraColorFields" :key="field.key" v-model="settings[field.key]" :label="field.label" />
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Devise, paiement et livraison</h3>
        <div class="grid3">
          <div class="field">
            <label>Code devise</label>
            <input v-model="settings.currency_code" class="input" placeholder="XAF" />
          </div>
          <div class="field">
            <label>Symbole devise</label>
            <input v-model="settings.currency_symbol" class="input" placeholder="FCFA" />
          </div>
          <div class="field">
            <label>Locale prix</label>
            <input v-model="settings.currency_locale" class="input" placeholder="fr-FR" />
          </div>
        </div>
        <div class="grid2">
          <div class="field">
            <label>Moyens de paiement FR</label>
            <textarea v-model="settings.payment_methods_fr" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Moyens de paiement EN</label>
            <textarea v-model="settings.payment_methods_en" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Titre livraison FR</label>
            <input v-model="settings.delivery_title_fr" class="input" />
          </div>
          <div class="field">
            <label>Titre livraison EN</label>
            <input v-model="settings.delivery_title_en" class="input" />
          </div>
          <div class="field">
            <label>Description livraison FR</label>
            <textarea v-model="settings.delivery_desc_fr" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Description livraison EN</label>
            <textarea v-model="settings.delivery_desc_en" class="input textarea"></textarea>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Chat et WhatsApp</h3>
        <div class="grid3">
          <div class="field">
            <label>Nom assistant</label>
            <input v-model="settings.chat_assistant_name" class="input" />
          </div>
          <div class="field">
            <label>Template WhatsApp FR</label>
            <input v-model="settings.whatsapp_order_template_fr" class="input" />
          </div>
          <div class="field">
            <label>Template WhatsApp EN</label>
            <input v-model="settings.whatsapp_order_template_en" class="input" />
          </div>
        </div>
        <div class="grid2">
          <div class="field">
            <label>Message accueil chat FR</label>
            <textarea v-model="settings.chat_welcome_fr" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Message accueil chat EN</label>
            <textarea v-model="settings.chat_welcome_en" class="input textarea"></textarea>
          </div>
          <div class="field">
            <label>Questions rapides FR</label>
            <textarea v-model="settings.chat_quick_questions_fr" class="input textarea" placeholder="Question 1|Question 2|Question 3"></textarea>
          </div>
          <div class="field">
            <label>Questions rapides EN</label>
            <textarea v-model="settings.chat_quick_questions_en" class="input textarea" placeholder="Question 1|Question 2|Question 3"></textarea>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Pages légales</h3>
        <div class="grid2">
          <div class="field">
            <label>Conditions générales FR</label>
            <textarea v-model="settings.legal_terms_fr" class="input textarea textarea--large"></textarea>
          </div>
          <div class="field">
            <label>Conditions générales EN</label>
            <textarea v-model="settings.legal_terms_en" class="input textarea textarea--large"></textarea>
          </div>
          <div class="field">
            <label>Confidentialité FR</label>
            <textarea v-model="settings.legal_privacy_fr" class="input textarea textarea--large"></textarea>
          </div>
          <div class="field">
            <label>Confidentialité EN</label>
            <textarea v-model="settings.legal_privacy_en" class="input textarea textarea--large"></textarea>
          </div>
          <div class="field">
            <label>Retours / remboursements FR</label>
            <textarea v-model="settings.legal_returns_fr" class="input textarea textarea--large"></textarea>
          </div>
          <div class="field">
            <label>Retours / remboursements EN</label>
            <textarea v-model="settings.legal_returns_en" class="input textarea textarea--large"></textarea>
          </div>
        </div>
      </section>

      <section class="card">
        <h3 class="card__title">Options</h3>
        <div class="toggles">
          <label class="toggle">
            <input v-model="settings.enable_chat" type="checkbox" true-value="true" false-value="false" />
            <span>Activer le chat</span>
          </label>
          <label class="toggle">
            <input v-model="settings.enable_whatsapp_fab" type="checkbox" true-value="true" false-value="false" />
            <span>Activer le bouton WhatsApp flottant</span>
          </label>
          <label class="toggle">
            <input v-model="settings.enable_dark_mode" type="checkbox" true-value="true" false-value="false" />
            <span>Activer le dark mode</span>
          </label>
        </div>
      </section>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast" :class="'toast--' + toast.type">{{ toast.msg }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { defineComponent, h, onMounted, ref } from 'vue'
import api from '../../services/api'

const ColorField = defineComponent({
  props: {
    modelValue: { type: String, default: '#000000' },
    label: { type: String, required: true }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('label', { class: 'color-field' }, [
      h('span', props.label),
      h('input', {
        type: 'color',
        value: props.modelValue,
        onInput: (e) => emit('update:modelValue', e.target.value)
      }),
      h('input', {
        class: 'input',
        value: props.modelValue,
        onInput: (e) => emit('update:modelValue', e.target.value)
      })
    ])
  }
})

const loading = ref(true)
const saving = ref(false)
const settings = ref({})
const toast = ref(null)

const lightColorFields = [
  { key: 'color_light_bg_primary', label: 'Fond principal' },
  { key: 'color_light_bg_secondary', label: 'Fond secondaire' },
  { key: 'color_light_surface', label: 'Surface / cartes' },
  { key: 'color_light_text_primary', label: 'Texte principal' },
  { key: 'color_light_text_secondary', label: 'Texte secondaire' },
  { key: 'color_light_accent', label: 'Couleur accent' },
  { key: 'color_light_accent_hover', label: 'Accent hover' }
]

const darkColorFields = [
  { key: 'color_dark_bg_primary', label: 'Fond principal' },
  { key: 'color_dark_bg_secondary', label: 'Fond secondaire' },
  { key: 'color_dark_surface', label: 'Surface / cartes' },
  { key: 'color_dark_text_primary', label: 'Texte principal' },
  { key: 'color_dark_text_secondary', label: 'Texte secondaire' },
  { key: 'color_dark_accent', label: 'Couleur accent' },
  { key: 'color_dark_accent_hover', label: 'Accent hover' }
]

const extraColorFields = [
  { key: 'color_footer_bg', label: 'Fond footer' },
  { key: 'color_success', label: 'Succès' },
  { key: 'color_danger', label: 'Danger' },
  { key: 'color_whatsapp', label: 'WhatsApp' }
]

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}

const load = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/shop-settings')
    settings.value = { ...(data.defaults || {}), ...(data.settings || {}) }
  } catch {
    showToast('Erreur de chargement', 'error')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const { data } = await api.put('/shop-settings', { settings: settings.value })
    settings.value = { ...settings.value, ...(data.settings || {}) }
    showToast('Paramètres sauvegardés')
  } catch (e) {
    showToast(e.response?.data?.message || 'Erreur lors de la sauvegarde', 'error')
  } finally {
    saving.value = false
  }
}

const uploadAsset = async (event, type) => {
  const file = event.target.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('image', file)
  try {
    const { data } = await api.post(`/shop-settings/asset/${type}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    settings.value = { ...settings.value, ...(data.settings || {}) }
    showToast('Image enregistrée')
  } catch (e) {
    showToast(e.response?.data?.message || 'Erreur upload', 'error')
  } finally {
    event.target.value = ''
  }
}

onMounted(load)
</script>

<style scoped>
.page { padding: 4px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.header__title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; }
.header__desc { color: #64748b; margin-top: 4px; font-weight: 600; }
.btn-save { background: #2563eb; color: #fff; border: none; border-radius: 12px; padding: 12px 18px; font-weight: 800; cursor: pointer; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.loading { padding: 32px; color: #64748b; font-weight: 800; }
.sections { display: grid; gap: 16px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05); }
.card__title { margin: 0 0 14px; color: #0f172a; font-size: 18px; font-weight: 900; }
.grid2, .grid3, .grid4 { display: grid; gap: 14px; }
.grid2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.field { display: grid; gap: 6px; }
.field label, .color-field span { color: #334155; font-size: 13px; font-weight: 800; }
.input { width: 100%; border: 2px solid #e2e8f0; border-radius: 12px; padding: 11px 12px; font: inherit; font-weight: 700; color: #0f172a; background: #f8fafc; }
.input:focus { outline: none; border-color: #2563eb; background: #fff; }
.textarea { min-height: 90px; resize: vertical; }
.textarea--large { min-height: 160px; }
.theme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.theme-grid h4 { margin: 0 0 12px; color: #1e3a8a; font-weight: 900; }
.color-field { display: grid; grid-template-columns: 1fr 44px 120px; align-items: center; gap: 10px; margin-bottom: 10px; }
.color-field input[type="color"] { width: 44px; height: 40px; border: 0; background: transparent; cursor: pointer; }
.color-extra { margin-top: 16px; }
.toggles { display: grid; gap: 12px; }
.toggle { display: flex; align-items: center; gap: 10px; color: #0f172a; font-weight: 800; }
.toggle input { width: 18px; height: 18px; accent-color: #2563eb; }
.toast { position: fixed; right: 18px; bottom: 18px; padding: 12px 16px; border-radius: 12px; background: #16a34a; color: #fff; font-weight: 800; box-shadow: 0 12px 30px rgba(0,0,0,0.16); z-index: 80; }
.toast--error { background: #dc2626; }
.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
@media (max-width: 900px) {
  .grid2, .grid3, .grid4, .theme-grid { grid-template-columns: 1fr; }
  .color-field { grid-template-columns: 1fr 44px; }
  .color-field .input { grid-column: 1 / -1; }
}
</style>
