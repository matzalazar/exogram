<template>
  <div class="philosophy-page">
    <nav class="landing-nav">
      <router-link :to="localizedTo('landing')" class="landing-brand">exogram</router-link>
      <div class="landing-nav-links">
        <button class="lang-toggle" @click="i18n.toggleLocale()">
          {{ i18n.t('landing.footer.lang') }}
        </button>
        <router-link :to="localizedTo('login')" class="nav-link nav-link-enter">{{ i18n.t('nav.login') }}</router-link>
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

    <main class="philosophy-content">
      <header class="page-header">
        <h1 class="page-title">{{ i18n.t('landing.articles.title') }}</h1>
        <p class="subtitle">
          <span>{{ i18n.t('landing.articles.dog_quote') }}</span>
          <button
            type="button"
            class="subtitle-link"
            :aria-label="i18n.t('landing.articles.cartoon_open_aria')"
            @click="openCartoonModal"
          >
            →
          </button>
        </p>
      </header>

      <section v-if="articles.length > 0" class="philosophy-shell">
        <ul class="bullet-nav" role="list">
          <li v-for="article in articles" :key="article.slug" class="bullet-item">
            <button
              type="button"
              class="bullet-link"
              :class="{ 'is-active': isActiveArticle(article.slug) }"
              :aria-current="isActiveArticle(article.slug) ? 'true' : null"
              @click="goToArticle(article.slug)"
            >
              <span class="bullet-mark" aria-hidden="true">•</span>
              <span class="bullet-label">{{ article.title }}</span>
            </button>
          </li>
        </ul>

        <article v-if="activeArticle" class="article-detail">
          <h2 class="article-title">{{ activeArticle.title }}</h2>
          <p class="article-body">
            <template v-if="emphasizedArticleBody.hasEmphasis">
              {{ emphasizedArticleBody.before }}<strong class="article-emphasis">{{ emphasizedArticleBody.emphasis }}</strong>{{ emphasizedArticleBody.after }}
            </template>
            <template v-else>
              {{ activeArticle.body }}
            </template>
          </p>
          <hr v-if="donationAlias" class="donation-separator" />
          <p v-if="donationAlias" class="article-body donation-msg">
            {{ i18n.t('landing.donate_msg', { alias: donationAlias }) }}
          </p>
        </article>
      </section>
    </main>

    <div
      v-if="showCartoonModal"
      class="cartoon-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="i18n.t('landing.articles.cartoon_dialog_aria')"
      @click.self="closeCartoonModal"
    >
      <div class="cartoon-modal">
        <button
          type="button"
          class="cartoon-close"
          :aria-label="i18n.t('landing.articles.cartoon_close_aria')"
          @click="closeCartoonModal"
        >
          ✕
        </button>
        <img
          :src="DOG_CARTOON_SRC"
          :alt="i18n.t('landing.articles.dog_quote')"
          class="cartoon-image"
          loading="lazy"
        />
      </div>
    </div>

    <PublicFooter />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicFooter from '../components/PublicFooter.vue'
import { useI18nStore } from '../stores/i18n'
import { useUIStore } from '../stores/ui'
import { getLocalizedPath } from '../router/localizedRoutes'

const DOG_CARTOON_SRC = '/images/newyorker-dog-cartoon.jpg'

const route = useRoute()
const router = useRouter()
const i18n = useI18nStore()
const ui = useUIStore()
const donationAlias = import.meta.env.VITE_DONATION_ALIAS || ''

const currentLocale = computed(() => (
  typeof i18n.locale === 'string'
    ? i18n.locale
    : i18n.locale?.value
))

const localizedTo = (routeName, params = {}, query = {}, hash = '') => {
  return getLocalizedPath(routeName, currentLocale.value, params, query, hash) || '/'
}

const articles = computed(() => {
  const list = i18n.t('landing.articles.items')
  return Array.isArray(list) ? list : []
})

const activeArticleId = computed(() => {
  const raw = route.params.articleId
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0]
  return ''
})

const activeArticle = computed(() => {
  const selected = articles.value.find((article) => article.slug === activeArticleId.value)
  return selected || articles.value[0] || null
})

const emphasizedArticleBody = computed(() => {
  const article = activeArticle.value
  const body = article?.body || ''
  if (article?.slug !== 'connection-mode') {
    return { before: body, emphasis: '', after: '', hasEmphasis: false }
  }

  const emphasisText = currentLocale.value === 'en' ? 'hermit mode' : 'modo ermitaño'
  const start = body.toLowerCase().indexOf(emphasisText)
  if (start === -1) {
    return { before: body, emphasis: '', after: '', hasEmphasis: false }
  }

  return {
    before: body.slice(0, start),
    emphasis: body.slice(start, start + emphasisText.length),
    after: body.slice(start + emphasisText.length),
    hasEmphasis: true,
  }
})

const isActiveArticle = (slug) => activeArticle.value?.slug === slug

const goToArticle = async (slug, replace = false) => {
  const targetPath = localizedTo('philosophy_article', { articleId: slug }, route.query, route.hash)
  const resolvedTarget = router.resolve(targetPath).fullPath
  if (resolvedTarget === route.fullPath) return

  try {
    if (replace) {
      await router.replace(resolvedTarget)
    } else {
      await router.push(resolvedTarget)
    }
  } catch {
    // Ignore cancelled/duplicated navigation
  }
}

const syncArticleRoute = async () => {
  if (articles.value.length === 0) return
  const hasValidArticleId = articles.value.some((article) => article.slug === activeArticleId.value)
  if (route.name === 'philosophy_article' && hasValidArticleId) return

  const defaultSlug = activeArticle.value?.slug || articles.value[0].slug
  await goToArticle(defaultSlug, true)
}

watch(
  [articles, () => route.name, activeArticleId],
  () => {
    syncArticleRoute()
  },
  { immediate: true },
)

const showCartoonModal = ref(false)

const openCartoonModal = () => {
  showCartoonModal.value = true
}

const closeCartoonModal = () => {
  showCartoonModal.value = false
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && showCartoonModal.value) {
    closeCartoonModal()
  }
}

watch(showCartoonModal, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.philosophy-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.philosophy-content {
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

.nav-link {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  border-bottom: none;
  letter-spacing: 0.03em;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-primary);
  border-bottom: none;
}

.nav-link-enter {
  color: var(--text-secondary);
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
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-style: italic;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  text-align: right;
  gap: var(--space-sm);
}

.subtitle-link {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--accent-primary, var(--text-primary));
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--text-primary);
  opacity: 0.6;
  text-underline-offset: 4px;
  transition: opacity var(--transition-fast);
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.subtitle-link:hover {
  opacity: 1;
}

.philosophy-shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.bullet-nav {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bullet-item + .bullet-item {
  margin-top: var(--space-sm);
}

.bullet-link {
  width: 100%;
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-sm);
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.bullet-link:hover {
  color: var(--text-primary);
}

.bullet-link.is-active {
  color: var(--text-primary);
}

.bullet-mark {
  font-size: var(--font-size-sm);
  line-height: 1;
  opacity: 0.8;
}

.bullet-label {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  line-height: 1.65;
}

.article-detail {
  border-top: 1px solid var(--border-subtle);
  padding-top: var(--space-xl);
}

.article-title {
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--text-primary);
}

.article-body {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  line-height: 1.9;
  color: var(--text-secondary);
}

.article-emphasis {
  font-weight: 700;
}

.donation-separator {
  margin: var(--space-xl) 0;
  border: none;
  border-top: 1px solid var(--border-subtle);
}

.donation-msg {
  font-style: italic;
  opacity: 0.85;
}

.cartoon-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.42);
  backdrop-filter: blur(1px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.cartoon-modal {
  position: relative;
  width: min(720px, 100%);
  max-height: 90vh;
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--border-radius);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  padding: var(--space-md);
}

.cartoon-close {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cartoon-close:hover {
  border-color: var(--border-subtle);
  background: rgba(10, 10, 10, 0.04);
  color: var(--text-primary);
}

.cartoon-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: calc(90vh - 2 * var(--space-md));
  object-fit: contain;
  border-radius: calc(var(--border-radius) - 2px);
}

@media (max-width: 640px) {
  .landing-nav {
    padding-top: var(--space-lg);
    padding-bottom: var(--space-xl);
  }

  .landing-nav-links {
    gap: var(--space-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .subtitle {
    justify-content: flex-end;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .bullet-label {
    font-size: var(--font-size-sm);
  }

  .article-body {
    line-height: 1.75;
  }
}
</style>
