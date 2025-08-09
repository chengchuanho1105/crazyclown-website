import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 資料庫表格名稱
export const TABLES = {
  INVENTORY_ITEMS: 'inventory_item',
  TRANSACTIONS: 'transaction',
  CUSTOMERS: 'customer',
  PRODUCTS: 'product',
  PRODUCT_CATEGORIES: 'product_category',
  PAYMENT_METHODS: 'payment_method',
  OUR_BANK_DATA: 'our_bank_data'
} as const

// 資料庫類型定義
export interface InventoryItem {
  id: string
  status: '未售' | '預訂中' | '已售' | '自用' | '福利' | '被盜' | '淘退' | '補償'
  product_category_id: string
  product_id: string
  cd_key: string
  purchase_time: string
  purchase_store: string
  purchase_payment_method: string
  purchase_amount_cny: number
  purchase_amount_twd: number
  suggested_price: number
  created_at: string
  updated_at: string
  purchase_order_number: string
}

export interface Transaction {
  id: string
  customer_id: string | null
  inventory_item_id: string
  actual_price: number
  amount_received: number
  amount_difference: number
  our_payment_method: string
  our_bank_data: string
  customer_payment_method: string
  customer_bank_code: string
  customer_bank_account: string
  customer_account_name: string
  created_at: string
  updated_at: string
  transactions_time: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  id_number: string
  contact_method: string
  contact_method_id: string
  contact_method_account: string
  contact_method_nickname: string
  address: string
  pubg_nickname: string
  pubg_account_id: string
  steam_id: string
  created_at: string
  updated_at: string
  nickname: string
}

export interface Product {
  id: string
  product_category_id: string
  product_name: string
  created_at: string
  updated_at: string
  series: string
  in_game_price_gcoin: number | null
  in_game_price_usd: number | null
}

export interface ProductCategory {
  id: string
  category_name: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  payment_method: string
  created_at: string
  updated_at: string
}

export interface OurBankData {
  id: string
  bank_code: string
  account_number: string
  account_holder: string
  account_branche: string
  created_at: string
  updated_at: string
  bank_branche_coed: string | null
  bank_name: string
  bank_branche_name: string | null
}

// 擴展的庫存項目類型（包含關聯資料）
export interface InventoryItemWithDetails extends InventoryItem {
  product?: Product
  product_category?: ProductCategory
  transaction?: Transaction
  customer?: Customer
}
