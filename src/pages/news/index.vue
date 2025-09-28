<script setup lang="ts">
defineOptions({ name: 'ChuanLife-News' })

// ---------- Vue 核心工具函式 ----------
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Ref } from 'vue'

// ---------- 組件引入區（版面用） ----------
import DecorSection from '@/components/DecorSection.vue'

// ---------- 服務引入 ----------
import { NewsService, type ApiResponse } from '@/services/supabaseService'
import type { News } from '@/config/supabase'

/** ========== News Data 資料處裡 ========== */


/** 3. 新聞資料狀態 */
const newsData = ref<News[]>([])
const newsDataLoading = ref(false)
const newsDataError = ref<string | null>(null)

/** 4. 載入新聞資料 */
const loadNewsData = async () => {
  newsDataLoading.value = true
  newsDataError.value = null

  try {
    const response: ApiResponse<News[]> = await NewsService.getPublicNews()

    if (response.error) {
      newsDataError.value = response.error.message
      console.error('獲取新聞資料失敗:', response.error)
    } else {
      newsData.value = response.data || []
    }
  } catch (err: unknown) {
    newsDataError.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('獲取新聞資料時發生錯誤:', err)
  } finally {
    newsDataLoading.value = false
  }
}

onMounted(() => {
  loadNewsData()
})

// 分頁設定
const PAGE_SIZE = 6

// 過濾資料 - 根據 slot 欄位區分最新消息和特色新聞
const regularNewsList = computed(() =>
  newsData.value.filter((n: News) => n.show === true && n.slot === 'news'), // 最新消息 (slot === 'news')
)
const featuredNewsList = computed(() =>
  newsData.value.filter((n: News) => n.show === true && n.slot === 'featured'), // 特色新聞 (slot === 'featured')
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

// 同頁面跳轉新聞詳情
const router = useRouter()
function openNewsDetail(news: News) {
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
                    class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full"
                  >
                    {{ news.category }}
                  </span>
                  <span
                    v-if="news.pin"
                    class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full"
                  >
                    置頂
                  </span>
                </div>
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ news.title }}
                </h3>
                <div class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3" v-html="news.introduce"></div>
                <div
                  class="mt-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{{ formatDate(news.show_date || news.created_at || '') }}</span>
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
                     v-if="news.pin"
                     class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full"
                   >
                     置頂
                   </span>
                   <span
                     class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full"
                   >
                     特色
                   </span>
                 </div>
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  {{ news.title }}
                </h3>
                <div class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3" v-html="news.introduce"></div>
                 <div
                   class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
                 >
                   <span>{{ formatDate(news.show_date || news.created_at || '') }}</span>
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
