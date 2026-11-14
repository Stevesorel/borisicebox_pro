import { defineStore } from 'pinia'

export const usePanierStore = defineStore('panier', {
  state: () => {
    if (import.meta.client) {
      try {
        return { items: JSON.parse(localStorage.getItem('panier') || '[]') }
      } catch {
        return { items: [] }
      }
    }
    return { items: [] }
  },
  getters: {
    count:     (s) => s.items.reduce((acc, i) => acc + i.quantite, 0),
    sousTotal: (s) => s.items.reduce((acc, i) => acc + i.prix * i.quantite, 0)
  },
  actions: {
    hydrateFromStorage() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem('panier')
        this.items = raw ? JSON.parse(raw) : []
        this._refreshAllPrices()
      } catch {
        this.items = []
      }
    },
    ajouter(produit, quantite = 1) {
      const frais = produit.personnalisation && produit.personnalisable
        ? parseFloat(produit.frais_personnalisation || 0)
        : 0
      const imageSelectionnee = produit.image_selectionnee || produit.image_principale || null

      const exist = this.items.find(i =>
        i.id === produit.id &&
        i.personnalisation === (produit.personnalisation || null) &&
        (i.image || null) === imageSelectionnee
      )

      if (exist) {
        exist.quantite += quantite
      } else {
        const prixProduit = Number(produit.prix_promo || produit.prix_base)
        const item = {
          id:                     produit.id,
          nom:                    produit.nom,
          prix:                   prixProduit + frais,
          prix_base:              prixProduit,
          prix_standard:          prixProduit,
          prix_gros_actif:        produit.prix_gros_actif || false,
          prix_gros_min_quantite: Number(produit.prix_gros_min_quantite || 0),
          prix_gros:              Number(produit.prix_gros || 0),
          remise_gros_active:     false,
          frais_personnalisation: frais,
          personnalisable:        produit.personnalisable || false,
          personnalisation:       produit.personnalisation || null,
          couleur:                produit.couleur || null,
          couleur_hex:            produit.couleur_hex || null,
          image:                  imageSelectionnee,
          quantite
        }
        this.items.push(item)
      }
      this._refreshAllPrices()
      this._save()
    },
    retirer(id, personnalisation = null, image = null) {
      this.items = this.items.filter(i =>
        !(i.id === id && i.personnalisation === personnalisation && (i.image || null) === image)
      )
      this._refreshAllPrices()
      this._save()
    },
    setQuantite(id, q, personnalisation = null, image = null) {
      const item = this.items.find(i =>
        i.id === id && i.personnalisation === personnalisation && (i.image || null) === image
      )
      if (item) {
        item.quantite = q
        this._refreshAllPrices()
        this._save()
      }
    },
    vider() { this.items = []; this._save() },
    _refreshAllPrices() {
      this.items.forEach((item) => {
        const productQuantity = this.items
          .filter((line) => line.id === item.id)
          .reduce((sum, line) => sum + Number(line.quantite || 0), 0)
        this._refreshItemPrice(item, productQuantity)
      })
    },
    _refreshItemPrice(item, quantityForThreshold = item.quantite) {
      const standard = Number(item.prix_standard ?? item.prix_base ?? item.prix)
      const min = Number(item.prix_gros_min_quantite || 0)
      const wholesale = Number(item.prix_gros || 0)
      const wholesaleApplies = Boolean(item.prix_gros_actif)
        && min > 1
        && Number(quantityForThreshold) >= min
        && wholesale > 0
        && wholesale < standard
      item.remise_gros_active = wholesaleApplies
      item.prix_base = wholesaleApplies ? wholesale : standard
      item.prix = item.prix_base + Number(item.frais_personnalisation || 0)
    },
    _save() { if (import.meta.client) { localStorage.setItem('panier', JSON.stringify(this.items)) } }
  }
})