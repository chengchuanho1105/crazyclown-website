<script setup lang="ts">
defineOptions({ name: 'News-Supabase-Detail' })
import { NewsService } from '@/services/supabaseService'
import { useHead } from '@unhead/vue'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { News } from '@/config/supabase'

// 取得路由參數
const route = useRoute()
const newsSlug = computed(() => route.params.slug as string)

// 新聞資料狀態
const news = ref<News | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 載入新聞資料
const loadNewsData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await NewsService.getNewsBySlug(newsSlug.value)
    if (response.error) {
      error.value = response.error.message
    } else {
      news.value = response.data
      // 增加瀏覽次數
      if (response.data) {
        await NewsService.incrementViews(response.data.id)
      }
    }
  } catch (err) {
    error.value = '載入新聞詳情時發生錯誤'
    console.error('載入新聞詳情錯誤:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNewsData()
})

// 動態設定 meta
const metaTitle = computed(() => {
  if (!news.value) return '新聞詳情'
  return news.value.title
})

const metaDescription = computed(() => {
  if (!news.value) return '新聞詳情'
  // 將 title + summary 組合作為 description
  const title = news.value.title || ''
  const summary = news.value.summary || ''
  const combined = `${title} - ${summary}`.trim()
  return combined.length > 160 ? combined.substring(0, 157) + '...' : combined
})

// 使用 useHead 設定 meta
useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: metaDescription },
    { property: 'og:title', content: metaTitle },
    { property: 'og:description', content: metaDescription },
    { property: 'og:image', content: news.value?.cover_image_url || '' },
    { property: 'og:url', content: `https://crazyclown.online/news-supabase/${newsSlug.value}` },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'Crazy Clown' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:description', content: metaDescription },
    { name: 'twitter:image', content: news.value?.cover_image_url || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

// 監聽 news 變化，更新 meta
watch(
  news,
  () => {
    // useHead 會自動更新，不需要額外處理
  },
  { immediate: true },
)

// 處理文章 HTML，添加樣式
const processedContent = computed(() => {
  if (!news.value?.content) {
    return ''
  }

  let html = news.value.content

  // 為 h2 標籤添加樣式
  html = html.replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-2 mt-16">')
  html = html.replace(/<\/h2>/g, '</h2>')

  // 為 h3 標籤添加樣式
  html = html.replace(/<h3>/g, '<h3 class="text-xl font-bold mb-2 mt-12">')
  html = html.replace(/<\/h3>/g, '</h3>')

  // 為 p 標籤添加樣式
  html = html.replace(/<p>/g, '<p class="mb-4">')
  html = html.replace(/<\/p>/g, '</p>')

  // 為 ul 標籤添加樣式
  html = html.replace(/<ul>/g, '<ul class="list-disc ml-4 mb-12">')
  html = html.replace(/<\/ul>/g, '</ul>')

  // 為 ol 標籤添加樣式
  html = html.replace(/<ol>/g, '<ol class="list-decimal ml-4 mb-12">')
  html = html.replace(/<\/ol>/g, '</ol>')

  // 為 li 標籤添加樣式
  html = html.replace(/<li>/g, '<li class="ml-4 mb-2">')
  html = html.replace(/<\/li>/g, '</li>')

  // 為 strong 標籤添加樣式
  html = html.replace(/<strong>/g, '<strong class="font-bold">')
  html = html.replace(/<\/strong>/g, '</strong>')

  // 為 a 標籤添加樣式
  html = html.replace(
    /<a\s+(?!class=)/gi,
    '<a class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium" ',
  )

  // 為外部連結添加圖示和特殊樣式
  html = html.replace(
    /<a([^>]*href="https?:\/\/[^"]*"[^>]*)>/gi,
    '<a$1 class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center"><svg class="inline-block w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>',
  )

  // 為內部連結（錨點連結）添加特殊樣式
  html = html.replace(
    /<a([^>]*href="#[^"]*"[^>]*)>/gi,
    '<a$1 class="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium">',
  )

  return html
})

// 日期格式化
const formatDate = (dateString: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>
    <div v-else-if="news">
      <div class="mb-6">
        <img v-if="news.cover_image_url" :src="news.cover_image_url" :alt="news.title" class="w-full rounded-lg mb-4" />
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{{ news.title }}</h1>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-if="news.category"
            class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
            >{{ news.category }}</span
          >
          <span
            v-if="news.is_pinned"
            class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"
            >置頂</span
          >
          <span
            v-if="news.priority > 0"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >優先級 {{ news.priority }}</span
          >
          <span
            v-if="news.author"
            class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
            >{{ news.author }}</span
          >
          <span
            v-if="news.published_at"
            class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
            >{{ formatDate(news.published_at) }}</span
          >
        </div>
        <div v-if="news.tags && news.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in news.tags"
            :key="tag"
            class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
            >#{{ tag }}</span
          >
        </div>
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>👁️ {{ news.views_count }} 次瀏覽</span>
          <span>📅 發布於 {{ formatDate(news.published_at) }}</span>
        </div>
      </div>

      <hr class="my-6 border-gray-200 dark:border-gray-700" />

      <!-- 摘要 -->
      <div v-if="news.summary" class="mb-8">
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">摘要</h2>
        <div
          class="prose text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          v-html="news.summary"
        ></div>
      </div>

      <hr class="my-6 border-gray-200 dark:border-gray-700" />

      <!-- 顯示詳細文章內容 -->
      <div v-if="news.content" class="mt-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">詳細內容</h2>
        <div v-html="processedContent" class="prose space-y-8"></div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-20">找不到此新聞</div>
  </div>
</template>

<style scoped>
.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.75;
}

.prose h2 {
  color: #1f2937;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

.prose h3 {
  color: #374151;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.dark .prose h2 {
  color: #f9fafb;
}

.dark .prose h3 {
  color: #e5e7eb;
}
</style>
