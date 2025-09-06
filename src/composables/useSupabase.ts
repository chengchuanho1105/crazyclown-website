import { ref, computed, onMounted } from 'vue'
import {
  InventoryService,
  TransactionService,
  CustomerService,
  ProductService,
  ProductCategoryService,
  PaymentMethodService,
  OurBankDataService,
  StatisticsService,
  type ApiResponse
} from '@/services/supabaseService'
import type {
  InventoryItem,
  Transaction,
  Customer,
  Product,
  ProductCategory,
  PaymentMethod,
  OurBankData,
  InventoryItemWithDetails
} from '@/config/supabase'

// 全域狀態管理
const inventoryItems = ref<InventoryItem[]>([])
const transactions = ref<Transaction[]>([])
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const productCategories = ref<ProductCategory[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const ourBankData = ref<OurBankData[]>([])

// 載入狀態
const loading = ref({
  inventory: false,
  transactions: false,
  customers: false,
  products: false,
  categories: false,
  paymentMethods: false,
  bankData: false
})

// 錯誤狀態
const errors = ref({
  inventory: null as string | null,
  transactions: null as string | null,
  customers: null as string | null,
  products: null as string | null,
  categories: null as string | null,
  paymentMethods: null as string | null,
  bankData: null as string | null
})

// 資料是否已初始化
const initialized = ref({
  inventory: false,
  transactions: false,
  customers: false,
  products: false,
  categories: false,
  paymentMethods: false,
  bankData: false
})

// 庫存管理
export function useInventory() {
  const fetchInventory = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.inventory && inventoryItems.value.length > 0) {
      return inventoryItems.value
    }

    loading.value.inventory = true
    errors.value.inventory = null

    try {
      const response = await InventoryService.getAllInventoryItems()

      if (response.error) {
        errors.value.inventory = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        inventoryItems.value = response.data
        initialized.value.inventory = true
      }

      return inventoryItems.value
    } catch (error) {
      errors.value.inventory = error instanceof Error ? error.message : '載入庫存失敗'
      throw error
    } finally {
      loading.value.inventory = false
    }
  }

  const fetchInventoryWithDetails = async (): Promise<InventoryItemWithDetails[]> => {
    const response = await InventoryService.getInventoryItemsWithDetails()

    if (response.error) {
      throw new Error(response.error.message)
    }

    return response.data || []
  }

  const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await InventoryService.createInventoryItem(item)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 重新載入庫存資料
    await fetchInventory()

    return response.data
  }

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const response = await InventoryService.updateInventoryItem(id, updates)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 更新本地資料
    const index = inventoryItems.value.findIndex(item => item.id === id)
    if (index !== -1 && response.data) {
      inventoryItems.value[index] = response.data
    }

    return response.data
  }

  const deleteInventoryItem = async (id: string) => {
    const response = await InventoryService.deleteInventoryItem(id)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 從本地資料中移除
    inventoryItems.value = inventoryItems.value.filter(item => item.id !== id)

    return response.data
  }

  // 計算屬性
  const availableItems = computed(() =>
    inventoryItems.value.filter(item => item.status === '未售')
  )

  const soldItems = computed(() =>
    inventoryItems.value.filter(item => item.status === '已售')
  )

  const personalItems = computed(() =>
    inventoryItems.value.filter(item => item.status === '自用')
  )

  const welfareItems = computed(() =>
    inventoryItems.value.filter(item => item.status === '福利')
  )

  return {
    inventoryItems: computed(() => inventoryItems.value),
    availableItems,
    soldItems,
    personalItems,
    welfareItems,
    loading: computed(() => loading.value.inventory),
    error: computed(() => errors.value.inventory),
    isInitialized: computed(() => initialized.value.inventory),
    fetchInventory,
    fetchInventoryWithDetails,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
  }
}

// 交易管理
export function useTransactions() {
  const fetchTransactions = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.transactions && transactions.value.length > 0) {
      return transactions.value
    }

    loading.value.transactions = true
    errors.value.transactions = null

    try {
      const response = await TransactionService.getAllTransactions()

      if (response.error) {
        errors.value.transactions = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        transactions.value = response.data
        initialized.value.transactions = true
      }

      return transactions.value
    } catch (error) {
      errors.value.transactions = error instanceof Error ? error.message : '載入交易失敗'
      throw error
    } finally {
      loading.value.transactions = false
    }
  }

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await TransactionService.createTransaction(transaction)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 重新載入交易資料
    await fetchTransactions()

    return response.data
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const response = await TransactionService.updateTransaction(id, updates)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 重新載入交易資料
    await fetchTransactions()

    return response.data
  }

  return {
    transactions: computed(() => transactions.value),
    loading: computed(() => loading.value.transactions),
    error: computed(() => errors.value.transactions),
    isInitialized: computed(() => initialized.value.transactions),
    fetchTransactions,
    createTransaction,
    updateTransaction
  }
}

// 客戶管理
export function useCustomers() {
  const fetchCustomers = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.customers && customers.value.length > 0) {
      return customers.value
    }

    loading.value.customers = true
    errors.value.customers = null

    try {
      const response = await CustomerService.getAllCustomers()

      if (response.error) {
        errors.value.customers = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        customers.value = response.data
        initialized.value.customers = true
      }

      return customers.value
    } catch (error) {
      errors.value.customers = error instanceof Error ? error.message : '載入客戶失敗'
      throw error
    } finally {
      loading.value.customers = false
    }
  }

  const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await CustomerService.createCustomer(customer)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 重新載入客戶資料
    await fetchCustomers()

    return response.data
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const response = await CustomerService.updateCustomer(id, updates)

    if (response.error) {
      throw new Error(response.error.message)
    }

    // 更新本地資料
    const index = customers.value.findIndex(customer => customer.id === id)
    if (index !== -1 && response.data) {
      customers.value[index] = response.data
    }

    return response.data
  }

  return {
    customers: computed(() => customers.value),
    loading: computed(() => loading.value.customers),
    error: computed(() => errors.value.customers),
    isInitialized: computed(() => initialized.value.customers),
    fetchCustomers,
    createCustomer,
    updateCustomer
  }
}

// 商品管理
export function useProducts() {
  const fetchProducts = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.products && products.value.length > 0) {
      return products.value
    }

    loading.value.products = true
    errors.value.products = null

    try {
      const response = await ProductService.getAllProducts()

      if (response.error) {
        errors.value.products = response.error.message
        console.error('商品載入錯誤:', response.error)
        throw new Error(response.error.message)
      } else if (response.data) {
        products.value = response.data
        initialized.value.products = true
      } else {
        console.warn('商品載入回應為空')
      }

      return products.value
    } catch (error) {
      errors.value.products = error instanceof Error ? error.message : '載入商品失敗'
      throw error
    } finally {
      loading.value.products = false
    }
  }

  return {
    products: computed(() => products.value),
    loading: computed(() => loading.value.products),
    error: computed(() => errors.value.products),
    isInitialized: computed(() => initialized.value.products),
    fetchProducts
  }
}

// 商品分類管理
export function useProductCategories() {
  const fetchCategories = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.categories && productCategories.value.length > 0) {
      return productCategories.value
    }

    loading.value.categories = true
    errors.value.categories = null

    try {
      const response = await ProductCategoryService.getAllProductCategories()

      if (response.error) {
        errors.value.categories = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        productCategories.value = response.data
        initialized.value.categories = true
      }

      return productCategories.value
    } catch (error) {
      errors.value.categories = error instanceof Error ? error.message : '載入分類失敗'
      throw error
    } finally {
      loading.value.categories = false
    }
  }

  return {
    productCategories: computed(() => productCategories.value),
    loading: computed(() => loading.value.categories),
    error: computed(() => errors.value.categories),
    isInitialized: computed(() => initialized.value.categories),
    fetchCategories
  }
}

// 付款方式管理
export function usePaymentMethods() {
  const fetchPaymentMethods = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.paymentMethods && paymentMethods.value.length > 0) {
      return paymentMethods.value
    }

    loading.value.paymentMethods = true
    errors.value.paymentMethods = null

    try {
      const response = await PaymentMethodService.getAllPaymentMethods()

      if (response.error) {
        errors.value.paymentMethods = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        paymentMethods.value = response.data
        initialized.value.paymentMethods = true
      }

      return paymentMethods.value
    } catch (error) {
      errors.value.paymentMethods = error instanceof Error ? error.message : '載入付款方式失敗'
      throw error
    } finally {
      loading.value.paymentMethods = false
    }
  }

  return {
    paymentMethods: computed(() => paymentMethods.value),
    loading: computed(() => loading.value.paymentMethods),
    error: computed(() => errors.value.paymentMethods),
    isInitialized: computed(() => initialized.value.paymentMethods),
    fetchPaymentMethods
  }
}

// 銀行資料管理
export function useBankData() {
  const fetchBankData = async () => {
    // 如果已經載入過，直接返回
    if (initialized.value.bankData && ourBankData.value.length > 0) {
      return ourBankData.value
    }

    loading.value.bankData = true
    errors.value.bankData = null

    try {
      const response = await OurBankDataService.getAllBankData()

      if (response.error) {
        errors.value.bankData = response.error.message
        throw new Error(response.error.message)
      } else if (response.data) {
        ourBankData.value = response.data
        initialized.value.bankData = true
      }

      return ourBankData.value
    } catch (error) {
      errors.value.bankData = error instanceof Error ? error.message : '載入銀行資料失敗'
      throw error
    } finally {
      loading.value.bankData = false
    }
  }

  return {
    ourBankData: computed(() => ourBankData.value),
    loading: computed(() => loading.value.bankData),
    error: computed(() => errors.value.bankData),
    isInitialized: computed(() => initialized.value.bankData),
    fetchBankData
  }
}

// 統計資料
export function useStatistics() {
  const inventoryStats = ref({
    total: 0,
    available: 0,
    sold: 0,
    reserved: 0,
    personal: 0,
    welfare: 0,
    stolen: 0,
    refunded: 0,
    compensation: 0
  })

  const revenueStats = ref({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0
  })

  const fetchInventoryStatistics = async () => {
    const response = await StatisticsService.getInventoryStatistics()

    if (response.error) {
      throw new Error(response.error.message)
    }

    if (response.data) {
      inventoryStats.value = response.data
    }
  }

  const fetchRevenueStatistics = async () => {
    const response = await StatisticsService.getRevenueStatistics()

    if (response.error) {
      throw new Error(response.error.message)
    }

    if (response.data) {
      revenueStats.value = response.data
    }
  }

  return {
    inventoryStats: computed(() => inventoryStats.value),
    revenueStats: computed(() => revenueStats.value),
    fetchInventoryStatistics,
    fetchRevenueStatistics
  }
}

// 清除快取資料（用於登出或重新整理）
export function clearSupabaseCache() {
  // 清除資料
  inventoryItems.value = []
  transactions.value = []
  customers.value = []
  products.value = []
  productCategories.value = []
  paymentMethods.value = []
  ourBankData.value = []

  // 重置初始化狀態
  Object.keys(initialized.value).forEach(key => {
    initialized.value[key as keyof typeof initialized.value] = false
  })

  // 清除錯誤狀態
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = null
  })

  // 重置載入狀態
  Object.keys(loading.value).forEach(key => {
    loading.value[key as keyof typeof loading.value] = false
  })
}

// 檢查是否有任何載入中的狀態
export function useSupabaseLoading() {
  const isLoading = computed(() =>
    Object.values(loading.value).some(loading => loading)
  )

  const hasErrors = computed(() =>
    Object.values(errors.value).some(error => error !== null)
  )

  const getErrors = computed(() =>
    Object.entries(errors.value)
      .filter(([_, error]) => error !== null)
      .map(([key, error]) => ({ key, error }))
  )

  return {
    isLoading,
    hasErrors,
    getErrors,
    clearSupabaseCache
  }
}
