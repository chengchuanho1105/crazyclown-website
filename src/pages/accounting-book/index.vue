<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccounts, useTransactions, useInvestments, useDebts, useBudgets } from './composables/useAccountingData'

defineOptions({ name: 'AccountingBookPage' })

// 使用 composables
const { accounts, getTotalBalance } = useAccounts()
const { transactions, addTransaction } = useTransactions()
const { getTotalInvestmentValue } = useInvestments()
const { getTotalDebt } = useDebts()
const { getBudgetStatus } = useBudgets()

// 狀態管理
const activeTab = ref('dashboard')
const showAddTransaction = ref(false)
const showAddAccount = ref(false)
const showAddInvestment = ref(false)
const showAddDebt = ref(false)

// 新增交易表單
const newTransaction = ref({
  type: 'expense' as 'income' | 'expense' | 'transfer',
  amount: 0,
  description: '',
  category: '',
  accountId: '',
  targetAccountId: '',
  date: new Date()
})

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
const submitTransaction = () => {
  if (newTransaction.value.amount > 0 && newTransaction.value.description && newTransaction.value.accountId) {
    addTransaction({
      ...newTransaction.value,
      amount: newTransaction.value.amount
    })

    // 重置表單
    newTransaction.value = {
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      accountId: '',
      targetAccountId: '',
      date: new Date()
    }
    showAddTransaction.value = false
  }
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
                  <span class="transaction-description">{{ transaction.description }}</span>
                </div>
                <div class="transaction-amount" :class="transaction.type">
                  {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
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
            <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
            <div class="transaction-info">
              <div class="transaction-description">{{ transaction.description }}</div>
              <div class="transaction-category">{{ transaction.category }}</div>
            </div>
            <div class="transaction-amount" :class="transaction.type">
              {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
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
            <div class="summary-value">{{ formatCurrency(getTotalInvestmentValue) }}</div>
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
            <div class="summary-value">{{ formatCurrency(getTotalDebt) }}</div>
          </div>
        </div>
      </div>

      <!-- 預算管理 -->
      <div v-if="activeTab === 'budgets'" class="budgets">
        <div class="section-header">
          <h2>預算管理</h2>
          <button class="btn btn-primary">新增預算</button>
        </div>

        <div class="budget-list">
          <div v-for="budget in getBudgetStatus" :key="budget.id" class="budget-item">
            <div class="budget-name">{{ budget.name }}</div>
            <div class="budget-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${budget.percentage}%` }"></div>
              </div>
              <div class="budget-amount">{{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 報表分析 -->
      <div v-if="activeTab === 'reports'" class="reports">
        <div class="section-header">
          <h2>報表分析</h2>
        </div>

        <div class="report-grid">
          <div class="card">
            <h3>收支分析</h3>
            <p>圖表功能開發中...</p>
          </div>
          <div class="card">
            <h3>資產配置</h3>
            <p>圖表功能開發中...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增交易模態框 -->
    <div v-if="showAddTransaction" class="modal-overlay" @click="showAddTransaction = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新增交易</h3>
          <button class="close-btn" @click="showAddTransaction = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>交易類型</label>
            <select v-model="newTransaction.type">
              <option value="income">收入</option>
              <option value="expense">支出</option>
              <option value="transfer">轉帳</option>
            </select>
          </div>
          <div class="form-group">
            <label>金額</label>
            <input type="number" v-model="newTransaction.amount" placeholder="請輸入金額">
          </div>
          <div class="form-group">
            <label>描述</label>
            <input type="text" v-model="newTransaction.description" placeholder="請輸入描述">
          </div>
          <div class="form-group">
            <label>分類</label>
            <input type="text" v-model="newTransaction.category" placeholder="請輸入分類">
          </div>
          <div class="form-group">
            <label>帳戶</label>
            <select v-model="newTransaction.accountId">
              <option value="">請選擇帳戶</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>日期</label>
            <input type="date" v-model="newTransaction.date">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddTransaction = false">取消</button>
          <button class="btn btn-primary" @click="submitTransaction">確認</button>
        </div>
      </div>
    </div>

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
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ecf0f1;
}

.transaction-item:last-child {
  border-bottom: none;
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
