// 記帳簿資料型別定義

export interface Currency {
  code: string
  name: string
  symbol: string
  rate: number // 對TWD的匯率
}

export interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'credit' | 'investment' | 'debt'
  balance: number
  currency: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  date: Date
  time: string
  items: TransactionItem[]
  totalAmount: number
  paymentMethod: string
  notes?: string
  accountId: string
  targetAccountId?: string // 用於轉帳
  invoiceNumber?: string // 用於支出
  createdAt: Date
  updatedAt: Date
}

export interface TransactionItem {
  id: string
  lineNumber: string
  itemName: string
  unitPrice: number
  quantity: number
  discount: number
  subtotal: number
  currency: string
  notes?: string
}

export interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  averageCost: number
  currentPrice: number
  totalValue: number
  unrealizedGainLoss: number
  realizedGainLoss: number
  accountId: string
  createdAt: Date
  updatedAt: Date
}

export interface InvestmentTransaction {
  id: string
  investmentId: string
  type: 'buy' | 'sell' | 'dividend' | 'split'
  shares: number
  price: number
  amount: number
  fees: number
  date: Date
  description?: string
}

export interface Debt {
  id: string
  name: string
  principal: number
  interestRate: number
  term: number // 月數
  monthlyPayment: number
  remainingBalance: number
  startDate: Date
  endDate: Date
  accountId: string
  createdAt: Date
  updatedAt: Date
}

export interface DebtPayment {
  id: string
  debtId: string
  amount: number
  principal: number
  interest: number
  date: Date
  isExtraPayment: boolean
}

export interface Budget {
  id: string
  name: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  spent: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  parentId?: string
  icon?: string
  color?: string
}

export interface ReportData {
  totalIncome: number
  totalExpense: number
  netIncome: number
  accountBalances: { [accountId: string]: number }
  categoryBreakdown: { [category: string]: number }
  monthlyTrend: { month: string; income: number; expense: number }[]
}

export interface DashboardData {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  monthlyIncome: number
  monthlyExpense: number
  budgetStatus: { [budgetId: string]: { budget: number; spent: number; remaining: number } }
  recentTransactions: Transaction[]
  upcomingBills: DebtPayment[]
}
