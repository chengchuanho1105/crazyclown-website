<script setup lang="ts">
defineOptions({ name: 'SupabaseTest' })
import { ref, onMounted } from 'vue'
import { useInventory } from '@/composables/useSupabase'
import { useStatistics } from '@/composables/useSupabase'

// 使用 Supabase Composables
const { inventoryItems, loading: inventoryLoading, error: inventoryError, fetchInventory } = useInventory()
const { inventoryStats, revenueStats, fetchInventoryStatistics, fetchRevenueStatistics } = useStatistics()

// 測試結果
const testResults = ref<any[]>([])
const isLoading = ref(false)

// 測試 Supabase 連接
const testSupabaseConnection = async () => {
  isLoading.value = true
  testResults.value = []

  try {
    // 測試 1: 獲取庫存資料
    console.log('測試 1: 獲取庫存資料...')
    await fetchInventory()

    testResults.value.push({
      test: '獲取庫存資料',
      success: !inventoryError.value,
      error: inventoryError.value,
      data: inventoryItems.value.length
    })

    // 測試 2: 獲取統計資料
    console.log('測試 2: 獲取統計資料...')
    await fetchInventoryStatistics()

    testResults.value.push({
      test: '獲取統計資料',
      success: true,
      error: null,
      data: inventoryStats.value
    })

    // 測試 3: 獲取營收統計
    console.log('測試 3: 獲取營收統計...')
    await fetchRevenueStatistics()

    testResults.value.push({
      test: '獲取營收統計',
      success: true,
      error: null,
      data: revenueStats.value
    })

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
    testResults.value.push({
      test: '測試過程',
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      data: null
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  testSupabaseConnection()
})
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Supabase 連接測試</h1>
      <p class="text-gray-600 dark:text-gray-400">測試 Supabase 資料庫連接和資料獲取</p>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-arrow-clockwise text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
        <span class="text-blue-800 dark:text-blue-200">正在測試 Supabase 連接...</span>
      </div>
    </div>

    <!-- 測試結果 -->
    <div class="space-y-4">
      <div v-for="result in testResults" :key="result.test"
           class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ result.test }}</h3>
            <div class="mt-2">
              <span v-if="result.success"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <i class="bi bi-check-circle mr-1"></i>
                成功
              </span>
              <span v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <i class="bi bi-x-circle mr-1"></i>
                失敗
              </span>
            </div>
          </div>
          <div class="text-right">
            <div v-if="result.error" class="text-red-600 dark:text-red-400 text-sm">
              {{ result.error }}
            </div>
            <div v-else-if="result.data !== null" class="text-gray-600 dark:text-gray-400 text-sm">
              資料: {{ typeof result.data === 'object' ? JSON.stringify(result.data) : result.data }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細資訊 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">詳細資訊</h3>

      <div class="space-y-4">
        <div>
          <h4 class="font-medium text-gray-700 dark:text-gray-300">庫存資料</h4>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <div>載入狀態: {{ inventoryLoading ? '載入中' : '完成' }}</div>
            <div>資料數量: {{ inventoryItems.length }}</div>
            <div v-if="inventoryError" class="text-red-600 dark:text-red-400">
              錯誤: {{ inventoryError }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-700 dark:text-gray-300">統計資料</h4>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <pre>{{ JSON.stringify(inventoryStats, null, 2) }}</pre>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-700 dark:text-gray-300">營收統計</h4>
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <pre>{{ JSON.stringify(revenueStats, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 重新測試按鈕 -->
    <div class="flex justify-center">
      <button @click="testSupabaseConnection"
              :disabled="isLoading"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center">
        <i v-if="isLoading" class="bi bi-arrow-clockwise animate-spin mr-2"></i>
        <i v-else class="bi bi-arrow-clockwise mr-2"></i>
        {{ isLoading ? '測試中...' : '重新測試' }}
      </button>
    </div>
  </div>
</template>
