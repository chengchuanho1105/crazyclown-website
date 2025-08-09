<script setup lang="ts">
defineOptions({ name: 'ReservationManagement' })
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventory, useProducts, useProductCategories, useCustomers } from '@/composables/useSupabase'
import type { InventoryItem, Customer } from '@/config/supabase'

const route = useRoute()
const router = useRouter()

// 使用 Supabase Composables
const { inventoryItems, loading: inventoryLoading, fetchInventory, updateInventoryItem } = useInventory()
const { products, loading: productsLoading, fetchProducts } = useProducts()
const { productCategories, loading: categoriesLoading, fetchCategories } = useProductCategories()
const { customers, loading: customersLoading, fetchCustomers, createCustomer } = useCustomers()

// 預訂資料結構
interface Reservation {
  id: string
  inventoryItemId: string
  customerId: string
  expectedPrice: number
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

// 可預訂的庫存項目
const availableInventoryItems = computed(() => {
  return inventoryItems.value.filter(item => item.status === '未售').map(item => {
    const product = products.value.find(p => p.id === item.product_id)
    return {
      id: item.id,
      cdKey: item.cd_key,
      series: product?.series || '',
      productName: product?.product_name || '',
      suggestedPrice: item.suggested_price,
      status: item.status
    }
  })
})

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

// 載入狀態
const isLoading = ref(false)
const error = ref<string | null>(null)

// 表單驗證
const formErrors = ref<Record<string, string>>({})

// 選中的庫存項目
const selectedItem = computed(() => {
  return inventoryItems.value.find(item => item.id === reservationForm.value.inventoryItemId)
})

// 初始化
onMounted(async () => {
  try {
    console.log('開始載入預訂管理資料...')
    await Promise.all([
      fetchInventory(),
      fetchProducts(),
      fetchCategories(),
      fetchCustomers()
    ])
    console.log('預訂管理資料載入完成')

    // 如果有 URL 參數，自動選擇商品
    const itemId = route.query.itemId as string
    if (itemId) {
      reservationForm.value.inventoryItemId = itemId
    }
  } catch (err) {
    console.error('載入預訂管理資料失敗:', err)
    error.value = err instanceof Error ? err.message : '載入資料失敗'
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
const createReservation = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // 先創建客戶
    const customerData = {
      name: reservationForm.value.customerName,
      phone: reservationForm.value.customerPhone,
      id_number: reservationForm.value.customerIdNumber,
      contact_method: reservationForm.value.contactMethod,
      contact_method_id: reservationForm.value.contactMethodId,
      contact_method_account: reservationForm.value.contactMethodAccount,
      contact_method_nickname: reservationForm.value.contactMethodNickname,
      address: reservationForm.value.address,
      pubg_nickname: reservationForm.value.pubgNickname,
      steam_id: reservationForm.value.steamId,
      pubg_account_id: reservationForm.value.pubgAccountId,
      nickname: reservationForm.value.customerName
    }

    const customer = await createCustomer(customerData)

    // 更新庫存狀態為預訂中
    await updateInventoryItem(reservationForm.value.inventoryItemId, {
      status: '福利' // 暫時使用福利狀態來表示預訂
    })

    console.log('預訂創建成功:', { customer, inventoryItemId: reservationForm.value.inventoryItemId })

    // 跳轉到庫存管理頁面
    router.push('/admin/inventory')
  } catch (err) {
    console.error('創建預訂失敗:', err)
    error.value = err instanceof Error ? err.message : '創建預訂失敗'
  } finally {
    isLoading.value = false
  }
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
