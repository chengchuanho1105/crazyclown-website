import { createClient } from '@supabase/supabase-js'

// Supabase 配置 - 從環境變數讀取
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 檢查環境變數是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少必要的 Supabase 環境變數：VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

// 建立 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 認證狀態檢查
export const checkAuthStatus = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

// 檢查用戶權限
export const checkUserRole = async (requiredRoles: string[]) => {
  try {
    const { session } = await checkAuthStatus()
    if (!session) return false

    // 從 session.user.user_metadata 中獲取角色
    // 如果沒有設定角色，預設為 'user'
    const userRole = session.user.user_metadata?.role || 'user'
    return requiredRoles.includes(userRole)
  } catch (error) {
    console.error('檢查用戶權限時發生錯誤:', error)
    return false
  }
}

// 資料庫表格名稱
export const TABLES = {
  INVENTORY_ITEMS: 'inventory_item',  // 庫存紀錄
  TRANSACTIONS: 'transaction',  // 交易紀錄
  CUSTOMERS: 'customer',  // 顧客資料
  PRODUCTS: 'product',  // 商品資料
  PRODUCT_CATEGORIES: 'product_category',  // 商品分類
  PAYMENT_METHODS: 'payment_method',  // 付款方式
  OUR_BANK_DATA: 'our_bank_data',  // 我方收款銀行資料
  NEWS: 'news',  // 新聞資料
  HOMEPAGE_HERO: 'homepage_hero',  // 首頁 Hero 內容
  PRICE_LIST: 'price_list'  // 價格列表
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
  customer_id?: string | null  // 顧客編號 UUID
  inventory_item_id: string  // 庫存編號 yyyymmddhhmmss + 4碼亂數；e.g. 200011052100301234
  transactions_time: string  // 交易時間 yyyy-mm-dd hh:mm:ss.sss+00
  actual_price?: number  // 實際售價 #.00
  amount_received?: number  // 實際收款 #.00
  amount_difference?: number  // 差額 #.00
  our_payment_method?: string | null  // 我方收款方式 PMD + 5碼編號
  our_bank_data?: string | null  // 我方收款銀行資料 OBD + 5碼編號
  customer_payment_method?: string | null  // 顧客付款方式 PMD + 5碼編號
  customer_bank_code?: string | null  // 顧客銀行代碼
  customer_bank_account?: string | null  // 顧客銀行帳號
  customer_account_name?: string | null  // 顧客銀行帳號名稱
  remarks?: string | null  // 備註
  created_at: string  // 建立時間 yyyy-mm-dd hh:mm:ss.sss+00
  updated_at: string  // 更新時間 yyyy-mm-dd hh:mm:ss.sss+00
}

export interface Customer {
  id: string  // 顧客編號 UUID
  id_number?: string | null  // 顧客身分證字號
  name?: string | null  // 顧客姓名
  nickname?: string | null  // 顧客暱稱
  phone?: string | null  // 顧客電話
  address?: string | null  // 顧客地址
  contact_method?: string | null  // 聯絡方式
  contact_method_id?: string | null  // 聯絡方式編號
  contact_method_account?: string | null  // 聯絡方式帳號
  contact_method_nickname?: string | null  // 聯絡方式暱稱
  pubg_nickname?: string | null  // PUBG暱稱
  pubg_account_id?: string | null  // PUBG帳號ID
  steam_id?: string | null  // Steam帳號ID
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

// 新聞資料類型定義
export interface News {
  id: string  // 新聞編號
  slot: string  // 分類槽位 (news/featured)
  category: string  // 新聞分類
  author: string  // 作者
  image: string  // 圖片 URL
  tags: string[]  // 標籤陣列
  title: string  // 新聞標題
  introduce: string  // 簡介
  formatting_style: boolean  // 格式化樣式 (對應舊欄位 addStyle)
  html: string  // HTML 內容
  show: boolean  // 是否顯示
  pin: boolean  // 是否置頂
  show_date: string  // 上架日期 (timestamptz)
  created_at: string  // 建立時間
  updated_at: string  // 更新時間
}

// 首頁 Hero 資料類型定義
export interface HomepageHero {
  id: string  // Hero 編號
  title: string  // 標題
  description: string  // 描述
  buttonText: string  // 按鈕文字
  buttonLink: string  // 按鈕連結
  align: 'left' | 'right'  // 對齊方式
  bgImage: string  // 背景圖片 URL
  aos: string  // AOS 動畫設定
  scrollDown?: boolean  // 是否顯示向下滾動提示
  created_at: string  // 建立時間
  updated_at: string  // 更新時間
}

// 價格列表資料類型定義
export interface PriceList {
  id: string  // 價格項目編號
  category: string  // 商品分類
  category_sort: number  // 分類排序欄位
  currency: string  // 貨幣類型 (usd/gcoin)
  name: string  // 商品名稱
  usd?: number  // USD 價格
  gcoin?: number  // G-Coin 價格
  specialPrice: number  // 優惠價格 (TWD)
  hotSale: boolean  // 是否為熱銷商品
  product_sort: number  // 商品排序欄位
  show: boolean  // 是否在價目表中顯示
  created_at: string  // 建立時間
  updated_at: string  // 更新時間
}
