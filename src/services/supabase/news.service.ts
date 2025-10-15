import { supabase, TABLES, type News } from '@/config/supabase'
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

// 新聞服務
export class NewsService {
  // 獲取前台顯示的新聞（show=true）
  static async getPublicNews(): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('show', true)
        .order('pin', { ascending: false }) // 置頂優先
        .order('show_date', { ascending: false }) // 上架日期由新到舊

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取新聞資料失敗'),
      }
    }
  }

  // 獲取所有新聞（用於後台管理）
  static async getAllNews(): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .order('pin', { ascending: false }) // 置頂優先
        .order('show_date', { ascending: false }) // 上架日期由新到舊

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取所有新聞資料失敗'),
      }
    }
  }

  // 根據 ID 獲取單個新聞
  static async getNewsById(id: string): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase.from(TABLES.NEWS).select('*').eq('id', id).single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取新聞詳情失敗'),
      }
    }
  }

  // 根據分類獲取前台顯示的新聞
  static async getPublicNewsByCategory(category: string): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('*')
        .eq('category', category)
        .eq('show', true)
        .order('pin', { ascending: false }) // 置頂優先
        .order('show_date', { ascending: false }) // 上架日期由新到舊

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類新聞失敗'),
      }
    }
  }

  // 獲取所有分類
  static async getAllCategories(): Promise<ApiResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.NEWS)
        .select('category')
        .eq('show', true)
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

  // 新增新聞
  static async createNews(
    news: Omit<News, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<News>> {
    try {
      console.log('嘗試新增新聞:', news)

      const { data, error } = await supabase.from(TABLES.NEWS).insert([news]).select().single()

      if (error) {
        console.error('Supabase 錯誤:', error)

        // 處理 ID 衝突錯誤
        if (
          error.code === '23505' &&
          error.message.includes('duplicate key value violates unique constraint "news_pkey"')
        ) {
          return {
            data: null,
            error: {
              message: '資料庫 ID 序列衝突，請聯繫管理員重置序列值',
              details: error.details,
              code: error.code,
            },
          }
        }

        throw error
      }

      console.log('新增成功:', data)
      return { data, error: null }
    } catch (error: unknown) {
      console.error('新增新聞錯誤:', error)
      return {
        data: null,
        error: toSupabaseError(error, '新增新聞失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新新聞失敗'),
      }
    }
  }

  // 刪除新聞
  static async deleteNews(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.NEWS).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除新聞失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新瀏覽次數失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類新聞失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '搜尋新聞失敗'),
      }
    }
  }
}


