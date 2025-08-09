import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 測試函數
async function testSupabaseDetailed() {
  console.log('開始詳細測試 Supabase 連接...')

  // 可能的表格名稱列表
  const possibleTables = [
    'inventory_item',
    'transaction',
    'customer',
    'product',
    'product_category',
    'payment_method',
    'our_bank_data'
  ]

  console.log('測試所有可能的表格名稱...')

  for (const tableName of possibleTables) {
    try {
      console.log(`\n測試表格: ${tableName}`)
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: 成功 (${data?.length || 0} 筆資料)`)
        if (data && data.length > 0) {
          console.log(`   範例資料:`, data[0])
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: 例外錯誤 - ${err.message}`)
    }
  }

  // 測試 RLS 政策
  console.log('\n\n測試 RLS 政策...')
  try {
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_rls_policies')

    if (rlsError) {
      console.log('無法獲取 RLS 政策:', rlsError.message)
    } else {
      console.log('RLS 政策:', rlsData)
    }
  } catch (err) {
    console.log('RLS 政策測試失敗:', err.message)
  }

  // 測試認證狀態
  console.log('\n\n測試認證狀態...')
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.log('認證錯誤:', authError.message)
  } else {
    console.log('當前用戶:', user ? '已登入' : '匿名用戶')
  }
}

// 執行測試
testSupabaseDetailed()
