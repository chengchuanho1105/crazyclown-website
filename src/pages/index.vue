<script setup lang="ts">
defineOptions({ name: 'CrazyClown-Home' })

// ---------- Vue 核心工具函式 ----------
import { onMounted } from 'vue'

// ---------- 組件引入區（版面用） ----------
import FeatureImageSection from '@/components/FeatureImageSection.vue'

// ---------- 工具函式 ----------
import { useSheetData } from '@/composables/useSheetData'

// ---------- 資料來源 ----------
// 移除本地資料引入

/** ========== Home Hero Data 資料處裡 ========== */

/** 1. Home Hero Data 的資料格式 */
interface HomeHeroData {
  title: string
  description: string
  buttonText: string
  buttonLink: string
  align: 'left' | 'right' | undefined
  bgImage: string
  aos: string
  scrollDown?: boolean
}

/** 2. 取得 Home Hero Data CSV 來源 */
const HOMEHERODATA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRzBzSCLW9Ch8Hdo6fPDZKfdT1qhlFr9h3o-r3y4ZQsx7BvnkFw4hwCilPvU5bwWaP2N3llAX0S_Ud/pub?output=csv'

/** 3. 定義 CSV 欄位轉換函式 */
const mapHomeHeroData = (item: Record<string, string>): HomeHeroData => {
  return {
    title: item.title || '',
    description: item.description || '',
    buttonText: item.buttonText || '',
    buttonLink: item.buttonLink || '',
    align: item.align === 'left' || item.align === 'right' ? item.align : 'left',
    bgImage: item.bgImage || '',
    aos: item.aos || '',
    scrollDown:
      typeof item.scrollDown === 'string'
        ? item.scrollDown.trim().toLowerCase() === 'true'
          ? true
          : item.scrollDown.trim().toLowerCase() === 'false'
            ? false
            : undefined
        : typeof item.scrollDown === 'boolean'
          ? item.scrollDown
          : undefined,
  }
}

const {
  data: homeHeroData,
  loading: homeHeroLoading,
  error: homeHeroError,
  load: loadHomeHeroData,
} = useSheetData<HomeHeroData>(HOMEHERODATA_CSV_URL, mapHomeHeroData)

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
        :key="item.title"
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
