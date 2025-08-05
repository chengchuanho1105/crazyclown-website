export async function loadCsvData<T, R>(
  sheetUrl: string,
  mapFn: (item: Record<string, string>) => T,
  transformFn?: (data: T[]) => R,
  fallbackToLocal = false,
): Promise<R | null> {
  try {
    const response = await fetch(sheetUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

    const result: T[] = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
        const item: Record<string, string> = {}

        headers.forEach((header, index) => {
          item[header] = values[index] || ''
        })

        result.push(mapFn(item))
      }
    }

    if (transformFn) {
      return transformFn(result)
    }

    return result as unknown as R
  } catch (error) {
    console.error('Error loading CSV data:', error)
    if (fallbackToLocal) {
      return null
    }
    throw error
  }
}
