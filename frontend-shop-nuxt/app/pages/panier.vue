<template>
  <div class="panier-page">
    <div class="panier-page__container">
      
      <!-- Header -->
      <div class="panier-page__header">
        <h1 class="panier-page__title">{{ $t('cart.title') }}</h1>
        <p v-if="panier.items.length > 0" class="panier-page__count">
          {{ panier.items.length }} {{ $t('cart.item', panier.items.length) }}
        </p>
      </div>

      <!-- Panier vide -->
      <div v-if="panier.items.length === 0" class="empty-cart">
        <div class="empty-cart__illustration">
          <span class="empty-cart__emoji" aria-hidden="true">🛒</span>
          <div class="empty-cart__circle"></div>
        </div>
        <h2 class="empty-cart__title">{{ $t('cart.empty') }}</h2>
        <p class="empty-cart__desc">{{ $t('cart.emptyDesc') }}</p>
        <NuxtLinkLocale to="/boutique" class="empty-cart__btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 3H5L6 8M6 8H15L17 14H7L6 8Z"/>
          </svg>
          {{ $t('cart.emptyCta') }}
        </NuxtLinkLocale>
      </div>

      <!-- Panier rempli -->
      <div v-else class="cart-layout">
        
        <div class="cart-items">
          <div 
            v-for="item in panier.items" 
            :key="`${item.id}-${item.image || 'noimg'}-${item.personnalisation || 'noperso'}`"
            class="cart-item"
          >
            <div class="cart-item__img">
              <img v-if="item.image" :src="imgUrl(item.image)" :alt="item.nom" />
              <span v-else class="cart-item__img-placeholder" aria-hidden="true">📦</span>
            </div>

            <div class="cart-item__info">
              <h4 class="cart-item__name">{{ item.nom }}</h4>
              <p class="cart-item__price">
                <span v-if="item.remise_gros_active" class="cart-item__old-price">{{ formatPrice(item.prix_standard) }}</span>
                {{ formatPrice(item.prix_base) }}
                <span v-if="item.frais_personnalisation > 0" class="cart-item__frais">
                  + {{ formatPrice(item.frais_personnalisation) }} {{ $t('cart.engraving') }}
                </span>
              </p>
              <p v-if="item.remise_gros_active" class="cart-item__bulk cart-item__bulk--active">
                {{ $t('cart.bulkActive', { count: item.prix_gros_min_quantite }) }}
              </p>
              <p
                v-else-if="item.prix_gros_actif && item.prix_gros_min_quantite > productCartQuantity(item.id)"
                class="cart-item__bulk"
              >
                {{ $t('cart.bulkHint', { count: item.prix_gros_min_quantite - productCartQuantity(item.id), price: formatPrice(item.prix_gros) }) }}
              </p>
              <p v-if="item.couleur" class="cart-item__couleur">
                🎨 {{ $t('cart.color') }} : <strong>{{ item.couleur }}</strong>
              </p>
              <p v-if="item.personnalisation" class="cart-item__perso">
                ✏️ {{ item.personnalisation }}
              </p>
            </div>

            <div class="cart-item__qty">
              <button class="cart-item__qty-btn" @click="decrement(item)" :aria-label="$t('cart.decrease')">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 7H11"/></svg>
              </button>
              <span class="cart-item__qty-value">{{ item.quantite }}</span>
              <button class="cart-item__qty-btn" @click="panier.setQuantite(item.id, item.quantite + 1, item.personnalisation, item.image)" :aria-label="$t('cart.increase')">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 3V11M3 7H11"/></svg>
              </button>
            </div>

            <strong class="cart-item__total">{{ formatPrice(item.prix * item.quantite) }}</strong>

            <button class="cart-item__remove" @click="panier.retirer(item.id, item.personnalisation, item.image)" :title="$t('cart.remove')" :aria-label="$t('cart.remove')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4H14M5 4V2H11V4M6 7V11M10 7V11M3 4L4 14H12L13 4"/></svg>
            </button>
          </div>
        </div>

        <aside class="cart-recap">
          <h3 class="cart-recap__title">{{ $t('cart.summary') }}</h3>
          
          <div class="cart-recap__line"><span>{{ $t('cart.subtotal') }}</span><strong>{{ formatPrice(panier.sousTotal) }}</strong></div>
          <div class="cart-recap__line"><span>{{ $t('cart.delivery') }}</span><span class="cart-recap__muted">{{ $t('cart.deliveryCalc') }}</span></div>
          <div class="cart-recap__line cart-recap__line--total"><span>{{ $t('cart.total') }}</span><strong>{{ formatPrice(panier.sousTotal) }}</strong></div>

          <div class="cart-recap__actions">
            <NuxtLinkLocale to="/commande" class="cart-recap__btn cart-recap__btn--primary">
              {{ $t('cart.order') }}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4L11 8L6 12"/></svg>
            </NuxtLinkLocale>
            
            <!-- Bouton WhatsApp -->
            <button class="cart-recap__btn cart-recap__btn--whatsapp" @click="showWaForm = true">
              <WhatsAppIcon size="18" />
              {{ $t('cart.whatsappOrder') }}
            </button>
            
            <NuxtLinkLocale to="/boutique" class="cart-recap__btn cart-recap__btn--outline">{{ $t('cart.continue') }}</NuxtLinkLocale>
            
            <button class="cart-recap__clear" @click="confirmVider">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4H12M5 4V2H9V4M3 4L4 12H10L11 4"/></svg>
              {{ $t('cart.clear') }}
            </button>
          </div>
        </aside>
      </div>

      <!-- Modal WhatsApp -->
      <Transition name="modal">
        <div v-if="showWaForm" class="modal-overlay" @click.self="showWaForm = false">
          <div class="modal-wa">
            <h3>📱 {{ $t('cart.whatsappTitle') }}</h3>
            <p>{{ $t('cart.whatsappDesc') }}</p>
            
            <div class="field">
              <label>{{ $t('cart.whatsappName') }} <span class="required">*</span></label>
              <input v-model="waForm.nom" :placeholder="$t('checkout.namePlaceholder')" />
            </div>
            
            <div class="field">
              <label>{{ $t('cart.whatsappPhone') }} <span class="required">*</span></label>
              <input v-model="waForm.telephone" :placeholder="$t('checkout.phonePlaceholder')" type="tel" />
            </div>
            
            <div class="modal-wa__actions">
              <button class="btn-secondary" @click="showWaForm = false">{{ $t('cart.cancel') }}</button>
              <button class="cart-recap__btn cart-recap__btn--whatsapp" @click="commanderWhatsapp" :disabled="!waForm.nom || !waForm.telephone || waLoading ">
                <WhatsAppIcon size="18" />
                {{ $t('cart.whatsappSend') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePanierStore } from '@/stores/panier'
import { imgUrl, formatPrice } from '@/services/api'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { useShopSettingsStore } from '@/stores/shopSettings'

const panier = usePanierStore()
const toast  = useToastStore()
const shop = useShopSettingsStore()
await shop.loadPublic()
const { t, locale } = useI18n()
const showWaForm = ref(false)
const waLoading  = ref(false)
const waForm = ref({ nom: '', telephone: '' })


const decrement = (item) => {
  if (item.quantite <= 1) { panier.retirer(item.id, item.personnalisation, item.image) }
  else { panier.setQuantite(item.id, item.quantite - 1, item.personnalisation, item.image) }
}

const productCartQuantity = (productId) =>
  panier.items
    .filter((item) => item.id === productId)
    .reduce((sum, item) => sum + Number(item.quantite || 0), 0)

const whatsappLink = computed(() => {
  const phone = String(shop.settings.whatsapp_number || '').replace(/\D/g, '')
  const template = t('cart.whatsappMessage.title', { brand: shop.settings.shop_name })
  const introTemplate = shop.settings[`whatsapp_order_template_${locale.value === 'en' ? 'en' : 'fr'}`] || ''
  let message = `🛒 *${template}*\n`
  if (introTemplate) {
    message += `${introTemplate.replaceAll('{brand}', shop.settings.shop_name)}\n`
  }
  message += '\n'
  message += `👤 *${t('cart.whatsappMessage.client')} :* ${waForm.value.nom || ''}\n`
  message += `📞 *${t('cart.whatsappMessage.phone')} :* ${waForm.value.telephone || ''}\n\n`
  message += `📦 *${t('cart.whatsappMessage.products')} :*\n`
  
  panier.items.forEach((item, index) => {
    message += `\n${index + 1}. *${item.nom}*\n`
    message += `   💰 ${t('cart.whatsappMessage.unitPrice')} : ${formatPrice(item.prix)}\n`
    message += `   📦 ${t('cart.whatsappMessage.quantity')} : ${item.quantite}\n`
    message += `   💵 ${t('cart.whatsappMessage.total')} : ${formatPrice(item.prix * item.quantite)}\n`
    if (item.couleur) message += `   🎨 ${t('cart.whatsappMessage.color')} : ${item.couleur}\n`
    if (item.personnalisation) message += `   🎨 ${t('cart.whatsappMessage.personalization')} : ${item.personnalisation}\n`
  })
  
  message += '\n──────────────────\n'
  message += `\n💵 *${t('cart.whatsappMessage.total').toUpperCase()} : ${formatPrice(panier.sousTotal)}*\n`
  message += `📦 *${t('cart.whatsappMessage.items')} : ${panier.count}*\n\n`
  message += `${t('cart.whatsappMessage.thanks')} 🙏`
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
})

const commanderWhatsapp = async () => {
  if (waLoading.value) return
  const nom = waForm.value.nom?.trim()
  const tel = waForm.value.telephone?.replace(/[\s-]/g, '').trim()

  if (!nom || nom.length < 2 || nom.length > 100) {
    toast.error(t('cart.validNameError'))
    return
  }
  if (!tel || !/^(\+237|237)?[6-9][0-9]{8}$/.test(tel)) {
    toast.error(t('cart.validPhoneError'))
    return
  }
  if (!panier.items || panier.items.length === 0) {
    toast.error(t('cart.emptyError'))
    return
  }

  waLoading.value = true

  // ✅ On capture le lien AVANT toute modification du panier
  const lienFinal = whatsappLink.value

  const sanitize = (text) => text ? text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim() : ''

  try {
    await api.post('/whatsapp-commandes', {
      nom_client: sanitize(nom),
      telephone:  sanitize(tel),
      produits: panier.items.map(i => ({
        nom:             sanitize(i.nom),
        prix:            Number(i.prix),
        quantite:        Math.max(1, Math.floor(Number(i.quantite))),
        total:           Number(i.prix) * Math.max(1, Math.floor(Number(i.quantite))),
        image_produit:   i.image || null,
        couleur:         i.couleur ? sanitize(i.couleur).substring(0, 50) : null,
        personnalisation: i.personnalisation ? sanitize(i.personnalisation).substring(0, 200) : null
      })),
      total: Number(panier.sousTotal),
      lien_whatsapp: lienFinal?.substring(0, 500)
    })
  } catch (e) {
    const msg = e.response?.data?.message || t('cart.sendError')
    toast.error(msg)
    waLoading.value = false
    return
  }

  panier.vider()
  window.open(lienFinal, '_blank') // ✅ on réutilise la valeur capturée
  showWaForm.value = false
  waForm.value = { nom: '', telephone: '' }
  waLoading.value = false
}




const confirmVider = () => {
  if (confirm(t('cart.clearConfirm'))) { panier.vider() }
}
</script>

<style scoped>
/* WhatsApp */
.cart-recap__btn--whatsapp { background: #25D366; color: #fff; border: none; box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
.cart-recap__btn--whatsapp:hover { background: #20bd5a; color: #fff; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,0.4); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 16px; }
.modal-wa { background: #fff; border-radius: 20px; padding: 28px; width: 100%; max-width: 420px; }
.modal-wa h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.modal-wa p { color: #64748b; margin-bottom: 20px; font-size: 14px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; }
.field input { width: 100%; padding: 10px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
.field input:focus { border-color: #3b82f6; outline: none; }
.required { color: #dc2626; }
.modal-wa__actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; flex-wrap: wrap; }
.btn-secondary { background: #f1f5f9; color: #475569; padding: 10px 20px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-wa { transform: scale(0.95); }


.cart-item__frais {
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
}

.cart-item__old-price {
  color: var(--text-muted);
  text-decoration: line-through;
  margin-right: 6px;
}

.cart-item__bulk {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-top: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.cart-item__bulk--active {
  background: color-mix(in srgb, #16A34A 12%, transparent);
  color: #15803D;
}

.cart-item__couleur {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.cart-item__couleur strong {
  color: var(--text-primary);
}

.cart-item__perso {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 4px;
  background: var(--bg-secondary);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
}





/* Layout */
.panier-page { padding: 40px 0 80px; min-height: 60vh; background: var(--bg-primary); transition: background 0.3s ease; }
@media (min-width: 768px) { .panier-page { padding: 56px 0 100px; } }
.panier-page__container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.panier-page__header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 36px; flex-wrap: wrap; gap: 8px; }
.panier-page__title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
@media (min-width: 768px) { .panier-page__title { font-size: 36px; } }
.panier-page__count { color: var(--text-muted); font-size: 14px; }

.empty-cart { text-align: center; padding: 80px 20px; }
.empty-cart__illustration { position: relative; width: 120px; height: 120px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
.empty-cart__emoji { font-size: 56px; position: relative; z-index: 1; animation: float 3s ease-in-out infinite; }
.empty-cart__circle { position: absolute; width: 100%; height: 100%; background: var(--accent-light); border-radius: 50%; opacity: 0.5; animation: pulse 3s ease-in-out infinite; }
.empty-cart__title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.empty-cart__desc { color: var(--text-muted); margin-bottom: 28px; font-size: 14px; }
.empty-cart__btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--accent); color: #fff; border-radius: 999px; font-weight: 600; font-size: 15px; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59,130,246,0.3); }
.empty-cart__btn:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.4); }

.cart-layout { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: start; }
@media (min-width: 900px) { .cart-layout { grid-template-columns: 1fr 360px; gap: 36px; } }
.cart-items { display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; transition: all 0.3s ease; flex-wrap: wrap; }
@media (min-width: 600px) { .cart-item { gap: 16px; padding: 16px 20px; flex-wrap: nowrap; } }
.cart-item:hover { box-shadow: var(--shadow-md); border-color: var(--accent); }
.cart-item__img { width: 72px; height: 72px; border-radius: 12px; overflow: hidden; background: var(--bg-secondary); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
@media (min-width: 600px) { .cart-item__img { width: 80px; height: 80px; } }
.cart-item__img img { width: 100%; height: 100%; object-fit: cover; }
.cart-item__img-placeholder { font-size: 28px; }
.cart-item__info { flex: 1; min-width: 120px; }
.cart-item__name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; line-height: 1.3; }
.cart-item__price { font-size: 13px; color: var(--text-muted); }
.cart-item__qty { display: flex; align-items: center; border: 2px solid var(--border); border-radius: 999px; overflow: hidden; flex-shrink: 0; }
.cart-item__qty-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: var(--bg-secondary); border: none; color: var(--text-primary); cursor: pointer; transition: all 0.2s ease; }
.cart-item__qty-btn:hover { background: var(--border); color: var(--accent); }
.cart-item__qty-value { min-width: 40px; text-align: center; font-weight: 700; font-size: 14px; color: var(--text-primary); }
.cart-item__total { font-size: 16px; font-weight: 700; color: var(--text-primary); min-width: 100px; text-align: right; flex-shrink: 0; }
.cart-item__remove { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; background: none; border: 1px solid transparent; border-radius: 10px; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; }
.cart-item__remove:hover { color: #dc2626; background: #fef2f2; border-color: #fecaca; }

.cart-recap { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; position: sticky; top: calc(64px + 24px); }
.cart-recap__title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.cart-recap__line { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 14px; color: var(--text-secondary); }
.cart-recap__line strong { color: var(--text-primary); font-weight: 600; }
.cart-recap__line:not(:last-of-type) { border-bottom: 1px solid var(--border); }
.cart-recap__muted { color: var(--text-muted); font-size: 13px; font-style: italic; }
.cart-recap__line--total { padding: 18px 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
.cart-recap__line--total strong { font-size: 22px; color: var(--accent); }
.cart-recap__actions { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
.cart-recap__btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 20px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; transition: all 0.3s ease; }
.cart-recap__btn--primary { background: var(--accent); color: #fff; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
.cart-recap__btn--primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59,130,246,0.4); }
.cart-recap__btn--outline { background: var(--surface); color: var(--text-primary); border: 2px solid var(--border); }
.cart-recap__btn--outline:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }
.cart-recap__clear { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; background: none; border: 1px solid transparent; border-radius: 12px; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
.cart-recap__clear:hover { color: #dc2626; background: #fef2f2; border-color: #fecaca; }

@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.1);opacity:0.3} }

@media (max-width: 599px) {
  .cart-item { padding: 12px; gap: 10px; }
  .cart-item__img { width: 60px; height: 60px; }
  .cart-item__name { font-size: 13px; }
  .cart-item__qty { order: 1; }
  .cart-item__total { order: 2; min-width: auto; margin-left: auto; }
  .cart-item__remove { order: 3; }
  .cart-item__info { flex: 1 1 60%; }
  .cart-recap { position: static; }
}
@media (max-width: 380px) {
  .cart-item__qty-btn { width: 28px; height: 28px; }
  .cart-item__qty-value { min-width: 32px; font-size: 12px; }
  .cart-item__total { font-size: 14px; }
}
</style>
