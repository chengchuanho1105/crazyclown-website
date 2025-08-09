# Supabase 整合說明

## 📋 概述

本專案已成功整合 Supabase 作為後端資料庫，提供完整的庫存管理、交易記錄、客戶管理等功能。

## 🗄️ 資料庫結構

### 主要表格

1. **`inventory_items`** - 庫存商品
   - 包含商品狀態、CD Key、進貨資訊、建議售價等
   - 狀態：未售、已售、自用、福利、被盜、淘退、補償

2. **`transactions`** - 交易記錄
   - 記錄所有銷貨交易
   - 包含客戶資訊、付款方式、銀行資料等

3. **`customers`** - 客戶資料
   - 客戶基本資訊、聯絡方式、遊戲帳號等

4. **`products`** - 商品定義
   - 商品名稱、系列、遊戲內價格等

5. **`product_categories`** - 商品分類
   - G-Coin、Survivor Pass、Package、Tool

6. **`payment_methods`** - 付款方式
   - 銀行轉帳、電支轉帳、實體刷卡、無卡轉帳

7. **`our_bank_data`** - 我方銀行資料
   - 各種銀行帳戶資訊

## 🛠️ 技術架構

### 檔案結構

```
src/
├── config/
│   └── supabase.ts          # Supabase 配置和類型定義
├── services/
│   └── supabaseService.ts   # 資料庫服務層
├── composables/
│   └── useSupabase.ts       # Vue Composables
└── pages/admin/
    ├── index.vue            # 更新後的儀表板
    ├── inventory.vue        # 庫存管理（部分更新）
    └── supabase-test.vue    # 測試頁面
```

### 核心功能

1. **配置管理** (`src/config/supabase.ts`)
   - Supabase 客戶端初始化
   - TypeScript 類型定義
   - 表格名稱常數

2. **服務層** (`src/services/supabaseService.ts`)
   - 完整的 CRUD 操作
   - 錯誤處理
   - 統計資料計算

3. **Composables** (`src/composables/useSupabase.ts`)
   - 響應式資料管理
   - 載入狀態處理
   - 全域狀態管理

## 🚀 使用方法

### 1. 在 Vue 組件中使用

```vue
<script setup lang="ts">
import { useInventory, useStatistics } from '@/composables/useSupabase'

// 使用庫存管理
const { 
  inventoryItems, 
  loading, 
  fetchInventory,
  createInventoryItem 
} = useInventory()

// 使用統計資料
const { 
  inventoryStats, 
  revenueStats,
  fetchInventoryStatistics 
} = useStatistics()

// 載入資料
onMounted(async () => {
  await fetchInventory()
  await fetchInventoryStatistics()
})
</script>
```

### 2. 可用的 Composables

- `useInventory()` - 庫存管理
- `useTransactions()` - 交易記錄
- `useCustomers()` - 客戶管理
- `useProducts()` - 商品管理
- `useProductCategories()` - 商品分類
- `usePaymentMethods()` - 付款方式
- `useBankData()` - 銀行資料
- `useStatistics()` - 統計資料

### 3. 測試頁面

訪問 `/admin/supabase-test` 來測試 Supabase 整合是否正常工作。

## 📊 功能特色

### ✅ 已完成

1. **完整的資料庫整合**
   - 所有表格的 CRUD 操作
   - 類型安全的 TypeScript 支援
   - 錯誤處理和載入狀態

2. **響應式資料管理**
   - 即時資料更新
   - 全域狀態管理
   - 載入狀態指示

3. **統計功能**
   - 庫存統計
   - 營收統計
   - 即時計算

4. **更新後的儀表板**
   - 使用真實 Supabase 資料
   - 即時統計顯示
   - 最近活動記錄

### 🔄 進行中

1. **庫存管理頁面**
   - 需要完全重構以適配 Supabase 資料結構
   - 保持現有 UI/UX 設計

### 📋 待完成

1. **完整的管理功能**
   - 新增/編輯/刪除庫存項目
   - 交易記錄管理
   - 客戶管理
   - 報表生成

2. **進階功能**
   - 即時通知
   - 資料匯出
   - 權限管理
   - 審計日誌

## 🔧 配置

### 環境變數

Supabase 配置已硬編碼在 `src/config/supabase.ts` 中：

```typescript
const supabaseUrl = 'https://eikrqunzxniunnprxlji.supabase.co'
const supabaseAnonKey = 'your-anon-key'
```

### 權限設定

確保 Supabase 專案中已設定適當的 RLS (Row Level Security) 政策。

## 🐛 故障排除

### 常見問題

1. **連接失敗**
   - 檢查 Supabase URL 和 API Key
   - 確認網路連接
   - 檢查瀏覽器控制台錯誤

2. **資料載入失敗**
   - 檢查 RLS 政策
   - 確認表格權限
   - 查看 Supabase 日誌

3. **類型錯誤**
   - 確認 TypeScript 類型定義
   - 檢查資料庫結構是否與類型定義匹配

### 除錯工具

1. **瀏覽器開發者工具**
   - 查看網路請求
   - 檢查控制台錯誤

2. **Supabase Dashboard**
   - 查看資料庫日誌
   - 檢查 RLS 政策
   - 測試 SQL 查詢

## 📈 效能優化

1. **資料快取**
   - 使用 Vue 的響應式系統
   - 避免重複請求

2. **分頁載入**
   - 大量資料使用分頁
   - 實作虛擬滾動

3. **即時更新**
   - 使用 Supabase Realtime
   - WebSocket 連接

## 🔒 安全性

1. **API Key 保護**
   - 使用環境變數
   - 限制 API Key 權限

2. **資料驗證**
   - 前端和後端驗證
   - 輸入清理

3. **權限控制**
   - RLS 政策
   - 角色基礎存取控制

## 📞 支援

如有問題，請檢查：

1. Supabase 專案設定
2. 網路連接
3. 瀏覽器控制台錯誤
4. 本文件的故障排除部分 