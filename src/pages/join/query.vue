<script setup lang="ts">
defineOptions({ name: 'JoinQuery' })

import { ref, onMounted } from 'vue'
import DecorSection from '@/components/DecorSection.vue'
import { supabase } from '@/config/supabase'

// 申請資料類型定義
interface ApplicationData {
  id: number
  nickname: string
  discord_user_id: string
  discord_username: string
  pubg_nickname: string
  pubg_account_id: string
  steam_id: string
  total_play_time: number
  weekly_play_time: number
  clan_task_willingness: string
  discord_activity_willingness: string
  pubg_activity_willingness: string
  friend_pubg_nickname: string[]
  inviter_pubg_nickname: string[]
  note: string
  basic_status: string
  basic_reasons: string
  game_status: string
  game_reasons: string
  supplement_status: string
  supplement_reasons: string
  joined_clan_dc_status: string
  joined_clan_dc_reasons: string
  clan_dc_checkin_status: string
  clan_dc_checkin_reasons: string
  joined_official_dc_status: string
  joined_official_dc_reasons: string
  discord_active_status: string
  discord_active_reasons: string
  game_active_status: string
  game_active_reasons: string
  clan_review_status: string
  clan_review_reasons: string
  official_review_status: string
  official_review_reasons: string
  game_apply_status: string
  game_apply_reasons: string
  join_status: string
  join_reasons: string
  discord_role_status: string
  discord_role_reasons: string
  case_status: string
  case_note: string
  created_at: string
  updated_at: string
}

// 查詢相關
const steamId = ref('')
const isQuerying = ref(false)
const queryResult = ref<ApplicationData | null>(null)
const queryError = ref('')

// 查詢申請狀態
const queryApplication = async () => {
  if (!steamId.value.trim()) {
    queryError.value = '請輸入 Steam ID'
    return
  }

  isQuerying.value = true
  queryError.value = ''
  queryResult.value = null

  try {
    const { data, error } = await supabase
      .from('join_application')
      .select('*')
      .eq('steam_id', steamId.value.trim())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('查詢失敗：', error)
      queryError.value = '查詢失敗，請稍後再試'
      return
    }

    if (data && data.length > 0) {
      queryResult.value = data[0] // 取最新的申請
    } else {
      queryError.value = '找不到該 Steam ID 的申請記錄'
    }
  } catch (error) {
    console.error('查詢失敗：', error)
    queryError.value = '查詢失敗，請稍後再試'
  } finally {
    isQuerying.value = false
  }
}

// 重置查詢
const resetQuery = () => {
  steamId.value = ''
  queryResult.value = null
  queryError.value = ''
  // 滾動到頁面最上方
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 狀態對應
const getStatusText = (status: string | null | undefined) => {
  const statusMap: { [key: string]: string } = {
    'waiting': '待前項完成',
    'pending': '待審核',
    'reviewing': '審核中',
    'approved': '已通過',
    'rejected': '未通過',
    'revoked': '已撤銷',
    'error': '錯誤',
    'TRUE': '是',
    'FALSE': '否',
    'null': '未設定'
  }
  return statusMap[status || ''] || status || '未設定'
}

const getStatusColor = (status: string | null | undefined) => {
  const colorMap: { [key: string]: string } = {
    'waiting': 'text-orange-600 dark:text-orange-400',
    'pending': 'text-yellow-600 dark:text-yellow-400',
    'reviewing': 'text-blue-600 dark:text-blue-400',
    'approved': 'text-green-600 dark:text-green-400',
    'rejected': 'text-red-600 dark:text-red-400',
    'revoked': 'text-gray-600 dark:text-gray-400',
    'error': 'text-red-600 dark:text-red-400',
    'TRUE': 'text-green-600 dark:text-green-400',
    'FALSE': 'text-red-600 dark:text-red-400',
    'null': 'text-gray-600 dark:text-gray-400'
  }
  return colorMap[status || ''] || 'text-gray-600 dark:text-gray-400'
}


// 計算整體進度百分比
const getProgressPercentage = () => {
  const steps = [
    queryResult.value?.basic_status,
    queryResult.value?.game_status,
    queryResult.value?.supplement_status,
    queryResult.value?.joined_clan_dc_status,
    queryResult.value?.clan_dc_checkin_status,
    queryResult.value?.joined_official_dc_status,
    queryResult.value?.discord_active_status,
    queryResult.value?.game_active_status,
    queryResult.value?.clan_review_status,
    queryResult.value?.official_review_status,
    queryResult.value?.game_apply_status,
    queryResult.value?.join_status,
    queryResult.value?.discord_role_status
  ]

  let completedSteps = 0
  steps.forEach(status => {
    if (status === 'approved') {
      completedSteps++
    }
  })

  return Math.round((completedSteps / steps.length) * 100)
}

// 格式化時間為 yyyy/mm/dd hh:mm:ss
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

// 判斷是否願意參與（處理不同的資料格式）
const isWilling = (value: string | boolean | number | null | undefined) => {
  if (value === true || value === 'true' || value === 'TRUE' || value === 1 || value === '1') {
    return true
  }
  return false
}

// 檢查 URL 參數並自動查詢
const checkUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const steamIdFromUrl = urlParams.get('steam_id')

  if (steamIdFromUrl) {
    steamId.value = steamIdFromUrl
    // 自動執行查詢
    queryApplication()
  }
}

// 頁面載入時檢查 URL 參數
onMounted(() => {
  checkUrlParams()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
    <div class="max-w-7xl m-auto px-4 py-8">
      <DecorSection mainTitle="🔍 審核進度查詢" enTitle="Application Status Query">
        <div class="text-gray-900 dark:text-zinc-100">
          <div class="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl">

            <!-- 查詢表單 -->
            <div v-if="!queryResult" class="col-span-12">
              <div
                class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-l-4 border-blue-500">
                <h3 class="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-search"></i>
                  查詢申請狀態
                </h3>

                <div class="space-y-4">
                  <div>
                    <label for="steam_id" class="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">
                      Steam ID <span class="text-red-500">*</span>
                    </label>
                    <p class="text-xs text-gray-500 dark:text-zinc-400 mb-3">請輸入您申請時填寫的 Steam ID</p>
                    <div class="flex gap-3">
                      <input id="steam_id" v-model="steamId" type="text" placeholder="請輸入 Steam ID"
                        class="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500"
                        :disabled="isQuerying" @keyup.enter="queryApplication" />
                      <button type="button" @click="queryApplication" :disabled="isQuerying || !steamId.trim()"
                        class="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all transform hover:scale-105 disabled:transform-none">
                        <i v-if="!isQuerying" class="bi bi-search mr-2"></i>
                        <i v-else class="bi bi-hourglass-split animate-spin mr-2"></i>
                        {{ isQuerying ? '查詢中...' : '查詢' }}
                      </button>
                    </div>
                  </div>

                  <!-- 錯誤訊息 -->
                  <div v-if="queryError"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                      <i class="bi bi-exclamation-triangle-fill text-red-500 text-xl"></i>
                      <p class="text-red-700 dark:text-red-400">{{ queryError }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 查詢結果 -->
            <div v-if="queryResult" class="col-span-12 space-y-6">
              <!-- 第0：審核流程進度條 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-diagram-3"></i>
                    審核流程進度
                  </h3>
                </div>
                <div class="p-6">
                  <!-- 整體進度 -->
                  <div class="p-6 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                    <div class="flex justify-between items-center mb-4">
                      <span class="text-lg font-semibold text-gray-800 dark:text-zinc-200">整體進度</span>
                      <span class="text-2xl font-bold text-gray-800 dark:text-zinc-200">{{ getProgressPercentage() }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-zinc-600 rounded-full h-3">
                      <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                           :style="{ width: getProgressPercentage() + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第1：表單資料 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-file-text"></i>
                    表單資料
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 個人資料 -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-800 dark:text-zinc-200 border-b border-gray-200 dark:border-zinc-700 pb-2">個人資料</h4>
                      <div class="space-y-3">
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">暱稱</span>
                          <span class="font-semibold text-gray-800 dark:text-zinc-200">{{ queryResult.nickname }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">Discord ID</span>
                          <span class="font-mono text-sm text-gray-800 dark:text-zinc-200">{{ queryResult.discord_user_id }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">Discord 名稱</span>
                          <span class="font-semibold text-gray-800 dark:text-zinc-200">{{ queryResult.discord_username }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 遊戲資料 -->
                    <div class="space-y-4">
                      <h4 class="text-lg font-semibold text-gray-800 dark:text-zinc-200 border-b border-gray-200 dark:border-zinc-700 pb-2">遊戲資料</h4>
                      <div class="space-y-3">
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">PUBG 暱稱</span>
                          <span class="font-semibold text-gray-800 dark:text-zinc-200">{{ queryResult.pubg_nickname }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">PUBG Account ID</span>
                          <span class="font-mono text-sm text-gray-800 dark:text-zinc-200">{{ queryResult.pubg_account_id }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">Steam ID</span>
                          <span class="font-mono text-sm text-gray-800 dark:text-zinc-200">{{ queryResult.steam_id }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">總遊戲時間</span>
                          <span class="font-semibold text-gray-800 dark:text-zinc-200">{{ queryResult.total_play_time }} 小時</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-zinc-700">
                          <span class="text-gray-600 dark:text-zinc-400">每週遊戲時間</span>
                          <span class="font-semibold text-gray-800 dark:text-zinc-200">{{ queryResult.weekly_play_time }} 小時</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 參與意願 -->
                  <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-300 mb-3">參與意願</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div class="flex items-center space-x-2">
                        <span class="text-blue-700 dark:text-blue-400">戰隊任務</span>
                        <span :class="isWilling(queryResult.clan_task_willingness) ? 'text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-full px-2 py-1' : 'text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full px-2 py-1'" class="font-semibold">
                          {{ isWilling(queryResult.clan_task_willingness) ? '願意' : '不願意' }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-blue-700 dark:text-blue-400">Discord 活躍</span>
                        <span :class="isWilling(queryResult.discord_activity_willingness) ? 'text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-full px-2 py-1' : 'text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full px-2 py-1'" class="font-semibold">
                          {{ isWilling(queryResult.discord_activity_willingness) ? '願意' : '不願意' }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-blue-700 dark:text-blue-400">PUBG 活躍</span>
                        <span :class="isWilling(queryResult.pubg_activity_willingness) ? 'text-green-600 dark:text-green-400 border border-green-600 dark:border-green-400 rounded-full px-2 py-1' : 'text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-full px-2 py-1'" class="font-semibold">
                          {{ isWilling(queryResult.pubg_activity_willingness) ? '願意' : '不願意' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 推薦資訊 -->
                  <div class="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 class="font-semibold text-purple-800 dark:text-purple-300 mb-3">推薦資訊</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="flex items-center space-x-2">
                        <span class="text-purple-700 dark:text-purple-400">好友</span>
                        <span class="font-semibold text-gray-800 dark:text-zinc-200 border border-purple-600 dark:border-purple-400 rounded-full px-2 py-1">
                          {{ queryResult.friend_pubg_nickname && queryResult.friend_pubg_nickname.length > 0
                            ? queryResult.friend_pubg_nickname.join(', ')
                            : '無' }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-purple-700 dark:text-purple-400">介紹人</span>
                        <span class="font-semibold text-gray-800 dark:text-zinc-200 border border-purple-600 dark:border-purple-400 rounded-full px-2 py-1">
                          {{ queryResult.inviter_pubg_nickname && queryResult.inviter_pubg_nickname.length > 0
                            ? queryResult.inviter_pubg_nickname.join(', ')
                            : '無' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 備註 -->
                  <div class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div class="flex items-start gap-3">
                      <i class="bi bi-chat-dots-fill text-amber-600 dark:text-amber-500 text-xl mt-0.5"></i>
                      <div>
                        <p class="font-semibold text-amber-800 dark:text-amber-300 mb-1">申請者備註</p>
                        <p class="text-sm text-amber-700 dark:text-amber-400">
                          {{ queryResult.note || '無備註' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第2：資料審核 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-clipboard-data"></i>
                    資料審核
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">基本資料審核</span>
                        <span :class="getStatusColor(queryResult.basic_status)" class="font-semibold">
                          {{ getStatusText(queryResult.basic_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.basic_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.basic_reasons }}</p>
                    </div>
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">遊戲資料審核</span>
                        <span :class="getStatusColor(queryResult.game_status)" class="font-semibold">
                          {{ getStatusText(queryResult.game_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.game_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.game_reasons }}</p>
                    </div>
                    <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">補充資料審核</span>
                        <span :class="getStatusColor(queryResult.supplement_status)" class="font-semibold">
                          {{ getStatusText(queryResult.supplement_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.supplement_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.supplement_reasons }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第3：活躍考核 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-people"></i>
                    活躍考核
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">加入戰隊DC</span>
                        <span :class="getStatusColor(queryResult.joined_clan_dc_status)" class="font-semibold">
                          {{ getStatusText(queryResult.joined_clan_dc_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.joined_clan_dc_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.joined_clan_dc_reasons }}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">戰隊DC報到</span>
                        <span :class="getStatusColor(queryResult.clan_dc_checkin_status)" class="font-semibold">
                          {{ getStatusText(queryResult.clan_dc_checkin_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.clan_dc_checkin_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.clan_dc_checkin_reasons }}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">加入官方DC</span>
                        <span :class="getStatusColor(queryResult.joined_official_dc_status)" class="font-semibold">
                          {{ getStatusText(queryResult.joined_official_dc_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.joined_official_dc_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.joined_official_dc_reasons }}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">社群活躍審核</span>
                        <span :class="getStatusColor(queryResult.discord_active_status)" class="font-semibold">
                          {{ getStatusText(queryResult.discord_active_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.discord_active_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.discord_active_reasons }}</p>
                    </div>
                    <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">遊戲內活躍審核</span>
                        <span :class="getStatusColor(queryResult.game_active_status)" class="font-semibold">
                          {{ getStatusText(queryResult.game_active_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.game_active_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.game_active_reasons }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第4：正式審核 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-shield-check"></i>
                    正式審核
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">戰隊初審</span>
                        <span :class="getStatusColor(queryResult.clan_review_status)" class="font-semibold">
                          {{ getStatusText(queryResult.clan_review_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.clan_review_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.clan_review_reasons }}</p>
                    </div>
                    <div class="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">官方複審</span>
                        <span :class="getStatusColor(queryResult.official_review_status)" class="font-semibold">
                          {{ getStatusText(queryResult.official_review_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.official_review_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.official_review_reasons }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第5：加入作業 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-gear"></i>
                    加入作業
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">是否完成遊戲內申請加入？</span>
                        <span :class="getStatusColor(queryResult.game_apply_status)" class="font-semibold">
                          {{ getStatusText(queryResult.game_apply_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.game_apply_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.game_apply_reasons }}</p>
                    </div>
                    <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">是否完成加入作業？</span>
                        <span :class="getStatusColor(queryResult.join_status)" class="font-semibold">
                          {{ getStatusText(queryResult.join_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.join_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.join_reasons }}</p>
                    </div>
                    <div class="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-gray-700 dark:text-zinc-300">是否獲得DC身分組？</span>
                        <span :class="getStatusColor(queryResult.discord_role_status)" class="font-semibold">
                          {{ getStatusText(queryResult.discord_role_status) }}
                        </span>
                      </div>
                      <p v-if="queryResult.discord_role_reasons" class="text-sm text-gray-600 dark:text-zinc-400">{{ queryResult.discord_role_reasons }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 第6：案件狀態 -->
              <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 overflow-hidden">
                <div class="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <i class="bi bi-info-circle"></i>
                    案件狀態
                  </h3>
                </div>
                <div class="p-6">
                  <!-- 整體狀態 -->
                  <div class="mb-6 p-4 bg-gray-50 dark:bg-zinc-700 rounded-lg border border-gray-200 dark:border-zinc-600">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-semibold text-gray-800 dark:text-zinc-200">整體狀態</span>
                      <span :class="getStatusColor(queryResult.case_status)" class="text-xl font-bold">
                        {{ getStatusText(queryResult.case_status) }}
                      </span>
                    </div>
                    <p v-if="queryResult.case_note" class="text-sm text-gray-600 dark:text-zinc-400 mt-2">{{ queryResult.case_note }}</p>
                  </div>

                  <!-- 時間資訊 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-zinc-400">申請時間</span>
                        <span class="text-sm text-gray-800 dark:text-zinc-200">{{ formatDateTime(queryResult.created_at) }}</span>
                      </div>
                    </div>
                    <div class="p-4 bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600 dark:text-zinc-400">更新時間</span>
                        <span class="text-sm text-gray-800 dark:text-zinc-200">{{ formatDateTime(queryResult.updated_at) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 操作按鈕 -->
                  <div class="mt-6 flex justify-center">
                    <button type="button" @click="resetQuery"
                      class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-800 dark:text-zinc-100 font-bold rounded-2xl transition-all transform hover:scale-105">
                      <i class="bi bi-arrow-clockwise mr-2"></i>
                      重新查詢
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 使用說明 -->
            <div v-if="!queryResult" class="col-span-12">
              <div
                class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-l-4 border-purple-500">
                <h3 class="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-info-circle-fill"></i>
                  使用說明
                </h3>
                <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
                  <li>請輸入您申請時填寫的 Steam ID 進行查詢</li>
                  <li>查詢結果會顯示您的申請狀態和審核進度</li>
                  <li>如有疑問，請前往「
                    <a href="https://discord.com/channels/490129931808931840/1182389838582915162" target="_blank"
                      class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                      📭⇜客服服務台<i class="bi bi-box-arrow-up-right ml-1" /></a>
                    」頻道詢問
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DecorSection>
    </div>
  </div>
</template>
