<script setup lang="ts">
defineOptions({ name: 'Layout-CrazyClown-Admin' })
import { ref } from 'vue'
import { RouterView } from 'vue-router'

// 側邊欄狀態
const sidebarOpen = ref(true)

// 切換側邊欄
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 導航選單
const menuItems = [
  { name: '儀表板', icon: 'bi-speedometer2', path: '/admin' },
  { name: '庫存管理', icon: 'bi-box', path: '/admin/inventory' },
  { name: '預訂管理', icon: 'bi-calendar-plus', path: '/admin/reservation' },
  { name: '用戶管理', icon: 'bi-people', path: '/admin/customers' },
  { name: 'Supabase 測試', icon: 'bi-database', path: '/admin/supabase-test' },
]
</script>

<template>
  <div class="min-h-screen bg-amber-50 dark:bg-zinc-950">
    <!-- 側邊欄 -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-amber-700 dark:bg-amber-800 shadow-lg transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- 側邊欄頭部 -->
      <div class="flex items-center justify-between p-4 border-b border-amber-500 dark:border-amber-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-amber-400 dark:bg-amber-600 rounded-lg flex items-center justify-center">
            <span class="text-amber-900 dark:text-amber-100 font-bold text-lg">C</span>
          </div>
          <h1 class="text-xl font-bold text-amber-100 dark:text-amber-200">Crazy Clown</h1>
        </div>
      </div>

      <!-- 導航選單 -->
      <nav class="mt-4">
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.name">
            <router-link
              :to="item.path"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-amber-100 hover:bg-amber-500 dark:hover:bg-amber-700 transition-colors"
              active-class="bg-amber-500 dark:bg-amber-700 text-amber-50"
            >
              <i :class="['bi', item.icon, 'text-lg']"></i>
              <span class="font-medium">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 側邊欄底部 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-500 dark:border-amber-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-amber-400 dark:bg-amber-600 rounded-full flex items-center justify-center">
            <span class="text-amber-900 dark:text-amber-100 font-bold">A</span>
          </div>
          <div>
            <p class="text-sm font-medium text-amber-100 dark:text-amber-200">管理員</p>
            <p class="text-xs text-amber-200 dark:text-amber-300">admin@crazyclown.com</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主要內容區域 -->
    <div :class="[sidebarOpen ? 'ml-64' : 'ml-0', 'transition-all duration-300 ease-in-out']">
      <!-- 頂部導航欄 -->
      <header class="bg-white dark:bg-amber-900 shadow-sm border-b border-amber-200 dark:border-amber-700">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <button
              @click="toggleSidebar"
              class="p-2 rounded-md text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors"
            >
              <i :class="['bi', sidebarOpen ? 'bi-x-lg' : 'bi-list', 'text-xl']"></i>
            </button>
            <h2 class="text-xl font-semibold text-amber-900 dark:text-amber-100">管理後台</h2>
          </div>

          <div class="flex items-center space-x-4">
            <button class="p-2 rounded-md text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors">
              <i class="bi bi-bell text-xl"></i>
            </button>
            <button class="p-2 rounded-md text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800 transition-colors">
              <i class="bi bi-person-circle text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- 頁面內容 -->
      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 自定義滾動條 */
aside::-webkit-scrollbar {
  width: 4px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: rgba(217, 119, 6, 0.3);
  border-radius: 2px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(217, 119, 6, 0.5);
}
</style>
