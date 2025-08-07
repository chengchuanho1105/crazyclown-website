import { ref, computed, type Ref } from 'vue'
import { supabaseServices, type SupabaseResponse } from '@/services/supabaseService'
import type { PostgrestError } from '@supabase/supabase-js'

// 通用狀態管理
interface UseSupabaseState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<PostgrestError | null>
}

// 創建響應式狀態
function createState<T>(): UseSupabaseState<T> {
  return {
    data: ref(null) as Ref<T | null>,
    loading: ref(false),
    error: ref(null) as Ref<PostgrestError | null>
  }
}

// 通用 Supabase composable
export function useSupabase<T>() {
  const state = createState<T>()

  // 設置資料
  const setData = (data: T | null) => {
    state.data.value = data
  }

  // 設置錯誤
  const setError = (error: PostgrestError | null) => {
    state.error.value = error
  }

  // 設置載入狀態
  const setLoading = (loading: boolean) => {
    state.loading.value = loading
  }

  // 處理 Supabase 響應
  const handleResponse = (response: SupabaseResponse<T>) => {
    if (response.error) {
      setError(response.error)
      setData(null)
    } else {
      setData(response.data)
      setError(null)
    }
  }

  // 執行異步操作
  const execute = async (operation: () => Promise<SupabaseResponse<T>>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await operation()
      handleResponse(response)
    } catch (error) {
      setError(error as PostgrestError)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    ...state,
    setData,
    setError,
    setLoading,
    execute
  }
}

// 交易相關 composable
export function useTransactions() {
  const { data: transactions, loading, error, execute } = useSupabase<any[]>()

  // 獲取所有交易
  const fetchTransactions = () => {
    return execute(() => supabaseServices.transactions.getAll())
  }

  // 獲取交易統計
  const fetchTransactionStats = () => {
    return execute(() => supabaseServices.transactions.getTransactionStats())
  }

  // 獲取月營收
  const fetchMonthlyRevenue = (year: number, month: number) => {
    return execute(() => supabaseServices.transactions.getMonthlyRevenue(year, month))
  }

  // 創建交易
  const createTransaction = (transactionData: any) => {
    return execute(() => supabaseServices.transactions.create(transactionData))
  }

  // 更新交易
  const updateTransaction = (id: string, data: any) => {
    return execute(() => supabaseServices.transactions.update(id, data))
  }

  // 刪除交易
  const deleteTransaction = (id: string) => {
    return execute(() => supabaseServices.transactions.delete(id))
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    fetchTransactionStats,
    fetchMonthlyRevenue,
    createTransaction,
    updateTransaction,
    deleteTransaction
  }
}

// 客戶相關 composable
export function useCustomers() {
  const { data: customers, loading, error, execute } = useSupabase<any[]>()

  // 獲取所有客戶
  const fetchCustomers = () => {
    return execute(() => supabaseServices.customers.getAll())
  }

  // 根據 ID 獲取客戶
  const fetchCustomerById = (id: string) => {
    return execute(() => supabaseServices.customers.getById(id))
  }

  // 根據電子郵件查找客戶
  const fetchCustomerByEmail = (email: string) => {
    return execute(() => supabaseServices.customers.getByEmail(email))
  }

  // 創建客戶
  const createCustomer = (customerData: any) => {
    return execute(() => supabaseServices.customers.create(customerData))
  }

  // 更新客戶
  const updateCustomer = (id: string, data: any) => {
    return execute(() => supabaseServices.customers.update(id, data))
  }

  // 刪除客戶
  const deleteCustomer = (id: string) => {
    return execute(() => supabaseServices.customers.delete(id))
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchCustomerById,
    fetchCustomerByEmail,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}

// 商品相關 composable
export function useProducts() {
  const { data: products, loading, error, execute } = useSupabase<any[]>()

  // 獲取所有商品
  const fetchProducts = () => {
    return execute(() => supabaseServices.products.getAll())
  }

  // 根據類別獲取商品
  const fetchProductsByCategory = (categoryId: string) => {
    return execute(() => supabaseServices.products.getByCategory(categoryId))
  }

  // 創建商品
  const createProduct = (productData: any) => {
    return execute(() => supabaseServices.products.create(productData))
  }

  // 更新商品
  const updateProduct = (id: string, data: any) => {
    return execute(() => supabaseServices.products.update(id, data))
  }

  // 更新庫存
  const updateProductStock = (id: string, quantity: number) => {
    return execute(() => supabaseServices.products.updateStock(id, quantity))
  }

  // 刪除商品
  const deleteProduct = (id: string) => {
    return execute(() => supabaseServices.products.delete(id))
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    createProduct,
    updateProduct,
    updateProductStock,
    deleteProduct
  }
}

// 預訂相關 composable
export function useReservations() {
  const { data: reservations, loading, error, execute } = useSupabase<any[]>()

  // 獲取所有預訂
  const fetchReservations = () => {
    return execute(() => supabaseServices.reservations.getAll())
  }

  // 根據日期獲取預訂
  const fetchReservationsByDate = (date: string) => {
    return execute(() => supabaseServices.reservations.getByDate(date))
  }

  // 根據日期範圍獲取預訂
  const fetchReservationsByDateRange = (startDate: string, endDate: string) => {
    return execute(() => supabaseServices.reservations.getByDateRange(startDate, endDate))
  }

  // 創建預訂
  const createReservation = (reservationData: any) => {
    return execute(() => supabaseServices.reservations.create(reservationData))
  }

  // 更新預訂
  const updateReservation = (id: string, data: any) => {
    return execute(() => supabaseServices.reservations.update(id, data))
  }

  // 更新預訂狀態
  const updateReservationStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    return execute(() => supabaseServices.reservations.updateStatus(id, status))
  }

  // 刪除預訂
  const deleteReservation = (id: string) => {
    return execute(() => supabaseServices.reservations.delete(id))
  }

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    fetchReservationsByDate,
    fetchReservationsByDateRange,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation
  }
}

// 認證相關 composable
export function useAuth() {
  const { data: user, loading, error, execute } = useSupabase<any>()

  // 獲取當前用戶
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      setError(error)
      setData(null)
    } else {
      setData(user)
      setError(null)
    }
    setLoading(false)
  }

  // 登入
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error)
      setData(null)
    } else {
      setData(data.user)
      setError(null)
    }
    setLoading(false)
  }

  // 登出
  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error)
    } else {
      setData(null)
      setError(null)
    }
    setLoading(false)
  }

  // 註冊
  const signUp = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error)
      setData(null)
    } else {
      setData(data.user)
      setError(null)
    }
    setLoading(false)
  }

  return {
    user,
    loading,
    error,
    getCurrentUser,
    signIn,
    signOut,
    signUp
  }
}
