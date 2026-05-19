<template>
  <div class="login-page">
    <div class="login-main">
      <div class="login-container">
        <header class="login-header">
          <router-link :to="localizedTo('landing')" class="back-link">{{ i18n.t('login.back') }}</router-link>
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
        
        <form @submit.prevent="handleLogin" class="login-form">
          <span class="brand">exogram</span>

          <p v-if="inviteNotice" class="invite-notice">{{ inviteNotice }}</p>

          <input
            id="nickname"
            v-model="nickname"
            type="text"
            :placeholder="i18n.t('login.placeholder_nick')"
            required
            autocomplete="username"
          />

          <input
            id="password"
            v-model="password"
            type="password"
            :placeholder="i18n.t('login.placeholder_pass')"
            required
            autocomplete="current-password"
          />

          <button type="submit" class="btn-enter" :disabled="authStore.isLoadingAuth">
            {{ authStore.isLoadingAuth ? i18n.t('login.btn_loading') : i18n.t('login.btn') }}
          </button>
          <router-link :to="localizedTo('forgot_password')" class="forgot-link">
            {{ i18n.t('login.forgot_link') }}
          </router-link>
        </form>
      </div>
    </div>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PublicFooter from '../components/PublicFooter.vue'
import { useUIStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { useI18nStore } from '../stores/i18n'
import { logger } from '../utils/logger'
import { authService } from '../services/auth'
import { getLocalizedPath } from '../router/localizedRoutes'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
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

const nickname = ref('')
const password = ref('')
const inviteNotice = ref('')

onMounted(async () => {
  const inviteToken = (route.query.invite || '').toString().trim()
  if (!inviteToken) return

  try {
    const result = await authService.validateInvitation(inviteToken)
    if (result?.valid) {
      inviteNotice.value = 'invitación detectada. ingresá con las credenciales temporales del email.'
    } else {
      inviteNotice.value = 'el enlace de invitación no es válido o expiró.'
    }
  } catch {
    inviteNotice.value = 'el enlace de invitación no es válido o expiró.'
  }
})

const handleLogin = async () => {
  if (!nickname.value || !password.value) {
    ui.showError(i18n.t('login.error_empty'))
    return
  }

  try {
    logger.debug('Iniciando login', { nickname: nickname.value })
    const user = await authStore.login(nickname.value, password.value)
    logger.info('Login exitoso', { user: authStore.user })
    if (user?.must_change_credentials) {
      ui.showSuccess(i18n.t('login.success_cred'))
      router.push(localizedTo('profile'))
      return
    }
    ui.showSuccess(i18n.t('login.success'))
    router.push(localizedTo('dashboard'))
  } catch (err) {
    logger.error('Error durante login', err)
    ui.showError(err.message || 'Error al iniciar sesión')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md) 0 var(--space-xl);
}

.login-container {
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.login-header {
  display: flex;
  margin-bottom: var(--space-xs);
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  width: 100%;
}

.brand {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 400;
  letter-spacing: -0.02em;
  color: var(--text-tertiary);
  text-align: center;
  margin-bottom: var(--space-xl);
  user-select: none;
}

.invite-notice {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
  margin: calc(var(--space-sm) * -1) 0 var(--space-md);
  line-height: 1.5;
}

.login-form input {
  border: none;
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-sm) 0;
  background: transparent;
  font-size: var(--font-size-base);
  font-weight: 300;
  transition: border-color var(--transition-fast);
}

.login-form input:focus {
  outline: none;
  border-bottom-color: var(--text-primary);
  background: transparent;
}

.login-form input::placeholder {
  color: var(--text-tertiary);
  font-weight: 300;
}

.btn-enter {
  background: none;
  border: none;
  padding: var(--space-md) 0;
  font-family: var(--font-ui);
  font-size: var(--font-size-sm);
  font-weight: 300;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
  letter-spacing: 0.05em;
  text-align: center;
  margin-top: var(--space-md);
}

.btn-enter:hover {
  color: var(--text-primary);
}

.forgot-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-bottom: none;
  text-align: center;
  letter-spacing: 0.05em;
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--text-primary);
}

.btn-enter:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-header {
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
