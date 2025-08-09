<script setup lang="ts">
defineOptions({ name: 'TransactionManagement' })
import { ref, computed, onMounted } from 'vue'
import { useTransactions, useCustomers, useInventory, useProducts, usePaymentMethods, useBankData } from '@/composables/useSupabase'
import type { Transaction } from '@/config/supabase'

// 使用 Supabase Composables
const { transactions, loading: transactionsLoading, fetchTransactions, createTransaction } = useTransactions()
const { customers, loading: customersLoading, fetchCustomers } = useCustomers()
const { inventoryItems, loading: inventoryLoading, fetchInventory } = useInventory()
const { products, loading: productsLoading, fetchProducts } = useProducts()
const { paymentMethods, loading: paymentMethodsLoading, fetchPaymentMethods } = usePaymentMethods()
const { ourBankData, loading: bankDataLoading, fetchBankData } = useBankData()

// 搜尋和篩選
const searchQuery = ref('')
const dateFilter = ref('all')
const paymentMethodFilter = ref('all')

// 分頁
const currentPage = ref(1)
const itemsPerPage = 10

// 新增交易表單
const showAddTransactionModal = ref(false)
const newTransactionForm = ref({
  customer_id: '',
  inventory_item_id: '',
  actual_price: 0,
  amount_received: 0,
  amount_difference: 0,
  our_payment_method: '',
  our_bank_data: '',
  customer_payment_method: '',
  customer_bank_code: '',
  customer_bank_account: '',
  customer_account_name: '',
  transactions_time: new Date().toISOString().slice(0, 16)
})

// 表單驗證
const formErrors = ref<Record<string, string>>({})

// 載入狀態
const isLoading = ref(false)
const error = ref<string | null>(null)

// 計算篩選後的交易
const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const customer = customers.value.find(c => c.id === transaction.customer_id)
    const inventoryItem = inventoryItems.value.find(item => item.id === transaction.inventory_item_id)
    const product = products.value.find(p => p.id === inventoryItem?.product_id)

    const matchesSearch =
      customer?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer?.nickname?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer?.phone?.includes(searchQuery.value) ||
      product?.product_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      transaction.customer_account_name?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesPaymentMethod = paymentMethodFilter.value === 'all' || transaction.our_payment_method === paymentMethodFilter.value

    let matchesDate = true
    if (dateFilter.value !== 'all') {
      const transactionDate = new Date(transaction.created_at)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      switch (dateFilter.value) {
        case 'today':
          matchesDate = transactionDate >= today
          break
        case 'yesterday':
          matchesDate = transactionDate >= yesterday && transactionDate < today
          break
        case 'thisWeek':
          matchesDate = transactionDate >= thisWeek
          break
        case 'thisMonth':
          matchesDate = transactionDate >= thisMonth
          break
      }
    }

    return matchesSearch && matchesPaymentMethod && matchesDate
  })
})

// 計算分頁
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))

// 獲取所有付款方式
const allPaymentMethods = computed(() => {
  const methods = [...new Set(transactions.value.map(t => t.our_payment_method).filter(Boolean))]
  return ['all', ...methods]
})

// 計算交易統計
const totalTransactions = computed(() => filteredTransactions.value.length)
const totalRevenue = computed(() => filteredTransactions.value.reduce((sum, t) => sum + (t.amount_received || 0), 0))
const averageTransaction = computed(() => totalTransactions.value > 0 ? totalRevenue.value / totalTransactions.value : 0)

// 獲取交易詳細資訊
const getTransactionDetails = (transaction: Transaction) => {
  const customer = customers.value.find(c => c.id === transaction.customer_id)
  const inventoryItem = inventoryItems.value.find(item => item.id === transaction.inventory_item_id)
  const product = products.value.find(p => p.id === inventoryItem?.product_id)
  const paymentMethod = paymentMethods.value.find(p => p.id === transaction.our_payment_method)
  const bankData = ourBankData.value.find(b => b.id === transaction.our_bank_data)

  return {
    customer,
    inventoryItem,
    product,
    paymentMethod,
    bankData
  }
}

// 驗證表單
const validateForm = () => {
  formErrors.value = {}

  if (!newTransactionForm.value.customer_id) {
    formErrors.value.customer_id = '請選擇客戶'
  }

  if (!newTransactionForm.value.inventory_item_id) {
    formErrors.value.inventory_item_id = '請選擇商品'
  }

  if (newTransactionForm.value.actual_price <= 0) {
    formErrors.value.actual_price = '請輸入實際價格'
  }

  if (newTransactionForm.value.amount_received <= 0) {
    formErrors.value.amount_received = '請輸入實收金額'
  }

  if (!newTransactionForm.value.our_payment_method) {
    formErrors.value.our_payment_method = '請選擇付款方式'
  }

  return Object.keys(formErrors.value).length === 0
}

// 新增交易
const addTransaction = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    await createTransaction(newTransactionForm.value)
    showAddTransactionModal.value = false
    resetForm()
  } catch (err) {
    console.error('新增交易失敗:', err)
    error.value = err instanceof Error ? err.message : '新增交易失敗'
  } finally {
    isLoading.value = false
  }
}

// 重置表單
const resetForm = () => {
  newTransactionForm.value = {
    customer_id: '',
    inventory_item_id: '',
    actual_price: 0,
    amount_received: 0,
    amount_difference: 0,
    our_payment_method: '',
    our_bank_data: '',
    customer_payment_method: '',
    customer_bank_code: '',
    customer_bank_account: '',
    customer_account_name: '',
    transactions_time: new Date().toISOString().slice(0, 16)
  }
  formErrors.value = {}
}

// 可售庫存項目
const availableInventoryItems = computed(() => {
  return inventoryItems.value.filter(item => item.status === '未售').map(item => {
    const product = products.value.find(p => p.id === item.product_id)
    return {
      id: item.id,
      product_name: product?.product_name || '未知商品',
      suggested_price: item.suggested_price,
      cd_key: item.cd_key
    }
  })
})

// 載入資料
onMounted(async () => {
  try {
    console.log('開始載入交易管理資料...')
    await Promise.all([
      fetchTransactions(),
      fetchCustomers(),
      fetchInventory(),
      fetchProducts(),
      fetchPaymentMethods(),
      fetchBankData()
    ])
    console.log('交易管理資料載入完成')
    console.log('交易記錄:', transactions.value.length)
    console.log('客戶:', customers.value.length)
    console.log('庫存項目:', inventoryItems.value.length)
  } catch (err) {
    console.error('載入交易管理資料失敗:', err)
    error.value = err instanceof Error ? err.message : '載入資料失敗'
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-amber-900 dark:text-amber-100">交易管理</h1>
        <p class="text-amber-600 dark:text-amber-400">管理所有交易記錄</p>
      </div>
      <button @click="showAddTransactionModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
        <i class="bi bi-plus-lg mr-2"></i>
        新增交易
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
    <div v-if="transactionsLoading || customersLoading || inventoryLoading || productsLoading || paymentMethodsLoading || bankDataLoading"
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
            <i class="bi bi-cart text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">總交易數</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ totalTransactions }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <i class="bi bi-currency-dollar text-2xl text-green-600 dark:text-green-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">總收入</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">${{ totalRevenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
            <i class="bi bi-graph-up text-2xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">平均交易</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">${{ averageTransaction.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 搜尋 -->
        <div>
          <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">搜尋交易</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋客戶、商品、帳戶名稱..."
            class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
          />
        </div>

        <!-- 日期篩選 -->
        <div>
          <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">日期範圍</label>
          <select
            v-model="dateFilter"
            class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
          >
            <option value="all">全部時間</option>
            <option value="today">今天</option>
            <option value="yesterday">昨天</option>
            <option value="thisWeek">本週</option>
            <option value="thisMonth">本月</option>
          </select>
        </div>

        <!-- 付款方式篩選 -->
        <div>
          <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">付款方式</label>
          <select
            v-model="paymentMethodFilter"
            class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
          >
            <option value="all">全部付款方式</option>
            <option v-for="method in allPaymentMethods.slice(1)" :key="method" :value="method">
              {{ method }}
            </option>
          </select>
        </div>
      </div>

      <!-- 搜尋結果統計 -->
      <div class="mt-4 p-3 bg-amber-50 dark:bg-amber-800 rounded-lg">
        <div class="flex items-center justify-between text-sm">
          <span class="text-amber-600 dark:text-amber-400">
            搜尋結果：{{ filteredTransactions.length }} 筆交易
            <span v-if="searchQuery || dateFilter !== 'all' || paymentMethodFilter !== 'all'" class="text-blue-600 dark:text-blue-400">
              (已篩選)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- 交易列表 -->
    <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700">
      <div class="p-6 border-b border-amber-200 dark:border-amber-700">
        <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">交易列表</h3>
      </div>
      <div class="p-6">
        <div v-if="transactionsLoading" class="text-center py-8">
          <i class="bi bi-arrow-clockwise text-2xl text-amber-600 dark:text-amber-400 animate-spin"></i>
          <p class="mt-2 text-amber-600 dark:text-amber-400">載入中...</p>
        </div>
        <div v-else-if="filteredTransactions.length === 0" class="text-center py-8">
          <i class="bi bi-cart text-2xl text-amber-600 dark:text-amber-400"></i>
          <p class="mt-2 text-amber-600 dark:text-amber-400">沒有找到符合條件的交易記錄</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="p-4 bg-amber-50 dark:bg-amber-800 rounded-lg border border-amber-200 dark:border-amber-700"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- 交易資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">交易資訊</p>
                  <p class="text-amber-600 dark:text-amber-400">ID: {{ transaction.id.slice(0, 8) }}...</p>
                  <p class="text-amber-600 dark:text-amber-400">
                    時間: {{ new Date(transaction.created_at).toLocaleString('zh-TW') }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    實收: ${{ transaction.amount_received?.toLocaleString() || '0' }}
                  </p>
                </div>
              </div>

              <!-- 客戶資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">客戶資訊</p>
                  <p class="text-amber-600 dark:text-amber-400">
                    {{ getTransactionDetails(transaction).customer?.name || getTransactionDetails(transaction).customer?.nickname || '未知客戶' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    {{ getTransactionDetails(transaction).customer?.phone || '未設定電話' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    {{ getTransactionDetails(transaction).customer?.contact_method || '未設定聯絡方式' }}
                  </p>
                </div>
              </div>

              <!-- 商品資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">商品資訊</p>
                  <p class="text-amber-600 dark:text-amber-400">
                    {{ getTransactionDetails(transaction).product?.product_name || '未知商品' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    建議價格: ${{ getTransactionDetails(transaction).inventoryItem?.suggested_price?.toLocaleString() || '0' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    實際價格: ${{ transaction.actual_price?.toLocaleString() || '0' }}
                  </p>
                </div>
              </div>

              <!-- 付款資訊 -->
              <div>
                <div class="text-sm">
                  <p class="text-amber-900 dark:text-amber-100 font-medium">付款資訊</p>
                  <p class="text-amber-600 dark:text-amber-400">
                    付款方式: {{ transaction.our_payment_method || '未設定' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    客戶帳戶: {{ transaction.customer_account_name || '未設定' }}
                  </p>
                  <p class="text-amber-600 dark:text-amber-400">
                    差額: ${{ transaction.amount_difference?.toLocaleString() || '0' }}
                  </p>
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

    <!-- 新增交易模態框 -->
    <div v-if="showAddTransactionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-amber-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">新增交易</h3>
          <button @click="showAddTransactionModal = false" class="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200">
            <i class="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="addTransaction" class="space-y-4">
          <!-- 客戶和商品選擇 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">客戶 *</label>
              <select
                v-model="newTransactionForm.customer_id"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.customer_id }"
              >
                <option value="">請選擇客戶</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name || customer.nickname || '未命名' }} - {{ customer.phone || '無電話' }}
                </option>
              </select>
              <p v-if="formErrors.customer_id" class="text-red-500 text-sm mt-1">{{ formErrors.customer_id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">商品 *</label>
              <select
                v-model="newTransactionForm.inventory_item_id"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.inventory_item_id }"
              >
                <option value="">請選擇商品</option>
                <option v-for="item in availableInventoryItems" :key="item.id" :value="item.id">
                  {{ item.product_name }} - ${{ item.suggested_price?.toLocaleString() || '0' }}
                </option>
              </select>
              <p v-if="formErrors.inventory_item_id" class="text-red-500 text-sm mt-1">{{ formErrors.inventory_item_id }}</p>
            </div>
          </div>

          <!-- 價格資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">實際價格 *</label>
              <input
                v-model.number="newTransactionForm.actual_price"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.actual_price }"
              />
              <p v-if="formErrors.actual_price" class="text-red-500 text-sm mt-1">{{ formErrors.actual_price }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">實收金額 *</label>
              <input
                v-model.number="newTransactionForm.amount_received"
                type="number"
                min="0"
                step="0.01"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.amount_received }"
              />
              <p v-if="formErrors.amount_received" class="text-red-500 text-sm mt-1">{{ formErrors.amount_received }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">差額</label>
              <input
                :value="newTransactionForm.amount_received - newTransactionForm.actual_price"
                type="number"
                readonly
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg bg-gray-100 dark:bg-amber-700 text-amber-900 dark:text-amber-100"
              />
            </div>
          </div>

          <!-- 付款方式 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">我們的付款方式 *</label>
              <select
                v-model="newTransactionForm.our_payment_method"
                required
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
                :class="{ 'border-red-500': formErrors.our_payment_method }"
              >
                <option value="">請選擇付款方式</option>
                <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                  {{ method.payment_method }}
                </option>
              </select>
              <p v-if="formErrors.our_payment_method" class="text-red-500 text-sm mt-1">{{ formErrors.our_payment_method }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">我們的銀行帳戶</label>
              <select
                v-model="newTransactionForm.our_bank_data"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              >
                <option value="">請選擇銀行帳戶</option>
                <option v-for="bank in ourBankData" :key="bank.id" :value="bank.id">
                  {{ bank.bank_name }} - {{ bank.account_holder }}
                </option>
              </select>
            </div>
          </div>

          <!-- 客戶付款資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">客戶付款方式</label>
              <input
                v-model="newTransactionForm.customer_payment_method"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">客戶帳戶名稱</label>
              <input
                v-model="newTransactionForm.customer_account_name"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">客戶銀行代碼</label>
              <input
                v-model="newTransactionForm.customer_bank_code"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">客戶銀行帳號</label>
              <input
                v-model="newTransactionForm.customer_bank_account"
                type="text"
                class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
              />
            </div>
          </div>

          <!-- 交易時間 -->
          <div>
            <label class="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">交易時間</label>
            <input
              v-model="newTransactionForm.transactions_time"
              type="datetime-local"
              class="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-amber-800 text-amber-900 dark:text-amber-100"
            />
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showAddTransactionModal = false"
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
              {{ isLoading ? '新增中...' : '新增交易' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
