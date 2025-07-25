import { ref } from 'vue'
import { loadSheetData } from '@/utils/sheetDataLoader'

export function useSheetData<T>(sheetUrl: string, mapFn: (item: Record<string, string>) => T) {
  const data = ref<T[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      const sheetData = await loadSheetData<T, T[]>(sheetUrl, mapFn, undefined, true)
      data.value = sheetData
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入失敗'
      data.value = []
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
