<template>
  <div id="app">
    <ErrorBoundary>
      <router-view v-slot="{ Component, route: slotRoute }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="slotRoute.fullPath" />
        </Transition>
      </router-view>
    </ErrorBoundary>
    <Toast />
    <ImportModal />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Toast from './components/Toast.vue'
import ImportModal from './components/ImportModal.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { useI18nStore } from './stores/i18n'
import { useUIStore } from './stores/ui'
import { getLocalizedPath } from './router/localizedRoutes'

const router = useRouter()
const route = useRoute()
const i18n = useI18nStore()
const ui = useUIStore()

ui.initTheme()

const currentLocale = () => (
  typeof i18n.locale === 'string'
    ? i18n.locale
    : i18n.locale?.value
)

const syncRouteToLocale = async () => {
  if (typeof route.name !== 'string') return

  const targetPath = getLocalizedPath(
    route.name,
    currentLocale(),
    route.params,
    route.query,
    route.hash,
  )
  if (!targetPath) return

  const resolvedTarget = router.resolve(targetPath).fullPath
  if (resolvedTarget === route.fullPath) return

  try {
    await router.replace(resolvedTarget)
  } catch {
    // Ignore cancelled/duplicated navigation
  }
}

watch(currentLocale, () => {
  syncRouteToLocale()
})
</script>

<style>
/* Estilos globales ya están en style.css */
</style>
