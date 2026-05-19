<template>
  <div class="landing">
    <nav class="landing-nav">
      <span class="landing-brand">exogram</span>
      <div class="nav-right">
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

    <main class="hero">
      <Transition name="locale-fade" mode="out-in">
        <div :key="i18n.locale" class="hero-content">
          <h1 class="hero-tagline">{{ i18n.t('landing.hero.tagline') }}</h1>
          <p class="hero-sub">{{ i18n.t('landing.hero.sub') }}</p>
          <router-link :to="localizedTo('login')" class="cta-primary">{{ i18n.t('landing.hero.cta') }}</router-link>
          <div class="hero-links">
            <router-link :to="localizedTo('waitlist')" class="minor-link">{{ i18n.t('landing.hero.waitlist') }}</router-link>
            <router-link :to="localizedTo('changelog')" class="minor-link">{{ i18n.t('nav.changelog') }}</router-link>
            <router-link :to="localizedTo('philosophy')" class="minor-link" target="_blank" rel="noopener noreferrer">
              {{ i18n.t('nav.philosophy') }}
            </router-link>
          </div>
        </div>
      </Transition>
    </main>

    <PublicFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PublicFooter from '../components/PublicFooter.vue'
import { useI18nStore } from '../stores/i18n'
import { useUIStore } from '../stores/ui'
import { getLocalizedPath } from '../router/localizedRoutes'

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
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl) 0;
}

.landing-brand {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  user-select: none;
}

.hero {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--space-lg);
  max-width: 540px;
  padding-bottom: var(--space-2xl);
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-lg);
}

.hero-links {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.hero-tagline {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 400;
  line-height: 1.12;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-sub {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.cta-primary {
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: 400;
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--text-primary);
  letter-spacing: 0.02em;
  padding-bottom: 1px;
  transition: color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
}

.cta-primary:hover {
  color: var(--text-secondary);
  border-bottom-color: var(--text-secondary);
  opacity: 0.9;
}

.minor-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.minor-link:hover {
  color: var(--text-primary);
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

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
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

.locale-fade-enter-active,
.locale-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.locale-fade-enter-from,
.locale-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
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
  }
}
</style>
