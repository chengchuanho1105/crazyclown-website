<script setup lang="ts">
defineOptions({ name: 'Test-HomepageHero' })

// ---------- Vue 核心工具函式 ----------
import { ref, onMounted } from 'vue'

// ---------- 服務引入 ----------
import { HomepageHeroService, type ApiResponse } from '@/services/supabaseService'
import type { HomepageHero } from '@/config/supabase'

// ---------- 響應式資料 ----------
const homepageHeroes = ref<HomepageHero[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// ---------- 方法 ----------
const fetchHomepageHeroes = async () => {
  loading.value = true
  error.value = null

  try {
    const response: ApiResponse<HomepageHero[]> = await HomepageHeroService.getAllHomepageHeroes()

    if (response.error) {
      error.value = response.error.message
      console.error('獲取首頁 Hero 資料失敗:', response.error)
    } else {
      // 按照 ID 排序（假設 ID 是數字或可排序的字串）
      const sortedData = (response.data || []).sort((a, b) => {
        // 如果 ID 是數字，按數字大小排序
        const aId = parseInt(a.id)
        const bId = parseInt(b.id)
        if (!isNaN(aId) && !isNaN(bId)) {
          return aId - bId
        }
        // 如果 ID 不是數字，按字串排序
        return a.id.localeCompare(b.id)
      })
      homepageHeroes.value = sortedData
      console.log('成功獲取首頁 Hero 資料（已排序）:', sortedData)
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('獲取首頁 Hero 資料時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

// ---------- 生命週期 ----------
onMounted(() => {
  fetchHomepageHeroes()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 頁面標題 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          首頁 Hero 內容測試頁面
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          測試從 Supabase 取得 homepage_hero 資料表的內容
        </p>
      </div>

      <!-- 重新載入按鈕 -->
      <div class="mb-6">
        <button
          @click="fetchHomepageHeroes"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ loading ? '載入中...' : '重新載入資料' }}
        </button>
      </div>

      <!-- 載入狀態 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
      </div>

      <!-- 錯誤狀態 -->
      <div
        v-else-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
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
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">錯誤</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- 無資料狀態 -->
      <div
        v-else-if="homepageHeroes.length === 0"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6"
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
            <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">無資料</h3>
            <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              資料庫中沒有找到任何首頁 Hero 內容
            </p>
          </div>
        </div>
      </div>

      <!-- 資料顯示 -->
      <div v-else class="space-y-6">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            資料統計
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {{ homepageHeroes.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">總共 Hero 項目</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ homepageHeroes.filter(h => h.align === 'left').length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">左對齊項目</div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ homepageHeroes.filter(h => h.align === 'right').length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">右對齊項目</div>
            </div>
          </div>
        </div>

        <!-- Hero 項目列表 -->
        <div class="space-y-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">Hero 項目列表</h2>
          <div
            v-for="(hero, index) in homepageHeroes"
            :key="hero.id"
            class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      #{{ index + 1 }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {{ hero.align }}
                    </span>
                    <span v-if="hero.scrollDown" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      向下滾動
                    </span>
                  </div>

                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {{ hero.title }}
                  </h3>

                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    {{ hero.description }}
                  </p>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-gray-900 dark:text-white">按鈕文字:</span>
                      <span class="ml-2 text-gray-600 dark:text-gray-300">{{ hero.buttonText }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-900 dark:text-white">按鈕連結:</span>
                      <a
                        :href="hero.buttonLink"
                        target="_blank"
                        class="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {{ hero.buttonLink }}
                      </a>
                    </div>
                    <div>
                      <span class="font-medium text-gray-900 dark:text-white">AOS 動畫:</span>
                      <span class="ml-2 text-gray-600 dark:text-gray-300">{{ hero.aos }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-900 dark:text-white">建立時間:</span>
                      <span class="ml-2 text-gray-600 dark:text-gray-300">
                        {{ new Date(hero.created_at).toLocaleString('zh-TW') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 背景圖片預覽 -->
                <div v-if="hero.bgImage" class="ml-6 flex-shrink-0">
                  <div class="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      :src="hero.bgImage"
                      :alt="hero.title"
                      class="w-full h-full object-cover"
                      @error="$event.target.style.display='none'"
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    背景圖片
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
