<script setup lang="ts">
defineOptions({ name: 'ManageNew' })

import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/config/supabase'
import { DISCORD_CONFIG, DISCORD_TEMPLATES, FIELD_NAMES } from '@/config/discord'

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
  thread_id?: string
  created_at: string
  updated_at: string
}

// 申請列表
const applications = ref<ApplicationData[]>([])
const isLoading = ref(false)
const searchTerm = ref('')
const statusFilter = ref('all')

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)

// 編輯狀態
const editingApplication = ref<ApplicationData | null>(null)
const showEditModal = ref(false)

// 審核狀態選項
const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'waiting', label: '⏸️ 待前項完成' },
  { value: 'pending', label: '⏳ 待審核' },
  { value: 'reviewing', label: '🔄 審核中' },
  { value: 'approved', label: '✅ 已通過' },
  { value: 'rejected', label: '❌ 未通過' },
  { value: 'revoked', label: '↩️ 已撤銷' },
  { value: 'error', label: '⚠️ 資料異常' }
]

// 載入申請列表
const loadApplications = async () => {
  isLoading.value = true
  try {
    let query = supabase
      .from('join_application')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // 搜尋條件
    if (searchTerm.value.trim()) {
      query = query.or(`nickname.ilike.%${searchTerm.value}%,pubg_nickname.ilike.%${searchTerm.value}%,steam_id.ilike.%${searchTerm.value}%`)
    }

    // 狀態篩選
    if (statusFilter.value !== 'all') {
      query = query.eq('case_status', statusFilter.value)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('載入申請列表失敗：', error)
      return
    }

    applications.value = data || []
    totalItems.value = count || 0
  } catch (error) {
    console.error('載入申請列表失敗：', error)
  } finally {
    isLoading.value = false
  }
}

// 篩選後的申請列表
const filteredApplications = computed(() => {
  return applications.value
})

// 分頁後的申請列表
const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredApplications.value.slice(start, start + itemsPerPage.value)
})

// 重置分頁
const resetPagination = () => {
  currentPage.value = 1
}

// 編輯申請
const editApplication = (application: ApplicationData) => {
  editingApplication.value = {
    ...application,
    // 確保參與意願欄位正確格式化
    clan_task_willingness: formatWillingnessForEdit(application.clan_task_willingness),
    discord_activity_willingness: formatWillingnessForEdit(application.discord_activity_willingness),
    pubg_activity_willingness: formatWillingnessForEdit(application.pubg_activity_willingness)
  }
  showEditModal.value = true
}

// 刪除申請
const deleteApplication = async (application: ApplicationData) => {
  if (!confirm(`確定要刪除申請者「${application.nickname}」的申請嗎？此操作無法復原。`)) {
    return
  }

  try {
    const { error } = await supabase
      .from('join_application')
      .delete()
      .eq('id', application.id)

    if (error) {
      console.error('刪除申請失敗：', error)
      alert('刪除申請失敗，請稍後再試')
      return
    }

    // 重新載入申請列表
    await loadApplications()
    alert('申請已成功刪除')
  } catch (error) {
    console.error('刪除申請錯誤：', error)
    alert('刪除申請失敗，請稍後再試')
  }
}

// Discord 通知相關函數
const sendDiscordNotification = async (webhookUrl: string, content: string, threadId?: string) => {
  try {
    console.log('🚀 開始發送 Discord 狀態變動通知...')
    console.log('🔗 Webhook URL:', webhookUrl)
    console.log('🧵 Thread ID:', threadId)
    console.log('💬 通知內容:', content)

    // 對於論壇頻道，我們需要構建特殊的 Webhook URL
    let targetUrl = webhookUrl

    // 如果有 thread_id，構建發送到特定討論串的 URL
    if (threadId) {
      // 從原始 webhook URL 中提取 ID 和 token
      const urlMatch = webhookUrl.match(/webhooks\/(\d+)\/([^\/]+)/)
      if (urlMatch) {
        const [, webhookId, webhookToken] = urlMatch
        // 構建發送到特定討論串的 URL
        targetUrl = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}?thread_id=${threadId}`
        console.log('🔗 構建的 Thread URL:', targetUrl)
      }
    }

    const payload: {
      content: string
      username: string
      avatar_url: string
      thread_id?: string
    } = {
      content: content,
      username: 'Crazy Clown 戰隊申請系統',
      avatar_url: 'https://crazyclown.online/media/favicon/crazyclown/favicon-light.png'
    }

    // 如果有 thread_id，在 payload 中也加入 thread_id
    if (threadId) {
      payload.thread_id = threadId
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('📡 Discord API 回應狀態:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Discord 通知發送失敗：', response.status, response.statusText)
      console.error('❌ 錯誤詳情:', errorText)
    } else {
      console.log('✅ Discord 狀態變動通知發送成功')
    }
  } catch (error) {
    console.error('❌ Discord 通知發送錯誤：', error)
  }
}

// 將狀態值轉換為對應的標籤
const getStatusLabel = (status: string) => {
  return statusOptions.find(option => option.value === status)?.label || status || '未設定'
}

// 檢查欄位是否有變動
const checkFieldChanges = (oldData: ApplicationData, newData: ApplicationData) => {
  const changes: Array<{ field: string, oldValue: string, newValue: string, reason: string }> = []

  // 定義需要檢查的主要欄位（排除說明欄位）
  const mainFields = [
    'basic_status', 'game_status', 'supplement_status',
    'joined_clan_dc_status', 'clan_dc_checkin_status', 'joined_official_dc_status',
    'discord_active_status', 'game_active_status', 'clan_review_status',
    'official_review_status', 'game_apply_status', 'join_status',
    'discord_role_status', 'case_status'
  ]

  mainFields.forEach(fieldKey => {
    const fieldName = FIELD_NAMES[fieldKey as keyof typeof FIELD_NAMES]
    if (!fieldName) return

    const oldValue = oldData[fieldKey as keyof ApplicationData] || ''
    const newValue = newData[fieldKey as keyof ApplicationData] || ''

    if (oldValue !== newValue) {
      // 獲取對應的說明欄位
      let reasonKey: keyof ApplicationData
      let reason = ''

      // 根據欄位類型獲取對應的原因欄位
      if (fieldKey === 'case_status') {
        reasonKey = 'case_note' as keyof ApplicationData
      } else {
        // 將 _status 替換為 _reasons
        reasonKey = fieldKey.replace('_status', '_reasons') as keyof ApplicationData
      }

      reason = String(newData[reasonKey] || '')

      console.log(`🔍 欄位變動檢查: ${fieldName}`)
      console.log(`   舊值: ${oldValue}`)
      console.log(`   新值: ${newValue}`)
      console.log(`   原因欄位: ${reasonKey}`)
      console.log(`   原因值: "${reason}"`)
      console.log(`   原因長度: ${String(reason).length}`)

      changes.push({
        field: fieldName,
        oldValue: getStatusLabel(String(oldValue)),
        newValue: getStatusLabel(String(newValue)),
        reason: String(reason)
      })
    }
  })

  return changes
}

// 發送狀態變動通知
const sendStatusChangeNotification = async (application: ApplicationData, changes: Array<{ field: string, oldValue: string, newValue: string, reason: string }>) => {
  if (!application.thread_id || changes.length === 0 || !DISCORD_CONFIG.NOTIFICATION.ENABLED) {
    console.log('⚠️ 跳過 Discord 通知：', {
      hasThreadId: !!application.thread_id,
      hasChanges: changes.length > 0,
      notificationEnabled: DISCORD_CONFIG.NOTIFICATION.ENABLED
    })
    return
  }

  // 構建變動內容
  let changesText = ''
  changes.forEach(change => {
    console.log(`📝 構建變動內容: ${change.field}`)
    console.log(`   原因: "${change.reason}"`)
    console.log(`   原因是否為空: ${!change.reason || !change.reason.trim()}`)
    console.log(`   原因類型: ${typeof change.reason}`)

    let changeText = `**${change.field}** 更新為 **${change.newValue}**`

    // 檢查原因是否存在且不為空
    const hasReason = change.reason &&
      change.reason !== 'null' &&
      change.reason !== 'undefined' &&
      change.reason.trim() !== ''

    if (hasReason) {
      changeText += `，原因：${change.reason}`
    }
    changeText += '。'

    // 添加引用格式
    changesText += `> ${changeText}\n`
  })

  // 使用模板構建通知內容
  const notificationContent = DISCORD_TEMPLATES.STATUS_CHANGE_NOTIFICATION
    .replace('{discord_user_id}', application.discord_user_id)
    .replace('{changes}', changesText)
    .replace('{steam_id}', application.steam_id)

  console.log('📤 準備發送狀態變動通知到 thread_id:', application.thread_id)
  console.log('💬 通知內容:', notificationContent)

  await sendDiscordNotification(DISCORD_CONFIG.WEBHOOK_URL, notificationContent, application.thread_id)
}

// 保存編輯
const saveApplication = async () => {
  if (!editingApplication.value) return

  try {
    // 獲取更新前的資料用於比較
    const { data: oldData } = await supabase
      .from('join_application')
      .select('*')
      .eq('id', editingApplication.value.id)
      .single()

    const { error } = await supabase
      .from('join_application')
      .update({
        ...editingApplication.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingApplication.value.id)

    if (error) {
      console.error('更新申請失敗：', error)
      alert('更新失敗，請稍後再試')
      return
    }

    // 檢查是否有欄位變動，如果有則發送通知
    if (oldData) {
      const changes = checkFieldChanges(oldData, editingApplication.value)
      if (changes.length > 0) {
        await sendStatusChangeNotification(editingApplication.value, changes)
      }
    }

    showEditModal.value = false
    editingApplication.value = null
    loadApplications()
  } catch (error) {
    console.error('更新申請失敗：', error)
    alert('更新失敗，請稍後再試')
  }
}

// 取消編輯
const cancelEdit = () => {
  showEditModal.value = false
  editingApplication.value = null
}


// 狀態文字
const getStatusText = (status: string | null | undefined) => {
  return statusOptions.find(option => option.value === status)?.label || status || '未設定'
}

// 狀態顏色
const getStatusColor = (status: string | null | undefined) => {
  const colorMap: { [key: string]: string } = {
    'waiting': 'text-orange-600 dark:text-orange-400',
    'pending': 'text-yellow-600 dark:text-yellow-400',
    'reviewing': 'text-blue-600 dark:text-blue-400',
    'approved': 'text-green-600 dark:text-green-400',
    'rejected': 'text-red-600 dark:text-red-400',
    'revoked': 'text-gray-600 dark:text-gray-400',
    'error': 'text-red-600 dark:text-red-400',
    'processing': 'text-blue-600 dark:text-blue-400',
    'closed': 'text-gray-600 dark:text-gray-400'
  }
  return colorMap[status || ''] || 'text-gray-600 dark:text-gray-400'
}


// 查看詳情
const viewDetails = (application: ApplicationData) => {
  // 跳轉到查詢頁面
  window.open(`/join/query?steam_id=${application.steam_id}`, '_blank')
}

// 處理參與意願值
const isWilling = (value: string | boolean | number | null | undefined) => {
  if (value === true || value === 'true' || value === 'TRUE' || value === 1 || value === '1') {
    return true
  }
  return false
}

// 格式化參與意願值用於編輯
const formatWillingnessForEdit = (value: string | boolean | number | null | undefined) => {
  return isWilling(value) ? 'TRUE' : 'FALSE'
}

// 計算總頁數
const totalPages = computed(() => Math.ceil(filteredApplications.value.length / itemsPerPage.value))

// 分頁導航
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 監聽搜尋條件變化，實現即時搜尋
watch([searchTerm, statusFilter], () => {
  loadApplications()
}, { deep: true })

onMounted(() => {
  loadApplications()
})
</script>

<template>
  <div
    class="min-h-screen px-4 py-8 space-y-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700">

    <!-- 搜尋與篩選 -->
    <div
      class="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">搜尋</label>
          <input v-model="searchTerm" type="text" placeholder="搜尋暱稱、PUBG暱稱、Steam ID..."
            class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            @input="resetPagination" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">狀態篩選</label>
          <select v-model="statusFilter"
            class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            @change="resetPagination">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="mt-4 px-4 p-2 bg-gray-50 dark:bg-zinc-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <span>搜尋結果：{{ filteredApplications.length }} 項</span>
        <span>總計：{{ applications.length }} 項</span>
      </div>
    </div>

    <!-- 申請列表 -->
    <div
      class="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">

      <!-- 申請列表 -->
      <div class="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <!-- 標題列 -->
            <thead class="bg-zinc-400 dark:bg-zinc-700">
              <tr class="text-center text-white font-medium">
                <th class="py-3">申請者</th>
                <th class="py-3">資料審核</th>
                <th class="py-3">活躍考核</th>
                <th class="py-3">正式審核</th>
                <th class="py-3">加入作業</th>
                <th class="py-3">整體狀態</th>
                <th class="py-3">操作</th>
              </tr>
            </thead>

            <!-- 資料列 -->
            <tbody class="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
              <tr v-if="paginatedApplications.length === 0">
                <td class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400" colspan="7">
                  {{ isLoading ? '載入中…' : '沒有資料' }}
                </td>
              </tr>
              <tr v-for="app in paginatedApplications" :key="app.id"
                class="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">

                <!-- 申請者 -->
                <td class="text-center">
                  <div title="暱稱" class="text-sm font-medium text-gray-900 dark:text-zinc-100">{{ app.nickname }}
                  </div>
                  <div title="Discord 名稱" class="text-xs text-gray-500 dark:text-zinc-400">{{ app.discord_username }}
                  </div>
                  <div title="PUBG 暱稱" class="text-xs text-gray-500 dark:text-zinc-400">{{ app.pubg_nickname }}</div>
                  <div title="Steam ID" class="text-xs text-gray-500 dark:text-zinc-400">{{ app.steam_id }}</div>
                </td>

                <!-- 資料審核 -->
                <td class="px-4 text-center">
                  <div class="grid grid-cols-1 gap-1">
                    <div>
                      <span title="基本資料審核" :class="getStatusColor(app.basic_status)" class="text-xs font-medium">
                        {{ getStatusText(app.basic_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="遊戲資料審核" :class="getStatusColor(app.game_status)" class="text-xs font-medium">
                        {{ getStatusText(app.game_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="補充資料審核" :class="getStatusColor(app.supplement_status)" class="text-xs font-medium">
                        {{ getStatusText(app.supplement_status) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- 活躍考核 -->
                <td class="text-center">
                  <div class="grid grid-cols-2 gap-1">
                    <div>
                      <span title="是否加入戰隊DC" :class="getStatusColor(app.joined_clan_dc_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.joined_clan_dc_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="是否完成戰隊DC報到" :class="getStatusColor(app.clan_dc_checkin_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.clan_dc_checkin_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="是否加入官方DC" :class="getStatusColor(app.joined_official_dc_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.joined_official_dc_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="社群活躍審核" :class="getStatusColor(app.discord_active_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.discord_active_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="遊戲內活躍審核" :class="getStatusColor(app.game_active_status)" class="text-xs font-medium">
                        {{ getStatusText(app.game_active_status) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- 正式審核 -->
                <td class="text-center">
                  <div class="grid grid-cols-1 gap-1">
                    <div>
                      <span title="戰隊初審" :class="getStatusColor(app.clan_review_status)" class="text-xs font-medium">
                        {{ getStatusText(app.clan_review_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="官方複審" :class="getStatusColor(app.official_review_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.official_review_status) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- 加入作業 -->
                <td class="text-center">
                  <div class="grid grid-cols-1 gap-1">
                    <div>
                      <span title="是否於遊戲內送出申請" :class="getStatusColor(app.game_apply_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.game_apply_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="是否完成加入作業" :class="getStatusColor(app.join_status)" class="text-xs font-medium">
                        {{ getStatusText(app.join_status) }}
                      </span>
                    </div>
                    <div>
                      <span title="是否獲得DC身分組" :class="getStatusColor(app.discord_role_status)"
                        class="text-xs font-medium">
                        {{ getStatusText(app.discord_role_status) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- 整體狀態 -->
                <td class="text-center">
                  <span :class="getStatusColor(app.case_status)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusText(app.case_status) }}
                  </span>
                </td>

                <!-- 操作 -->
                <td class="text-center">
                  <div class="grid grid-cols-1 gap-1">
                    <i @click="editApplication(app)" title="編輯"
                      class="bi bi-pencil-square text-blue-500 hover:text-blue-700 transition-all cursor-pointer" />
                    <i @click="viewDetails(app)" title="查看詳情"
                      class="bi bi-eye text-gray-500 hover:text-gray-700 transition-all cursor-pointer" />
                    <i @click="deleteApplication(app)" title="刪除"
                      class="bi bi-trash text-red-500 hover:text-red-700 transition-all cursor-pointer" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分頁 -->
      <div v-if="totalPages > 1"
        class="bg-gray-50 dark:bg-zinc-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-zinc-600">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-zinc-600 text-sm font-medium rounded-md text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
            上一頁
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-zinc-600 text-sm font-medium rounded-md text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
            下一頁
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-zinc-300">
              顯示第 {{ (currentPage - 1) * itemsPerPage + 1 }} 到 {{ Math.min(currentPage * itemsPerPage,
                filteredApplications.length) }}
              筆，共 {{ filteredApplications.length }} 筆
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="bi bi-chevron-left" />
              </button>
              <button v-for="page in Math.min(5, totalPages)" :key="page" @click="goToPage(page)"
                :class="page === currentPage ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                {{ page }}
              </button>
              <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="bi bi-chevron-right" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 編輯模態框 -->
  <div v-if="showEditModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div
        class="relative w-full max-w-6xl bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
        <!-- 模態框標題 -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i class="bi bi-pencil-square text-lg text-white" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">編輯申請狀態</h3>
              </div>
            </div>
            <button @click="cancelEdit"
              class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all">
              <i class="bi bi-x-lg text-lg" />
            </button>
          </div>
        </div>

        <!-- 編輯內容 -->
        <div v-if="editingApplication" class="p-6 max-h-[80vh] overflow-y-auto">
          <div class="space-y-4">
            <!-- 基本資訊 -->
            <div
              class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <i class="bi bi-person-fill text-white text-lg"></i>
                </div>
                <h4 class="text-xl font-bold text-blue-800 dark:text-blue-300">基本資訊</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">暱稱</label>
                  <input v-model="editingApplication.nickname" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">Discord ID</label>
                  <input v-model="editingApplication.discord_user_id" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">Discord 名稱</label>
                  <input v-model="editingApplication.discord_username" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">PUBG 暱稱</label>
                  <input v-model="editingApplication.pubg_nickname" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">PUBG Account ID</label>
                  <input v-model="editingApplication.pubg_account_id" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">Steam ID</label>
                  <input v-model="editingApplication.steam_id" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">總遊戲時間 (小時)</label>
                  <input v-model.number="editingApplication.total_play_time" type="number"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">每週遊戲時間 (小時)</label>
                  <input v-model.number="editingApplication.weekly_play_time" type="number"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">Discord 討論串 ID</label>
                  <input v-model="editingApplication.thread_id" type="text"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Discord 討論串 ID" />
                </div>
              </div>
            </div>

            <!-- 參與意願 -->
            <div
              class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <i class="bi bi-heart-fill text-white text-lg"></i>
                </div>
                <h4 class="text-xl font-bold text-green-800 dark:text-green-300">參與意願</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">戰隊任務</label>
                  <select v-model="editingApplication.clan_task_willingness"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                    <option value="TRUE">✅ 願意</option>
                    <option value="FALSE">❌ 不願意</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">Discord 活躍</label>
                  <select v-model="editingApplication.discord_activity_willingness"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                    <option value="TRUE">✅ 願意</option>
                    <option value="FALSE">❌ 不願意</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300">PUBG 活躍</label>
                  <select v-model="editingApplication.pubg_activity_willingness"
                    class="w-full px-4 py-3 bg-white dark:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
                    <option value="TRUE">✅ 願意</option>
                    <option value="FALSE">❌ 不願意</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 審核狀態總覽 -->
            <div
              class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <i class="bi bi-clipboard-check text-white text-lg"></i>
                </div>
                <h4 class="text-xl font-bold text-purple-800 dark:text-purple-300">審核狀態總覽</h4>
              </div>

              <!-- 資料審核 -->
              <div class="mb-8">
                <h5 class="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-file-text"></i>
                  資料審核
                </h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 基本資料審核 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">基本資料審核</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.basic_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.basic_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 遊戲資料審核 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">遊戲資料審核</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.game_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.game_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 補充資料審核 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">補充資料審核</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.supplement_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.supplement_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 活躍考核 -->
              <div class="mb-8">
                <h5 class="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-activity"></i>
                  活躍考核
                </h5>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <!-- 是否加入戰隊DC -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">是否加入戰隊DC</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.joined_clan_dc_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.joined_clan_dc_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 是否完成戰隊DC報到 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">是否完成戰隊DC報到</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.clan_dc_checkin_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.clan_dc_checkin_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 是否加入官方DC -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">是否加入官方DC</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.joined_official_dc_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.joined_official_dc_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 社群活躍審核 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">社群活躍審核</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.discord_active_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.discord_active_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 遊戲內活躍審核 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">遊戲內活躍審核</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.game_active_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.game_active_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 正式審核 -->
              <div class="mb-8">
                <h5 class="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-shield-check"></i>
                  正式審核
                </h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- 戰隊初審 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">戰隊初審</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.clan_review_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.clan_review_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 官方複審 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">官方複審</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.official_review_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.official_review_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 加入作業 -->
              <div class="mb-8">
                <h5 class="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-people-fill"></i>
                  加入作業
                </h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 是否於遊戲內送出申請 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">是否於遊戲內送出申請</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.game_apply_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.game_apply_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- 是否完成加入作業 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">是否完成加入作業</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.join_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.join_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <!-- DC身分組發放 -->
                  <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-semibold text-gray-700 dark:text-zinc-300">DC身分組發放</span>
                    </div>
                    <div class="space-y-3">
                      <select v-model="editingApplication.discord_role_status"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <input v-model="editingApplication.discord_role_reasons" type="text" placeholder="審核說明"
                        class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 案件狀態 -->
              <div class="bg-white dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-600">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-lg font-semibold text-gray-800 dark:text-zinc-200">案件狀態</span>
                </div>
                <div class="grid grid-cols-1 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">整體狀態</label>
                    <select v-model="editingApplication.case_status"
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                      <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">案件備註</label>
                    <textarea v-model="editingApplication.case_note" rows="3"
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="輸入案件備註..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="sticky bottom-0 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 px-12 py-2">
          <div class="flex items-center justify-between space-x-4">
            <button @click="cancelEdit"
              class="px-6 py-2 text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-600 border border-gray-300 dark:border-zinc-500 rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all transform hover:scale-105">
              <i class="bi bi-x-lg mr-2"></i>
              取消
            </button>
            <button @click="saveApplication"
              class="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-500 border border-transparent rounded-xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 shadow-lg">
              <i class="bi bi-check-lg mr-2"></i>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
