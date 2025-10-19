<script setup lang="ts">
defineOptions({ name: 'CustomerManagement' })
import { ref, computed, onMounted } from 'vue'
import { useCustomers } from '@/composables/useSupabase'
import type { Customer } from '@/config/supabase'

// 使用 Supabase Composables - 只載入客戶資料
const { customers, loading: customersLoading, fetchCustomers, createCustomer, updateCustomer } = useCustomers()

// 搜尋
const searchQuery = ref('')

// 分頁
const currentPage = ref(1)
const itemsPerPage = 10

// 新增客戶表單
const showAddCustomerModal = ref(false)
const showEditCustomerModal = ref(false)
const showDetailModal = ref(false)
const editingCustomer = ref<Customer | null>(null)
const detailCustomer = ref<Customer | null>(null)
const newCustomerForm = ref({
  name: '',
  phone: '',
  id_number: '',
  contact_method: '',
  contact_method_id: '',
  contact_method_account: '',
  contact_method_nickname: '',
  address: '',
  pubg_nickname: '',
  pubg_account_id: '',
  steam_id: '',
  nickname: ''
})

// 表單驗證
const formErrors = ref<Record<string, string | null>>({})

// 載入狀態
const isLoading = ref(false)
const error = ref<string | null>(null)

// 計算篩選後的客戶
const filteredCustomers = computed(() => {
  return customers.value.filter(customer => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.nickname?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.phone?.includes(searchQuery.value) ||
      customer.pubg_nickname?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.contact_method_account?.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesSearch
  })
})

// 計算分頁
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCustomers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage))

// 計算客戶統計
const totalCustomers = computed(() => filteredCustomers.value.length)

// 驗證表單
const validateForm = () => {
  formErrors.value = {}

  // 檢查是否有至少一個識別欄位
  const name = newCustomerForm.value.name?.trim() || ''
  const nickname = newCustomerForm.value.nickname?.trim() || ''
  const phone = newCustomerForm.value.phone?.trim() || ''
  const pubgNickname = newCustomerForm.value.pubg_nickname?.trim() || ''
  const contactAccount = newCustomerForm.value.contact_method_account?.trim() || ''

  const hasIdentifier = name || nickname || phone || pubgNickname || contactAccount

  if (!hasIdentifier) {
    formErrors.value['general'] = '請至少填寫姓名、暱稱、電話、PUBG暱稱或聯絡方式帳號其中一項'
    return false
  }

  // 檢查電話格式，如果不是 +886 開頭，自動加上
  if (newCustomerForm.value.phone && !newCustomerForm.value.phone.startsWith('+886')) {
    if (newCustomerForm.value.phone.startsWith('0')) {
      newCustomerForm.value.phone = '+886' + newCustomerForm.value.phone.substring(1)
    } else {
      newCustomerForm.value.phone = '+886' + newCustomerForm.value.phone
    }
  }

  // 檢查身分證號格式（如果填寫了的話）
  if (newCustomerForm.value.id_number && !newCustomerForm.value.id_number.match(/^[A-Z]\d{8}$/)) {
    formErrors.value.id_number = '身分證號格式錯誤，應為一個英文字母後接8位數字'
  }

  // 檢查 Steam ID 格式（如果填寫了的話）
  if (newCustomerForm.value.steam_id && !newCustomerForm.value.steam_id.match(/^\d{17}$/)) {
    formErrors.value.steam_id = 'Steam ID 應為17位數字'
  }

  return Object.keys(formErrors.value).length === 0
}

// 新增客戶
const addCustomer = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 過濾掉空值，避免約束檢查錯誤
    const cleanCustomerData: Record<string, string | number> = {}

    Object.entries(newCustomerForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanCustomerData[key as string] = value
      }
    })

    console.log('清理後的客戶資料:', cleanCustomerData)

    // 實際調用 createCustomer
    await createCustomer(cleanCustomerData)
    showAddCustomerModal.value = false
    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '新增客戶失敗'
  } finally {
    isLoading.value = false
  }
}

// 編輯客戶
const editCustomer = async () => {
  if (!validateForm() || !editingCustomer.value) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 過濾掉空值，避免約束檢查錯誤
    const cleanCustomerData: Record<string, string | number> = {}

    Object.entries(newCustomerForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanCustomerData[key as string] = value
      }
    })

    console.log('清理後的客戶資料:', cleanCustomerData)

    // 實際調用 updateCustomer
    await updateCustomer(editingCustomer.value.id, cleanCustomerData)
    showEditCustomerModal.value = false
    resetForm()
    editingCustomer.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : '更新客戶失敗'
  } finally {
    isLoading.value = false
  }
}

// 開啟編輯模式
const openEditModal = (customer: Customer) => {
  editingCustomer.value = customer
  newCustomerForm.value = {
    name: customer.name || '',
    phone: customer.phone || '',
    id_number: customer.id_number || '',
    contact_method: customer.contact_method || '',
    contact_method_id: customer.contact_method_id || '',
    contact_method_account: customer.contact_method_account || '',
    contact_method_nickname: customer.contact_method_nickname || '',
    address: customer.address || '',
    pubg_nickname: customer.pubg_nickname || '',
    pubg_account_id: customer.pubg_account_id || '',
    steam_id: customer.steam_id || '',
    nickname: customer.nickname || ''
  }
  showEditCustomerModal.value = true
}

// 開啟詳細資訊模態框
const openDetailModal = (customer: Customer) => {
  detailCustomer.value = customer
  showDetailModal.value = true
}

// 重置表單
const resetForm = () => {
  newCustomerForm.value = {
    name: '',
    phone: '',
    id_number: '',
    contact_method: '',
    contact_method_id: '',
    contact_method_account: '',
    contact_method_nickname: '',
    address: '',
    pubg_nickname: '',
    pubg_account_id: '',
    steam_id: '',
    nickname: ''
  }
  formErrors.value = {}
}

// 聯絡方式選項
const contactMethods = [
  { value: 'Discord', label: 'Discord' },
  { value: 'LINE', label: 'LINE' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' }
]

// 載入資料
onMounted(async () => {
  try {
    console.log('開始載入客戶管理資料...')
    await fetchCustomers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '載入資料失敗'
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-amber-900 dark:text-amber-100">客戶管理</h1>
        <p class="text-amber-600 dark:text-amber-400">管理所有客戶資料</p>
      </div>
      <button @click="showAddCustomerModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
        <i class="bi bi-plus-lg mr-2"></i>
        新增客戶
      </button>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-exclamation-triangle text-red-600 dark:text-red-400 mr-2"></i>
        <span class="text-red-800 dark:text-red-200">{{ error }}</span>
      </div>
    </div>

    <!-- 載入狀態指示器 -->
    <div v-if="customersLoading"
         class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-arrow-clockwise text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
        <span class="text-blue-800 dark:text-blue-200">正在載入資料...</span>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
            <i class="bi bi-people text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">總客戶數</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ totalCustomers }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜尋 -->
    <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
      <div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜尋客戶(姓名、暱稱、電話、遊戲暱稱、ID)..."
          class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
        />
      </div>

      <!-- 搜尋結果統計 -->
      <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-800 rounded-lg">
        <div class="flex items-center justify-between text-sm">
          <span class="text-amber-600 dark:text-amber-400">
            搜尋結果：{{ filteredCustomers.length }} 位客戶
            <span v-if="searchQuery" class="text-blue-600 dark:text-blue-400">
              (已篩選)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 客戶列表 -->
    <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700">
      <div class="p-6 border-b border-amber-200 dark:border-amber-700">
        <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">客戶列表</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-amber-200 dark:divide-amber-700">
          <thead class="bg-amber-50 dark:bg-amber-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                客戶資訊
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                聯絡方式
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                遊戲資訊
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                建立時間
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-amber-900 dark:text-amber-100 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-amber-900 divide-y divide-amber-200 dark:divide-amber-700">
            <tr v-if="customersLoading" class="hover:bg-amber-50 dark:hover:bg-amber-800">
              <td class="px-6 py-10 text-center text-sm text-amber-600 dark:text-amber-400" colspan="5">
                <i class="bi bi-arrow-clockwise text-2xl animate-spin"></i>
                <p class="mt-2">載入中...</p>
              </td>
            </tr>
            <tr v-else-if="filteredCustomers.length === 0" class="hover:bg-amber-50 dark:hover:bg-amber-800">
              <td class="px-6 py-10 text-center text-sm text-amber-600 dark:text-amber-400" colspan="5">
                <i class="bi bi-people text-2xl"></i>
                <p class="mt-2">沒有找到符合條件的客戶</p>
              </td>
            </tr>
            <tr v-for="customer in paginatedCustomers" :key="customer.id" class="hover:bg-amber-50 dark:hover:bg-amber-800">
              <!-- 客戶資訊 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {{ customer.name || customer.nickname || '未命名' }}
                    <span v-if="customer.name && customer.nickname" class="text-amber-600 dark:text-amber-400">
                      ({{ customer.nickname }})
                    </span>
                  </div>
                  <div class="text-sm text-amber-600 dark:text-amber-400">
                    {{ customer.phone || '未設定電話' }}
                  </div>
                  <div class="text-xs text-amber-500 dark:text-amber-400">
                    {{ customer.address || '未設定地址' }}
                  </div>
                  <div class="text-xs text-amber-500 dark:text-amber-400 font-mono">
                    ID: {{ customer.id.slice(0, 8) }}...
                  </div>
                </div>
              </td>

              <!-- 聯絡方式 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-amber-900 dark:text-amber-100">
                    {{ customer.contact_method || '未設定' }}
                  </div>
                  <div class="text-sm text-amber-600 dark:text-amber-400">
                    {{ customer.contact_method_nickname || customer.contact_method_account || '未設定' }}
                  </div>
                  <div v-if="customer.contact_method_id" class="text-xs text-amber-500 dark:text-amber-400">
                    ID: {{ customer.contact_method_id }}
                  </div>
                </div>
              </td>

              <!-- 遊戲資訊 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-amber-900 dark:text-amber-100">
                    PUBG: {{ customer.pubg_nickname || '未設定' }}
                  </div>
                  <div v-if="customer.pubg_account_id" class="text-xs text-amber-500 dark:text-amber-400">
                    PUBG ID: {{ customer.pubg_account_id }}
                  </div>
                  <div v-if="customer.steam_id" class="text-xs text-amber-500 dark:text-amber-400">
                    Steam: {{ customer.steam_id }}
                  </div>
                </div>
              </td>

              <!-- 建立時間 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-amber-900 dark:text-amber-100">
                    {{ new Date(customer.created_at).toLocaleDateString('zh-TW') }}
                  </div>
                  <div class="text-xs text-amber-500 dark:text-amber-400">
                    {{ new Date(customer.created_at).toLocaleTimeString('zh-TW') }}
                  </div>
                  <div class="text-xs text-amber-500 dark:text-amber-400">
                    更新: {{ new Date(customer.updated_at).toLocaleDateString('zh-TW') }}
                  </div>
                </div>
              </td>

              <!-- 操作按鈕 -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-4">
                  <button @click="openDetailModal(customer)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="查看詳細">
                    <i class="bi bi-eye text-xl"></i>
                  </button>
                  <button @click="openEditModal(customer)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="編輯">
                    <i class="bi bi-pencil text-xl"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-amber-200 dark:border-amber-700">
        <div class="flex justify-center">
          <nav class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-800"
            >
              上一頁
            </button>
            <span class="px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-800"
            >
              下一頁
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- 新增客戶模態框 -->
    <div v-if="showAddCustomerModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center py-4">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-person-plus text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              新增客戶
            </h3>
          </div>
          <button @click="showAddCustomerModal = false" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- 顧客資料 -->
        <div class="p-4">
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-person-circle text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">顧客資料</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶姓名</label>
                <input
                  v-model="newCustomerForm.name"
                  type="text"
                  placeholder="請輸入客戶姓名"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.name" class="text-red-500 text-sm mt-1">{{ formErrors.name }}</p>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶暱稱</label>
                <input
                  v-model="newCustomerForm.nickname"
                  type="text"
                  placeholder="請輸入客戶暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客身份證字號</label>
                <input
                  v-model="newCustomerForm.id_number"
                  type="text"
                  placeholder="A123456789"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.id_number" class="text-red-500 text-sm mt-1">{{ formErrors.id_number }}</p>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客連絡電話</label>
                <input
                  v-model="newCustomerForm.phone"
                  type="tel"
                  placeholder="0912345678 或 +886912345678"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.phone" class="text-red-500 text-sm mt-1">{{ formErrors.phone }}</p>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客地址</label>
                <input
                  v-model="newCustomerForm.address"
                  type="text"
                  placeholder="請輸入客戶地址"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客聯絡方式</label>
                <select
                  v-model="newCustomerForm.contact_method"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                >
                  <option value="">請選擇聯絡方式</option>
                  <option v-for="method in contactMethods" :key="method.value" :value="method.value">
                    {{ method.label }}
                  </option>
                </select>
                <p v-if="formErrors.contact_method" class="text-red-500 text-sm mt-1">{{ formErrors.contact_method }}</p>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式 ID</label>
                <input
                  v-model="newCustomerForm.contact_method_id"
                  type="text"
                  placeholder="請輸入聯絡方式ID"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式帳號</label>
                <input
                  v-model="newCustomerForm.contact_method_account"
                  type="text"
                  placeholder="請輸入聯絡方式帳號"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式暱稱</label>
                <input
                  v-model="newCustomerForm.contact_method_nickname"
                  type="text"
                  placeholder="請輸入聯絡方式暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Nickname</label>
                <input
                  v-model="newCustomerForm.pubg_nickname"
                  type="text"
                  placeholder="請輸入PUBG暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Account ID</label>
                <input
                  v-model="newCustomerForm.pubg_account_id"
                  type="text"
                  placeholder="請輸入PUBG帳號ID"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Steam ID</label>
                <input
                  v-model="newCustomerForm.steam_id"
                  type="text"
                  placeholder="76561198123456789"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.steam_id" class="text-red-500 text-sm mt-1">{{ formErrors.steam_id }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="showAddCustomerModal = false" type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            取消
          </button>
          <button @click="addCustomer" type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            確認新增
          </button>
        </div>
      </div>
    </div>

    <!-- 編輯客戶模態框 -->
    <div v-if="showEditCustomerModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center py-4">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-pencil text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              編輯客戶
            </h3>
          </div>
          <button @click="showEditCustomerModal = false" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- 顧客資料 -->
        <div class="p-4">
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-person-circle text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">顧客資料</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶姓名</label>
                <input
                  v-model="newCustomerForm.name"
                  type="text"
                  placeholder="請輸入客戶姓名"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.name" class="text-red-500 text-sm mt-1">{{ formErrors.name }}</p>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶暱稱</label>
                <input
                  v-model="newCustomerForm.nickname"
                  type="text"
                  placeholder="請輸入客戶暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客身份證字號</label>
                <input
                  v-model="newCustomerForm.id_number"
                  type="text"
                  placeholder="A123456789"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.id_number" class="text-red-500 text-sm mt-1">{{ formErrors.id_number }}</p>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客連絡電話</label>
                <input
                  v-model="newCustomerForm.phone"
                  type="tel"
                  placeholder="0912345678 或 +886912345678"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.phone" class="text-red-500 text-sm mt-1">{{ formErrors.phone }}</p>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客地址</label>
                <input
                  v-model="newCustomerForm.address"
                  type="text"
                  placeholder="請輸入客戶地址"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">顧客聯絡方式</label>
                <select
                  v-model="newCustomerForm.contact_method"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                >
                  <option value="">請選擇聯絡方式</option>
                  <option v-for="method in contactMethods" :key="method.value" :value="method.value">
                    {{ method.label }}
                  </option>
                </select>
                <p v-if="formErrors.contact_method" class="text-red-500 text-sm mt-1">{{ formErrors.contact_method }}</p>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式 ID</label>
                <input
                  v-model="newCustomerForm.contact_method_id"
                  type="text"
                  placeholder="請輸入聯絡方式ID"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式帳號</label>
                <input
                  v-model="newCustomerForm.contact_method_account"
                  type="text"
                  placeholder="請輸入聯絡方式帳號"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式暱稱</label>
                <input
                  v-model="newCustomerForm.contact_method_nickname"
                  type="text"
                  placeholder="請輸入聯絡方式暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Nickname</label>
                <input
                  v-model="newCustomerForm.pubg_nickname"
                  type="text"
                  placeholder="請輸入PUBG暱稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Account ID</label>
                <input
                  v-model="newCustomerForm.pubg_account_id"
                  type="text"
                  placeholder="請輸入PUBG帳號ID"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Steam ID</label>
                <input
                  v-model="newCustomerForm.steam_id"
                  type="text"
                  placeholder="76561198123456789"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none rounded-lg transition-all duration-200"
                />
                <p v-if="formErrors.steam_id" class="text-red-500 text-sm mt-1">{{ formErrors.steam_id }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="showEditCustomerModal = false" type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200">
            取消
          </button>
          <button @click="editCustomer" type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200">
            確認更新
          </button>
        </div>
      </div>
    </div>

    <!-- 詳細資訊模態框 -->
    <div v-if="showDetailModal && detailCustomer" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center py-4">
      <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-eye text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              客戶詳細資訊
            </h3>
          </div>
          <button @click="showDetailModal = false" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- 詳細資訊內容 -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 基本資訊 -->
            <div class="space-y-4">
              <div class="flex items-center mb-4">
                <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <i class="bi bi-person-circle text-white text-xs"></i>
                </div>
                <h4 class="text-base font-semibold text-gray-800">基本資訊</h4>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">客戶姓名</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.name || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">客戶暱稱</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.nickname || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">身份證字號</label>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailCustomer.id_number || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">電話</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.phone || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">地址</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.address || '未設定' }}</p>
                </div>
              </div>
            </div>

            <!-- 聯絡方式 -->
            <div class="space-y-4">
              <div class="flex items-center mb-4">
                <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <i class="bi bi-chat-dots text-white text-xs"></i>
                </div>
                <h4 class="text-base font-semibold text-gray-800">聯絡方式</h4>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">聯絡方式</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.contact_method || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">聯絡方式 ID</label>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailCustomer.contact_method_id || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">聯絡方式帳號</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.contact_method_account || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">聯絡方式暱稱</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.contact_method_nickname || '未設定' }}</p>
                </div>
              </div>
            </div>

            <!-- 遊戲資訊 -->
            <div class="space-y-4">
              <div class="flex items-center mb-4">
                <div class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                  <i class="bi bi-controller text-white text-xs"></i>
                </div>
                <h4 class="text-base font-semibold text-gray-800">遊戲資訊</h4>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">PUBG 暱稱</label>
                  <p class="text-sm text-gray-900 mt-1">{{ detailCustomer.pubg_nickname || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">PUBG 帳號 ID</label>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailCustomer.pubg_account_id || '未設定' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Steam ID</label>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailCustomer.steam_id || '未設定' }}</p>
                </div>
              </div>
            </div>

            <!-- 系統資訊 -->
            <div class="space-y-4">
              <div class="flex items-center mb-4">
                <div class="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center mr-2">
                  <i class="bi bi-info-circle text-white text-xs"></i>
                </div>
                <h4 class="text-base font-semibold text-gray-800">系統資訊</h4>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-gray-700">客戶 ID</label>
                  <p class="text-sm text-gray-900 mt-1 font-mono">{{ detailCustomer.id }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">建立時間</label>
                  <p class="text-sm text-gray-900 mt-1">{{ new Date(detailCustomer.created_at).toLocaleString('zh-TW') }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">更新時間</label>
                  <p class="text-sm text-gray-900 mt-1">{{ new Date(detailCustomer.updated_at).toLocaleString('zh-TW') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="showDetailModal = false" type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
            關閉
          </button>
          <button @click="openEditModal(detailCustomer)" type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
            編輯客戶
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
