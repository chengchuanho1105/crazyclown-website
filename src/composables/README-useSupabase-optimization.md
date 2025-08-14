# useSupabase 優化說明

## 問題分析

### 原始問題
- **全域初始化**：在 `main.ts` 中全域調用 `useSupabaseInit()`，導致所有頁面都會載入所有 Supabase 資料
- **效能問題**：即使不需要資料的頁面（如首頁、登入頁面）也會載入完整的資料庫資料
- **資源浪費**：不必要的網路請求和記憶體使用

### 解決方案
改為**按需載入**機制，只在需要特定資料的頁面才載入對應的資料。

## 優化內容

### 1. 移除全域初始化
```typescript
// 移除前 (main.ts)
import { useSupabaseInit } from './composables/useSupabase'
const { initializeData } = useSupabaseInit()
initializeData()

// 移除後 (main.ts)
// 移除全域初始化，改為按需載入
```

### 2. 添加快取機制
```typescript
// 資料是否已初始化
const initialized = ref({
  inventory: false,
  transactions: false,
  customers: false,
  products: false,
  categories: false,
  paymentMethods: false,
  bankData: false
})

// 在每個 fetch 函數中添加快取檢查
const fetchInventory = async () => {
  // 如果已經載入過，直接返回
  if (initialized.value.inventory && inventoryItems.value.length > 0) {
    return inventoryItems.value
  }
  // ... 載入邏輯
}
```

### 3. 改進錯誤處理
```typescript
try {
  const response = await InventoryService.getAllInventoryItems()
  
  if (response.error) {
    errors.value.inventory = response.error.message
    throw new Error(response.error.message)
  } else if (response.data) {
    inventoryItems.value = response.data
    initialized.value.inventory = true
  }
  
  return inventoryItems.value
} catch (error) {
  errors.value.inventory = error instanceof Error ? error.message : '載入庫存失敗'
  throw error
} finally {
  loading.value.inventory = false
}
```

### 4. 添加快取管理
```typescript
// 清除快取資料（用於登出或重新整理）
export function clearSupabaseCache() {
  // 清除資料
  inventoryItems.value = []
  transactions.value = []
  // ...
  
  // 重置初始化狀態
  Object.keys(initialized.value).forEach(key => {
    initialized.value[key as keyof typeof initialized.value] = false
  })
  
  // 清除錯誤狀態
  Object.keys(errors.value).forEach(key => {
    errors.value[key as keyof typeof errors.value] = null
  })
}
```

### 5. 全域載入狀態管理
```typescript
export function useSupabaseLoading() {
  const isLoading = computed(() => 
    Object.values(loading.value).some(loading => loading)
  )

  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )

  const getErrors = computed(() => 
    Object.entries(errors.value)
      .filter(([_, error]) => error !== null)
      .map(([key, error]) => ({ key, error }))
  )

  return {
    isLoading,
    hasErrors,
    getErrors,
    clearSupabaseCache
  }
}
```

## 使用方式

### 1. 按需載入
```typescript
// 在需要資料的頁面中
import { useInventory, useCustomers } from '@/composables/useSupabase'

export default {
  setup() {
    const { inventoryItems, loading, fetchInventory } = useInventory()
    const { customers, fetchCustomers } = useCustomers()

    onMounted(async () => {
      // 只在這個頁面載入需要的資料
      await Promise.all([
        fetchInventory(),
        fetchCustomers()
      ])
    })

    return {
      inventoryItems,
      customers,
      loading
    }
  }
}
```

### 2. 快取檢查
```typescript
// 檢查資料是否已載入
const { isInitialized } = useInventory()

// 如果資料已載入，不需要重新載入
if (!isInitialized.value) {
  await fetchInventory()
}
```

### 3. 錯誤處理
```typescript
try {
  await fetchInventory()
} catch (error) {
  console.error('載入庫存失敗:', error)
  // 處理錯誤
}
```

### 4. 清除快取
```typescript
import { clearSupabaseCache } from '@/composables/useSupabase'

// 在登出時清除快取
const handleLogout = () => {
  clearSupabaseCache()
  // 其他登出邏輯
}
```

## 效能提升

### 1. 網路請求優化
- **之前**：每個頁面都會發送 7 個 API 請求
- **現在**：只發送需要的 API 請求

### 2. 記憶體使用優化
- **之前**：所有資料都會載入到記憶體
- **現在**：只載入需要的資料

### 3. 載入時間優化
- **之前**：需要等待所有資料載入完成
- **現在**：只等待需要的資料載入完成

### 4. 快取機制
- 避免重複載入相同資料
- 提升頁面切換速度

## 受影響的頁面

### 需要 Supabase 資料的頁面
1. **管理員儀表板** (`/admin`) - 載入統計資料
2. **客戶管理** (`/admin/customers`) - 載入客戶和交易資料
3. **庫存管理** (`/admin/inventory`) - 載入庫存和商品資料

### 不需要 Supabase 資料的頁面
1. **首頁** (`/`) - 靜態內容
2. **登入頁面** (`/login`) - 認證功能
3. **關於頁面** (`/about`) - 靜態內容
4. **新聞頁面** (`/news`) - 靜態內容

## 注意事項

1. **資料一致性**：快取機制確保資料一致性，避免重複載入
2. **錯誤處理**：改進的錯誤處理機制，提供更好的用戶體驗
3. **記憶體管理**：提供清除快取功能，避免記憶體洩漏
4. **載入狀態**：提供全域載入狀態管理，方便 UI 顯示

## 未來改進

1. **自動重新整理**：可以添加定時重新整理機制
2. **離線支援**：可以添加離線快取機制
3. **資料同步**：可以添加即時資料同步機制
4. **效能監控**：可以添加效能監控和報告機制
