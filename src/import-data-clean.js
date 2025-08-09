import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// 清理資料
function cleanData(data, tableName) {
  return data.map(row => {
    const cleaned = {}

    Object.keys(row).forEach(key => {
      let value = row[key]

      // 處理空值
      if (value === '' || value === 'null' || value === 'NULL') {
        value = null
      }

      // 處理時間戳格式 - 只處理真正的時間戳欄位
      if (typeof value === 'string' && value.includes('+00') &&
          (key === 'created_at' || key === 'updated_at' || key === 'purchase_time' || key === 'transactions_time') &&
          !key.includes('name') && !key.includes('nickname') && !key.includes('method') && !key.includes('bank')) {
        try {
          // 移除時區標記並轉換為 ISO 格式
          const timeStr = value.replace('+00', 'Z')
          const date = new Date(timeStr)
          if (!isNaN(date.getTime())) {
            value = date.toISOString()
          } else {
            value = new Date().toISOString() // 如果解析失敗，使用當前時間
          }
        } catch (e) {
          value = new Date().toISOString() // 如果解析失敗，使用當前時間
        }
      }

      // 處理數字欄位
      if (typeof value === 'string' && value !== '' && !value.includes('+00')) {
        // 檢查是否為數字欄位
        const numericFields = ['in_game_price_gcoin', 'in_game_price_usd', 'purchase_amount_cny', 'purchase_amount_twd', 'suggested_price', 'actual_price', 'amount_received', 'amount_difference', 'bank_code', 'account_number', 'contact_method_id', 'steam_id']
        const integerFields = ['bank_code', 'account_number', 'contact_method_id', 'steam_id']
        const decimalFields = ['in_game_price_gcoin', 'in_game_price_usd', 'purchase_amount_cny', 'purchase_amount_twd', 'suggested_price', 'actual_price', 'amount_received', 'amount_difference']

        if (numericFields.includes(key)) {
          // 移除逗號並轉換為數字
          const cleanValue = value.replace(/,/g, '')
          if (!isNaN(cleanValue)) {
            if (integerFields.includes(key)) {
              value = parseInt(cleanValue)
            } else if (decimalFields.includes(key)) {
              value = parseFloat(cleanValue)
            } else {
              value = parseFloat(cleanValue)
            }
          } else {
            // 如果無法轉換為數字，設為 null
            value = null
          }
        }
      }

      // 處理布林值
      if (value === 'true') value = true
      if (value === 'false') value = false

      // 處理電話號碼格式
      if (key === 'phone' && typeof value === 'string' && value !== '') {
        // 移除 + 號並轉換為數字
        const cleanPhone = value.replace(/^\+/, '')
        if (!isNaN(cleanPhone)) {
          value = parseInt(cleanPhone)
        } else {
          value = null
        }
      }

      // 處理 UUID 欄位
      if (key === 'id' && typeof value === 'string' && value.length === 36) {
        // 保持 UUID 格式
      } else if (key === 'customer_id' || key === 'inventory_item_id') {
        // 這些應該是 UUID，如果不是有效的 UUID 則設為 null
        if (typeof value === 'string' && value.length !== 36) {
          value = null
        }
      }

      // 處理特殊欄位
      if (key === 'bank_name' && typeof value === 'string' && value.includes('支付')) {
        // 這不是時間戳，保持原值
      } else if (key === 'name' && typeof value === 'string' && value.includes('拾柒')) {
        // 這不是時間戳，保持原值
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

// 執行清空和匯入
async function main() {
  await clearDatabase()
  await importData()
}

main()
