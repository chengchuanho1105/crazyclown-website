<script setup lang="ts">
defineOptions({ name: 'InlineEditTest' })

import { ref, computed } from 'vue'

// 模擬資料
const messagesList = ref([
  {
    id: '1',
    category: '遊戲設定',
    title: '帳號綁定教學',
    content: '請按照以下步驟進行帳號綁定：\n1. 進入遊戲設定\n2. 點擊帳號綁定\n3. 輸入綁定資訊',
    keyword: ['帳號', '綁定', '教學'],
    remark: '請確保玩家已註冊帳號',
    image: ['https://via.placeholder.com/150?text=綁定教學'],
    usage_count: 5,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    category: '網頁活動',
    title: '活動時間說明',
    content: '本次活動時間為：\n開始時間：2024年1月1日\n結束時間：2024年1月31日\n請把握時間參與！',
    keyword: ['活動', '時間', '說明'],
    remark: '',
    image: [],
    usage_count: 12,
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z'
  },
  {
    id: '3',
    category: '遊戲異常',
    title: '登入問題解決',
    content: '如果遇到登入問題，請嘗試：\n1. 重新啟動遊戲\n2. 檢查網路連線\n3. 清除快取資料',
    keyword: ['登入', '問題', '解決'],
    remark: '如果問題持續，請聯繫客服',
    image: ['https://via.placeholder.com/150?text=登入問題'],
    usage_count: 8,
    created_at: '2024-01-08T09:15:00Z',
    updated_at: '2024-01-08T09:15:00Z'
  }
])

// 編輯狀態
const editingMessageId = ref<string | null>(null)
const editFormData = ref({
  category: '',
  title: '',
  content: '',
  keyword: [] as string[],
  remark: '',
  image: [] as string[]
})

// 關鍵字和圖片輸入
const keywordInput = ref('')
const imageInput = ref('')

// 錯誤訊息
const error = ref<string | null>(null)

// 開始編輯
const startEdit = (message: any) => {
  editingMessageId.value = message.id
  editFormData.value = {
    category: message.category,
    title: message.title,
    content: message.content,
    keyword: [...(message.keyword || [])],
    remark: message.remark || '',
    image: [...(message.image || [])]
  }
  keywordInput.value = ''
  imageInput.value = ''
  error.value = null
}

// 取消編輯
const cancelEdit = () => {
  editingMessageId.value = null
  editFormData.value = {
    category: '',
    title: '',
    content: '',
    keyword: [],
    remark: '',
    image: []
  }
  keywordInput.value = ''
  imageInput.value = ''
  error.value = null
}

// 儲存編輯
const saveEdit = async (messageId: string) => {
  // 驗證表單
  if (!editFormData.value.category?.trim() || !editFormData.value.title?.trim() || !editFormData.value.content?.trim()) {
    error.value = '分類、標題和內容為必填欄位'
    return
  }

  try {
    // 模擬 API 呼叫
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新本地資料
    const messageIndex = messagesList.value.findIndex(msg => msg.id === messageId)
    if (messageIndex !== -1) {
      messagesList.value[messageIndex] = {
        ...messagesList.value[messageIndex],
        category: editFormData.value.category.trim(),
        title: editFormData.value.title.trim(),
        content: editFormData.value.content.trim(),
        keyword: editFormData.value.keyword.length > 0 ? editFormData.value.keyword : null,
        remark: editFormData.value.remark?.trim() || null,
        image: editFormData.value.image.length > 0 ? editFormData.value.image : null,
        updated_at: new Date().toISOString()
      }
    }

    editingMessageId.value = null
    error.value = null
  } catch (err) {
    error.value = '儲存失敗，請重試'
    console.error('儲存錯誤:', err)
  }
}

// 刪除訊息
const deleteMessage = async (id: string) => {
  if (!confirm('確定要刪除這則罐頭訊息嗎？')) return

  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = messagesList.value.findIndex(msg => msg.id === id)
    if (index !== -1) {
      messagesList.value.splice(index, 1)
    }
  } catch (err) {
    error.value = '刪除失敗，請重試'
    console.error('刪除錯誤:', err)
  }
}

// 複製內容到剪貼簿
const copyToClipboard = async (content: string, id: string) => {
  try {
    await navigator.clipboard.writeText(content)

    // 更新使用次數
    const messageIndex = messagesList.value.findIndex(msg => msg.id === id)
    if (messageIndex !== -1) {
      messagesList.value[messageIndex].usage_count = (messagesList.value[messageIndex].usage_count || 0) + 1
    }

    // 顯示複製成功提示
    const originalContent = content
    setTimeout(() => {
      // 這裡可以添加複製成功的視覺回饋
    }, 2000)
  } catch (err) {
    console.error('複製失敗:', err)
    error.value = '複製到剪貼簿失敗'
  }
}

// 添加關鍵字
const addKeyword = () => {
  const kw = keywordInput.value.trim()
  if (kw && !editFormData.value.keyword.includes(kw)) {
    editFormData.value.keyword.push(kw)
    keywordInput.value = ''
  }
}

// 移除關鍵字
const removeKeyword = (index: number) => {
  editFormData.value.keyword.splice(index, 1)
}

// 添加圖片 URL
const addImageUrl = () => {
  const url = imageInput.value.trim()
  if (url && !editFormData.value.image.includes(url)) {
    editFormData.value.image.push(url)
    imageInput.value = ''
  }
}

// 移除圖片 URL
const removeImageUrl = (index: number) => {
  editFormData.value.image.splice(index, 1)
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

// 計算所有唯一的分類
const categories = computed(() => {
  const uniqueCategories = [...new Set(messagesList.value.map(msg => msg.category))]
  return uniqueCategories.sort()
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">罐頭訊息管理 - 內聯編輯測試</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">點擊編輯按鈕直接在列表中編輯，無需開啟新視窗</p>
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

    <!-- 罐頭訊息列表 -->
    <div class="space-y-4">
      <div
        v-for="message in messagesList"
        :key="message.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <!-- 編輯模式 -->
          <div v-if="editingMessageId === message.id">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <!-- 分類編輯 -->
                  <input
                    v-model="editFormData.category"
                    type="text"
                    required
                    list="categories"
                    :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 border-dashed border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600', getCategoryColor(editFormData.category)]"
                  />
                  <datalist id="categories">
                    <option v-for="cat in categories" :key="cat" :value="cat" />
                  </datalist>

                  <!-- 標題編輯 -->
                  <input
                    v-model="editFormData.title"
                    type="text"
                    required
                    class="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-dashed border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none px-0 py-0"
                  />
                </div>

                <!-- 關鍵字編輯 -->
                <div class="flex items-center gap-2 mb-3 flex-wrap">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>

                  <!-- 現有關鍵字標籤 -->
                  <span
                    v-for="(kw, idx) in editFormData.keyword"
                    :key="idx"
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ kw }}
                    <button
                      type="button"
                      @click="removeKeyword(idx)"
                      class="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>

                  <!-- 新增關鍵字輸入 -->
                  <div class="flex items-center gap-1">
                    <input
                      v-model="keywordInput"
                      @keyup.enter="addKeyword"
                      type="text"
                      placeholder="新增關鍵字"
                      class="px-2 py-0.5 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      @click="addKeyword"
                      class="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="新增關鍵字"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 操作按鈕 -->
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="saveEdit(message.id)"
                  class="p-2 bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 rounded-md transition-colors"
                  title="儲存"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  @click="cancelEdit"
                  class="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                  title="取消"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 備註編輯 -->
            <div v-if="editFormData.remark || true" class="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-3 mb-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">注意事項</p>
                  <textarea
                    v-model="editFormData.remark"
                    rows="2"
                    placeholder="輸入需要提醒客服注意的事項（選填）"
                    class="w-full text-sm text-amber-700 dark:text-amber-400 bg-transparent border-b border-dashed border-amber-400 focus:border-amber-600 focus:outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- 內容編輯 -->
            <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-3">
              <textarea
                v-model="editFormData.content"
                rows="4"
                required
                class="w-full text-gray-700 dark:text-gray-300 bg-transparent border-b-2 border-dashed border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
                placeholder="輸入罐頭訊息的完整內容..."
              ></textarea>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                字數：{{ editFormData.content.length }} 字 <span class="text-red-500 dark:text-red-400 font-bold ml-1">Discord 限制 2,000 字</span>
              </p>
            </div>

            <!-- 圖片編輯 -->
            <div class="mb-3">
              <div class="flex items-center mb-2 space-x-4">
                <div class="flex items-center gap-2">
                  <i class="bi bi-image text-xl text-gray-600 dark:text-gray-400 font-medium"></i>
                  <span class="text-xl text-gray-600 dark:text-gray-400 font-medium">附加圖片</span>
                </div>

                <!-- 新增圖片輸入 -->
                <div class="flex gap-2 items-center">
                  <input
                    v-model="imageInput"
                    @keyup.enter="addImageUrl"
                    type="url"
                    placeholder="輸入圖片 URL"
                    class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-xs"
                    style="min-width: 150px;"
                  />
                  <button
                    type="button"
                    @click="addImageUrl"
                    class="px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1 text-xs"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    新增
                  </button>
                </div>
              </div>

              <!-- 圖片網格 -->
              <div v-if="editFormData.image && editFormData.image.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <div
                  v-for="(imgUrl, idx) in editFormData.image"
                  :key="idx"
                  class="relative group rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                  style="aspect-ratio: 16 / 9;"
                >
                  <img
                    :src="imgUrl"
                    :alt="`圖片 ${idx + 1}`"
                    class="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=圖片載入失敗'"
                  />
                  <button
                    type="button"
                    @click="removeImageUrl(idx)"
                    class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="移除圖片"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 底部資訊保持不變 -->
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

          <!-- 顯示模式 -->
          <div v-else>
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span :class="['inline-flex px-3 py-1 text-xs font-semibold rounded-full border-2 border-dashed border-blue-50/0', getCategoryColor(message.category)]">
                    {{ message.category }}
                  </span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ message.title }}</h3>
                </div>
                <div v-if="message.keyword && message.keyword.length > 0" class="flex items-center gap-2 mb-3 flex-wrap">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span
                    v-for="(kw, idx) in message.keyword"
                    :key="idx"
                    class="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ kw }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="copyToClipboard(message.content, message.id)"
                  class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                  title="複製內容"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  @click="startEdit(message)"
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

            <!-- 備註提醒 -->
            <div v-if="message.remark" class="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-3 mb-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">注意事項</p>
                  <p class="text-sm text-amber-700 dark:text-amber-400 whitespace-pre-wrap">{{ message.remark }}</p>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-3">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ message.content }}</p>
            </div>

            <!-- 圖片預覽區 -->
            <div v-if="message.image && message.image.length > 0" class="mb-3">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">附加圖片 ({{ message.image.length }})</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <div
                  v-for="(imgUrl, idx) in message.image"
                  :key="idx"
                  class="relative rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                  style="aspect-ratio: 16 / 9;"
                >
                  <img
                    :src="imgUrl"
                    :alt="`圖片 ${idx + 1}`"
                    class="w-full h-full object-cover bg-gray-100 dark:bg-gray-800"
                    @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=圖片載入失敗'"
                  />
                </div>
              </div>
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
