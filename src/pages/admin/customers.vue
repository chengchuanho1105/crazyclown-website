<script setup lang="ts">
defineOptions({ name: 'CustomerManagement' })
import { ref, computed, onMounted } from 'vue'
import { useCustomers, useTransactions, useInventory } from '@/composables/useSupabase'
import { supabase } from '@/config/supabase'
import type { Customer, Product, ProductCategory } from '@/config/supabase'

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

  if (!newCustomerForm.value.name) {
    formErrors.value.name = '請輸入客戶姓名'
  }

  if (!newCustomerForm.value.phone) {
    formErrors.value.phone = '請輸入聯絡電話'
  }

  if (!newCustomerForm.value.contact_method) {
    formErrors.value.contact_method = '請選擇聯絡方式'
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
    await createCustomer(newCustomerForm.value)
    showAddCustomerModal.value = false
    resetForm()
  } catch (err) {
    console.error('新增客戶失敗:', err)
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
      console.log('商品資料載入成功:', productsData.data.length, '筆')
      console.log('商品範例:', productsData.data[0])
    } else {
      console.error('商品資料載入失敗:', productsData.error)
    }

    if (categoriesData.data) {
      productCategories.value = categoriesData.data
      console.log('商品分類載入成功:', categoriesData.data.length, '筆')
    } else {
      console.error('商品分類載入失敗:', categoriesData.error)
    }

    console.log('客戶管理資料載入完成')
    console.log('客戶:', customers.value.length)
    console.log('交易記錄:', transactions.value.length)
    console.log('庫存項目:', inventoryItems.value.length)
    console.log('商品:', products.value.length)
    console.log('商品分類:', productCategories.value.length)
  } catch (err) {
    console.error('載入客戶管理資料失敗:', err)
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
    <div v-if="showAddCustomerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-amber-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">新增客戶</h3>
          <button @click="showAddCustomerModal = false" class="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="addCustomer" class="space-y-4">
          <!-- 基本資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">姓名 *</label>
              <input
                v-model="newCustomerForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.name }"
              />
              <p v-if="formErrors.name" class="text-red-500 text-sm mt-1">{{ formErrors.name }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">暱稱</label>
              <input
                v-model="newCustomerForm.nickname"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">電話 *</label>
              <input
                v-model="newCustomerForm.phone"
                type="tel"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.phone }"
              />
              <p v-if="formErrors.phone" class="text-red-500 text-sm mt-1">{{ formErrors.phone }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">身分證號</label>
              <input
                v-model="newCustomerForm.id_number"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>
          </div>

          <!-- 聯絡方式 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">聯絡方式 *</label>
              <select
                v-model="newCustomerForm.contact_method"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.contact_method }"
              >
                <option value="">請選擇聯絡方式</option>
                <option v-for="method in contactMethods" :key="method.value" :value="method.value">
                  {{ method.label }}
                </option>
              </select>
              <p v-if="formErrors.contact_method" class="text-red-500 text-sm mt-1">{{ formErrors.contact_method }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">聯絡帳號</label>
              <input
                v-model="newCustomerForm.contact_method_account"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">聯絡暱稱</label>
              <input
                v-model="newCustomerForm.contact_method_nickname"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">聯絡ID</label>
              <input
                v-model="newCustomerForm.contact_method_id"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>
          </div>

          <!-- 遊戲資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">PUBG 暱稱</label>
              <input
                v-model="newCustomerForm.pubg_nickname"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">PUBG 帳號ID</label>
              <input
                v-model="newCustomerForm.pubg_account_id"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Steam ID</label>
              <input
                v-model="newCustomerForm.steam_id"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>
          </div>

          <!-- 地址 -->
          <div>
            <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">地址</label>
            <textarea
              v-model="newCustomerForm.address"
              rows="3"
              class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
            ></textarea>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showAddCustomerModal = false"
              class="px-4 py-2 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-800"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <i v-if="isLoading" class="bi bi-arrow-clockwise animate-spin mr-2"></i>
              {{ isLoading ? '新增中...' : '新增客戶' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
