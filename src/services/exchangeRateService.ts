/**
 * 匯率服務
 * 從 tw.rter.info API 獲取即時匯率資料
 */

// 匯率 API 回應類型
interface ExchangeRateApiResponse {
  [key: string]: {
    Exrate: number
    UTC: string
  }
}

// 匯率資料類型
export interface ExchangeRateData {
  usd2twd: number  // USD 對 TWD 匯率
  timestamp: string  // 資料時間戳
  source: string    // 資料來源
}

// 匯率快取
let rateCache: ExchangeRateData | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分鐘快取

/**
 * 從 tw.rter.info API 獲取即時匯率
 */
export async function fetchRealTimeExchangeRate(): Promise<ExchangeRateData> {
  try {
    // 在開發環境使用代理，生產環境使用 CORS 代理服務
    const isDevelopment = import.meta.env.DEV
    const apiUrl = isDevelopment
      ? '/api/exchange-rate'  // 使用 Vite 代理
      : 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://tw.rter.info/capi.php')

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    let data: ExchangeRateApiResponse

    if (isDevelopment) {
      // 開發環境直接解析 JSON
      data = await response.json()
    } else {
      // 生產環境使用 allorigins 代理，需要額外解析
      const proxyResponse = await response.json()
      data = JSON.parse(proxyResponse.contents)
    }

    // 提取 USDTWD 匯率
    const usdTwdRate = data.USDTWD

    if (!usdTwdRate) {
      throw new Error('USDTWD 匯率資料不存在')
    }

    return {
      usd2twd: usdTwdRate.Exrate,
      timestamp: usdTwdRate.UTC,
      source: 'tw.rter.info'
    }
  } catch (error) {
    console.error('獲取即時匯率失敗:', error)
    throw error
  }
}

/**
 * 獲取匯率資料（帶快取機制）
 */
export async function getExchangeRate(): Promise<ExchangeRateData> {
  const now = Date.now()

  // 檢查快取是否有效
  if (rateCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return rateCache
  }

  try {
    // 獲取新的匯率資料
    const newRate = await fetchRealTimeExchangeRate()

    // 更新快取
    rateCache = newRate
    cacheTimestamp = now

    return newRate
  } catch (error) {
    console.warn('獲取即時匯率失敗，使用備用方案:', error)
    // 如果 API 失敗但有快取，返回快取資料
    if (rateCache) {
      console.warn('使用快取的匯率資料:', rateCache)
      return rateCache
    }

    // 如果沒有快取，返回預設值
    console.warn('使用預設匯率資料')
    return {
      usd2twd: 30,
      timestamp: new Date().toISOString(),
      source: 'default'
    }
  }
}

/**
 * 清除匯率快取
 */
export function clearExchangeRateCache(): void {
  rateCache = null
  cacheTimestamp = 0
}

/**
 * 格式化匯率顯示
 */
export function formatExchangeRate(rate: number): string {
  return rate.toFixed(4)
}

/**
 * 格式化時間戳顯示
 */
export function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei'
    })
  } catch {
    return timestamp
  }
}
