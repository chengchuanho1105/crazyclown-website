import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 簡化的測試函數
async function testSimpleImport() {
  console.log('開始簡化測試...')

  try {
    // 測試 1: 檢查表格是否存在並獲取結構
    console.log('\n1. 檢查表格結構...')

    const tables = ['product_category', 'product', 'payment_method', 'our_bank_data', 'customer', 'inventory_item', 'transaction']

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: 連接成功`)
        }
      } catch (err) {
        console.log(`❌ ${table}: 例外錯誤 - ${err.message}`)
      }
    }

    // 測試 2: 嘗試插入簡單的測試資料
    console.log('\n2. 測試插入簡單資料...')

    // 測試插入商品分類
    const testCategory = {
      id: 'TEST001',
      category_name: '測試分類',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from('product_category')
      .insert([testCategory])
      .select()

    if (categoryError) {
      console.log('商品分類插入錯誤:', categoryError.message)
    } else {
      console.log('✅ 商品分類插入成功')
    }

    // 測試 3: 檢查 RLS 政策
    console.log('\n3. 檢查 RLS 政策...')

    // 嘗試獲取所有資料
    const { data: allCategories, error: allError } = await supabase
      .from('product_category')
      .select('*')

    if (allError) {
      console.log('獲取所有資料錯誤:', allError.message)
    } else {
      console.log(`✅ 成功獲取 ${allCategories?.length || 0} 筆商品分類資料`)
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

// 執行測試
testSimpleImport()
