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
  <div class="max-w-7xl mx-auto p-5 font-sans">
    <!-- 標題列 -->
    <div class="mb-8">
      <h1 class="text-4xl text-gray-800 mb-5 text-center">💰 私人記帳簿</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="bg-white p-5 rounded-xl shadow-lg text-center">
          <div class="text-sm text-gray-600 mb-2">總資產</div>
          <div class="text-2xl font-bold text-green-600">{{ formatCurrency(totalAssets) }}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-lg text-center">
          <div class="text-sm text-gray-600 mb-2">負債</div>
          <div class="text-2xl font-bold text-red-600">{{ formatCurrency(getTotalDebt) }}</div>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-lg text-center">
          <div class="text-sm text-gray-600 mb-2">淨資產</div>
          <div class="text-2xl font-bold" :class="netWorth >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(netWorth) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 導航標籤 -->
    <div class="flex gap-2 mb-8 border-b-2 border-gray-200">
      <button v-for="tab in ['dashboard', 'accounts', 'transactions', 'investments', 'debts', 'budgets', 'reports']"
        :key="tab" :class="[
          'px-6 py-3 border-b-3 border-transparent transition-all duration-300 text-base',
          activeTab === tab
            ? 'border-blue-500 text-blue-500 font-bold'
            : 'hover:bg-gray-50'
        ]" @click="activeTab = tab">
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
    <div class="min-h-96">
      <!-- 儀表板 -->
      <div v-if="activeTab === 'dashboard'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-xl shadow-lg">
          <a @click="activeTab = 'accounts'"
            class="flex justify-between items-center cursor-pointer mb-4 border-b-2 border-gray-100 pb-4">
            <h3 class="text-lg font-semibold text-gray-800">帳戶餘額</h3>
            <i class="bi bi-chevron-right text-gray-500" />
          </a>
          <div class="space-y-3">
            <div v-for="account in accounts" :key="account.id"
              class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div class="font-medium text-gray-800">{{ account.name }}</div>
              <div class="text-lg font-bold text-gray-800">{{ formatCurrency(account.balance) }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-lg">
          <a @click="activeTab = 'transactions'"
            class="flex justify-between items-center cursor-pointer mb-4 border-b-2 border-gray-100 pb-4">
            <h3 class="text-lg font-semibold text-gray-800">最近交易</h3>
            <i class="bi bi-chevron-right text-gray-500" />
          </a>
          <div class="space-y-3">
            <div v-for="transaction in transactions.slice(-5)" :key="transaction.id"
              class="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <div class="flex-1 mr-4">
                <span class="inline-block px-2 py-1 rounded text-xs font-bold mr-2" :class="transaction.type === 'income' ? 'bg-green-100 text-green-600' :
                  transaction.type === 'expense' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'">
                  {{ transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '轉帳' }}
                </span>
                <span v-if="transaction.items.length > 0" class="text-sm text-gray-600">
                  {{ transaction.items[0].itemName }}{{ transaction.items.length > 1 ? ' 等' : '' }}
                </span>
                <span v-else class="text-sm text-gray-600">{{ transaction.notes || '無描述' }}</span>
              </div>
              <div class="text-right font-bold"
                :class="transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'">
                {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.totalAmount) }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-lg">
          <a @click="activeTab = 'investments'"
            class="flex justify-between items-center cursor-pointer mb-4 border-b-2 border-gray-100 pb-4">
            <h3 class="text-lg font-semibold text-gray-800">投資組合</h3>
            <i class="bi bi-chevron-right text-gray-500" />
          </a>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-800">
              總價值: {{ formatCurrency(getTotalInvestmentValue) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 帳戶管理 -->
      <div v-if="activeTab === 'accounts'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">帳戶管理</h2>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddAccount = true">新增帳戶</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="account in accounts" :key="account.id"
            class="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold text-gray-800">{{ account.name }}</h3>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                {{
                  account.type === 'cash' ? '現金' :
                    account.type === 'bank' ? '銀行' :
                      account.type === 'credit' ? '信用卡' :
                        account.type === 'investment' ? '投資' :
                          account.type === 'debt' ? '債務' : account.type
                }}
              </span>
            </div>
            <div class="text-2xl font-bold text-gray-800 mb-2">{{ formatCurrency(account.balance) }}</div>
            <div class="text-sm text-gray-600">{{ account.description }}</div>
          </div>
        </div>
      </div>

      <!-- 交易記錄 -->
      <div v-if="activeTab === 'transactions'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">交易記錄</h2>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddTransaction = true">新增交易</button>
        </div>

        <div class="space-y-4">
          <div v-for="transaction in transactions" :key="transaction.id" class="bg-white p-5 rounded-xl shadow-lg">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <div class="text-center min-w-24">
                    <div class="text-sm font-medium text-gray-800">{{ formatDate(transaction.date) }}</div>
                    <div class="text-xs text-gray-500">{{ transaction.time }}</div>
                  </div>
                  <div class="flex-1">
                    <span class="inline-block px-3 py-1 rounded text-sm font-bold" :class="transaction.type === 'income' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'expense' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'">
                      {{ transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '轉帳' }}
                    </span>
                  </div>
                </div>

                <div v-if="transaction.items.length > 0" class="mb-3">
                  <div v-for="item in transaction.items" :key="item.id" class="text-sm text-gray-600 mb-1">
                    {{ item.lineNumber }}. {{ item.itemName }} - {{ formatCurrency(item.subtotal) }}
                  </div>
                </div>

                <div class="space-y-1 text-sm text-gray-500">
                  <div v-if="transaction.paymentMethod">付款方式: {{ transaction.paymentMethod }}</div>
                  <div v-if="transaction.invoiceNumber">發票號碼: {{ transaction.invoiceNumber }}</div>
                  <div v-if="transaction.notes">{{ transaction.notes }}</div>
                </div>
              </div>

              <div class="text-right font-bold text-lg"
                :class="transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'">
                {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.totalAmount) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 投資管理 -->
      <div v-if="activeTab === 'investments'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">投資管理</h2>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddInvestment = true">新增投資</button>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-lg mb-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">投資總覽</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">總價值</div>
              <div class="text-2xl font-bold text-gray-800">{{ formatCurrency(getTotalInvestmentValue) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">未實現損益</div>
              <div class="text-2xl font-bold"
                :class="getTotalUnrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ getTotalUnrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(getTotalUnrealizedGainLoss) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="investments.length === 0" class="text-center py-10">
          <p class="text-gray-500 mb-5">尚未有投資記錄</p>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddInvestment = true">開始投資</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="investment in investments" :key="investment.id"
            class="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-center mb-4">
              <div class="font-bold text-lg text-gray-800">{{ investment.symbol }}</div>
              <div class="text-sm text-gray-600">{{ investment.name }}</div>
            </div>
            <div class="flex justify-between mb-4">
              <div class="text-sm text-gray-600">{{ investment.shares }} 股</div>
              <div class="text-sm font-medium text-gray-800">@ {{ formatCurrency(investment.currentPrice) }}</div>
            </div>
            <div class="text-center mb-4">
              <div class="text-xl font-bold text-gray-800 mb-1">{{ formatCurrency(investment.totalValue) }}</div>
              <div class="text-sm font-bold"
                :class="investment.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ investment.unrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(investment.unrealizedGainLoss) }}
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors">編輯</button>
              <button
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">刪除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 債務管理 -->
      <div v-if="activeTab === 'debts'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">債務管理</h2>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddDebt = true">新增債務</button>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-lg mb-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">債務總覽</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">總債務</div>
              <div class="text-2xl font-bold text-red-600">{{ formatCurrency(getTotalDebt) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">月還款</div>
              <div class="text-2xl font-bold text-gray-800">{{ formatCurrency(getTotalMonthlyPayment) }}</div>
            </div>
          </div>
        </div>

        <div v-if="debts.length === 0" class="text-center py-10">
          <p class="text-gray-500 mb-5">尚未有債務記錄</p>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddDebt = true">新增債務</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="debt in debts" :key="debt.id"
            class="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-center mb-4">
              <div class="font-bold text-lg text-gray-800">{{ debt.name }}</div>
              <div class="text-sm text-gray-600">{{ debt.interestRate }}% 年利率</div>
            </div>
            <div class="flex justify-between mb-4">
              <div>
                <div class="text-sm text-gray-600">剩餘本金</div>
                <div class="font-bold text-gray-800">{{ formatCurrency(debt.remainingBalance) }}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">月還款</div>
                <div class="font-bold text-gray-800">{{ formatCurrency(debt.monthlyPayment) }}</div>
              </div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-500 mb-2">
                <span>剩餘: {{ getRemainingMonths(debt) }} 個月</span>
                <span>到期: {{ formatDate(debt.endDate) }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${getDebtProgress(debt)}%` }"></div>
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button
                class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">還款</button>
              <button
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors">編輯</button>
              <button
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">刪除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 預算管理 -->
      <div v-if="activeTab === 'budgets'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">預算管理</h2>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddBudget = true">新增預算</button>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-lg mb-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">預算總覽</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">總預算</div>
              <div class="text-2xl font-bold text-gray-800">{{ formatCurrency(getTotalBudget) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">已使用</div>
              <div class="text-2xl font-bold text-gray-800">{{ formatCurrency(getTotalSpent) }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600 mb-1">剩餘</div>
              <div class="text-2xl font-bold" :class="getTotalRemaining >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(getTotalRemaining) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="budgets.length === 0" class="text-center py-10">
          <p class="text-gray-500 mb-5">尚未有預算設定</p>
          <button class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="showAddBudget = true">新增預算</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="budget in getBudgetStatus" :key="budget.id"
            class="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="flex justify-between items-center mb-4">
              <div class="font-bold text-lg text-gray-800">{{ budget.name }}</div>
              <div class="text-sm text-gray-600">{{ budget.category }}</div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">{{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount)
                  }}</span>
                <span class="font-bold text-gray-800">{{ budget.percentage.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-300"
                  :class="budget.percentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
                  :style="{ width: `${Math.min(budget.percentage, 100)}%` }"></div>
              </div>
            </div>
            <div class="flex justify-between items-center mb-4">
              <div class="text-sm text-gray-600">{{ budget.period === 'monthly' ? '月度' : '年度' }}預算</div>
              <div class="text-sm font-bold" :class="budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'">
                剩餘: {{ formatCurrency(budget.remaining) }}
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button
                class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors">編輯</button>
              <button
                class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">刪除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 報表分析 -->
      <div v-if="activeTab === 'reports'">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-2xl font-semibold text-gray-800">報表分析</h2>
          <div class="flex gap-3 items-center">
            <select v-model="reportPeriod"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="month">本月</option>
              <option value="quarter">本季</option>
              <option value="year">本年</option>
              <option value="custom">自訂</option>
            </select>
            <button
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">匯出報表</button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <!-- 財務總覽 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">財務總覽</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">總資產</div>
                <div class="font-bold text-green-600">{{ formatCurrency(totalAssets) }}</div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">總負債</div>
                <div class="font-bold text-red-600">{{ formatCurrency(getTotalDebt) }}</div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">淨資產</div>
                <div class="font-bold" :class="netWorth >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(netWorth) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 收支分析 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">收支分析</h3>
            <div class="text-center py-5">
              <div class="text-lg font-bold text-gray-800 mb-4">本月收支</div>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 text-sm text-gray-600">收入</div>
                  <div class="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style="width: 70%">
                    </div>
                  </div>
                  <div class="w-20 text-right font-bold text-gray-800">{{ formatCurrency(getMonthlyIncome) }}</div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-12 text-sm text-gray-600">支出</div>
                  <div class="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" style="width: 60%"></div>
                  </div>
                  <div class="w-20 text-right font-bold text-gray-800">{{ formatCurrency(getMonthlyExpense) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 資產配置 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">資產配置</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-12 text-sm text-gray-600">現金</div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full" style="width: 30%"></div>
                </div>
                <div class="w-20 text-right font-bold text-gray-800">{{ formatCurrency(getTotalBalance) }}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-12 text-sm text-gray-600">投資</div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" style="width: 50%"></div>
                </div>
                <div class="w-20 text-right font-bold text-gray-800">{{ formatCurrency(getTotalInvestmentValue) }}</div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-12 text-sm text-gray-600">其他</div>
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-gray-500 rounded-full" style="width: 20%"></div>
                </div>
                <div class="w-20 text-right font-bold text-gray-800">{{ formatCurrency(0) }}</div>
              </div>
            </div>
          </div>

          <!-- 預算執行狀況 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">預算執行狀況</h3>
            <div class="space-y-3">
              <div v-for="budget in getBudgetStatus.slice(0, 5)" :key="budget.id" class="flex items-center gap-4">
                <div class="w-20 text-sm text-gray-600 truncate">{{ budget.name }}</div>
                <div class="flex-1 flex items-center gap-3">
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300"
                      :class="budget.percentage > 100 ? 'bg-red-500' : 'bg-blue-500'"
                      :style="{ width: `${Math.min(budget.percentage, 100)}%` }"></div>
                  </div>
                  <div class="w-12 text-right text-sm text-gray-600">{{ budget.percentage.toFixed(1) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 投資績效 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">投資績效</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">投資總價值</div>
                <div class="font-bold text-gray-800">{{ formatCurrency(getTotalInvestmentValue) }}</div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">未實現損益</div>
                <div class="font-bold" :class="getTotalUnrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ getTotalUnrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(getTotalUnrealizedGainLoss) }}
                </div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">投資報酬率</div>
                <div class="font-bold" :class="getInvestmentReturnRate >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ getInvestmentReturnRate >= 0 ? '+' : '' }}{{ getInvestmentReturnRate.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- 債務分析 -->
          <div class="bg-white p-5 rounded-xl shadow-lg">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">債務分析</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">總債務</div>
                <div class="font-bold text-gray-800">{{ formatCurrency(getTotalDebt) }}</div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">月還款</div>
                <div class="font-bold text-gray-800">{{ formatCurrency(getTotalMonthlyPayment) }}</div>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div class="font-medium text-gray-800">債務負擔比</div>
                <div class="font-bold text-gray-800">{{ getDebtRatio.toFixed(1) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增交易模態框 -->
    <DetailedTransactionForm :show="showAddTransaction" :accounts="accounts" @close="showAddTransaction = false"
      @submit="submitTransaction" />

    <!-- 新增帳戶模態框 -->
    <div v-if="showAddAccount" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      @click="showAddAccount = false">
      <div class="bg-white rounded-xl w-11/12 max-w-md max-h-screen overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">新增帳戶</h3>
          <button class="text-2xl text-gray-500 hover:text-gray-700" @click="showAddAccount = false">×</button>
        </div>
        <div class="p-5">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">帳戶名稱</label>
            <input type="text" v-model="newAccount.name" placeholder="請輸入帳戶名稱"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">帳戶類型</label>
            <select v-model="newAccount.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="cash">現金</option>
              <option value="bank">銀行</option>
              <option value="credit">信用卡</option>
              <option value="investment">投資</option>
              <option value="debt">債務</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">初始餘額</label>
            <input type="number" v-model="newAccount.balance" placeholder="請輸入初始餘額"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <input type="text" v-model="newAccount.description" placeholder="請輸入描述"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-gray-200">
          <button class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            @click="showAddAccount = false">取消</button>
          <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            @click="submitAccount">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>
