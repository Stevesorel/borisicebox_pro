
<template>
  <div class="commande-page">
    <div class="commande-page__container">
      
      <div class="commande-page__header">
        <h1 class="commande-page__title">{{ $t('checkout.title') }}</h1>
        <div class="commande-page__steps">
          <span class="commande-page__step commande-page__step--active">1. {{ $t('checkout.step1') }}</span>
          <span class="commande-page__step-separator">→</span>
          <span class="commande-page__step">2. {{ $t('checkout.step2') }}</span>
          <span class="commande-page__step-separator">→</span>
          <span class="commande-page__step">3. {{ $t('checkout.step3') }}</span>
        </div>
      </div>

      <div class="commande-layout">
        
        <div class="commande-form">

          <div class="form-section">
            <div class="form-section__header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="10" cy="8" r="4"/><path d="M3 18C3 14 6 12 10 12C14 12 17 14 17 18"/>
              </svg>
              <h3>{{ $t('checkout.info') }}</h3>
            </div>

            <div class="form-row">
              <div class="field" :class="{ 'field--error': erreurs.nom_client, 'field--success': form.nom_client && !erreurs.nom_client }">
                <label>{{ $t('checkout.name') }} <span class="field__required">*</span></label>
                <input v-model="form.nom_client" :placeholder="$t('checkout.namePlaceholder')" class="field__input" />
                <span v-if="erreurs.nom_client" class="field__error">{{ erreurs.nom_client }}</span>
              </div>

              <div class="field" :class="{ 'field--error': erreurs.telephone, 'field--success': form.telephone && !erreurs.telephone }">
                <label>{{ $t('checkout.phone') }} <span class="field__required">*</span></label>
                <input v-model="form.telephone" :placeholder="$t('checkout.phonePlaceholder')" type="tel" class="field__input" />
                <span v-if="erreurs.telephone" class="field__error">{{ erreurs.telephone }}</span>
              </div>
            </div>

              <div class="form-row">
              <div class="field" :class="{ 'field--error': erreurs.zone_id, 'field--success': form.zone_id && !erreurs.zone_id }">
                <label>{{ $t('checkout.zone') }} <span class="field__required">*</span></label>
                <select v-model="form.zone_id" class="field__input field__select">
                  <option value="">{{ $t('checkout.selectZone') }}</option>
                  <option v-for="z in zones" :key="z.id" :value="z.id">
                    {{ z.nom }} — {{ formatPrice(z.frais) }}
                  </option>
                </select>
                <span v-if="erreurs.zone_id" class="field__error">{{ erreurs.zone_id }}</span>
              </div>

              <!-- <div class="field">
                <label>{{ $t('checkout.note') }}</label>
                <textarea v-model="form.note" :placeholder="$t('checkout.notePlaceholder')" rows="2" class="field__input"></textarea>
              </div> -->
            </div>

            <div class="field" :class="{ 'field--error': erreurs.adresse, 'field--success': form.adresse && !erreurs.adresse }">
              <label>{{ $t('checkout.address') }} <span class="field__required">*</span></label>
              <textarea v-model="form.adresse" :placeholder="$t('checkout.addressPlaceholder')" rows="3" class="field__input"></textarea>
              <span v-if="erreurs.adresse" class="field__error">{{ erreurs.adresse }}</span>
            </div>

            
          </div>

          <div class="form-section">
            <div class="form-section__header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="2" y="4" width="16" height="12" rx="2"/><path d="M2 8H18"/>
              </svg>
              <h3>{{ $t('checkout.payment') }}</h3>
            </div>

            <div class="payment-options">
              <label class="payment-option" :class="{ 'payment-option--selected': form.paiement === 'livraison' }">
                <input type="radio" v-model="form.paiement" value="livraison" />
                <span class="payment-option__icon" aria-hidden="true">💵</span>
                <div class="payment-option__info">
                  <strong>{{ $t('checkout.cash') }}</strong>
                  <p>{{ $t('checkout.cashDesc') }}</p>
                </div>
                <span class="payment-option__check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 8L6 11L13 5"/></svg>
                </span>
              </label>

              <!-- <label class="payment-option" :class="{ 'payment-option--selected': form.paiement === 'mobile_money' }">
                <input type="radio" v-model="form.paiement" value="mobile_money" />
                <span class="payment-option__icon" aria-hidden="true">📱</span>
                <div class="payment-option__info">
                  <strong>{{ $t('checkout.mobileMoney') }}</strong>
                  <p>{{ $t('checkout.mobileMoneyDesc') }}</p>
                </div>
                <span class="payment-option__check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 8L6 11L13 5"/></svg>
                </span>
              </label> -->
            </div>
          </div>

          <button class="submit-btn" @click="passer" :disabled="loading">
            <template v-if="loading">
              <span class="submit-btn__spinner"></span>
              {{ $t('checkout.submitting') }}
            </template>
            <template v-else>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M3 10L6 13L15 5"/>
              </svg>
              {{ $t('checkout.submit') }}
            </template>
          </button>
        </div>

        <aside class="commande-recap">
          <h3 class="commande-recap__title">{{ $t('checkout.myOrder') }}</h3>
          
          <div class="commande-recap__items">
            <div v-for="item in panier.items" :key="`${item.id}-${item.image || 'noimg'}-${item.personnalisation || 'noperso'}`" class="recap-item">
              <img v-if="item.image" :src="imgUrl(item.image)" class="recap-item__image" :alt="item.nom" />
              <span class="recap-item__qty">{{ item.quantite }}×</span>
              <div class="recap-item__details">
                <span class="recap-item__name">{{ item.nom }}</span>
                <span v-if="item.couleur" class="recap-item__meta">🎨 {{ item.couleur }}</span>
                <span v-if="item.personnalisation" class="recap-item__perso">✏️ {{ item.personnalisation }}</span>
              </div>
              <strong class="recap-item__price">{{ formatPrice(item.prix * item.quantite) }}</strong>
            </div>
          </div>

          <div class="commande-recap__line">
            <span>{{ $t('cart.subtotal') }}</span>
            <strong>{{ formatPrice(panier.sousTotal) }}</strong>
          </div>
          
          <div class="commande-recap__line">
            <span>{{ $t('cart.delivery') }}</span>
            <strong v-if="fraisLivraison !== null" class="commande-recap__livraison">
              {{ formatPrice(fraisLivraison) }}
            </strong>
            <span v-else class="commande-recap__muted">—</span>
          </div>
          
          <div class="commande-recap__total">
            <span>{{ $t('cart.total') }}</span>
            <strong>{{ formatPrice(panier.sousTotal + (fraisLivraison || 0)) }}</strong>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import api, { formatPrice, imgUrl } from '@/services/api'
import { usePanierStore } from '@/stores/panier'
import { useToastStore } from '@/stores/toast'

const panier  = usePanierStore()
const router  = useRouter()
const toast   = useToastStore()
const { t } = useI18n()
const localePath = useLocalePath()
const zones   = ref([])
const loading = ref(false)

const form = ref({
  nom_client: '',
  telephone:  '',
  adresse:    '',
  zone_id:    '',
  note:       '',
  paiement:   'livraison'
})

const erreurs = ref({
  nom_client: '',
  telephone:  '',
  adresse:    '',
  zone_id:    ''
})

const fraisLivraison = computed(() => {
  if (!form.value.zone_id) return null
  const targetId = Number(form.value.zone_id)
  if (isNaN(targetId)) return null
  
  const z = zones.value.find(z => z.id === targetId)
  return z ? Number(z.frais) : null
})

onMounted(async () => {
  if (!panier.items || !panier.items.length) {
    router.push(localePath('/panier'))
    return
  }
  try {
    const { data } = await api.get('/zones')
    zones.value = Array.isArray(data) ? data.filter(z => z.actif) : []
  } catch {
    toast.error(t('checkout.zonesError'))
  }
})

// Nettoyage de sécurité contre les failles d'injection (XSS)
const sanitizeInput = (text) => {
  if (!text) return ''
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
}

const valider = () => {
  erreurs.value = { nom_client: '', telephone: '', adresse: '', zone_id: '' }
  let ok = true

  const nomClean = form.value.nom_client?.trim()
  if (!nomClean) {
    erreurs.value.nom_client = t('checkout.requiredName')
    ok = false
  } else if (nomClean.length < 3 || nomClean.length > 50) {
    erreurs.value.nom_client = t('checkout.invalidName')
    ok = false
  }

  // On retire espaces/tirets puis on valide le format camerounais attendu par le backend.
  const telClean = form.value.telephone?.replace(/[\s-]/g, '').trim()
  if (!telClean) {
    erreurs.value.telephone = t('checkout.requiredPhone')
    ok = false
  } else if (!/^(\+237|237)?[6-9][0-9]{8}$/.test(telClean)) {
    erreurs.value.telephone = t('checkout.invalidPhone')
    ok = false
  }

  const adresseClean = form.value.adresse?.trim()
  if (!adresseClean) {
    erreurs.value.adresse = t('checkout.requiredAddress')
    ok = false
  } else if (adresseClean.length < 5 || adresseClean.length > 250) {
    erreurs.value.adresse = t('checkout.invalidAddress')
    ok = false
  }

  if (!form.value.zone_id || isNaN(Number(form.value.zone_id))) {
    erreurs.value.zone_id = t('checkout.selectZoneError')
    ok = false
  }

  const paiementsAutorises = ['livraison', 'mobile_money']
  if (!paiementsAutorises.includes(form.value.paiement)) {
    toast.error(t('checkout.invalidPayment'))
    ok = false
  }

  return ok
}

const passer = async () => {
  if (loading.value) return // Anti Double-clic destructeur
  
  if (!valider()) {
    toast.warning(t('checkout.fixErrors'))
    return
  }

  if (!panier.items || panier.items.length === 0) {
    toast.error(t('cart.emptyError'))
    return
  }

  loading.value = true
  try {
    const payload = {
      nom_client: sanitizeInput(form.value.nom_client),
      telephone:  sanitizeInput(form.value.telephone).replace(/[\s-]/g, ''),
      adresse:    sanitizeInput(form.value.adresse),
      zone_id:    Number(form.value.zone_id),
      note:       sanitizeInput(form.value.note).substring(0, 500),
      paiement:   form.value.paiement,
      produits:   panier.items.map(i => ({
        produit_id:             Number(i.id),
        nom_produit:            sanitizeInput(i.nom),
        image_produit:          i.image || null,
        prix_unitaire:          Number(i.prix),
        quantite:               Math.max(1, Math.floor(Number(i.quantite))),
        prix_total:             Number(i.prix) * Math.max(1, Math.floor(Number(i.quantite))),
        couleur:                i.couleur ? sanitizeInput(i.couleur).substring(0, 50) : null,
        personnalisation:       i.personnalisation ? sanitizeInput(i.personnalisation).substring(0, 200) : null,
        frais_personnalisation: Number(i.frais_personnalisation || 0)
      }))
    }

    const { data } = await api.post('/commandes', payload)
    panier.vider()
    toast.success(t('checkout.orderSuccess'))
    router.push({ path: localePath('/merci'), query: { ref: data.reference } })
  } catch (e) {
    const msg = e.response?.data?.message || t('checkout.orderError')
    toast.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ==========================================================================
   1. VARIABLES & THÈME (Adaptabilité automatique)
   ========================================================================== */
:host, .commande-page {
  --co-primary: var(--accent, #3b82f6);
  --co-primary-hover: var(--accent-hover, #1d4ed8);
  --co-primary-light: var(--accent-light, #eff6ff);
  --co-bg: var(--bg-primary, #f8fafc);
  --co-surface: var(--surface, #ffffff);
  --co-border: var(--border, #e2e8f0);
  --co-text: var(--text-primary, #0f172a);
  --co-text-muted: var(--text-muted, #64748b);
  --co-error: #ef4444;
  --co-radius-lg: 16px;
  --co-radius-md: 12px;
  --co-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --co-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Base Page */
.commande-page {
  padding: 2rem 1rem 4rem;
  min-height: 100vh;
  background-color: var(--co-bg);
  color: var(--co-text);
  font-family: var(--font-ui);
  transition: var(--co-transition);
}

.commande-page__container {
  max-width: 1140px;
  margin: 0 auto;
}

/* ==========================================================================
   2. HEADER & FIL D'ARIANE (Steps)
   ========================================================================== */
.commande-page__header {
  margin-bottom: 2.5rem;
  text-align: left;
}

.commande-page__title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.75rem;
}

.commande-page__steps {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--co-text-muted);
}

.commande-page__step--active {
  color: var(--co-primary);
  font-weight: 700;
}

.commande-page__step-separator {
  color: var(--co-border);
}

/* ==========================================================================
   3. LAYOUT PRINCIPAL (Grid 2 Colonnes)
   ========================================================================== */
.commande-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

@media (min-width: 992px) {
  .commande-layout {
    grid-template-columns: 1fr 400px;
  }
}

/* ==========================================================================
   4. FORMULAIRE & SECTIONS
   ========================================================================== */
.commande-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background-color: var(--co-surface);
  border: 1px solid var(--co-border);
  border-radius: var(--co-radius-lg);
  padding: 1.75rem;
  box-shadow: var(--co-shadow);
}

.form-section__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--co-border);
}

.form-section__header svg {
  color: var(--co-primary);
}

.form-section__header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

/* Champs de saisie (Inputs & Labels) */
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--co-text-muted);
  margin-bottom: 0.5rem;
}

.field__required {
  color: var(--co-error);
}

.field__input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--co-border);
  border-radius: var(--co-radius-md);
  font-size: 0.95rem;
  background-color: var(--co-surface);
  color: var(--co-text);
  box-sizing: border-box;
  transition: var(--co-transition);
}

.field__input:focus {
  border-color: var(--co-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.field__input::placeholder {
  color: var(--co-text-muted);
  opacity: 0.6;
}

/* Style spécifique Select */
.field__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

/* GESTION VISUELLE : ERREURS (Résout définitivement le problème du texte blanc/invisible) */
.field--error .field__input {
  border-color: var(--co-error) !important;
  background-color: #fef2f2 !important; 
  color: #991b1b !important;            
}

.field--error .field__input:focus {
  background-color: var(--co-surface) !important;
  color: var(--co-text) !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

.field__error {
  display: block;
  color: var(--co-error);
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* GESTION VISUELLE : SUCCÈS (Les champs valides s'illuminent en vert émeraude doux) */
.field--success .field__input {
  border-color: #10b981 !important;     
  background-color: #f0fdf4 !important; 
  color: #065f46 !important;            
}

.field--success .field__input:focus {
  background-color: var(--co-surface) !important;
  color: var(--co-text) !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
}

/* ==========================================================================
   5. OPTIONS DE PAIEMENT (Cartes Radio de luxe)
   ========================================================================== */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid var(--co-border);
  border-radius: var(--co-radius-md);
  cursor: pointer;
  position: relative;
  transition: var(--co-transition);
}

.payment-option:hover {
  border-color: var(--co-primary);
  background-color: var(--co-bg);
}

.payment-option--selected {
  border-color: var(--co-primary);
  background-color: var(--co-primary-light);
}

.payment-option input[type="radio"] {
  display: none;
}

.payment-option__icon {
  font-size: 1.75rem;
  line-height: 1;
}

.payment-option__info {
  flex: 1;
}

.payment-option__info strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--co-text);
}

.payment-option__info p {
  font-size: 0.85rem;
  color: var(--co-text-muted);
  margin: 0;
}

.payment-option__check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--co-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: var(--co-transition);
}

.payment-option--selected .payment-option__check {
  background-color: var(--co-primary);
  border-color: var(--co-primary);
  color: #ffffff;
}

/* ==========================================================================
   6. BOUTON DE SOUMISSION (Submit avec effet micro-interactions)
   ========================================================================== */
.submit-btn {
  width: 100%;
  padding: 1.1rem 2rem;
  background-color: var(--co-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--co-radius-md);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  transition: var(--co-transition);
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--co-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.submit-btn__spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ==========================================================================
   7. BLOC RÉCAPITULATIF (Sticky Sidebar de droite)
   ========================================================================== */
.commande-recap {
  background-color: var(--co-surface);
  border: 1px solid var(--co-border);
  border-radius: var(--co-radius-lg);
  padding: 1.75rem;
  box-shadow: var(--co-shadow);
  position: sticky;
  top: 2rem;
}

.commande-recap__title {
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--co-border);
}

.commande-recap__items {
  margin-bottom: 1.25rem;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.commande-recap__items::-webkit-scrollbar {
  width: 4px;
}
.commande-recap__items::-webkit-scrollbar-thumb {
  background: var(--co-border);
  border-radius: 4px;
}

.recap-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px dashed var(--co-border);
}

.recap-item:last-child {
  border-bottom: none;
}

.recap-item__qty {
  background-color: var(--co-bg);
  color: var(--co-text-muted);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.recap-item__image {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--co-border);
  flex-shrink: 0;
}

.recap-item__details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recap-item__name {
  font-weight: 500;
  font-size: 0.9rem;
}

.recap-item__meta {
  font-size: 0.75rem;
  color: var(--co-text-muted);
}

.recap-item__perso {
  font-size: 0.75rem;
  color: var(--co-primary);
  font-style: italic;
}

.recap-item__price {
  font-size: 0.9rem;
  font-weight: 600;
}

/* Calculs financiers */
.commande-recap__line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: 0.9rem;
  color: var(--co-text-muted);
}

.commande-recap__line strong {
  color: var(--co-text);
  font-weight: 600;
}

.commande-recap__livraison {
  color: var(--co-primary);
  font-weight: 600;
}

.commande-recap__muted {
  color: var(--co-text-muted);
}

.commande-recap__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--co-border);
  font-size: 1rem;
  font-weight: 700;
}

.commande-recap__total strong {
  font-size: 1.5rem;
  color: var(--co-primary);
  letter-spacing: -0.02em;
}

/* ==========================================================================
   8. ANIMATIONS & REQUÊTES MÉDIAS (Responsive)
   ========================================================================== */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .commande-recap {
    position: static;
  }
}

@media (max-width: 768px) {
  .commande-page__title {
    font-size: 1.75rem;
  }
  .commande-page__steps {
    display: none;
  }
  .form-section, .commande-recap {
    padding: 1.25rem;
    border-radius: var(--co-radius-md);
  }
}
</style>
