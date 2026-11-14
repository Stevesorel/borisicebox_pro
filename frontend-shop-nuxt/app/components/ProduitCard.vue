<template>
  <div class="prod-card" @click="goDetail">
    <!-- Image -->
    <div class="prod-card__img-wrap">
      <img
        v-if="produit.image_principale"
        :src="imgUrl(produit.image_principale)"
        :alt="produit.nom"
        class="prod-card__img"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="prod-card__img-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>

      <!-- Badge catégorie -->
      <span v-if="produit.Categorie" class="prod-card__badge">
        {{ produit.Categorie.nom }}
      </span>

      <!-- Badge réduction -->
      <span v-if="hasPromo" class="prod-card__discount">
        -{{ promoPercent }}%
      </span>

      <!-- Quick cart -->
      <button class="prod-card__quick" @click.stop="addToCart" :title="$t('productCard.addNamedToCart', { name: produit.nom })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </button>
    </div>

    <!-- Infos -->
    <div class="prod-card__body">
      <!-- Catégorie -->
      <span v-if="produit.Categorie" class="prod-card__cat">{{ produit.Categorie.nom }}</span>
      
      <!-- Prix EN HAUT -->
      <div class="prod-card__prices">
        <strong class="prod-card__price" :class="{ 'prod-card__price--promo': hasPromo }">
          {{ formatPrice(effectivePrice) }}
        </strong>
        <span v-if="hasPromo" class="prod-card__old-price">
          {{ formatPrice(produit.prix_base) }}
        </span>
      </div>
      <span v-if="hasWholesaleOffer" class="prod-card__bulk">
        {{ $t('product.wholesaleShort', { count: produit.prix_gros_min_quantite, price: formatPrice(produit.prix_gros) }) }}
      </span>

      <!-- Nom du produit -->
      <h3 class="prod-card__name">{{ produit.nom }}</h3>
      
      <!-- Marque -->
      <span v-if="produit.marque" class="prod-card__brand">{{ produit.marque }}</span>

      <!-- Disponibilité -->
      <div v-if="produit.stock !== undefined" class="prod-card__stock" :class="{ 'prod-card__stock--low': produit.stock <= 5 }">
        <span class="prod-card__stock-dot"></span>
        {{ produit.stock > 0 ? $t('productCard.inStock', { count: produit.stock }) : $t('productCard.outOfStock') }}
      </div>

      <!-- Footer avec bouton Panier -->
      <div class="prod-card__footer">
        <button class="prod-card__btn" @click.stop="addToCart" :disabled="produit.stock === 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {{ $t('productCard.cart') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

import { usePanierStore } from '@/stores/panier'
import { imgUrl, formatPrice } from '@/services/api'

const props  = defineProps({ produit: Object })
const panier = usePanierStore()
const localePath = useLocalePath()
const hasPromo = computed(() => {
  const promo = Number(props.produit?.prix_promo)
  const base = Number(props.produit?.prix_base)
  if (!promo || !base || promo >= base) return false
  const now = Date.now()
  const start = props.produit?.promo_debut ? new Date(props.produit.promo_debut).getTime() : null
  const end = props.produit?.promo_fin ? new Date(props.produit.promo_fin).getTime() : null
  return (!start || start <= now) && (!end || end >= now)
})
const effectivePrice = computed(() => hasPromo.value ? Number(props.produit.prix_promo) : Number(props.produit?.prix_base || 0))
const promoPercent = computed(() => Math.round((1 - effectivePrice.value / Number(props.produit?.prix_base || 1)) * 100))
const hasWholesaleOffer = computed(() => {
  const min = Number(props.produit?.prix_gros_min_quantite)
  const wholesalePrice = Number(props.produit?.prix_gros)
  return Boolean(props.produit?.prix_gros_actif) && min > 1 && wholesalePrice > 0 && wholesalePrice < effectivePrice.value
})
const goDetail  = () => {
  if (!props.produit?.slug) return
  navigateTo(localePath(`/produit/${props.produit.slug}`))
}
const addToCart = () => {
  if (props.produit.stock !== 0) {
    panier.ajouter({ ...props.produit, prix_promo: hasPromo.value ? props.produit.prix_promo : null })
  }
}
</script>

<style scoped>
/* ============================================
   CARD - Design épuré et moderne
   ============================================ */
.prod-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
}

.prod-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: var(--accent);
}

:global(.dark) .prod-card:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

/* ============================================
   IMAGE
   ============================================ */
.prod-card__img-wrap {
  position: relative;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: var(--bg-secondary);
}

.prod-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.prod-card:hover .prod-card__img {
  transform: scale(1.06);
}

.prod-card__img-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  opacity: 0.5;
}

/* Badge catégorie */
.prod-card__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent);
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(4px);
}

/* Badge réduction */
.prod-card__discount {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  animation: pulse-discount 2s ease-in-out infinite;
}

@keyframes pulse-discount {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Quick cart - icône panier */
.prod-card__quick {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 2;
  backdrop-filter: blur(8px);
}

.prod-card:hover .prod-card__quick {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.prod-card__quick:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-2px) scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.prod-card__quick:active {
  transform: scale(0.95) !important;
}

/* ============================================
   BODY - Structure optimisée
   ============================================ */
.prod-card__body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Catégorie */
.prod-card__cat {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
  margin-bottom: 6px;
  opacity: 0.85;
}

/* Prix - Bien visible */
.prod-card__prices {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.prod-card__price {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-ui);
  letter-spacing: -0.01em;
  line-height: 1;
}

.prod-card__old-price {
  font-size: 12px;
  color: var(--text-muted);
  text-decoration: line-through;
  font-weight: 400;
}

.prod-card__bulk {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, #16A34A 12%, transparent);
  color: #15803D;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.3;
}

/* Nom du produit */
.prod-card__name {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: var(--font-ui);
}

/* Marque */
.prod-card__brand {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 400;
  opacity: 0.75;
}

/* Stock */
.prod-card__stock {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #10b981;
  margin-bottom: 8px;
  font-weight: 500;
}

.prod-card__stock--low {
  color: #f59e0b;
}

.prod-card__stock-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* ============================================
   FOOTER - Bouton Panier optimisé
   ============================================ */
.prod-card__footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

/* Bouton +Panier */
.prod-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 90%;
  background: var(--accent);
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-family: var(--font-ui);
  letter-spacing: 0.02em;
}

.prod-card__btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.prod-card__btn:active {
  transform: translateY(0);
}

.prod-card__btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.prod-card__btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 380px) {
  .prod-card {
    border-radius: 10px;
  }

  .prod-card__body {
    padding: 8px;
  }

  .prod-card__name {
    font-size: 12px;
  }

  .prod-card__price {
    font-size: 14px;
  }

  .prod-card__btn {
    padding: 7px 10px;
    font-size: 11px;
    gap: 4px;
    width: 92%;
  }

  .prod-card__btn svg {
    width: 14px;
    height: 14px;
  }

  .prod-card__quick {
    width: 32px;
    height: 32px;
    bottom: 6px;
    right: 6px;
  }

  .prod-card__quick svg {
    width: 16px;
    height: 16px;
  }

  .prod-card__badge,
  .prod-card__discount {
    top: 6px;
    font-size: 9px;
    padding: 2px 6px;
  }

  .prod-card__badge { left: 6px; }
  .prod-card__discount { right: 6px; }

  .prod-card__cat {
    font-size: 9px;
  }

  .prod-card__brand {
    font-size: 10px;
  }

  .prod-card__stock {
    font-size: 10px;
  }
}

@media (min-width: 381px) and (max-width: 499px) {
  .prod-card__body {
    padding: 9px;
  }

  .prod-card__name {
    font-size: 12px;
  }

  .prod-card__price {
    font-size: 15px;
  }

  .prod-card__btn {
    padding: 7px 12px;
    font-size: 11px;
    width: 90%;
  }
}
</style>