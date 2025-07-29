<script setup lang="ts">
defineOptions({ name: 'Test-Page' })

import { computed, ref } from 'vue'

// 測試 parseTags 函數
function parseTags(tags: string): string[] {
  if (typeof tags !== 'string') return []

  // 首先嘗試直接解析 JSON
  try {
    return JSON.parse(tags)
  } catch {
    // 如果失敗，嘗試將單引號替換為雙引號後再解析
    try {
      const fixed = tags.replace(/'/g, '"')
      return JSON.parse(fixed)
    } catch {
      // 如果還是失敗，則按逗號分割，但需要處理引號內的情況
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < tags.length; i++) {
        const char = tags[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          // 只有在引號外時才分割
          const trimmed = current.trim().replace(/^['"]|['"]$/g, '')
          if (trimmed) {
            result.push(trimmed)
          }
          current = ''
        } else {
          current += char
        }
      }

      // 添加最後一個標籤
      const trimmed = current.trim().replace(/^['"]|['"]$/g, '')
      if (trimmed) {
        result.push(trimmed)
      }

      return result
    }
  }
}

// 測試數據
const testTags = [
  '"PUBG, Discord, 台港澳, 社群, 活動, 聯名, aespa"',
  '"PUBG,G-Coin,套裝,CDK,優惠"',
  '"PUBG","Bugatti","聯名合作","燃擎破寂","超跑登場"',
  'PUBG, Discord, 台港澳, 社群, 活動, 聯名, aespa',
  'PUBG,G-Coin,套裝,CDK,優惠',
]

const testResults = testTags.map((tag) => ({
  original: tag,
  parsed: parseTags(tag),
}))

const selectedId = ref('1')

const selectedItem = computed(() => testResults.find((item) => item.original === selectedId.value))

const processedArticle = computed(() => {
  if (!selectedItem.value?.parsed) {
    return ''
  }

  console.log('=== 測試 parseTags 處理邏輯 ===')
  console.log('原始 tags:', selectedItem.value.original)
  console.log('解析後 tags:', selectedItem.value.parsed)

  return selectedItem.value.parsed.join(', ')
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">addBaseStyle 測試頁面</h1>

    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">選擇測試數據：</label>
      <select v-model="selectedId" class="border rounded px-3 py-2">
        <option v-for="item in testResults" :key="item.original" :value="item.original">
          {{ item.original }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border rounded p-4">
        <h3 class="font-bold mb-2">原始 Tags：</h3>
        <div class="bg-gray-100 p-3 rounded text-sm">
          {{ selectedItem?.original }}
        </div>
      </div>

      <div class="border rounded p-4">
        <h3 class="font-bold mb-2">解析後 Tags：</h3>
        <div class="bg-gray-100 p-3 rounded text-sm">
          {{ processedArticle }}
        </div>
      </div>
    </div>

    <div class="mt-6 border rounded p-4">
      <h3 class="font-bold mb-2">調試信息：</h3>
      <div class="text-sm">
        <p>原始 tags: {{ selectedItem?.original }}</p>
        <p>解析後 tags: {{ selectedItem?.parsed }}</p>
        <p>解析後 tags 數量: {{ selectedItem?.parsed?.length }}</p>
      </div>
    </div>
  </div>
</template>
