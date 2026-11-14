const isProd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: !isProd },
  css: [
    '~/assets/css/theme.css',
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],
  i18n: {
    locales: [
      { code: 'fr', language: 'fr-CM', name: 'Français', file: 'fr.js' },
      { code: 'en', language: 'en-CM', name: 'English', file: 'en.js' },
    ],
    langDir: '../i18n/',
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
  },
  runtimeConfig: {
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || 'http://localhost:5000/api',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000/api',
      socketBase: process.env.NUXT_PUBLIC_SOCKET_BASE || '',
    }
  },
  routeRules: {
    '/panier': { ssr: false },
    '/commande': { ssr: false },
    '/en/panier': { ssr: false },
    '/en/commande': { ssr: false },
    '/': { swr: 10 },
    '/boutique': { swr: 30 },
    '/en/boutique': { swr: 30 },
    '/en': { swr: 10 },
    '/produit/**': { swr: 60 },
    '/en/produit/**': { swr: 60 },
    '/legal/**': { swr: 300 },
    '/en/legal/**': { swr: 300 },
  },
  nitro: {
    compressPublicAssets: true,
  },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetchOn: { visibility: false, interaction: true },
      },
    },
  },
  app: {
    head: {
      script: [
        {
          innerHTML:
            "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()",
          tagPosition: 'head',
        },
      ],
    },
  },
  ssr: true,
})
