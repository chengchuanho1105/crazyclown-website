<script setup lang="ts">
defineOptions({ name: 'ChuanLife-News' })

// ---------- Vue 核心工具函式 ----------
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'

// ---------- 組件引入區（版面用） ----------
import DecorSection from '@/components/DecorSection.vue'

// ---------- 工具函式 ----------
import { useSheetData } from '@/composables/useSheetData'

/** ========== News Data 資料處裡 ========== */

/** 1. News Data 的資料格式 */
interface NewsData {
  id: string
  slot: string
  category: string
  date: string
  author: string
  image: string
  tags: string
  title: string
  introduction: string
  addBaseStyle: string
  html: string
}

/** 2. 取得 News Data CSV 來源 */
const NEWS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR7y16Qi2dNWRFl7OVgU78wv0SIMi_lPFt0WbZ6-7OqBFo7z2pN7LHs2heesTI4W5TnHM3lTcsXJS8s/pub?output=csv'

/** 3. 定義 CSV 欄位轉換函式 */
const mapNewsData = (item: Record<string, string>): NewsData => {
  // 處理標籤欄位，移除多餘的引號
  let tags = item.tags || ''
  if (tags.startsWith('"') && tags.endsWith('"')) {
    tags = tags.slice(1, -1)
  }

  return {
    id: item.id || '', // 編號
    slot: item.slot || '', // 類型 (news, featured, none(不顯示))
    category: item.category || '', // 分類
    date: item.date || '', // 日期
    author: item.author || '', // 作者
    image: item.image || '', // 圖片
    tags: tags, // 標籤
    title: item.title || '', // 標題
    introduction: item.introduce || '', // 內容
    addBaseStyle: item.addBaseStyle || '', // 是否添加基礎樣式
    html: item.html || '', // 內容
  }
}

const {
  data: newsData,
  loading: newsDataLoading,
  error: newsDataError,
  load: loadNewsData,
} = useSheetData<NewsData>(NEWS_CSV_URL, mapNewsData)

onMounted(() => {
  loadNewsData()
  console.log('News page mounted, loading data...')
})

// 分頁設定
const PAGE_SIZE = 6

// 過濾資料
const regularNewsList = computed(() =>
  newsData.value.filter((n: NewsData) => n.slot !== 'none' && n.slot !== 'featured'),
)
const featuredNewsList = computed(() =>
  newsData.value.filter((n: NewsData) => n.slot === 'featured'),
)

// 最新消息分頁
const regularPage = ref(1)
const regularTotalPages = computed(() => Math.ceil(regularNewsList.value.length / PAGE_SIZE))
const regularPaged = computed(() =>
  regularNewsList.value.slice((regularPage.value - 1) * PAGE_SIZE, regularPage.value * PAGE_SIZE),
)

// 特色新聞分頁
const featuredPage = ref(1)
const featuredTotalPages = computed(() => Math.ceil(featuredNewsList.value.length / PAGE_SIZE))
const featuredPaged = computed(() =>
  featuredNewsList.value.slice(
    (featuredPage.value - 1) * PAGE_SIZE,
    featuredPage.value * PAGE_SIZE,
  ),
)

// 添加調試資訊 - 移到 computed 定義之後
watch(
  newsData,
  (newData) => {
    console.log('News data loaded:', newData.length, 'items')
    console.log('Regular news:', regularNewsList.value.length)
    console.log('Featured news:', featuredNewsList.value.length)

    // 顯示前幾個項目的詳細資訊
    if (newData.length > 0) {
      console.log('First news item:', newData[0])
    }
  },
  { immediate: true },
)

// 監聽錯誤狀態
watch(
  newsDataError,
  (error) => {
    if (error) {
      console.error('News data error:', error)
    }
  },
  { immediate: true },
)

// 同頁面跳轉新聞詳情
const router = useRouter()
function openNewsDetail(news: NewsData) {
  router.push(`/news/${news.id}`)
}

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

const regularSectionRef = ref<InstanceType<typeof DecorSection> | null>(null)
const featuredSectionRef = ref<InstanceType<typeof DecorSection> | null>(null)

function scrollToSection(sectionRef: Ref<InstanceType<typeof DecorSection> | null>) {
  const el = sectionRef.value?.$el || sectionRef.value
  if (el && typeof el.getBoundingClientRect === 'function') {
    const navbarHeight = 80 // 請依實際 navbar 高度調整
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function goToRegularPage(page: number) {
  scrollToSection(regularSectionRef)
  regularPage.value = page
}
function goToFeaturedPage(page: number) {
  scrollToSection(featuredSectionRef)
  featuredPage.value = page
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
    <!--
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        class="flex flex-col h-full group rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-zinc-800 overflow-hidden cursor-pointer">
        <img src="https://i.meee.com.tw/SEDqQby.jpg" alt=""
          class="mb-2 aspect-video object-cover group-hover:scale-105 transition-transform duration-300 ">
        <div class="p-4 flex flex-col h-full">
          <div class="flex mb-2 gap-2 ">
            <span
              class="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-xs font-medium text-green-800 dark:text-green-200">
              標籤
            </span>
            <span
              class="px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900 text-xs font-medium text-sky-800 dark:text-sky-200">
              標籤
            </span>
          </div>
          <h3
            class="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 ">
            標題</h3>
          <p class="mb-2 text-base text-zinc-500 dark:text-zinc-400 line-clamp-3">內容</p>
          <div class="mt-auto flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span class="">作者</span>
            <span class="">2025-07-23</span>
          </div>
        </div>
      </div>
    </div>
    -->

    <!-- 載入狀態 -->
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
    <template v-else>
      <!-- 最新消息區塊 -->
      <DecorSection ref="regularSectionRef" main-title="最新消息" en-title="LATEST NEWS">
        <div v-if="regularPaged.length > 0" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="news in regularPaged"
              :key="news.id"
              class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              @click="openNewsDetail(news)"
            >
              <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  :src="news.image"
                  :alt="news.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="p-6">
                <div class="flex items-center gap-2 mb-3">
                  <span
                    class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full"
                  >
                    {{ news.category }}
                  </span>
                  <span
                    v-if="news.slot && news.slot !== 'none' && news.slot !== 'featured'"
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
                  >
                    {{ news.slot }}
                  </span>
                </div>
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ news.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {{ news.introduction }}
                </p>
                <div
                  class="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{{ formatDate(news.date || '') }}</span>
                  <span>{{ news.author }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 分頁控制 -->
          <div v-if="regularTotalPages > 1" class="flex justify-center items-center gap-2 mt-6">
            <button
              @click="goToRegularPage(regularPage - 1)"
              :disabled="regularPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              上一頁
            </button>
            <div class="flex gap-1">
              <button
                v-for="page in regularTotalPages"
                :key="page"
                @click="goToRegularPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  regularPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="goToRegularPage(regularPage + 1)"
              :disabled="regularPage === regularTotalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              下一頁
            </button>
          </div>
        </div>
        <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">沒有最新消息</div>
      </DecorSection>

      <!-- 特色新聞區塊 -->
      <DecorSection ref="featuredSectionRef" main-title="特色新聞" en-title="FEATURED NEWS">
        <div v-if="featuredPaged.length > 0" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="news in featuredPaged"
              :key="news.id"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
              @click="openNewsDetail(news)"
            >
              <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  :src="news.image"
                  :alt="news.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="p-6">
                <div class="flex items-center gap-2 mb-3">
                  <span
                    class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full"
                  >
                    {{ news.category }}
                  </span>
                  <span
                    v-if="news.slot === 'featured'"
                    class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full"
                  >
                    特色
                  </span>
                  <span
                    v-if="news.slot && news.slot !== 'none'"
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
                  >
                    {{ news.slot }}
                  </span>
                </div>
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ news.title }}
                </h3>
                <div class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3" v-html="news.introduction"></div>
                <div
                  class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{{ formatDate(news.date || '') }}</span>
                  <span>{{ news.author }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 分頁控制 -->
          <div v-if="featuredTotalPages > 1" class="flex justify-center items-center gap-2 mt-6">
            <button
              @click="goToFeaturedPage(featuredPage - 1)"
              :disabled="featuredPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              上一頁
            </button>
            <div class="flex gap-1">
              <button
                v-for="page in featuredTotalPages"
                :key="page"
                @click="goToFeaturedPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md',
                  featuredPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="goToFeaturedPage(featuredPage + 1)"
              :disabled="featuredPage === featuredTotalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              下一頁
            </button>
          </div>
        </div>
        <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">沒有特色新聞</div>
      </DecorSection>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.75;
}
</style>
