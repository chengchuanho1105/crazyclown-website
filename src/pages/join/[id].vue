<script setup lang="ts">
defineOptions({ name: 'ApplicationStatusQuery' })

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApplicationStatusService } from '@/services/supabaseService'
import type { ApplicationStatusWithDetails } from '@/config/supabase'
import DecorSection from '@/components/DecorSection.vue'

const route = useRoute()

// 檢查是否為有效的 Steam ID（17位數字）
const isValidSteamId = (id: string) => {
  return id && /^\d{17}$/.test(id)
}

// 獲取有效的 Steam ID（排除 'status' 等路由關鍵字）
const getInitialSteamId = () => {
  const id = route.params.id as string
  return isValidSteamId(id) ? id : ''
}

const steamId = ref(getInitialSteamId())
const steamIdInput = ref(getInitialSteamId())

const statusData = ref<ApplicationStatusWithDetails | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showInputForm = ref(true) // 預設顯示輸入表單

// 載入審核進度
const loadStatus = async (id?: string) => {
  const searchId = (id || steamId.value).trim()

  // 驗證 Steam ID 格式
  if (!searchId || !isValidSteamId(searchId)) {
    // 只有在用戶主動查詢時才顯示格式錯誤
    if (id) {
      error.value = 'Steam ID 必須為 17 位數字'
    }
    showInputForm.value = true
    return
  }

  loading.value = true
  error.value = null
  statusData.value = null

  try {
    const response = await ApplicationStatusService.getStatusBySteamId(searchId)

    if (response.error) {
      error.value = '查無此 Steam ID 的申請記錄，請確認 Steam ID 是否正確'
      showInputForm.value = true
      console.error('查詢失敗:', response.error)
    } else {
      statusData.value = response.data
      steamId.value = searchId
      steamIdInput.value = searchId
      showInputForm.value = false

      // 更新 URL（不重新載入頁面）
      window.history.replaceState({}, '', `/join/${searchId}`)
    }
  } catch (err) {
    error.value = '查詢審核進度時發生錯誤，請稍後再試'
    showInputForm.value = true
    console.error('查詢錯誤:', err)
  } finally {
    loading.value = false
  }
}

// 處理查詢
const handleSearch = () => {
  loadStatus(steamIdInput.value.trim())
}

// 返回輸入介面
const backToInput = () => {
  showInputForm.value = true
  error.value = null
  statusData.value = null
  steamIdInput.value = ''  // 清除輸入框
  steamId.value = ''  // 清除當前 Steam ID

  // 更新 URL 為不帶參數的路徑
  window.history.replaceState({}, '', '/join/status')
}

// 格式化時間
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 計算整體進度百分比
const overallProgress = computed(() => {
  if (!statusData.value) return 0

  let completed = 0
  const total = 6

  if (statusData.value.crazy_clown_discord === '⭕ 已加入') completed++
  if (statusData.value.pubg_official_discord === '⭕ 已加入') completed++
  if (statusData.value.clan_review === '⭕ 已通過') completed++
  if (statusData.value.official_review === '⭕ 已通過') completed++
  if (statusData.value.in_game_application === '⭕ 已申請') completed++
  if (statusData.value.role_assignment === '⭕ 已發放') completed++

  return Math.round((completed / total) * 100)
})

// 根據狀態返回顏色
const getStatusColor = (status: string) => {
  if (status.includes('⭕')) return 'text-green-600 dark:text-green-400'
  if (status.includes('👁️')) return 'text-blue-600 dark:text-blue-400'
  if (status.includes('❌')) return 'text-red-600 dark:text-red-400'
  if (status.includes('⚠️')) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-600 dark:text-gray-400'
}

onMounted(() => {
  // 只有當有有效的 Steam ID 時才自動查詢
  if (steamId.value && isValidSteamId(steamId.value)) {
    showInputForm.value = false
    loadStatus()
  } else {
    // 沒有有效 ID 時顯示輸入表單（不顯示錯誤）
    showInputForm.value = true
    error.value = null
  }
})
</script>

<template>
  <div class="max-w-5xl m-auto px-4 py-8">
    <DecorSection mainTitle="🔍 審核進度查詢" enTitle="Application Status">

      <!-- Steam ID 輸入表單 -->
      <div v-if="showInputForm && !loading" class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">

          <!-- 錯誤訊息（如果有） -->
          <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h4 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">查詢失敗</h4>
                <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>

          <div class="text-center mb-8">
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <svg class="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">查詢審核進度</h2>
          </div>

          <form @submit.prevent="handleSearch" class="space-y-4">
            <div>
              <label for="steamIdInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Steam 17位數字ID <span class="text-red-500">*</span>
              </label>
              <input
                id="steamIdInput"
                v-model="steamIdInput"
                type="text"
                maxlength="17"
                placeholder="例如：76561198123456789"
                class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-mono"
                required
              />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <i class="bi bi-info-circle"></i> 提示：您的 Steam ID 可以在申請提交成功後的通知訊息或 Discord 通知中找到
              </p>
            </div>

            <button
              type="submit"
              class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              查詢審核進度
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
              還沒有提交申請？
              <a href="/join" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold">
                立即申請加入戰隊
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">查詢中...</p>
      </div>

      <!-- 審核進度內容 -->
      <div v-else-if="statusData" class="space-y-6">

        <!-- 申請人資訊卡片 -->
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i class="bi bi-person-badge"></i>
            申請人資訊
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3">
              <span class="text-gray-600 dark:text-gray-400">暱稱：</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ statusData.application?.nickName }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-600 dark:text-gray-400">Discord：</span>
              <span class="font-mono font-semibold text-gray-900 dark:text-white">{{ statusData.application?.discord_username }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-600 dark:text-gray-400">遊戲 ID：</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ statusData.application?.pubg_nickname }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-gray-600 dark:text-gray-400">申請戰隊：</span>
              <span class="font-semibold text-blue-600 dark:text-blue-400">{{ statusData.application?.clan_applied }}</span>
            </div>
          </div>
        </div>

        <!-- 整體進度 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">整體進度</h3>
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                  進度
                </span>
              </div>
              <div class="text-right">
                <span class="text-2xl font-semibold inline-block text-blue-600 dark:text-blue-400">
                  {{ overallProgress }}%
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-200 dark:bg-blue-900">
              <div
                :style="{ width: overallProgress + '%' }"
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        <!-- 審核進度詳細項目 -->
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i class="bi bi-clipboard-check"></i>
            審核進度
          </h2>

          <div class="space-y-4">
            <!-- 1. Crazy Clown Discord -->
            <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    1️⃣ 加入 Crazy_Clown Discord 社群
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    請前往 <a href="https://crazyclown.online/dc" target="_blank" class="text-blue-600 hover:underline">Crazy Clown Discord</a> 並完成報到
                  </p>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.crazy_clown_discord)]">
                    {{ statusData.crazy_clown_discord }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 2. PUBG Official Discord -->
            <div class="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    2️⃣ 加入 PUBG TW官方 Discord 社群
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    請前往 <a href="https://kraftontw.info/Discord" target="_blank" class="text-blue-600 hover:underline">PUBG 官方 Discord</a>
                  </p>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.pubg_official_discord)]">
                    {{ statusData.pubg_official_discord }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 3. 戰隊初審 -->
            <div class="border-l-4 border-green-500 bg-green-50 dark:bg-green-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    3️⃣ 戰隊初審
                  </h4>
                  <p v-if="statusData.clan_review_reason" class="text-sm text-red-600 dark:text-red-400 mt-2">
                    <i class="bi bi-exclamation-triangle"></i> 原因：{{ statusData.clan_review_reason }}
                  </p>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.clan_review)]">
                    {{ statusData.clan_review }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 4. 官方複審 -->
            <div class="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    4️⃣ 官方複審
                  </h4>
                  <p v-if="statusData.official_review_reason" class="text-sm text-red-600 dark:text-red-400 mt-2">
                    <i class="bi bi-exclamation-triangle"></i> 原因：{{ statusData.official_review_reason }}
                  </p>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.official_review)]">
                    {{ statusData.official_review }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 5. 遊戲內申請入隊 -->
            <div class="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    5️⃣ 遊戲內申請入隊
                  </h4>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.in_game_application)]">
                    {{ statusData.in_game_application }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 6. 戰隊身分組發放 -->
            <div class="border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-950 p-4 rounded">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                    6️⃣ 戰隊身分組發放
                  </h4>
                </div>
                <div>
                  <span :class="['text-2xl font-bold', getStatusColor(statusData.role_assignment)]">
                    {{ statusData.role_assignment }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 時間資訊 -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <i class="bi bi-calendar-plus"></i>
                申請時間：{{ formatDate(statusData.created_at) }}
              </div>
              <div>
                <i class="bi bi-calendar-check"></i>
                更新時間：{{ formatDate(statusData.updated_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <a
            href="https://crazyclown.online/dc"
            target="_blank"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <i class="bi bi-discord"></i>
            前往 Crazy Clown Discord
          </a>
          <a
            href="https://kraftontw.info/Discord"
            target="_blank"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i class="bi bi-discord"></i>
            前往 PUBG 官方 Discord
          </a>
          <button
            @click="loadStatus()"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <i class="bi bi-arrow-clockwise"></i>
            重新整理
          </button>
          <button
            @click="backToInput"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <i class="bi bi-search"></i>
            查詢其他 Steam ID
          </button>
        </div>

        <!-- 提示訊息 -->
        <div class="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded">
          <h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            <i class="bi bi-info-circle"></i> 溫馨提示
          </h4>
          <ul class="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>審核進度會即時更新，請定期查看此頁面</li>
            <li>如有任何問題，請前往 Discord 的客服服務台詢問</li>
            <li>請妥善保管您的 Steam ID 查詢連結</li>
          </ul>
        </div>
      </div>

    </DecorSection>
  </div>
</template>

<style scoped>
/* 進度條動畫 */
.transition-all {
  transition: all 0.5s ease-in-out;
}
</style>

