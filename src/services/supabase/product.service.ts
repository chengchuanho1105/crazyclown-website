import { supabase, TABLES, type Product, type ProductCategory } from '@/config/supabase'
import type { ApiResponse } from './types'

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
          code: error.code,
        },
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
          code: error.code,
        },
      }
    }
  }
}


