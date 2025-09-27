<script setup lang="ts">
defineOptions({ name: 'Admin-PriceList' })

// ---------- Vue 核心工具函式 ----------
import { ref, computed, onMounted } from 'vue'

// ---------- 服務引入 ----------
import { PriceListService, type ApiResponse } from '@/services/supabaseService'
import type { PriceList } from '@/config/supabase'

// ---------- 響應式資料 ----------
const priceListItems = ref<PriceList[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 編輯模式
const isEditing = ref(false)
const editingItem = ref<PriceList | null>(null)
const showForm = ref(false)

// 表單資料
const formData = ref<Record<string, any>>({})

// 分類篩選
const selectedCategory = ref<string>('')

// ---------- 計算屬性 ----------
const filteredItems = computed(() => {
  if (!selectedCategory.value) {
    return priceListItems.value
  }
  return priceListItems.value.filter(item => item.category === selectedCategory.value)
})

const availableCategories = computed(() => {
  const uniqueCategories = [...new Set(priceListItems.value.map(item => item.category))]
  return uniqueCategories.sort()
})

// ---------- 方法 ----------
const loadPriceListItems = async () => {
  loading.value = true
  error.value = null

  try {
    const response: ApiResponse<PriceList[]> = await PriceListService.getAllPriceListItems()

    if (response.error) {
      error.value = response.error.message
      console.error('獲取價格列表資料失敗:', response.error)
    } else {
      priceListItems.value = response.data || []
      console.log('成功獲取價格列表資料:', response.data)
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('獲取價格列表資料時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response: ApiResponse<string[]> = await PriceListService.getAllCategories()

    if (response.error) {
      console.error('獲取分類失敗:', response.error)
    } else {
      categories.value = response.data || []
    }
  } catch (err: unknown) {
    console.error('獲取分類時發生錯誤:', err)
  }
}

const startCreate = () => {
  isEditing.value = false
  editingItem.value = null
  formData.value = {
    category: '',
    currency: 'usd',
    name: '',
    usd: undefined,
    gcoin: undefined,
    specialPrice: 0,
    hotSale: false,
    sort: 0
  }
  showForm.value = true
}

const startEdit = (item: PriceList) => {
  isEditing.value = true
  editingItem.value = item
  formData.value = { ...item }
  showForm.value = true
}

const cancelEdit = () => {
  showForm.value = false
  isEditing.value = false
  editingItem.value = null
  formData.value = {}
}

const saveItem = async () => {
  loading.value = true
  error.value = null

  try {
    let response: ApiResponse<PriceList>

    if (isEditing.value && editingItem.value) {
      // 更新
      response = await PriceListService.updatePriceListItem(
        editingItem.value.id,
        formData.value
      )
    } else {
      // 新增
      response = await PriceListService.createPriceListItem(formData.value as Omit<PriceList, 'id' | 'created_at' | 'updated_at'>)
    }

    if (response.error) {
      error.value = response.error.message
      console.error('儲存失敗:', response.error)
    } else {
      console.log('儲存成功:', response.data)
      showForm.value = false
      loadPriceListItems() // 重新載入資料
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('儲存時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (item: PriceList) => {
  if (!confirm('確定要刪除這個價格項目嗎？')) return

  loading.value = true
  error.value = null

  try {
    const response: ApiResponse<boolean> = await PriceListService.deletePriceListItem(item.id)

    if (response.error) {
      error.value = response.error.message
      console.error('刪除失敗:', response.error)
    } else {
      console.log('刪除成功')
      loadPriceListItems() // 重新載入資料
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('刪除時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const toggleHotSale = async (item: PriceList) => {
  try {
    const response = await PriceListService.updatePriceListItem(item.id, {
      hotSale: !item.hotSale
    })

    if (response.error) {
      console.error('更新熱銷狀態失敗:', response.error)
    } else {
      loadPriceListItems() // 重新載入資料
    }
  } catch (err: unknown) {
    console.error('更新熱銷狀態時發生錯誤:', err)
  }
}

// ---------- 生命週期 ----------
onMounted(() => {
  loadPriceListItems()
  loadCategories()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 頁面標題 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          價格列表管理
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          管理商城頁面的商品價格和分類
        </p>
      </div>

      <!-- 分類篩選 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            商品分類篩選
          </h2>
          <button
            @click="startCreate"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增商品
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedCategory = ''"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedCategory === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            全部
          </button>
          <button
            v-for="category in availableCategories"
            :key="category"
            @click="selectedCategory = category"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ category }}
          </button>
        </div>
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
            <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- 無資料狀態 -->
      <div
        v-else-if="filteredItems.length === 0"
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
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              {{ selectedCategory ? `沒有找到「${selectedCategory}」分類的商品` : '還沒有任何商品資料' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ selectedCategory ? `${selectedCategory} 商品列表` : '全部商品列表' }}
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({{ filteredItems.length }} 項)
            </span>
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  排序
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  商品資訊
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  分類
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  原價
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  優惠價
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  狀態
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                :class="[
                  'hover:bg-gray-50 dark:hover:bg-gray-700',
                  item.hotSale ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {{ item.sort }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ item.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ item.currency === 'usd' ? 'USD 計價' : 'G-Coin 計價' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ item.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                  <div v-if="item.currency === 'usd' && item.usd">
                    USD {{ item.usd.toLocaleString() }}
                  </div>
                  <div v-else-if="item.currency === 'gcoin' && item.gcoin">
                    {{ item.gcoin.toLocaleString() }} G-Coin
                  </div>
                  <div v-else class="text-gray-400">-</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  TWD {{ item.specialPrice.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="toggleHotSale(item)"
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                      item.hotSale
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    ]"
                  >
                    {{ item.hotSale ? '🔥 熱銷' : '一般' }}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="startEdit(item)"
                      class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      編輯
                    </button>
                    <button
                      @click="deleteItem(item)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 編輯表單 Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
          <div class="mt-3">
            <!-- 表單標題 -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ isEditing ? '編輯' : '新增' }}商品
              </h3>
              <button
                @click="cancelEdit"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 表單內容 -->
            <form @submit.prevent="saveItem" class="space-y-4">
              <!-- 商品名稱 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  商品名稱 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- 分類 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  商品分類 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.category"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="例如：UC、BP、G-Coin 等"
                />
              </div>

              <!-- 貨幣類型 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  貨幣類型 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.currency"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="usd">USD</option>
                  <option value="gcoin">G-Coin</option>
                </select>
              </div>

              <!-- 原價 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  原價
                </label>
                <input
                  v-if="formData.currency === 'usd'"
                  v-model.number="formData.usd"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  v-else-if="formData.currency === 'gcoin'"
                  v-model.number="formData.gcoin"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- 優惠價格 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  優惠價格 (TWD) <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.specialPrice"
                  type="number"
                  required
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- 排序 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  排序 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="formData.sort"
                  type="number"
                  required
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="數字越小排序越靠前"
                />
              </div>

              <!-- 熱銷商品 -->
              <div class="flex items-center">
                <input
                  v-model="formData.hotSale"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  設為熱銷商品
                </label>
              </div>

              <!-- 表單按鈕 -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? '儲存中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
