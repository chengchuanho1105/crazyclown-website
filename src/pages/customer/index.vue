<script setup lang="ts">
defineOptions({ name: 'CustomerPage' })
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold mb-4">Customer Dashboard</h1>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">用戶資訊</h2>
      <div class="space-y-2 text-sm">
        <p><strong>當前路徑:</strong> {{ route.path }}</p>
        <p><strong>佈局:</strong> {{ route.meta?.layout || 'default' }}</p>
        <p><strong>品牌:</strong> {{ route.meta?.brand || 'unknown' }}</p>
        <p><strong>路由名稱:</strong> {{ route.name }}</p>
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">個人資料</h3>
          <p class="text-sm text-emerald-700 dark:text-emerald-300">管理您的個人資訊和偏好設定</p>
        </div>

        <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">我的訂單</h3>
          <p class="text-sm text-emerald-700 dark:text-emerald-300">查看和管理您的訂單歷史</p>
        </div>

        <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-emerald-800 dark:text-emerald-200 mb-2">收藏商品</h3>
          <p class="text-sm text-emerald-700 dark:text-emerald-300">瀏覽您收藏的商品清單</p>
        </div>
      </div>
    </div>
  </div>
</template>
