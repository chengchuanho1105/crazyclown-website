<script setup lang="ts">
defineOptions({ name: 'Admin-News' })

import { ref, onMounted, computed } from 'vue'
import { NewsService } from '@/services/supabaseService'
import type { News } from '@/config/supabase'

// 新聞資料狀態
const newsList = ref<News[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 表單狀態
const showForm = ref(false)
const editingNews = ref<News | null>(null)
const formData = ref({
  slot: 'news', // 預設為 news
  category: '',
  author: '',
  image: '',
  tags: [] as string[],
  title: '',
  introduce: '',
  formatting_style: true, // 對應舊欄位 addStyle，boolean 型別
  html: '',
  show: true,
  pin: false,
  show_date: ''
})

// 載入新聞資料
const loadNewsData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await NewsService.getAllNews()
    if (response.error) {
      error.value = response.error.message
    } else {
      newsList.value = response.data || []
    }
  } catch (err) {
    error.value = '載入新聞資料時發生錯誤'
    console.error('載入新聞資料錯誤:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNewsData()
})

// 重置表單
const resetForm = () => {
  formData.value = {
    slot: 'news', // 預設為 news
    category: '',
    author: '',
    image: '',
    tags: [],
    title: '',
    introduce: '',
    formatting_style: true, // 對應舊欄位 addStyle，boolean 型別
    html: '',
    show: true,
    pin: false,
    show_date: ''
  }
  editingNews.value = null
}

// 開啟新增表單
const openAddForm = () => {
  resetForm()
  showForm.value = true
}

// 開啟編輯表單
const openEditForm = (news: News) => {
  editingNews.value = news
  formData.value = {
    slot: news.slot,
    category: news.category,
    author: news.author,
    image: news.image,
    tags: [...news.tags],
    title: news.title,
    introduce: news.introduce,
    formatting_style: news.formatting_style,
    html: news.html,
    show: news.show,
    pin: news.pin,
    show_date: news.show_date ? new Date(news.show_date).toISOString().slice(0, 16) : ''
  }
  showForm.value = true
}

// 關閉表單
const closeForm = () => {
  showForm.value = false
  resetForm()
}

// 處理標籤輸入
const tagInput = ref('')
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

// 自動生成 slug（保留函數以備將來使用）
const generateSlug = () => {
  // 目前 News 介面中沒有 slug 欄位，此函數保留以備將來使用
  const title = formData.value.title
  if (title) {
    // 可以在這裡添加 slug 生成邏輯
    console.log('生成 slug for:', title)
  }
}

// 儲存新聞
const saveNews = async () => {
  try {
    const newsData = {
      ...formData.value,
      show_date: formData.value.show_date ? new Date(formData.value.show_date).toISOString() : null
    }

    if (editingNews.value) {
      // 更新現有新聞
      const response = await NewsService.updateNews(editingNews.value.id, newsData as Partial<News>)
      if (response.error) {
        error.value = response.error.message
      } else {
        await loadNewsData()
        closeForm()
      }
    } else {
      // 新增新聞
      const response = await NewsService.createNews(newsData as Omit<News, 'id' | 'created_at' | 'updated_at'>)
      if (response.error) {
        error.value = response.error.message
      } else {
        await loadNewsData()
        closeForm()
      }
    }
  } catch (err) {
    error.value = '儲存新聞時發生錯誤'
    console.error('儲存新聞錯誤:', err)
  }
}

// 刪除新聞
const deleteNews = async (id: string) => {
  if (!confirm('確定要刪除這則新聞嗎？')) return

  try {
    const response = await NewsService.deleteNews(id)
    if (response.error) {
      error.value = response.error.message
    } else {
      await loadNewsData()
    }
  } catch (err) {
    error.value = '刪除新聞時發生錯誤'
    console.error('刪除新聞錯誤:', err)
  }
}

// 日期格式化
const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-TW')
}

// 狀態顏色
const getStatusColor = (status: string) => {
  switch (status) {
    case '發布': return 'bg-green-100 text-green-800'
    case '草稿': return 'bg-yellow-100 text-yellow-800'
    case '下架': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">新聞管理</h1>
      <button
        @click="openAddForm"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        新增新聞
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
    </div>

    <!-- 新聞列表 -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">標題</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">分類槽位</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">分類</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">作者</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">上架日期</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="news in newsList" :key="news.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img v-if="news.image" :src="news.image" :alt="news.title" class="h-10 w-10 rounded object-cover" />
                    <div v-else class="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4 max-w-xs">
                    <div class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ news.title }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ news.introduce }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  news.slot === 'featured' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]">
                  {{ news.slot === 'featured' ? '特色新聞' : '最新消息' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ news.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    news.show ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ news.show ? '顯示' : '隱藏' }}
                  </span>
                  <span v-if="news.pin" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    置頂
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ news.author }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ formatDate(news.show_date || news.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="openEditForm(news)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                >
                  編輯
                </button>
                <button
                  @click="deleteNews(news.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  刪除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 表單模態框 -->
    <div v-if="showForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ editingNews ? '編輯新聞' : '新增新聞' }}
          </h3>

          <form @submit.prevent="saveNews" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">標題</label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">分類槽位</label>
                <select
                  v-model="formData.slot"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="news">最新消息</option>
                  <option value="featured">特色新聞</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">簡介</label>
              <textarea
                v-model="formData.introduce"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">HTML 內容</label>
              <textarea
                v-model="formData.html"
                rows="10"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">圖片 URL</label>
                <input
                  v-model="formData.image"
                  type="url"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">作者</label>
                <input
                  v-model="formData.author"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">分類</label>
                <input
                  v-model="formData.category"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">上架日期</label>
                <input
                  v-model="formData.show_date"
                  type="datetime-local"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">標籤</label>
                <div class="mt-1">
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span
                      v-for="(tag, index) in formData.tags"
                      :key="index"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {{ tag }}
                      <button
                        type="button"
                        @click="removeTag(index)"
                        class="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  </div>
                  <div class="flex">
                    <input
                      v-model="tagInput"
                      @keyup.enter="addTag"
                      type="text"
                      placeholder="輸入標籤後按 Enter"
                      class="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      @click="addTag"
                      class="px-3 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
                    >
                      新增
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-center space-x-6">
                <div class="flex items-center">
                  <input
                    v-model="formData.show"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">顯示</label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="formData.pin"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">置頂</label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="formData.formatting_style"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-700 dark:text-gray-300">格式化樣式</label>
                </div>
              </div>
            </div>



            <div class="flex justify-end space-x-3 pt-4">
              <button
                @click="closeForm"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {{ editingNews ? '更新' : '新增' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
