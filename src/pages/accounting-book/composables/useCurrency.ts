import { ref, computed } from 'vue'
import type { Currency } from '../types'

// 預設幣別
const currencies = ref<Currency[]>([
  { code: 'TWD', name: '新台幣', symbol: 'NT$', rate: 1 },
  { code: 'USD', name: '美元', symbol: '$', rate: 32.5 },
  { code: 'EUR', name: '歐元', symbol: '€', rate: 35.2 },
  { code: 'JPY', name: '日圓', symbol: '¥', rate: 0.22 },
  { code: 'CNY', name: '人民幣', symbol: '¥', rate: 4.5 },
  { code: 'HKD', name: '港幣', symbol: 'HK$', rate: 4.1 },
  { code: 'GBP', name: '英鎊', symbol: '£', rate: 40.8 },
  { code: 'AUD', name: '澳幣', symbol: 'A$', rate: 21.5 }
])

const defaultCurrency = ref('TWD')

export const useCurrency = () => {
  // 取得所有幣別
  const getAllCurrencies = () => {
    return currencies.value
  }

  // 取得預設幣別
  const getDefaultCurrency = () => {
    return currencies.value.find(c => c.code === defaultCurrency.value)
  }

  // 根據代碼取得幣別
  const getCurrencyByCode = (code: string) => {
    return currencies.value.find(c => c.code === code)
  }

  // 新增幣別
  const addCurrency = (currency: Omit<Currency, 'code'> & { code?: string }) => {
    const newCurrency: Currency = {
      ...currency,
      code: currency.code || `CUSTOM_${Date.now()}`
    }
    currencies.value.push(newCurrency)
    return newCurrency
  }

  // 更新匯率
  const updateCurrencyRate = (code: string, rate: number) => {
    const currency = currencies.value.find(c => c.code === code)
    if (currency) {
      currency.rate = rate
    }
  }

  // 設定預設幣別
  const setDefaultCurrency = (code: string) => {
    defaultCurrency.value = code
  }

  // 幣別轉換
  const convertCurrency = (amount: number, fromCode: string, toCode: string = 'TWD') => {
    const fromCurrency = getCurrencyByCode(fromCode)
    const toCurrency = getCurrencyByCode(toCode)

    if (!fromCurrency || !toCurrency) return amount

    // 先轉換為TWD，再轉換為目標幣別
    const twdAmount = amount * fromCurrency.rate
    return twdAmount / toCurrency.rate
  }

  // 格式化金額
  const formatCurrency = (amount: number, currencyCode: string = 'TWD') => {
    const currency = getCurrencyByCode(currencyCode)
    if (!currency) return amount.toString()

    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // 取得幣別符號
  const getCurrencySymbol = (code: string) => {
    const currency = getCurrencyByCode(code)
    return currency?.symbol || code
  }

  return {
    currencies: computed(() => currencies.value),
    defaultCurrency: computed(() => defaultCurrency.value),
    getAllCurrencies,
    getDefaultCurrency,
    getCurrencyByCode,
    addCurrency,
    updateCurrencyRate,
    setDefaultCurrency,
    convertCurrency,
    formatCurrency,
    getCurrencySymbol
  }
}

