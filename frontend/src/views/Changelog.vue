<template>
  <div class="changelog-page">
    <nav class="landing-nav">
      <router-link :to="localizedTo('landing')" class="landing-brand">exogram</router-link>
      <div class="landing-nav-links">
        <button class="lang-toggle" @click="i18n.toggleLocale()">
          <Transition name="lang-swap" mode="out-in">
            <span :key="i18n.locale">{{ i18n.t('landing.footer.lang') }}</span>
          </Transition>
        </button>
        <button class="theme-toggle" @click="ui.toggleTheme()" :title="ui.theme === 'dark' ? 'Light mode' : 'Dark mode'">
          <svg v-if="ui.theme === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
      </div>
    </nav>

    <main class="changelog-content">
      <header class="page-header">
        <h1 class="page-title">{{ i18n.t('changelog.title') }}</h1>
        <p class="subtitle">{{ i18n.t('changelog.subtitle') }}</p>
      </header>

      <section class="changelog-shell">
        <!-- eslint-disable-next-line vue/no-v-html — content is bundled at build time, not user input -->
        <article class="article-detail markdown-body" v-html="renderedMarkdown"></article>
      </section>
    </main>

    <PublicFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import PublicFooter from '../components/PublicFooter.vue'
import { useI18nStore } from '../stores/i18n'
import { useUIStore } from '../stores/ui'
import { getLocalizedPath } from '../router/localizedRoutes'
import changelogRaw from '../../../CHANGELOG.md?raw'

const i18n = useI18nStore()
const ui = useUIStore()
const currentLocale = computed(() => (
  typeof i18n.locale === 'string'
    ? i18n.locale
    : i18n.locale?.value
))

const localizedTo = (routeName, params = {}, query = {}, hash = '') => {
  return getLocalizedPath(routeName, currentLocale.value, params, query, hash) || '/'
}

const renderedMarkdown = computed(() => {
  return marked.parse(changelogRaw)
})
</script>

<style scoped>
.changelog-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.changelog-content {
  flex-grow: 1;
  max-width: 620px;
  margin: 0 auto;
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
  width: 100%;
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl) 0 var(--space-2xl);
  border-bottom: 1px solid var(--border-subtle);
}

.landing-brand {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  user-select: none;
  text-decoration: none;
  border: none;
}

.landing-nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.lang-toggle {
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: none;
  border: none;
  padding: 0;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: color var(--transition-fast), opacity var(--transition-fast);
  line-height: 1.4;
}

.lang-toggle:hover {
  color: var(--text-primary);
  opacity: 0.9;
}

.theme-toggle {
  font-family: var(--font-ui);
  color: var(--text-tertiary);
  background: none;
  border: none;
  outline: none;
  padding: 2px 6px;
  cursor: pointer;
  transition: color var(--transition-fast);
  line-height: 1.4;
  display: flex;
  align-items: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.theme-toggle:hover {
  color: var(--text-primary);
}

.page-header {
  --header-vertical-gap: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--header-vertical-gap);
  margin-bottom: var(--header-vertical-gap);
  text-align: left;
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: 400;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.subtitle {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-style: italic;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.changelog-shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.article-detail {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-xl);
}

/* Markdown Overrides to match standard styles */
.markdown-body :deep(h1) {
  display: none; /* Hide the main # Changelog since we have page-title */
}

.markdown-body :deep(h2) {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--text-primary);
}

.markdown-body :deep(h3) {
  margin: var(--space-lg) 0 var(--space-sm) 0;
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 400;
  color: var(--text-secondary);
}

.markdown-body :deep(p),
.markdown-body :deep(li) {
  margin: 0 0 var(--space-sm) 0;
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  line-height: 1.9;
  color: var(--text-secondary);
}

.markdown-body :deep(ul) {
  padding-left: var(--space-md);
  margin-bottom: var(--space-lg);
}

.markdown-body :deep(li) {
  margin-bottom: var(--space-xs);
  list-style-type: none;
  position: relative;
}

.markdown-body :deep(li)::before {
  content: '•';
  position: absolute;
  left: calc(var(--space-md) * -1);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  line-height: 1.9;
}

.markdown-body :deep(strong) {
  color: var(--text-primary);
  font-weight: 500;
}

.markdown-body :deep(hr) {
  margin: var(--space-xl) 0;
  border: none;
  border-top: 1px solid var(--border-subtle);
}

.markdown-body :deep(a) {
  color: var(--accent-primary, var(--text-primary));
  text-decoration: none;
  border-bottom: 1px solid var(--border-subtle);
  transition: opacity var(--transition-fast);
}

.markdown-body :deep(a:hover) {
  border-bottom-color: var(--text-primary);
}

.lang-swap-enter-active,
.lang-swap-leave-active {
  transition: opacity 140ms ease;
}
.lang-swap-enter-from,
.lang-swap-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .landing-nav {
    padding-top: var(--space-lg);
    padding-bottom: var(--space-xl);
  }
  .page-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
