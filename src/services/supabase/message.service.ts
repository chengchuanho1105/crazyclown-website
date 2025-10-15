import { supabase, TABLES, type CannedMessage } from '@/config/supabase'
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

// 罐頭訊息服務
export class CannedMessageService {
  // 獲取所有罐頭訊息
  static async getAllCannedMessages(): Promise<ApiResponse<CannedMessage[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取罐頭訊息資料失敗'),
      }
    }
  }

  // 根據 ID 獲取單個罐頭訊息
  static async getCannedMessageById(id: string): Promise<ApiResponse<CannedMessage>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取罐頭訊息詳情失敗'),
      }
    }
  }

  // 根據分類獲取罐頭訊息
  static async getCannedMessagesByCategory(
    category: string,
  ): Promise<ApiResponse<CannedMessage[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類罐頭訊息失敗'),
      }
    }
  }

  // 搜尋罐頭訊息（根據標題、內容或關鍵字）
  static async searchCannedMessages(query: string): Promise<ApiResponse<CannedMessage[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,keyword.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '搜尋罐頭訊息失敗'),
      }
    }
  }

  // 新增罐頭訊息
  static async createCannedMessage(
    message: Omit<CannedMessage, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<CannedMessage>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .insert([message])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增罐頭訊息失敗'),
      }
    }
  }

  // 更新罐頭訊息
  static async updateCannedMessage(
    id: string,
    updates: Partial<CannedMessage>,
  ): Promise<ApiResponse<CannedMessage>> {
    try {
      // 移除 id, created_at 等系統欄位，但保留 updated_at
      const cleanUpdates = { ...updates }
      const cleanObj = cleanUpdates as Record<string, unknown>
      delete cleanObj.id
      delete cleanObj.created_at

      // 手動添加 updated_at
      const updateData = {
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新罐頭訊息失敗'),
      }
    }
  }

  // 增加使用次數
  static async incrementUsageCount(id: string): Promise<ApiResponse<CannedMessage>> {
    try {
      // 先獲取當前使用次數
      const { data: currentMessage, error: fetchError } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('usage_count')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const newUsageCount = (currentMessage?.usage_count || 0) + 1

      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .update({
          usage_count: newUsageCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新使用次數失敗'),
      }
    }
  }

  // 刪除罐頭訊息
  static async deleteCannedMessage(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.CANNED_MESSAGES).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除罐頭訊息失敗'),
      }
    }
  }

  // 獲取所有分類
  static async getAllCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CANNED_MESSAGES)
        .select('category')
        .order('category')

      if (error) throw error

      // 去重並返回唯一的分類列表
      const uniqueCategories = [...new Set(data?.map((item) => item.category) || [])]
      return { data: uniqueCategories, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類列表失敗'),
      }
    }
  }
}


