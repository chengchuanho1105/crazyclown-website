<script setup lang="ts">
defineOptions({ name: 'CrazyClown-Store' })

// ---------- Vue 核心工具函式 ----------
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// ---------- 組件引入區（版面用） ----------
import DecorSection from '@/components/DecorSection.vue'

// ---------- 工具函式 ----------
import { useSheetData } from '@/composables/useSheetData'

// ---------- 資料處理 ----------
// 移除本地資料引入

/** ========== 商品資料處理 ========== */

interface ProductListData {
  category: string
  currency: string
  name: string
  usd?: number
  gcoin?: number
  specialPrice: number
  hotSale: boolean
}

/** 2. 取得商品資料 CSV 來源 */
const PRODUCTLISTDATA_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBdBIEkQ5g_U0tXrNAdLXwaViW_NhBPy3EwPhiiJ3oX8vinj-K69yBeVHtJmbVFXPBqY7i09Os5GTE/pub?gid=1913119360&single=true&output=csv'

/** 3. 定義 CSV 欄位轉換函式 */
const mapProductListData = (item: Record<string, string>): ProductListData => {
  return {
    category: item.category || '',
    currency: item.currency || '',
    name: item.name || '',
    usd: item.usd ? Number(item.usd) : undefined,
    gcoin: item.gcoin ? Number(item.gcoin) : undefined,
    specialPrice: Number(item.specialPrice) || 0,
    hotSale: item.hotSale === 'true',
  }
}

const {
  data: productListData,
  loading: productListDataLoading,
  error: productListDataError,
  load: loadProductListData,
} = useSheetData<ProductListData>(PRODUCTLISTDATA_CSV_URL, mapProductListData)

const usd2twd = ref(30)
const FEE = ref(1.03)
const USD2TWD_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBdBIEkQ5g_U0tXrNAdLXwaViW_NhBPy3EwPhiiJ3oX8vinj-K69yBeVHtJmbVFXPBqY7i09Os5GTE/pub?gid=1049789859&single=true&output=csv'
async function fetchUsd2Twd() {
  try {
    const response = await fetch(USD2TWD_CSV_URL)
    const csvText = await response.text()
    const lines = csvText.trim().split('\n')

    if (lines.length > 0) {
      const data = lines[1].split(',')
      if (data.length >= 2) {
        usd2twd.value = parseFloat(data[0])
        FEE.value = parseFloat(data[1])
      }
    }
  } catch {
    // 保留預設值
  }
}

onMounted(() => {
  loadProductListData()
  fetchUsd2Twd()
})

const GCOIN2TWD = computed(() => (usd2twd.value / 100) * FEE.value) // 1 G-Coin = 1/100 USD * 匯率 * 手續費

// 以 category 為分頁
const tabs = computed(() => {
  const set = new Set<string>()
  productListData.value.forEach((item) => set.add(item.category))
  return Array.from(set)
})

// 監聽 tabs 變化，自動設定第一個分類為預設
const activeTab = ref('')
watch(
  tabs,
  (newTabs: string[]) => {
    if (newTabs.length > 0 && !activeTab.value) {
      activeTab.value = newTabs[0]
    }
  },
  { immediate: true },
)

const filteredList = computed(() =>
  productListData.value.filter((item) => item.category === activeTab.value),
)

interface ProductItem {
  name: string
  price: string
  usd: string
  currency?: string
  gcoin?: string
}
const tooltip = ref<{
  visible: boolean
  x: number
  y: number
  item: ProductItem | null
  arrowLeft?: number
}>({ visible: false, x: 0, y: 0, item: null })
function showTooltip(e: MouseEvent | TouchEvent, item: ProductItem) {
  tooltip.value.visible = true
  tooltip.value.item = item
  nextTick(() => {
    let tr: HTMLElement | null = null
    if ('currentTarget' in e && e.currentTarget) {
      tr = e.currentTarget as HTMLElement
    } else if ('target' in e && (e.target as HTMLElement).closest) {
      tr = (e.target as HTMLElement).closest('tr')
    }
    if (tr) {
      const trRect = tr.getBoundingClientRect()
      const tooltipWidth = 220
      // 泡泡垂直位置固定在該列下半部
      const top = trRect.top + trRect.height / 2 + 20
      // 泡泡水平位置跟隨游標，但不超出該列左右
      let left = 0
      if ('clientX' in e) {
        left = e.clientX - tooltipWidth / 2
        if (left < trRect.left + 8) left = trRect.left + 8
        if (left + tooltipWidth > trRect.right - 8) left = trRect.right - tooltipWidth - 8
      } else {
        left = trRect.left + (trRect.width - tooltipWidth) / 2
      }
      tooltip.value.x = left
      tooltip.value.y = top
      tooltip.value.arrowLeft = tooltipWidth / 2 - 10
    }
  })
}
function hideTooltip() {
  tooltip.value.visible = false
}
function toggleTooltip(e: MouseEvent | TouchEvent, item: ProductItem) {
  if (tooltip.value.visible && tooltip.value.item === item) {
    hideTooltip()
  } else {
    showTooltip(e, item)
  }
}
function handleTouchOutside(e: Event) {
  const popup = document.querySelector('.gcoin-tooltip-popup')
  if (popup && !popup.contains(e.target as Node)) {
    hideTooltip()
  }
}
onMounted(() => {
  document.addEventListener('touchstart', handleTouchOutside)
  document.addEventListener('mousedown', handleTouchOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('touchstart', handleTouchOutside)
  document.removeEventListener('mousedown', handleTouchOutside)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <DecorSection
      :mainTitle="`<i class='bi bi-currency-exchange'></i> 特惠商品`"
      enTitle="Promotion List"
    >
      <div v-if="productListDataLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
      </div>
      <div
        v-else-if="productListDataError"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 dark:text-red-300">{{ productListDataError }}</p>
          </div>
        </div>
      </div>
      <div
        v-else-if="productListData.length === 0"
        class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 m-4"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700 dark:text-yellow-300">沒有找到商品資料</p>
          </div>
        </div>
      </div>
      <div
        v-else
        class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 mb-8 border border-zinc-200 dark:border-zinc-700"
      >
        <h2
          class="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2"
        ></h2>
        <!-- 分頁頁籤 -->
        <div class="flex gap-2 mb-4">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="[
              'px-4 py-2 rounded-t-lg font-bold',
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200',
            ]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <div
          class="max-w-xl mx-auto my-4 overflow-x-auto border border-zinc-200 dark:border-zinc-700 rounded-xl p-2"
        >
          <table
            class="gcoin-table w-full min-w-[320px] text-base border-separate border-spacing-y-2"
          >
            <thead>
              <tr class="text-base text-zinc-600 dark:text-zinc-300">
                <th class="py-2 px-2 text-center">商品名稱</th>
                <th class="py-2 px-2 text-end">優惠價</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredList"
                :key="item.name"
                :class="[
                  'transition',
                  item.hotSale
                    ? 'bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 font-bold ring-2 ring-yellow-400/20'
                    : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900',
                ]"
                @mouseenter="
                  showTooltip($event, {
                    name: item.name,
                    price: String(item.specialPrice),
                    usd: String(item.usd ?? ''),
                    gcoin: String(item.gcoin ?? ''),
                    currency: item.currency,
                  })
                "
                @mousemove="
                  showTooltip($event, {
                    name: item.name,
                    price: String(item.specialPrice),
                    usd: String(item.usd ?? ''),
                    gcoin: String(item.gcoin ?? ''),
                    currency: item.currency,
                  })
                "
                @mouseleave="hideTooltip"
                @click="
                  toggleTooltip($event, {
                    name: item.name,
                    price: String(item.specialPrice),
                    usd: String(item.usd ?? ''),
                    gcoin: String(item.gcoin ?? ''),
                    currency: item.currency,
                  })
                "
              >
                <td class="py-2 px-2 font-semibold whitespace-nowrap text-center">
                  {{ item.name }}
                </td>
                <td
                  class="flex flex-row items-center justify-end py-2 px-2 text-indigo-700 dark:text-indigo-300 font-bold whitespace-nowrap text-end"
                >
                  TWD {{ Number(item.specialPrice).toLocaleString() }}
                  <button class="ml-2" tabindex="-1" style="pointer-events: none; opacity: 0.5">
                    <i class="bi bi-exclamation-circle-fill"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 交易流程 Section -->
      <div
        class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 mb-8 border border-zinc-200/50 dark:border-zinc-700/50"
      >
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <i class="bi bi-arrow-repeat text-2xl text-white"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">交易流程</h3>
            <p class="text-gray-600 dark:text-gray-400">簡單四步驟，輕鬆完成交易</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- 步驟 1 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                >
                  1
                </div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">建立訂單</h4>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                請透過 Discord 「
                <a
                  href="https://discord.com/channels/490129931808931840/1400058236152971274"
                  target="_blank"
                  class="font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  >🛒⇜商城下單系統</a
                >」頻道建立訂單
              </p>
            </div>
          </div>

          <!-- 步驟 2 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                >
                  2
                </div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">提供/確認資訊</h4>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                提供正確資料，並提供/確認訂單資訊
              </p>
            </div>
          </div>

          <!-- 步驟 3 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                >
                  3
                </div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">付款轉帳</h4>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                選擇付款方式完成轉帳，並提供證明截圖
              </p>
            </div>
          </div>

          <!-- 步驟 4 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
                >
                  4
                </div>
                <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100">發送 CDK</h4>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                24 小時內發送 CDK 序號至指定聯絡方式
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 付款方式 Section -->
      <div
        class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 mb-8 border border-zinc-200/50 dark:border-zinc-700/50"
      >
        <div class="flex items-center gap-4 mb-8">
          <div
            class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <i class="bi bi-credit-card text-2xl text-white"></i>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">付款方式</h3>
            <p class="text-gray-600 dark:text-gray-400">多種付款選擇，安全便利</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 銀行轉帳 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <i class="bi bi-bank text-xl text-white"></i>
                </div>
                <div>
                  <h4 class="text-xl font-bold text-gray-900 dark:text-gray-100">銀行轉帳</h4>
                </div>
              </div>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-3">
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >中信(822)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >富邦(012)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >台新(812)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >玉山(808)</span
                  >
                </div>
                <div class="flex flex-wrap gap-3">
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >郵政(700)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >國泰(013)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >台銀(004)</span
                  >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-800 dark:text-blue-200 rounded-xl text-sm font-semibold border border-blue-200/50 dark:border-blue-700/50"
                    >一銀(007)</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 電支轉帳 -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"
            ></div>
            <div
              class="relative bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              <div class="flex items-center gap-4 mb-6">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <i class="bi bi-phone text-xl text-white"></i>
                </div>
                <div>
                  <h4 class="text-xl font-bold text-gray-900 dark:text-gray-100">電支轉帳</h4>
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <span
                  class="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold border border-green-200/50 dark:border-green-700/50"
                  >全盈支付(388)</span
                >
                <span
                  class="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold border border-green-200/50 dark:border-green-700/50"
                  >全支付(389)</span
                >
                <span
                  class="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold border border-green-200/50 dark:border-green-700/50"
                  >iPass Money(391)</span
                >
                <span
                  class="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold border border-green-200/50 dark:border-green-700/50"
                  >街口支付(396)</span
                >
                <span
                  class="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-800 dark:text-green-200 rounded-xl text-sm font-semibold border border-green-200/50 dark:border-green-700/50"
                  >歐付寶(397)</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 服務條款 Section -->
      <div
        class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 mb-8 border border-zinc-200 dark:border-zinc-700"
      >
        <h3
          class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-6 flex items-center gap-2"
        >
          <i class="bi bi-file-text"></i> 服務條款
        </h3>

        <div class="space-y-6 text-sm text-gray-700 dark:text-gray-300">
          <!-- 一、服務條款 -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              一、服務條款
            </h4>

            <!-- 服務提供 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">服務提供</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>
                  本單位提供使用者遊戲儲值相關服務平台，對於遊戲商、平台商所提供之內容，本單位不負實質審查義務。
                </li>
                <li>本單位擁有本服務網站內所有電磁記錄等資產權利。</li>
                <li>
                  請您了解並認識到，不論是公開發布或私下分享的所有資訊、數據、文件、軟體、音樂、聲音、照片、圖像、視頻、訊息或其他素材（以下簡稱"內容"），其責任完全由內容的提供者承擔。
                </li>
                <li>
                  在伺服器因超載導致無法正常記錄數據時，您理解並同意本單位可能需要重新啟動伺服器並將數據恢復至超載前的狀態。
                </li>
                <li>
                  為了維持服務品質，當需要更換或調整硬體設備時，您同意本單位有權將您的帳號及相關數據轉移到新的存儲位置，並期望您能配合完成必要的設定調整，以適應這些變更。
                </li>
              </ol>
            </div>

            <!-- 會員資料 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">會員資料</h5>
              <p class="mb-2 text-gray-600 dark:text-gray-400">
                為了確保您能夠順利且安全地使用本公司所提供的服務，使用者在使用過程中，因使用者風控等級的不同，應提供並維持以下個人資料的正確性、最新性及完整性：
              </p>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>包括下列資料，但視情況僅會索取部分或全部資料</li>
                <li>電子郵件地址 (E-mail)</li>
                <li>聯絡電話 (Contact Phone)</li>
                <li>真實姓名 (Real Name)</li>
                <li>戶籍地址 (Residence Address)</li>
                <li>通訊地址 (Contact Address)</li>
                <li>身分證字號 (ID Number)</li>
                <li>銀行代碼 (Bank Code)</li>
                <li>銀行名稱 (Bank Name)</li>
                <li>銀行分行代碼 (Bank Branch Code)</li>
                <li>銀行分行 (Bank Branch)</li>
                <li>銀行帳號 (Bank Account)</li>
              </ol>
              <div class="mt-3 space-y-1 text-gray-600 dark:text-gray-400">
                <p>
                  •
                  使用者在提供任何商品訂單資訊、物品資訊或上傳照片等相關資料時，也應確保其為正確、最新及完整。
                </p>
                <p>• 若使用者所提供的任何資料發生變動，應隨時進行更新。</p>
                <p>
                  •
                  提供錯誤、不實或不完整的資料，本單位有權依據情況暫停或終止使用者的使用權利，並根據本單位的判斷處理相關事宜。
                </p>
                <p>
                  •
                  若使用者以不正當的方式取得點數進行儲值或交易，本公司保留隨時終止使用者資格及使用各項服務的權利，包括但不限於停止或刪除會員在本服務網站的帳號。
                </p>
                <p>
                  •
                  本單位對於使用者資料的管理和使用，致力於保護使用者的隱私權與安全，並遵循相關法律法規及本單位的隱私政策。
                </p>
              </div>
            </div>

            <!-- 商品購買與退款 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">商品購買與退款</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>本單位所提供的服務，商品數量、金額可能因各種情況異動而配合變動。</li>
                <li>若產品資訊與遊戲內現況不符時，本公司有權協調使用者更改購買商品或進行退款。</li>
                <li>
                  商品限單次購買，不可合併訂單。品項對應遊戲內商品應一一對應。合併訂單者，將進行交易內容調整。
                </li>
                <li>
                  本單位專注於提供遊戲服務，涉及的商品均為虛擬產品，因此不適用於消費者保護法規定的7天鑑賞期。
                </li>
                <li>使用者完成付款，即視為本公司已履行與使用者間的線上服務交易義務。</li>
                <li>
                  使用者在進行付款時，即表示已充分理解並同意本條款的所有內容，包括對於退款的特殊規定。
                </li>
                <li>
                  一旦交易確認，任何後續退款事宜將需要會員直接與相關遊戲商協商解決。本公司將不介入退款過程，亦不承擔相關責任。
                </li>
                <li>
                  退費流程須遵守政府反詐騙、洗錢防制等法規，如使用者有退款需求，需提交本單位提供的表單並依照指示進行。
                </li>
                <li>購買本單位提供之服務時，視同已知悉上述退費規定。</li>
              </ol>
            </div>
          </div>

          <!-- 二、免責條款 -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              二、免責條款
            </h4>

            <!-- 使用規範 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">使用規範</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>使用者在交易時，需提供項應資料。</li>
                <li>使用者應對所有以該使用者的資料進行的活動和事件負全責。</li>
                <li>使用者應資料安全，不得洩漏或提供給第三方使用。</li>
                <li>使用者若遇資料非法使用或安全疑慮時，應立即通知本單位。</li>
                <li>使用者因不當行為（如翻牆、使用外掛等）導致帳號被封鎖，本公司不負擔保責任。</li>
                <li>部分遊戲公司設有RMT之禁止規範，使用者應自行查證，本單位不負擔保責任。</li>
                <li>非本單位問題導致的異常情況（如卡單），不負擔保責任。</li>
              </ol>
            </div>

            <!-- 不可抗力 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">不可抗力</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>
                  本單位服務可能因維護、更新或其他不可抗力因素導致暫時中斷或故障，本單位將盡力避免此類情況發生，但對於因此導致的任何不便或損失，本單位不承擔責任。
                </li>
                <li>
                  因駭客攻擊、電腦病毒、政府管制等不可抗力因素導致的資料洩漏、丟失等，本單位不負任何責任。
                </li>
                <li>
                  服務可能因軟硬體更換、升級、保養或不可抗力因素導致中斷或停止，本單位將不負責任。
                </li>
              </ol>
            </div>

            <!-- 虛假資訊與欺詐行為 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">虛假資訊與欺詐行為</h5>
              <p class="text-gray-600 dark:text-gray-400">
                使用者利用本公司名義刊登虛假資訊或進行欺詐行為，純屬該使用者個人行為，本公司不負任何責任。
              </p>
            </div>
          </div>

          <!-- 三、增補條款 -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              三、增補條款
            </h4>

            <!-- 隱私權政策與個人資料保護 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">
                隱私權政策與個人資料保護
              </h5>
              <p class="text-gray-600 dark:text-gray-400">
                本單位重視使用者的隱私權保護，對於使用者使用本服務而留存之個人資料，悉依本單位「隱私權政策」受到保護與規範。
              </p>
            </div>

            <!-- 智慧財產權的尊重 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">智慧財產權的尊重</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>
                  您同意尊重本服務網站所包含的所有內容及資料，包括但不限於文字、圖片、商標、版權及其他智慧財產權，均屬本公司或相關權利人所有。
                </li>
                <li>
                  未經本單位或權利人明確書面同意，任何人不得進行重製、複製、轉載、使用、引用、修改、改作、衍生、公開播放、散布、發行、展示發表、執行還原工程、
                  解編譯或反組譯。
                </li>
                <li>
                  違者，您應自負完全民、刑事法律責任並應對本公司負損害賠償責任（包括但不限於律師費及訴訟費用等）。
                </li>
              </ol>
            </div>

            <!-- 法律適用與管轄 -->
            <div class="mb-4">
              <h5 class="font-medium text-gray-800 dark:text-gray-200 mb-2">法律適用與管轄</h5>
              <ol class="list-decimal pl-6 space-y-1 text-gray-600 dark:text-gray-400">
                <li>本條款的解釋及適用，以及因本服務所生之任何爭議，均適用中華民國法律。</li>
                <li>
                  因使用本服務所生之爭議，雙方應優先透過協商解決，協商不成時，雙方同意以台灣雲林地方法院為第一審管轄法院。
                </li>
                <li>
                  本使用者公約及其附屬規範不應被解釋為創建與本單位之間的合資、代理關係、特許授權或任何形式的雇傭關係。
                </li>
                <li>本規範若有任何一部無效，不影響其他部分之效力。</li>
              </ol>
            </div>
          </div>

          <!-- 結語 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p class="text-gray-700 dark:text-gray-300 text-center">
              本使用者服務及免責條款旨在提供明確的服務規範與免責聲明，以保障使用者與本單位的權益。使用者於使用本公司服務時，應遵守上述條款，以確保雙方利益。
            </p>
          </div>
        </div>
      </div>
    </DecorSection>
  </div>
  <!-- tooltip 元素 -->
  <div
    v-if="tooltip.visible && tooltip.item"
    :style="{
      position: 'fixed',
      top: tooltip.y + 'px',
      left: tooltip.x + 'px',
      zIndex: 1000,
      width: '220px',
    }"
    class="gcoin-tooltip-popup"
  >
    <div class="gcoin-tooltip-arrow" :style="{ left: tooltip.arrowLeft + 'px' }"></div>
    <div class="gcoin-tooltip-content">
      <div class="font-semibold mb-1 text-center">
        {{ tooltip.item?.name }}
      </div>
      <hr class="my-2 border-zinc-200 dark:border-zinc-700" />
      <div v-if="tooltip.item?.currency === 'usd'" class="flex font-semibold text-base">
        原價 USD <span class="ml-auto">{{ Number(tooltip.item?.usd).toLocaleString() }}</span>
      </div>
      <div v-else-if="tooltip.item?.currency === 'gcoin'" class="flex font-semibold text-base">
        原價 G-Coin <span class="ml-auto">{{ Number(tooltip.item?.gcoin).toLocaleString() }}</span>
      </div>
      <div class="flex font-semibold text-base">
        原價 TWD
        <span class="ml-auto">
          <template v-if="tooltip.item?.currency === 'usd'">
            {{ Math.round(parseFloat(tooltip.item?.usd || '0') * usd2twd * FEE).toLocaleString() }}
          </template>
          <template v-else-if="tooltip.item?.currency === 'gcoin'">
            {{ Math.round(parseFloat(tooltip.item?.gcoin || '0') * GCOIN2TWD).toLocaleString() }}
          </template>
        </span>
      </div>
      <hr class="my-2 border-zinc-200 dark:border-zinc-700" />
      <div class="flex font-semibold text-base text-green-600 dark:text-green-400 mt-1">
        －優惠額 TWD<span class="ml-auto">
          <template v-if="tooltip.item?.currency === 'usd'">
            {{
              Math.round(
                Number(tooltip.item?.price) - parseFloat(tooltip.item?.usd || '0') * usd2twd * FEE,
              ).toLocaleString()
            }}
          </template>
          <template v-else-if="tooltip.item?.currency === 'gcoin'">
            {{
              Math.round(
                Number(tooltip.item?.price) - parseFloat(tooltip.item?.gcoin || '0') * GCOIN2TWD,
              ).toLocaleString()
            }}
          </template>
        </span>
      </div>
      <div class="flex font-semibold text-base text-indigo-700 dark:text-indigo-300 mt-1">
        ＝優惠價 TWD <span class="ml-auto">{{ Number(tooltip.item?.price).toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gcoin-tooltip-popup {
  background: #fff;
  color: #222;
  border-radius: 10px;
  padding: 14px 20px 10px 20px;
  font-size: 1.05em;
  white-space: nowrap;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  animation: fadeIn 0.18s;
  min-width: 140px;
  position: fixed;
}

.gcoin-tooltip-arrow {
  position: absolute;
  top: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid #fff;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.08));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
