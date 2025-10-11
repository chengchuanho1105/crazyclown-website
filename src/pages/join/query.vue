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
  role_assignment: ''
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
    if (!DISCORD_WEBHOOK_URL) {
      console.warn('未設定 Discord Webhook URL')
      return
    }

    // 構建通知訊息
    const embed = {
      title: '📢 審核進度已更新',
      description: ``,
      color: 0x3b82f6, // 藍色
      fields: [
        {
          name: '',
          value: `<@${application.discord_uid}> 您的申請審核進度已更新！`,
          inline: true
        },
        {
          name: '',
          value: `[點擊查看完整審核進度](https://crazyclown.online/join/${application.steam_17_id})`,
          inline: false
        }
      ],
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
    role_assignment: ''
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
  crazy_clown_discord: ['❌ 未加入', '⚠️ 已加入，未完成報到', '⭕ 已加入'],
  pubg_official_discord: ['❌ 未加入', '⭕ 已加入'],
  clan_review: ['⚠️ 前二項未完成', '👁️ 審核中', '⭕ 已通過', '❌ 未通過'],
  official_review: ['⚠️ 待前項完成', '👁️ 審核中', '⭕ 已通過', '❌ 未通過'],
  in_game_application: ['❌ 未申請', '⭕ 已申請', '⚠️ 審核未通過'],
  role_assignment: ['⚠️ 待前項完成', '❌ 未申請', '⚠️ 審核未通過', '⭕ 已發放']
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
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜尋 Steam ID、暱稱、Discord 名稱、遊戲 ID..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              <i class="bi bi-x-circle"></i> 清除篩選
            </button>
            <button
              @click="loadAllStatus"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <i class="bi bi-arrow-clockwise"></i> 重新整理
            </button>
          </div>
        </div>

        <!-- 篩選器 -->
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">快速篩選</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select
              v-model="filters.crazy_clown_discord"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Crazy Clown Discord (全部)</option>
              <option v-for="opt in statusOptions.crazy_clown_discord" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select
              v-model="filters.pubg_official_discord"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">PUBG 官方 Discord (全部)</option>
              <option v-for="opt in statusOptions.pubg_official_discord" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select
              v-model="filters.clan_review"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">戰隊初審 (全部)</option>
              <option v-for="opt in statusOptions.clan_review" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select
              v-model="filters.official_review"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">官方複審 (全部)</option>
              <option v-for="opt in statusOptions.official_review" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select
              v-model="filters.in_game_application"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">遊戲內申請 (全部)</option>
              <option v-for="opt in statusOptions.in_game_application" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <select
              v-model="filters.role_assignment"
              class="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">身分組發放 (全部)</option>
              <option v-for="opt in statusOptions.role_assignment" :key="opt" :value="opt">{{ opt }}</option>
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
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      </div>

      <!-- 成功訊息 -->
      <div v-if="successMessage" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p class="text-blue-700 dark:text-blue-300">
          <i class="bi bi-info-circle mr-2"></i>{{ successMessage }}
        </p>
      </div>

      <!-- 審核進度列表 -->
      <div v-if="!loading" class="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">

        <!-- 無資料 -->
        <div v-if="filteredList.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">沒有找到申請記錄</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ hasActiveFilters ? '請嘗試調整篩選條件' : '目前還沒有任何申請' }}
          </p>
        </div>

        <!-- 表格 -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  申請人資訊
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Discord 通知
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  遊戲資訊
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  1️⃣2️⃣ Discord
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  3️⃣ 戰隊初審
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  4️⃣ 官方複審
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  5️⃣6️⃣ 遊戲/身分
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  結案/時間
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in filteredList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-900">

                <!-- 1. 申請人資訊 (nickName + discord_username) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">暱稱</div>
                    <input
                      v-model="editingValues.nickName"
                      type="text"
                      placeholder="暱稱"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    />
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Discord</div>
                    <input
                      v-model="editingValues.discord_username"
                      type="text"
                      placeholder="Discord 使用者名稱"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                    />
                  </div>
                  <div v-else>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ item.nickName }}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-300">{{ item.discord_username }}</div>
                  </div>
                </td>

                <!-- 2. Discord 通知 (discord_uid + thread_id) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">UID</div>
                    <input
                      v-model="editingValues.discord_uid"
                      type="text"
                      placeholder="Discord UID"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full font-mono mb-2"
                    />
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Thread</div>
                    <input
                      v-model="editingValues.thread_id"
                      type="text"
                      placeholder="Thread ID"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full font-mono"
                    />
                  </div>
                  <div v-else>
                    <div class="text-xs text-gray-500 dark:text-gray-400">UID:
                      <span class="font-mono text-gray-600 dark:text-gray-300">{{ item.discord_uid || '-' }}</span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Thread:
                      <span class="font-mono text-gray-600 dark:text-gray-300">{{ item.thread_id || '-' }}</span>
                    </div>
                  </div>
                </td>

                <!-- 3. 遊戲資訊 (pubg_nickname + steam_17_id) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">PUBG ID</div>
                    <input
                      v-model="editingValues.pubg_nickname"
                      type="text"
                      placeholder="PUBG 暱稱"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    />
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Steam ID</div>
                    <input
                      v-model="editingValues.steam_17_id"
                      type="text"
                      placeholder="Steam 17位ID"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full font-mono"
                    />
                  </div>
                  <div v-else>
                    <div class="text-xs text-gray-600 dark:text-gray-300">{{ item.pubg_nickname }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ item.steam_17_id }}</div>
                  </div>
                </td>

                <!-- 4. Discord 狀態 (crazy_clown_discord + pubg_official_discord) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">1️⃣ CC</div>
                    <select
                      v-model="editingValues.crazy_clown_discord"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    >
                      <option v-for="opt in statusOptions.crazy_clown_discord" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">2️⃣ PUBG</div>
                    <select
                      v-model="editingValues.pubg_official_discord"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                    >
                      <option v-for="opt in statusOptions.pubg_official_discord" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                  <div v-else>
                    <div class="text-xs mb-1">{{ item.crazy_clown_discord }}</div>
                    <div class="text-xs">{{ item.pubg_official_discord }}</div>
                  </div>
                </td>

                <!-- 5. 戰隊初審 (clan_review + clan_review_reason) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">狀態</div>
                    <select
                      v-model="editingValues.clan_review"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    >
                      <option v-for="opt in statusOptions.clan_review" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">原因</div>
                    <input
                      v-model="editingValues.clan_review_reason"
                      type="text"
                      placeholder="原因（選填）"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                    />
                  </div>
                  <div v-else>
                    <div class="text-xs mb-1">{{ item.clan_review }}</div>
                    <div v-if="item.clan_review_reason" class="text-xs text-red-600 dark:text-red-400">
                      {{ item.clan_review_reason }}
                    </div>
                  </div>
                </td>

                <!-- 6. 官方複審 (official_review + official_review_reason) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">狀態</div>
                    <select
                      v-model="editingValues.official_review"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    >
                      <option v-for="opt in statusOptions.official_review" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">原因</div>
                    <input
                      v-model="editingValues.official_review_reason"
                      type="text"
                      placeholder="原因（選填）"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                    />
                  </div>
                  <div v-else>
                    <div class="text-xs mb-1">{{ item.official_review }}</div>
                    <div v-if="item.official_review_reason" class="text-xs text-red-600 dark:text-red-400">
                      {{ item.official_review_reason }}
                    </div>
                  </div>
                </td>

                <!-- 7. 遊戲/身分 (in_game_application + role_assignment) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">5️⃣ 遊戲</div>
                    <select
                      v-model="editingValues.in_game_application"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full mb-2"
                    >
                      <option v-for="opt in statusOptions.in_game_application" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">6️⃣ 身分</div>
                    <select
                      v-model="editingValues.role_assignment"
                      class="text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                    >
                      <option v-for="opt in statusOptions.role_assignment" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                  <div v-else>
                    <div class="text-xs mb-1">{{ item.in_game_application }}</div>
                    <div class="text-xs">{{ item.role_assignment }}</div>
                  </div>
                </td>

                <!-- 8. 時間與狀態 (is_closed + created_at + updated_at) -->
                <td class="px-3 py-3">
                  <div v-if="editingId === item.id">
                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">結案狀態</div>
                    <label class="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="editingValues.is_closed"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="text-xs" :class="editingValues.is_closed ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'">
                        {{ editingValues.is_closed ? '✓ 已結案' : '未結案' }}
                      </span>
                    </label>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      <div class="mb-1">建立: {{ new Date(item.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</div>
                      <div>更新: {{ new Date(item.updated_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</div>
                    </div>
                  </div>
                  <div v-else>
                    <div class="text-xs mb-2" :class="item.is_closed ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-300'">
                      {{ item.is_closed ? '✓ 已結案' : '未結案' }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      <div class="mb-1">建立: {{ new Date(item.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</div>
                      <div>更新: {{ new Date(item.updated_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</div>
                    </div>
                  </div>
                </td>

                <!-- 9. 操作 -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <div v-if="editingId === item.id" class="flex flex-col gap-1">
                    <button
                      @click="saveEditing"
                      class="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm"
                      title="存檔"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button
                      @click="cancelEditing"
                      class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      title="取消"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                  <div v-else class="flex flex-col gap-1">
                    <button
                      @click="startEditing(item)"
                      class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      title="編輯"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deleteStatus(item.id)"
                      class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      title="刪除"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </DecorSection>
  </div>
</template>

<style scoped>
/* 表格內容自動換行 */
td {
  word-wrap: break-word;
  max-width: 150px;
  min-width: 100px;
}

/* 編輯中的儲存格高亮 */
.editing {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 調整輸入框和選擇框樣式 */
select, input {
  font-size: 0.75rem;
}
</style>

