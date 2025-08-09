import { createClient } from '@supabase/supabase-js'

// Supabase 配置 - 使用服務角色金鑰（如果有的話）
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 測試管理員權限匯入
async function testAdminImport() {
  console.log('開始管理員權限測試...')

  try {
    // 測試 1: 檢查認證狀態
    console.log('\n1. 檢查認證狀態...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.log('認證錯誤:', authError.message)
      console.log('嘗試匿名訪問...')
    } else {
      console.log('當前用戶:', user ? '已登入' : '匿名用戶')
    }

    // 測試 2: 嘗試插入測試資料
    console.log('\n2. 嘗試插入測試資料...')

    const testData = {
      id: 'ADMIN_TEST_001',
      category_name: '管理員測試分類',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('product_category')
      .insert([testData])
      .select()

    if (error) {
      console.log('插入錯誤:', error.message)
      console.log('錯誤代碼:', error.code)
      console.log('錯誤詳情:', error.details)
      console.log('錯誤提示:', error.hint)

      // 如果是 RLS 錯誤，提供解決方案
      if (error.code === '42501') {
        console.log('\n💡 解決方案:')
        console.log('1. 在 Supabase Dashboard 中檢查 RLS 政策')
        console.log('2. 暫時禁用 RLS 政策進行資料匯入')
        console.log('3. 使用服務角色金鑰 (service_role key)')
        console.log('4. 創建適當的 RLS 政策允許插入')
      }
    } else {
      console.log('✅ 插入成功:', data)
    }

    // 測試 3: 檢查現有資料
    console.log('\n3. 檢查現有資料...')
    const { data: existingData, error: selectError } = await supabase
      .from('product_category')
      .select('*')

    if (selectError) {
      console.log('查詢錯誤:', selectError.message)
    } else {
      console.log(`現有資料數量: ${existingData?.length || 0}`)
      if (existingData && existingData.length > 0) {
        console.log('範例資料:', existingData[0])
      }
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

// 執行測試
testAdminImport()
