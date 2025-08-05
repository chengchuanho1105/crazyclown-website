<script setup lang="ts">
defineOptions({ name: 'InventoryManagement' })
import { ref, computed } from 'vue'

// 庫存商品資料結構
interface InventoryItem {
  id: string
  status: '未售' | '預訂中' | '已售' | '自用' | '戰隊福利' | '淘已退款' | '被盜' | '補償'
  cdKey: string
  series: string
  productName: string
  suggestedPrice: number
  orderNumber: string
  purchaseTime: string
  store: string
  purchaseAmountCNY: number
  purchaseAmountTWD: number
  paymentMethod: string
  reservationId?: string
  reservationTime?: string
  customerName?: string
  customerPhone?: string
  createdAt: string
  updatedAt: string
}

// 模擬庫存資料
const inventory = ref<InventoryItem[]>([
  {
    id: 'INV-001',
    status: '未售',
    cdKey: 'S06831-F6KN-E7DK-YNSWQ',
    series: 'G-Coin',
    productName: '11,200 G-Coin',
    suggestedPrice: 2749,
    orderNumber: '2821276778305834559',
    purchaseTime: '25/07/09 18:24:59',
    store: '歐皇電玩',
    purchaseAmountCNY: 625,
    purchaseAmountTWD: 2636,
    paymentMethod: 'UniCard',
    createdAt: '2024-07-09',
    updatedAt: '2024-07-09'
  },
  {
    id: 'INV-002',
    status: '預訂中',
    cdKey: 'S06826-ZVLM-ZDSU-NDGN2',
    series: 'G-Coin',
    productName: '100 G-Coin',
    suggestedPrice: 2749,
    orderNumber: '2821030140109834559',
    purchaseTime: '25/07/09 16:03:54',
    store: '快樂無邊',
    purchaseAmountCNY: 5.88,
    purchaseAmountTWD: 25,
    paymentMethod: 'UniCard',
    reservationId: 'RES-001',
    reservationTime: '2024-08-01 10:30:00',
    customerName: '張三',
    customerPhone: '0912345678',
    createdAt: '2024-07-09',
    updatedAt: '2024-08-01'
  },
  {
    id: 'INV-003',
    status: '未售',
    cdKey: 'S06865-XQHH-J4B9-PD7UG',
    series: 'G-Coin',
    productName: '1,050 G-Coin',
    suggestedPrice: 289,
    orderNumber: '2857726131762776972',
    purchaseTime: '25/08/01 14:35:39',
    store: '牛牛電玩店',
    purchaseAmountCNY: 63.23,
    purchaseAmountTWD: 274,
    paymentMethod: 'UniCard',
    createdAt: '2024-08-01',
    updatedAt: '2024-08-01'
  }
])

// 新增商品資料
const newItemForm = ref({
  series: '',
  productName: '',
  cdKey: '',
  orderNumber: '',
  purchaseTime: '',
  store: '',
  paymentMethod: '',
  purchaseAmountCNY: 0,
  purchaseAmountTWD: 0,
  suggestedPrice: 0,
  status: '未售' as '未售' | '預訂中' | '已售' | '自用' | '戰隊福利' | '淘已退款' | '被盜' | '補償',
  purchaseDateTime: ''
})

// 搜尋和篩選
const searchQuery = ref('')
const seriesFilter = ref('all')
const statusFilter = ref('all')
const storeFilter = ref('all')

// 分頁
const currentPage = ref(1)
const itemsPerPage = 10

// 批量操作
const selectedItems = ref<Set<string>>(new Set())
const selectAll = ref(false)

// 編輯模式
const editingItem = ref<InventoryItem | null>(null)
const showEditModal = ref(false)
const showAddItemModal = ref(false)
const showSaleModal = ref(false)
const selectedItemForSale = ref<InventoryItem | null>(null)

// 銷貨表單資料
const saleForm = ref({
  saleTime: '',
  actualPrice: 0,
  receivedAmount: 0,
  paymentDifference: 0,
  paymentMethod: '',
  paymentBank: '',
  customerPaymentBank: '',
  customerPaymentAccount: '',
  customerPaymentName: '',
  customerIdNumber: '',
  customerName: '',
  customerNickname: '',
  customerPhone: '',
  customerContactMethod: '',
  customerContactId: '',
  customerContactAccount: '',
  customerContactNickname: '',
  customerAddress: '',
  pubgNickname: '',
  pubgAccountId: '',
  steamId: ''
})

// 計算篩選後的庫存
const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.cdKey.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesSeries = seriesFilter.value === 'all' || item.series === seriesFilter.value
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchesStore = storeFilter.value === 'all' || item.store === storeFilter.value

    return matchesSearch && matchesSeries && matchesStatus && matchesStore
  })
})

// 計算分頁
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredInventory.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredInventory.value.length / itemsPerPage))

// 獲取所有系列、狀態、店家
const allSeries = computed(() => {
  const series = [...new Set(inventory.value.map(item => item.series))]
  return ['all', ...series]
})

const allStatuses = computed(() => {
  const statuses = [...new Set(inventory.value.map(item => item.status))]
  return ['all', ...statuses]
})

const allStores = computed(() => {
  const stores = [...new Set(inventory.value.map(item => item.store))]
  return ['all', ...stores]
})

// 計算統計數據
const totalItems = computed(() => filteredInventory.value.length)
const availableItems = computed(() => filteredInventory.value.filter(item => item.status === '未售').length)
const reservedItems = computed(() => filteredInventory.value.filter(item => item.status === '預訂中').length)
const soldItems = computed(() => filteredInventory.value.filter(item => item.status === '已售').length)

// 編輯庫存項目
const editItem = (item: InventoryItem) => {
  editingItem.value = { ...item }
  showEditModal.value = true
}

// 保存編輯
const saveItem = () => {
  if (editingItem.value) {
    const index = inventory.value.findIndex(item => item.id === editingItem.value!.id)
    if (index !== -1) {
      inventory.value[index] = { ...editingItem.value }
    }
    showEditModal.value = false
    editingItem.value = null
  }
}

// 取消編輯
const cancelEdit = () => {
  showEditModal.value = false
  editingItem.value = null
}

// 刪除商品
const deleteItem = (item: InventoryItem) => {
  if (confirm(`確定要刪除商品 "${item.productName}" 嗎？此操作無法復原。`)) {
    const index = inventory.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      inventory.value.splice(index, 1)
    }
  }
}

// 複製 CD Key
const copyCdKey = (cdKey: string) => {
  navigator.clipboard.writeText(cdKey).then(() => {
    // 顯示複製成功提示
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    toast.textContent = 'CD Key 已複製到剪貼簿'
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 2000)
  }).catch(err => {
    console.error('複製失敗:', err)
    // 顯示複製失敗提示
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    toast.textContent = '複製失敗'
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 2000)
  })
}

// 匯出庫存資料
const exportInventory = () => {
  const data = filteredInventory.value.map(item => ({
    '商品ID': item.id,
    '狀態': item.status,
    'CD Key': item.cdKey,
    '系列': item.series,
    '商品名稱': item.productName,
    '建議售價': item.suggestedPrice,
    '訂單編號': item.orderNumber,
    '進貨時間': item.purchaseTime,
    '進貨店家': item.store,
    '進貨金額(CNY)': item.purchaseAmountCNY,
    '進貨金額(TWD)': item.purchaseAmountTWD,
    '付款方式': item.paymentMethod,
    '預訂編號': item.reservationId || '',
    '預訂時間': item.reservationTime || '',
    '客戶姓名': item.customerName || '',
    '客戶電話': item.customerPhone || '',
    '建立時間': item.createdAt,
    '更新時間': item.updatedAt
  }))

  const csvContent = 'data:text/csv;charset=utf-8,' +
    Object.keys(data[0]).join(',') + '\n' +
    data.map(row => Object.values(row).join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `庫存資料_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 批量操作功能
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = new Set(paginatedInventory.value.map(item => item.id))
  } else {
    selectedItems.value.clear()
  }
}

const toggleSelectItem = (itemId: string) => {
  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId)
  } else {
    selectedItems.value.add(itemId)
  }
  // 更新全選狀態
  selectAll.value = selectedItems.value.size === paginatedInventory.value.length
}

const batchDelete = () => {
  if (selectedItems.value.size === 0) {
    alert('請先選擇要刪除的商品')
    return
  }

  if (confirm(`確定要刪除選中的 ${selectedItems.value.size} 個商品嗎？此操作無法復原。`)) {
    inventory.value = inventory.value.filter(item => !selectedItems.value.has(item.id))
    selectedItems.value.clear()
    selectAll.value = false
  }
}

const batchExport = () => {
  if (selectedItems.value.size === 0) {
    alert('請先選擇要匯出的商品')
    return
  }

  const selectedData = inventory.value
    .filter(item => selectedItems.value.has(item.id))
    .map(item => ({
      '商品ID': item.id,
      '狀態': item.status,
      'CD Key': item.cdKey,
      '系列': item.series,
      '商品名稱': item.productName,
      '建議售價': item.suggestedPrice,
      '訂單編號': item.orderNumber,
      '進貨時間': item.purchaseTime,
      '進貨店家': item.store,
      '進貨金額(CNY)': item.purchaseAmountCNY,
      '進貨金額(TWD)': item.purchaseAmountTWD,
      '付款方式': item.paymentMethod,
      '預訂編號': item.reservationId || '',
      '預訂時間': item.reservationTime || '',
      '客戶姓名': item.customerName || '',
      '客戶電話': item.customerPhone || '',
      '建立時間': item.createdAt,
      '更新時間': item.updatedAt
    }))

  const csvContent = 'data:text/csv;charset=utf-8,' +
    Object.keys(selectedData[0]).join(',') + '\n' +
    selectedData.map(row => Object.values(row).join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `選中庫存資料_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 獲取狀態顏色
const getStatusColor = (status: string) => {
  const colors = {
    '未售': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    '預訂中': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    '已售': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    '自用': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    '戰隊福利': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    '淘已退款': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    '被盜': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    '補償': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  }
  return colors[status as keyof typeof colors] || colors['未售']
}

// 處理銷貨
const processSale = (item: InventoryItem) => {
  selectedItemForSale.value = item
  // 初始化表單資料
  saleForm.value.actualPrice = item.suggestedPrice
  saleForm.value.receivedAmount = item.suggestedPrice
  saleForm.value.paymentDifference = 0
  showSaleModal.value = true
}

// 計算付款差異
const calculatePaymentDifference = () => {
  saleForm.value.paymentDifference = saleForm.value.receivedAmount - saleForm.value.actualPrice
}

// 確認銷貨
const confirmSale = () => {
  if (selectedItemForSale.value) {
    const index = inventory.value.findIndex(item => item.id === selectedItemForSale.value!.id)
    if (index !== -1) {
      // 更新商品狀態為已售
      inventory.value[index].status = '已售'
      inventory.value[index].updatedAt = new Date().toISOString().split('T')[0]

              // 這裡可以添加銷貨記錄到資料庫或本地儲存
        console.log('銷貨記錄：', {
          itemId: selectedItemForSale.value.id,
          itemName: selectedItemForSale.value.productName,
          saleTime: saleForm.value.saleTime || new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
          actualPrice: saleForm.value.actualPrice,
          receivedAmount: saleForm.value.receivedAmount,
          paymentDifference: saleForm.value.paymentDifference,
          paymentMethod: saleForm.value.paymentMethod,
          paymentBank: saleForm.value.paymentBank,
          customerPaymentBank: saleForm.value.customerPaymentBank,
          customerPaymentAccount: saleForm.value.customerPaymentAccount,
          customerPaymentName: saleForm.value.customerPaymentName,
          customerIdNumber: saleForm.value.customerIdNumber,
          customerName: saleForm.value.customerName,
          customerNickname: saleForm.value.customerNickname,
          customerPhone: saleForm.value.customerPhone,
          customerContactMethod: saleForm.value.customerContactMethod,
          customerContactId: saleForm.value.customerContactId,
          customerContactAccount: saleForm.value.customerContactAccount,
          customerContactNickname: saleForm.value.customerContactNickname,
          customerAddress: saleForm.value.customerAddress,
          pubgNickname: saleForm.value.pubgNickname,
          pubgAccountId: saleForm.value.pubgAccountId,
          steamId: saleForm.value.steamId
        })
    }
    showSaleModal.value = false
    selectedItemForSale.value = null
    // 重置表單
    saleForm.value = {
      saleTime: '',
      actualPrice: 0,
      receivedAmount: 0,
      paymentDifference: 0,
      paymentMethod: '',
      paymentBank: '',
      customerPaymentBank: '',
      customerPaymentAccount: '',
      customerPaymentName: '',
      customerIdNumber: '',
      customerName: '',
      customerNickname: '',
      customerPhone: '',
      customerContactMethod: '',
      customerContactId: '',
      customerContactAccount: '',
      customerContactNickname: '',
      customerAddress: '',
      pubgNickname: '',
      pubgAccountId: '',
      steamId: ''
    }
  }
}

// 取消銷貨
const cancelSale = () => {
  showSaleModal.value = false
  selectedItemForSale.value = null
  // 重置表單
  saleForm.value = {
    saleTime: '',
    actualPrice: 0,
    receivedAmount: 0,
    paymentDifference: 0,
    paymentMethod: '',
    paymentBank: '',
    customerPaymentBank: '',
    customerPaymentAccount: '',
    customerPaymentName: '',
    customerIdNumber: '',
    customerName: '',
    customerNickname: '',
    customerPhone: '',
    customerContactMethod: '',
    customerContactId: '',
    customerContactAccount: '',
    customerContactNickname: '',
    customerAddress: '',
    pubgNickname: '',
    pubgAccountId: '',
    steamId: ''
  }
}

// 新增商品確認
const confirmAddItem = () => {
  const newItem: InventoryItem = {
    id: `INV-${inventory.value.length + 1}`, // 簡易ID生成
    status: newItemForm.value.status,
    cdKey: newItemForm.value.cdKey,
    series: newItemForm.value.series,
    productName: newItemForm.value.productName,
    suggestedPrice: newItemForm.value.suggestedPrice,
    orderNumber: newItemForm.value.orderNumber,
    purchaseTime: newItemForm.value.purchaseTime,
    store: newItemForm.value.store,
    purchaseAmountCNY: newItemForm.value.purchaseAmountCNY,
    purchaseAmountTWD: newItemForm.value.purchaseAmountTWD,
    paymentMethod: newItemForm.value.paymentMethod,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  }
  inventory.value.push(newItem)
  showAddItemModal.value = false
  newItemForm.value = {
    series: '',
    productName: '',
    cdKey: '',
    orderNumber: '',
    purchaseTime: '',
    store: '',
    paymentMethod: '',
    purchaseAmountCNY: 0,
    purchaseAmountTWD: 0,
    suggestedPrice: 0,
    status: '未售',
    purchaseDateTime: ''
  }
}

// 取消新增商品
const cancelAddItem = () => {
  showAddItemModal.value = false
  newItemForm.value = {
    series: '',
    productName: '',
    cdKey: '',
    orderNumber: '',
    purchaseTime: '',
    store: '',
    paymentMethod: '',
    purchaseAmountCNY: 0,
    purchaseAmountTWD: 0,
    suggestedPrice: 0,
    status: '未售',
    purchaseDateTime: ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- 頁面標題 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">庫存管理</h1>
        <p class="text-gray-600 dark:text-gray-400">管理所有進貨商品庫存</p>
      </div>
      <div class="flex items-center space-x-2">
        <button @click="exportInventory"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
          <i class="bi bi-download mr-2"></i>
          匯出資料
        </button>
        <button @click="showAddItemModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <i class="bi bi-plus-lg mr-2"></i>
          新增商品
        </button>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
            <i class="bi bi-box text-2xl text-blue-600 dark:text-blue-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">總庫存</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ totalItems }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <i class="bi bi-check-circle text-2xl text-green-600 dark:text-green-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">可售</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ availableItems }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
            <i class="bi bi-clock text-2xl text-yellow-600 dark:text-yellow-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">預訂中</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ reservedItems }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
            <i class="bi bi-cart-check text-2xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">已售</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ soldItems }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <!-- 搜尋結果統計 -->
      <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            搜尋結果：{{ filteredInventory.length }} 項商品
            <span v-if="searchQuery || seriesFilter !== 'all' || statusFilter !== 'all' || storeFilter !== 'all'" class="text-blue-600 dark:text-blue-400">
              (已篩選)
            </span>
          </span>
          <span class="text-gray-600 dark:text-gray-400">
            總計：{{ inventory.length }} 項商品
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜尋 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜尋</label>
          <input v-model="searchQuery" type="text" placeholder="搜尋商品名稱、CD Key、訂單編號..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
        </div>

        <!-- 系列篩選 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">商品系列</label>
          <select v-model="seriesFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部系列</option>
            <option v-for="series in allSeries.slice(1)" :key="series" :value="series">
              {{ series }}
            </option>
          </select>
        </div>

        <!-- 狀態篩選 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">狀態</label>
          <select v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部狀態</option>
            <option v-for="status in allStatuses.slice(1)" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <!-- 店家篩選 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">進貨店家</label>
          <select v-model="storeFilter"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部店家</option>
            <option v-for="store in allStores.slice(1)" :key="store" :value="store">
              {{ store }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 庫存列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <!-- 批量操作工具列 -->
      <div v-if="selectedItems.size > 0" class="bg-blue-50 dark:bg-blue-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-blue-700 dark:text-blue-300">
              已選擇 {{ selectedItems.size }} 個商品
            </span>
            <button @click="batchDelete" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm">
              <i class="bi bi-trash mr-1"></i>批量刪除
            </button>
            <button @click="batchExport" class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm">
              <i class="bi bi-download mr-1"></i>批量匯出
            </button>
          </div>
          <button @click="selectedItems.clear(); selectAll = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
            <i class="bi bi-x-lg mr-1"></i>取消選擇
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                商品資訊
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                CD Key
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                進貨資訊
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                建議售價
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                狀態
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                預訂資訊
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in paginatedInventory" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" :checked="selectedItems.has(item.id)" @change="toggleSelectItem(item.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ item.productName }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.series }}
                  </div>
                  <div class="text-xs text-gray-400 dark:text-gray-500">
                    ID: {{ item.id }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {{ item.cdKey }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ item.store }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.purchaseTime }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    ¥{{ item.purchaseAmountCNY }} / NT${{ item.purchaseAmountTWD }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.paymentMethod }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-gray-100">
                  NT$ {{ item.suggestedPrice.toLocaleString() }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusColor(item.status)]">
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="item.status === '預訂中'">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ item.customerName }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.customerPhone }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.reservationTime }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400">
                  -
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="editItem(item)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="編輯">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button @click="copyCdKey(item.cdKey)"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    title="複製 CD Key">
                    <i class="bi bi-clipboard"></i>
                  </button>
                  <router-link v-if="item.status === '未售'" :to="`/admin/reservation?itemId=${item.id}`"
                    class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    title="預訂">
                    <i class="bi bi-calendar-plus"></i>
                  </router-link>
                  <button v-if="item.status === '預訂中'" @click="processSale(item)"
                    class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                    title="銷貨">
                    <i class="bi bi-cart-check"></i>
                  </button>
                  <button @click="deleteItem(item)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="刪除">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1"
        class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              上一頁
            </button>
            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
              下一頁
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                顯示第 {{ (currentPage - 1) * itemsPerPage + 1 }} 到 {{ Math.min(currentPage * itemsPerPage,
                filteredInventory.length) }} 項，
                共 {{ filteredInventory.length }} 項
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-600'
                ]">
                  {{ page }}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 銷貨確認模態框 -->
    <div v-if="showSaleModal" class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <i class="bi bi-cart-check text-2xl text-green-600 dark:text-green-400"></i>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 ml-3">
                銷貨資料填寫
              </h3>
            </div>
            <button @click="cancelSale" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 商品資訊 -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">商品資訊</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">商品名稱：</span>
                <span class="font-medium">{{ selectedItemForSale?.productName }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">系列：</span>
                <span class="font-medium">{{ selectedItemForSale?.series }}</span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">CD Key：</span>
                <span class="font-medium">{{ selectedItemForSale?.cdKey }}</span>
              </div>
            </div>
          </div>

          <!-- 銷貨表單 -->
          <div class="space-y-4">
            <!-- 價格資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">實際售價</label>
                <input v-model.number="saleForm.actualPrice" @input="calculatePaymentDifference" type="number"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">實收金額</label>
                <input v-model.number="saleForm.receivedAmount" @input="calculatePaymentDifference" type="number"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">款項差異</label>
                <input v-model.number="saleForm.paymentDifference" type="number" readonly
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-white" />
              </div>
            </div>

            <!-- 我方收款資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">我方收款方式</label>
                <select v-model="saleForm.paymentMethod"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">請選擇收款方式</option>
                  <option value="銀行轉帳">銀行轉帳</option>
                  <option value="電支轉帳">電支轉帳</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">我方收款行號-帳號</label>
                <select v-model="saleForm.paymentBank"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">請選擇收款銀行</option>
                  <option value="004-031008585996">台銀 004-031008585996 (數位)</option>
                  <option value="007-52157035240">一銀 007-52157035240 (數位)</option>
                  <option value="007-52168264717">一銀 007-52168264717 (實體)</option>
                  <option value="012-81680012123341">富邦 012-81680012123341 (數位)</option>
                  <option value="013-699509828265">國泰 013-699509828265 (數位)</option>
                  <option value="700-03010390331345">郵政 700-03010390331345 (實體)</option>
                  <option value="808-0015976560796">玉山 808-0015976560796 (數位)</option>
                  <option value="812-28881012209521">台新 812-28881012209521 (數位)</option>
                  <option value="822-901562025143">中信 822-901562025143 (數位)</option>
                  <option value="396-902133827">街口 396-902133827 (電支)</option>
                  <option value="389-11016053164960">全支 389-11016053164960 (電支)</option>
                  <option value="391-1512051741">一卡 391-1512051741 (電支)</option>
                  <option value="000-000000000000">其他 000-000000000000 (其他)</option>
                </select>
              </div>
            </div>

            <!-- 顧客付款資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">顧客付款行號</label>
                <input v-model="saleForm.customerPaymentBank" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">顧客付款帳號</label>
                <input v-model="saleForm.customerPaymentAccount" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">顧客付款戶名</label>
                <input v-model="saleForm.customerPaymentName" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 客戶資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">身分證字號</label>
                <input v-model="saleForm.customerIdNumber" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">客戶姓名</label>
                <input v-model="saleForm.customerName" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">客戶暱稱</label>
                <input v-model="saleForm.customerNickname" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">聯絡電話</label>
                <input v-model="saleForm.customerPhone" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 聯絡方式 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">聯絡方式</label>
                <select v-model="saleForm.customerContactMethod"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="">請選擇聯絡方式</option>
                  <option value="Discord">Discord</option>
                  <option value="LINE">LINE</option>
                  <option value="Facebook">Facebook</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">聯絡方式 ID</label>
                <input v-model="saleForm.customerContactId" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">聯絡方式帳號</label>
                <input v-model="saleForm.customerContactAccount" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">客戶地址</label>
                <input v-model="saleForm.customerAddress" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 遊戲資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUBG Nickname</label>
                <input v-model="saleForm.pubgNickname" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PUBG Account ID</label>
                <input v-model="saleForm.pubgAccountId" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Steam ID</label>
                <input v-model="saleForm.steamId" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>

            </div>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="cancelSale"
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
              取消
            </button>
            <button @click="confirmSale"
              class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300">
              確認銷貨
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增商品模態框 -->
    <div v-if="showAddItemModal" class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                <i class="bi bi-plus-circle text-2xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 ml-3">
                新增商品
              </h3>
            </div>
            <button @click="cancelAddItem" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 新增商品表單 -->
          <div class="space-y-4">
            <!-- 基本資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品系列</label>
                <input v-model="newItemForm.series" type="text" list="seriesList" placeholder="請選擇或輸入商品系列"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="seriesList">
                  <option value="G-Coin">G-Coin</option>
                  <option value="PIGFF 聯名">PIGFF 聯名</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品名稱</label>
                <input v-model="newItemForm.productName" type="text" list="productNameList" placeholder="請選擇或輸入商品名稱"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="productNameList">
                  <option value="11,200 G-Coin">11,200 G-Coin</option>
                  <option value="100 G-Coin">100 G-Coin</option>
                  <option value="1,050 G-Coin">1,050 G-Coin</option>
                  <option value="2,700 G-Coin">2,700 G-Coin</option>
                  <option value="5,500 G-Coin">5,500 G-Coin</option>
                  <option value="戰術女僕套裝">戰術女僕套裝</option>
                  <option value="背包套組">背包套組</option>
                  <option value="終極套組">終極套組</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CD Key</label>
                <input v-model="newItemForm.cdKey" type="text" placeholder="例如：S06831-F6KN-E7DK-YNSWQ"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 進貨資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">訂單編號</label>
                <input v-model="newItemForm.orderNumber" type="text" placeholder="例如：2821276778305834559"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨時間</label>
                <input v-model="newItemForm.purchaseTime" type="text" placeholder="例如：25/07/09 18:24:59"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨店家</label>
                <input v-model="newItemForm.store" type="text" list="storeList" placeholder="請選擇或輸入進貨店家"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="storeList">
                  <option value="歐皇電玩">歐皇電玩</option>
                  <option value="快樂無邊">快樂無邊</option>
                  <option value="牛牛電玩店">牛牛電玩店</option>
                  <option value="宸樂電玩">宸樂電玩</option>
                  <option value="逸游電竟">逸游電竟</option>
                  <option value="思思網絡">思思網絡</option>
                  <option value="元年電玩">元年電玩</option>
                  <option value="大喜電玩">大喜電玩</option>
                  <option value="絕地求生">絕地求生</option>
                  <option value="PUBG充值中心">PUBG充值中心</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">付款方式</label>
                <input v-model="newItemForm.paymentMethod" type="text" list="paymentMethodList" placeholder="請選擇或輸入付款方式"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="paymentMethodList">
                  <option value="UniCard">UniCard</option>
                  <option value="Richart">Richart</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
            </div>

            <!-- 價格資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨金額 (CNY)</label>
                <input v-model.number="newItemForm.purchaseAmountCNY" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨金額 (TWD)</label>
                <input v-model.number="newItemForm.purchaseAmountTWD" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">建議售價 (TWD)</label>
                <input v-model.number="newItemForm.suggestedPrice" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 狀態設定 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品狀態</label>
                <select v-model="newItemForm.status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="未售">未售</option>
                  <option value="自用">自用</option>
                  <option value="戰隊福利">戰隊福利</option>
                  <option value="淘已退款">淘已退款</option>
                  <option value="被盜">被盜</option>
                  <option value="補償">補償</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨時間</label>
                <input v-model="newItemForm.purchaseDateTime" type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="cancelAddItem"
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
              取消
            </button>
            <button @click="confirmAddItem"
              class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
              確認新增
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯商品模態框 -->
    <div v-if="showEditModal && editingItem" class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <i class="bi bi-pencil text-2xl text-yellow-600 dark:text-yellow-400"></i>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 ml-3">
                編輯商品
              </h3>
            </div>
            <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 編輯商品表單 -->
          <div class="space-y-4">
            <!-- 基本資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品系列</label>
                <input v-model="editingItem.series" type="text" list="editSeriesList" placeholder="請選擇或輸入商品系列"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="editSeriesList">
                  <option value="G-Coin">G-Coin</option>
                  <option value="PIGFF 聯名">PIGFF 聯名</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品名稱</label>
                <input v-model="editingItem.productName" type="text" list="editProductNameList" placeholder="請選擇或輸入商品名稱"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="editProductNameList">
                  <option value="11,200 G-Coin">11,200 G-Coin</option>
                  <option value="100 G-Coin">100 G-Coin</option>
                  <option value="1,050 G-Coin">1,050 G-Coin</option>
                  <option value="2,700 G-Coin">2,700 G-Coin</option>
                  <option value="5,500 G-Coin">5,500 G-Coin</option>
                  <option value="戰術女僕套裝">戰術女僕套裝</option>
                  <option value="背包套組">背包套組</option>
                  <option value="終極套組">終極套組</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CD Key</label>
                <input v-model="editingItem.cdKey" type="text" placeholder="例如：S06831-F6KN-E7DK-YNSWQ"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 進貨資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">訂單編號</label>
                <input v-model="editingItem.orderNumber" type="text" placeholder="例如：2821276778305834559"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨時間</label>
                <input v-model="editingItem.purchaseTime" type="text" placeholder="例如：25/07/09 18:24:59"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨店家</label>
                <input v-model="editingItem.store" type="text" list="editStoreList" placeholder="請選擇或輸入進貨店家"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="editStoreList">
                  <option value="歐皇電玩">歐皇電玩</option>
                  <option value="快樂無邊">快樂無邊</option>
                  <option value="牛牛電玩店">牛牛電玩店</option>
                  <option value="宸樂電玩">宸樂電玩</option>
                  <option value="逸游電竟">逸游電竟</option>
                  <option value="思思網絡">思思網絡</option>
                  <option value="元年電玩">元年電玩</option>
                  <option value="大喜電玩">大喜電玩</option>
                  <option value="絕地求生">絕地求生</option>
                  <option value="PUBG充值中心">PUBG充值中心</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">付款方式</label>
                <input v-model="editingItem.paymentMethod" type="text" list="editPaymentMethodList" placeholder="請選擇或輸入付款方式"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                <datalist id="editPaymentMethodList">
                  <option value="UniCard">UniCard</option>
                  <option value="Richart">Richart</option>
                  <option value="其他">其他</option>
                </datalist>
              </div>
            </div>

            <!-- 價格資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨金額 (CNY)</label>
                <input v-model.number="editingItem.purchaseAmountCNY" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">進貨金額 (TWD)</label>
                <input v-model.number="editingItem.purchaseAmountTWD" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">建議售價 (TWD)</label>
                <input v-model.number="editingItem.suggestedPrice" type="number" step="0.01" placeholder="0.00"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 狀態設定 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">商品狀態</label>
                <select v-model="editingItem.status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="未售">未售</option>
                  <option value="預訂中">預訂中</option>
                  <option value="已售">已售</option>
                  <option value="自用">自用</option>
                  <option value="戰隊福利">戰隊福利</option>
                  <option value="淘已退款">淘已退款</option>
                  <option value="被盜">被盜</option>
                  <option value="補償">補償</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">更新時間</label>
                <input v-model="editingItem.updatedAt" type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>

            <!-- 預訂資訊（如果狀態是預訂中） -->
            <div v-if="editingItem.status === '預訂中'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">預訂編號</label>
                <input v-model="editingItem.reservationId" type="text" placeholder="例如：RES-001"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">客戶姓名</label>
                <input v-model="editingItem.customerName" type="text" placeholder="客戶姓名"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">客戶電話</label>
                <input v-model="editingItem.customerPhone" type="text" placeholder="客戶電話"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">預訂時間</label>
                <input v-model="editingItem.reservationTime" type="datetime-local"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end space-x-3 mt-6">
            <button @click="cancelEdit"
              class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">
              取消
            </button>
            <button @click="saveItem"
              class="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300">
              保存修改
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
