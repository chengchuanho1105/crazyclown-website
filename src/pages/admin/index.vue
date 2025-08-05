<script setup lang="ts">
defineOptions({ name: 'AdminDashboard' })
import { ref, computed, onMounted } from 'vue'

// 統計資料
const stats = ref({
  totalInventory: 156,
  availableItems: 89,
  reservedItems: 45,
  soldItems: 22,
  totalRevenue: 125680,
  monthlyRevenue: 28450,
  pendingOrders: 8,
  activeCustomers: 34
})

// 最近活動
const recentActivities = ref([
  {
    id: 1,
    type: 'sale',
    title: '商品售出',
    description: 'G-Coin 11,200 已售出給 李小明',
    amount: 2749,
    time: '2 分鐘前',
    icon: 'bi-cart-check',
    color: 'text-green-600'
  },
  {
    id: 2,
    type: 'reservation',
    title: '新預訂',
    description: 'G-Coin 100 被 王大明 預訂',
    amount: 2749,
    time: '15 分鐘前',
    icon: 'bi-calendar-plus',
    color: 'text-blue-600'
  },
  {
    id: 3,
    type: 'purchase',
    title: '進貨完成',
    description: '從 歐皇電玩 進貨 5 件商品',
    amount: 13180,
    time: '1 小時前',
    icon: 'bi-cart-plus',
    color: 'text-purple-600'
  },
  {
    id: 4,
    type: 'refund',
    title: '退款處理',
    description: '淘已退款處理完成',
    amount: 2749,
    time: '2 小時前',
    icon: 'bi-arrow-clockwise',
    color: 'text-orange-600'
  }
])

// 商品類別分佈
const categoryDistribution = ref([
  { category: 'G-Coin', count: 89, percentage: 57 },
  { category: 'Battle Pass', count: 34, percentage: 22 },
  { category: 'Skin', count: 21, percentage: 13 },
  { category: '其他', count: 12, percentage: 8 }
])

// 快速操作
const quickActions = [
  { name: '庫存管理', icon: 'bi-box', path: '/admin/inventory', color: 'bg-green-500' },
  { name: '預訂管理', icon: 'bi-calendar-check', path: '/admin/reservation', color: 'bg-blue-500' },
  { name: '新增商品', icon: 'bi-plus-circle', path: '/admin/inventory', color: 'bg-purple-500' },
  { name: '查看報表', icon: 'bi-graph-up', path: '/admin', color: 'bg-orange-500' }
]

// 計算營收成長
const revenueGrowth = computed(() => {
  const growth = ((stats.value.monthlyRevenue - 22100) / 22100 * 100)
  return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1)
})

onMounted(() => {
  // 這裡可以載入實際的資料
  console.log('Admin dashboard mounted')
})
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-amber-900 dark:text-amber-100">儀表板</h1>
        <p class="text-amber-600 dark:text-amber-400">歡迎回來，管理員</p>
      </div>
      <div class="text-sm text-amber-600 dark:text-amber-400">
        最後更新：{{ new Date().toLocaleString('zh-TW') }}
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 總庫存 -->
      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">總庫存</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ stats.totalInventory }}</p>
          </div>
          <div class="w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
            <i class="bi bi-box text-2xl text-amber-600 dark:text-amber-400"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 dark:text-green-400">+12%</span>
          <span class="text-amber-600 dark:text-amber-400 ml-2">較上月</span>
        </div>
      </div>

      <!-- 可售商品 -->
      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">可售商品</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ stats.availableItems }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
            <i class="bi bi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-green-600 dark:text-green-400">+8%</span>
          <span class="text-amber-600 dark:text-amber-400 ml-2">較上月</span>
        </div>
      </div>

      <!-- 預訂中 -->
      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">預訂中</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">{{ stats.reservedItems }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
            <i class="bi bi-calendar-plus text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span class="text-blue-600 dark:text-blue-400">+15%</span>
          <span class="text-amber-600 dark:text-amber-400 ml-2">較上月</span>
        </div>
      </div>

      <!-- 本月營收 -->
      <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400">本月營收</p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">${{ stats.monthlyRevenue.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
            <i class="bi bi-currency-dollar text-2xl text-purple-600 dark:text-purple-400"></i>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span :class="stats.monthlyRevenue > 22100 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ revenueGrowth }}%
          </span>
          <span class="text-amber-600 dark:text-amber-400 ml-2">較上月</span>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 最近活動 -->
      <div class="lg:col-span-2 bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700">
        <div class="p-6 border-b border-amber-200 dark:border-amber-700">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">最近活動</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start space-x-4 p-4 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-800 transition-colors"
            >
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <i :class="['bi', activity.icon, 'text-lg', activity.color]"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-amber-900 dark:text-amber-100">{{ activity.title }}</h4>
                  <span class="text-xs text-amber-600 dark:text-amber-400">{{ activity.time }}</span>
                </div>
                <p class="text-sm text-amber-600 dark:text-amber-400 mt-1">{{ activity.description }}</p>
                <p class="text-sm font-medium text-amber-900 dark:text-amber-100 mt-1">${{ activity.amount.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 側邊欄 -->
      <div class="space-y-6">
        <!-- 快速操作 -->
        <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700">
          <div class="p-6 border-b border-amber-200 dark:border-amber-700">
            <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">快速操作</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4">
              <router-link
                v-for="action in quickActions"
                :key="action.name"
                :to="action.path"
                class="flex flex-col items-center p-4 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-800 transition-colors"
              >
                <div :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-2', action.color]">
                  <i :class="['bi', action.icon, 'text-xl text-white']"></i>
                </div>
                <span class="text-sm font-medium text-amber-900 dark:text-amber-100 text-center">{{ action.name }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 商品類別分佈 -->
        <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700">
          <div class="p-6 border-b border-amber-200 dark:border-amber-700">
            <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100">商品類別分佈</h3>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="category in categoryDistribution"
                :key="category.category"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span class="text-sm text-amber-900 dark:text-amber-100">{{ category.category }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-amber-900 dark:text-amber-100">{{ category.count }}</span>
                  <span class="text-xs text-amber-600 dark:text-amber-400">({{ category.percentage }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
