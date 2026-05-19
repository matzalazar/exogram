<template>
  <nav class="nav-minimal">
    <div class="nav-left">
      <router-link :to="localizedTo('dashboard')" active-class="active">{{ i18n.t('navbar.home') }}</router-link>
      <router-link :to="localizedTo('library')" active-class="active">{{ i18n.t('navbar.library') }}</router-link>
      <router-link :to="localizedTo('favorites')" active-class="active">{{ i18n.t('navbar.favs') }}</router-link>
      <router-link :to="localizedTo('notes')" active-class="active">{{ i18n.t('navbar.notes') }}</router-link>
      <router-link v-if="showDiscoverLink" :to="localizedTo('discover')" active-class="active">{{ i18n.t('navbar.discover') }}</router-link>
      <router-link :to="localizedTo('graph')" active-class="active">{{ i18n.t('navbar.graph') }}</router-link>
      <router-link :to="localizedTo('profile')" active-class="active">{{ i18n.t('navbar.profile') }}</router-link>
    </div>
    
    <div class="nav-right">
      <router-link :to="localizedTo('philosophy')" active-class="active" class="link-philosophy">{{ i18n.t('navbar.philosophy') }}</router-link>
      <button class="lang-toggle nav-lang-toggle" @click="i18n.toggleLocale()">
        {{ i18n.t('navbar.lang') }}
      </button>
      <button class="theme-toggle nav-theme-toggle" @click="ui.toggleTheme()" :title="ui.theme === 'dark' ? 'Light mode' : 'Dark mode'">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUIStore } from '../stores/ui'
import { authService } from '../services/auth'
import { useI18nStore } from '../stores/i18n'
import { getLocalizedPath } from '../router/localizedRoutes'
import { logger } from '../utils/logger'

const authStore = useAuthStore()
const i18n = useI18nStore()
const ui = useUIStore()
const userResolved = ref(false)
const currentLocale = computed(() => (
  typeof i18n.locale === 'string'
    ? i18n.locale
    : i18n.locale?.value
))

const localizedTo = (routeName, params = {}, query = {}, hash = '') => {
  return getLocalizedPath(routeName, currentLocale.value, params, query, hash) || '/'
}

const showDiscoverLink = computed(() => {
  if (!authService.isAuthenticated()) return true
  if (!userResolved.value && !authStore.user) return false
  return authStore.user?.is_discoverable !== false
})

onMounted(async () => {
  if (authService.isAuthenticated() && !authStore.user) {
    try {
      await authStore.refreshCurrentUser()
    } catch (err) {
      logger.error('Error loading user for navbar:', err)
    } finally {
      userResolved.value = true
    }
    return
  }
  userResolved.value = true
})
</script>

<style scoped>
.nav-minimal {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: var(--space-xl);
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
}

.nav-left {
  display: flex;
  gap: var(--space-lg);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nav-lang-toggle {
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: none;
  border: 1px solid var(--border-medium);
  border-radius: var(--border-radius);
  padding: 2px 8px;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  line-height: 1.6;
}

.nav-lang-toggle:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.nav-theme-toggle {
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

.nav-theme-toggle:hover {
  color: var(--text-primary);
}

.nav-minimal a {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-bottom: none;
  letter-spacing: 0.03em;
  transition: color var(--transition-fast);
}

.nav-minimal a:hover,
.nav-minimal a.active {
  color: var(--text-primary);
}

.link-philosophy {
  font-style: italic;
}

@media (max-width: 640px) {
  .nav-minimal {
    flex-wrap: wrap;
    gap: var(--space-md);
  }
}
</style>
