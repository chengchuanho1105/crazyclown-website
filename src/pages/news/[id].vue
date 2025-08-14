<script setup lang="ts">
defineOptions({ name: 'CrazyClown-News' })
import { useSheetData } from '@/composables/useSheetData'
import { useHead } from '@unhead/vue'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

// 定義新聞資料類型
interface NewsDetailData {
  id: string
  slot: string
  category: string
  date: string
  author: string
  image: string
  tags: string
  title: string
  introduce: string
  html: string
  addBaseStyle: string
}

// 取得路由參數
const route = useRoute()
const newsId = computed(() => route.params.id as string)

// 取得所有新聞資料
const {
  data: newsData,
  loading: newsDataLoading,
  error: newsDataError,
  load: loadNewsData,
} = useSheetData<NewsDetailData>(
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7y16Qi2dNWRFl7OVgU78wv0SIMi_lPFt0WbZ6-7OqBFo7z2pN7LHs2heesTI4W5TnHM3lTcsXJS8s/pub?output=csv',
  (item: Record<string, string>) => {
    // 處理標籤欄位，移除多餘的引號
    let tags = item.tags || ''
    if (tags.startsWith('"') && tags.endsWith('"')) {
      tags = tags.slice(1, -1)
    }

    return {
      id: item.id || '',
      slot: item.slot || '',
      category: item.category || '',
      date: item.date || '',
      author: item.author || '',
      image: item.image || '',
      tags: tags,
      title: item.title || '',
      introduce: item.introduce || '',
      html: item.html || '',
      addBaseStyle: item.addStyle ?? item.addBaseStyle ?? '',
    }
  },
)

onMounted(() => {
  loadNewsData()
  // 添加調試信息
  setTimeout(() => {
    newsData.value.forEach((item, index) => {
      console.log(`新聞 ${index + 1}:`, {
        id: item.id,
        title: item.title,
        addBaseStyle: item.addBaseStyle,
        addBaseStyleType: typeof item.addBaseStyle,
        addBaseStyleLowerCase: item.addBaseStyle?.toLowerCase(),
      })
    })
  }, 2000)
})

// 找到對應新聞
const news = computed(() => newsData.value.find((n: NewsDetailData) => n.id === newsId.value))

// 動態設定 meta
const metaTitle = computed(() => {
  if (!news.value) return '新聞詳情'
  return news.value.title
})

const metaDescription = computed(() => {
  if (!news.value) return '新聞詳情'
  // 將 title + introduce 組合作為 description
  const title = news.value.title || ''
  const introduce = news.value.introduce || ''
  const combined = `${title} - ${introduce}`.trim()
  return combined.length > 160 ? combined.substring(0, 157) + '...' : combined
})

// 使用 useHead 設定 meta
useHead({
  title: metaTitle,
  meta: [
    { name: 'description', content: metaDescription },
    { property: 'og:title', content: metaTitle },
    { property: 'og:description', content: metaDescription },
    { property: 'og:image', content: news.value?.image || '' },
    { property: 'og:url', content: `https://crazyclown.online/news/${newsId.value}` },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'Crazy Clown' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:description', content: metaDescription },
    { name: 'twitter:image', content: news.value?.image || '' },
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

// 處理文章 HTML，根據 addBaseStyle 欄位決定是否處理
const processedArticle = computed(() => {
  if (!news.value?.html) {
    return ''
  }

  // 檢查 addBaseStyle 的值
  const addBaseStyleValue = news.value.addBaseStyle?.toLowerCase()

  // 如果 addBaseStyle 為 'false'，直接返回原始 HTML
  if (addBaseStyleValue === 'false') {
    return news.value.html
  }
  // 如果 addBaseStyle 為 true 或其他值，才進行樣式處理
  let html = news.value.html

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

function parseTags(tags: string): string[] {
  if (typeof tags !== 'string') return []

  // 移除開頭和結尾的引號
  let cleanTags = tags.trim()
  if (cleanTags.startsWith('"') && cleanTags.endsWith('"')) {
    cleanTags = cleanTags.slice(1, -1)
  }

  // 按逗號分割並清理每個標籤
  return cleanTags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
    <div v-if="newsDataLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>
    <div
      v-else-if="newsDataError"
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
          <p class="text-sm text-red-700 dark:text-red-300">{{ newsDataError }}</p>
        </div>
      </div>
    </div>
    <div
      v-else-if="newsData.length === 0"
      class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 m-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-yellow-700 dark:text-yellow-300">沒有找到新聞資料</p>
        </div>
      </div>
    </div>
    <div v-else-if="news">
      <div class="mb-6">
        <img v-if="news.image" :src="news.image" :alt="news.title" class="w-full rounded-lg mb-4" />
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{{ news.title }}</h1>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-if="news.category"
            class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
            >{{ news.category }}</span
          >
          <span
            v-if="news.slot && news.slot !== 'none'"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >{{ news.slot }}</span
          >
          <span
            v-if="news.author"
            class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
            >{{ news.author }}</span
          >
          <span
            v-if="news.date"
            class="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full"
            >{{ news.date }}</span
          >
        </div>
        <div v-if="news.tags" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tag in parseTags(news.tags as string)"
            :key="tag"
            class="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
            >#{{ tag }}</span
          >
        </div>
      </div>

      <hr class="my-6 border-gray-200 dark:border-gray-700" />
      <div
        class="prose text-gray-700 dark:text-gray-300 leading-relaxed"
        v-html="news.introduce"
      ></div>
      <hr class="my-6 border-gray-200 dark:border-gray-700" />

      <!-- 顯示詳細文章內容 -->
      <div v-if="news.html" class="mt-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        <div v-html="processedArticle" class="prose space-y-8"></div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 py-20">找不到此新聞</div>
  </div>
</template>
