import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('測試 Supabase 連接...')

  try {
    // 測試連接
    const { data, error } = await supabase
      .from('inventory_item')
      .select('count')
      .limit(1)

    if (error) {
      console.error('連接錯誤:', error)
    } else {
      console.log('✅ Supabase 連接成功')
    }

    // 檢查各個表格的資料數量
    const tables = [
      'inventory_item',
      'transaction',
      'customer',
      'product',
      'product_category',
      'payment_method',
      'our_bank_data'
    ]

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error(`${table} 表錯誤:`, error)
        } else {
          console.log(`${table} 表: ${count} 筆資料`)
        }
      } catch (err) {
        console.error(`${table} 表查詢失敗:`, err)
      }
    }

  } catch (error) {
    console.error('測試連接時發生錯誤:', error)
  }
}

testConnection()
