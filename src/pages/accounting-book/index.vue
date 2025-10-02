<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccounts, useTransactions, useInvestments, useDebts, useBudgets } from './composables/useAccountingData'
import DetailedTransactionForm from './components/DetailedTransactionForm.vue'
import type { Transaction } from './types'

defineOptions({ name: 'AccountingBookPage' })

// 使用 composables
const { accounts, getTotalBalance } = useAccounts()
const { transactions, addTransaction } = useTransactions()
const { investments, getTotalInvestmentValue, getTotalUnrealizedGainLoss } = useInvestments()
const { debts, getTotalDebt, getTotalMonthlyPayment } = useDebts()
const { budgets, getBudgetStatus, getTotalBudget, getTotalSpent, getTotalRemaining } = useBudgets()

// 狀態管理
const activeTab = ref('dashboard')
const showAddTransaction = ref(false)
const showAddAccount = ref(false)
const showAddInvestment = ref(false)
const showAddDebt = ref(false)
const showAddBudget = ref(false)
const reportPeriod = ref('month')

// 新增交易表單 (已移至 DetailedTransactionForm 組件中)

// 新增帳戶表單
const newAccount = ref({
  name: '',
  type: 'cash' as 'cash' | 'bank' | 'credit' | 'investment' | 'debt',
  balance: 0,
  currency: 'TWD',
  description: ''
})

// 計算總資產
const totalAssets = computed(() => {
  return getTotalBalance.value + getTotalInvestmentValue.value
})

// 計算淨資產
const netWorth = computed(() => {
  return totalAssets.value - getTotalDebt.value
})

// 提交新交易
const submitTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  addTransaction(transaction)
  showAddTransaction.value = false
}

// 提交新帳戶
const submitAccount = () => {
  if (newAccount.value.name && newAccount.value.type) {
    const { addAccount } = useAccounts()
    addAccount({
      ...newAccount.value,
      balance: newAccount.value.balance
    })

    // 重置表單
    newAccount.value = {
      name: '',
      type: 'cash',
      balance: 0,
      currency: 'TWD',
      description: ''
    }
    showAddAccount.value = false
  }
}

// 格式化金額
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount)
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

// 計算函數
const getMonthlyIncome = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return transactions.value
    .filter(t => t.type === 'income' && t.date >= startOfMonth && t.date <= endOfMonth)
    .reduce((total, t) => total + t.totalAmount, 0)
})

const getMonthlyExpense = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return transactions.value
    .filter(t => t.type === 'expense' && t.date >= startOfMonth && t.date <= endOfMonth)
    .reduce((total, t) => total + t.totalAmount, 0)
})

const getInvestmentReturnRate = computed(() => {
  if (getTotalInvestmentValue.value === 0) return 0
  return (getTotalUnrealizedGainLoss.value / getTotalInvestmentValue.value) * 100
})

const getDebtRatio = computed(() => {
  if (getTotalBalance.value === 0) return 0
  return (getTotalDebt.value / getTotalBalance.value) * 100
})

const getRemainingMonths = (debt: { endDate: Date; term: number }) => {
  const now = new Date()
  const endDate = new Date(debt.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  return Math.max(0, diffMonths)
}

const getDebtProgress = (debt: { endDate: Date; term: number }) => {
  const totalMonths = debt.term
  const remainingMonths = getRemainingMonths(debt)
  return ((totalMonths - remainingMonths) / totalMonths) * 100
}
</script>

<template>
  <div class="accounting-book">
    <!-- 標題列 -->
    <div class="header">
      <h1 class="title">💰 私人記帳簿</h1>
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-label">總資產</div>
          <div class="stat-value positive">{{ formatCurrency(totalAssets) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">負債</div>
          <div class="stat-value negative">{{ formatCurrency(getTotalDebt) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">淨資產</div>
          <div class="stat-value" :class="netWorth >= 0 ? 'positive' : 'negative'">
            {{ formatCurrency(netWorth) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 導航標籤 -->
    <div class="tabs">
      <button
        v-for="tab in ['dashboard', 'accounts', 'transactions', 'investments', 'debts', 'budgets', 'reports']"
        :key="tab"
        :class="['tab-button', { active: activeTab === tab }]"
        @click="activeTab = tab"
      >
        {{
          tab === 'dashboard' ? '儀表板' :
          tab === 'accounts' ? '帳戶' :
          tab === 'transactions' ? '交易' :
          tab === 'investments' ? '投資' :
          tab === 'debts' ? '債務' :
          tab === 'budgets' ? '預算' :
          tab === 'reports' ? '報表' : tab
        }}
      </button>
    </div>

    <!-- 主要內容區域 -->
    <div class="main-content">
      <!-- 儀表板 -->
      <div v-if="activeTab === 'dashboard'" class="dashboard">
        <div class="dashboard-grid">
          <div class="card">
            <h3>最近交易</h3>
            <div class="transaction-list">
              <div v-for="transaction in transactions.slice(-5)" :key="transaction.id" class="transaction-item">
                <div class="transaction-info">
                  <span class="transaction-type" :class="transaction.type">
                    {{ transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '轉帳' }}
                  </span>
                  <span v-if="transaction.items.length > 0" class="transaction-items">
                    {{ transaction.items[0].itemName }}{{ transaction.items.length > 1 ? ' 等' : '' }}
                  </span>
                  <span v-else class="transaction-description">{{ transaction.notes || '無描述' }}</span>
                </div>
                <div class="transaction-amount" :class="transaction.type">
                  {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.totalAmount) }}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>帳戶餘額</h3>
            <div class="account-list">
              <div v-for="account in accounts" :key="account.id" class="account-item">
                <div class="account-name">{{ account.name }}</div>
                <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>投資組合</h3>
            <div class="investment-summary">
              <div class="investment-total">
                總價值: {{ formatCurrency(getTotalInvestmentValue) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 帳戶管理 -->
      <div v-if="activeTab === 'accounts'" class="accounts">
        <div class="section-header">
          <h2>帳戶管理</h2>
          <button class="btn btn-primary" @click="showAddAccount = true">新增帳戶</button>
        </div>

        <div class="account-grid">
          <div v-for="account in accounts" :key="account.id" class="account-card">
            <div class="account-header">
              <h3>{{ account.name }}</h3>
              <span class="account-type">{{
                account.type === 'cash' ? '現金' :
                account.type === 'bank' ? '銀行' :
                account.type === 'credit' ? '信用卡' :
                account.type === 'investment' ? '投資' :
                account.type === 'debt' ? '債務' : account.type
              }}</span>
            </div>
            <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
            <div class="account-description">{{ account.description }}</div>
          </div>
        </div>
      </div>

      <!-- 交易記錄 -->
      <div v-if="activeTab === 'transactions'" class="transactions">
        <div class="section-header">
          <h2>交易記錄</h2>
          <button class="btn btn-primary" @click="showAddTransaction = true">新增交易</button>
        </div>

        <div class="transaction-list">
          <div v-for="transaction in transactions" :key="transaction.id" class="transaction-item">
            <div class="transaction-date">
              <div>{{ formatDate(transaction.date) }}</div>
              <div class="transaction-time">{{ transaction.time }}</div>
            </div>
            <div class="transaction-info">
              <div class="transaction-type" :class="transaction.type">
                {{ transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '轉帳' }}
              </div>
              <div v-if="transaction.items.length > 0" class="transaction-items">
                <div v-for="item in transaction.items" :key="item.id" class="transaction-item-detail">
                  {{ item.lineNumber }}. {{ item.itemName }} - {{ formatCurrency(item.subtotal) }}
                </div>
              </div>
              <div v-if="transaction.paymentMethod" class="transaction-payment">
                付款方式: {{ transaction.paymentMethod }}
              </div>
              <div v-if="transaction.invoiceNumber" class="transaction-invoice">
                發票號碼: {{ transaction.invoiceNumber }}
              </div>
              <div v-if="transaction.notes" class="transaction-notes">
                {{ transaction.notes }}
              </div>
            </div>
            <div class="transaction-amount" :class="transaction.type">
              {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.totalAmount) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 投資管理 -->
      <div v-if="activeTab === 'investments'" class="investments">
        <div class="section-header">
          <h2>投資管理</h2>
          <button class="btn btn-primary" @click="showAddInvestment = true">新增投資</button>
        </div>

        <div class="investment-summary">
          <div class="summary-card">
            <h3>投資總覽</h3>
            <div class="summary-stats">
              <div class="stat">
                <div class="stat-label">總價值</div>
                <div class="stat-value">{{ formatCurrency(getTotalInvestmentValue) }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">未實現損益</div>
                <div class="stat-value" :class="getTotalUnrealizedGainLoss >= 0 ? 'positive' : 'negative'">
                  {{ getTotalUnrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(getTotalUnrealizedGainLoss) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="investment-list">
          <div v-if="investments.length === 0" class="empty-state">
            <p>尚未有投資記錄</p>
            <button class="btn btn-primary" @click="showAddInvestment = true">開始投資</button>
          </div>

          <div v-else class="investment-grid">
            <div v-for="investment in investments" :key="investment.id" class="investment-card">
              <div class="investment-header">
                <div class="investment-symbol">{{ investment.symbol }}</div>
                <div class="investment-name">{{ investment.name }}</div>
              </div>
              <div class="investment-details">
                <div class="investment-shares">{{ investment.shares }} 股</div>
                <div class="investment-price">@ {{ formatCurrency(investment.currentPrice) }}</div>
              </div>
              <div class="investment-value">
                <div class="total-value">{{ formatCurrency(investment.totalValue) }}</div>
                <div class="gain-loss" :class="investment.unrealizedGainLoss >= 0 ? 'positive' : 'negative'">
                  {{ investment.unrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(investment.unrealizedGainLoss) }}
                </div>
              </div>
              <div class="investment-actions">
                <button class="btn btn-sm">編輯</button>
                <button class="btn btn-sm btn-danger">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 債務管理 -->
      <div v-if="activeTab === 'debts'" class="debts">
        <div class="section-header">
          <h2>債務管理</h2>
          <button class="btn btn-primary" @click="showAddDebt = true">新增債務</button>
        </div>

        <div class="debt-summary">
          <div class="summary-card">
            <h3>債務總覽</h3>
            <div class="summary-stats">
              <div class="stat">
                <div class="stat-label">總債務</div>
                <div class="stat-value negative">{{ formatCurrency(getTotalDebt) }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">月還款</div>
                <div class="stat-value">{{ formatCurrency(getTotalMonthlyPayment) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="debt-list">
          <div v-if="debts.length === 0" class="empty-state">
            <p>尚未有債務記錄</p>
            <button class="btn btn-primary" @click="showAddDebt = true">新增債務</button>
          </div>

          <div v-else class="debt-grid">
            <div v-for="debt in debts" :key="debt.id" class="debt-card">
              <div class="debt-header">
                <div class="debt-name">{{ debt.name }}</div>
                <div class="debt-rate">{{ debt.interestRate }}% 年利率</div>
              </div>
              <div class="debt-details">
                <div class="debt-balance">
                  <div class="balance-label">剩餘本金</div>
                  <div class="balance-amount">{{ formatCurrency(debt.remainingBalance) }}</div>
                </div>
                <div class="debt-payment">
                  <div class="payment-label">月還款</div>
                  <div class="payment-amount">{{ formatCurrency(debt.monthlyPayment) }}</div>
                </div>
              </div>
              <div class="debt-progress">
                <div class="progress-info">
                  <span>剩餘: {{ getRemainingMonths(debt) }} 個月</span>
                  <span>到期: {{ formatDate(debt.endDate) }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${getDebtProgress(debt)}%` }"></div>
                </div>
              </div>
              <div class="debt-actions">
                <button class="btn btn-sm">還款</button>
                <button class="btn btn-sm">編輯</button>
                <button class="btn btn-sm btn-danger">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 預算管理 -->
      <div v-if="activeTab === 'budgets'" class="budgets">
        <div class="section-header">
          <h2>預算管理</h2>
          <button class="btn btn-primary" @click="showAddBudget = true">新增預算</button>
        </div>

        <div class="budget-summary">
          <div class="summary-card">
            <h3>預算總覽</h3>
            <div class="summary-stats">
              <div class="stat">
                <div class="stat-label">總預算</div>
                <div class="stat-value">{{ formatCurrency(getTotalBudget) }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">已使用</div>
                <div class="stat-value">{{ formatCurrency(getTotalSpent) }}</div>
              </div>
              <div class="stat">
                <div class="stat-label">剩餘</div>
                <div class="stat-value" :class="getTotalRemaining >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(getTotalRemaining) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="budget-list">
          <div v-if="budgets.length === 0" class="empty-state">
            <p>尚未有預算設定</p>
            <button class="btn btn-primary" @click="showAddBudget = true">新增預算</button>
          </div>

          <div v-else class="budget-grid">
            <div v-for="budget in getBudgetStatus" :key="budget.id" class="budget-card">
              <div class="budget-header">
                <div class="budget-name">{{ budget.name }}</div>
                <div class="budget-category">{{ budget.category }}</div>
              </div>
              <div class="budget-progress">
                <div class="progress-info">
                  <div class="budget-amount">{{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}</div>
                  <div class="budget-percentage">{{ budget.percentage.toFixed(1) }}%</div>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${Math.min(budget.percentage, 100)}%` }"
                       :class="{ 'over-budget': budget.percentage > 100 }"></div>
                </div>
              </div>
              <div class="budget-details">
                <div class="budget-period">{{ budget.period === 'monthly' ? '月度' : '年度' }}預算</div>
                <div class="budget-remaining" :class="budget.remaining >= 0 ? 'positive' : 'negative'">
                  剩餘: {{ formatCurrency(budget.remaining) }}
                </div>
              </div>
              <div class="budget-actions">
                <button class="btn btn-sm">編輯</button>
                <button class="btn btn-sm btn-danger">刪除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 報表分析 -->
      <div v-if="activeTab === 'reports'" class="reports">
        <div class="section-header">
          <h2>報表分析</h2>
          <div class="report-controls">
            <select v-model="reportPeriod">
              <option value="month">本月</option>
              <option value="quarter">本季</option>
              <option value="year">本年</option>
              <option value="custom">自訂</option>
            </select>
            <button class="btn btn-secondary">匯出報表</button>
          </div>
        </div>

        <div class="report-grid">
          <!-- 財務總覽 -->
          <div class="card">
            <h3>財務總覽</h3>
            <div class="financial-overview">
              <div class="overview-item">
                <div class="overview-label">總資產</div>
                <div class="overview-value positive">{{ formatCurrency(totalAssets) }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">總負債</div>
                <div class="overview-value negative">{{ formatCurrency(getTotalDebt) }}</div>
              </div>
              <div class="overview-item">
                <div class="overview-label">淨資產</div>
                <div class="overview-value" :class="netWorth >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(netWorth) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 收支分析 -->
          <div class="card">
            <h3>收支分析</h3>
            <div class="income-expense-chart">
              <div class="chart-placeholder">
                <div class="chart-title">本月收支</div>
                <div class="chart-data">
                  <div class="income-bar">
                    <div class="bar-label">收入</div>
                    <div class="bar-fill income" style="width: 70%"></div>
                    <div class="bar-value">{{ formatCurrency(getMonthlyIncome) }}</div>
                  </div>
                  <div class="expense-bar">
                    <div class="bar-label">支出</div>
                    <div class="bar-fill expense" style="width: 60%"></div>
                    <div class="bar-value">{{ formatCurrency(getMonthlyExpense) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 資產配置 -->
          <div class="card">
            <h3>資產配置</h3>
            <div class="asset-allocation">
              <div class="allocation-item">
                <div class="allocation-label">現金</div>
                <div class="allocation-bar">
                  <div class="allocation-fill" style="width: 30%"></div>
                </div>
                <div class="allocation-value">{{ formatCurrency(getTotalBalance) }}</div>
              </div>
              <div class="allocation-item">
                <div class="allocation-label">投資</div>
                <div class="allocation-bar">
                  <div class="allocation-fill" style="width: 50%"></div>
                </div>
                <div class="allocation-value">{{ formatCurrency(getTotalInvestmentValue) }}</div>
              </div>
              <div class="allocation-item">
                <div class="allocation-label">其他</div>
                <div class="allocation-bar">
                  <div class="allocation-fill" style="width: 20%"></div>
                </div>
                <div class="allocation-value">{{ formatCurrency(0) }}</div>
              </div>
            </div>
          </div>

          <!-- 預算執行狀況 -->
          <div class="card">
            <h3>預算執行狀況</h3>
            <div class="budget-execution">
              <div v-for="budget in getBudgetStatus.slice(0, 5)" :key="budget.id" class="execution-item">
                <div class="execution-name">{{ budget.name }}</div>
                <div class="execution-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${Math.min(budget.percentage, 100)}%` }"
                         :class="{ 'over-budget': budget.percentage > 100 }"></div>
                  </div>
                  <div class="execution-percentage">{{ budget.percentage.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 投資績效 -->
          <div class="card">
            <h3>投資績效</h3>
            <div class="investment-performance">
              <div class="performance-item">
                <div class="performance-label">投資總價值</div>
                <div class="performance-value">{{ formatCurrency(getTotalInvestmentValue) }}</div>
              </div>
              <div class="performance-item">
                <div class="performance-label">未實現損益</div>
                <div class="performance-value" :class="getTotalUnrealizedGainLoss >= 0 ? 'positive' : 'negative'">
                  {{ getTotalUnrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(getTotalUnrealizedGainLoss) }}
                </div>
              </div>
              <div class="performance-item">
                <div class="performance-label">投資報酬率</div>
                <div class="performance-value" :class="getInvestmentReturnRate >= 0 ? 'positive' : 'negative'">
                  {{ getInvestmentReturnRate >= 0 ? '+' : '' }}{{ getInvestmentReturnRate.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- 債務分析 -->
          <div class="card">
            <h3>債務分析</h3>
            <div class="debt-analysis">
              <div class="debt-item">
                <div class="debt-label">總債務</div>
                <div class="debt-value">{{ formatCurrency(getTotalDebt) }}</div>
              </div>
              <div class="debt-item">
                <div class="debt-label">月還款</div>
                <div class="debt-value">{{ formatCurrency(getTotalMonthlyPayment) }}</div>
              </div>
              <div class="debt-item">
                <div class="debt-label">債務負擔比</div>
                <div class="debt-value">{{ getDebtRatio.toFixed(1) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增交易模態框 -->
    <DetailedTransactionForm
      :show="showAddTransaction"
      :accounts="accounts"
      @close="showAddTransaction = false"
      @submit="submitTransaction"
    />

    <!-- 新增帳戶模態框 -->
    <div v-if="showAddAccount" class="modal-overlay" @click="showAddAccount = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新增帳戶</h3>
          <button class="close-btn" @click="showAddAccount = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>帳戶名稱</label>
            <input type="text" v-model="newAccount.name" placeholder="請輸入帳戶名稱">
          </div>
          <div class="form-group">
            <label>帳戶類型</label>
            <select v-model="newAccount.type">
              <option value="cash">現金</option>
              <option value="bank">銀行</option>
              <option value="credit">信用卡</option>
              <option value="investment">投資</option>
              <option value="debt">債務</option>
            </select>
          </div>
          <div class="form-group">
            <label>初始餘額</label>
            <input type="number" v-model="newAccount.balance" placeholder="請輸入初始餘額">
          </div>
          <div class="form-group">
            <label>描述</label>
            <input type="text" v-model="newAccount.description" placeholder="請輸入描述">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddAccount = false">取消</button>
          <button class="btn btn-primary" @click="submitAccount">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accounting-book {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #ecf0f1;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.tab-button:hover {
  background: #f8f9fa;
}

.tab-button.active {
  border-bottom-color: #3498db;
  color: #3498db;
  font-weight: bold;
}

.main-content {
  min-height: 400px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 0;
  border-bottom: 1px solid #ecf0f1;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-date {
  min-width: 100px;
  text-align: center;
}

.transaction-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 2px;
}

.transaction-info {
  flex: 1;
  margin: 0 15px;
}

.transaction-items {
  margin: 5px 0;
}

.transaction-item-detail {
  font-size: 0.9rem;
  color: #555;
  margin: 2px 0;
}

.transaction-payment,
.transaction-invoice,
.transaction-notes {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin: 2px 0;
}

.transaction-amount {
  min-width: 120px;
  text-align: right;
  font-weight: bold;
}

.transaction-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.transaction-type.income {
  background: #d5f4e6;
  color: #27ae60;
}

.transaction-type.expense {
  background: #fadbd8;
  color: #e74c3c;
}

.transaction-type.transfer {
  background: #d6eaf8;
  color: #3498db;
}

.transaction-amount.income {
  color: #27ae60;
  font-weight: bold;
}

.transaction-amount.expense {
  color: #e74c3c;
  font-weight: bold;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.account-item:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #2c3e50;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.account-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.account-type {
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.account-balance {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.account-description {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ecf0f1;
}

.budget-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.budget-name {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.budget-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.budget-amount {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.report-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.financial-overview {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.overview-item:last-child {
  border-bottom: none;
}

.overview-label {
  font-weight: 500;
  color: #2c3e50;
}

.overview-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.income-expense-chart {
  padding: 20px 0;
}

.chart-placeholder {
  text-align: center;
}

.chart-title {
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.chart-data {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.income-bar,
.expense-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  min-width: 40px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.bar-fill {
  height: 20px;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.bar-fill.income {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

.bar-fill.expense {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.bar-value {
  min-width: 80px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

.asset-allocation {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.allocation-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.allocation-label {
  min-width: 60px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.allocation-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.allocation-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.allocation-value {
  min-width: 80px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

.budget-execution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.execution-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.execution-name {
  min-width: 100px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.execution-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.execution-percentage {
  min-width: 50px;
  text-align: right;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.investment-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.performance-item:last-child {
  border-bottom: none;
}

.performance-label {
  font-weight: 500;
  color: #2c3e50;
}

.performance-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.debt-analysis {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.debt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.debt-item:last-child {
  border-bottom: none;
}

.debt-label {
  font-weight: 500;
  color: #2c3e50;
}

.debt-value {
  font-weight: bold;
  font-size: 1.1rem;
}

/* 投資和債務卡片樣式 */
.investment-grid,
.debt-grid,
.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.investment-card,
.debt-card,
.budget-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.investment-card:hover,
.debt-card:hover,
.budget-card:hover {
  transform: translateY(-2px);
}

.investment-header,
.debt-header,
.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.investment-symbol,
.debt-name,
.budget-name {
  font-weight: bold;
  font-size: 1.2rem;
  color: #2c3e50;
}

.investment-name,
.debt-rate,
.budget-category {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.investment-details,
.debt-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.investment-shares,
.balance-label,
.payment-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.investment-price,
.balance-amount,
.payment-amount {
  font-weight: bold;
  color: #2c3e50;
}

.investment-value {
  text-align: center;
  margin-bottom: 15px;
}

.total-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.gain-loss {
  font-size: 0.9rem;
  font-weight: bold;
}

.investment-actions,
.debt-actions,
.budget-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.debt-progress {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.progress-bar {
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

.progress-fill.over-budget {
  background: #e74c3c;
}

.budget-progress {
  margin-bottom: 15px;
}

.budget-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.budget-period {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.budget-remaining {
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.empty-state p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.positive {
  color: #27ae60;
}

.stat-value.negative {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .report-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .investment-grid,
  .debt-grid,
  .budget-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .accounting-book {
    padding: 10px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 100px;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
