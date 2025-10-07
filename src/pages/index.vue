<script setup lang="ts">
defineOptions({ name: 'CrazyClown-Home' })

// ---------- Vue 核心工具函式 ----------
import { ref, onMounted } from 'vue'

// ---------- 組件引入區（版面用） ----------
import FeatureImageSection from '@/components/FeatureImageSection.vue'

// ---------- 服務引入 ----------
import { HomepageHeroService, type ApiResponse } from '@/services/supabaseService'
import type { HomepageHero } from '@/config/supabase'

/** ========== Home Hero Data 資料處裡 ========== */

// ---------- 響應式資料 ----------
const homeHeroData = ref<HomepageHero[]>([])
const homeHeroLoading = ref(false)
const homeHeroError = ref<string | null>(null)

// ---------- 方法 ----------
const loadHomeHeroData = async () => {
  homeHeroLoading.value = true
  homeHeroError.value = null

  try {
    const response: ApiResponse<HomepageHero[]> = await HomepageHeroService.getAllHomepageHeroes()

    if (response.error) {
      homeHeroError.value = response.error.message
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
      homeHeroData.value = sortedData
    }
  } catch (err: unknown) {
    homeHeroError.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('獲取首頁 Hero 資料時發生錯誤:', err)
  } finally {
    homeHeroLoading.value = false
  }
}

// ---------- 生命週期 ----------
onMounted(() => {
  loadHomeHeroData()
})
</script>

<template>
  <div>
    <div v-if="homeHeroLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>
    <div
      v-else-if="homeHeroError"
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
          <p class="text-sm text-red-700 dark:text-red-300">{{ homeHeroError }}</p>
        </div>
      </div>
    </div>
    <div
      v-else-if="homeHeroData.length === 0"
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
          <p class="text-sm text-yellow-700 dark:text-yellow-300">沒有找到資料</p>
        </div>
      </div>
    </div>
    <template v-else>
      <FeatureImageSection
        v-for="item in homeHeroData"
        :key="item.id"
        :title="item.title"
        :description="item.description"
        :button-text="item.buttonText"
        :button-link="item.buttonLink"
        :align="item.align"
        :bg-image="item.bgImage"
        :aos="item.aos"
        :scroll-down="item.scrollDown"
      />
    </template>
  </div>
</template>

<style scoped></style>
