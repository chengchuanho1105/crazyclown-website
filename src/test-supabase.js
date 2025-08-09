import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 測試函數
async function testSupabase() {
  console.log('開始測試 Supabase 連接...')

  try {
    // 測試 1: 獲取庫存項目
    console.log('測試 1: 獲取庫存項目')
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_item')
      .select('*')
      .limit(5)

    if (inventoryError) {
      console.error('庫存查詢錯誤:', inventoryError)
    } else {
      console.log('庫存資料:', inventoryData)
      console.log('庫存數量:', inventoryData?.length || 0)
    }

    // 測試 2: 獲取交易記錄
    console.log('\n測試 2: 獲取交易記錄')
    const { data: transactionData, error: transactionError } = await supabase
      .from('transaction')
      .select('*')
      .limit(5)

    if (transactionError) {
      console.error('交易查詢錯誤:', transactionError)
    } else {
      console.log('交易資料:', transactionData)
      console.log('交易數量:', transactionData?.length || 0)
    }

    // 測試 3: 獲取客戶資料
    console.log('\n測試 3: 獲取客戶資料')
    const { data: customerData, error: customerError } = await supabase
      .from('customer')
      .select('*')
      .limit(5)

    if (customerError) {
      console.error('客戶查詢錯誤:', customerError)
    } else {
      console.log('客戶資料:', customerData)
      console.log('客戶數量:', customerData?.length || 0)
    }

    // 測試 4: 獲取商品分類
    console.log('\n測試 4: 獲取商品分類')
    const { data: categoryData, error: categoryError } = await supabase
      .from('product_category')
      .select('*')

    if (categoryError) {
      console.error('商品分類查詢錯誤:', categoryError)
    } else {
      console.log('商品分類資料:', categoryData)
      console.log('分類數量:', categoryData?.length || 0)
    }

    // 測試 5: 檢查表格是否存在
    console.log('\n測試 5: 檢查表格結構')
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tableError) {
      console.error('表格結構查詢錯誤:', tableError)
    } else {
      console.log('可用表格:', tableInfo?.map(t => t.table_name))
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

// 執行測試
testSupabase()
