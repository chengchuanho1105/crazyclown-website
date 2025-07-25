// 專門從 Google Sheets 取得資料的工具

// 快取管理
const cache = new Map<string, { data: string; timestamp: number; ttl: number }>()

const getCachedData = (key: string): string | null => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: string, ttl: number = 5 * 60 * 1000) => {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

// 從 Google Sheets 取得 CSV 資料
export const fetchSheetData = async (
  sheetUrl: string,
  useCache: boolean = true,
): Promise<string> => {
  // 檢查快取
  if (useCache) {
    const cached = getCachedData(sheetUrl)
    if (cached) {
      return cached
    }
  }

  const response = await fetch(sheetUrl, {
    method: 'GET',
    headers: { Accept: 'text/csv' },
    cache: 'force-cache',
  })

  if (!response.ok) {
    throw new Error(`無法載入 Google Sheets 資料: ${response.status}`)
  }

  const data = await response.text()

  // 儲存到快取
  if (useCache) {
    setCachedData(sheetUrl, data)
  }

  return data
}

// CSV 解析
export const parseCsv = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // 清理欄位名稱
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').replace(/\r/g, ''))

  return lines.slice(1).map((line) => {
    const values: string[] = []
    let current = '',
      inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else current += char
    }
    values.push(current.trim())

    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      obj[h] = (values[i] || '').replace(/^"|"$/g, '').replace(/\r/g, '')
    })
    return obj
  })
}

// 資料映射函式
export const mapSheetData = <T>(
  data: Record<string, string>[],
  mapper: (item: Record<string, string>) => T,
): T[] => {
  return data.map(mapper)
}

// 主要的載入函數
export const loadSheetData = async <T, R>(
  sheetUrl: string,
  mapper: (item: Record<string, string>) => T,
  processor?: (mappedData: T[], rawData: Record<string, string>[]) => R,
  useCache: boolean = true,
): Promise<R> => {
  const csv = await fetchSheetData(sheetUrl, useCache)
  const rawData = parseCsv(csv)

  // 映射數據
  const mappedData = mapSheetData(rawData, mapper)

  // 如果有後處理函式，則執行後處理
  if (processor) {
    return processor(mappedData, rawData)
  }

  // 否則直接返回映射後的數據
  return mappedData as unknown as R
}

// 清除快取
export const clearCache = () => {
  cache.clear()
}

// 取得快取狀態
export const getCacheStatus = () => {
  const entries = Array.from(cache.entries()).map(([key, value]) => ({
    key,
    age: Date.now() - value.timestamp,
    ttl: value.ttl,
    size: value.data.length,
  }))

  return {
    totalEntries: entries.length,
    entries,
  }
}
