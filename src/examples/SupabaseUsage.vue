<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Supabase 使用範例</h1>

    <!-- 交易管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">交易管理</h2>

      <!-- 載入狀態 -->
      <div v-if="transactions.loading" class="text-blue-600">
        載入中...
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="transactions.error" class="text-red-600 mb-4">
        錯誤: {{ transactions.error.message }}
      </div>

      <!-- 交易列表 -->
      <div v-if="transactions.data" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="transaction in transactions.data"
            :key="transaction.id"
            class="border rounded-lg p-4 shadow-sm"
          >
            <h3 class="font-semibold">交易 #{{ transaction.id }}</h3>
            <p class="text-gray-600">客戶: {{ transaction.customer_id }}</p>
            <p class="text-green-600 font-bold">金額: ${{ transaction.total_amount }}</p>
            <span
              :class="{
                'bg-yellow-100 text-yellow-800': transaction.status === 'pending',
                'bg-green-100 text-green-800': transaction.status === 'completed',
                'bg-red-100 text-red-800': transaction.status === 'cancelled'
              }"
              class="px-2 py-1 rounded text-sm"
            >
              {{ getStatusText(transaction.status) }}
            </span>
          </div>
        </div>

        <!-- 新增交易按鈕 -->
        <button
          @click="showCreateTransaction = true"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          新增交易
        </button>
      </div>

      <!-- 載入按鈕 -->
      <button
        @click="transactions.fetchTransactions()"
        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        重新載入
      </button>
    </section>

    <!-- 客戶管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">客戶管理</h2>

      <div v-if="customers.loading" class="text-blue-600">
        載入中...
      </div>

      <div v-if="customers.error" class="text-red-600 mb-4">
        錯誤: {{ customers.error.message }}
      </div>

      <div v-if="customers.data" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="customer in customers.data"
            :key="customer.id"
            class="border rounded-lg p-4 shadow-sm"
          >
            <h3 class="font-semibold">{{ customer.name }}</h3>
            <p class="text-gray-600">{{ customer.email }}</p>
            <p class="text-gray-600">{{ customer.phone }}</p>
          </div>
        </div>

        <button
          @click="customers.fetchCustomers()"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          重新載入客戶
        </button>
      </div>
    </section>

    <!-- 預訂管理 -->
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">預訂管理</h2>

      <div v-if="reservations.loading" class="text-blue-600">
        載入中...
      </div>

      <div v-if="reservations.error" class="text-red-600 mb-4">
        錯誤: {{ reservations.error.message }}
      </div>

      <div v-if="reservations.data" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="reservation in reservations.data"
            :key="reservation.id"
            class="border rounded-lg p-4 shadow-sm"
          >
            <h3 class="font-semibold">預訂 #{{ reservation.id }}</h3>
            <p class="text-gray-600">日期: {{ reservation.reservation_date }}</p>
            <p class="text-gray-600">時間: {{ reservation.reservation_time }}</p>
            <p class="text-gray-600">人數: {{ reservation.party_size }}</p>
            <span
              :class="{
                'bg-yellow-100 text-yellow-800': reservation.status === 'pending',
                'bg-green-100 text-green-800': reservation.status === 'confirmed',
                'bg-red-100 text-red-800': reservation.status === 'cancelled'
              }"
              class="px-2 py-1 rounded text-sm"
            >
              {{ getReservationStatusText(reservation.status) }}
            </span>
          </div>
        </div>

        <button
          @click="reservations.fetchReservations()"
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          重新載入預訂
        </button>
      </div>
    </section>

    <!-- 新增交易表單 -->
    <div v-if="showCreateTransaction" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">新增交易</h3>

        <form @submit.prevent="createNewTransaction">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">客戶 ID</label>
            <input
              v-model="newTransaction.customer_id"
              type="text"
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">金額</label>
            <input
              v-model="newTransaction.total_amount"
              type="number"
              step="0.01"
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">狀態</label>
            <select v-model="newTransaction.status" class="w-full border rounded px-3 py-2">
              <option value="pending">待處理</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>

          <div class="flex space-x-2">
            <button
              type="submit"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              新增
            </button>
            <button
              type="button"
              @click="showCreateTransaction = false"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTransactions, useCustomers, useReservations } from '@/composables/useSupabase'

// 使用 composables
const transactions = useTransactions()
const customers = useCustomers()
const reservations = useReservations()

// 新增交易相關
const showCreateTransaction = ref(false)
const newTransaction = ref({
  customer_id: '',
  total_amount: 0,
  status: 'pending' as const
})

// 狀態文字轉換
const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待處理',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getReservationStatusText = (status: string) => {
  const statusMap = {
    pending: '待確認',
    confirmed: '已確認',
    cancelled: '已取消'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 新增交易
const createNewTransaction = async () => {
  try {
    await transactions.createTransaction(newTransaction.value)
    showCreateTransaction.value = false
    newTransaction.value = {
      customer_id: '',
      total_amount: 0,
      status: 'pending'
    }
    // 重新載入交易列表
    await transactions.fetchTransactions()
  } catch (error) {
    console.error('新增交易失敗:', error)
  }
}

// 組件掛載時載入資料
onMounted(async () => {
  await Promise.all([
    transactions.fetchTransactions(),
    customers.fetchCustomers(),
    reservations.fetchReservations()
  ])
})
</script>
