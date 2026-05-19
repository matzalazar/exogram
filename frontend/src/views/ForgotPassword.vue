<template>
  <div class="forgot-page">
    <div class="forgot-main">
      <div class="forgot-container">
        <header class="forgot-header">
          <router-link :to="localizedTo('login')" class="back-link">{{ i18n.t('forgot_password.back') }}</router-link>
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
        </header>

        <form class="forgot-form" @submit.prevent="handleSubmit">
          <span class="brand">exogram</span>
          <p class="forgot-title">{{ i18n.t('forgot_password.title') }}</p>

          <label class="input-label" for="forgot-email">{{ i18n.t('forgot_password.email_label') }}</label>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            :placeholder="i18n.t('forgot_password.email_placeholder')"
            autocomplete="email"
            required
          />

          <button type="submit" class="btn-enter" :disabled="isSubmitting">
            {{ isSubmitting ? i18n.t('forgot_password.btn_loading') : i18n.t('forgot_password.btn') }}
          </button>

          <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
        </form>
      </div>
    </div>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PublicFooter from '../components/PublicFooter.vue'
import { useUIStore } from '../stores/ui'
import { useI18nStore } from '../stores/i18n'
import { authService } from '../services/auth'
import { getLocalizedPath } from '../router/localizedRoutes'
const ui = useUIStore()
const i18n = useI18nStore()
const currentLocale = computed(() => (
  typeof i18n.locale === 'string'
    ? i18n.locale
    : i18n.locale?.value
))

const localizedTo = (routeName, params = {}, query = {}, hash = '') => {
  return getLocalizedPath(routeName, currentLocale.value, params, query, hash) || '/'
}

const email = ref('')
const isSubmitting = ref(false)
const statusMessage = ref('')

const handleSubmit = async () => {
  const normalizedEmail = (email.value || '').trim()
  if (!normalizedEmail) {
    ui.showError(i18n.t('forgot_password.error_email'))
    return
  }

  isSubmitting.value = true
  statusMessage.value = ''
  try {
    const result = await authService.forgotPassword(normalizedEmail)
    statusMessage.value = result?.message || i18n.t('forgot_password.success')
  } catch (error) {
    ui.showError(error.message || i18n.t('forgot_password.error_generic'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.forgot-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) 0 var(--space-xl);
}

.forgot-container {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.forgot-header {
  display: flex;
  margin-bottom: var(--space-xs);
}

.forgot-header .back-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-bottom: none;
  transition: color var(--transition-fast);
}

.forgot-header .back-link:hover {
  color: var(--text-primary);
}

.forgot-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.forgot-title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-transform: capitalize;
  margin: 0;
}



.input-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.forgot-form input {
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-sm) 0;
  background: transparent;
  font-size: var(--font-size-base);
  font-weight: 300;
  transition: border-color var(--transition-fast);
}

.forgot-form input:focus {
  outline: none;
  border-bottom-color: var(--text-primary);
}

.status-message {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: var(--space-xs) 0 0;
}

.btn-enter {
  background: none;
  border: none;
  padding: var(--space-md) 0;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 300;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
  letter-spacing: 0.05em;
  align-self: flex-end;
  margin-top: var(--space-md);
}

.btn-enter:hover {
  color: var(--text-primary);
}

.btn-enter:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.forgot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.back-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-bottom: none;
  letter-spacing: 0.03em;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--text-primary);
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
</style>
