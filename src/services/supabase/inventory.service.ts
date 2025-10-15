import {
  supabase,
  TABLES,
  type InventoryItem,
  type Transaction,
  type Customer,
  type InventoryItemWithDetails,
} from '@/config/supabase'
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取庫存資料失敗'),
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
      const productIds = [...new Set(inventoryItems.map((item) => item.product_id).filter(Boolean))]
      const categoryIds = [
        ...new Set(inventoryItems.map((item) => item.product_category_id).filter(Boolean)),
      ]

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
      const result = inventoryItems.map((item) => {
        const product = products.find((p) => p.id === item.product_id)
        const category = categories.find((c) => c.id === item.product_category_id)

        return {
          ...item,
          product: product || undefined,
          product_category: category || undefined,
        }
      })

      return { data: result, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取庫存詳細資料失敗'),
      }
    }
  }

  // 獲取單個庫存項目的完整詳細資料
  static async getInventoryItemWithFullDetails(id: string): Promise<
    ApiResponse<
      InventoryItemWithDetails & {
        transaction?: Transaction & {
          customer?: Customer
        }
      }
    >
  > {
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
      const { data: transactionData, error: transactionError } = await supabase
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
        transaction: transactionData
          ? {
              ...transactionData,
              customer: customerData || undefined,
            }
          : undefined,
      }

      return { data: result, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取庫存完整詳細資料失敗'),
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
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '篩選庫存資料失敗'),
      }
    }
  }

  // 新增庫存項目
  static async createInventoryItem(
    item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .insert([item])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '新增庫存項目失敗'),
      }
    }
  }

  // 更新庫存項目
  static async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>,
  ): Promise<ApiResponse<InventoryItem>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.INVENTORY_ITEMS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新庫存項目失敗'),
      }
    }
  }

  // 刪除庫存項目
  static async deleteInventoryItem(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.INVENTORY_ITEMS).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除庫存項目失敗'),
      }
    }
  }
}


