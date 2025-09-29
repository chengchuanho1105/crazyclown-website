# 私人記帳簿模板

這是一個功能完整的私人記帳簿應用模板，基於 Vue 3 + TypeScript 開發。

## 🚀 功能特色

### 核心功能
- **多帳戶管理** - 支援現金、銀行、信用卡、投資、債務等不同類型帳戶
- **收支記錄** - 完整的收入、支出、轉帳記錄功能
- **預算管理** - 月度/年度預算設定與追蹤
- **投資追蹤** - 股票投資組合管理與損益計算
- **債務管理** - 貸款記錄與還款計劃追蹤
- **報表分析** - 財務數據視覺化與分析

### 技術特色
- **響應式設計** - 支援手機、平板、桌面設備
- **模組化架構** - 易於擴展和維護
- **型別安全** - 完整的 TypeScript 支援
- **本地存儲** - 數據安全存儲在本地

## 📁 檔案結構

```
src/pages/accounting-book/
├── index.vue                 # 主要記帳簿頁面
├── types.ts                  # 資料型別定義
├── composables/
│   └── useAccountingData.ts # 資料管理 composables
├── components/
│   ├── TransactionForm.vue  # 交易表單組件
│   ├── AccountCard.vue      # 帳戶卡片組件
│   ├── InvestmentTracker.vue # 投資追蹤組件
│   └── DebtManager.vue      # 債務管理組件
├── 需求                      # 需求規格文檔
└── README.md                # 說明文檔
```

## 🛠️ 使用方式

### 1. 基本設定
```typescript
// 在 main.ts 中引入
import AccountingBook from './pages/accounting-book/index.vue'
```

### 2. 路由設定
```typescript
// 在 router/index.ts 中添加路由
{
  path: '/accounting-book',
  name: 'AccountingBook',
  component: () => import('../pages/accounting-book/index.vue')
}
```

### 3. 資料管理
```typescript
// 使用 composables 管理資料
import { useAccounts, useTransactions } from './composables/useAccountingData'

const { accounts, addAccount } = useAccounts()
const { transactions, addTransaction } = useTransactions()
```

## 📊 資料結構

### 帳戶 (Account)
```typescript
interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'credit' | 'investment' | 'debt'
  balance: number
  currency: string
  description?: string
}
```

### 交易 (Transaction)
```typescript
interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  category: string
  accountId: string
  targetAccountId?: string
  date: Date
}
```

### 投資 (Investment)
```typescript
interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  averageCost: number
  currentPrice: number
  totalValue: number
  unrealizedGainLoss: number
}
```

### 債務 (Debt)
```typescript
interface Debt {
  id: string
  name: string
  principal: number
  interestRate: number
  term: number
  monthlyPayment: number
  remainingBalance: number
}
```

## 🎨 自訂樣式

### 主要顏色
- 主色調: `#3498db`
- 成功色: `#27ae60`
- 警告色: `#f39c12`
- 錯誤色: `#e74c3c`

### 響應式斷點
- 手機: `< 768px`
- 平板: `768px - 1024px`
- 桌面: `> 1024px`

## 🔧 擴展功能

### 1. 新增交易類型
```typescript
// 在 types.ts 中擴展
type TransactionType = 'income' | 'expense' | 'transfer' | 'your_new_type'
```

### 2. 新增帳戶類型
```typescript
// 在 types.ts 中擴展
type AccountType = 'cash' | 'bank' | 'credit' | 'investment' | 'debt' | 'your_new_type'
```

### 3. 自訂報表
```typescript
// 在 composables 中新增報表函數
export const useCustomReport = () => {
  // 自訂報表邏輯
}
```

## 📱 行動裝置優化

- 觸控友好的介面設計
- 手勢操作支援
- 離線使用能力
- 快速載入優化

## 🔒 資料安全

- 本地資料存儲
- 資料加密保護
- 隱私權保護
- 備份與還原功能

## 🚀 部署建議

### 1. 靜態部署
- 適合個人使用
- 無需伺服器
- 資料存儲在瀏覽器

### 2. 雲端部署
- 支援多設備同步
- 資料備份
- 協作功能

## 📈 未來擴展

- [ ] 多幣別支援
- [ ] 資料匯入/匯出
- [ ] 圖表視覺化
- [ ] 行動應用
- [ ] 雲端同步
- [ ] 協作功能

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發送 Pull Request

## 📄 授權

MIT License - 詳見 LICENSE 檔案

---

**注意**: 這是一個模板專案，請根據您的需求進行客製化調整。
