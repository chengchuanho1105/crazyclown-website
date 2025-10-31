<script setup lang="ts">
defineOptions({ name: 'JoinNew' })

// ---------- 組件引入區 ----------
import { ref, onMounted } from 'vue'
import DecorSection from '@/components/DecorSection.vue'
import { searchSinglePlayer } from '@/services/pubgService'
import { supabase } from '@/config/supabase'
import { DISCORD_CONFIG, DISCORD_TEMPLATES } from '@/config/discord'

// ---------- 新增：控制說明頁面顯示 ----------
const showInstructions = ref(true)

// ---------- 表單數據 ----------
const formData = ref({
  // 基本資料
  nickname: '',
  discord_user_id: '',
  discord_username: '',

  // 遊戲資料
  pubg_nickname: '',
  pubg_account_id: '',
  steam_id: '',
  total_play_time: '',
  weekly_play_time: '',

  // 補充資料
  clan_task_willingness: '',
  discord_activity_willingness: '',
  pubg_activity_willingness: '',
  friend_pubg_nickname: [],
  inviter_pubg_nickname: [],
  note: ''
})

// ---------- UI 控制 ----------
const showDiscordIdHelp = ref(false)
const showDiscordUsernameHelp = ref(false)
const showSteamIdHelp = ref(false)
const isSubmitting = ref(false)

// ---------- 表單驗證 ----------
const validationErrors = ref<Record<string, string>>({})
const showValidationErrors = ref(false)

// 新增人員相關
const newFriendName = ref('')
const newInviterName = ref('')

// 提交成功彈窗
const showSuccessModal = ref(false)

// 追蹤是否已查看說明
const hasViewedDiscordIdHelp = ref(false)
const hasViewedDiscordUsernameHelp = ref(false)
const hasViewedSteamIdHelp = ref(false)

// PUBG 查詢相關
const isQueryingPubg = ref(false)
const pubgAccountError = ref('')
const pubgQueryAttempts = ref(0)
const maxQueryAttempts = 2

// ---------- 新增：開始申請方法 ----------
const startApplication = () => {
  showInstructions.value = false
  // 滾動到頁面頂端
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---------- 方法 ----------
const openDiscordIdHelp = () => {
  showDiscordIdHelp.value = true
}

const closeDiscordIdHelp = () => {
  showDiscordIdHelp.value = false
  hasViewedDiscordIdHelp.value = true
  setTimeout(() => {
    document.getElementById('discord_user_id')?.focus()
  }, 1)
}

const openDiscordUsernameHelp = () => {
  showDiscordUsernameHelp.value = true
}

const closeDiscordUsernameHelp = () => {
  showDiscordUsernameHelp.value = false
  hasViewedDiscordUsernameHelp.value = true
  setTimeout(() => {
    document.getElementById('discord_username')?.focus()
  }, 1)
}

const openSteamIdHelp = () => {
  showSteamIdHelp.value = true
}

const closeSteamIdHelp = () => {
  showSteamIdHelp.value = false
  hasViewedSteamIdHelp.value = true
  setTimeout(() => {
    document.getElementById('steam_id')?.focus()
  }, 1)
}

// 新增好友
const addFriend = () => {
  if (newFriendName.value.trim()) {
    formData.value.friend_pubg_nickname.push(newFriendName.value.trim() as never)
    newFriendName.value = ''
  }
}

// 移除好友
const removeFriend = (index: number) => {
  formData.value.friend_pubg_nickname.splice(index, 1)
}

// 新增介紹人
const addInviter = () => {
  if (newInviterName.value.trim()) {
    formData.value.inviter_pubg_nickname.push(newInviterName.value.trim() as never)
    newInviterName.value = ''
  }
}

// 移除介紹人
const removeInviter = (index: number) => {
  formData.value.inviter_pubg_nickname.splice(index, 1)
}

// 關閉成功彈窗
const closeSuccessModal = () => {
  showSuccessModal.value = false
  window.location.reload()
}

const checkPubgAccount = async () => {
  if (!formData.value.pubg_nickname) {
    pubgAccountError.value = '請先輸入 PUBG 暱稱'
    return
  }

  // 增加查詢次數
  pubgQueryAttempts.value++

  // 清除之前的錯誤
  pubgAccountError.value = ''
  isQueryingPubg.value = true

  try {
    // 使用真實的 PUBG API 查詢
    const result = await searchSinglePlayer(formData.value.pubg_nickname)

    if (result.success && result.data) {
      // 查詢成功，填入 Account ID
      formData.value.pubg_account_id = result.data.id
      pubgAccountError.value = ''
      pubgQueryAttempts.value = 0 // 重置查詢次數
    } else {
      // 查詢失敗處理
      const errorMessage = 'account.Error'
      formData.value.pubg_account_id = errorMessage

      if (pubgQueryAttempts.value >= maxQueryAttempts) {
        pubgAccountError.value = '若頻繁失敗，請直接送出申請，再聯絡客服處理'
      } else {
        pubgAccountError.value = '請檢查 PUBG 暱稱是否輸入正確'
      }

      console.log('❌ 查詢失敗：', result.error)
    }
  } catch (error) {
    console.error('查詢失敗：', error)
    const errorMessage = 'account.Error'
    formData.value.pubg_account_id = errorMessage

    if (pubgQueryAttempts.value >= maxQueryAttempts) {
      pubgAccountError.value = '檢查 PUBG 暱稱是否輸入正確，若頻繁失敗，請直接送出申請，再聯絡客服'
    } else {
      pubgAccountError.value = '查詢失敗，請稍後再試'
    }
  } finally {
    isQueryingPubg.value = false
  }
}

// Discord 通知相關函數
const createDiscordPost = async (webhookUrl: string, postTitle: string, postContent: string) => {
  try {
    // 建立完整的貼文內容（標題 + 內容）
    const fullContent = `**${postTitle}**\n\n${postContent}`

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: fullContent,
        username: 'Crazy_Clown - 精英招募官',
        avatar_url: 'https://crazyclown.online/media/favicon/crazyclown/favicon-light.png',
        thread_name: postTitle
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Discord 貼文建立失敗：', response.status, response.statusText)
      console.error('❌ 錯誤詳情:', errorText)
      return null
    }
  } catch (error) {
    console.error('❌ Discord 貼文建立錯誤：', error)
    return null
  }
}

// ---------- 驗證配置 ----------
const fieldValidations: Record<string, { required: string; pattern?: RegExp; patternError?: string; custom?: (value: any) => string | undefined }> = {
  nickname: {
    required: '請輸入暱稱'
  },
  discord_user_id: {
    required: '請輸入 Discord 使用者 ID',
    pattern: /^\d{17,19}$/,
    patternError: '格式不正確，應為17-19位數字'
  },
  discord_username: {
    required: '請輸入 Discord 使用者名稱',
    pattern: /^[a-zA-Z0-9._]+$/,
    patternError: '格式不正確，只能包含英文、數字、底線(_)、英文句號(.)'
  },
  pubg_nickname: {
    required: '請輸入 PUBG 暱稱',
    pattern: /^[a-zA-Z0-9_]+$/,
    patternError: '格式不正確，只能包含英文、數字、底線(_)'
  },
  steam_id: {
    required: '請輸入 Steam ID',
    pattern: /^\d{17}$/,
    patternError: '格式不正確，應為17位數字'
  },
  total_play_time: {
    required: '請輸入有效的總遊戲時間',
    custom: (value) => {
      const num = parseFloat(value)
      if (!value || isNaN(num)) return '請輸入有效的總遊戲時間'
      if (num < 0) return '遊戲時間不能為負數'
      return undefined
    }
  },
  weekly_play_time: {
    required: '請輸入有效的每週遊戲時間',
    custom: (value) => {
      const num = parseFloat(value)
      if (!value || isNaN(num)) return '請輸入有效的每週遊戲時間'
      if (num < 0) return '每週遊戲時間不能為負數'
      if (num > 144) return '每週遊戲時間不能超過144小時'
      return undefined
    }
  },
  clan_task_willingness: {
    required: '請選擇是否願意參與戰隊任務',
    custom: (value) => value !== 'TRUE' ? '必須選擇「願意」參與戰隊任務' : undefined
  },
  discord_activity_willingness: {
    required: '請選擇是否願意活躍於 Discord',
    custom: (value) => value !== 'TRUE' ? '必須選擇「願意」活躍於 Discord' : undefined
  },
  pubg_activity_willingness: {
    required: '請選擇是否願意活躍於 PUBG',
    custom: (value) => value !== 'TRUE' ? '必須選擇「願意」活躍於 PUBG' : undefined
  }
}

// ---------- 驗證函數 ----------
const clearValidationError = (field: string) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field]
  }
}

// 單個欄位驗證
const validateSingleField = (field: string, value: unknown): string | undefined => {
  const config = fieldValidations[field]
  if (!config) return undefined

  // 必填檢查
  if (!value || (typeof value === 'string' && !value.trim())) {
    return config.required
  }

  const strValue = String(value).trim()

  // 自定義驗證
  if (config.custom) {
    return config.custom(value)
  }

  // 正則驗證
  if (config.pattern && !config.pattern.test(strValue)) {
    return config.patternError
  }

  return undefined
}

// 即時驗證單個欄位
const validateField = (field: string, value: unknown) => {
  clearValidationError(field)
  const error = validateSingleField(field, value)
  if (error) {
    validationErrors.value[field] = error
  }
}

// 驗證整個表單
const validateForm = () => {
  const errors: Record<string, string> = {}

  Object.keys(fieldValidations).forEach(field => {
    const error = validateSingleField(field, formData.value[field as keyof typeof formData.value])
    if (error) errors[field] = error
  })

  return errors
}

const handleSubmit = async () => {
  // 清除之前的驗證錯誤
  validationErrors.value = {}
  showValidationErrors.value = false

  // 執行表單驗證
  const errors = validateForm()

  if (Object.keys(errors).length > 0) {
    validationErrors.value = errors
    showValidationErrors.value = true

    // 滾動到第一個錯誤欄位
    const firstErrorField = Object.keys(errors)[0]
    const errorElement = document.getElementById(firstErrorField)
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      errorElement.focus()
    }
    return
  }

  isSubmitting.value = true

  try {
    // 準備提交資料
    const submitData = {
      nickname: formData.value.nickname,
      discord_user_id: formData.value.discord_user_id,
      discord_username: formData.value.discord_username,
      pubg_nickname: formData.value.pubg_nickname,
      pubg_account_id: formData.value.pubg_account_id,
      steam_id: formData.value.steam_id,
      total_play_time: parseFloat(formData.value.total_play_time),
      weekly_play_time: parseFloat(formData.value.weekly_play_time),
      clan_task_willingness: formData.value.clan_task_willingness,
      discord_activity_willingness: formData.value.discord_activity_willingness,
      pubg_activity_willingness: formData.value.pubg_activity_willingness,
      friend_pubg_nickname: formData.value.friend_pubg_nickname,
      inviter_pubg_nickname: formData.value.inviter_pubg_nickname,
      note: formData.value.note || ''
    }

    console.log('提交資料：', submitData)

    // 提交到 Supabase
    const { data, error } = await supabase
      .from('join_application')
      .insert([submitData])
      .select()

    if (error) {
      console.error('提交失敗：', error)
      if (error.message.includes('row-level security policy')) {
        alert('提交失敗：請聯繫管理員或稍後再試')
      } else {
        alert(`提交失敗：${error.message}`)
      }
      return
    }

    // 提交成功後，建立 Discord 通知串
    if (data && data.length > 0) {
      const applicationId = data[0].id

      if (DISCORD_CONFIG.NOTIFICATION.ENABLED && DISCORD_CONFIG.WEBHOOK_URL) {
        try {
          // 建立貼文標題
          const postTitle = DISCORD_TEMPLATES.APPLICATION_SUBMITTED_TITLE
            .replace('{nickname}', formData.value.nickname)
            .replace('{pubg_nickname}', formData.value.pubg_nickname)

          // 貼文內容
          const postContent = DISCORD_TEMPLATES.INITIAL_NOTIFICATION
            .replace('{discord_user_id}', formData.value.discord_user_id)
            .replace('{steam_id}', formData.value.steam_id)

          // 建立 Discord 論壇貼文
          const postId = await createDiscordPost(DISCORD_CONFIG.WEBHOOK_URL, postTitle, postContent)
          console.log('📄 貼文 ID:', postId)

          // 如果有 post_id，更新到資料庫
          if (postId) {
            const { error: updateError } = await supabase
              .from('join_application')
              .update({ thread_id: postId })
              .eq('id', applicationId)

            if (updateError) {
              console.error('❌ 更新 post_id 失敗:', updateError)
            } else {
              console.log('✅ post_id 更新成功')
            }
          }
        } catch (error) {
          console.error('❌ Discord 通知發送失敗:', error)
        }
      } else {
        console.log('⚠️ Discord 通知未啟用或 Webhook URL 未設定')
        if (!DISCORD_CONFIG.NOTIFICATION.ENABLED) {
          console.log('🔧 請設定 VITE_DISCORD_NOTIFICATIONS_ENABLED=true')
        }
        if (!DISCORD_CONFIG.WEBHOOK_URL) {
          console.log('🔧 請設定 VITE_DISCORD_WEBHOOK_URL')
        }
      }
    }

    // 顯示成功彈窗
    showSuccessModal.value = true
    resetForm()
  } catch (error) {
    console.error('提交過程發生錯誤：', error)
    alert('提交失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    nickname: '',
    discord_user_id: '',
    discord_username: '',
    pubg_nickname: '',
    pubg_account_id: '',
    steam_id: '',
    total_play_time: '',
    weekly_play_time: '',
    clan_task_willingness: '',
    discord_activity_willingness: '',
    pubg_activity_willingness: '',
    friend_pubg_nickname: [],
    inviter_pubg_nickname: [],
    note: ''
  }
  hasViewedDiscordIdHelp.value = false
  hasViewedDiscordUsernameHelp.value = false
  hasViewedSteamIdHelp.value = false
  isQueryingPubg.value = false
  pubgAccountError.value = ''
  pubgQueryAttempts.value = 0

  // 清除驗證錯誤
  validationErrors.value = {}
  showValidationErrors.value = false
}

// 組件掛載時檢查 URL hash 並滾動到對應位置
onMounted(() => {
  // 延遲執行，確保 DOM 已完全渲染
  setTimeout(() => {
    const hash = window.location.hash
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }, 100)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800">
    <div id="gamer" class="max-w-7xl m-auto px-4 py-8">
      <DecorSection mainTitle="🎮 戰隊加入申請表" enTitle="Clan Application Form">

        <!-- ========== 說明頁面 ========== -->
        <div v-if="showInstructions" class="text-gray-900 dark:text-zinc-100">
          <div class="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl">

            <!-- 福利區塊 -->
            <div class="col-span-12">
              <div
                class="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border-l-4 border-r-4 border-l-sky-500 border-r-sky-500">
                <h3 class="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                  <i class="bi bi-gift-fill"></i>
                  戰隊福利
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-start gap-3">
                    <i class="bi bi-currency-exchange text-yellow-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">社群獎勵</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">完成戰隊專屬社群任務，可獲得獎勵</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-controller text-blue-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">社群活動</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">定期舉辦內部競賽，參與可獲得獎勵</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-fire text-pink-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">活躍度獎勵</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">每週高活躍度成員可獲得獎勵</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-cart4 text-green-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">專屬商城</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">專屬商城，可優惠購買G幣、套裝等</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-gift-fill text-purple-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">寶箱提供/序號空投</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">每週隨機發送寶箱，不定時於DC空投序號</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-star text-yellow-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">特殊權益</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">可參與官方活動與獲得特殊獎勵</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加入要求 -->
            <div class="col-span-12">
              <div
                class="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border-l-4 border-r-4 border-l-sky-500 border-r-sky-500">
                <h3 class="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-end gap-2">
                  <i class="bi bi-check-circle-fill"></i>
                  入隊要求 <span class="text-base text-amber-600 dark:text-amber-400">完成皆有機會獲得獎勵</span>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-start gap-3">
                    <i class="bi bi-trophy text-yellow-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">積極參與 Discord 社群任務</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">
                        任務都很簡單，請務必完成。
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-discord text-indigo-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">積極於 Discord 社群活躍</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">
                        每週聊天/語音至少各3次，語音每次30分鐘以上。
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-heart text-red-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">積極參與 Discord 社群活動</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">
                        頻率不高、獎勵豐厚，請積極參與。
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="bi bi-clock text-orange-500 text-lg mt-1"></i>
                    <div>
                      <p class="text-lg font-bold text-gray-800 dark:text-zinc-200">須積極遊玩．提升遊戲貢獻度</p>
                      <p class="text-base text-gray-600 dark:text-zinc-400">
                        每週遊玩10小時以上、每週XP 1萬以上、賽季場次至少300場。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 審核流程 -->
            <div class="col-span-12">
              <div
                class="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 border-l-4 border-r-4 border-l-sky-500 border-r-sky-500">
                <h3 class="text-xl font-bold text-indigo-800 dark:text-indigo-300 mb-6 flex items-center gap-2">
                  <i class="bi bi-list-check"></i>
                  審核流程
                </h3>

                <!-- 第一階段：資料審核 -->
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-bold">
                      1</div>
                    <h4 class="text-lg font-bold text-gray-800 dark:text-zinc-200">資料審核</h4>
                  </div>
                  <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-green-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">基本資料檢查</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-green-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">遊戲資料檢查</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-green-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">補充資料審核</span>
                    </div>
                  </div>
                </div>

                <!-- 第二階段：活躍考核 -->
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                      2</div>
                    <h4 class="text-lg font-bold text-gray-800 dark:text-zinc-200">活躍考核</h4>
                  </div>
                  <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="flex items-start gap-2">
                      <i class="bi bi-check-circle text-blue-500 text-base"></i>
                      <p class="text-base text-gray-700 dark:text-zinc-300">
                        加入戰隊DC檢查 <br />
                        <span class="text-xs text-amber-600 dark:text-amber-400">
                          加入「
                          <a href="https://crazyclown.online/dc" target="_blank"
                            class="text-blue-500 dark:text-blue-400">
                            <i class="bi bi-discord mr-1" />
                            Crazy_Clown DC 社群
                            <i class="bi bi-box-arrow-up-right ml-1" />
                          </a>
                          」
                        </span>
                      </p>
                    </div>
                    <div class="flex items-start gap-2">
                      <i class="bi bi-check-circle text-blue-500 text-base"></i>
                      <p class="text-base text-gray-700 dark:text-zinc-300">
                        戰隊DC報到檢查 <br />
                        <span class="text-xs text-amber-600 dark:text-amber-400">
                          於「
                          <a href="https://discord.com/channels/490129931808931840/1226549886145527999" target="_blank"
                            class="text-blue-500 dark:text-blue-400">
                            🙋⇜自我介紹
                            <i class="bi bi-box-arrow-up-right ml-1" />
                          </a>
                          」頻道完成自我介紹
                        </span>
                      </p>
                    </div>
                    <div class="flex items-start gap-2">
                      <i class="bi bi-check-circle text-blue-500 text-base"></i>
                      <p class="text-base text-gray-700 dark:text-zinc-300">
                        加入官方DC檢查 <br />
                        <span class="text-xs text-amber-600 dark:text-amber-400">
                          加入「
                          <a href="https://kraftontw.info/Discord" target="_blank"
                            class="text-blue-500 dark:text-blue-400">
                            <i class="bi bi-discord mr-1" />
                            PUBG 官方 DC 社群
                            <i class="bi bi-box-arrow-up-right ml-1" />
                          </a>
                          」
                        </span>
                      </p>
                    </div>
                    <div class="flex items-start gap-2">
                      <i class="bi bi-check-circle text-blue-500 text-base"></i>
                      <p class="text-base text-gray-700 dark:text-zinc-300">
                        社群活躍審核 <br />
                        <span class="text-xs text-amber-600 dark:text-amber-400">
                          需有過文字聊天/語音聊天/社群任務/社群活動的紀錄
                        </span>
                      </p>
                    </div>
                    <div class="flex items-start gap-2">
                      <i class="bi bi-check-circle text-blue-500 text-base"></i>
                      <p class="text-base text-gray-700 dark:text-zinc-300">遊戲內活躍審核</p>
                    </div>
                  </div>
                </div>

                <!-- 第三階段：正式審核 -->
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="inline-flex items-center justify-center w-8 h-8 bg-purple-500 text-white rounded-full text-sm font-bold">
                      3</div>
                    <h4 class="text-lg font-bold text-gray-800 dark:text-zinc-200">正式審核</h4>
                  </div>
                  <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-purple-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">戰隊初審</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-purple-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">官方複審</span>
                    </div>
                  </div>

                  <div
                    class="mt-2 ml-6 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div class="flex items-center gap-3">
                      <i class="bi bi-info-circle-fill text-purple-600 dark:text-purple-500 text-xl mt-0.5"></i>
                      <div>
                        <p class="text-sm text-purple-700 dark:text-purple-400">每週日進行複審結單，請務必在截止前完成階段一、二之審核項目。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 第四階段：加入作業 -->
                <div class="mb-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                      4</div>
                    <h4 class="text-lg font-bold text-gray-800 dark:text-zinc-200">加入作業</h4>
                  </div>
                  <div class="ml-11 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-orange-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">是否於遊戲內送出申請</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-orange-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">是否已加入戰隊</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="bi bi-check-circle text-orange-500 text-base"></i>
                      <span class="text-base text-gray-700 dark:text-zinc-300">是否發放DC身分組</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- 開始申請按鈕 -->
            <div class="col-span-12 text-center pt-4">
              <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-4">
                <a href="https://crazyclown.online/dc" target="_blank" type="button"
                  class="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-103 shadow-lg">
                  <i class="bi bi-discord mr-2"></i>
                  先點我加入DC再申請
                </a>
                <button type="button"
                  class="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-103 shadow-lg"
                  @click="startApplication">
                  <i class="bi bi-check-lg mr-2"></i>
                  準備好了，開始申請
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ========== 申請表單 ========== -->
        <form v-else class="text-gray-900 dark:text-zinc-100" autocomplete="off" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-12 gap-4 p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl">

            <!-- ========== 基本資料 ========== -->
            <div class="col-span-12 pt-4 pb-2">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 flex items-center gap-2">
                <i class="bi bi-person-circle"></i>
                基本資料
              </h3>
            </div>

            <!-- 暱稱 -->
            <div class="col-span-12 md:col-span-4">
              <label for="nickname" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                暱稱 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.nickname ? 'text-red-500 dark:text-red-400' : 'text-gray-500/0 dark:text-zinc-400/0'">
                {{ validationErrors.nickname || '.' }}
              </p>
              <input id="nickname" v-model="formData.nickname" type="text" placeholder="請輸入暱稱" required
                @input="validateField('nickname', formData.nickname)" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.nickname
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400'
                ]" />
            </div>

            <!-- Discord 使用者 ID -->
            <div class="col-span-12 md:col-span-4">
              <label for="discord_user_id" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Discord 使用者 ID <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.discord_user_id ? 'text-red-500 dark:text-red-400' : (!hasViewedDiscordIdHelp ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400')">
                <span v-if="validationErrors.discord_user_id">{{ validationErrors.discord_user_id }}</span>
                <span v-else-if="!hasViewedDiscordIdHelp">請先點擊<i class="bi bi-question-circle" />，查看說明後才能填寫</span>
                <span v-else>✅ 已查看說明，可以填寫</span>
              </p>
              <div class="relative">
                <input id="discord_user_id" v-model="formData.discord_user_id" type="text"
                  :placeholder="hasViewedDiscordIdHelp ? '請輸入 Discord ID' : '請先查看說明👉'" required
                  :disabled="!hasViewedDiscordIdHelp"
                  @input="validateField('discord_user_id', formData.discord_user_id)" :class="[
                    'w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    validationErrors.discord_user_id
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400'
                  ]" />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs"
                  @click="openDiscordIdHelp">
                  <i class="bi bi-question-circle text-lg text-indigo-500"></i>
                </button>
              </div>
            </div>

            <!-- Discord 使用者名稱 -->
            <div class="col-span-12 md:col-span-4">
              <label for="discord_username" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Discord 使用者名稱 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.discord_username ? 'text-red-500 dark:text-red-400' : (!hasViewedDiscordUsernameHelp ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400')">
                <span v-if="validationErrors.discord_username">{{ validationErrors.discord_username }}</span>
                <span v-else-if="!hasViewedDiscordUsernameHelp">請先點擊<i class="bi bi-question-circle" />，查看說明後才能填寫</span>
                <span v-else>✅ 已查看說明，可以填寫</span>
              </p>
              <div class="relative">
                <input id="discord_username" v-model="formData.discord_username" type="text"
                  :placeholder="hasViewedDiscordUsernameHelp ? '請輸入 Discord 名稱' : '請先查看說明👉'" required
                  :disabled="!hasViewedDiscordUsernameHelp"
                  @input="validateField('discord_username', formData.discord_username)" :class="[
                    'w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    validationErrors.discord_username
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-blue-500 dark:focus:border-blue-400'
                  ]" />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs"
                  @click="openDiscordUsernameHelp">
                  <i class="bi bi-question-circle text-lg text-indigo-500"></i>
                </button>
              </div>
            </div>

            <!-- ========== 遊戲資料 ========== -->
            <div class="col-span-12 pt-6 pb-2">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 flex items-center gap-2">
                <i class="bi bi-controller"></i>
                遊戲資料
              </h3>
            </div>

            <!-- PUBG 暱稱 -->
            <div class="col-span-12 md:col-span-4">
              <label for="pubg_nickname" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                PUBG 暱稱 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.pubg_nickname ? 'text-red-500 dark:text-red-400' : 'text-gray-500/0 dark:text-zinc-400/0'">
                {{ validationErrors.pubg_nickname || '.' }}
              </p>
              <input id="pubg_nickname" v-model="formData.pubg_nickname" type="text" placeholder="請輸入 PUBG 暱稱" required
                @input="validateField('pubg_nickname', formData.pubg_nickname)" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.pubg_nickname
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- PUBG Account ID -->
            <div class="col-span-12 md:col-span-4">
              <label for="pubg_account_id"
                class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                PUBG Account ID <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.pubg_account_id ? 'text-red-500 dark:text-red-400' : (!formData.pubg_nickname ? 'text-gray-500 dark:text-zinc-400' : (!pubgAccountError ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'))">
                <span v-if="validationErrors.pubg_account_id">{{ validationErrors.pubg_account_id }}</span>
                <span v-else-if="!formData.pubg_nickname">請先填寫 PUBG 暱稱，才能查詢</span>
                <span v-else-if="!pubgAccountError">✅ 已填寫 PUBG 暱稱，可以查詢</span>
                <span v-else>❌ {{ pubgAccountError }}</span>
              </p>
              <div class="relative">
                <input id="pubg_account_id" v-model="formData.pubg_account_id" type="text"
                  :placeholder="!formData.pubg_nickname ? '👈請先填PUBG暱稱' : '點我查詢👉'" :readonly="!pubgAccountError"
                  required @input="clearValidationError('pubg_account_id')" :class="[
                    'w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                    validationErrors.pubg_account_id
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : (pubgAccountError ? 'cursor-text border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400' : 'cursor-not-allowed border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400')
                  ]" />
                <button type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!formData.pubg_nickname || isQueryingPubg" @click="checkPubgAccount" title="將透過 PUBG 暱稱查詢">
                  <i class="bi bi-search" v-if="!isQueryingPubg"></i>
                  <i class="bi bi-hourglass-split animate-spin" v-else></i>
                </button>
              </div>
            </div>

            <!-- Steam ID -->
            <div class="col-span-12 md:col-span-4">
              <label for="steam_id" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                Steam ID <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.steam_id ? 'text-red-500 dark:text-red-400' : (!hasViewedSteamIdHelp ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400')">
                <span v-if="validationErrors.steam_id">{{ validationErrors.steam_id }}</span>
                <span v-else-if="!hasViewedSteamIdHelp">請先點擊<i class="bi bi-question-circle" />，查看說明後才能填寫</span>
                <span v-else>✅ 已查看說明，可以填寫</span>
              </p>
              <div class="relative">
                <input id="steam_id" v-model="formData.steam_id" type="text"
                  :placeholder="hasViewedSteamIdHelp ? '請輸入 Steam ID' : '請先查看說明👉'" required maxlength="17"
                  :disabled="!hasViewedSteamIdHelp" @input="validateField('steam_id', formData.steam_id)" :class="[
                    'w-full px-4 py-3 pr-10 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    validationErrors.steam_id
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                  ]" />
                <button type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs"
                  @click="openSteamIdHelp">
                  <i class="bi bi-question-circle text-lg text-indigo-500"></i>
                </button>
              </div>
            </div>

            <!-- 總遊戲時間 -->
            <div class="col-span-12 md:col-span-6">
              <label for="total_play_time"
                class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                總遊戲時間（小時）<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.total_play_time ? 'text-red-500 dark:text-red-400' : 'text-gray-500/0 dark:text-zinc-400/0'">
                {{ validationErrors.total_play_time || '.' }}
              </p>
              <input id="total_play_time" v-model="formData.total_play_time" type="number" min="0"
                placeholder="請輸入總遊戲時間" required @input="validateField('total_play_time', formData.total_play_time)"
                :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.total_play_time
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- 每週遊戲時間 -->
            <div class="col-span-12 md:col-span-6">
              <label for="weekly_play_time" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                每週遊戲時間（小時）<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.weekly_play_time ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.weekly_play_time">{{ validationErrors.weekly_play_time }}</span>
                <span v-else>最多 144 小時，請合理填寫，列為往後考績目標</span>
              </p>
              <input id="weekly_play_time" v-model="formData.weekly_play_time" type="number" min="0" max="144"
                placeholder="請輸入每週遊戲時間" required @input="validateField('weekly_play_time', formData.weekly_play_time)"
                :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.weekly_play_time
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- ========== 補充資料 ========== -->
            <div class="col-span-12 pt-6 pb-2">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 flex items-center gap-2">
                <i class="bi bi-clipboard-check"></i>
                補充資料
              </h3>
            </div>

            <!-- 戰隊任務參與意願 -->
            <div class="col-span-12 md:col-span-4">
              <label for="clan_task_willingness"
                class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                是否願意參與戰隊任務？<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.clan_task_willingness ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.clan_task_willingness">{{ validationErrors.clan_task_willingness }}</span>
                <span v-else>每週會有簡單的任務需要完成</span>
              </p>
              <div class="relative">
                <select id="clan_task_willingness" v-model="formData.clan_task_willingness" required
                  @change="validateField('clan_task_willingness', formData.clan_task_willingness)" :class="[
                    'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer',
                    validationErrors.clan_task_willingness
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-400'
                  ]">
                  <option value="" disabled>請選擇</option>
                  <option value=TRUE>願意</option>
                  <option value=FALSE>不願意</option>
                  <option value="" disabled>不願意者將無法加入戰隊</option>
                </select>
                <i class="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              </div>
            </div>

            <!-- Discord 活躍意願 -->
            <div class="col-span-12 md:col-span-4">
              <label for="discord_activity_willingness"
                class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                是否願意活躍於 Discord？<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.discord_activity_willingness ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.discord_activity_willingness">{{
                  validationErrors.discord_activity_willingness }}</span>
                <span v-else>經常使用文字及語音頻道聊天</span>
              </p>
              <div class="relative">
                <select id="discord_activity_willingness" v-model="formData.discord_activity_willingness" required
                  @change="validateField('discord_activity_willingness', formData.discord_activity_willingness)" :class="[
                    'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer',
                    validationErrors.discord_activity_willingness
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-400'
                  ]">
                  <option value="" disabled>請選擇</option>
                  <option value=TRUE>願意</option>
                  <option value=FALSE>不願意</option>
                  <option value="" disabled>不願意者將無法加入戰隊</option>
                </select>
                <i class="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              </div>
            </div>

            <!-- 遊戲活躍 -->
            <div class="col-span-12 md:col-span-4">
              <label for="pubg_activity_willingness"
                class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                是否願意活躍於 PUBG？<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.pubg_activity_willingness ? 'text-red-500 dark:text-red-400' : 'text-red-500 dark:text-red-400'">
                <span v-if="validationErrors.pubg_activity_willingness">{{ validationErrors.pubg_activity_willingness
                  }}</span>
                <span v-else>此三項未達標者，將影響考績分數</span>
              </p>
              <div class="relative">
                <select id="pubg_activity_willingness" v-model="formData.pubg_activity_willingness" required
                  @change="validateField('pubg_activity_willingness', formData.pubg_activity_willingness)" :class="[
                    'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer',
                    validationErrors.pubg_activity_willingness
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-400'
                  ]">
                  <option value="" disabled>請選擇</option>
                  <option value=TRUE>願意</option>
                  <option value=FALSE>不願意</option>
                  <option value="" disabled>不願意者將無法加入戰隊</option>
                </select>
                <i class="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              </div>
            </div>

            <!-- 好友 PUBG 暱稱 -->
            <div class="col-span-12 md:col-span-6">
              <label class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                是否有好友一同加入？
              </label>
              <p class="ml-2 mb-0.5 text-xs text-gray-500 dark:text-zinc-400">自組小隊加入者，得優先入選</p>

              <!-- 新增好友輸入框 -->
              <div class="flex gap-2 mb-3">
                <input v-model="newFriendName" type="text" placeholder="請輸入好友 PUBG 暱稱"
                  class="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 rounded-2xl focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500"
                  @keyup.enter="addFriend" />
                <button type="button" @click="addFriend"
                  class="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <!-- 已新增的好友列表 -->
              <div v-if="formData.friend_pubg_nickname.length > 0" class="space-y-2">
                <div v-for="(friend, index) in formData.friend_pubg_nickname" :key="index"
                  class="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                  <span class="text-sm text-gray-700 dark:text-zinc-300">{{ friend }}</span>
                  <button type="button" @click="removeFriend(index)"
                    class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- 介紹人 PUBG 暱稱 -->
            <div class="col-span-12 md:col-span-6">
              <label class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                是否有介紹人？
              </label>
              <p class="ml-2 mb-0.5 text-xs text-gray-500 dark:text-zinc-400">有介紹人者，得優先入選</p>

              <!-- 新增介紹人輸入框 -->
              <div class="flex gap-2 mb-3">
                <input v-model="newInviterName" type="text" placeholder="請輸入介紹人 PUBG 暱稱"
                  class="flex-1 px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 rounded-2xl focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500"
                  @keyup.enter="addInviter" />
                <button type="button" @click="addInviter"
                  class="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>

              <!-- 已新增的介紹人列表 -->
              <div v-if="formData.inviter_pubg_nickname.length > 0" class="space-y-2">
                <div v-for="(inviter, index) in formData.inviter_pubg_nickname" :key="index"
                  class="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                  <span class="text-sm text-gray-700 dark:text-zinc-300">{{ inviter }}</span>
                  <button type="button" @click="removeInviter(index)"
                    class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- 備註 -->
            <div class="col-span-12">
              <label for="note" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                備註
              </label>
              <textarea id="note" v-model="formData.note" rows="4" placeholder="有任何想告訴我們的事情嗎？（選填）"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 rounded-2xl focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500 resize-none"></textarea>
            </div>

            <!-- 提交按鈕 -->
            <div class="col-span-12 py-6 flex flex-col sm:flex-row justify-center gap-4">
              <button type="button"
                class="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-800 dark:text-zinc-100 font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                @click="resetForm">
                <i class="bi bi-arrow-clockwise mr-2"></i>
                重置表單
              </button>

              <button type="submit" :disabled="isSubmitting"
                class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <span v-if="!isSubmitting">
                  <i class="bi bi-send mr-2"></i>
                  提交申請
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <i class="bi bi-arrow-repeat animate-spin"></i>
                  提交中...
                </span>
              </button>
            </div>
          </div>
        </form>
      </DecorSection>
    </div>

    <!-- Discord 使用者 ID 教學彈窗 -->
    <Teleport to="body">
      <div v-if="showDiscordIdHelp"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        @click="closeDiscordIdHelp">
        <div class="bg-white dark:bg-zinc-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <i class="bi bi-discord text-indigo-500 text-3xl"></i>
              如何查詢 Discord 使用者 ID
            </h3>
            <button type="button"
              class="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              @click="closeDiscordIdHelp">
              <i class="bi bi-x-lg text-2xl"></i>
            </button>
          </div>

          <div class="text-gray-700 dark:text-zinc-300">
            <div class="border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl overflow-hidden">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-6">
                <div class="space-y-4">
                  <div>
                    <p class="font-semibold mb-3 text-indigo-800 dark:text-indigo-300 text-lg">步驟一：開啟開發者模式</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                      <li>開啟 Discord 應用程式</li>
                      <li>點擊左下角的 <strong>⚙️ 使用者設定</strong></li>
                      <li>在左側選單找到 <strong>「進階」</strong> 選項</li>
                      <li>開啟 <strong>「開發者模式」</strong></li>
                      <img src="https://i.meee.com.tw/9bHRvAx.png" alt="" class="rounded-2xl">
                    </ol>
                  </div>
                  <div class="border-t border-indigo-200 dark:border-indigo-700 pt-4">
                    <p class="font-semibold mb-3 text-indigo-800 dark:text-indigo-300 text-lg">步驟二：複製使用者 ID</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                      <li>回到 Discord 主畫面</li>
                      <li>點擊左下角的 <strong>⚙️ 個人資料區域</strong></li>
                      <li>選擇 <strong>「複製使用者 ID」</strong></li>
                    </ol>
                    <img src="https://i.meee.com.tw/InglqXK.png" alt="" class="rounded-2xl">
                  </div>
                  <div
                    class="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mt-4">
                    <p class="flex items-start gap-2">
                      <i class="bi bi-info-circle-fill text-amber-600 dark:text-amber-500 mt-0.5 text-xl"></i>
                      <span>Discord 使用者 ID 是一串 <strong>17-19 位的數字</strong><br>例如：<code
                          class="px-2 py-1 bg-amber-200 dark:bg-amber-900 rounded font-mono">123456789012345678</code></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button type="button"
              class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
              @click="closeDiscordIdHelp">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Discord 使用者名稱教學彈窗 -->
    <Teleport to="body">
      <div v-if="showDiscordUsernameHelp"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        @click="closeDiscordUsernameHelp">
        <div class="bg-white dark:bg-zinc-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <i class="bi bi-discord text-purple-500 text-3xl"></i>
              如何查詢 Discord 使用者名稱
            </h3>
            <button type="button"
              class="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              @click="closeDiscordUsernameHelp">
              <i class="bi bi-x-lg text-2xl"></i>
            </button>
          </div>

          <div class="text-gray-700 dark:text-zinc-300">
            <div class="border-2 border-purple-200 dark:border-purple-800 rounded-2xl overflow-hidden">
              <div class="bg-purple-50 dark:bg-purple-900/20 p-4">
                <div class="space-y-4">
                  <div>
                    <p class="font-semibold mb-3 text-purple-800 dark:text-purple-300 text-lg">查詢步驟：</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                      <li>開啟 Discord 應用程式</li>
                      <li>點擊左下角的 <strong>⚙️ 使用者設定</strong></li>
                      <li>在左側選單找到 <strong>「我的帳號」</strong></li>
                      <li>使用者名稱會顯示在頭像下面，<span class="text-blue-500">如：username</span></li>
                      <li>直接複製該名稱</li>
                    </ol>
                    <img src="https://i.meee.com.tw/Tbe6UoN.png" alt="" class="rounded-2xl">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button type="button"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
              @click="closeDiscordUsernameHelp">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Steam ID 教學彈窗 -->
    <Teleport to="body">
      <div v-if="showSteamIdHelp"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        @click="closeSteamIdHelp">
        <div class="bg-white dark:bg-zinc-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <i class="bi bi-steam text-[#369dd2] text-3xl"></i>
              如何查詢 Steam ID
            </h3>
            <button type="button"
              class="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              @click="closeSteamIdHelp">
              <i class="bi bi-x-lg text-2xl"></i>
            </button>
          </div>

          <div class="text-gray-700 dark:text-zinc-300">
            <div class="border-2 border-teal-200 dark:border-teal-800 rounded-2xl overflow-hidden">
              <div class="bg-teal-50 dark:bg-teal-900/20 p-6">
                <div class="space-y-4">
                  <div>
                    <p class="font-semibold mb-3 text-teal-800 dark:text-teal-300 text-lg">方法一：透過 Steam 客戶端</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                      <li>開啟 Steam 客戶端</li>
                      <li>點擊右上角您的 <strong>使用者名稱</strong>，並選擇 <strong>「<a href="https://store.steampowered.com/account/"
                            target="_blank"
                            class="text-blue-500 dark:text-blue-400 hover:underline">帳戶詳細資料</a>」</strong></li>
                      <li>Steam ID 會顯示在帳戶名稱下方，<span class="text-blue-500">如：Steam ID：7656119**********</span></li>
                    </ol>
                  </div>
                  <div class="border-t border-b border-teal-200 dark:border-teal-700 py-4">
                    <p class="font-semibold mb-3 text-teal-800 dark:text-teal-300 text-lg">方法二：透過 Steam 網頁端</p>
                    <ol class="list-decimal list-inside space-y-2 ml-2">
                      <li>前往<strong>「<a href="https://store.steampowered.com/account/" target="_blank"
                            class="text-blue-500 dark:text-blue-400 hover:underline">帳戶詳細資料</a>」</strong></li>
                      <li>Steam ID 會顯示在帳戶名稱下方，<span class="text-blue-500">如：Steam ID：76561198901234567</span></li>
                    </ol>
                  </div>
                  <div
                    class="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mt-4">
                    <p class="flex items-start gap-2">
                      <i class="bi bi-info-circle-fill text-amber-600 dark:text-amber-500 mt-0.5 text-xl"></i>
                      <span>
                        Steam ID 是一串 <strong>17 位的數字</strong><br>例如：<code
                          class="px-2 py-0.5 bg-amber-200 dark:bg-amber-900 rounded font-mono">76561198901234567</code>
                      </span>
                    </p>
                    <img src="https://i.meee.com.tw/SX81tou.png" alt="" class="rounded-2xl">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-end">
            <button type="button"
              class="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
              @click="closeSteamIdHelp">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 提交成功彈窗 -->
    <Teleport to="body">
      <div v-if="showSuccessModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
        @click="closeSuccessModal">
        <div
          class="bg-white dark:bg-zinc-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl transform transition-all duration-300 scale-100"
          @click.stop>
          <!-- 成功圖示 -->
          <div class="text-center mb-6">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
              <i class="bi bi-check-lg text-white text-3xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
              申請提交成功！
            </h3>
          </div>

          <!-- 審核流程提醒 -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
            <div class="flex items-center gap-3 mb-2">
              <i class="bi bi-info-circle-fill text-blue-500 text-xl mt-0.5"></i>
              <p class="font-semibold text-blue-800 dark:text-blue-300">注意事項</p>
            </div>
            <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
              <li>請務必<span>立即加入</span>
                <a href="https://crazyclown.online/dc" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「Crazy_Clown DC 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>及<a
                  href="https://kraftontw.info/Discord" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「PUBG 官方 DC 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>。
              </li>
              <li>
                審核進度請前往「
                <a href="/join/query"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  審核進度查詢<i class="bi bi-box-arrow-up-right ml-1"></i>
                </a>」頁面查詢。
              </li>
              <li>
                審核通知將在
                <a href="https://discord.com/channels/490129931808931840/1429135981856161903" target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  <span class="font-mono text-purple-700 dark:text-purple-300">
                    「#⚖️⇜入隊審核進度<i class="bi bi-box-arrow-up-right ml-1"></i>」
                  </span>
                </a>頻道發布，請多加留意！
              </li>
            </ul>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-center">
            <button type="button"
              class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
              @click="closeSuccessModal">
              <i class="bi bi-check-lg mr-2"></i>
              我知道了
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

請勿刪除以下內容：

一、當使用者提交申請時，再論台頻道建立新貼文，內容如下：
title：
🔔 nickname[pubg_nickname] 的專屬通知串
content：
嗨！&lt;@discord_id&gt;，您已正式進入審核/考核流程👀。
✅ 請立即完成指定要求，以確保審核/考核順利通過。
📜 考核包括：戰隊DC報到、社群活躍、遊戲內活躍等。
🔔 審核/考核狀態有任何變動，將會在通知串內更新。
🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id=steam_id)」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。

三、當審核/考核狀態有任何變動時，在該貼文(thread_id)下方新增留言，內容如下：
content：
嗨！&lt;@discord_id&gt;，審核/考核狀態有變動🔔。
- [欄位名稱]更新為[status]，原因：[reasons]。
...(判斷有幾個欄位變更就填入幾個)
🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id=steam_id)」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。

以上[]皆為變數，請依對應需求填入資料。
