<script setup lang="ts">
defineOptions({ name: 'ReservationManagement' })
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 預訂資料結構
interface Reservation {
  id: string
  inventoryItemId: string
  customerName: string
  customerPhone: string
  customerIdNumber: string
  contactMethod: string
  contactMethodId: string
  contactMethodAccount: string
  contactMethodNickname: string
  address: string
  pubgNickname: string
  steamId: string
  pubgAccountId: string
  reservationTime: string
  expectedPrice: number
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// 庫存項目資料結構
interface InventoryItem {
  id: string
  cdKey: string
  series: string
  productName: string
  suggestedPrice: number
  status: string
}

// 模擬庫存資料
const inventoryItems = ref<InventoryItem[]>([
  {
    id: 'INV-001',
    cdKey: 'S06831-F6KN-E7DK-YNSWQ',
    series: 'G-Coin',
    productName: '11,200 G-Coin',
    suggestedPrice: 2749,
    status: '未售'
  },
  {
    id: 'INV-003',
    cdKey: 'S06865-XQHH-J4B9-PD7UG',
    series: 'G-Coin',
    productName: '1,050 G-Coin',
    suggestedPrice: 289,
    status: '未售'
  }
])

// 預訂表單
const reservationForm = ref({
  inventoryItemId: '',
  customerName: '',
  customerPhone: '',
  customerIdNumber: '',
  contactMethod: '',
  contactMethodId: '',
  contactMethodAccount: '',
  contactMethodNickname: '',
  address: '',
  pubgNickname: '',
  steamId: '',
  pubgAccountId: '',
  expectedPrice: 0,
  notes: ''
})

// 表單驗證
const formErrors = ref<Record<string, string>>({})

// 選中的庫存項目
const selectedItem = computed(() => {
  return inventoryItems.value.find(item => item.id === reservationForm.value.inventoryItemId)
})

// 初始化
onMounted(() => {
  // 如果有 URL 參數，自動選擇商品
  const itemId = route.query.itemId as string
  if (itemId) {
    reservationForm.value.inventoryItemId = itemId
  }
})

// 驗證表單
const validateForm = () => {
  formErrors.value = {}

  if (!reservationForm.value.inventoryItemId) {
    formErrors.value.inventoryItemId = '請選擇商品'
  }

  if (!reservationForm.value.customerName) {
    formErrors.value.customerName = '請輸入客戶姓名'
  }

  if (!reservationForm.value.customerPhone) {
    formErrors.value.customerPhone = '請輸入聯絡電話'
  }

  if (!reservationForm.value.contactMethod) {
    formErrors.value.contactMethod = '請選擇聯絡方式'
  }

  if (reservationForm.value.expectedPrice <= 0) {
    formErrors.value.expectedPrice = '請輸入預期售價'
  }

  return Object.keys(formErrors.value).length === 0
}

// 創建預訂
const createReservation = () => {
  if (!validateForm()) {
    return
  }

  const reservation: Reservation = {
    id: `RES-${Date.now()}`,
    inventoryItemId: reservationForm.value.inventoryItemId,
    customerName: reservationForm.value.customerName,
    customerPhone: reservationForm.value.customerPhone,
    customerIdNumber: reservationForm.value.customerIdNumber,
    contactMethod: reservationForm.value.contactMethod,
    contactMethodId: reservationForm.value.contactMethodId,
    contactMethodAccount: reservationForm.value.contactMethodAccount,
    contactMethodNickname: reservationForm.value.contactMethodNickname,
    address: reservationForm.value.address,
    pubgNickname: reservationForm.value.pubgNickname,
    steamId: reservationForm.value.steamId,
    pubgAccountId: reservationForm.value.pubgAccountId,
    expectedPrice: reservationForm.value.expectedPrice,
    notes: reservationForm.value.notes,
    reservationTime: new Date().toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // 這裡應該調用 API 創建預訂
  console.log('創建預訂:', reservation)

  // 更新庫存狀態
  const itemIndex = inventoryItems.value.findIndex(item => item.id === reservation.inventoryItemId)
  if (itemIndex !== -1) {
    inventoryItems.value[itemIndex].status = '預訂中'
  }

  // 跳轉到庫存管理頁面
  router.push('/admin/inventory')
}

// 重置表單
const resetForm = () => {
  reservationForm.value = {
    inventoryItemId: '',
    customerName: '',
    customerPhone: '',
    customerIdNumber: '',
    contactMethod: '',
    contactMethodId: '',
    contactMethodAccount: '',
    contactMethodNickname: '',
    address: '',
    pubgNickname: '',
    steamId: '',
    pubgAccountId: '',
    expectedPrice: 0,
    notes: ''
  }
  formErrors.value = {}
}

// 聯絡方式選項
const contactMethods = [
  { value: 'Discord', label: 'Discord' },
  { value: 'LINE', label: 'LINE' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">創建預訂</h1>
        <p class="text-gray-600 dark:text-gray-400">為客戶預訂商品</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="resetForm"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          重置表單
        </button>
        <router-link
          to="/admin/inventory"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          返回庫存
        </router-link>
      </div>
    </div>

    <!-- 預訂表單 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <form @submit.prevent="createReservation" class="space-y-6">
        <!-- 商品選擇 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              選擇商品 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="reservationForm.inventoryItemId"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              :class="{ 'border-red-500': formErrors.inventoryItemId }"
            >
              <option value="">請選擇商品</option>
              <option
                v-for="item in inventoryItems.filter(item => item.status === '未售')"
                :key="item.id"
                :value="item.id"
              >
                {{ item.series }} - {{ item.productName }} ({{ item.cdKey }})
              </option>
            </select>
            <p v-if="formErrors.inventoryItemId" class="mt-1 text-sm text-red-600">
              {{ formErrors.inventoryItemId }}
            </p>
          </div>

          <div v-if="selectedItem" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">商品資訊</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-medium">系列：</span>{{ selectedItem.series }}</p>
              <p><span class="font-medium">名稱：</span>{{ selectedItem.productName }}</p>
              <p><span class="font-medium">CD Key：</span><span class="font-mono">{{ selectedItem.cdKey }}</span></p>
              <p><span class="font-medium">建議售價：</span>NT$ {{ selectedItem.suggestedPrice.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- 客戶基本資料 -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">客戶基本資料</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                客戶姓名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="reservationForm.customerName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': formErrors.customerName }"
              />
              <p v-if="formErrors.customerName" class="mt-1 text-sm text-red-600">
                {{ formErrors.customerName }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡電話 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="reservationForm.customerPhone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': formErrors.customerPhone }"
              />
              <p v-if="formErrors.customerPhone" class="mt-1 text-sm text-red-600">
                {{ formErrors.customerPhone }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                身分證字號
              </label>
              <input
                v-model="reservationForm.customerIdNumber"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡方式 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="reservationForm.contactMethod"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': formErrors.contactMethod }"
              >
                <option value="">請選擇聯絡方式</option>
                <option v-for="method in contactMethods" :key="method.value" :value="method.value">
                  {{ method.label }}
                </option>
              </select>
              <p v-if="formErrors.contactMethod" class="mt-1 text-sm text-red-600">
                {{ formErrors.contactMethod }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡方式 ID
              </label>
              <input
                v-model="reservationForm.contactMethodId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡方式帳號
              </label>
              <input
                v-model="reservationForm.contactMethodAccount"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                聯絡方式暱稱
              </label>
              <input
                v-model="reservationForm.contactMethodNickname"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                住址
              </label>
              <input
                v-model="reservationForm.address"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- PUBG 相關資料 -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">PUBG 相關資料</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PUBG 暱稱
              </label>
              <input
                v-model="reservationForm.pubgNickname"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Steam ID
              </label>
              <input
                v-model="reservationForm.steamId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PUBG Account ID
              </label>
              <input
                v-model="reservationForm.pubgAccountId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- 預訂詳情 -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">預訂詳情</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                預期售價 <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="reservationForm.expectedPrice"
                type="number"
                min="0"
                step="1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': formErrors.expectedPrice }"
              />
              <p v-if="formErrors.expectedPrice" class="mt-1 text-sm text-red-600">
                {{ formErrors.expectedPrice }}
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                備註
              </label>
              <textarea
                v-model="reservationForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="輸入備註資訊..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 提交按鈕 -->
        <div class="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            重置
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            創建預訂
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
