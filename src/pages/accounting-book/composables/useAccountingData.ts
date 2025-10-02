import { ref, computed } from 'vue'
import type {
  Account,
  Transaction,
  Investment,
  Debt,
  Budget,
  Category,
  DashboardData
} from '../types'

// 模擬資料存儲
const accounts = ref<Account[]>([])
const transactions = ref<Transaction[]>([])
const investments = ref<Investment[]>([])
const debts = ref<Debt[]>([])
const budgets = ref<Budget[]>([])
const categories = ref<Category[]>([])

// 初始化預設資料
const initializeDefaultData = () => {
  // 預設帳戶
  accounts.value = [
    {
      id: '1',
      name: '現金',
      type: 'cash',
      balance: 10000,
      currency: 'TWD',
      description: '日常現金',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: '銀行帳戶',
      type: 'bank',
      balance: 50000,
      currency: 'TWD',
      description: '主要銀行帳戶',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // 預設分類
  categories.value = [
    { id: '1', name: '薪資', type: 'income', icon: '💰', color: '#4CAF50' },
    { id: '2', name: '獎金', type: 'income', icon: '🎁', color: '#4CAF50' },
    { id: '3', name: '餐飲', type: 'expense', icon: '🍽️', color: '#FF9800' },
    { id: '4', name: '交通', type: 'expense', icon: '🚗', color: '#2196F3' },
    { id: '5', name: '娛樂', type: 'expense', icon: '🎬', color: '#9C27B0' },
    { id: '6', name: '醫療', type: 'expense', icon: '🏥', color: '#F44336' },
    { id: '7', name: '教育', type: 'expense', icon: '📚', color: '#607D8B' }
  ]
}

// 帳戶管理
export const useAccounts = () => {
  const addAccount = (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    accounts.value.push(newAccount)
    return newAccount
  }

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates, updatedAt: new Date() }
    }
  }

  const deleteAccount = (id: string) => {
    accounts.value = accounts.value.filter(acc => acc.id !== id)
  }

  const getAccountById = (id: string) => {
    return accounts.value.find(acc => acc.id === id)
  }

  const getTotalBalance = computed(() => {
    return accounts.value.reduce((total, account) => total + account.balance, 0)
  })

  return {
    accounts: computed(() => accounts.value),
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    getTotalBalance
  }
}

// 交易管理
export const useTransactions = () => {
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    transactions.value.push(newTransaction)

    // 更新帳戶餘額
    updateAccountBalance(transaction)

    return newTransaction
  }

  const updateAccountBalance = (transaction: Transaction) => {
    const account = accounts.value.find(acc => acc.id === transaction.accountId)
    if (account) {
      if (transaction.type === 'income') {
        account.balance += transaction.totalAmount
      } else if (transaction.type === 'expense') {
        account.balance -= transaction.totalAmount
      } else if (transaction.type === 'transfer' && transaction.targetAccountId) {
        account.balance -= transaction.totalAmount
        const targetAccount = accounts.value.find(acc => acc.id === transaction.targetAccountId)
        if (targetAccount) {
          targetAccount.balance += transaction.totalAmount
        }
      }
    }
  }

  const getTransactionsByAccount = (accountId: string) => {
    return transactions.value.filter(t => t.accountId === accountId)
  }

  const getTransactionsByDateRange = (startDate: Date, endDate: Date) => {
    return transactions.value.filter(t => t.date >= startDate && t.date <= endDate)
  }

  const getMonthlyTransactions = (year: number, month: number) => {
    return transactions.value.filter(t => {
      const date = new Date(t.date)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }

  return {
    transactions: computed(() => transactions.value),
    addTransaction,
    getTransactionsByAccount,
    getTransactionsByDateRange,
    getMonthlyTransactions
  }
}

// 投資管理
export const useInvestments = () => {
  const addInvestment = (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    investments.value.push(newInvestment)
    return newInvestment
  }

  const updateInvestmentPrice = (id: string, currentPrice: number) => {
    const investment = investments.value.find(inv => inv.id === id)
    if (investment) {
      investment.currentPrice = currentPrice
      investment.totalValue = investment.shares * currentPrice
      investment.unrealizedGainLoss = investment.totalValue - (investment.shares * investment.averageCost)
      investment.updatedAt = new Date()
    }
  }

  const getTotalInvestmentValue = computed(() => {
    return investments.value.reduce((total, inv) => total + inv.totalValue, 0)
  })

  const getTotalUnrealizedGainLoss = computed(() => {
    return investments.value.reduce((total, inv) => total + inv.unrealizedGainLoss, 0)
  })

  return {
    investments: computed(() => investments.value),
    addInvestment,
    updateInvestmentPrice,
    getTotalInvestmentValue,
    getTotalUnrealizedGainLoss
  }
}

// 債務管理
export const useDebts = () => {
  const addDebt = (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    debts.value.push(newDebt)
    return newDebt
  }

  const makePayment = (debtId: string, amount: number, _isExtraPayment = false) => {
    const debt = debts.value.find(d => d.id === debtId)
    if (debt) {
      const interestPayment = debt.remainingBalance * (debt.interestRate / 100 / 12)
      const principalPayment = amount - interestPayment

      debt.remainingBalance -= principalPayment
      debt.updatedAt = new Date()

      // 記錄還款交易
      const { addTransaction } = useTransactions()
      addTransaction({
        type: 'expense',
        amount: amount,
        description: `還款 - ${debt.name}`,
        category: '債務還款',
        accountId: debt.accountId,
        date: new Date()
      })
    }
  }

  const getTotalDebt = computed(() => {
    return debts.value.reduce((total, debt) => total + debt.remainingBalance, 0)
  })

  const getTotalMonthlyPayment = computed(() => {
    return debts.value.reduce((total, debt) => total + debt.monthlyPayment, 0)
  })

  return {
    debts: computed(() => debts.value),
    addDebt,
    makePayment,
    getTotalDebt,
    getTotalMonthlyPayment
  }
}

// 預算管理
export const useBudgets = () => {
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString()
    }
    budgets.value.push(newBudget)
    return newBudget
  }

  const updateBudgetSpent = (budgetId: string, amount: number) => {
    const budget = budgets.value.find(b => b.id === budgetId)
    if (budget) {
      budget.spent += amount
    }
  }

  const getBudgetStatus = computed(() => {
    return budgets.value.map(budget => ({
      ...budget,
      remaining: budget.amount - budget.spent,
      percentage: (budget.spent / budget.amount) * 100
    }))
  })

  const getTotalBudget = computed(() => {
    return budgets.value.reduce((total, budget) => total + budget.amount, 0)
  })

  const getTotalSpent = computed(() => {
    return budgets.value.reduce((total, budget) => total + budget.spent, 0)
  })

  const getTotalRemaining = computed(() => {
    return getTotalBudget.value - getTotalSpent.value
  })

  return {
    budgets: computed(() => budgets.value),
    addBudget,
    updateBudgetSpent,
    getBudgetStatus,
    getTotalBudget,
    getTotalSpent,
    getTotalRemaining
  }
}

// 分類管理
export const useCategories = () => {
  const getCategoriesByType = (type: 'income' | 'expense') => {
    return categories.value.filter(cat => cat.type === type)
  }

  return {
    categories: computed(() => categories.value),
    getCategoriesByType
  }
}

// 儀表板資料
export const useDashboard = () => {
  const { getTotalBalance } = useAccounts()
  const { getTotalInvestmentValue } = useInvestments()
  const { getTotalDebt } = useDebts()

  const dashboardData = computed<DashboardData>(() => {
    const totalAssets = getTotalBalance.value + getTotalInvestmentValue.value
    const totalLiabilities = getTotalDebt.value
    const netWorth = totalAssets - totalLiabilities

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome: 0, // 需要計算
      monthlyExpense: 0, // 需要計算
      budgetStatus: {},
      recentTransactions: transactions.value.slice(-5),
      upcomingBills: []
    }
  })

  return {
    dashboardData
  }
}

// 初始化資料
initializeDefaultData()
