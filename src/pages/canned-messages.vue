<script setup lang="ts">
defineOptions({ name: 'CannedMessages' })

import { ref, computed, onMounted, watch } from 'vue'
import { CannedMessageService } from '@/services/supabaseService'
import type { CannedMessage } from '@/config/supabase'

// 罐頭訊息資料狀態
const messagesList = ref<CannedMessage[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 表單狀態
const showForm = ref(false)
const editingMessage = ref<CannedMessage | null>(null)
const formData = ref({
  category: '',
  title: '',
  content: '',
  keyword: ''
})

// 搜尋和篩選
const searchQuery = ref('')
const selectedCategory = ref<string>('')

// 排序
const sortBy = ref<'category' | 'usage_count' | 'title' | 'created_at'>('category')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 監聽排序依據變化，自動調整排序方向
watch(sortBy, (newValue) => {
  if (newValue === 'usage_count') {
    // 使用次數預設為多到少
    sortOrder.value = 'desc'
  } else if (newValue === 'created_at') {
    // 建立時間預設為新到舊
    sortOrder.value = 'desc'
  } else {
    // 其他欄位預設為升序
    sortOrder.value = 'asc'
  }
})

// 分頁
const currentPage = ref(1)
const itemsPerPage = 10

// 複製提示
const copiedMessageId = ref<string | null>(null)

// 載入罐頭訊息資料
const loadMessagesData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await CannedMessageService.getAllCannedMessages()
    if (response.error) {
      error.value = response.error.message
    } else {
      messagesList.value = response.data || []
    }
  } catch (err) {
    error.value = '載入罐頭訊息資料時發生錯誤'
    console.error('載入罐頭訊息資料錯誤:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMessagesData()
})

// 計算所有唯一的分類
const categories = computed(() => {
  const uniqueCategories = [...new Set(messagesList.value.map(msg => msg.category))]
  return uniqueCategories.sort()
})

// 篩選後的訊息列表
const filteredMessages = computed(() => {
  let filtered = messagesList.value

  // 根據搜尋關鍵字篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(msg =>
      msg.title.toLowerCase().includes(query) ||
      msg.content.toLowerCase().includes(query) ||
      (msg.keyword && msg.keyword.toLowerCase().includes(query)) ||
      msg.category.toLowerCase().includes(query)
    )
  }

  // 根據分類篩選
  if (selectedCategory.value) {
    filtered = filtered.filter(msg => msg.category === selectedCategory.value)
  }

  // 根據選擇的欄位排序
  filtered = filtered.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'category':
        comparison = a.category.localeCompare(b.category, 'zh-TW')
        break
      case 'usage_count':
        comparison = (a.usage_count || 0) - (b.usage_count || 0)
        break
      case 'title':
        comparison = a.title.localeCompare(b.title, 'zh-TW')
        break
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    // 根據排序方向調整結果
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return filtered
})

// 分頁後的訊息列表
const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMessages.value.slice(start, end)
})

// 總頁數
const totalPages = computed(() => Math.ceil(filteredMessages.value.length / itemsPerPage))

// 重置表單
const resetForm = () => {
  formData.value = {
    category: '',
    title: '',
    content: '',
    keyword: ''
  }
  editingMessage.value = null
}

// 開啟新增表單
const openAddForm = () => {
  resetForm()
  showForm.value = true
}

// 開啟編輯表單
const openEditForm = (message: CannedMessage) => {
  editingMessage.value = message
  formData.value = {
    category: message.category,
    title: message.title,
    content: message.content,
    keyword: message.keyword || ''
  }
  showForm.value = true
}

// 關閉表單
const closeForm = () => {
  showForm.value = false
  resetForm()
}

// 儲存罐頭訊息
const saveMessage = async () => {
  // 驗證表單
  if (!formData.value.category?.trim() || !formData.value.title?.trim() || !formData.value.content?.trim()) {
    error.value = '分類、標題和內容為必填欄位'
    return
  }

  try {
    if (editingMessage.value) {
      // 更新現有罐頭訊息
      const messageData: Partial<CannedMessage> = {
        category: formData.value.category.trim(),
        title: formData.value.title.trim(),
        content: formData.value.content.trim(),
        keyword: formData.value.keyword?.trim() || null
      }

      const response = await CannedMessageService.updateCannedMessage(editingMessage.value.id, messageData)
      if (response.error) {
        error.value = `更新失敗：${response.error.message}`
        console.error('更新錯誤詳情:', response.error)
      } else {
        await loadMessagesData()
        closeForm()
      }
    } else {
      // 新增罐頭訊息
      const newMessageData: Omit<CannedMessage, 'id' | 'created_at' | 'updated_at'> = {
        category: formData.value.category.trim(),
        title: formData.value.title.trim(),
        content: formData.value.content.trim(),
        keyword: formData.value.keyword?.trim() || null,
        usage_count: 0  // 初始使用次數為 0
      }
      const response = await CannedMessageService.createCannedMessage(newMessageData)
      if (response.error) {
        error.value = `新增失敗：${response.error.message}`
        console.error('新增錯誤詳情:', response.error)
      } else {
        await loadMessagesData()
        closeForm()
      }
    }
  } catch (err) {
    error.value = '儲存罐頭訊息時發生錯誤'
    console.error('儲存罐頭訊息錯誤:', err)
  }
}

// 刪除罐頭訊息
const deleteMessage = async (id: string) => {
  if (!confirm('確定要刪除這則罐頭訊息嗎？')) return

  try {
    const response = await CannedMessageService.deleteCannedMessage(id)
    if (response.error) {
      error.value = response.error.message
    } else {
      await loadMessagesData()
    }
  } catch (err) {
    error.value = '刪除罐頭訊息時發生錯誤'
    console.error('刪除罐頭訊息錯誤:', err)
  }
}

// 複製內容到剪貼簿
const copyToClipboard = async (content: string, id: string) => {
  try {
    await navigator.clipboard.writeText(content)
    copiedMessageId.value = id

    // 更新使用次數
    const response = await CannedMessageService.incrementUsageCount(id)
    if (response.error) {
      console.error('更新使用次數失敗:', response.error)
    } else {
      // 重新載入資料以更新使用次數顯示
      await loadMessagesData()
    }

    setTimeout(() => {
      copiedMessageId.value = null
    }, 2000)
  } catch (err) {
    console.error('複製失敗:', err)
    error.value = '複製到剪貼簿失敗'
  }
}

// 日期格式化
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 分類顏色
const getCategoryColor = (category: string) => {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
  ]
  const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">罐頭訊息管理</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">管理常用的回覆訊息模板</p>
      </div>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新增罐頭訊息
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        <button @click="error = null" class="ml-auto text-red-500 hover:text-red-700">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜尋</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋標題、內容、關鍵字或分類..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分類篩選</label>
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">全部分類</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- 排序選項 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">排序依據</label>
          <select
            v-model="sortBy"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="category">分類</option>
            <option value="usage_count">使用次數</option>
            <option value="title">標題名稱</option>
            <option value="created_at">建立時間</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">排序方向</label>
          <select
            v-model="sortOrder"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="asc">
              {{ sortBy === 'usage_count' ? '少 → 多' : sortBy === 'created_at' ? '舊 → 新' : '小 → 大 (A → Z)' }}
            </option>
            <option value="desc">
              {{ sortBy === 'usage_count' ? '多 → 少' : sortBy === 'created_at' ? '新 → 舊' : '大 → 小 (Z → A)' }}
            </option>
          </select>
        </div>
      </div>

      <!-- 統計資訊 -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm flex-wrap gap-2">
          <div class="flex items-center gap-4 flex-wrap">
            <span class="text-gray-600 dark:text-gray-400">
              顯示 {{ filteredMessages.length }} 筆訊息
              <span v-if="searchQuery || selectedCategory" class="text-indigo-600 dark:text-indigo-400">
                (已篩選，共 {{ messagesList.length }} 筆)
              </span>
            </span>
            <span class="text-gray-500 dark:text-gray-400 text-xs">
              排序：{{
                sortBy === 'category' ? '分類' :
                sortBy === 'usage_count' ? '使用次數' :
                sortBy === 'title' ? '標題' :
                '建立時間'
              }}
              ({{ sortOrder === 'asc' ? '升序' : '降序' }})
            </span>
          </div>
          <button
            v-if="searchQuery || selectedCategory"
            @click="searchQuery = ''; selectedCategory = ''"
            class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            清除篩選
          </button>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>

    <!-- 罐頭訊息列表 -->
    <div v-else class="space-y-4">
      <div v-if="paginatedMessages.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">沒有找到罐頭訊息</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery || selectedCategory ? '請嘗試調整搜尋條件' : '開始新增第一則罐頭訊息吧！' }}
        </p>
      </div>

      <div
        v-for="message in paginatedMessages"
        :key="message.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full', getCategoryColor(message.category)]">
                  {{ message.category }}
                </span>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ message.title }}</h3>
              </div>
              <div v-if="message.keyword" class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ message.keyword }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-4">
              <button
                @click="copyToClipboard(message.content, message.id)"
                :class="[
                  'p-2 rounded-md transition-colors',
                  copiedMessageId === message.id
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                ]"
                :title="copiedMessageId === message.id ? '已複製！' : '複製內容'"
              >
                <svg v-if="copiedMessageId === message.id" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                @click="openEditForm(message)"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                title="編輯"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteMessage(message.id)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="刪除"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-3">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ message.content }}</p>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="font-medium">使用 {{ message.usage_count || 0 }} 次</span>
            </div>
            <div class="flex items-center gap-4">
              <span>建立時間：{{ formatDate(message.created_at) }}</span>
              <span v-if="message.updated_at !== message.created_at">更新時間：{{ formatDate(message.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <nav class="flex items-center space-x-2">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
        >
          上一頁
        </button>
        <span class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
          第 {{ currentPage }} / {{ totalPages }} 頁
        </span>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
        >
          下一頁
        </button>
      </nav>
    </div>

    <!-- 表單模態框 -->
    <div v-if="showForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ editingMessage ? '編輯罐頭訊息' : '新增罐頭訊息' }}
            </h3>
            <button
              @click="closeForm"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveMessage" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分類 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.category"
                  type="text"
                  required
                  list="categories"
                  placeholder="e.g. 遊戲設定、網頁活動、遊戲異常"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <datalist id="categories">
                  <option v-for="cat in categories" :key="cat" :value="cat" />
                </datalist>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  關鍵字
                </label>
                <input
                  v-model="formData.keyword"
                  type="text"
                  placeholder="e.g. 發放、設定...等簡短單詞"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                標題 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="簡短描述此罐頭訊息的用途"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                內容 <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="formData.content"
                rows="8"
                required
                placeholder="輸入罐頭訊息的完整內容..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                字數：{{ formData.content.length }} 字 <span class="text-red-500 dark:text-red-400 font-bold ml-1">Discord 限制 2,000 字</span>
              </p>
            </div>

            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="closeForm"
                type="button"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {{ editingMessage ? '更新' : '新增' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自訂捲軸樣式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

