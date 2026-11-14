<template>
  <div class="notfound">
    <div class="notfound-card fade-up">
      <span>404</span>
      <h1>{{ $t('notFound.title') }}</h1>
      <p>{{ $t('notFound.desc') }}</p>
      <div class="nf-cta">
        <NuxtLinkLocale to="/" class="btn-accent">{{ $t('notFound.home') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/boutique" class="btn-outline">{{ $t('notFound.shop') }}</NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notfound { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
.notfound-card { text-align: center; max-width: 480px; }
.notfound-card span { font-family: var(--font-head); font-size: 120px; font-weight: 800; color: var(--border); line-height: 1; display: block; margin-bottom: 8px; }
.notfound-card h1 { font-family: var(--font-head); font-size: 28px; font-weight: 800; margin-bottom: 12px; }
.notfound-card p  { color: var(--text-muted); margin-bottom: 32px; line-height: 1.6; }
.nf-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
</style>