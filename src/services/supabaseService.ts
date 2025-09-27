import { supabase, TABLES, type InventoryItem, type Transaction, type Customer, type Product, type ProductCategory, type PaymentMethod, type OurBankData, type InventoryItemWithDetails, type News, type HomepageHero, type PriceList } from '@/config/supabase'

// 錯誤處理類型
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// 通用回應類型
export interface ApiResponse<T> {
  data: T | null
  error: SupabaseError | null
}

// 庫存項目服務
export class InventoryService {
  // 獲取所有庫存項目
  static async getAllInventoryItems(): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取庫存資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取庫存項目（包含關聯資料）
  static async getInventoryItemsWithDetails(): Promise<ApiResponse<InventoryItemWithDetails[]>> {
    try {
      // 獲取所有庫存項目
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select('*')
        .order('created_at', { ascending: false })

      if (inventoryError) throw inventoryError

      if (!inventoryItems || inventoryItems.length === 0) {
        return { data: [], error: null }
      }

      // 獲取所有相關的商品ID和分類ID
      const productIds = [...new Set(inventoryItems.map(item => item.product_id).filter(Boolean))]
      const categoryIds = [...new Set(inventoryItems.map(item => item.product_category_id).filter(Boolean))]

      // 批量獲取商品資訊
      let products = []
      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .in('id', productIds)

        if (!productsError && productsData) {
          products = productsData
        }
      }

      // 批量獲取商品分類資訊
      let categories = []
      if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from(TABLES.PRODUCT_CATEGORIES)
          .select('*')
          .in('id', categoryIds)

        if (!categoriesError && categoriesData) {
          categories = categoriesData
        }
      }

      // 組合資料
      const result = inventoryItems.map(item => {
        const product = products.find(p => p.id === item.product_id)
        const category = categories.find(c => c.id === item.product_category_id)

        return {
          ...item,
          product: product || undefined,
          product_category: category || undefined
        }
      })

      return { data: result, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取庫存詳細資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }



  // 獲取單個庫存項目的完整詳細資料
  static async getInventoryItemWithFullDetails(id: string): Promise<ApiResponse<InventoryItemWithDetails & {
    transaction?: Transaction & {
      customer?: Customer
    }
  }>> {
    try {
      // 首先獲取庫存項目
      const { data: inventoryData, error: inventoryError } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select('*')
        .eq('id', id)
        .single()

      if (inventoryError) throw inventoryError

      if (!inventoryData) {
        throw new Error('找不到指定的庫存項目')
      }

      // 手動獲取相關的商品資訊
      let productData = null
      if (inventoryData.product_id) {
        const { data: product, error: productError } = await supabase
          .from(TABLES.PRODUCTS)
          .select('*')
          .eq('id', inventoryData.product_id)
          .single()

        if (!productError && product) {
          productData = product
        }
      }

      // 手動獲取相關的商品分類資訊
      let categoryData = null
      if (inventoryData.product_category_id) {
        const { data: category, error: categoryError } = await supabase
          .from(TABLES.PRODUCT_CATEGORIES)
          .select('*')
          .eq('id', inventoryData.product_category_id)
          .single()

        if (!categoryError && category) {
          categoryData = category
        }
      }

            // 嘗試獲取相關的交易資訊
      let { data: transactionData, error: transactionError } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('inventory_item_id', id)
        .single()

      // 如果找到交易，嘗試獲取客戶資訊
      let customerData = null
      if (!transactionError && transactionData && transactionData.customer_id) {
        const { data: customer, error: customerError } = await supabase
          .from(TABLES.CUSTOMERS)
          .select('*')
          .eq('id', transactionData.customer_id)
          .single()

        if (!customerError && customer) {
          customerData = customer
        }
      }

      // 組合所有資料
      const result = {
        ...inventoryData,
        product: productData || undefined,
        product_category: categoryData || undefined,
        transaction: transactionData ? {
          ...transactionData,
          customer: customerData || undefined
        } : undefined
      }

      return { data: result, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取庫存完整詳細資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據狀態篩選庫存項目
  static async getInventoryItemsByStatus(status: string): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '篩選庫存資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增庫存項目
  static async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .insert([item])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增庫存項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新庫存項目
  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新庫存項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 刪除庫存項目
  static async deleteInventoryItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '刪除庫存項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 交易服務
export class TransactionService {
  // 獲取所有交易記錄
  static async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取交易記錄失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增交易記錄
  static async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert([transaction])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增交易記錄失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新交易記錄
  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新交易記錄失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 客戶服務
export class CustomerService {
  // 獲取所有客戶
  static async getAllCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取客戶資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增客戶
  static async createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Customer>> {
    try {
      // 過濾掉空值，避免約束檢查錯誤
      const cleanCustomer: Record<string, any> = {}

      Object.entries(customer).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanCustomer[key] = value
        }
      })

      console.log('清理後的客戶資料:', cleanCustomer)

      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .insert([cleanCustomer])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增客戶失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新客戶
  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      // 過濾掉空值，避免約束檢查錯誤
      const cleanUpdates: Record<string, any> = {}

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanUpdates[key] = value
        }
      })

      console.log('清理後的更新資料:', cleanUpdates)

      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新客戶失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 商品服務
export class ProductService {
  // 獲取所有商品
  static async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取商品資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 商品分類服務
export class ProductCategoryService {
  // 獲取所有商品分類
  static async getAllProductCategories(): Promise<ApiResponse<ProductCategory[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRODUCT_CATEGORIES)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取商品分類失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 付款方式服務
export class PaymentMethodService {
  // 獲取所有付款方式
  static async getAllPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAYMENT_METHODS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取付款方式失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 銀行資料服務
export class OurBankDataService {
  // 獲取所有銀行資料
  static async getAllBankData(): Promise<ApiResponse<OurBankData[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OUR_BANK_DATA)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取銀行資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 統計服務
export class StatisticsService {
  // 獲取庫存統計
  static async getInventoryStatistics(): Promise<ApiResponse<{
    total: number
    available: number
    sold: number
    reserved: number
    personal: number
    welfare: number
    stolen: number
    refunded: number
    compensation: number
  }>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .select('status')

      if (error) throw error

      const stats = {
        total: data.length,
        available: data.filter(item => item.status === '未售').length,
        sold: data.filter(item => item.status === '已售').length,
        reserved: data.filter(item => item.status === '預訂中').length,
        personal: data.filter(item => item.status === '自用').length,
        welfare: data.filter(item => item.status === '福利').length,
        stolen: data.filter(item => item.status === '被盜').length,
        refunded: data.filter(item => item.status === '淘退').length,
        compensation: data.filter(item => item.status === '補償').length
      }

      return { data: stats, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取統計資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取營收統計
  static async getRevenueStatistics(): Promise<ApiResponse<{
    totalRevenue: number
    monthlyRevenue: number
    totalTransactions: number
  }>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('amount_received, created_at')

      if (error) throw error

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalRevenue = data.reduce((sum, transaction) => sum + (transaction.amount_received || 0), 0)
      const monthlyRevenue = data
        .filter(transaction => new Date(transaction.created_at) >= thisMonth)
        .reduce((sum, transaction) => sum + (transaction.amount_received || 0), 0)

      const stats = {
        totalRevenue,
        monthlyRevenue,
        totalTransactions: data.length
      }

      return { data: stats, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取營收統計失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 新聞服務
export class NewsService {
  // 獲取所有新聞（已發布且未刪除）
  static async getAllPublishedNews(): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('status', '發布')
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取新聞資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取所有新聞（包含草稿和下架，用於後台管理）
  static async getAllNews(): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取所有新聞資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據 ID 獲取單個新聞
  static async getNewsById(id: string): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取新聞詳情失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據 slug 獲取單個新聞
  static async getNewsBySlug(slug: string): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('slug', slug)
        .eq('status', '發布')
        .is('deleted_at', null)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取新聞詳情失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增新聞
  static async createNews(news: Omit<News, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .insert([news])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增新聞失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新新聞
  static async updateNews(id: string, updates: Partial<News>): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新新聞失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 刪除新聞（軟刪除）
  static async deleteNews(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLES.NEWS)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '刪除新聞失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 增加瀏覽次數
  static async incrementViews(id: string): Promise<ApiResponse<boolean>> {
    try {
      // 先獲取當前瀏覽次數
      const { data: currentNews, error: fetchError } = await supabase
        .from(TABLES.NEWS)
        .select('views_count')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const newViewsCount = (currentNews?.views_count || 0) + 1

      const { error } = await supabase
        .from(TABLES.NEWS)
        .update({ views_count: newViewsCount })
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新瀏覽次數失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據分類獲取新聞
  static async getNewsByCategory(category: string): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('category', category)
        .eq('status', '發布')
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取分類新聞失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 搜尋新聞
  static async searchNews(query: string): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('status', '發布')
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('priority', { ascending: false })
        .order('published_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '搜尋新聞失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 首頁 Hero 服務
export class HomepageHeroService {
  // 獲取所有首頁 Hero 內容
  static async getAllHomepageHeroes(): Promise<ApiResponse<HomepageHero[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取首頁 Hero 資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據 ID 獲取單個首頁 Hero 內容
  static async getHomepageHeroById(id: string): Promise<ApiResponse<HomepageHero>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取首頁 Hero 詳情失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增首頁 Hero 內容
  static async createHomepageHero(hero: Omit<HomepageHero, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<HomepageHero>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .insert([hero])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增首頁 Hero 內容失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新首頁 Hero 內容
  static async updateHomepageHero(id: string, updates: Partial<HomepageHero>): Promise<ApiResponse<HomepageHero>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新首頁 Hero 內容失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 刪除首頁 Hero 內容
  static async deleteHomepageHero(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '刪除首頁 Hero 內容失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}

// 價格列表服務
export class PriceListService {
  // 獲取所有價格列表項目
  static async getAllPriceListItems(): Promise<ApiResponse<PriceList[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .order('category_sort', { ascending: true })
        .order('product_sort', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取價格列表資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據 ID 獲取單個價格列表項目
  static async getPriceListItemById(id: string): Promise<ApiResponse<PriceList>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取價格列表項目詳情失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據分類獲取價格列表項目
  static async getPriceListItemsByCategory(category: string): Promise<ApiResponse<PriceList[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .eq('category', category)
        .order('product_sort', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取分類價格列表失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 新增價格列表項目
  static async createPriceListItem(item: Omit<PriceList, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<PriceList>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .insert([item])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '新增價格列表項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 更新價格列表項目
  static async updatePriceListItem(id: string, updates: Partial<PriceList>): Promise<ApiResponse<PriceList>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '更新價格列表項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 刪除價格列表項目
  static async deletePriceListItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLES.PRICE_LIST)
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '刪除價格列表項目失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取所有分類
  static async getAllCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('category')
        .order('category')

      if (error) throw error

      // 去重並返回唯一的分類列表
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
      return { data: uniqueCategories, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取分類列表失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取前台顯示的價格列表項目（只顯示 show=true 的項目）
  static async getPublicPriceListItems(): Promise<ApiResponse<PriceList[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .eq('show', true)
        .order('category_sort', { ascending: true })
        .order('product_sort', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取前台價格列表資料失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 根據分類獲取前台顯示的價格列表項目
  static async getPublicPriceListItemsByCategory(category: string): Promise<ApiResponse<PriceList[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .eq('category', category)
        .eq('show', true)
        .order('product_sort', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取前台分類價格列表失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }

  // 獲取前台顯示的分類列表（按 category_sort 排序）
  static async getPublicCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('category, category_sort')
        .eq('show', true)
        .order('category_sort', { ascending: true })

      if (error) throw error

      // 去重並按照 category_sort 排序
      const categoryMap = new Map<string, number>()
      data?.forEach(item => {
        if (!categoryMap.has(item.category) || categoryMap.get(item.category)! > item.category_sort) {
          categoryMap.set(item.category, item.category_sort)
        }
      })

      const sortedCategories = Array.from(categoryMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([category]) => category)

      return { data: sortedCategories, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取前台分類列表失敗',
          details: error.details,
          code: error.code
        }
      }
    }
  }
}
