export default defineNuxtPlugin(async () => {
  const shop = useShopSettingsStore()
  await shop.loadPublic()
})
