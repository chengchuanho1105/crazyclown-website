<script setup lang="ts">
defineOptions({ name: 'InventoryManagement' })
import { ref, computed, onMounted } from 'vue'
import { useInventory, useProducts, useProductCategories, useTransactions, usePaymentMethods, useBankData, useCustomers } from '@/composables/useSupabase'
import type { InventoryItem, InventoryItemWithDetails, Transaction, Customer } from '@/config/supabase'


// composables
const { inventoryItems, loading: inventoryLoading, error: inventoryError, fetchInventory } = useInventory()
const { products, loading: productsLoading, error: productsError, fetchProducts } = useProducts()
const { productCategories, loading: categoriesLoading, error: categoriesError, fetchCategories } = useProductCategories()
const { paymentMethods, loading: paymentMethodsLoading, error: paymentMethodsError, fetchPaymentMethods } = usePaymentMethods()
const { ourBankData, loading: bankDataLoading, error: bankDataError, fetchBankData } = useBankData()
const { transactions, loading: transactionsLoading, error: transactionsError, fetchTransactions } = useTransactions()
const { customers, loading: customersLoading, error: customersError, fetchCustomers } = useCustomers()

// local state
const searchQuery = ref('')
const seriesFilter = ref('all')
const statusFilter = ref('all')
const storeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 20
const isBusy = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const anyError = computed(() => errorMsg.value || inventoryError?.value || productsError?.value || categoriesError?.value || paymentMethodsError?.value || bankDataError?.value || transactionsError?.value || customersError?.value || null)

// sort
type SortKey = 'created_at' | 'purchase_time' | 'suggested_price' | 'status' | 'product_name'
const sortKey = ref<SortKey>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// modal - detail
const showDetailModal = ref(false)
const detailLoading = ref(false)
const detailItem = ref<InventoryItem | null>(null)
const detailData = ref<InventoryItemWithDetails & {
  transaction?: Transaction & { customer?: Customer }
} | null>(null)

// add/edit modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingItem = ref<(InventoryItem & { selectedSeries?: string; product_category_id?: string }) | null>(null)

// 銷貨資料表單
const saleFormData = ref({
  our_payment_method: '',
  our_bank_data: '',
  customer_payment_method: '',
  customer_bank_code: '',
  customer_bank_account: '',
  customer_account_name: '',
  actual_price: 0,
  amount_received: 0,
  amount_difference: 0,
  transactions_time: '',
  remarks: '',
  customer_id: '' // 新增客戶ID欄位
})

// 客戶選擇器相關
const showCustomerSelector = ref(false)
const customerSearchQuery = ref('')
const selectedCustomer = ref<Customer | null>(null)

// 快速新增客戶表單
const showQuickAddCustomer = ref(false)
const quickAddCustomerForm = ref({
  name: '',
  nickname: '',
  phone: '',
  id_number: '',
  contact_method: '',
  contact_method_id: '',
  contact_method_account: '',
  contact_method_nickname: '',
  address: '',
  pubg_nickname: '',
  pubg_account_id: '',
  steam_id: ''
})

type InventoryStatus = InventoryItem['status']
const newItemForm = ref<{[
  K in 'product_id' | 'cd_key' | 'purchase_time' | 'purchase_store' | 'purchase_payment_method' | 'purchase_order_number' | 'remarks' | 'selectedSeries' | 'product_category_id'
]: string} & { purchase_amount_cny: number; purchase_amount_twd: number; suggested_price: number; status: InventoryStatus }>({
  product_id: '',
  cd_key: '',
  purchase_time: '',
  purchase_store: '',
  purchase_payment_method: '',
  purchase_order_number: '',
  purchase_amount_cny: 0,
  purchase_amount_twd: 0,
  suggested_price: 0,
  status: '未售',
  remarks: '',
  selectedSeries: '',
  product_category_id: ''
})

const resetNewItemForm = () => {
  newItemForm.value = {
    product_id: '',
    cd_key: '',
    purchase_time: formatDateTimeForInput(new Date().toISOString()), // 預設為當前時間
    purchase_store: '',
    purchase_payment_method: '',
    purchase_order_number: '',
    purchase_amount_cny: 0,
    purchase_amount_twd: 0,
    suggested_price: 0,
    status: '未售',
    remarks: '',
    selectedSeries: '',
    product_category_id: ''
  }
}

// actions: add/edit/delete/export/copy
const openAdd = () => { resetNewItemForm(); showAddModal.value = true }
const cancelAdd = () => { showAddModal.value = false }

const confirmAdd = async () => {
  try {
    isBusy.value = true
    errorMsg.value = null
    // 直接用 service 經由 composable
    const { createInventoryItem } = useInventory()
    await createInventoryItem({
      product_id: newItemForm.value.product_id,
      cd_key: newItemForm.value.cd_key,
      purchase_time: formatDateTimeForDB(newItemForm.value.purchase_time) || new Date().toISOString(),
      purchase_store: newItemForm.value.purchase_store,
      purchase_payment_method: newItemForm.value.purchase_payment_method,
      purchase_amount_cny: newItemForm.value.purchase_amount_cny,
      purchase_amount_twd: newItemForm.value.purchase_amount_twd,
      suggested_price: newItemForm.value.suggested_price,
      status: newItemForm.value.status,
      purchase_order_number: newItemForm.value.purchase_order_number,
      remarks: newItemForm.value.remarks
    })
    showAddModal.value = false
    resetNewItemForm()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '新增失敗'
  } finally {
    isBusy.value = false
  }
}

const openEdit = async (item: InventoryItem) => {
  // 確保交易資料已載入
  if (transactionsLoading.value) {
    await fetchTransactions()
  }

  // 找到對應的商品，獲取系列資訊
  const product = products.value.find(p => p.id === item.product_id);

  editingItem.value = {
    ...item,
    product_category_id: product?.product_category_id || '',
    selectedSeries: product?.series || '',
    // 將進貨時間轉換為 datetime-local 格式（包含秒）
    purchase_time: formatDateTimeForInput(item.purchase_time)
  };

  // 查找相關的交易資料
  const relatedTransaction = transactions.value.find(t => t.inventory_item_id === item.id);

  // 設置選中的客戶
  if (relatedTransaction?.customer_id) {
    const customer = customers.value.find(c => c.id === relatedTransaction.customer_id);
    selectedCustomer.value = customer || null;
  } else {
    selectedCustomer.value = null;
  }

  // 初始化銷貨資料表單
  saleFormData.value = {
    our_payment_method: relatedTransaction?.our_payment_method || '',
    our_bank_data: relatedTransaction?.our_bank_data || '',
    customer_payment_method: relatedTransaction?.customer_payment_method || '',
    customer_bank_code: relatedTransaction?.customer_bank_code || '',
    customer_bank_account: relatedTransaction?.customer_bank_account || '',
    customer_account_name: relatedTransaction?.customer_account_name || '',
    actual_price: relatedTransaction?.actual_price || 0,
    amount_received: relatedTransaction?.amount_received || 0,
    amount_difference: relatedTransaction?.amount_difference || 0,
    transactions_time: formatDateTimeForInput(relatedTransaction?.transactions_time),
    remarks: relatedTransaction?.remarks || '',
    customer_id: relatedTransaction?.customer_id || ''
  }
  showEditModal.value = true
}
const cancelEdit = () => {
  showEditModal.value = false;
  editingItem.value = null;
  selectedCustomer.value = null;
}
const saveEdit = async () => {
  if (!editingItem.value) return
  try {
    isBusy.value = true
    errorMsg.value = null

        // 更新庫存項目
    const { updateInventoryItem } = useInventory()
    await updateInventoryItem(editingItem.value.id, {
      product_id: editingItem.value.product_id,
      status: editingItem.value.status,
      cd_key: editingItem.value.cd_key,
      purchase_order_number: editingItem.value.purchase_order_number,
      purchase_time: formatDateTimeForDB(editingItem.value.purchase_time) || undefined,
      purchase_store: editingItem.value.purchase_store,
      purchase_payment_method: editingItem.value.purchase_payment_method,
      purchase_amount_cny: editingItem.value.purchase_amount_cny,
      purchase_amount_twd: editingItem.value.purchase_amount_twd,
      suggested_price: editingItem.value.suggested_price,
      remarks: editingItem.value.remarks
    })

        // 更新銷貨資料（如果存在相關交易）
    const relatedTransaction = transactions.value.find(t => t.inventory_item_id === editingItem.value!.id)
    const { } = useTransactions()

    if (relatedTransaction) {
      // 更新現有交易記錄
      try {
        const { TransactionService } = await import('@/services/supabaseService')

        const updateData = {
          customer_id: saleFormData.value.customer_id || null,
          our_payment_method: saleFormData.value.our_payment_method || null,
          our_bank_data: saleFormData.value.our_bank_data || null,
          customer_payment_method: saleFormData.value.customer_payment_method || null,
          customer_bank_code: saleFormData.value.customer_bank_code || null,
          customer_bank_account: saleFormData.value.customer_bank_account || null,
          customer_account_name: saleFormData.value.customer_account_name || null,
          actual_price: saleFormData.value.actual_price || 0,
          amount_received: saleFormData.value.amount_received || 0,
          amount_difference: saleFormData.value.amount_difference || 0,
          transactions_time: formatDateTimeForDB(saleFormData.value.transactions_time) || undefined,
          remarks: saleFormData.value.remarks || null
        }

        console.log('更新交易資料:', updateData)
        const response = await TransactionService.updateTransaction(relatedTransaction.id, updateData)

        if (response.error) {
          console.error('交易更新錯誤:', response.error)
          throw new Error(response.error.message)
        }

        console.log('交易更新成功:', response.data)
      } catch (e) {
        console.error('交易更新失敗:', e)
        throw e
      }
    } else {
      // 檢查是否有任何銷貨資料需要創建交易記錄（更寬鬆的判斷）
      const hasSalesData = saleFormData.value.actual_price > 0 ||
                          saleFormData.value.our_payment_method ||
                          saleFormData.value.our_bank_data ||
                          saleFormData.value.customer_payment_method ||
                          saleFormData.value.customer_bank_code ||
                          saleFormData.value.customer_bank_account ||
                          saleFormData.value.customer_account_name ||
                          saleFormData.value.amount_received > 0 ||
                          saleFormData.value.amount_difference !== 0 ||
                          saleFormData.value.remarks ||
                          saleFormData.value.transactions_time ||
                          saleFormData.value.customer_id;

            if (hasSalesData) {
        // 如果沒有相關交易但有銷貨資料，創建新的交易記錄
        const formattedTime = formatDateTimeForDB(saleFormData.value.transactions_time)

        try {
          // 直接使用 TransactionService 來獲得更好的錯誤處理
          const { TransactionService } = await import('@/services/supabaseService')

          const transactionData = {
            inventory_item_id: editingItem.value!.id,
            transactions_time: formattedTime || new Date().toISOString(),
            customer_id: saleFormData.value.customer_id || null,
            actual_price: saleFormData.value.actual_price || 0,
            amount_received: saleFormData.value.amount_received || 0,
            amount_difference: saleFormData.value.amount_difference || 0,
            our_payment_method: saleFormData.value.our_payment_method || null,
            our_bank_data: saleFormData.value.our_bank_data || null,
            customer_payment_method: saleFormData.value.customer_payment_method || null,
            customer_bank_code: saleFormData.value.customer_bank_code || null,
            customer_bank_account: saleFormData.value.customer_bank_account || null,
            customer_account_name: saleFormData.value.customer_account_name || null,
            remarks: saleFormData.value.remarks || null
          }

          console.log('交易資料:', transactionData)
          const response = await TransactionService.createTransaction(transactionData)

          if (response.error) {
            throw new Error(response.error.message)
          }
        } catch (e) {
          throw e
        }
      }
    }

    // 重新載入交易資料以確保資料同步
    await fetchTransactions()

    successMsg.value = '編輯成功！'
    showEditModal.value = false
    editingItem.value = null
    selectedCustomer.value = null

    // 3秒後清除成功訊息
    setTimeout(() => {
      successMsg.value = null
    }, 3000)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '更新失敗'
  } finally {
    isBusy.value = false
  }
}

const deleteItem = async (item: InventoryItem) => {
  if (!confirm(`確定要刪除庫存項目：${item.id}？`)) return
  try {
    isBusy.value = true
    errorMsg.value = null
    const { deleteInventoryItem } = useInventory()
    await deleteInventoryItem(item.id)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '刪除失敗'
  } finally {
    isBusy.value = false
  }
}

const exportInventory = () => {
  const rows = filteredInventory.value.map((it) => {
    const product = products.value.find(p => p.id === it.product_id)
    const category = productCategories.value.find(c => c.id === product?.product_category_id)
    return {
      商品ID: it.id,
      狀態: it.status,
      'CD Key': it.cd_key,
      商品分類: category?.category_name || '',
      商品名稱: product?.product_name || '',
      建議售價: it.suggested_price,
      訂單編號: it.purchase_order_number,
      進貨時間: it.purchase_time,
      進貨店家: it.purchase_store,
      '進貨金額(CNY)': it.purchase_amount_cny,
      '進貨金額(TWD)': it.purchase_amount_twd,
      付款方式: it.purchase_payment_method,
      建立時間: it.created_at,
      更新時間: it.updated_at,
    }
  })
  if (rows.length === 0) return alert('沒有可匯出的資料')
  const header = Object.keys(rows[0]).join(',')
  const body = rows.map(r => Object.values(r).map(v => String(v).replace(/,/g, '，')).join(',')).join('\n')
  const csv = 'data:text/csv;charset=utf-8,' + header + '\n' + body
  const link = document.createElement('a')
  link.href = encodeURI(csv)
  link.download = `inventory_${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyCdKey = (item: InventoryItem) => {
  if (!item.cd_key) { alert('此項目沒有 CD Key'); return }

  // 找到對應的商品和分類資訊
  const product = products.value.find(p => p.id === item.product_id)
  const category = productCategories.value.find(c => c.id === product?.product_category_id)

  // 構建複製的文字格式
  const copyText = `${category?.category_name || '未知分類'} - ${product?.series || '未知系列'} - ${product?.product_name || '未知商品'}，CDK如下：\n\`\`\`\n${item.cd_key}\n\`\`\``

  navigator.clipboard.writeText(copyText).then(() => alert('商品資訊已複製'))
}



// utils
const resetPagination = () => { currentPage.value = 1 }

const filteredInventory = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  // 若沒有任何庫存，直接回傳空陣列，避免 UI 誤判
  if (!inventoryItems.value || inventoryItems.value.length === 0) return []

  return inventoryItems.value.filter((item) => {
    const product = products.value.find((p) => p.id === item.product_id)
    const productName = product?.product_name?.toLowerCase() || ''
    const matchesSearch = term === ''
      || productName.includes(term)
      || String(item.cd_key || '').toLowerCase().includes(term)
      || String(item.purchase_order_number || '').toLowerCase().includes(term)

    const matchesSeries = seriesFilter.value === 'all' || product?.series === seriesFilter.value
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    const matchesStore = storeFilter.value === 'all' || item.purchase_store === storeFilter.value
    return matchesSearch && matchesSeries && matchesStatus && matchesStore
  })
})

const sortedInventory = computed(() => {
  const list = [...filteredInventory.value]
  const key = sortKey.value
  const order = sortOrder.value

  const getVal = (it: InventoryItem): string | number | Date => {
    if (key === 'product_name') return products.value.find(p => p.id === it.product_id)?.product_name || ''
    return (it as unknown as Record<string, string | number | Date>)[key]
  }

  list.sort((a, b) => {
    const va = getVal(a)
    const vb = getVal(b)
    let cmp = 0
    if (key === 'suggested_price') cmp = (Number(va) || 0) - (Number(vb) || 0)
    else if (key === 'created_at' || key === 'purchase_time') cmp = new Date(va || 0).getTime() - new Date(vb || 0).getTime()
    else cmp = String(va).localeCompare(String(vb))
    return order === 'asc' ? cmp : -cmp
  })
  return list
})

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedInventory.value.slice(start, start + itemsPerPage)
})
const totalPages = computed(() => Math.max(1, Math.ceil(sortedInventory.value.length / itemsPerPage)))

const allSeries = computed(() => {
  const set = new Set<string>()
  inventoryItems.value.forEach((it) => {
    const product = products.value.find((p) => p.id === it.product_id)
    if (product?.series) set.add(product.series)
  })
  return ['all', ...Array.from(set)]
})
const allStatuses = computed(() => ['all', ...Array.from(new Set(inventoryItems.value.map((i) => i.status)))])
const allStores = computed(() => ['all', ...Array.from(new Set(inventoryItems.value.map((i) => i.purchase_store).filter(Boolean)) as Set<string>)])

// actions
const setSort = (key: SortKey) => {
  if (sortKey.value === key) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortOrder.value = key === 'created_at' ? 'desc' : 'asc' }
  resetPagination()
}
const openDetail = async (item: InventoryItem) => {
  try {
    detailLoading.value = true
    detailItem.value = item
    // lazy import service to avoid circular deps
    const { InventoryService } = await import('@/services/supabaseService')
    const res = await InventoryService.getInventoryItemWithFullDetails(item.id)
    if (res.error) throw new Error(res.error.message)
    detailData.value = res.data
    showDetailModal.value = true
    } catch (err) {
    console.error(err)
    errorMsg.value = err instanceof Error ? err.message : '載入詳細資料失敗'
    } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  showDetailModal.value = false
  detailItem.value = null
  detailData.value = null
}

// effects
onMounted(async () => {
  isBusy.value = true
  errorMsg.value = null
  try {
    // 確保庫存一定先載入，即使商品/分類失敗也能顯示資料
    await fetchInventory()
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '載入庫存失敗'
  }

  // 商品與分類採平行、各自容錯
  try {
    await fetchProducts()
  } catch {
    errorMsg.value = '商品資料載入失敗'
  }
  try {
    await fetchCategories()
  } catch {
    // 忽略分類載入錯誤
  }
  try { await fetchPaymentMethods() } catch { /* 忽略錯誤 */ }
  try { await fetchBankData() } catch { /* 忽略錯誤 */ }
  try { await fetchTransactions() } catch { /* 忽略錯誤 */ }
  try { await fetchCustomers() } catch { /* 忽略錯誤 */ }

  isBusy.value = false
})

// 計算屬性：根據選擇的分類篩選商品系列
const filteredSeries = computed(() => {
  const categoryId = editingItem.value?.product_category_id || newItemForm.value.product_category_id
  if (!categoryId) return []

  const filteredProducts = products.value.filter(p => p.product_category_id === categoryId)
  const seriesSet = new Set<string>()
  filteredProducts.forEach(p => seriesSet.add(p.series))
  return Array.from(seriesSet)
})

// 計算屬性：根據選擇的分類和系列篩選商品
const filteredProductsBySeries = computed(() => {
  const categoryId = editingItem.value?.product_category_id || newItemForm.value.product_category_id
  const selectedSeries = editingItem.value?.selectedSeries || newItemForm.value.selectedSeries
  if (!categoryId || !selectedSeries) return []

  return products.value.filter(p =>
    p.product_category_id === categoryId &&
    p.series === selectedSeries
  )
})

// 監聽商品分類變化，重置系列和商品選擇
const handleCategoryChange = () => {
  if (editingItem.value) {
    editingItem.value.selectedSeries = ''
    editingItem.value.product_id = ''
  }
  if (newItemForm.value) {
    newItemForm.value.selectedSeries = ''
    newItemForm.value.product_id = ''
  }
}

// 監聽系列變化，重置商品選擇
const handleSeriesChange = () => {
  if (editingItem.value) {
    editingItem.value.product_id = ''
  }
  if (newItemForm.value) {
    newItemForm.value.product_id = ''
  }
}

// 計算屬性：根據選擇的付款方式篩選銀行資料
const filteredBankData = computed(() => {
  const selectedPaymentMethod = saleFormData.value.our_payment_method
  if (!selectedPaymentMethod) return ourBankData.value

  return ourBankData.value.filter(bank => bank.payment_method === selectedPaymentMethod)
})

// 監聽付款方式變化，清空不匹配的銀行資料
const handlePaymentMethodChange = () => {
  const selectedPaymentMethod = saleFormData.value.our_payment_method
  const selectedBankData = saleFormData.value.our_bank_data

  if (selectedBankData && selectedPaymentMethod) {
    const bank = ourBankData.value.find(b => b.id === selectedBankData)
    if (bank && bank.payment_method !== selectedPaymentMethod) {
      saleFormData.value.our_bank_data = ''
    }
  }
}

// 客戶選擇器相關方法
const openCustomerSelector = () => {
  showCustomerSelector.value = true
  customerSearchQuery.value = ''
}

const closeCustomerSelector = () => {
  showCustomerSelector.value = false
  customerSearchQuery.value = ''
}

const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  saleFormData.value.customer_id = customer.id
  showCustomerSelector.value = false
}

const clearSelectedCustomer = () => {
  selectedCustomer.value = null
  saleFormData.value.customer_id = ''
}

// 快速新增客戶相關方法
const openQuickAddCustomer = () => {
  showQuickAddCustomer.value = true
  // 重置表單
  quickAddCustomerForm.value = {
    name: '',
    nickname: '',
    phone: '',
    id_number: '',
    contact_method: '',
    contact_method_id: '',
    contact_method_account: '',
    contact_method_nickname: '',
    address: '',
    pubg_nickname: '',
    pubg_account_id: '',
    steam_id: ''
  }
}

const closeQuickAddCustomer = () => {
  showQuickAddCustomer.value = false
}

const confirmQuickAddCustomer = async () => {
  try {
    isBusy.value = true
    errorMsg.value = null

    const { createCustomer } = useCustomers()
    const newCustomer = await createCustomer(quickAddCustomerForm.value)

    // 自動選擇新建立的客戶
    if (newCustomer) {
      selectedCustomer.value = newCustomer
      saleFormData.value.customer_id = newCustomer.id
    }

    showQuickAddCustomer.value = false

    // 重新載入客戶資料
    await fetchCustomers()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '新增客戶失敗'
  } finally {
    isBusy.value = false
  }
}

// 時間格式化輔助函數
const formatDateTimeForInput = (dateTime: string | null | undefined): string => {
  if (!dateTime) return ''
  try {
    const date = new Date(dateTime)
    return date.toISOString().slice(0, 19) // 包含秒，不包含時區
  } catch {
    return ''
  }
}

// 時間格式化輔助函數 - 用於資料庫儲存
const formatDateTimeForDB = (dateTime: string | null | undefined): string | null => {
  if (!dateTime || dateTime.trim() === '') return null
  try {
    const date = new Date(dateTime)
    return date.toISOString() // 包含時區的完整格式
  } catch {
    return null
  }
}

// 篩選客戶列表
const filteredCustomersForSelector = computed(() => {
  const query = customerSearchQuery.value.toLowerCase().trim()
  if (!query) return customers.value.slice(0, 20) // 限制顯示數量

  return customers.value.filter(customer =>
    customer.name?.toLowerCase().includes(query) ||
    customer.nickname?.toLowerCase().includes(query) ||
    customer.phone?.includes(query) ||
    customer.pubg_nickname?.toLowerCase().includes(query) ||
    customer.contact_method_account?.toLowerCase().includes(query) ||
    customer.id_number?.includes(query)
  ).slice(0, 20)
})




</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">庫存管理</h1>
      </div>
    </div>

    <div v-if="anyError" class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-exclamation-triangle text-red-600 dark:text-red-400 mr-2"></i>
        <span class="text-red-800 dark:text-red-200">{{ anyError }}</span>
      </div>
    </div>

    <div v-if="successMsg" class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-check-circle text-green-600 dark:text-green-400 mr-2"></i>
        <span class="text-green-800 dark:text-green-200">{{ successMsg }}</span>
      </div>
    </div>

    <div v-if="isBusy || inventoryLoading || productsLoading || categoriesLoading || paymentMethodsLoading || bankDataLoading || transactionsLoading || customersLoading"
         class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-center">
        <i class="bi bi-arrow-clockwise text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
        <span class="text-blue-800 dark:text-blue-200">正在載入庫存資料...</span>
      </div>
    </div>

    <!-- 搜尋與篩選 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-3 gap-2">
        <span>搜尋結果：{{ filteredInventory.length }} 項</span>
        <span>總計：{{ inventoryItems.length }} 項</span>
        <span v-if="!inventoryLoading && !productsLoading">(庫存：{{ inventoryItems.length }}，商品：{{ products.length }})</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜尋</label>
          <input v-model="searchQuery" type="text" placeholder="搜尋商品名稱、CD Key、訂單編號..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                 @input="resetPagination" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">商品系列</label>
          <select v-model="seriesFilter" @change="resetPagination"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部系列</option>
            <option v-for="s in allSeries.slice(1)" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">狀態</label>
          <select v-model="statusFilter" @change="resetPagination"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部狀態</option>
            <option v-for="st in allStatuses.slice(1)" :key="st" :value="st">{{ st }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">進貨店家</label>
          <select v-model="storeFilter" @change="resetPagination"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="all">全部店家</option>
            <option v-for="st in allStores.slice(1)" :key="st" :value="st">{{ st }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div class="space-x-2">
          <button @click="exportInventory" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded">匯出</button>
          <button @click="openAdd" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded">新增</button>
        </div>
        <div class="flex items-center space-x-2 text-sm">
          <span class="text-gray-600 dark:text-gray-300">排序：</span>
          <button @click="setSort('created_at')" :class="['px-2 py-1 rounded border', sortKey==='created_at' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600']">建立時間 {{ sortKey==='created_at' ? (sortOrder==='asc'?'↑':'↓') : '' }}</button>
          <button @click="setSort('purchase_time')" :class="['px-2 py-1 rounded border', sortKey==='purchase_time' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600']">進貨時間 {{ sortKey==='purchase_time' ? (sortOrder==='asc'?'↑':'↓') : '' }}</button>
          <button @click="setSort('suggested_price')" :class="['px-2 py-1 rounded border', sortKey==='suggested_price' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600']">售價 {{ sortKey==='suggested_price' ? (sortOrder==='asc'?'↑':'↓') : '' }}</button>
          <button @click="setSort('product_name')" :class="['px-2 py-1 rounded border', sortKey==='product_name' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600']">商品名稱 {{ sortKey==='product_name' ? (sortOrder==='asc'?'↑':'↓') : '' }}</button>
          <button @click="setSort('status')" :class="['px-2 py-1 rounded border', sortKey==='status' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600']">狀態 {{ sortKey==='status' ? (sortOrder==='asc'?'↑':'↓') : '' }}</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">商品資訊</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">進貨資訊</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">銷貨資訊</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">客戶資訊</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">狀態</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="paginatedInventory.length === 0">
            <td class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400" colspan="6">
              {{ (inventoryLoading || productsLoading || isBusy) ? '載入中…' : '沒有資料' }}
            </td>
          </tr>
          <tr v-for="item in paginatedInventory" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ products.find(p => p.id === item.product_id)?.product_name || '未知商品' }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ productCategories.find(c => c.id === products.find(p => p.id === item.product_id)?.product_category_id)?.category_name || '未知分類' }} / {{ products.find(p => p.id === item.product_id)?.series || '未知系列' }}
                  </div>
                  <div class="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    NT$ {{ item.suggested_price?.toLocaleString() || '0' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    CD Key: {{ item.cd_key || '無' }}
                  </div>
                  <div v-if="item.remarks" class="text-xs text-gray-500 dark:text-gray-400">
                    備註: {{ item.remarks }}
                  </div>
                </div>
              </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ item.purchase_store }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">進貨時間: {{ item.purchase_time }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">¥{{ item.purchase_amount_cny }} / NT${{ item.purchase_amount_twd }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    銷貨時間: {{ transactions.find(t => t.inventory_item_id === item.id)?.transactions_time || '未售出' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    NT${{ transactions.find(t => t.inventory_item_id === item.id)?.actual_price?.toLocaleString() || '0' }} / NT${{ transactions.find(t => t.inventory_item_id === item.id)?.amount_received?.toLocaleString() || '0' }} / NT${{ transactions.find(t => t.inventory_item_id === item.id)?.amount_difference?.toLocaleString() || '0' }}
                  </div>
                  <div v-if="transactions.find(t => t.inventory_item_id === item.id)?.remarks" class="text-xs text-gray-500 dark:text-gray-400">
                    備註: {{ transactions.find(t => t.inventory_item_id === item.id)?.remarks }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ customers.find(c => c.id === transactions.find(t => t.inventory_item_id === item.id)?.customer_id)?.name || '未售出' }}
                    {{ customers.find(c => c.id === transactions.find(t => t.inventory_item_id === item.id)?.customer_id)?.nickname ? `(${customers.find(c => c.id === transactions.find(t => t.inventory_item_id === item.id)?.customer_id)?.nickname})` : '' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ customers.find(c => c.id === transactions.find(t => t.inventory_item_id === item.id)?.customer_id)?.phone || '' }}
                  </div>

                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1',
                    item.status === '未售' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    : item.status === '預訂' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : item.status === '已售' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : item.status === '自用' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : item.status === '福利' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                    : item.status === '淘退' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : item.status === '被盜' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : item.status === '補償' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  ]">{{ item.status }}</span>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    建立: {{ new Date(item.created_at).toLocaleString('zh-TW') }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    更新: {{ new Date(item.updated_at).toLocaleString('zh-TW') }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-4">
                <button @click="openDetail(item)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="查看詳細">
                  <i class="bi bi-eye text-xl"></i>
                  </button>
                <button @click="openEdit(item)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="編輯">
                  <i class="bi bi-pencil text-xl"></i>
                </button>
                <button v-if="item.status === '未售'" @click="deleteItem(item)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="刪除">
                  <i class="bi bi-trash text-xl"></i>
                </button>
                <button @click="copyCdKey(item)" class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" title="複製商品資訊">
                  <i class="bi bi-clipboard text-xl"></i>
                </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1" class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                顯示第 {{ (currentPage - 1) * itemsPerPage + 1 }} 到 {{ Math.min(currentPage * itemsPerPage, filteredInventory.length) }} 項，
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
                ]">{{ page }}</button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center py-4">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">

        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-plus-circle text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              新增庫存
            </h3>
          </div>
          <button @click="cancelAdd" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- 商品資料 -->
        <div class="p-4">
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-box-seam text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">商品資料</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品分類</label>
                <select v-model="newItemForm.product_category_id" @change="handleCategoryChange" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇商品分類</option>
                  <option v-for="category in productCategories" :key="category.id" :value="category.id">
                    {{ category.category_name }}
                  </option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品系列</label>
                <select v-model="newItemForm.selectedSeries" @change="handleSeriesChange" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200" :disabled="!newItemForm.product_category_id">
                  <option value="">請選擇商品系列</option>
                  <option v-for="series in filteredSeries" :key="series" :value="series">
                    {{ series }}
                  </option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品名稱</label>
                <select v-model="newItemForm.product_id" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200" :disabled="!newItemForm.selectedSeries">
                  <option value="">請選擇商品</option>
                  <option v-for="product in filteredProductsBySeries" :key="product.id" :value="product.id">
                    {{ product.product_name }}
                  </option>
                </select>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">CD Key</label>
                <input type="text" v-model="newItemForm.cd_key"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200 font-mono">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨日期及時間</label>
                <input type="datetime-local" v-model="newItemForm.purchase_time" step="1"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨編號</label>
                <input type="text" v-model="newItemForm.purchase_order_number"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨店家</label>
                <input type="text" v-model="newItemForm.purchase_store"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">付款方式</label>
                <select v-model="newItemForm.purchase_payment_method" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇付款方式</option>
                  <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                    {{ method.payment_method }}
                  </option>
                </select>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨金額(CNY)</label>
                <input type="number" v-model.number="newItemForm.purchase_amount_cny"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨金額(TWD)</label>
                <input type="number" v-model.number="newItemForm.purchase_amount_twd"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">建議價格</label>
                <input type="number" v-model.number="newItemForm.suggested_price"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">備註</label>
                <input type="text" v-model="newItemForm.remarks" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- 商品狀態 -->
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-tag text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">商品狀態</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">狀態</label>
                <select v-model="newItemForm.status" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="未售">未售</option>
                  <option value="預訂">預訂</option>
                  <option value="已售">已售</option>
                  <option value="自用">自用</option>
                  <option value="福利">福利</option>
                  <option value="淘退">淘退</option>
                  <option value="被盜">被盜</option>
                  <option value="補償">補償</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="cancelAdd" type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            取消
          </button>
          <button @click="confirmAdd" type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            確認新增
          </button>
        </div>
      </div>
    </div>

    <!-- 編輯 Modal -->
    <div v-if="showEditModal && editingItem" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center py-4">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">

        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-pencil-square text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              編輯交易資料
            </h3>
          </div>
          <button @click="cancelEdit" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- 商品資料 -->
        <div class="p-4">
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-box-seam text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">商品資料</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">庫存 UUID</label>
                <input type="text" :value="editingItem.id"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg text-gray-600 bg-gray-100" disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品狀態</label>
                <select v-model="editingItem.status" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="未售">未售</option>
                  <option value="預訂">預訂</option>
                  <option value="已售">已售</option>
                  <option value="自用">自用</option>
                  <option value="福利">福利</option>
                  <option value="淘退">淘退</option>
                  <option value="被盜">被盜</option>
                  <option value="補償">補償</option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品分類</label>
                <select v-model="editingItem.product_category_id" @change="handleCategoryChange" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇商品分類</option>
                  <option v-for="category in productCategories" :key="category.id" :value="category.id">
                    {{ category.category_name }}
                  </option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品系列</label>
                <select v-model="editingItem.selectedSeries" @change="handleSeriesChange" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200" :disabled="!editingItem.product_category_id">
                  <option value="">請選擇商品系列</option>
                  <option v-for="series in filteredSeries" :key="series" :value="series">
                    {{ series }}
                  </option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">商品名稱</label>
                <select v-model="editingItem.product_id" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200" :disabled="!editingItem.selectedSeries">
                  <option value="">請選擇商品</option>
                  <option v-for="product in filteredProductsBySeries" :key="product.id" :value="product.id">
                    {{ product.product_name }}
                  </option>
                </select>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">CD Key</label>
                <input type="text" v-model="editingItem.cd_key"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200 font-mono">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨日期及時間</label>
                <input type="datetime-local" v-model="editingItem.purchase_time" step="1"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨編號</label>
                <input type="text" v-model="editingItem.purchase_order_number"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨店家</label>
                <input type="text" v-model="editingItem.purchase_store"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">付款方式</label>
                <select v-model="editingItem.purchase_payment_method" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇付款方式</option>
                  <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                    {{ method.payment_method }}
                  </option>
                </select>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨金額(CNY)</label>
                <input type="number" v-model.number="editingItem.purchase_amount_cny"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">進貨金額(TWD)</label>
                <input type="number" v-model.number="editingItem.purchase_amount_twd"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">建議價格</label>
                <input type="number" v-model.number="editingItem.suggested_price"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">備註</label>
                <input type="text" v-model="editingItem.remarks" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- 銷貨資料 -->
          <div class="mb-4">
            <div class="flex items-center mb-3">
              <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                <i class="bi bi-cart-check text-white text-xs"></i>
              </div>
              <h4 class="text-base font-semibold text-gray-800">銷貨資料</h4>
            </div>
            <div class="grid grid-cols-12 gap-3">
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">銷貨 UUID</label>
                <input type="text" :value="transactions.find(t => t.inventory_item_id === editingItem?.id)?.id || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">銷貨日期及時間</label>
                <input type="datetime-local" v-model="saleFormData.transactions_time" step="1"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">我方收款方式</label>
                <select v-model="saleFormData.our_payment_method" @change="handlePaymentMethodChange" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇收款方式</option>
                  <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                    {{ method.payment_method }}
                  </option>
                </select>
              </div>
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">我方收款帳戶資料</label>
                <select v-model="saleFormData.our_bank_data" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇收款帳戶</option>
                  <option v-for="bank in filteredBankData" :key="bank.id" :value="bank.id">
                    {{ bank.bank_name || bank.bank_code }} - {{ bank.account_number }} ({{ bank.account_holder }} {{ bank.bank_branche_name || bank.account_branche }})
                  </option>
                </select>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶付款方式</label>
                <select v-model="saleFormData.customer_payment_method" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
                  <option value="">請選擇付款方式</option>
                  <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                    {{ method.payment_method }}
                  </option>
                </select>
              </div>
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶付款帳號名稱</label>
                <input type="text" v-model="saleFormData.customer_account_name" placeholder="請輸入客戶帳號名稱"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶付款銀行代號</label>
                <input type="text" v-model="saleFormData.customer_bank_code" placeholder="請輸入銀行代號"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶付款銀行帳號</label>
                <input type="text" v-model="saleFormData.customer_bank_account" placeholder="請輸入銀行帳號"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">實際售價</label>
                <input type="number" v-model.number="saleFormData.actual_price" placeholder="請輸入實際售價"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">實收金額</label>
                <input type="number" v-model.number="saleFormData.amount_received" placeholder="請輸入實收金額"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">款項差異</label>
                <input type="number" :value="Math.round((saleFormData.amount_received - saleFormData.actual_price) * 100) / 100" placeholder="自動計算"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">備註</label>
                <input type="text" v-model="saleFormData.remarks" class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg transition-all duration-200">
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 my-4"></div>

          <!-- 客戶資料 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <div class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                  <i class="bi bi-person-circle text-white text-xs"></i>
                </div>
                <h4 class="text-base font-semibold text-gray-800">客戶資料</h4>
              </div>
              <div class="flex space-x-2">
                <button @click="openCustomerSelector" type="button" class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <i class="bi bi-search mr-1"></i>選擇客戶
                </button>
                <button @click="openQuickAddCustomer" type="button" class="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <i class="bi bi-plus mr-1"></i>新增客戶
                </button>
              </div>
            </div>

            <!-- 已選擇的客戶顯示 -->
            <div v-if="selectedCustomer || saleFormData.customer_id" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <i class="bi bi-person text-white text-lg"></i>
                  </div>
                  <div>
                    <h5 class="font-medium text-gray-900">{{ selectedCustomer?.name || customers.find(c => c.id === saleFormData.customer_id)?.name || '未知客戶' }}</h5>
                    <p class="text-sm text-gray-600">{{ selectedCustomer?.nickname || customers.find(c => c.id === saleFormData.customer_id)?.nickname || '' }}</p>
                    <p class="text-sm text-gray-600">{{ selectedCustomer?.phone || customers.find(c => c.id === saleFormData.customer_id)?.phone || '' }}</p>
                  </div>
                </div>
                <button @click="clearSelectedCustomer" class="text-red-600 hover:text-red-800">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- 客戶詳細資料 -->
            <div v-if="selectedCustomer || saleFormData.customer_id" class="grid grid-cols-12 gap-3">
              <div class="col-span-8 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶 ID</label>
                <input type="text" :value="selectedCustomer?.id || saleFormData.customer_id || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶身份證字號</label>
                <input type="text" :value="selectedCustomer?.id_number || customers.find(c => c.id === saleFormData.customer_id)?.id_number || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶姓名</label>
                <input type="text" :value="selectedCustomer?.name || customers.find(c => c.id === saleFormData.customer_id)?.name || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶暱稱</label>
                <input type="text" :value="selectedCustomer?.nickname || customers.find(c => c.id === saleFormData.customer_id)?.nickname || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶連絡電話</label>
                <input type="text" :value="selectedCustomer?.phone || customers.find(c => c.id === saleFormData.customer_id)?.phone || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-12 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶地址</label>
                <input type="text" :value="selectedCustomer?.address || customers.find(c => c.id === saleFormData.customer_id)?.address || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">客戶聯絡方式</label>
                <input type="text" :value="selectedCustomer?.contact_method || customers.find(c => c.id === saleFormData.customer_id)?.contact_method || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式 ID</label>
                <input type="text" :value="selectedCustomer?.contact_method_id || customers.find(c => c.id === saleFormData.customer_id)?.contact_method_id || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式帳號</label>
                <input type="text" :value="selectedCustomer?.contact_method_account || customers.find(c => c.id === saleFormData.customer_id)?.contact_method_account || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-3 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">聯絡方式暱稱</label>
                <input type="text" :value="selectedCustomer?.contact_method_nickname || customers.find(c => c.id === saleFormData.customer_id)?.contact_method_nickname || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Nickname</label>
                <input type="text" :value="selectedCustomer?.pubg_nickname || customers.find(c => c.id === saleFormData.customer_id)?.pubg_nickname || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">PUBG Account ID</label>
                <input type="text" :value="selectedCustomer?.pubg_account_id || customers.find(c => c.id === saleFormData.customer_id)?.pubg_account_id || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
              <div class="col-span-4 flex flex-col">
                <label class="text-sm font-medium text-gray-700 mb-1">Steam ID</label>
                <input type="text" :value="selectedCustomer?.steam_id || customers.find(c => c.id === saleFormData.customer_id)?.steam_id || ''"
                  class="w-full px-3 py-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none rounded-lg bg-gray-50 text-gray-600"
                  disabled>
              </div>
            </div>

            <!-- 未選擇客戶時的提示 -->
            <div v-else class="text-center py-8 text-gray-500">
              <i class="bi bi-person-x text-4xl mb-2"></i>
              <p>尚未選擇客戶</p>
              <p class="text-sm">請點擊上方按鈕選擇或新增客戶</p>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="cancelEdit" type="button"
            class="mx-2 py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-200 shadow-sm">
            取消
          </button>
          <button @click="saveEdit" type="button"
            class="mx-2 py-2 px-4 text-sm font-medium text-white focus:outline-none bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg border border-blue-500 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm">
            編輯
          </button>
        </div>
      </div>
    </div>


    <!-- 詳細資料模態框 -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <i class="bi bi-info-circle text-2xl text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 ml-3">商品詳細資料</h3>
            </div>
            <button @click="closeDetail" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <div v-if="detailLoading" class="flex items-center justify-center py-8">
            <i class="bi bi-arrow-clockwise text-2xl text-blue-600 dark:text-blue-400 animate-spin mr-2"></i>
            <span class="text-blue-800 dark:text-blue-200">正在載入詳細資料...</span>
          </div>

          <div v-else-if="detailData" class="space-y-6">
            <!-- 基本資訊 -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">基本資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span class="text-gray-600 dark:text-gray-400">商品ID：</span><span class="font-medium">{{ detailData?.id || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">商品名稱：</span><span class="font-medium">{{ detailData?.product?.product_name || '未知商品' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">商品系列：</span><span class="font-medium">{{ detailData?.product?.series || '未知系列' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">商品分類：</span><span class="font-medium">{{ detailData?.product_category?.category_name || '未知分類' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">遊戲內價格(G-Coin)：</span><span class="font-medium">{{ detailData?.product?.in_game_price_gcoin ? `${detailData.product.in_game_price_gcoin} G-Coin` : '未設定' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">遊戲內價格(USD)：</span><span class="font-medium">{{ detailData?.product?.in_game_price_usd ? `$${detailData.product.in_game_price_usd}` : '未設定' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">CD Key：</span><span class="font-medium font-mono">{{ detailData?.cd_key || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">狀態：</span>
                  <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    detailData?.status === '未售' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    : detailData?.status === '預訂' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : detailData?.status === '已售' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200']">{{ detailData?.status || '' }}</span>
              </div>
              </div>
            </div>

            <!-- 進貨資訊 -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">進貨資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span class="text-gray-600 dark:text-gray-400">訂單編號：</span><span class="font-medium">{{ detailData?.purchase_order_number || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">進貨時間：</span><span class="font-medium">{{ detailData?.purchase_time || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">進貨店家：</span><span class="font-medium">{{ detailData?.purchase_store || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">付款方式：</span><span class="font-medium">{{ detailData?.purchase_payment_method || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">進貨金額(CNY)：</span><span class="font-medium">¥{{ detailData?.purchase_amount_cny?.toLocaleString() || '0' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">進貨金額(TWD)：</span><span class="font-medium">NT${{ detailData?.purchase_amount_twd?.toLocaleString() || '0' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">建議售價：</span><span class="font-medium">NT${{ detailData?.suggested_price?.toLocaleString() || '0' }}</span></div>
              </div>
            </div>

            <!-- 銷貨資料（交易） -->
            <div v-if="detailData?.transaction" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">銷貨資料</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span class="text-gray-600 dark:text-gray-400">交易ID：</span><span class="font-medium">{{ detailData?.transaction?.id || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">交易時間：</span><span class="font-medium">{{ detailData?.transaction?.transactions_time || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">實際售價：</span><span class="font-medium">NT${{ detailData?.transaction?.actual_price?.toLocaleString() || '0' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">實收金額：</span><span class="font-medium">NT${{ detailData?.transaction?.amount_received?.toLocaleString() || '0' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">款項差異：</span><span class="font-medium">NT${{ detailData?.transaction?.amount_difference?.toLocaleString() || '0' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">我方收款方式：</span><span class="font-medium">{{ detailData?.transaction?.our_payment_method || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">我方收款銀行：</span><span class="font-medium">{{ detailData?.transaction?.our_bank_data ? (ourBankData.find(bank => bank.id === detailData?.transaction?.our_bank_data)?.bank_name || detailData?.transaction?.our_bank_data) : '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶付款方式：</span><span class="font-medium">{{ detailData?.transaction?.customer_payment_method || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶銀行代碼：</span><span class="font-medium">{{ detailData?.transaction?.customer_bank_code || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶銀行帳號：</span><span class="font-medium">{{ detailData?.transaction?.customer_bank_account || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶帳戶名稱：</span><span class="font-medium">{{ detailData?.transaction?.customer_account_name || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">備註：</span><span class="font-medium">{{ detailData?.transaction?.remarks || '' }}</span></div>
              </div>
            </div>

            <!-- 客戶資料 -->
            <div v-if="detailData?.transaction?.customer" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">客戶資料</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span class="text-gray-600 dark:text-gray-400">客戶ID：</span><span class="font-medium">{{ detailData?.transaction?.customer?.id || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶姓名：</span><span class="font-medium">{{ detailData?.transaction?.customer?.name || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶暱稱：</span><span class="font-medium">{{ detailData?.transaction?.customer?.nickname || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">聯絡電話：</span><span class="font-medium">{{ detailData?.transaction?.customer?.phone || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">身分證字號：</span><span class="font-medium">{{ detailData?.transaction?.customer?.id_number || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">聯絡方式：</span><span class="font-medium">{{ detailData?.transaction?.customer?.contact_method || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">聯絡方式ID：</span><span class="font-medium">{{ detailData?.transaction?.customer?.contact_method_id || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">聯絡方式帳號：</span><span class="font-medium">{{ detailData?.transaction?.customer?.contact_method_account || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">聯絡方式暱稱：</span><span class="font-medium">{{ detailData?.transaction?.customer?.contact_method_nickname || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">客戶地址：</span><span class="font-medium">{{ detailData?.transaction?.customer?.address || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">PUBG暱稱：</span><span class="font-medium">{{ detailData?.transaction?.customer?.pubg_nickname || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">PUBG帳號ID：</span><span class="font-medium">{{ detailData?.transaction?.customer?.pubg_account_id || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">Steam ID：</span><span class="font-medium">{{ detailData?.transaction?.customer?.steam_id || '' }}</span></div>
            </div>
          </div>

            <!-- 提示：已售但無交易 -->
            <div v-if="detailData?.status === '已售' && !detailData?.transaction" class="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
            <div class="flex items-center">
                <i class="bi bi-exclamation-triangle text-orange-600 dark:text-orange-400 mr-2"></i>
                <span class="text-orange-800 dark:text-orange-200">此商品狀態為「已售」，但沒有找到相關的交易記錄。</span>
              </div>
          </div>

            <!-- 系統資訊 -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-3">系統資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span class="text-gray-600 dark:text-gray-400">建立時間：</span><span class="font-medium">{{ detailData?.created_at || '' }}</span></div>
                <div><span class="text-gray-600 dark:text-gray-400">更新時間：</span><span class="font-medium">{{ detailData?.updated_at || '' }}</span></div>
              </div>
              </div>
            </div>

          <div class="flex justify-end mt-6">
            <button @click="closeDetail" class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300">關閉</button>
              </div>
              </div>
      </div>
    </div>

    <!-- 客戶選擇器 -->
    <div v-if="showCustomerSelector" class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-person-circle text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              選擇客戶
            </h3>
          </div>
          <button @click="closeCustomerSelector" class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">搜尋客戶</label>
            <input v-model="customerSearchQuery" type="text" placeholder="輸入客戶名稱、暱稱或電話..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">客戶資料</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="filteredCustomersForSelector.length === 0">
                  <td class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400" colspan="2">
                    沒有符合條件的客戶
                  </td>
                </tr>
                <tr v-for="customer in filteredCustomersForSelector" :key="customer.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                     <td class="px-6 py-4 whitespace-nowrap">
                     <div class="flex items-center">
                       <div class="flex-shrink-0 h-10 w-10">
                         <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                           <i class="bi bi-person text-white text-lg"></i>
                         </div>
                       </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ customer.name }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ customer.nickname }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ customer.phone }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="selectCustomer(customer)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2">選擇</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
                 <div class="flex items-center justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
           <button @click="openQuickAddCustomer" class="mx-2 py-2 px-4 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200">
             新增客戶
           </button>
           <button @click="closeCustomerSelector" class="mx-2 py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-200 shadow-sm">
             關閉
           </button>
         </div>
      </div>
    </div>

    <!-- 快速新增客戶 Modal -->
    <div v-if="showQuickAddCustomer" class="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div class="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-100 mx-4">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="bi bi-plus-circle text-white text-xs"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
              新增客戶
            </h3>
          </div>
          <button @click="closeQuickAddCustomer" class="text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center transition-all duration-200 shadow-sm border border-gray-200">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
            <input v-model="quickAddCustomerForm.name" type="text" placeholder="請輸入姓名"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">暱稱</label>
            <input v-model="quickAddCustomerForm.nickname" type="text" placeholder="請輸入暱稱"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">電話</label>
            <input v-model="quickAddCustomerForm.phone" type="text" placeholder="請輸入電話"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">身份證字號</label>
            <input v-model="quickAddCustomerForm.id_number" type="text" placeholder="請輸入身份證字號"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">聯絡方式</label>
            <input v-model="quickAddCustomerForm.contact_method" type="text" placeholder="請輸入聯絡方式"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">聯絡方式 ID</label>
            <input v-model="quickAddCustomerForm.contact_method_id" type="text" placeholder="請輸入聯絡方式 ID"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">聯絡方式帳號</label>
            <input v-model="quickAddCustomerForm.contact_method_account" type="text" placeholder="請輸入聯絡方式帳號"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">聯絡方式暱稱</label>
            <input v-model="quickAddCustomerForm.contact_method_nickname" type="text" placeholder="請輸入聯絡方式暱稱"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">地址</label>
            <input v-model="quickAddCustomerForm.address" type="text" placeholder="請輸入地址"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PUBG Nickname</label>
            <input v-model="quickAddCustomerForm.pubg_nickname" type="text" placeholder="請輸入PUBG Nickname"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">PUBG Account ID</label>
            <input v-model="quickAddCustomerForm.pubg_account_id" type="text" placeholder="請輸入PUBG Account ID"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Steam ID</label>
            <input v-model="quickAddCustomerForm.steam_id" type="text" placeholder="請輸入Steam ID"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div class="flex items-center justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button @click="closeQuickAddCustomer" class="mx-2 py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all duration-200 shadow-sm">
            取消
          </button>
          <button @click="confirmQuickAddCustomer" class="mx-2 py-2 px-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            確認新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

