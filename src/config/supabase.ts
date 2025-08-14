import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 資料庫表格名稱
export const TABLES = {
  INVENTORY_ITEMS: 'inventory_item',  // 庫存紀錄
  TRANSACTIONS: 'transaction',  // 交易紀錄
  CUSTOMERS: 'customer',  // 顧客資料
  PRODUCTS: 'product',  // 商品資料
  PRODUCT_CATEGORIES: 'product_category',  // 商品分類
  PAYMENT_METHODS: 'payment_method',  // 付款方式
  OUR_BANK_DATA: 'our_bank_data'  // 我方收款銀行資料
} as const

// 資料庫類型定義
export interface InventoryItem {
  id: string  // 庫存編號 yyyymmddhhmmss + 4碼亂數；e.g. 200011052100301234
  status: '未售' | '預訂' | '已售' | '自用' | '福利' | '被盜' | '淘退' | '補償' | '其他'
  product_id: string  // 商品編號 PRD + 5碼編號
  cd_key: string  // 遊戲CD-KEY ******-****-****-*****；* = 英數字
  purchase_time: string  // 進貨時間 yyyy-mm-dd hh:mm:ss.sss+00
  purchase_order_number: string  // 進貨編號
  purchase_store: string  // 進貨商店名稱
  purchase_payment_method: string  // 進貨付款方式
  purchase_amount_cny: number  // 進貨金額(人民幣)
  purchase_amount_twd: number  // 進貨金額(台幣)
  suggested_price: number  // 建議售價
  remarks: string | null  // 備註
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface Transaction {
  id: string  // 交易編號 yyyymmddhhmmss + 4碼亂數；e.g. 200011052100301234
  customer_id: string | null  // 顧客編號 UUID
  inventory_item_id: string  // 庫存編號 yyyymmddhhmmss + 4碼亂數；e.g. 200011052100301234
  transactions_time: string  // 交易時間 yyyy-mm-dd hh:mm:ss.sss+00
  actual_price: number  // 實際售價 #.00
  amount_received: number  // 實際收款 #.00
  amount_difference: number  // 差額 #.00
  our_payment_method: string  // 我方收款方式 PMD + 5碼編號
  our_bank_data: string  // 我方收款銀行資料 OBD + 5碼編號
  customer_payment_method: string  // 顧客付款方式 PMD + 5碼編號
  customer_bank_code: string  // 顧客銀行代碼
  customer_bank_account: string  // 顧客銀行帳號
  customer_account_name: string  // 顧客銀行帳號名稱
  remarks: string  // 備註
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface Customer {
  id: string  // 顧客編號 UUID
  id_number: string  // 顧客身分證字號
  name: string  // 顧客姓名
  nickname: string  // 顧客暱稱
  phone: string  // 顧客電話
  address: string  // 顧客地址
  contact_method: string  // 聯絡方式
  contact_method_id: string  // 聯絡方式編號
  contact_method_account: string  // 聯絡方式帳號
  contact_method_nickname: string  // 聯絡方式暱稱
  pubg_nickname: string  // PUBG暱稱
  pubg_account_id: string  // PUBG帳號ID
  steam_id: string  // Steam帳號ID
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface ProductCategory {
  id: string  // 商品分類編號 PDC + 5碼編號
  category_name: string  // 商品分類名稱
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface Product {
  id: string  // 商品編號 PRD + 5碼編號
  product_category_id: string  // 商品分類編號 PDC + 5碼編號
  series: string  // 系列名稱
  product_name: string  // 商品名稱
  in_game_price_gcoin: number | null  // 遊戲內價格(G-Coin) #.00
  in_game_price_usd: number | null  // 遊戲內價格(USD) #.00
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface PaymentMethod {
  id: string  // 付款方式編號 PMD + 5碼編號
  payment_method: string  // 付款方式名稱
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface OurBankData {
  id: string  // 我方收款銀行資料編號 OBD + 5碼編號
  bank_code: string  // 銀行代碼
  bank_name: string  // 銀行名稱
  bank_branche_code: string | null  // 銀行分行代碼
  bank_branche_name: string | null  // 銀行分行名稱
  account_number: string  // 銀行帳號
  account_holder: string  // 銀行帳號持有人
  account_branche: string  // 帳號分支名稱
  payment_method: string  // 付款方式編號 PMD + 5碼編號
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

// 擴展的庫存項目類型（包含關聯資料）
export interface InventoryItemWithDetails extends InventoryItem {
  product?: Product
  product_category?: ProductCategory
  transaction?: Transaction
  customer?: Customer
}
