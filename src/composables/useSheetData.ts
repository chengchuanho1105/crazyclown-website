import { ref } from 'vue'

export function useSheetData<T>(sheetUrl: string, mapFn: (item: Record<string, string>) => T) {
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await fetch(sheetUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const csvText = await response.text()

      // 使用更穩健的 CSV 解析，特別處理包含換行符的欄位
      const lines: string[] = []
      let currentLine = ''
      let inQuotes = false

      for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i]

        if (char === '"') {
          inQuotes = !inQuotes
          currentLine += char
        } else if (char === '\n' && !inQuotes) {
          // 只有在引號外時才分割行
          if (currentLine.trim()) {
            lines.push(currentLine.trim())
          }
          currentLine = ''
        } else {
          currentLine += char
        }
      }

      // 添加最後一行
      if (currentLine.trim()) {
        lines.push(currentLine.trim())
      }

      if (lines.length === 0) {
        throw new Error('CSV 檔案為空')
      }

      // 正確解析 CSV 欄位，處理引號內的逗號
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = []
        let currentField = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]

          if (char === '"') {
            inQuotes = !inQuotes
            currentField += char
          } else if (char === ',' && !inQuotes) {
            // 移除開頭和結尾的引號
            result.push(currentField.trim().replace(/^"|"$/g, ''))
            currentField = ''
          } else {
            currentField += char
          }
        }

        // 添加最後一個欄位
        result.push(currentField.trim().replace(/^"|"$/g, ''))
        return result
      }

      const headers = parseCsvLine(lines[0])

      const result: T[] = []
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = parseCsvLine(lines[i])

          const item: Record<string, string> = {}
          headers.forEach((header, index) => {
            item[header] = values[index] || ''
          })

          result.push(mapFn(item))
        }
      }

      data.value = result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入資料時發生錯誤'
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    load,
  }
}
