<script setup lang="ts">
defineOptions({ name: 'ApplicationStatusQuery' })

import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ApplicationStatusService } from '@/services/supabaseService'
import type { ClanApplication } from '@/config/supabase'

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

const statusData = ref<ClanApplication | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showInputForm = ref(true)

// 載入審核進度
const loadStatus = async (id?: string) => {
  const searchId = (id || steamId.value).trim()

  if (!searchId || !isValidSteamId(searchId)) {
    if (id) {
      error.value = 'Steam ID 必須為 17 位數字'
    }
    showInputForm.value = true
    return
  }

  loading.value = true
  error.value = null
  statusData.value = null

  // 滾動到頁面頂部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })

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
  steamIdInput.value = ''
  steamId.value = ''
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

// 審核步驟配置
const reviewSteps = computed(() => {
  if (!statusData.value) return []

  return [
    {
      id: 1,
      title: '填寫資料是否正確',
      subtitle: '資料完整性與正確性驗證',
      status: statusData.value.data_valid || '⚠️ 待驗證',
      reason: statusData.value.data_valid_reason,
      link: null,
      icon: 'bi-file-text',
      color: 'teal'
    },
    {
      id: 2,
      title: '加入 Crazy_Clown Discord 社群',
      subtitle: '加入 Crazy_Clown Discord 社群，並完成報到',
      status: statusData.value.crazy_clown_discord,
      reason: null,
      link: 'https://crazyclown.online/dc',
      icon: 'bi-discord',
      color: 'blue'
    },
    {
      id: 3,
      title: '加入 PUBG 官方 Discord 社群',
      subtitle: '加入 PUBG 官方 Discord 社群',
      status: statusData.value.pubg_official_discord,
      reason: null,
      link: 'https://kraftontw.info/Discord',
      icon: 'bi-discord',
      color: 'purple'
    },
    {
      id: 4,
      title: '戰隊初審',
      subtitle: '資格審核',
      status: statusData.value.clan_review,
      reason: statusData.value.clan_review_reason,
      link: null,
      icon: 'bi-shield-check',
      color: 'green'
    },
    {
      id: 5,
      title: '官方複審',
      subtitle: '最終審核',
      status: statusData.value.official_review,
      reason: statusData.value.official_review_reason,
      link: null,
      icon: 'bi-check-circle',
      color: 'indigo'
    },
    {
      id: 6,
      title: '遊戲內申請',
      subtitle: '送出入隊申請',
      status: statusData.value.in_game_application,
      reason: null,
      link: null,
      icon: 'bi-controller',
      color: 'yellow'
    },
    {
      id: 7,
      title: '身分組發放',
      subtitle: '完成加入',
      status: statusData.value.role_assignment,
      reason: null,
      link: null,
      icon: 'bi-award',
      color: 'pink'
    }
  ]
})

// 計算整體進度
const overallProgress = computed(() => {
  if (!statusData.value) return 0
  const completed = reviewSteps.value.filter(step => step.status.includes('⭕')).length
  return Math.round((completed / 7) * 100)
})

// 獲取步驟狀態類型
const getStepStatus = (status: string) => {
  if (status.includes('⭕')) return 'completed'
  if (status.includes('👁️')) return 'in-progress'
  if (status.includes('❌')) return 'rejected'
  if (status.includes('⚠️')) return 'warning'
  return 'pending'
}

// 獲取狀態圖標
const getStatusIcon = (status: string) => {
  if (status.includes('⭕')) return 'bi-check-circle-fill'
  if (status.includes('👁️')) return 'bi-eye-fill'
  if (status.includes('❌')) return 'bi-x-circle-fill'
  if (status.includes('⚠️')) return 'bi-exclamation-triangle-fill'
  return 'bi-circle'
}

onMounted(() => {
  if (steamId.value && isValidSteamId(steamId.value)) {
    showInputForm.value = false
    loadStatus()
  } else {
    showInputForm.value = true
    error.value = null
  }
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
    <div class="max-w-6xl mx-auto px-4 py-12">

      <!-- Steam ID 輸入表單 -->
      <div v-if="showInputForm && !loading" class="max-w-2xl mx-auto">
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">

          <!-- 錯誤訊息 -->
          <div v-if="error"
            class="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
            <div class="flex items-start gap-3">
              <i class="bi bi-exclamation-triangle-fill text-red-600 dark:text-red-400 text-xl"></i>
              <div>
                <h4 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">查詢失敗</h4>
                <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
              </div>
            </div>
          </div>

          <div class="text-center mb-8">
            <div
              class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 mb-4 shadow-lg">
              <i class="bi bi-search text-5xl text-blue-600 dark:text-blue-400"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">審核進度查詢</h2>
          </div>

          <form @submit.prevent="handleSearch" class="space-y-6">
            <div>
              <label for="steamIdInput" class="block text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 space-x-2">
                <i class="bi bi-steam" />請輸入 Steam ID <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input id="steamIdInput" v-model="steamIdInput" type="text" maxlength="17"
                  placeholder="76561198901234567"
                  class="w-full p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-mono transition-all"
                  required />
              </div>
            </div>

            <button type="submit"
              class="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <i class="bi bi-search text-xl"></i>
              查詢審核進度
            </button>
          </form>

          <div class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-center text-sm text-gray-600 dark:text-gray-400">
              還沒有提交申請？
              <a href="/join"
                class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 ml-2">
                立即申請加入戰隊
                <i class="bi bi-arrow-right"></i>
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-else-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 dark:border-gray-700"></div>
          <div
            class="animate-spin rounded-full h-20 w-20 border-4 border-t-blue-600 border-r-purple-600 absolute top-0 left-0">
          </div>
        </div>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 font-semibold">查詢中...</p>
      </div>

      <!-- 審核進度內容 -->
      <div v-else-if="statusData" class="space-y-8">

        <!-- 申請人資訊卡片 -->
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <i class="bi bi-person-badge text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">申請人資訊</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="group">
              <div
                class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                <i class="bi bi-person-circle text-2xl text-blue-600 dark:text-blue-400"></i>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">姓名/暱稱</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ statusData.nickName }}</p>
                </div>
              </div>
            </div>
            <div class="group">
              <div
                class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                <i class="bi bi-discord text-2xl text-purple-600 dark:text-purple-400"></i>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Discord 使用者名稱</p>
                  <p class="font-mono font-semibold text-gray-900 dark:text-white">{{
                    statusData.discord_username }}</p>
                </div>
              </div>
            </div>
            <div class="group">
              <div
                class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                <i class="bi bi-controller text-2xl text-green-600 dark:text-green-400"></i>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">PUBG 暱稱</p>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ statusData.pubg_nickname }}</p>
                </div>
              </div>
            </div>
            <div class="group">
              <div
                class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                <i class="bi bi-shield-check text-2xl text-indigo-600 dark:text-indigo-400"></i>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">申請戰隊</p>
                  <p class="font-semibold text-blue-600 dark:text-blue-400">{{ statusData.clan_applied }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 整體進度 -->
        <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl px-8 py-4 text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <i class="bi bi-speedometer2 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold">整體進度</h3>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold">{{ overallProgress }}%</div>
              <p class="text-sm text-white/80">已完成</p>
            </div>
          </div>
          <div class="relative">
            <div class="overflow-hidden h-4 rounded-full bg-white/20 backdrop-blur-sm">
              <div :style="{ width: overallProgress + '%' }"
                class="h-full bg-white rounded-full shadow-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2">
                <div class="w-4 h-4 bg-white rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm text-white/90">
            <i class="bi bi-info-circle-fill"></i>
            <span>{{reviewSteps.filter(s => s.status.includes('⭕')).length}} / 7 步驟已完成</span>
          </div>
        </div>

        <!-- 審核進度時間軸 -->
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl px-8 py-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3 mb-8">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white">
              <i class="bi bi-list-check text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">審核進度</h2>
          </div>

          <!-- 時間軸 -->
          <div class="relative">
            <!-- 時間軸線條 -->
            <div
              class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800">
            </div>

            <!-- 步驟列表 -->
            <div class="space-y-4">
              <div v-for="step in reviewSteps" :key="step.id" class="relative pl-16 group">
                <!-- 時間軸節點 -->
                <div :class="[
                  'absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-all duration-300',
                  getStepStatus(step.status) === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110' :
                    getStepStatus(step.status) === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse' :
                      getStepStatus(step.status) === 'rejected' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                        getStepStatus(step.status) === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                          'bg-gray-300 dark:bg-gray-700'
                ]">
                  <i :class="[step.icon]"></i>
                </div>

                <!-- 步驟內容卡片 -->
                <div :class="[
                  'rounded-xl px-4 py-2 transition-all duration-300 border-2',
                  getStepStatus(step.status) === 'completed' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800' :
                    getStepStatus(step.status) === 'in-progress' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800' :
                      getStepStatus(step.status) === 'rejected' ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800' :
                        getStepStatus(step.status) === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800' :
                          'bg-gray-50 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700',
                  'group-hover:shadow-xl group-hover:-translate-y-1'
                ]">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <!-- 標題與副標題 -->
                      <div class="flex items-center gap-3 mb-2">
                        <span class="text-xl font-bold text-gray-400 dark:text-gray-600">{{ step.id }}</span>
                        <div>
                          <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ step.title }}</h3>
                          <p class="text-sm text-gray-600 dark:text-gray-400">{{ step.subtitle }}
                            <span class="ml-4">
                              <!-- 連結（如果有） -->
                              <a v-if="step.link" :href="step.link" target="_blank"
                                class="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-2">
                                <i class="bi bi-box-arrow-up-right"></i>
                                點我前往完成此步驟
                              </a>
                            </span>
                          </p>
                        </div>
                      </div>
                      <!-- 原因（如果有） -->
                      <div v-if="step.reason"
                        class="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
                        <div class="flex items-start gap-2">
                          <i class="bi bi-exclamation-triangle-fill text-red-600 dark:text-red-400 mt-0.5"></i>
                          <div>
                            <p class="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">原因</p>
                            <p class="text-sm text-red-700 dark:text-red-400">{{ step.reason }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 狀態標記 -->
                    <div class="flex flex-col items-end gap-2">
                      <div :class="[
                        'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm',
                        getStepStatus(step.status) === 'completed' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          getStepStatus(step.status) === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                            getStepStatus(step.status) === 'rejected' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                              getStepStatus(step.status) === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                                'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
                      ]">
                        <i :class="getStatusIcon(step.status)"></i>
                        <span>{{ step.status }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 時間資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-center gap-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <i class="bi bi-calendar-plus text-2xl text-blue-600 dark:text-blue-400"></i>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">申請時間</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(statusData.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center justify-center gap-4 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <i class="bi bi-calendar-check text-2xl text-purple-600 dark:text-purple-400"></i>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">最後更新</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(statusData.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button @click="loadStatus()"
            class="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div class="flex items-center justify-center gap-3">
              <i class="bi bi-arrow-clockwise text-xl"></i>
              <span class="font-semibold">重新整理</span>
            </div>
          </button>
          <button @click="backToInput"
            class="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <div class="flex items-center justify-center gap-3">
              <i class="bi bi-search text-xl"></i>
              <span class="font-semibold">查詢其他申請</span>
            </div>
          </button>
        </div>

        <!-- 提示訊息 -->
        <div
          class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border-2 border-blue-300 dark:border-blue-800">
          <div class="flex items-center gap-2">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white flex-shrink-0">
              <i class="bi bi-lightbulb text-xl" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">溫馨提示</h2>
          </div>
          <div class="flex-1 mt-4 pl-4">
            <ul class="space-y-2">
              <li class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <i class="bi bi-check-circle-fill text-blue-600 dark:text-blue-400 mt-1"></i>
                <span>審核若有變動會及時更新，請定期查詢以查看最新狀態</span>
              </li>
              <li class="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <i class="bi bi-check-circle-fill text-blue-600 dark:text-blue-400 mt-1"></i>
                <span>如有任何問題，請前往 Discord 的客服服務台尋求協助</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- 回上一步 -->
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 動畫效果 */
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.transition-all {
  transition: all 0.3s ease-in-out;
}

/* 卡片懸停效果 */
.group:hover {
  transform: translateY(-2px);
}

/* 自定義滾動條 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 深色模式滾動條 */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>
