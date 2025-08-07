import { createClient } from '@supabase/supabase-js'

// 環境變數類型定義
interface SupabaseConfig {
  url: string
  anonKey: string
}

// 從環境變數獲取 Supabase 配置
const getSupabaseConfig = (): SupabaseConfig => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase 環境變數未設定。請檢查 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }

  return { url, anonKey }
}

// 創建 Supabase 客戶端
const config = getSupabaseConfig()
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 資料庫表格名稱常數
export const TABLES = {
  // 客戶相關
  CUSTOMERS: 'customers',

  // 商品系列相關
  PRODUCT_SERIES: 'product_series',

  // 庫存相關
  INVENTORY_ITEMS: 'inventory_items',

  // 預訂相關
  RESERVATIONS: 'reservations',

  // 交易相關
  TRANSACTIONS: 'transactions',

  // 活動記錄
  ACTIVITY_LOGS: 'activity_logs'
} as const

// 資料庫操作類型
export type Database = {
  public: {
    Tables: {
      [TABLES.CUSTOMERS]: {
        Row: {
          id: string
          name: string
          phone: string
          id_number: string | null
          contact_method: string | null
          contact_method_id: string | null
          contact_method_account: string | null
          contact_method_nickname: string | null
          address: string | null
          pubg_nickname: string | null
          pubg_account_id: string | null
          steam_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          id_number?: string
          contact_method?: string
          contact_method_id?: string
          contact_method_account?: string
          contact_method_nickname?: string
          address?: string
          pubg_nickname?: string
          pubg_account_id?: string
          steam_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          id_number?: string
          contact_method?: string
          contact_method_id?: string
          contact_method_account?: string
          contact_method_nickname?: string
          address?: string
          pubg_nickname?: string
          pubg_account_id?: string
          steam_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      [TABLES.PRODUCT_SERIES]: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      [TABLES.INVENTORY_ITEMS]: {
        Row: {
          id: string
          status: '未售' | '預訂' | '已售' | '自用' | '福利' | '淘寶已退刷' | '被盜' | '補償'
          cd_key: string
          series_id: string | null
          product_name: string
          suggested_price: number
          order_number: string | null
          purchase_time: string
          store: string | null
          purchase_amount_cny: number | null
          purchase_amount_twd: number | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          status?: '未售' | '預訂' | '已售' | '自用' | '福利' | '淘寶已退刷' | '被盜' | '補償'
          cd_key: string
          series_id?: string
          product_name: string
          suggested_price: number
          order_number?: string
          purchase_time?: string
          store?: string
          purchase_amount_cny?: number
          purchase_amount_twd?: number
          payment_method?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          status?: '未售' | '預訂' | '已售' | '自用' | '福利' | '淘寶已退刷' | '被盜' | '補償'
          cd_key?: string
          series_id?: string
          product_name?: string
          suggested_price?: number
          order_number?: string
          purchase_time?: string
          store?: string
          purchase_amount_cny?: number
          purchase_amount_twd?: number
          payment_method?: string
          created_at?: string
          updated_at?: string
        }
      }
      [TABLES.RESERVATIONS]: {
        Row: {
          id: string
          inventory_item_id: string
          customer_id: string
          reservation_time: string
          expected_price: number
          notes: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inventory_item_id: string
          customer_id: string
          reservation_time: string
          expected_price: number
          notes?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string
          customer_id?: string
          reservation_time?: string
          expected_price?: number
          notes?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      [TABLES.TRANSACTIONS]: {
        Row: {
          id: string
          inventory_item_id: string
          customer_id: string
          transaction_type: '進貨' | '銷售' | '退款' | '轉帳'
          amount: number
          payment_method: string | null
          transaction_date: string
          notes: string | null
          my_payment_method: string | null
          my_bank_code: string | null
          my_account_number: string | null
          customer_bank_code: string | null
          customer_account_number: string | null
          customer_account_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inventory_item_id: string
          customer_id: string
          transaction_type: '進貨' | '銷售' | '退款' | '轉帳'
          amount: number
          payment_method?: string
          transaction_date?: string
          notes?: string
          my_payment_method?: string
          my_bank_code?: string
          my_account_number?: string
          customer_bank_code?: string
          customer_account_number?: string
          customer_account_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inventory_item_id?: string
          customer_id?: string
          transaction_type?: '進貨' | '銷售' | '退款' | '轉帳'
          amount?: number
          payment_method?: string
          transaction_date?: string
          notes?: string
          my_payment_method?: string
          my_bank_code?: string
          my_account_number?: string
          customer_bank_code?: string
          customer_account_number?: string
          customer_account_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      [TABLES.ACTIVITY_LOGS]: {
        Row: {
          id: string
          type: string
          title: string
          description: string | null
          amount: number | null
          related_item_id: string | null
          related_customer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          description?: string
          amount?: number
          related_item_id?: string
          related_customer_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          description?: string
          amount?: number
          related_item_id?: string
          related_customer_id?: string
          created_at?: string
        }
      }
    }
  }
}
