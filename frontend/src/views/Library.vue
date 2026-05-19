<template>
  <div class="container">
    <Navbar />

    <section class="notes-header">
      <h1 class="notes-title">{{ isFavoritesView ? i18n.t('library.title_favs') : i18n.t('library.title') }}</h1>
      <button v-if="!isFavoritesView" class="btn-new-note" @click="uiStore.openModal('import')">
        {{ i18n.t('library.cta_import') }}
      </button>
      <router-link v-else :to="localizedTo('library')" class="btn-new-note">
        {{ i18n.t('library.cta_library') }}
      </router-link>
    </section>

    <section class="notes-container">
      <!-- Widget de Procesamiento de Conexiones: siempre visible cuando hay embeddings pendientes -->
      <div
        v-if="(isProcessing || justFinishedProcessing) && highlightsStore.allHighlights.length > 0"
        class="processing-widget"
        :class="{'processing-done': justFinishedProcessing}"
      >
        <div class="widget-content">
          <template v-if="isProcessing">
            <span class="spinner"></span>
            <span class="widget-text">{{ i18n.t('library.processing_running', { missing: missingEmbeddings }) }}</span>
          </template>
          <template v-else>
            <span class="check-icon">✓</span>
            <span class="widget-text">{{ i18n.t('library.processing_done') }}</span>
          </template>
        </div>
      </div>

      <div v-if="isLoading" class="state-msg">
        {{ i18n.t('library.loading') }}
      </div>

      <div v-else-if="!hasContent" class="empty-state">
        <p class="empty-text">{{ isFavoritesView ? i18n.t('library.empty_favs') : i18n.t('library.empty_library') }}</p>
      </div>

      <div v-else class="library-container">
      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="search-input" 
          :placeholder="isFavoritesView ? i18n.t('library.search_favs') : i18n.t('library.search_library')"
          spellcheck="false"
        />
      </div>

      <div class="book-list">
      <div v-for="book in visibleBooks" :key="book.id" class="book-item">
        <div class="book-row" @click="toggleBook(book.id)">
          <div class="book-info">
            <span class="book-title">{{ book.title }}</span>
            <span class="book-author">{{ book.authors }}</span>
          </div>
          <div class="book-actions">
            <span class="book-count">{{ book.highlights_count }}</span>
            <button
              class="book-download-btn"
              @click.stop="downloadBookMarkdown(book)"
              :disabled="downloadingBookId === book.id"
              :title="i18n.t('library.download_title')"
            >
              {{ downloadingBookId === book.id ? i18n.t('library.download_button_loading') : i18n.t('library.download_button_idle') }}
            </button>
          </div>
        </div>

        <!-- Highlights expandidos -->
        <div v-if="expandedBook === book.id" class="book-highlights">
          <div
            v-for="h in book.visibleHighlights"
            :key="h.id"
            class="highlight-entry"
            :class="{ 'has-open-connections': expandedConnections[h.id] }"
          >
            <div class="highlight-wrapper">
              <div class="highlight-actions">
                <button 
                  class="favorite-btn" 
                  :class="{ 'is-favorite': h.is_favorite }"
                  @click="toggleFavorite(h)"
                  :title="i18n.t('library.favorite_title')"
                  :aria-label="i18n.t('library.favorite_title')"
                >
                  <svg class="favorite-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321 1l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0l-4.725 2.885a.562.562 0 0 1-.84-.61l1.285-5.385a.563.563 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-1l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z"
                      :fill="h.is_favorite ? 'currentColor' : 'none'"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  class="delete-btn"
                  :disabled="isDeleting[h.id]"
                  @click="deleteHighlight(h)"
                  :title="i18n.t('library.delete_title')"
                  :aria-label="i18n.t('library.delete_title')"
                >
                  <span v-if="isDeleting[h.id]">...</span>
                  <svg v-else class="delete-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M3 6h18M8 6V4h8v2m-7 0v13m6-13v13m4-13-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <blockquote class="quote">
                <p>{{ h.content }}</p>
              </blockquote>
            </div>

            <!-- Nota y Visibilidad -->
            <div class="highlight-controls">
              <div class="highlight-meta-row">
                <span class="highlight-date">{{ formatDate(h.created_at) }}</span>
                <span class="meta-dot">·</span>
                <button
                  class="vis-toggle"
                  :class="{ 'is-active': expandedNotes[h.id] }"
                  @click="toggleNote(h)"
                >
                  {{ i18n.t('library.note_button') }}
                </button>
                <span class="meta-dot">·</span>
                <button
                  class="vis-toggle"
                  :class="{ 'is-public': isHighlightPublic(h) }"
                  @click="toggleVisibility(h)"
                >
                  {{ i18n.t('library.visibility_label') }}: {{ isHighlightPublic(h) ? i18n.t('library.yes') : i18n.t('library.no') }}
                </button>
                <span class="meta-dot">·</span>
                <button
                  class="vis-toggle"
                  :class="{ 'is-active': expandedConnections[h.id] }"
                  @click="toggleConnections(h)"
                >
                  {{ i18n.t('library.connections_button') }} {{ loadingConnections[h.id] ? '...' : '→' }}
                </button>
              </div>

              <!-- Conexiones (Similares semánticos) -->
              <div v-if="expandedConnections[h.id]" class="connections-area">
                <div class="connections-context">
                  <span class="connection-meta">{{ formatConnectionMeta(h) }}</span>
                </div>

                <div v-if="connectionsMap[h.id] && connectionsMap[h.id].length > 0" class="connections-list">
                  <div v-for="sim in connectionsMap[h.id]" :key="sim.id" class="connection-item">
                    <span class="connection-role">{{ i18n.t('library.connection_role') }}</span>
                    <p class="connection-content">"{{ sim.content }}"</p>
                    <span class="connection-meta">{{ formatConnectionMeta(sim) }}</span>
                  </div>
                </div>
                <div v-else-if="!loadingConnections[h.id]" class="connection-item">
                  <span class="connection-meta italic">{{ i18n.t('library.no_connections') }}</span>
                </div>
              </div>

              <div v-if="expandedNotes[h.id]" class="note-area">
                <textarea
                  v-model="h.note"
                  :placeholder="i18n.t('library.note_placeholder')"
                  rows="2"
                  class="note-input"
                  @blur="saveNote(h)"
                ></textarea>
              </div>
            </div>
          </div>

          <PaginationControl
            v-if="book.highlights_count > 5 || expandedBookPage[book.id] > 1"
            v-model="expandedBookPage[book.id]"
            :total-items="book.highlights_count"
            :page-size="5"
          />
        </div>
      </div>

        <PaginationControl 
          v-model="libraryPage" 
          :total-items="books.length" 
          :page-size="5" 
        />
      </div>

      <!-- Estado vacío para búsqueda fallida -->
      <div
        v-if="visibleBooks.length === 0 && hasContent && searchQuery.trim().length > 0"
        class="empty-state search-empty"
      >
        <p class="empty-text">{{ i18n.t('library.search_empty', { query: searchQuery }) }}</p>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHighlightsStore } from '../stores/highlights'
import { useUIStore } from '../stores/ui'
import { useI18nStore } from '../stores/i18n'
import { highlightService } from '../services/highlights'
import { logger } from '../utils/logger'
import Navbar from '../components/Navbar.vue'
import PaginationControl from '../components/PaginationControl.vue'
import { getLocalizedPath } from '../router/localizedRoutes'

const highlightsStore = useHighlightsStore()
const uiStore = useUIStore()
const i18n = useI18nStore()
const route = useRoute()
const localizedTo = (name) => getLocalizedPath(name, i18n.locale)

const expandedBook = ref(null)
const expandedBookPage = ref({})

const libraryPage = ref(1)

const searchQuery = ref('')
const downloadingBookId = ref(null)
const isDeleting = ref({})

// Conexiones State management
const expandedConnections = ref({})
const connectionsMap = ref({})
const loadingConnections = ref({})
const expandedNotes = ref({})

// Progress Widget State
const missingEmbeddings = ref(0)
const isProcessing = ref(false)
const justFinishedProcessing = ref(false)
let pollingInterval = null


const isFavoritesView = computed(() => route.name === 'favorites')
const isLoading = computed(() =>
  isFavoritesView.value ? highlightsStore.isLoadingHighlights : highlightsStore.isLoadingBooks
)
const hasContent = computed(() =>
  isFavoritesView.value
    ? highlightsStore.allHighlights.some(h => h.is_favorite)
    : highlightsStore.books.length > 0
)

const books = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  if (isFavoritesView.value) {
    // Favorites: agrupar allHighlights filtrados por is_favorite
    const grouped = {}
    for (const h of highlightsStore.allHighlights.filter(h => h.is_favorite)) {
      const matchesQuery = !query || [
        h.book_title, h.content, h.note, ...(h.book_authors || [])
      ].some(v => v?.toLowerCase().includes(query))
      if (!matchesQuery) continue
      const key = h.book_id || h.book_title
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          book_id: h.book_id,
          title: h.book_title,
          authors: Array.isArray(h.book_authors) ? h.book_authors.join(', ') : '',
          highlights_count: 0,
          highlights: [],
        }
      }
      grouped[key].highlights_count++
      grouped[key].highlights.push(h)
    }
    const result = Object.values(grouped).sort((a, b) => b.highlights_count - a.highlights_count)
    for (const book of result) {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      if (!expandedBookPage.value[book.id]) expandedBookPage.value[book.id] = 1
      const page = expandedBookPage.value[book.id]
      const start = (page - 1) * 5
      book.visibleHighlights = book.highlights.slice(start, start + 5)
    }
    return result
  }

  // Library: usar lista liviana del store + highlights lazy por libro
  let result = highlightsStore.books
  if (query) {
    result = result.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.authors.join(' ').toLowerCase().includes(query)
    )
  }
  return result.map(b => {
    const bookState = highlightsStore.highlightsByBook[b.id] || { results: [] }
    const bookHighlights = bookState.results
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    if (!expandedBookPage.value[b.id]) expandedBookPage.value[b.id] = 1
    const page = expandedBookPage.value[b.id]
    const start = (page - 1) * 5
    return {
      ...b,
      book_id: b.id,
      authors: b.authors.join(', '),
      highlights: bookHighlights,
      visibleHighlights: bookHighlights.slice(start, start + 5),
    }
  })
})

const visibleBooks = computed(() => {
  const start = (libraryPage.value - 1) * 5
  return books.value.slice(start, start + 5)
})

watch(
  () => route.name,
  async (newName) => {
    expandedBook.value = null
    libraryPage.value = 1
    expandedBookPage.value = {}
    searchQuery.value = ''
    if (newName === 'favorites' && highlightsStore.allHighlights.length === 0) {
      await highlightsStore.fetchHighlights()
    } else if (newName !== 'favorites' && highlightsStore.books.length === 0) {
      await highlightsStore.fetchBooks()
    }
  }
)

const toggleConnections = async (highlight) => {
  const id = highlight.id

  if (expandedConnections.value[id]) {
    expandedConnections.value[id] = false
    return
  }

  expandedConnections.value[id] = true

  if (!connectionsMap.value[id]) {
    loadingConnections.value[id] = true
    try {
      logger.debug('Cargando conexiones semánticas', { highlightId: id })
      const data = await highlightService.getSimilar(id, 5)
      connectionsMap.value[id] = data.results || []
    } catch (err) {
      logger.error('Error cargando conexiones', err)
      uiStore.showError(i18n.t('library.messages.load_connections_error'))
      connectionsMap.value[id] = []
    } finally {
      loadingConnections.value[id] = false
    }
  }
}

const checkEmbeddingStatus = async () => {
  try {
    const status = await highlightService.getEmbeddingStatus()
    missingEmbeddings.value = status.missing

    if (status.missing > 0) {
      isProcessing.value = true
      justFinishedProcessing.value = false
    } else if (isProcessing.value && status.missing === 0) {
      isProcessing.value = false
      justFinishedProcessing.value = true

      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
      setTimeout(() => {
        justFinishedProcessing.value = false
      }, 3000)
    }
  } catch (err) {
    logger.error('Error verificando procesamiento', err)
  }
}

onMounted(async () => {
  try {
    logger.debug('Montando Library view')
    if (isFavoritesView.value) {
      await highlightsStore.fetchHighlights()
      for (const h of highlightsStore.allHighlights) {
        if (h.note?.trim()) expandedNotes.value[h.id] = true
      }
    } else {
      await highlightsStore.fetchBooks()
    }
    await checkEmbeddingStatus()
    pollingInterval = setInterval(checkEmbeddingStatus, 3000)
  } catch (err) {
    logger.error('Error loading library', err)
    uiStore.showError(i18n.t('library.messages.load_library_error'))
  }
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
  logger.debug('Desmontando Library view')
})

const toggleBook = async (bookId) => {
  if (expandedBook.value === bookId) {
    expandedBook.value = null
    return
  }
  expandedBook.value = bookId
  if (!isFavoritesView.value) {
    await highlightsStore.fetchHighlightsForBook(bookId)
    const state = highlightsStore.highlightsByBook[bookId]
    if (state) {
      for (const h of state.results) {
        if (h.note?.trim()) expandedNotes.value[h.id] = true
      }
    }
  }
}

const isHighlightPublic = (highlight) => {
  if (typeof highlight.is_public === 'boolean') {
    return highlight.is_public
  }
  return highlight.visibility === 'public'
}

const toggleNote = (highlight) => {
  const isOpen = !!expandedNotes.value[highlight.id]
  expandedNotes.value = {
    ...expandedNotes.value,
    [highlight.id]: !isOpen
  }
}

const sanitizeFilename = (name) => {
  const invalidChars = /[/\\:*?"<>|]/g
  return (name || 'libro').replace(invalidChars, '-').trim()
}

const downloadBookMarkdown = async (book) => {
  if (downloadingBookId.value === book.id) return

  const resolvedBookId =
    book.book_id ||
    book.highlights?.[0]?.book_id ||
    book.highlights?.[0]?.book ||
    null

  if (!resolvedBookId) {
    uiStore.showError(i18n.t('library.messages.resolve_book_error'))
    return
  }

  downloadingBookId.value = book.id
  try {
    const { blob, filename } = await highlightService.exportBookMarkdown(resolvedBookId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `${sanitizeFilename(book.title)}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1500)
    uiStore.showSuccess(i18n.t('library.messages.download_started'))
  } catch (err) {
    logger.error('Error exportando markdown del libro', err)
    uiStore.showError(err.message || i18n.t('library.messages.download_error'))
  } finally {
    downloadingBookId.value = null
  }
}

const toggleVisibility = async (highlight) => {
  const nextIsPublic = !isHighlightPublic(highlight)
  try {
    logger.debug('Actualizando visibilidad', { highlightId: highlight.id, nextIsPublic })
    const updated = await highlightService.updateHighlight(highlight.id, {
      is_public: nextIsPublic
    })
    highlight.is_public = !!updated.is_public
    highlight.visibility = updated.visibility
    const state = nextIsPublic
      ? i18n.t('library.messages.state_public')
      : i18n.t('library.messages.state_private')
    uiStore.showSuccess(i18n.t('library.messages.visibility_updated', { state }))
  } catch (err) {
    logger.error('Error updating visibility', err)
    uiStore.showError(i18n.t('library.messages.visibility_error'))
  }
}

const toggleFavorite = async (highlight) => {
  const previousFav = highlight.is_favorite
  const newFav = !previousFav
  highlight.is_favorite = newFav
  try {
    logger.debug('Actualizando favorito', { highlightId: highlight.id, newFav })
    await highlightService.updateHighlight(highlight.id, {
      is_favorite: newFav
    })
  } catch (err) {
    logger.error('Error updating favorite status', err)
    highlight.is_favorite = previousFav
    uiStore.showError(i18n.t('library.messages.favorite_error'))
  }
}

const clearHighlightUiState = (highlightId) => {
  const nextExpandedConnections = { ...expandedConnections.value }
  const nextConnectionsMap = { ...connectionsMap.value }
  const nextLoadingConnections = { ...loadingConnections.value }
  const nextExpandedNotes = { ...expandedNotes.value }

  delete nextExpandedConnections[highlightId]
  delete nextConnectionsMap[highlightId]
  delete nextLoadingConnections[highlightId]
  delete nextExpandedNotes[highlightId]

  expandedConnections.value = nextExpandedConnections
  connectionsMap.value = nextConnectionsMap
  loadingConnections.value = nextLoadingConnections
  expandedNotes.value = nextExpandedNotes
}

const deleteHighlight = async (highlight) => {
  if (isDeleting.value[highlight.id]) return

  const confirmed = window.confirm(i18n.t('library.messages.delete_confirm'))
  if (!confirmed) return

  isDeleting.value = {
    ...isDeleting.value,
    [highlight.id]: true
  }

  try {
    logger.debug('Eliminando highlight', { highlightId: highlight.id })
    await highlightsStore.deleteHighlight(highlight.id)
    clearHighlightUiState(highlight.id)
    uiStore.showSuccess(i18n.t('library.messages.delete_success'))
  } catch (err) {
    logger.error('Error deleting highlight', err)
    uiStore.showError(i18n.t('library.messages.delete_error'))
  } finally {
    const nextDeleting = { ...isDeleting.value }
    delete nextDeleting[highlight.id]
    isDeleting.value = nextDeleting
  }
}

const saveNote = async (highlight) => {
  try {
    logger.debug('Guardando nota', { highlightId: highlight.id })
    await highlightService.updateHighlight(highlight.id, {
      note: highlight.note
    })
  } catch (err) {
    logger.error('Error saving note', err)
    uiStore.showError(i18n.t('library.messages.note_error'))
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const locale = typeof i18n.locale === 'string' ? i18n.locale : i18n.locale?.value
  const localeCode = locale === 'en' ? 'en-US' : 'es-ES'
  return date.toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).toLowerCase()
}

const formatConnectionMeta = (highlight) => {
  const title = highlight?.book_title || i18n.t('library.meta_untitled')
  const authors = Array.isArray(highlight?.book_authors)
    ? highlight.book_authors.filter(Boolean).join(', ')
    : ''
  return authors ? `${title} — ${authors}` : title
}
</script>

<style scoped>
/* Match Notes header exactly */
.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
}

.notes-title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 400;
  margin: 0;
  margin-bottom: 0;
  text-transform: lowercase;
}

.btn-new-note {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--text-primary);
  border-radius: var(--border-radius);
  min-width: 7.5rem;
  height: 32px;
  padding: 0 var(--space-md);
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: lowercase;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.btn-new-note:hover {
  background: var(--text-primary);
  color: var(--bg-primary);
}

/* States */
.state-msg {
  text-align: center;
  padding: var(--space-3xl) 0;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.notes-container {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl) 0 var(--space-3xl);
}

.empty-text {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-style: italic;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.6;
}

.link-subtle {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: 4px var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-decoration: none;
  transition: all var(--transition-fast);
  letter-spacing: 0.04em;
  text-transform: lowercase;
}

.link-subtle:hover {
  border-color: var(--text-primary);
  background: rgba(10, 10, 10, 0.04);
  color: var(--text-primary);
}

/* Library Container */
.library-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Search */
.search-wrapper {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}

.search-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 300;
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
  font-size: var(--font-size-base);
}

/* Processing Widget */
.processing-widget {
  margin-top: var(--space-md);
  padding: var(--space-xs) 0;
  display: flex;
  align-items: center;
  animation: fadeIn 0.4s ease;
}

.widget-content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.widget-text {
  font-family: var(--font-display);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-style: italic;
  letter-spacing: 0.02em;
}

.processing-done .widget-text {
  color: var(--text-secondary);
}

.spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--border-subtle);
  border-top-color: var(--text-tertiary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.check-icon {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Search options that were reverted */
.search-empty {
  padding-top: var(--space-xl);
}

/* Book list */
.book-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.book-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  border: 1px solid var(--border-subtle);
  border-radius: var(--border-radius);
  background: var(--bg-secondary, transparent);
  padding: var(--space-lg);
}

.book-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  cursor: pointer;
  transition: opacity var(--transition-fast);
  gap: var(--space-md);
}

.book-row:hover {
  opacity: 0.7;
}

.book-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.book-title {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.book-count {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.book-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-left: var(--space-lg);
}

.book-download-btn {
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: 3px var(--space-sm);
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  cursor: pointer;
  text-transform: lowercase;
  letter-spacing: 0.03em;
  transition: all var(--transition-fast);
}

.book-download-btn:hover {
  border-color: var(--text-primary);
  background: rgba(10, 10, 10, 0.04);
  color: var(--text-primary);
}

.book-download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Expanded highlights */
.book-highlights {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md) 0 0;
  border-top: 1px solid var(--border-subtle);
}

.highlight-entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  border: 1px solid var(--border-subtle);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
  background: var(--bg-secondary, transparent);
}

.highlight-entry.has-open-connections {
  margin-bottom: 0;
}

.highlight-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
}

.highlight-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.favorite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 50%;
  padding: 0;
  margin-top: 0;
  font-size: 14px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}

.favorite-icon {
  width: 14px;
  height: 14px;
}

.delete-icon {
  width: 14px;
  height: 14px;
}

.favorite-btn:hover {
  color: #d4a842;
  border-color: rgba(212, 168, 66, 0.35);
  background: rgba(212, 168, 66, 0.08);
  transform: none;
}

.favorite-btn.is-favorite {
  color: #d4a842;
  border-color: rgba(212, 168, 66, 0.35);
  background: rgba(212, 168, 66, 0.08);
}

[data-theme="dark"] .favorite-btn:hover,
[data-theme="dark"] .favorite-btn.is-favorite {
  color: #d4a842;
  border-color: rgba(212, 168, 66, 0.5);
  background: rgba(212, 168, 66, 0.15);
}

.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 50%;
  padding: 0;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1;
}

.delete-btn:hover:not(:disabled) {
  color: #e06060;
  border-color: rgba(224, 96, 96, 0.35);
  background: rgba(224, 96, 96, 0.06);
  transform: none;
}

[data-theme="dark"] .delete-btn:hover:not(:disabled) {
  color: #e06060;
  border-color: rgba(224, 96, 96, 0.5);
  background: rgba(224, 96, 96, 0.15);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quote {
  padding-left: var(--space-lg);
  border-left: 1px solid var(--border-subtle);
  margin: 0 0 var(--space-sm) 0;
  flex: 1;
}

.quote p {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  line-height: 1.8;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: var(--space-sm);
}

.quote cite {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-style: normal;
  letter-spacing: 0.02em;
}

/* Highlight controls and visibility */
.vis-toggle {
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: 3px var(--space-xs);
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: 0.03em;
  text-transform: lowercase;
}

.vis-toggle:hover {
  border-color: var(--text-primary);
  background: rgba(10, 10, 10, 0.04);
  color: var(--text-primary);
}

.vis-toggle.is-public {
  border-color: rgba(100, 150, 100, 0.4);
  background: rgba(100, 150, 100, 0.18);
  color: var(--text-primary);
}

.vis-toggle.is-active {
  border-color: var(--text-primary);
  background: rgba(10, 10, 10, 0.08);
  color: var(--text-primary);
  font-weight: 400;
}

.highlight-controls {
  padding-left: var(--space-lg);
  margin-top: var(--space-sm);
}

.highlight-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.highlight-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-dot {
  color: var(--border-medium);
  font-size: var(--font-size-xs);
}

/* Conexiones UI */
.connections-area {
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
  padding: var(--space-xs) 0 0 var(--space-lg);
  border-left: 1px solid var(--border-medium);
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.connections-context {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.connection-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  padding: var(--space-sm) var(--space-md);
}

.connection-role {
  display: inline-flex;
  align-self: flex-end;
  border: 1px solid var(--border-subtle);
  color: var(--text-tertiary);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
  padding: 3px 6px;
  margin-bottom: var(--space-xs);
}

.connection-content {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
  margin: 0;
  line-height: 1.5;
}

.connection-meta {
  font-size: 10px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.connection-meta.italic {
  text-transform: none;
  font-style: italic;
}

.note-area {
  margin-top: var(--space-sm);
}

.note-input {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: transparent;
  resize: vertical;
  line-height: 1.6;
  min-height: 72px;
}

.note-input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.note-input::placeholder {
  color: var(--text-tertiary);
}

/* Load more */
.link-action {
  display: inline-flex;
  align-items: center;
  background: none;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  padding: 4px var(--space-sm);
  font-family: var(--font-ui);
  font-size: var(--font-size-xs);
  font-weight: 300;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: 0.04em;
  text-transform: lowercase;
}

.link-action:hover {
  border-color: var(--text-primary);
  background: rgba(10, 10, 10, 0.04);
  color: var(--text-primary);
}

.load-more {
  display: block;
  margin-top: var(--space-sm);
  margin-left: var(--space-lg);
}

.load-more-books {
  padding: var(--space-md) 0;
  text-align: center;
  width: fit-content;
  align-self: center;
}

@media (max-width: 640px) {
  .notes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .book-item {
    padding: var(--space-md);
  }

  .book-row {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .book-actions {
    margin-left: 0;
    gap: var(--space-sm);
  }

  .highlight-wrapper {
    gap: var(--space-xs);
  }
}

</style>
