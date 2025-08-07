import { supabase, TABLES, type Database } from '@/config/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

// 通用響應類型
interface SupabaseResponse<T> {
  data: T | null
  error: PostgrestError | null
}

// 通用查詢選項
interface QueryOptions {
  select?: string
  filters?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}

// 基礎服務類別
class BaseService<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // 獲取所有記錄
  async getAll(options?: QueryOptions): Promise<SupabaseResponse<T[]>> {
    let query = supabase.from(this.tableName).select(options?.select || '*')

    // 應用過濾器
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    // 應用排序
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true
      })
    }

    // 應用分頁
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    return await query
  }

  // 根據 ID 獲取單筆記錄
  async getById(id: string): Promise<SupabaseResponse<T>> {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
  }

  // 創建新記錄
  async create(data: Partial<T>): Promise<SupabaseResponse<T>> {
    return await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single()
  }

  // 更新記錄
  async update(id: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    return await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()
  }

  // 刪除記錄
  async delete(id: string): Promise<SupabaseResponse<T>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single()
  }

  // 批量操作
  async batchCreate(data: Partial<T>[]): Promise<SupabaseResponse<T[]>> {
    return await supabase
      .from(this.tableName)
      .insert(data)
      .select()
  }

  async batchUpdate(ids: string[], data: Partial<T>): Promise<SupabaseResponse<T[]>> {
    return await supabase
      .from(this.tableName)
      .update(data)
      .in('id', ids)
      .select()
  }

  async batchDelete(ids: string[]): Promise<SupabaseResponse<T[]>> {
    return await supabase
      .from(this.tableName)
      .delete()
      .in('id', ids)
      .select()
  }
}

// 交易服務
export class TransactionService extends BaseService<Database['public']['Tables']['transactions']['Row']> {
  constructor() {
    super(TABLES.TRANSACTIONS)
  }

  // 獲取交易統計
  async getTransactionStats() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('status, total_amount, created_at')

    if (error) return { data: null, error }

    const stats = {
      total: data.length,
      completed: data.filter(t => t.status === 'completed').length,
      pending: data.filter(t => t.status === 'pending').length,
      cancelled: data.filter(t => t.status === 'cancelled').length,
      totalRevenue: data
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.total_amount, 0)
    }

    return { data: stats, error: null }
  }

  // 獲取月營收統計
  async getMonthlyRevenue(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0).toISOString()

    const { data, error } = await supabase
      .from(this.tableName)
      .select('total_amount, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) return { data: null, error }

    const totalRevenue = data.reduce((sum, t) => sum + t.total_amount, 0)
    return { data: { totalRevenue, transactionCount: data.length }, error: null }
  }
}

// 客戶服務
export class CustomerService extends BaseService<Database['public']['Tables']['customers']['Row']> {
  constructor() {
    super(TABLES.CUSTOMERS)
  }

  // 根據電子郵件查找客戶
  async getByEmail(email: string) {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()
  }

  // 根據電話號碼查找客戶
  async getByPhone(phone: string) {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .single()
  }
}

// 商品服務
export class ProductService extends BaseService<Database['public']['Tables']['products']['Row']> {
  constructor() {
    super(TABLES.PRODUCTS)
  }

  // 根據類別獲取商品
  async getByCategory(categoryId: string) {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('category_id', categoryId)
  }

  // 更新庫存
  async updateStock(id: string, quantity: number) {
    const { data: product } = await this.getById(id)
    if (!product) {
      return { data: null, error: { message: '商品不存在', code: 'NOT_FOUND' } as PostgrestError }
    }

    const newStock = product.stock + quantity
    if (newStock < 0) {
      return { data: null, error: { message: '庫存不足', code: 'INSUFFICIENT_STOCK' } as PostgrestError }
    }

    return await this.update(id, { stock: newStock })
  }
}

// 預訂服務
export class ReservationService extends BaseService<Database['public']['Tables']['reservations']['Row']> {
  constructor() {
    super(TABLES.RESERVATIONS)
  }

  // 獲取特定日期的預訂
  async getByDate(date: string) {
    return await supabase
      .from(this.tableName)
      .select('*')
      .eq('reservation_date', date)
      .order('reservation_time')
  }

  // 獲取特定時間範圍的預訂
  async getByDateRange(startDate: string, endDate: string) {
    return await supabase
      .from(this.tableName)
      .select('*')
      .gte('reservation_date', startDate)
      .lte('reservation_date', endDate)
      .order('reservation_date')
      .order('reservation_time')
  }

  // 更新預訂狀態
  async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    return await this.update(id, { status })
  }
}

// 創建服務實例
export const transactionService = new TransactionService()
export const customerService = new CustomerService()
export const productService = new ProductService()
export const reservationService = new ReservationService()

// 匯出所有服務
export const supabaseServices = {
  transactions: transactionService,
  customers: customerService,
  products: productService,
  reservations: reservationService
}
