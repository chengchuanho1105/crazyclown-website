import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 檢查資料庫表格結構
async function checkTableStructure() {
  console.log('檢查資料庫表格結構...')

  try {
    // 檢查銀行資料表結構
    console.log('\n1. 檢查銀行資料表結構...')
    const { data: bankData, error: bankError } = await supabase
      .from('our_bank_data')
      .select('*')
      .limit(1)

    if (bankError) {
      console.error('銀行資料表錯誤:', bankError)
    } else {
      console.log('銀行資料表範例:', bankData?.[0])
    }

    // 檢查客戶表結構
    console.log('\n2. 檢查客戶表結構...')
    const { data: customerData, error: customerError } = await supabase
      .from('customer')
      .select('*')
      .limit(1)

    if (customerError) {
      console.error('客戶表錯誤:', customerError)
    } else {
      console.log('客戶表範例:', customerData?.[0])
    }

    // 檢查庫存項目表結構
    console.log('\n3. 檢查庫存項目表結構...')
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_item')
      .select('*')
      .limit(1)

    if (inventoryError) {
      console.error('庫存項目表錯誤:', inventoryError)
    } else {
      console.log('庫存項目表範例:', inventoryData?.[0])
    }

  } catch (error) {
    console.error('檢查表格結構時發生錯誤:', error)
  }
}

// 改進的 CSV 解析函數
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      // 使用正則表達式來正確分割 CSV
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
      const row = {}

      headers.forEach((header, index) => {
        let value = values[index] || ''
        // 移除引號
        value = value.replace(/^"|"$/g, '')
        row[header] = value
      })

      data.push(row)
    }
  }

  return data
}

// 讀取 CSV 檔案
function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  return parseCSV(content)
}

// 清理資料 - 修復版本
function cleanData(data, tableName) {
  return data.map(row => {
    const cleaned = {}

    Object.keys(row).forEach(key => {
      let value = row[key]

      // 處理空值
      if (value === '' || value === 'null' || value === 'NULL') {
        value = null
      }

      // 根據表格名稱和欄位名稱來決定處理方式
      if (tableName === 'our_bank_data') {
        // 銀行資料表
        if (key === 'bank_name' || key === 'bank_branche_name') {
          // 這些是文字欄位，保持原值
        } else if (key === 'bank_code' || key === 'account_number') {
          // 這些是數字欄位
          if (typeof value === 'string' && value !== '') {
            const cleanValue = value.replace(/,/g, '')
            if (!isNaN(cleanValue)) {
              value = parseInt(cleanValue)
            } else {
              value = null
            }
          }
        } else if (key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      } else if (tableName === 'customer') {
        // 客戶表
        if (key === 'nickname' || key === 'name' || key === 'id_number' || key === 'contact_method' ||
            key === 'contact_method_account' || key === 'contact_method_nickname' || key === 'address' ||
            key === 'pubg_nickname' || key === 'pubg_account_id') {
          // 這些是文字欄位，保持原值
        } else if (key === 'phone' || key === 'contact_method_id' || key === 'steam_id') {
          // 這些是數字欄位
          if (typeof value === 'string' && value !== '') {
            const cleanValue = value.replace(/^\+/, '').replace(/,/g, '')
            if (!isNaN(cleanValue)) {
              value = parseInt(cleanValue)
            } else {
              value = null
            }
          }
        } else if (key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      } else if (tableName === 'inventory_item') {
        // 庫存項目表
        if (key === 'cd_key' || key === 'purchase_store' || key === 'purchase_payment_method' ||
            key === 'purchase_order_number') {
          // 這些是文字欄位，保持原值
        } else if (key === 'purchase_amount_cny' || key === 'purchase_amount_twd' || key === 'suggested_price') {
          // 這些是數字欄位
          if (typeof value === 'string' && value !== '') {
            const cleanValue = value.replace(/,/g, '')
            if (!isNaN(cleanValue)) {
              value = parseFloat(cleanValue)
            } else {
              value = null
            }
          }
        } else if (key === 'purchase_time' || key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      } else if (tableName === 'transaction') {
        // 交易表
        if (key === 'our_payment_method' || key === 'our_bank_data' || key === 'customer_payment_method' ||
            key === 'customer_bank_code' || key === 'customer_bank_account' || key === 'customer_account_name') {
          // 這些是文字欄位，保持原值
        } else if (key === 'actual_price' || key === 'amount_received' || key === 'amount_difference') {
          // 這些是數字欄位
          if (typeof value === 'string' && value !== '') {
            const cleanValue = value.replace(/,/g, '')
            if (!isNaN(cleanValue)) {
              value = parseFloat(cleanValue)
            } else {
              value = null
            }
          }
        } else if (key === 'transactions_time' || key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      } else if (tableName === 'product') {
        // 商品表
        if (key === 'product_name' || key === 'series') {
          // 這些是文字欄位，保持原值
        } else if (key === 'in_game_price_gcoin' || key === 'in_game_price_usd') {
          // 這些是數字欄位
          if (typeof value === 'string' && value !== '') {
            const cleanValue = value.replace(/,/g, '')
            if (!isNaN(cleanValue)) {
              value = parseFloat(cleanValue)
            } else {
              value = null
            }
          }
        } else if (key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      } else if (tableName === 'product_category' || tableName === 'payment_method') {
        // 商品分類表和付款方式表
        if (key === 'category_name' || key === 'payment_method') {
          // 這些是文字欄位，保持原值
        } else if (key === 'created_at' || key === 'updated_at') {
          // 這些是時間戳欄位
          if (typeof value === 'string' && value.includes('+00')) {
            try {
              const timeStr = value.replace('+00', 'Z')
              const date = new Date(timeStr)
              if (!isNaN(date.getTime())) {
                value = date.toISOString()
              } else {
                value = new Date().toISOString()
              }
            } catch (e) {
              value = new Date().toISOString()
            }
          }
        }
      }

      // 處理布林值
      if (value === 'true') value = true
      if (value === 'false') value = false

      // 處理 UUID 欄位
      if (key === 'id' && typeof value === 'string' && value.length === 36) {
        // 保持 UUID 格式
      } else if (key === 'customer_id' || key === 'inventory_item_id' || key === 'product_id' || key === 'product_category_id') {
        // 這些應該是 UUID，如果不是有效的 UUID 則設為 null
        if (typeof value === 'string' && value.length !== 36) {
          value = null
        }
      }

      cleaned[key] = value
    })

    return cleaned
  })
}

// 清空資料庫
async function clearDatabase() {
  console.log('開始清空資料庫...')

  try {
    // 按照外鍵依賴的順序刪除資料
    const tables = [
      'transaction',      // 先刪除交易記錄（依賴庫存項目和客戶）
      'inventory_item',   // 再刪除庫存項目（依賴商品和分類）
      'customer',         // 刪除客戶
      'product',          // 刪除商品（依賴分類）
      'product_category', // 刪除商品分類
      'payment_method',   // 刪除付款方式
      'our_bank_data'     // 刪除銀行資料
    ]

    for (const table of tables) {
      console.log(`清空 ${table} 表...`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // 刪除所有記錄

      if (error) {
        console.error(`清空 ${table} 表錯誤:`, error)
      } else {
        console.log(`✅ ${table} 表清空成功`)
      }
    }

    console.log('🎉 資料庫清空完成！')
  } catch (error) {
    console.error('清空資料庫時發生錯誤:', error)
  }
}

// 匯入資料
async function importData() {
  console.log('開始匯入資料到 Supabase...')

  try {
    // 1. 匯入商品分類
    console.log('\n1. 匯入商品分類...')
    const categoryData = readCSV('./supabase-data/product_category_rows.csv')
    console.log(`讀取到 ${categoryData.length} 筆商品分類資料`)

    if (categoryData.length > 0) {
      const cleanedData = cleanData(categoryData, 'product_category')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('product_category')
        .insert(cleanedData)

      if (error) {
        console.error('商品分類匯入錯誤:', error)
      } else {
        console.log('✅ 商品分類匯入成功')
      }
    }

    // 2. 匯入商品
    console.log('\n2. 匯入商品...')
    const productData = readCSV('./supabase-data/product_rows.csv')
    console.log(`讀取到 ${productData.length} 筆商品資料`)

    if (productData.length > 0) {
      const cleanedData = cleanData(productData, 'product')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('product')
        .insert(cleanedData)

      if (error) {
        console.error('商品匯入錯誤:', error)
      } else {
        console.log('✅ 商品匯入成功')
      }
    }

    // 3. 匯入付款方式
    console.log('\n3. 匯入付款方式...')
    const paymentData = readCSV('./supabase-data/payment_method_rows.csv')
    console.log(`讀取到 ${paymentData.length} 筆付款方式資料`)

    if (paymentData.length > 0) {
      const cleanedData = cleanData(paymentData, 'payment_method')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('payment_method')
        .insert(cleanedData)

      if (error) {
        console.error('付款方式匯入錯誤:', error)
      } else {
        console.log('✅ 付款方式匯入成功')
      }
    }

    // 4. 匯入銀行資料
    console.log('\n4. 匯入銀行資料...')
    const bankData = readCSV('./supabase-data/our_bank_data_rows.csv')
    console.log(`讀取到 ${bankData.length} 筆銀行資料`)

    if (bankData.length > 0) {
      const cleanedData = cleanData(bankData, 'our_bank_data')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('our_bank_data')
        .insert(cleanedData)

      if (error) {
        console.error('銀行資料匯入錯誤:', error)
      } else {
        console.log('✅ 銀行資料匯入成功')
      }
    }

    // 5. 匯入客戶資料
    console.log('\n5. 匯入客戶資料...')
    const customerData = readCSV('./supabase-data/customer_rows.csv')
    console.log(`讀取到 ${customerData.length} 筆客戶資料`)

    if (customerData.length > 0) {
      const cleanedData = cleanData(customerData, 'customer')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('customer')
        .insert(cleanedData)

      if (error) {
        console.error('客戶資料匯入錯誤:', error)
      } else {
        console.log('✅ 客戶資料匯入成功')
      }
    }

    // 6. 匯入庫存項目
    console.log('\n6. 匯入庫存項目...')
    const inventoryData = readCSV('./supabase-data/inventory_item_rows.csv')
    console.log(`讀取到 ${inventoryData.length} 筆庫存資料`)

    if (inventoryData.length > 0) {
      const cleanedData = cleanData(inventoryData, 'inventory_item')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('inventory_item')
        .insert(cleanedData)

      if (error) {
        console.error('庫存項目匯入錯誤:', error)
      } else {
        console.log('✅ 庫存項目匯入成功')
      }
    }

    // 7. 匯入交易記錄
    console.log('\n7. 匯入交易記錄...')
    const transactionData = readCSV('./supabase-data/transaction_rows.csv')
    console.log(`讀取到 ${transactionData.length} 筆交易資料`)

    if (transactionData.length > 0) {
      const cleanedData = cleanData(transactionData, 'transaction')
      console.log('清理後的資料範例:', cleanedData[0])

      const { data, error } = await supabase
        .from('transaction')
        .insert(cleanedData)

      if (error) {
        console.error('交易記錄匯入錯誤:', error)
      } else {
        console.log('✅ 交易記錄匯入成功')
      }
    }

    console.log('\n🎉 所有資料匯入完成！')

  } catch (error) {
    console.error('匯入過程中發生錯誤:', error)
  }
}

// 測試資料關聯
async function testDataRelations() {
  console.log('\n開始測試資料關聯...')

  try {
    // 測試已售商品的交易關聯
    console.log('\n1. 測試已售商品的交易關聯...')
    const { data: soldItems, error: soldItemsError } = await supabase
      .from('inventory_item')
      .select('*')
      .eq('status', '已售')
      .limit(5)

    if (soldItemsError) {
      console.error('已售項目查詢錯誤:', soldItemsError)
    } else {
      console.log('已售項目數量:', soldItems?.length || 0)

      if (soldItems && soldItems.length > 0) {
        for (const item of soldItems) {
          console.log(`\n測試庫存項目: ${item.id} - ${item.cd_key}`)

          const { data: transaction, error: transactionError } = await supabase
            .from('transaction')
            .select('*')
            .eq('inventory_item_id', item.id)
            .single()

          if (transactionError) {
            console.log(`❌ 沒有找到交易記錄: ${transactionError.message}`)
          } else {
            console.log(`✅ 找到交易記錄: ${transaction.id}`)

            if (transaction.customer_id) {
              const { data: customer, error: customerError } = await supabase
                .from('customer')
                .select('*')
                .eq('id', transaction.customer_id)
                .single()

              if (customerError) {
                console.log(`❌ 沒有找到客戶: ${customerError.message}`)
              } else {
                console.log(`✅ 找到客戶: ${customer.name || customer.nickname}`)
              }
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

// 修復資料庫表格結構
async function fixTableStructure() {
  console.log('修復資料庫表格結構...')

  try {
    // 注意：在 Supabase 中，我們無法直接修改表格結構
    // 我們需要手動在 Supabase 控制台中修改表格結構
    // 或者重新創建表格

    console.log('請在 Supabase 控制台中執行以下 SQL 命令來修復表格結構：')
    console.log('')
    console.log('-- 修復銀行資料表')
    console.log('ALTER TABLE our_bank_data ALTER COLUMN bank_name TYPE text;')
    console.log('ALTER TABLE our_bank_data ALTER COLUMN bank_branche_name TYPE text;')
    console.log('')
    console.log('-- 修復客戶表')
    console.log('ALTER TABLE customer ALTER COLUMN nickname TYPE text;')
    console.log('')
    console.log('-- 修復庫存項目表')
    console.log('ALTER TABLE inventory_item ALTER COLUMN purchase_store TYPE text;')
    console.log('ALTER TABLE inventory_item ALTER COLUMN purchase_payment_method TYPE text;')
    console.log('ALTER TABLE inventory_item ALTER COLUMN purchase_order_number TYPE text;')
    console.log('')
    console.log('-- 修復交易表')
    console.log('ALTER TABLE transaction ALTER COLUMN our_payment_method TYPE text;')
    console.log('ALTER TABLE transaction ALTER COLUMN our_bank_data TYPE text;')
    console.log('ALTER TABLE transaction ALTER COLUMN customer_payment_method TYPE text;')
    console.log('ALTER TABLE transaction ALTER COLUMN customer_bank_code TYPE text;')
    console.log('ALTER TABLE transaction ALTER COLUMN customer_bank_account TYPE text;')
    console.log('ALTER TABLE transaction ALTER COLUMN customer_account_name TYPE text;')
    console.log('')

    // 等待用戶確認
    console.log('請在 Supabase 控制台中執行上述 SQL 命令，然後按 Enter 繼續...')

  } catch (error) {
    console.error('修復表格結構時發生錯誤:', error)
  }
}

// 執行清空和匯入
async function main() {
  console.log('開始修復資料庫...')
  console.log('')
  console.log('請先在 Supabase 控制台中執行 fix-database-structure.sql 中的 SQL 命令')
  console.log('然後按 Enter 繼續...')

  // 等待用戶確認
  await new Promise(resolve => {
    process.stdin.once('data', () => {
      resolve()
    })
  })

  await clearDatabase()
  await importData()
  await testDataRelations()
}

main()
