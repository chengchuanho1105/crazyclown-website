<script setup lang="ts">
defineOptions({ name: 'CustomerManagement' })
import { ref, computed, onMounted } from 'vue'
import { useCustomers, useTransactions, useInventory } from '@/composables/useSupabase'
import { supabase } from '@/config/supabase'
import type { Product, ProductCategory } from '@/config/supabase'


// 使用 Supabase Composables
const { customers, loading: customersLoading, fetchCustomers, createCustomer } = useCustomers()
const { transactions, loading: transactionsLoading, fetchTransactions } = useTransactions()
const { inventoryItems, loading: inventoryLoading, fetchInventory } = useInventory()

// 商品資料
const products = ref<Product[]>([])
const productCategories = ref<ProductCategory[]>([])

// 搜尋和篩選
const searchQuery = ref('')
const contactMethodFilter = ref('all')

// 分頁
const currentPage = ref(1)
const itemsPerPage = 10

// 新增客戶表單
const showAddCustomerModal = ref(false)
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
const formErrors = ref<Record<string, string>>({})

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

    const matchesContactMethod = contactMethodFilter.value === 'all' || customer.contact_method === contactMethodFilter.value

    return matchesSearch && matchesContactMethod
  })
})

// 計算分頁
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCustomers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage))

// 獲取所有聯絡方式
const allContactMethods = computed(() => {
  const methods = [...new Set(customers.value.map(customer => customer.contact_method).filter(Boolean))]
  return ['all', ...methods]
})

// 計算客戶統計
const totalCustomers = computed(() => filteredCustomers.value.length)
const activeCustomers = computed(() => {
  // 有交易記錄的客戶
  const customerIdsWithTransactions = new Set(transactions.value.map(t => t.customer_id).filter(Boolean))
  return customers.value.filter(c => customerIdsWithTransactions.has(c.id)).length
})

// 獲取客戶的交易記錄
const getCustomerTransactions = (customerId: string) => {
  return transactions.value.filter(t => t.customer_id === customerId)
}

// 獲取客戶的購買商品
const getCustomerPurchases = (customerId: string) => {
  const customerTransactions = getCustomerTransactions(customerId)
  return customerTransactions.map(t => {
    const inventoryItem = inventoryItems.value.find(item => item.id === t.inventory_item_id)
    const product = products.value.find(p => p.id === inventoryItem?.product_id)
    return {
      transaction: t,
      inventoryItem,
      product
    }
  })
}

// 驗證表單
const validateForm = () => {
  formErrors.value = {}

  // 檢查電話格式，如果不是 +886 開頭，自動加上
  if (newCustomerForm.value.phone && !newCustomerForm.value.phone.startsWith('+886')) {
    if (newCustomerForm.value.phone.startsWith('0')) {
      newCustomerForm.value.phone = '+886' + newCustomerForm.value.phone.substring(1)
    } else {
      newCustomerForm.value.phone = '+886' + newCustomerForm.value.phone
    }
  }

  // 檢查身分證號格式
  if (newCustomerForm.value.id_number && !newCustomerForm.value.id_number.match(/^[A-Z]\d{8}$/)) {
    formErrors.value.id_number = '身分證號格式錯誤，應為一個英文字母後接8位數字'
  }

  // 檢查 Steam ID 格式
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
    showAddCustomerModal.value = false
    resetForm()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '新增客戶失敗'
  } finally {
    isLoading.value = false
  }
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
    await Promise.all([
      fetchCustomers(),
      fetchTransactions(),
      fetchInventory()
    ])

    // 載入商品和分類資料
    const [productsData, categoriesData] = await Promise.all([
      supabase.from('product').select('*'),
      supabase.from('product_category').select('*')
    ])

    if (productsData.data) {
      products.value = productsData.data
    }

    if (categoriesData.data) {
      productCategories.value = categoriesData.data
    }

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
    <div v-if="customersLoading || transactionsLoading || inventoryLoading"
         class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-arrow-clockwise text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
        <span class="text-blue-800 dark:text-blue-200">正在載入資料...</span>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <i class="bi bi-person-check text-2xl text-green-600 dark:text-green-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">活躍客戶</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ activeCustomers }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
            <i class="bi bi-cart text-2xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">總交易數</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ transactions.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 搜尋 -->
        <div>
          <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">搜尋客戶</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋姓名、暱稱、電話、遊戲暱稱..."
            class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
          />
        </div>

        <!-- 聯絡方式篩選 -->
        <div>
          <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">聯絡方式</label>
          <select
            v-model="contactMethodFilter"
            class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
          >
            <option value="all">全部聯絡方式</option>
            <option v-for="method in allContactMethods.slice(1)" :key="method" :value="method">
              {{ method }}
            </option>
          </select>
        </div>
      </div>

      <!-- 搜尋結果統計 -->
      <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-800 rounded-lg">
        <div class="flex items-center justify-between text-sm">
          <span class="text-amber-600 dark:text-amber-400">
            搜尋結果：{{ filteredCustomers.length }} 位客戶
            <span v-if="searchQuery || contactMethodFilter !== 'all'" class="text-blue-600 dark:text-blue-400">
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
      <div class="p-6">
        <div v-if="customersLoading" class="text-center py-8">
          <i class="bi bi-arrow-clockwise text-2xl text-amber-600 dark:text-amber-400 animate-spin"></i>
          <p class="mt-2 text-amber-600 dark:text-amber-400">載入中...</p>
        </div>
        <div v-else-if="filteredCustomers.length === 0" class="text-center py-8">
          <i class="bi bi-people text-2xl text-amber-600 dark:text-amber-400"></i>
          <p class="mt-2 text-amber-600 dark:text-amber-400">沒有找到符合條件的客戶</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="customer in paginatedCustomers"
            :key="customer.id"
            class="p-4 bg-amber-50 dark:bg-amber-800 rounded-lg border border-amber-200 dark:border-amber-700"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 基本資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">
                    {{ customer.name || customer.nickname || '未命名' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">ID: {{ customer.id.slice(0, 8) }}...</p>
                  <p class="text-amber-600 dark:text-amber-400">電話: {{ customer.phone || '未設定' }}</p>
                </div>
              </div>

              <!-- 聯絡方式 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">聯絡方式</p>
                  <p class="text-amber-600 dark:text-amber-400">{{ customer.contact_method || '未設定' }}</p>
                  <p class="text-amber-600 dark:text-amber-400">{{ customer.contact_method_account || '未設定' }}</p>
                  <p class="text-amber-600 dark:text-amber-400">{{ customer.contact_method_nickname || '未設定' }}</p>
                </div>
              </div>

              <!-- 遊戲資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">遊戲資訊</p>
                  <p class="text-amber-600 dark:text-amber-400">PUBG: {{ customer.pubg_nickname || '未設定' }}</p>
                  <p class="text-amber-600 dark:text-amber-400">Steam: {{ customer.steam_id || '未設定' }}</p>
                </div>
              </div>

              <!-- 交易統計 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">交易統計</p>
                  <p class="text-amber-600 dark:text-amber-400">
                    交易數: {{ getCustomerTransactions(customer.id).length }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    總金額: ${{ getCustomerTransactions(customer.id).reduce((sum, t) => sum + (t.amount_received || 0), 0).toLocaleString() }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 購買記錄 -->
            <div v-if="getCustomerPurchases(customer.id).length > 0" class="mt-4 pt-4 border-t border-amber-200 dark:border-amber-700">
              <h4 class="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">購買記錄</h4>
              <div class="space-y-2">
                <div
                  v-for="purchase in getCustomerPurchases(customer.id)"
                  :key="purchase.transaction.id"
                  class="text-xs bg-white dark:bg-amber-700 p-2 rounded"
                >
                  <div class="flex justify-between">
                    <span class="text-amber-600 dark:text-amber-400">
                      {{ purchase.product?.product_name || purchase.inventoryItem?.product_id || '未知商品' }}
                    </span>
                    <span class="text-amber-900 dark:text-amber-100 font-medium">
                      ${{ purchase.transaction.amount_received?.toLocaleString() || '0' }}
                    </span>
                  </div>
                  <div class="text-amber-500 dark:text-amber-400">
                    {{ new Date(purchase.transaction.created_at).toLocaleDateString('zh-TW') }}
                  </div>
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
  </div>
</template>
