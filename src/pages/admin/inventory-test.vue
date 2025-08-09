<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useInventory } from '@/composables/useSupabase'
// 直接嵌入專案中的 CSV（不走網路），作為 Supabase 失敗時的備援來源
// 使用專案根目錄的絕對導入（Vite 會以專案根為基準解析）
// @ts-ignore - Vite 會在編譯期處理
import inventoryCsvRaw from '/supabase-data/inventory_item_rows.csv?raw'

const { inventoryItems, loading, error, fetchInventory } = useInventory()
const loadError = ref<string | null>(null)
const csvRows = ref<any[]>([])

function parseCsv(text: string): any[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      current += ch
    } else if (ch === '\n' && !inQuotes) {
      if (current.trim()) lines.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current.trim())
  if (lines.length === 0) return []

  const headers = splitCsvLine(lines[0])
  const rows: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const vals = splitCsvLine(lines[i])
    const obj: any = {}
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] ?? ''
    })
    rows.push(obj)
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      cur += ch
    } else if (ch === ',' && !inQuotes) {
      out.push(cur.replace(/^"|"$/g, ''))
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur.replace(/^"|"$/g, ''))
  return out
}

onMounted(async () => {
  try {
    await fetchInventory()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  }

  // 若 Supabase 沒回資料，直接載入專案內嵌 CSV 作為驗證
  if (!inventoryItems.value || inventoryItems.value.length === 0) {
    try {
      csvRows.value = parseCsv(inventoryCsvRaw)
    } catch (e) {
      console.error('解析 CSV 失敗', e)
    }
  }
})
</script>

<template>
  <div class="p-4 space-y-4">
    <h1 class="text-xl font-bold">Inventory Test</h1>

    <div class="space-y-1">
      <div v-if="loading">Loading...</div>
      <div v-if="error" class="text-red-600">{{ error }}</div>
      <div v-if="loadError" class="text-red-600">{{ loadError }}</div>
    </div>

    <div class="text-sm">Supabase Count: {{ inventoryItems.length }}</div>
    <div v-if="inventoryItems.length === 0" class="text-sm text-orange-700">Supabase 沒回資料（可能是 RLS 政策或權限導致返回空陣列）</div>

    <div v-if="inventoryItems.length > 0">
      <pre class="text-xs bg-gray-100 p-3 rounded max-h-[60vh] overflow-auto">{{ JSON.stringify(inventoryItems, null, 2) }}</pre>
    </div>

    <div v-if="inventoryItems.length === 0">
      <h2 class="text-lg font-semibold mt-4">CSV Fallback</h2>
      <div class="text-sm">CSV Rows: {{ csvRows.length }}</div>
      <pre class="text-xs bg-gray-100 p-3 rounded max-h-[60vh] overflow-auto">{{ JSON.stringify(csvRows, null, 2) }}</pre>
    </div>
  </div>
</template>

