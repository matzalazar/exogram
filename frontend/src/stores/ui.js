/**
 * UI Store - Gestiona estado de UI
 * Responsabilidades:
 * - Notificaciones (toasts)
 * - Modales
 * - Estados de carga
 * - Sidebar toggle
 * - Theme (light/dark)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const toasts = ref([])
  const modals = ref({})
  const isSidebarOpen = ref(true)
  const isProcessing = ref(false)
  const processingMessage = ref('')

  // Theme
  const theme = ref(localStorage.getItem('exogram-theme') || 'light')

  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('exogram-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // Initialize theme on load
  const initTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // Watch for system preference changes if no saved preference
  if (!localStorage.getItem('exogram-theme')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      setTheme('dark')
    }
  }

  // Toast management
  let toastCounter = 0

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastCounter
    const toast = {
      id,
      message,
      type, // 'info', 'success', 'warning', 'error'
      duration
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }

    return id
  }

  const dismissToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Modal management
  const openModal = (modalName, data = null) => {
    modals.value[modalName] = {
      isOpen: true,
      data
    }
  }

  const closeModal = (modalName) => {
    if (modals.value[modalName]) {
      modals.value[modalName].isOpen = false
    }
  }

  const isModalOpen = (modalName) => {
    return modals.value[modalName]?.isOpen || false
  }

  const getModalData = (modalName) => {
    return modals.value[modalName]?.data || null
  }

  // Processing state
  const setProcessing = (state, message = '') => {
    isProcessing.value = state
    processingMessage.value = message
  }

  // Sidebar management
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const openSidebar = () => {
    isSidebarOpen.value = true
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  // Helper methods
  const showSuccess = (message, duration = 3000) => {
    return showToast(message, 'success', duration)
  }

  const showError = (message, duration = 5000) => {
    return showToast(message, 'error', duration)
  }

  const showWarning = (message, duration = 4000) => {
    return showToast(message, 'warning', duration)
  }

  const showInfo = (message, duration = 3000) => {
    return showToast(message, 'info', duration)
  }

  return {
    // Toasts
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Modals
    modals,
    openModal,
    closeModal,
    isModalOpen,
    getModalData,

    // Processing
    isProcessing,
    processingMessage,
    setProcessing,

  // Sidebar
  isSidebarOpen,
  toggleSidebar,
  openSidebar,
  closeSidebar,

  // Theme
  theme,
  setTheme,
  toggleTheme,
  initTheme,
}
})
