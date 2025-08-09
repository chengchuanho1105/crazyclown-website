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

// 庫存管理
export function useInventory() {
  const fetchInventory = async () => {
    loading.value.inventory = true
    errors.value.inventory = null

    const response = await InventoryService.getAllInventoryItems()

    if (response.error) {
      errors.value.inventory = response.error.message
    } else if (response.data) {
      inventoryItems.value = response.data
    }

    loading.value.inventory = false
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
    loading.value.transactions = true
    errors.value.transactions = null

    const response = await TransactionService.getAllTransactions()

    if (response.error) {
      errors.value.transactions = response.error.message
    } else if (response.data) {
      transactions.value = response.data
    }

    loading.value.transactions = false
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

  return {
    transactions: computed(() => transactions.value),
    loading: computed(() => loading.value.transactions),
    error: computed(() => errors.value.transactions),
    fetchTransactions,
    createTransaction
  }
}

// 客戶管理
export function useCustomers() {
  const fetchCustomers = async () => {
    loading.value.customers = true
    errors.value.customers = null

    const response = await CustomerService.getAllCustomers()

    if (response.error) {
      errors.value.customers = response.error.message
    } else if (response.data) {
      customers.value = response.data
    }

    loading.value.customers = false
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

  return {
    customers: computed(() => customers.value),
    loading: computed(() => loading.value.customers),
    error: computed(() => errors.value.customers),
    fetchCustomers,
    createCustomer
  }
}

// 商品管理
export function useProducts() {
  const fetchProducts = async () => {
    loading.value.products = true
    errors.value.products = null

    const response = await ProductService.getAllProducts()

    if (response.error) {
      errors.value.products = response.error.message
    } else if (response.data) {
      products.value = response.data
    }

    loading.value.products = false
  }

  return {
    products: computed(() => products.value),
    loading: computed(() => loading.value.products),
    error: computed(() => errors.value.products),
    fetchProducts
  }
}

// 商品分類管理
export function useProductCategories() {
  const fetchCategories = async () => {
    loading.value.categories = true
    errors.value.categories = null

    const response = await ProductCategoryService.getAllProductCategories()

    if (response.error) {
      errors.value.categories = response.error.message
    } else if (response.data) {
      productCategories.value = response.data
    }

    loading.value.categories = false
  }

  return {
    productCategories: computed(() => productCategories.value),
    loading: computed(() => loading.value.categories),
    error: computed(() => errors.value.categories),
    fetchCategories
  }
}

// 付款方式管理
export function usePaymentMethods() {
  const fetchPaymentMethods = async () => {
    loading.value.paymentMethods = true
    errors.value.paymentMethods = null

    const response = await PaymentMethodService.getAllPaymentMethods()

    if (response.error) {
      errors.value.paymentMethods = response.error.message
    } else if (response.data) {
      paymentMethods.value = response.data
    }

    loading.value.paymentMethods = false
  }

  return {
    paymentMethods: computed(() => paymentMethods.value),
    loading: computed(() => loading.value.paymentMethods),
    error: computed(() => errors.value.paymentMethods),
    fetchPaymentMethods
  }
}

// 銀行資料管理
export function useBankData() {
  const fetchBankData = async () => {
    loading.value.bankData = true
    errors.value.bankData = null

    const response = await OurBankDataService.getAllBankData()

    if (response.error) {
      errors.value.bankData = response.error.message
    } else if (response.data) {
      ourBankData.value = response.data
    }

    loading.value.bankData = false
  }

  return {
    ourBankData: computed(() => ourBankData.value),
    loading: computed(() => loading.value.bankData),
    error: computed(() => errors.value.bankData),
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

// 全域初始化
export function useSupabaseInit() {
  const initializeData = async () => {
    try {
      await Promise.all([
        useInventory().fetchInventory(),
        useTransactions().fetchTransactions(),
        useCustomers().fetchCustomers(),
        useProducts().fetchProducts(),
        useProductCategories().fetchCategories(),
        usePaymentMethods().fetchPaymentMethods(),
        useBankData().fetchBankData()
      ])
    } catch (error) {
      console.error('初始化 Supabase 資料失敗:', error)
    }
  }

  return {
    initializeData
  }
}
