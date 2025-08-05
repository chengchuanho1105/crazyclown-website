<script setup lang="ts">
defineOptions({ name: 'LayoutTestPage' })
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold mb-4">佈局測試頁面</h1>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">路由資訊</h2>
      <div class="space-y-2 text-sm">
        <p><strong>當前路徑:</strong> {{ route.path }}</p>
        <p><strong>佈局:</strong> {{ route.meta?.layout || 'default' }}</p>
        <p><strong>品牌:</strong> {{ route.meta?.brand || 'unknown' }}</p>
        <p><strong>路由名稱:</strong> {{ route.name }}</p>
      </div>

      <h2 class="text-xl font-semibold mt-6 mb-4">佈局測試連結</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Admin 佈局測試 -->
        <div class="border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            <i class="bi bi-speedometer2 mr-2"></i>Admin 佈局 (Amber)
          </h3>
          <div class="space-y-2">
            <router-link
              to="/admin"
              class="block px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-center"
            >
              前往 Admin 頁面
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              使用 amber 色系，Bootstrap 圖標，側邊欄設計
            </p>
          </div>
        </div>

        <!-- Customer 佈局測試 -->
        <div class="border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
            <i class="bi bi-person mr-2"></i>Customer 佈局 (Emerald)
          </h3>
          <div class="space-y-2">
            <router-link
              to="/customer"
              class="block px-3 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-center"
            >
              前往 Customer 頁面
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              使用 emerald 色系，Bootstrap 圖標，側邊欄設計
            </p>
          </div>
        </div>

        <!-- Default 佈局測試 -->
        <div class="border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            <i class="bi bi-house mr-2"></i>Default 佈局
          </h3>
          <div class="space-y-2">
            <router-link
              to="/"
              class="block px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
            >
              前往首頁
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              使用預設佈局設計
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-6 mb-4">後台管理系統</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 交易記錄 -->
        <div class="border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            <i class="bi bi-list-ul mr-2"></i>交易記錄
          </h3>
          <div class="space-y-2">
            <router-link
              to="/admin/transactions"
              class="block px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
            >
              前往交易記錄
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              管理所有 PUBG 相關交易記錄
            </p>
          </div>
        </div>

        <!-- 商品管理 -->
        <div class="border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            <i class="bi bi-box mr-2"></i>商品管理
          </h3>
          <div class="space-y-2">
            <router-link
              to="/admin/products"
              class="block px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-center"
            >
              前往商品管理
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              管理 G-Coin、PIGFF 聯名商品
            </p>
          </div>
        </div>

        <!-- 進貨管理 -->
        <div class="border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
            <i class="bi bi-cart-plus mr-2"></i>進貨管理
          </h3>
          <div class="space-y-2">
            <router-link
              to="/admin/inventory"
              class="block px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-center"
            >
              前往庫存管理
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              管理進貨訂單、金額、付款方式
            </p>
          </div>
        </div>

        <!-- 客戶管理 -->
        <div class="border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            <i class="bi bi-people mr-2"></i>客戶管理
          </h3>
          <div class="space-y-2">
            <router-link
              to="/admin"
              class="block px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-center"
            >
              前往管理後台
            </router-link>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              管理客戶資料、聯絡方式、會員資訊
            </p>
          </div>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-6 mb-4">PUBG 交易系統特色</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            <i class="bi bi-list-ul mr-2"></i>交易記錄管理
          </h3>
          <ul class="text-sm space-y-1 text-blue-700 dark:text-blue-300">
            <li>• 完整交易狀態追蹤</li>
            <li>• 進貨與出售資訊整合</li>
            <li>• 客戶資料關聯</li>
            <li>• 營收成本分析</li>
            <li>• 多維度篩選功能</li>
          </ul>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-green-800 dark:text-green-200 mb-2">
            <i class="bi bi-box mr-2"></i>商品管理
          </h3>
          <ul class="text-sm space-y-1 text-green-700 dark:text-green-300">
            <li>• G-Coin 系列管理</li>
            <li>• PIGFF 聯名商品</li>
            <li>• CD Key 追蹤</li>
            <li>• 進貨成本記錄</li>
            <li>• 建議售價設定</li>
          </ul>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-purple-800 dark:text-purple-200 mb-2">
            <i class="bi bi-cart-plus mr-2"></i>進貨管理
          </h3>
          <ul class="text-sm space-y-1 text-purple-700 dark:text-purple-300">
            <li>• 多店家進貨記錄</li>
            <li>• 雙幣別金額管理</li>
            <li>• 付款方式追蹤</li>
            <li>• 進貨時間記錄</li>
            <li>• 成本統計分析</li>
          </ul>
        </div>

        <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h3 class="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            <i class="bi bi-people mr-2"></i>客戶管理
          </h3>
          <ul class="text-sm space-y-1 text-amber-700 dark:text-amber-300">
            <li>• 會員編號管理</li>
            <li>• 多種聯絡方式</li>
            <li>• PUBG 暱稱記錄</li>
            <li>• Steam ID 關聯</li>
            <li>• 住址資訊管理</li>
          </ul>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-6 mb-4">交易狀態說明</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <i class="bi bi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          <p class="text-sm font-medium mt-1">已售</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">成功售出的商品</p>
        </div>
        <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <i class="bi bi-person text-2xl text-blue-600 dark:text-blue-400"></i>
          <p class="text-sm font-medium mt-1">自用</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">個人使用的商品</p>
        </div>
        <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <i class="bi bi-gift text-2xl text-purple-600 dark:text-purple-400"></i>
          <p class="text-sm font-medium mt-1">戰隊福利</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">提供給戰隊成員</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <i class="bi bi-clock text-2xl text-gray-600 dark:text-gray-400"></i>
          <p class="text-sm font-medium mt-1">未售</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">尚未售出的商品</p>
        </div>
      </div>

      <h2 class="text-xl font-semibold mt-6 mb-4">Bootstrap 圖標展示</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-speedometer2 text-2xl text-amber-600 dark:text-amber-400"></i>
          <p class="text-xs mt-1">儀表板</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-box text-2xl text-blue-600 dark:text-blue-400"></i>
          <p class="text-xs mt-1">商品</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-cart-plus text-2xl text-green-600 dark:text-green-400"></i>
          <p class="text-xs mt-1">進貨</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-cart-check text-2xl text-purple-600 dark:text-purple-400"></i>
          <p class="text-xs mt-1">出售</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-people text-2xl text-amber-600 dark:text-amber-400"></i>
          <p class="text-xs mt-1">客戶</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <i class="bi bi-person text-2xl text-emerald-600 dark:text-emerald-400"></i>
          <p class="text-xs mt-1">用戶</p>
        </div>
      </div>
    </div>
  </div>
</template>
