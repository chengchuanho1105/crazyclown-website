<script setup lang="ts">
defineOptions({ name: 'Test-News' })
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">新聞系統測試</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 原本的新聞系統 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">原本的新聞系統</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">使用 Google Sheets 作為資料來源</p>
        <div class="space-y-2">
          <a
            href="/news"
            class="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
          >
            新聞列表
          </a>
        </div>
      </div>

      <!-- 新的新聞系統 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">新的新聞系統</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">使用 Supabase 作為資料來源</p>
        <div class="space-y-2">
          <a
            href="/news-supabase"
            class="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition-colors"
          >
            新聞列表
          </a>
          <a
            href="/admin/news"
            class="block w-full px-4 py-2 bg-purple-600 text-white text-center rounded-md hover:bg-purple-700 transition-colors"
          >
            後台管理
          </a>
        </div>
      </div>
    </div>

    <div class="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">注意事項</h3>
      <ul class="text-yellow-700 dark:text-yellow-300 space-y-1">
        <li>• 新的新聞系統需要先設定 Supabase 資料庫</li>
        <li>• 需要在 Supabase 中建立 `news` 表格</li>
        <li>• 表格結構請參考 `supabase-data/news_rows.csv`</li>
        <li>• 後台管理需要登入權限</li>
      </ul>
    </div>
  </div>
</template>
