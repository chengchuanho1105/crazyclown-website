<script setup lang="ts">
defineOptions({ name: 'ApplicationStatusList' })

import { ref, computed, onMounted } from 'vue'
import { ApplicationStatusService } from '@/services/supabaseService'
import type { ClanApplication } from '@/config/supabase'
import DecorSection from '@/components/DecorSection.vue'

// 資料狀態
const statusList = ref<ClanApplication[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// 內聯編輯狀態
const editingId = ref<string | null>(null)
const editingValues = ref<{
  nickName: string
  discord_username: string
  discord_uid: string | null
  thread_id: string | null
  pubg_nickname: string
  steam_17_id: string
  data_valid: '⚠️ 待驗證' | '⭕ 已驗證' | '❌ 未通過' | null
  data_valid_reason: string | null
  pubg_account_id: string | null
  crazy_clown_discord: '❌ 未加入' | '⚠️ 已加入，未完成報到' | '⭕ 已加入'
  pubg_official_discord: '❌ 未加入' | '⭕ 已加入'
  clan_review: '⚠️ 前二項未完成' | '👁️ 審核中' | '⭕ 已通過' | '❌ 未通過'
  clan_review_reason: string | null
  official_review: '⚠️ 待前項完成' | '👁️ 審核中' | '⭕ 已通過' | '❌ 未通過'
  official_review_reason: string | null
  in_game_application: '❌ 未申請' | '⭕ 已申請' | '⚠️ 審核未通過'
  role_assignment: '⚠️ 待前項完成' | '❌ 未申請' | '⚠️ 審核未通過' | '⭕ 已發放'
  is_closed: boolean
}>({
  nickName: '',
  discord_username: '',
  discord_uid: null,
  thread_id: null,
  pubg_nickname: '',
  steam_17_id: '',
  data_valid: null,
  data_valid_reason: null,
  pubg_account_id: null,
  crazy_clown_discord: '❌ 未加入',
  pubg_official_discord: '❌ 未加入',
  clan_review: '⚠️ 前二項未完成',
  clan_review_reason: null,
  official_review: '⚠️ 待前項完成',
  official_review_reason: null,
  in_game_application: '❌ 未申請',
  role_assignment: '⚠️ 待前項完成',
  is_closed: false
})

// 篩選狀態
const filters = ref({
  crazy_clown_discord: '',
  pubg_official_discord: '',
  clan_review: '',
  official_review: '',
  in_game_application: '',
  role_assignment: '',
  is_closed: ''
})

// 搜尋
const searchQuery = ref('')

// 載入所有審核進度
const loadAllStatus = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await ApplicationStatusService.getAllStatusWithDetails()

    if (response.error) {
      error.value = response.error.message
    } else {
      statusList.value = response.data || []
    }
  } catch (err) {
    error.value = '載入審核進度時發生錯誤'
    console.error('載入錯誤:', err)
  } finally {
    loading.value = false
  }
}

// 篩選後的列表
const filteredList = computed(() => {
  let filtered = statusList.value

  // 搜尋過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.steam_17_id.toLowerCase().includes(query) ||
      item.nickName?.toLowerCase().includes(query) ||
      item.discord_username?.toLowerCase().includes(query) ||
      item.pubg_nickname?.toLowerCase().includes(query)
    )
  }

  // 狀態篩選
  if (filters.value.crazy_clown_discord) {
    filtered = filtered.filter(item => item.crazy_clown_discord === filters.value.crazy_clown_discord)
  }
  if (filters.value.pubg_official_discord) {
    filtered = filtered.filter(item => item.pubg_official_discord === filters.value.pubg_official_discord)
  }
  if (filters.value.clan_review) {
    filtered = filtered.filter(item => item.clan_review === filters.value.clan_review)
  }
  if (filters.value.official_review) {
    filtered = filtered.filter(item => item.official_review === filters.value.official_review)
  }
  if (filters.value.in_game_application) {
    filtered = filtered.filter(item => item.in_game_application === filters.value.in_game_application)
  }
  if (filters.value.role_assignment) {
    filtered = filtered.filter(item => item.role_assignment === filters.value.role_assignment)
  }
  if (filters.value.is_closed !== '') {
    filtered = filtered.filter(item => item.is_closed === (filters.value.is_closed === 'true'))
  }

  return filtered
})

// 開始編輯
const startEditing = (item: ClanApplication) => {
  editingId.value = item.id
  editingValues.value = {
    nickName: item.nickName,
    discord_username: item.discord_username,
    discord_uid: item.discord_uid || '',
    thread_id: item.thread_id || '',
    pubg_nickname: item.pubg_nickname,
    steam_17_id: item.steam_17_id,
    data_valid: item.data_valid,
    data_valid_reason: item.data_valid_reason || '',
    pubg_account_id: item.pubg_account_id || '',
    crazy_clown_discord: item.crazy_clown_discord,
    pubg_official_discord: item.pubg_official_discord,
    clan_review: item.clan_review,
    clan_review_reason: item.clan_review_reason || '',
    official_review: item.official_review,
    official_review_reason: item.official_review_reason || '',
    in_game_application: item.in_game_application,
    role_assignment: item.role_assignment,
    is_closed: item.is_closed
  }
}

// 取消編輯
const cancelEditing = () => {
  editingId.value = null
  editingValues.value = {
    nickName: '',
    discord_username: '',
    discord_uid: null,
    thread_id: null,
    pubg_nickname: '',
    steam_17_id: '',
    data_valid: null,
    data_valid_reason: null,
    pubg_account_id: null,
    crazy_clown_discord: '❌ 未加入',
    pubg_official_discord: '❌ 未加入',
    clan_review: '⚠️ 前二項未完成',
    clan_review_reason: null,
    official_review: '⚠️ 待前項完成',
    official_review_reason: null,
    in_game_application: '❌ 未申請',
    role_assignment: '⚠️ 待前項完成',
    is_closed: false
  }
}

// 發送 Discord 通知
const sendDiscordNotification = async (application: ClanApplication) => {
  // 如果沒有 thread_id 或 discord_uid，則不發送通知
  if (!application.thread_id || !application.discord_uid) {
    console.log('缺少 thread_id 或 discord_uid，跳過 Discord 通知')
    return
  }

  try {
    const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL
    console.log('環境變數檢查:', {
      hasWebhookUrl: !!DISCORD_WEBHOOK_URL,
      webhookUrlPrefix: DISCORD_WEBHOOK_URL ? DISCORD_WEBHOOK_URL.substring(0, 30) + '...' : 'undefined'
    })

    if (!DISCORD_WEBHOOK_URL) {
      console.warn('未設定 Discord Webhook URL (環境變數: VITE_DISCORD_WEBHOOK_URL)')
      return
    }

    // 構建通知訊息
    const embed = {
      title: '📢 審核進度已更新',
      description: ``,
      color: 0xff4000, // #FF4000
      fields: [
        {
          name: '',
          value: `<@${application.discord_uid}> 您的申請審核進度已更新！`,
          inline: true
        },
        {
          name: '',
          value: `🔍[查看審核進度](https://crazyclown.online/join/${application.steam_17_id})`,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
    }

    // 發送到指定的討論串
    await fetch(`${DISCORD_WEBHOOK_URL}?thread_id=${application.thread_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    console.log('✅ Discord 通知已發送')
  } catch (err) {
    console.error('❌ Discord 通知發送失敗:', err)
    // 不要因為 Discord 發送失敗而影響主流程
  }
}

// 保存編輯
const saveEditing = async () => {
  if (!editingId.value) return

  // 找到原始資料
  const originalItem = statusList.value.find(app => app.id === editingId.value)
  if (!originalItem) {
    error.value = '找不到原始資料'
    return
  }

  // 檢查資料是否有變化
  const hasChanges =
    editingValues.value.nickName !== originalItem.nickName ||
    editingValues.value.discord_username !== originalItem.discord_username ||
    (editingValues.value.discord_uid || null) !== (originalItem.discord_uid || null) ||
    (editingValues.value.thread_id || null) !== (originalItem.thread_id || null) ||
    editingValues.value.pubg_nickname !== originalItem.pubg_nickname ||
    editingValues.value.steam_17_id !== originalItem.steam_17_id ||
    (editingValues.value.data_valid || null) !== (originalItem.data_valid || null) ||
    (editingValues.value.data_valid_reason || null) !== (originalItem.data_valid_reason || null) ||
    (editingValues.value.pubg_account_id || null) !== (originalItem.pubg_account_id || null) ||
    editingValues.value.crazy_clown_discord !== originalItem.crazy_clown_discord ||
    editingValues.value.pubg_official_discord !== originalItem.pubg_official_discord ||
    editingValues.value.clan_review !== originalItem.clan_review ||
    (editingValues.value.clan_review_reason || null) !== (originalItem.clan_review_reason || null) ||
    editingValues.value.official_review !== originalItem.official_review ||
    (editingValues.value.official_review_reason || null) !== (originalItem.official_review_reason || null) ||
    editingValues.value.in_game_application !== originalItem.in_game_application ||
    editingValues.value.role_assignment !== originalItem.role_assignment ||
    editingValues.value.is_closed !== originalItem.is_closed

  // 如果沒有變化，直接取消編輯
  if (!hasChanges) {
    console.log('資料無變化，跳過更新')
    successMessage.value = '資料無變化，未執行更新'
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
    cancelEditing()
    return
  }

  try {
    // 準備更新資料，將空字串轉為 null
    const updates = {
      nickName: editingValues.value.nickName,
      discord_username: editingValues.value.discord_username,
      discord_uid: editingValues.value.discord_uid || null,
      thread_id: editingValues.value.thread_id || null,
      pubg_nickname: editingValues.value.pubg_nickname,
      steam_17_id: editingValues.value.steam_17_id,
      data_valid: editingValues.value.data_valid || null,
      data_valid_reason: editingValues.value.data_valid_reason || null,
      pubg_account_id: editingValues.value.pubg_account_id || null,
      crazy_clown_discord: editingValues.value.crazy_clown_discord,
      pubg_official_discord: editingValues.value.pubg_official_discord,
      clan_review: editingValues.value.clan_review,
      clan_review_reason: editingValues.value.clan_review_reason || null,
      official_review: editingValues.value.official_review,
      official_review_reason: editingValues.value.official_review_reason || null,
      in_game_application: editingValues.value.in_game_application,
      role_assignment: editingValues.value.role_assignment,
      is_closed: editingValues.value.is_closed
    }

    const response = await ApplicationStatusService.updateStatus(editingId.value, updates)

    if (response.error) {
      error.value = response.error.message
    } else {
      // 更新本地資料
      await loadAllStatus()

      // 找到更新後的申請資料並發送 Discord 通知
      const updatedApplication = statusList.value.find(app => app.id === editingId.value)
      if (updatedApplication) {
        await sendDiscordNotification(updatedApplication)
      }

      cancelEditing()
    }
  } catch (err) {
    error.value = '更新審核進度時發生錯誤'
    console.error('更新錯誤:', err)
  }
}

// 刪除審核進度
const deleteStatus = async (id: string) => {
  if (!confirm('確定要刪除這筆審核進度嗎？')) return

  try {
    const response = await ApplicationStatusService.deleteStatus(id)

    if (response.error) {
      error.value = response.error.message
    } else {
      // 重新載入資料
      await loadAllStatus()
    }
  } catch (err) {
    error.value = '刪除審核進度時發生錯誤'
    console.error('刪除錯誤:', err)
  }
}

// 清除所有篩選
const clearFilters = () => {
  filters.value = {
    crazy_clown_discord: '',
    pubg_official_discord: '',
    clan_review: '',
    official_review: '',
    in_game_application: '',
    role_assignment: '',
    is_closed: ''
  }
  searchQuery.value = ''
}

// 檢查是否有篩選條件
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    Object.values(filters.value).some(v => v !== '')
})

// 狀態選項
const statusOptions = {
  data_valid: ['⚠️ 待驗證', '⭕ 已驗證', '❌ 未通過'],
  crazy_clown_discord: ['❌ 未加入', '⚠️ 已加入，未完成報到', '⭕ 已加入'],
  pubg_official_discord: ['❌ 未加入', '⭕ 已加入'],
  clan_review: ['⚠️ 前二項未完成', '👁️ 審核中', '⭕ 已通過', '❌ 未通過'],
  official_review: ['⚠️ 待前項完成', '👁️ 審核中', '⭕ 已通過', '❌ 未通過'],
  in_game_application: ['❌ 未申請', '⭕ 已申請', '⚠️ 審核未通過'],
  role_assignment: ['⚠️ 待前項完成', '❌ 未申請', '⚠️ 審核未通過', '⭕ 已發放']
}

// 根據狀態獲取背景顏色類別
const getStatusBgClass = (status: string): string => {
  if (status.includes('⭕')) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  if (status.includes('⚠️')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
  if (status.includes('❌')) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
  if (status.includes('👁️')) return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
  return ''
}

onMounted(() => {
  loadAllStatus()
})
</script>

<template>
  <div class="max-w-[1600px] m-auto px-4 py-8">
    <DecorSection mainTitle="📊 審核進度管理" enTitle="Application Status Management">

      <!-- 頂部操作欄 -->
      <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div class="flex-1 w-full lg:w-auto">
            <input v-model="searchQuery" type="text" placeholder="搜尋 Steam ID、暱稱、Discord 名稱、遊戲 ID..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div class="flex gap-2">
            <button v-if="hasActiveFilters" @click="clearFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap">
              <i class="bi bi-x-circle"></i> 清除篩選
            </button>
            <button @click="loadAllStatus"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">
              <i class="bi bi-arrow-clockwise"></i> 重新整理
            </button>
          </div>
        </div>

        <!-- 篩選器 -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">快速篩選</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
            <select v-model="filters.crazy_clown_discord"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Crazy Clown Discord (全部)</option>
              <option v-for="opt in statusOptions.crazy_clown_discord" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.pubg_official_discord"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">PUBG 官方 Discord (全部)</option>
              <option v-for="opt in statusOptions.pubg_official_discord" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.clan_review"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">戰隊初審 (全部)</option>
              <option v-for="opt in statusOptions.clan_review" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.official_review"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">官方複審 (全部)</option>
              <option v-for="opt in statusOptions.official_review" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.in_game_application"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">遊戲內申請 (全部)</option>
              <option v-for="opt in statusOptions.in_game_application" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.role_assignment"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">身分組發放 (全部)</option>
              <option v-for="opt in statusOptions.role_assignment" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select v-model="filters.is_closed"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">是否結案 (全部)</option>
              <option value="false">未結案</option>
              <option value="true">已結案</option>
            </select>
          </div>
        </div>

        <!-- 統計資訊 -->
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          顯示 {{ filteredList.length }} 筆申請
          <span v-if="hasActiveFilters" class="text-blue-600 dark:text-blue-400">
            (已篩選，共 {{ statusList.length }} 筆)
          </span>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300">載入中...</span>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <!-- 成功訊息 -->
      <div v-if="successMessage"
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p class="text-blue-700 dark:text-blue-300">
          <i class="bi bi-info-circle mr-2"></i>{{ successMessage }}
        </p>
      </div>

      <!-- 審核進度列表 -->
      <div v-if="!loading" class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">

        <!-- 無資料 -->
        <div v-if="filteredList.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">沒有找到申請記錄</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ hasActiveFilters ? '請嘗試調整篩選條件' : '目前還沒有任何申請' }}
          </p>
        </div>

        <!-- 卡片網格佈局 -->
        <div v-else class="grid gap-6">
          <div v-for="item in filteredList" :key="item.id"
            class="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
            :class="{ 'ring-2 ring-blue-500': editingId === item.id }">
            <!-- 卡片頭部 -->
            <div
              class="px-6 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-zinc-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
              <div class="flex items-center gap-3">
                <!-- 頭像 -->
                <div
                  class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {{ item.nickName.charAt(0).toUpperCase() }}
                </div>

                <!-- 暱稱 -->
                <div class="min-w-[140px]">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">暱稱</label>
                  <input v-if="editingId === item.id" v-model="editingValues.nickName" type="text" placeholder="暱稱"
                    class="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full font-semibold" />
                  <div v-else class="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ item.nickName }}
                  </div>
                </div>

                <!-- Discord -->
                <div class="min-w-[160px]">
                  <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    <i class="bi bi-discord"></i> Discord
                  </label>
                  <input v-if="editingId === item.id" v-model="editingValues.discord_username" type="text"
                    placeholder="Discord"
                    class="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full" />
                  <div v-else class="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {{ item.discord_username }}
                  </div>
                </div>

                <!-- 結案狀態 -->
                <div class="flex items-center gap-1.5">
                  <label v-if="editingId === item.id"
                    class="flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="checkbox" v-model="editingValues.is_closed"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-xs font-semibold whitespace-nowrap"
                      :class="editingValues.is_closed ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'">
                      {{ editingValues.is_closed ? '✓ 已結案' : '⏳ 進行中' }}
                    </span>
                  </label>
                  <span v-else class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                    :class="item.is_closed ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'">
                    {{ item.is_closed ? '✓ 已結案' : '⏳ 進行中' }}
                  </span>
                </div>

                <!-- 時間資訊 -->
                <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <i class="bi bi-plus-circle"></i>
                    <span>{{ new Date(item.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day:
                      '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                  </div>
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    <i class="bi bi-arrow-repeat"></i>
                    <span>{{ new Date(item.updated_at).toLocaleDateString('zh-TW', { month: '2-digit', day:
                      '2-digit', hour: '2-digit', minute: '2-digit' }) }}</span>
                  </div>
                </div>

                <!-- 操作按鈕 -->
                <div class="flex items-center gap-2 ml-auto">
                  <div v-if="editingId === item.id" class="flex gap-2">
                    <button @click="saveEditing"
                      class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg whitespace-nowrap">
                      <i class="bi bi-check-lg"></i>
                      存檔
                    </button>
                    <button @click="cancelEditing"
                      class="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap">
                      <i class="bi bi-x-lg"></i>
                      取消
                    </button>
                  </div>
                  <div v-else class="flex gap-2">
                    <button @click="startEditing(item)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg whitespace-nowrap">
                      <i class="bi bi-pencil"></i>
                      編輯
                    </button>
                    <button @click="deleteStatus(item.id)"
                      class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap">
                      <i class="bi bi-trash"></i>
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 卡片內容 -->
            <div class="px-6 py-5">
              <!-- 5欄網格佈局 -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                <!-- 欄位 1: Discord UID -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Discord UID</label>
                      <input v-if="editingId === item.id" v-model="editingValues.discord_uid" type="text"
                        placeholder="Discord UID"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full font-mono" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono min-h-[26px] flex items-center truncate">
                        {{ item.discord_uid || '-' }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Thread ID</label>
                      <input v-if="editingId === item.id" v-model="editingValues.thread_id" type="text"
                        placeholder="Thread ID"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full font-mono" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono min-h-[26px] flex items-center truncate">
                        {{ item.thread_id || '-' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 欄位 2: PUBG Nickname -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PUBG Nickname</label>
                      <input v-if="editingId === item.id" v-model="editingValues.pubg_nickname" type="text"
                        placeholder="PUBG 暱稱"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-white min-h-[26px] flex items-center">
                        {{ item.pubg_nickname }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PUBG Account ID</label>
                      <input v-if="editingId === item.id" v-model="editingValues.pubg_account_id" type="text"
                        placeholder="PUBG Account ID"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full font-mono" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono min-h-[26px] flex items-center truncate">
                        {{ item.pubg_account_id || '-' }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Steam 17 ID</label>
                      <input v-if="editingId === item.id" v-model="editingValues.steam_17_id" type="text"
                        placeholder="Steam 17位ID"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full font-mono" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 font-mono min-h-[26px] flex items-center truncate">
                        {{ item.steam_17_id }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 欄位 3: 填寫資料是否正確 -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">填寫資料是否正確</label>
                      <select v-if="editingId === item.id" v-model="editingValues.data_valid"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option :value="null">未選擇</option>
                        <option v-for="opt in statusOptions.data_valid" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span v-if="item.data_valid" class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.data_valid)">
                          {{ item.data_valid }}
                        </span>
                        <span v-else class="text-xs px-2 py-1.5 text-gray-400 dark:text-gray-500">-</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">原因</label>
                      <input v-if="editingId === item.id" v-model="editingValues.data_valid_reason" type="text"
                        placeholder="原因（選填）"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded min-h-[26px] flex items-center"
                        :class="item.data_valid_reason ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                        {{ item.data_valid_reason || '-' }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">是否加入 Crazy_Clown Discord</label>
                      <select v-if="editingId === item.id" v-model="editingValues.crazy_clown_discord"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.crazy_clown_discord" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.crazy_clown_discord)">{{ item.crazy_clown_discord }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">是否加入 PUBG 官方 Discord</label>
                      <select v-if="editingId === item.id" v-model="editingValues.pubg_official_discord"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.pubg_official_discord" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.pubg_official_discord)">{{ item.pubg_official_discord }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 欄位 4: 戰隊初審 -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">戰隊初審</label>
                      <select v-if="editingId === item.id" v-model="editingValues.clan_review"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.clan_review" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.clan_review)">{{ item.clan_review }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">原因</label>
                      <input v-if="editingId === item.id" v-model="editingValues.clan_review_reason" type="text"
                        placeholder="原因（選填）"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded min-h-[26px] flex items-center"
                        :class="item.clan_review_reason ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                        {{ item.clan_review_reason || '-' }}
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">官方複審</label>
                      <select v-if="editingId === item.id" v-model="editingValues.official_review"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.official_review" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.official_review)">{{ item.official_review }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">原因</label>
                      <input v-if="editingId === item.id" v-model="editingValues.official_review_reason" type="text"
                        placeholder="原因（選填）"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full" />
                      <div v-else
                        class="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded min-h-[26px] flex items-center"
                        :class="item.official_review_reason ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
                        {{ item.official_review_reason || '-' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 欄位 5: 是否於遊戲內申請加入 -->
                <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div class="space-y-2">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">是否於遊戲內申請加入</label>
                      <select v-if="editingId === item.id" v-model="editingValues.in_game_application"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.in_game_application" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.in_game_application)">{{ item.in_game_application }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Discord 身分組發放</label>
                      <select v-if="editingId === item.id" v-model="editingValues.role_assignment"
                        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-full">
                        <option v-for="opt in statusOptions.role_assignment" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <div v-else class="min-h-[26px] flex items-center">
                        <span class="text-xs px-2 py-1 rounded inline-flex items-center"
                          :class="getStatusBgClass(item.role_assignment)">{{ item.role_assignment }}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div><!-- 網格結束 -->
            </div><!-- 卡片內容結束 -->
          </div><!-- 單個卡片結束 -->
        </div><!-- 卡片網格佈局結束 -->
      </div>

    </DecorSection>
  </div>
</template>

<style scoped>
/* 卡片陰影動畫 */
.shadow-md {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片hover效果 */
.hover\:shadow-xl:hover {
  transform: translateY(-2px);
}

/* 編輯中的卡片高亮 */
.ring-2 {
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {

  0%,
  100% {
    box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.5);
  }

  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
}

/* 標籤樣式 */
label {
  user-select: none;
  font-weight: 500;
}

/* 輸入框與顯示框統一樣式 */
input,
select {
  transition: all 0.2s ease-in-out;
}

input:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  border-color: rgb(59, 130, 246);
}

/* 按鈕動畫優化 */
button {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

button:active {
  transform: translateY(0);
}

/* 狀態標籤樣式 */
.rounded {
  border-radius: 0.5rem;
}

.rounded-lg {
  border-radius: 0.75rem;
}

.rounded-xl {
  border-radius: 1rem;
}

/* 容器高度一致性 */
.min-h-\[26px\] {
  line-height: 1.3;
  min-height: 26px;
}

/* 漸變背景 */
.bg-gradient-to-r,
.bg-gradient-to-br {
  background-size: 100% 100%;
  transition: background-size 0.3s ease;
}

/* 網格響應式優化 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 滾動條美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}

/* 深色模式優化 */
@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.4);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(75, 85, 99, 0.6);
  }
}
</style>
