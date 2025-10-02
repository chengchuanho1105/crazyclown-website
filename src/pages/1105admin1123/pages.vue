<script setup lang="ts">
defineOptions({ name: 'Admin-Pages' })

// ---------- Vue 核心工具函式 ----------
import { ref, computed, onMounted } from 'vue'

// ---------- 服務引入 ----------
import { HomepageHeroService, type ApiResponse } from '@/services/supabaseService'
import type { HomepageHero } from '@/config/supabase'

// ---------- 頁面和區塊配置 ----------
interface PageConfig {
  id: string
  name: string
  blocks: BlockConfig[]
}

interface BlockConfig {
  id: string
  name: string
  service: typeof HomepageHeroService
  fields: FieldConfig[]
}

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'url' | 'boolean'
  options?: { value: string; label: string }[]
  required?: boolean
}

// 頁面配置
const pageConfigs: PageConfig[] = [
  {
    id: 'homepage',
    name: '首頁',
    blocks: [
      {
        id: 'hero',
        name: 'Hero 區塊',
        service: HomepageHeroService,
        fields: [
          { key: 'title', label: '標題', type: 'text', required: true },
          { key: 'description', label: '描述', type: 'textarea', required: true },
          { key: 'buttonText', label: '按鈕文字', type: 'text', required: true },
          { key: 'buttonLink', label: '按鈕連結', type: 'text', required: true },
          {
            key: 'align',
            label: '對齊方式',
            type: 'select',
            required: true,
            options: [
              { value: 'left', label: '左對齊' },
              { value: 'right', label: '右對齊' }
            ]
          },
          { key: 'bgImage', label: '背景圖片 URL', type: 'url', required: true },
          { key: 'aos', label: 'AOS 動畫', type: 'text' },
          { key: 'scrollDown', label: '顯示向下滾動', type: 'boolean' }
        ]
      }
    ]
  }
]

// ---------- 響應式資料 ----------
const selectedPage = ref<string>('')
const selectedBlock = ref<string>('')
const items = ref<HomepageHero[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 編輯模式
const isEditing = ref(false)
const editingItem = ref<HomepageHero | null>(null)
const showForm = ref(false)

// 表單資料
const formData = ref<Record<string, any>>({})

// ---------- 計算屬性 ----------
const currentPageConfig = computed(() =>
  pageConfigs.find(page => page.id === selectedPage.value)
)

const currentBlockConfig = computed(() =>
  currentPageConfig.value?.blocks.find(block => block.id === selectedBlock.value)
)

const hasSelection = computed(() =>
  selectedPage.value && selectedBlock.value
)

// ---------- 方法 ----------
const selectPage = (pageId: string) => {
  selectedPage.value = pageId
  selectedBlock.value = ''
  items.value = []
}

const selectBlock = (blockId: string) => {
  selectedBlock.value = blockId
  loadItems()
}

const loadItems = async () => {
  if (!hasSelection.value) return

  loading.value = true
  error.value = null

  try {
    const blockConfig = currentBlockConfig.value
    if (!blockConfig) return

    const response: ApiResponse<HomepageHero[]> = await blockConfig.service.getAllHomepageHeroes()

    if (response.error) {
      error.value = response.error.message
      console.error('獲取資料失敗:', response.error)
    } else {
      // 按照 ID 排序
      const sortedData = (response.data || []).sort((a, b) => {
        const aId = parseInt(a.id)
        const bId = parseInt(b.id)
        if (!isNaN(aId) && !isNaN(bId)) {
          return aId - bId
        }
        return a.id.localeCompare(b.id)
      })
      items.value = sortedData
      console.log('成功獲取資料:', sortedData)
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('獲取資料時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const startCreate = () => {
  isEditing.value = false
  editingItem.value = null
  formData.value = {}
  showForm.value = true
}

const startEdit = (item: HomepageHero) => {
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
  if (!currentBlockConfig.value) return

  loading.value = true
  error.value = null

  try {
    const blockConfig = currentBlockConfig.value
    let response: ApiResponse<HomepageHero>

    if (isEditing.value && editingItem.value) {
      // 更新
      response = await blockConfig.service.updateHomepageHero(
        editingItem.value.id,
        formData.value
      )
    } else {
      // 新增
      response = await blockConfig.service.createHomepageHero(formData.value as Omit<HomepageHero, 'id' | 'created_at' | 'updated_at'>)
    }

    if (response.error) {
      error.value = response.error.message
      console.error('儲存失敗:', response.error)
    } else {
      console.log('儲存成功:', response.data)
      showForm.value = false
      loadItems() // 重新載入資料
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('儲存時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const deleteItem = async (item: HomepageHero) => {
  if (!currentBlockConfig.value || !confirm('確定要刪除這個項目嗎？')) return

  loading.value = true
  error.value = null

  try {
    const blockConfig = currentBlockConfig.value
    const response: ApiResponse<boolean> = await blockConfig.service.deleteHomepageHero(item.id)

    if (response.error) {
      error.value = response.error.message
      console.error('刪除失敗:', response.error)
    } else {
      console.log('刪除成功')
      loadItems() // 重新載入資料
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知錯誤'
    console.error('刪除時發生錯誤:', err)
  } finally {
    loading.value = false
  }
}

const moveItem = async (item: HomepageHero, direction: 'up' | 'down') => {
  // TODO: 實作排序功能
  console.log(`移動 ${item.title} ${direction}`)
}

// ---------- 生命週期 ----------
onMounted(() => {
  // 預設選擇首頁
  if (pageConfigs.length > 0) {
    selectPage(pageConfigs[0].id)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 頁面標題 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          頁面內容管理
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          管理各個頁面的內容和區塊
        </p>
      </div>

      <!-- 頁面選擇 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          選擇頁面
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="page in pageConfigs"
            :key="page.id"
            @click="selectPage(page.id)"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              selectedPage === page.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            ]"
          >
            <div class="font-medium">{{ page.name }}</div>
            <div class="text-sm opacity-75">
              {{ page.blocks.length }} 個區塊
            </div>
          </button>
        </div>
      </div>

      <!-- 區塊選擇 -->
      <div v-if="currentPageConfig" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          選擇區塊
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="block in currentPageConfig.blocks"
            :key="block.id"
            @click="selectBlock(block.id)"
            :class="[
              'p-4 rounded-lg border-2 transition-colors',
              selectedBlock === block.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
            ]"
          >
            <div class="font-medium">{{ block.name }}</div>
          </button>
        </div>
      </div>

      <!-- 內容管理區域 -->
      <div v-if="hasSelection" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ currentPageConfig?.name }} - {{ currentBlockConfig?.name }}
          </h2>
          <button
            @click="startCreate"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增項目
          </button>
        </div>

        <!-- 載入狀態 -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          v-else-if="items.length === 0"
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
                此區塊還沒有任何內容
              </p>
            </div>
          </div>
        </div>

        <!-- 項目列表 -->
        <div v-else class="space-y-4">
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    #{{ index + 1 }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {{ item.align }}
                  </span>
                  <span v-if="item.scrollDown" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    向下滾動
                  </span>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {{ item.title }}
                </h3>

                <p class="text-gray-600 dark:text-gray-300 mb-3">
                  {{ item.description }}
                </p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">按鈕:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-300">{{ item.buttonText }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-900 dark:text-white">AOS:</span>
                    <span class="ml-2 text-gray-600 dark:text-gray-300">{{ item.aos }}</span>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="ml-4 flex flex-col space-y-2">
                <button
                  @click="startEdit(item)"
                  class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  編輯
                </button>
                <button
                  @click="deleteItem(item)"
                  class="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 text-sm font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  刪除
                </button>
                <div class="flex space-x-1">
                  <button
                    @click="moveItem(item, 'up')"
                    :disabled="index === 0"
                    class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    @click="moveItem(item, 'down')"
                    :disabled="index === items.length - 1"
                    class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                {{ isEditing ? '編輯' : '新增' }} {{ currentBlockConfig?.name }}
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
              <div
                v-for="field in currentBlockConfig?.fields"
                :key="field.key"
                class="space-y-2"
              >
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ field.label }}
                  <span v-if="field.required" class="text-red-500">*</span>
                </label>

                <!-- 文字輸入 -->
                <input
                  v-if="field.type === 'text'"
                  v-model="formData[field.key]"
                  type="text"
                  :required="field.required"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />

                <!-- 文字區域 -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="formData[field.key]"
                  :required="field.required"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                ></textarea>

                <!-- 下拉選單 -->
                <select
                  v-else-if="field.type === 'select'"
                  v-model="formData[field.key]"
                  :required="field.required"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">請選擇</option>
                  <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <!-- URL 輸入 -->
                <input
                  v-else-if="field.type === 'url'"
                  v-model="formData[field.key]"
                  type="url"
                  :required="field.required"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />

                <!-- 布林值 -->
                <div v-else-if="field.type === 'boolean'" class="flex items-center">
                  <input
                    v-model="formData[field.key]"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    啟用
                  </label>
                </div>
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
