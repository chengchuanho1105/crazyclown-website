import { supabase, TABLES, type HomepageHero, type PriceList } from '@/config/supabase'
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取首頁 Hero 資料失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取首頁 Hero 詳情失敗'),
      }
    }
  }

  // 新增首頁 Hero 內容
  static async createHomepageHero(
    hero: Omit<HomepageHero, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<HomepageHero>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .insert([hero])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增首頁 Hero 內容失敗'),
      }
    }
  }

  // 更新首頁 Hero 內容
  static async updateHomepageHero(
    id: string,
    updates: Partial<HomepageHero>,
  ): Promise<ApiResponse<HomepageHero>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOMEPAGE_HERO)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新首頁 Hero 內容失敗'),
      }
    }
  }

  // 刪除首頁 Hero 內容
  static async deleteHomepageHero(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.HOMEPAGE_HERO).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除首頁 Hero 內容失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取價格列表資料失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取價格列表項目詳情失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類價格列表失敗'),
      }
    }
  }

  // 新增價格列表項目
  static async createPriceListItem(
    item: Omit<PriceList, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<PriceList>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .insert([item])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增價格列表項目失敗'),
      }
    }
  }

  // 更新價格列表項目
  static async updatePriceListItem(
    id: string,
    updates: Partial<PriceList>,
  ): Promise<ApiResponse<PriceList>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新價格列表項目失敗'),
      }
    }
  }

  // 刪除價格列表項目
  static async deletePriceListItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.PRICE_LIST).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除價格列表項目失敗'),
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
      const uniqueCategories = [...new Set(data?.map((item) => item.category) || [])]
      return { data: uniqueCategories, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取分類列表失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取前台價格列表資料失敗'),
      }
    }
  }

  // 根據分類獲取前台顯示的價格列表項目
  static async getPublicPriceListItemsByCategory(
    category: string,
  ): Promise<ApiResponse<PriceList[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PRICE_LIST)
        .select('*')
        .eq('category', category)
        .eq('show', true)
        .order('product_sort', { ascending: true })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取前台分類價格列表失敗'),
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
      data?.forEach((item) => {
        if (
          !categoryMap.has(item.category) ||
          categoryMap.get(item.category)! > item.category_sort
        ) {
          categoryMap.set(item.category, item.category_sort)
        }
      })

      const sortedCategories = Array.from(categoryMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([category]) => category)

      return { data: sortedCategories, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取前台分類列表失敗'),
      }
    }
  }
}


