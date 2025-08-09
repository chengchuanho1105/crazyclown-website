import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Supabase 配置
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpa3JxdW56eG5pdW5ucHJ4bGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTc3MDIsImV4cCI6MjA2OTk3MzcwMn0.tvzC1AEZc5fuakDom7izip0bIKYjHyzJIJNx1rhf3V8'

// 建立 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 簡化的 CSV 解析函數
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
      const row = {}

      headers.forEach((header, index) => {
        let value = values[index] || ''
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

      // 處理時間戳格式
      if (typeof value === 'string' && value.includes('+00') &&
          (key === 'created_at' || key === 'updated_at' || key === 'purchase_time' || key === 'transactions_time')) {
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

      // 處理數字欄位
      if (typeof value === 'string' && value !== '' && !value.includes('+00')) {
        const numericFields = {
          'purchase_amount_cny': 'decimal',
          'purchase_amount_twd': 'decimal',
          'suggested_price': 'decimal',
          'actual_price': 'decimal',
          'amount_received': 'decimal',
          'amount_difference': 'decimal',
          'bank_code': 'integer',
          'account_number': 'integer',
          'contact_method_id': 'integer',
          'steam_id': 'integer',
          'phone': 'integer'
        }

        if (numericFields[key]) {
          const cleanValue = value.replace(/,/g, '').replace(/^\+/, '')
          if (!isNaN(cleanValue) && cleanValue !== '') {
            if (numericFields[key] === 'integer') {
              value = parseInt(cleanValue)
            } else {
              value = parseFloat(cleanValue)
            }
          } else {
            value = null
          }
        }
      }

      // 處理布林值
      if (value === 'true') value = true
      if (value === 'false') value = false

      cleaned[key] = value
    })

    return cleaned
  })
}

// 清空特定表格
async function clearTable(tableName) {
  console.log(`清空 ${tableName} 表...`)
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')

  if (error) {
    console.error(`清空 ${tableName} 表錯誤:`, error)
  } else {
    console.log(`✅ ${tableName} 表清空成功`)
  }
}

// 匯入資料
async function importData() {
  console.log('開始匯入資料到 Supabase...')

  try {
    // 1. 匯入銀行資料
    console.log('\n1. 匯入銀行資料...')
    const bankData = readCSV('./supabase-data/our_bank_data_rows.csv')
    console.log(`讀取到 ${bankData.length} 筆銀行資料`)

    if (bankData.length > 0) {
      const cleanedData = cleanData(bankData, 'our_bank_data')
      const { data, error } = await supabase
        .from('our_bank_data')
        .insert(cleanedData)

      if (error) {
        console.error('銀行資料匯入錯誤:', error)
      } else {
        console.log('✅ 銀行資料匯入成功')
      }
    }

    // 2. 匯入客戶資料
    console.log('\n2. 匯入客戶資料...')
    const customerData = readCSV('./supabase-data/customer_rows.csv')
    console.log(`讀取到 ${customerData.length} 筆客戶資料`)

    if (customerData.length > 0) {
      const cleanedData = cleanData(customerData, 'customer')
      const { data, error } = await supabase
        .from('customer')
        .insert(cleanedData)

      if (error) {
        console.error('客戶資料匯入錯誤:', error)
      } else {
        console.log('✅ 客戶資料匯入成功')
      }
    }

    // 3. 匯入庫存項目
    console.log('\n3. 匯入庫存項目...')
    const inventoryData = readCSV('./supabase-data/inventory_item_rows.csv')
    console.log(`讀取到 ${inventoryData.length} 筆庫存資料`)

    if (inventoryData.length > 0) {
      const cleanedData = cleanData(inventoryData, 'inventory_item')
      const { data, error } = await supabase
        .from('inventory_item')
        .insert(cleanedData)

      if (error) {
        console.error('庫存項目匯入錯誤:', error)
      } else {
        console.log('✅ 庫存項目匯入成功')
      }
    }

    console.log('\n🎉 資料匯入完成！')

  } catch (error) {
    console.error('匯入過程中發生錯誤:', error)
  }
}

// 測試資料
async function testData() {
  console.log('\n開始測試資料...')

  try {
    // 檢查庫存項目數量
    const { count: inventoryCount, error: inventoryError } = await supabase
      .from('inventory_item')
      .select('*', { count: 'exact', head: true })

    if (inventoryError) {
      console.error('庫存項目查詢錯誤:', inventoryError)
    } else {
      console.log(`庫存項目數量: ${inventoryCount}`)
    }

    // 檢查已售商品
    const { data: soldItems, error: soldItemsError } = await supabase
      .from('inventory_item')
      .select('*')
      .eq('status', '已售')
      .limit(5)

    if (soldItemsError) {
      console.error('已售商品查詢錯誤:', soldItemsError)
    } else {
      console.log(`已售商品數量: ${soldItems?.length || 0}`)

      if (soldItems && soldItems.length > 0) {
        console.log('已售商品範例:', soldItems[0])
      }
    }

  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
  }
}

// 主函數
async function main() {
  console.log('開始修復庫存資料...')

  // 清空需要重新導入的表格
  await clearTable('inventory_item')
  await clearTable('customer')
  await clearTable('our_bank_data')

  // 匯入資料
  await importData()

  // 測試資料
  await testData()
}

main()
