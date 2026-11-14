import { usePanierStore } from '@/stores/panier'

export default defineNuxtPlugin(() => {
  const panier = usePanierStore()
  panier.hydrateFromStorage()
})
