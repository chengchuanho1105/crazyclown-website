<script setup lang="ts">
defineOptions({ name: 'Layout-Public-Customer' })
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
  { name: '個人資料', icon: 'bi-person', path: '/customer/profile' },
  { name: '我的訂單', icon: 'bi-clipboard-data', path: '/customer/order' },
  { name: '收藏商品', icon: 'bi-heart', path: '/customer/favorites' },
  { name: '購物車', icon: 'bi-cart', path: '/customer/cart' },
  { name: '客服中心', icon: 'bi-chat-dots', path: '/customer/support' },
  { name: '設定', icon: 'bi-gear', path: '/customer/settings' },
]
</script>

<template>
  <div class="min-h-screen bg-emerald-50 dark:bg-emerald-950">
    <!-- 側邊欄 -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-emerald-600 dark:bg-emerald-800 shadow-lg transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- 側邊欄頭部 -->
      <div class="flex items-center justify-between p-4 border-b border-emerald-500 dark:border-emerald-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-emerald-400 dark:bg-emerald-600 rounded-lg flex items-center justify-center">
            <span class="text-emerald-900 dark:text-emerald-100 font-bold text-lg">U</span>
          </div>
          <h1 class="text-xl font-bold text-emerald-100 dark:text-emerald-200">User Center</h1>
        </div>
      </div>

      <!-- 導航選單 -->
      <nav class="mt-4">
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.name">
            <router-link
              :to="item.path"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-emerald-100 hover:bg-emerald-500 dark:hover:bg-emerald-700 transition-colors"
              active-class="bg-emerald-500 dark:bg-emerald-700 text-emerald-50"
            >
              <i :class="['bi', item.icon, 'text-lg']"></i>
              <span class="font-medium">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- 側邊欄底部 -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-500 dark:border-emerald-700">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-emerald-400 dark:bg-emerald-600 rounded-full flex items-center justify-center">
            <span class="text-emerald-900 dark:text-emerald-100 font-bold">U</span>
          </div>
          <div>
            <p class="text-sm font-medium text-emerald-100 dark:text-emerald-200">用戶</p>
            <p class="text-xs text-emerald-200 dark:text-emerald-300">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主要內容區域 -->
    <div :class="[sidebarOpen ? 'ml-64' : 'ml-0', 'transition-all duration-300 ease-in-out']">
      <!-- 頂部導航欄 -->
      <header class="bg-white dark:bg-emerald-900 shadow-sm border-b border-emerald-200 dark:border-emerald-700">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center space-x-4">
            <button
              @click="toggleSidebar"
              class="p-2 rounded-md text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              <i :class="['bi', sidebarOpen ? 'bi-x-lg' : 'bi-list', 'text-xl']"></i>
            </button>
            <h2 class="text-xl font-semibold text-emerald-900 dark:text-emerald-100">用戶中心</h2>
          </div>

          <div class="flex items-center space-x-4">
            <button class="p-2 rounded-md text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors">
              <i class="bi bi-bell text-xl"></i>
            </button>
            <button class="p-2 rounded-md text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors">
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
  background: rgba(16, 185, 129, 0.3);
  border-radius: 2px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.5);
}
</style>
