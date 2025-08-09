<script setup lang="ts">
defineOptions({ name: 'AdminDashboard' })
import { computed, onMounted } from 'vue'
import { useInventory, useStatistics, useTransactions, useCustomers, useProductCategories } from '@/composables/useSupabase'

// 使用 Supabase Composables
const { inventoryItems, loading: inventoryLoading, fetchInventory } = useInventory()
const { transactions, loading: transactionsLoading, fetchTransactions } = useTransactions()
const { customers, loading: customersLoading, fetchCustomers } = useCustomers()
const { productCategories, loading: categoriesLoading, fetchCategories } = useProductCategories()
const { inventoryStats, revenueStats, fetchInventoryStatistics, fetchRevenueStatistics } = useStatistics()

// 統計資料
const stats = computed(() => ({
  totalInventory: inventoryStats.value.total,
  availableItems: inventoryStats.value.available,
  reservedItems: inventoryStats.value.reserved,
  soldItems: inventoryStats.value.sold,
  totalRevenue: revenueStats.value.totalRevenue,
  monthlyRevenue: revenueStats.value.monthlyRevenue,
  pendingOrders: 0, // 可以從交易記錄計算
  activeCustomers: customers.value.length
}))

// 最近活動（從交易記錄生成）
const recentActivities = computed(() => {
  return transactions.value.slice(0, 4).map((transaction) => {
    const inventoryItem = inventoryItems.value.find(item => item.id === transaction.inventory_item_id)
    const customer = customers.value.find(c => c.id === transaction.customer_id)

    return {
      id: transaction.id,
      type: 'sale',
      title: '商品售出',
      description: `${inventoryItem?.product_id || '商品'} 已售出給 ${customer?.name || customer?.nickname || '客戶'}`,
      amount: transaction.amount_received,
      time: formatTimeAgo(transaction.created_at),
      icon: 'bi-cart-check',
      color: 'text-green-600'
    }
  })
})

// 商品類別分佈
const categoryDistribution = computed(() => {
  const categoryCounts: { [key: string]: number } = {}

  inventoryItems.value.forEach(item => {
    const category = productCategories.value.find(cat => cat.id === item.product_category_id)
    const categoryName = category?.category_name || '其他'
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1
  })

  const total = inventoryItems.value.length
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }))
})

// 快速操作
const quickActions = [
  { name: '庫存管理', icon: 'bi-box', path: '/admin/inventory', color: 'bg-green-500' },
  { name: '客戶管理', icon: 'bi-people', path: '/admin/customers', color: 'bg-blue-500' },
  { name: '交易管理', icon: 'bi-cart', path: '/admin/transactions', color: 'bg-purple-500' },
  { name: '預訂管理', icon: 'bi-calendar-check', path: '/admin/reservation', color: 'bg-orange-500' },
  { name: '資料測試', icon: 'bi-database', path: '/admin/supabase-test', color: 'bg-indigo-500' }
]

// 計算營收成長
const revenueGrowth = computed(() => {
  const growth = ((revenueStats.value.monthlyRevenue - 22100) / 22100 * 100)
  return growth > 0 ? `+${growth.toFixed(1)}` : growth.toFixed(1)
})

// 格式化時間
function formatTimeAgo(dateString: string): string {
  if (!dateString) return '未知時間'

  const now = new Date()
  const date = new Date(dateString)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return '剛剛'
  if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} 小時前`
  return `${Math.floor(diffInMinutes / 1440)} 天前`
}

// 載入資料
const loadData = async () => {
  try {
    console.log('開始載入儀表板資料...')
    await Promise.all([
      fetchInventory(),
      fetchTransactions(),
      fetchCustomers(),
      fetchCategories(),
      fetchInventoryStatistics(),
      fetchRevenueStatistics()
    ])
    console.log('儀表板資料載入完成')
  } catch (error) {
    console.error('載入統計資料失敗:', error)
  }
}

onMounted(async () => {
  await loadData()
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

    <!-- 載入狀態指示器 -->
    <div v-if="inventoryLoading || transactionsLoading || customersLoading || categoriesLoading"
         class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-arrow-clockwise text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
        <span class="text-blue-800 dark:text-blue-200">正在載入資料...</span>
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
          <div v-if="recentActivities.length === 0" class="text-center py-8">
            <i class="bi bi-inbox text-2xl text-amber-600 dark:text-amber-400"></i>
            <p class="mt-2 text-amber-600 dark:text-amber-400">尚無最近活動</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-800 rounded-lg"
            >
              <div class="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <i :class="['bi', activity.icon, 'text-green-600 dark:text-green-400']"></i>
              </div>
              <div class="flex-1">
                <p class="font-medium text-amber-900 dark:text-amber-100">{{ activity.title }}</p>
                <p class="text-sm text-amber-600 dark:text-amber-400">{{ activity.description }}</p>
                <p class="text-xs text-amber-500 dark:text-amber-500 mt-1">{{ activity.time }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-amber-900 dark:text-amber-100">${{ activity.amount?.toLocaleString() || '0' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 側邊欄 -->
      <div class="space-y-6">
        <!-- 快速操作 -->
        <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">快速操作</h3>
          <div class="space-y-3">
            <router-link
              v-for="action in quickActions"
              :key="action.name"
              :to="action.path"
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-800 transition-colors"
            >
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', action.color]">
                <i :class="['bi', action.icon, 'text-white']"></i>
              </div>
              <span class="font-medium text-amber-900 dark:text-amber-100">{{ action.name }}</span>
            </router-link>
          </div>
        </div>

        <!-- 商品類別分佈 -->
        <div class="bg-white dark:bg-amber-900 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-6">
          <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">商品類別分佈</h3>
          <div v-if="categoryDistribution.length === 0" class="text-center py-4">
            <p class="text-amber-600 dark:text-amber-400">尚無商品資料</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="category in categoryDistribution"
              :key="category.category"
              class="flex items-center justify-between"
            >
              <span class="text-amber-600 dark:text-amber-400">{{ category.category }}</span>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-amber-900 dark:text-amber-100">{{ category.count }}</span>
                <span class="text-xs text-amber-500 dark:text-amber-500">({{ category.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
