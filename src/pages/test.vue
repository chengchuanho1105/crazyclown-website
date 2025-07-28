<script setup lang="ts">
defineOptions({ name: 'Test-Page' })

import { computed, ref } from 'vue'

// 測試數據
const testData = ref([
  { id: '1', title: '測試1', addBaseStyle: 'true', html: '<h2>標題</h2><p>內容</p>' },
  { id: '2', title: '測試2', addBaseStyle: 'false', html: '<h2>標題</h2><p>內容</p>' },
  { id: '3', title: '測試3', addBaseStyle: '', html: '<h2>標題</h2><p>內容</p>' },
  { id: '4', title: '測試4', addBaseStyle: 'TRUE', html: '<h2>標題</h2><p>內容</p>' },
  { id: '5', title: '測試5', addBaseStyle: 'FALSE', html: '<h2>標題</h2><p>內容</p>' },
])

const selectedId = ref('1')

const selectedItem = computed(() => testData.value.find((item) => item.id === selectedId.value))

const processedArticle = computed(() => {
  if (!selectedItem.value?.html) {
    return ''
  }

  console.log('=== 測試 addBaseStyle 處理邏輯 ===')
  console.log('addBaseStyle 原始值:', selectedItem.value.addBaseStyle)
  console.log('addBaseStyle 類型:', typeof selectedItem.value.addBaseStyle)
  console.log('addBaseStyle 轉小寫後:', selectedItem.value.addBaseStyle?.toLowerCase())

  const addBaseStyleValue = selectedItem.value.addBaseStyle?.toLowerCase()
  console.log('addBaseStyle 處理後的值:', addBaseStyleValue)

  if (addBaseStyleValue === 'false') {
    console.log('addBaseStyle 為 false，直接返回原始 HTML')
    return selectedItem.value.html
  }

  console.log('addBaseStyle 為 true 或其他值，進行樣式處理')

  let html = selectedItem.value.html
  html = html.replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-2 mt-16">')
  html = html.replace(/<\/h2>/g, '</h2>')
  html = html.replace(/<p>/g, '<p class="mb-4">')
  html = html.replace(/<\/p>/g, '</p>')

  return html
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">addBaseStyle 測試頁面</h1>

    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">選擇測試數據：</label>
      <select v-model="selectedId" class="border rounded px-3 py-2">
        <option v-for="item in testData" :key="item.id" :value="item.id">
          {{ item.title }} (addBaseStyle: {{ item.addBaseStyle }})
        </option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border rounded p-4">
        <h3 class="font-bold mb-2">原始 HTML：</h3>
        <div class="bg-gray-100 p-3 rounded text-sm">
          {{ selectedItem?.html }}
        </div>
      </div>

      <div class="border rounded p-4">
        <h3 class="font-bold mb-2">處理後 HTML：</h3>
        <div class="bg-gray-100 p-3 rounded text-sm">
          {{ processedArticle }}
        </div>
      </div>
    </div>

    <div class="mt-6 border rounded p-4">
      <h3 class="font-bold mb-2">渲染結果：</h3>
      <div class="border rounded p-4" v-html="processedArticle"></div>
    </div>

    <div class="mt-6 border rounded p-4">
      <h3 class="font-bold mb-2">調試信息：</h3>
      <div class="text-sm">
        <p>addBaseStyle 原始值: {{ selectedItem?.addBaseStyle }}</p>
        <p>addBaseStyle 類型: {{ typeof selectedItem?.addBaseStyle }}</p>
        <p>addBaseStyle 轉小寫後: {{ selectedItem?.addBaseStyle?.toLowerCase() }}</p>
        <p>是否為 false: {{ selectedItem?.addBaseStyle?.toLowerCase() === 'false' }}</p>
      </div>
    </div>
  </div>
</template>
