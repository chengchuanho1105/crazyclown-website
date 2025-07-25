import { ref } from 'vue'
import { loadCsvData } from '@/utils/googleSheets'

export function useHybridData<T>(
  localData: T[],
  sheetUrl: string,
  mapFn: (item: Record<string, string>) => T,
) {
  const data = ref<T[]>(localData)
  const isUsingLocal = ref(true)
  const loading = ref(false)

  const load = async () => {
    data.value = localData
    isUsingLocal.value = true
    loading.value = true

    const loadSheetData = async () => {
      try {
        const sheetData = await loadCsvData<T, T[]>(sheetUrl, mapFn, undefined, true)

        if (sheetData && sheetData.length > 0) {
          data.value = sheetData
          isUsingLocal.value = false
        }
      } finally {
        loading.value = false
      }
    }

    // 立即載入 Google Sheets 資料
    await loadSheetData()
  }

  return {
    data,
    isUsingLocal,
    loading,
    load,
  }
}
