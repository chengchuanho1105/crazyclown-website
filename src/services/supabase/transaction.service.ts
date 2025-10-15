import { supabase, TABLES, type Transaction, type Customer } from '@/config/supabase'
import type { ApiResponse, SupabaseError } from './types'

// 輔助函數：將未知錯誤轉換為 SupabaseError
function toSupabaseError(error: unknown, defaultMessage: string): SupabaseError {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    return {
      message: typeof errorObj.message === 'string' ? errorObj.message : defaultMessage,
      details: typeof errorObj.details === 'string' ? errorObj.details : undefined,
      code: typeof errorObj.code === 'string' ? errorObj.code : undefined,
      hint: typeof errorObj.hint === 'string' ? errorObj.hint : undefined,
    }
  }
  return {
    message: defaultMessage,
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取交易記錄失敗'),
      }
    }
  }

  // 新增交易記錄
  static async createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert([transaction])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增交易記錄失敗'),
      }
    }
  }

  // 更新交易記錄
  static async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新交易記錄失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取客戶資料失敗'),
      }
    }
  }

  // 新增客戶
  static async createCustomer(
    customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<Customer>> {
    try {
      // 過濾掉空值，避免約束檢查錯誤
      const cleanCustomer: Record<string, unknown> = {}

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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增客戶失敗'),
      }
    }
  }

  // 更新客戶
  static async updateCustomer(
    id: string,
    updates: Partial<Customer>,
  ): Promise<ApiResponse<Customer>> {
    try {
      // 過濾掉空值，避免約束檢查錯誤
      const cleanUpdates: Record<string, unknown> = {}

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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新客戶失敗'),
      }
    }
  }
}


