<script setup lang="ts">
defineOptions({ name: 'DiscordIntroduceYourself' })

// ---------- 組件引入區 ----------
import { ref, onMounted } from 'vue'
import DecorSection from '@/components/DecorSection.vue'

// ---------- 表單數據 ----------
const formData = ref({
  // 基本資料
  nickname: '',
  discord_user_id: '',
  discord_username: '',
  avatar: null as File | null,
  avatarUrl: null as string | null,

  // 遊戲資料
  game_name: '',
  game_nickname: '',
  online_time: '',

  // 入群管道
  join_source: '',

  // 自我介紹
  self_introduction: ''
})

// ---------- UI 控制 ----------
const showDiscordIdHelp = ref(false)
const showDiscordUsernameHelp = ref(false)
const isSubmitting = ref(false)
const avatarPreview = ref('')
const isUploadingAvatar = ref(false)

// ---------- 表單驗證 ----------
const validationErrors = ref<Record<string, string>>({})
const showValidationErrors = ref(false)

// 提交成功彈窗
const showSuccessModal = ref(false)

// 追蹤是否已查看說明
const hasViewedDiscordIdHelp = ref(false)
const hasViewedDiscordUsernameHelp = ref(false)

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1432300017934270526/Ok3Mb1pX4gJu5wyXo4yo_aoluDoT8OGWTsKNN_gQnBOJLb8H_9r87fRkh5LuzGpDEbSQ'

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

// ---------- 圖片上傳功能 ----------
// 上傳圖片到 Imgur
const uploadImageToImgur = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7', // Imgur 匿名上傳的 Client ID
      },
      body: formData
    })

    if (!response.ok) {
      console.error('❌ Imgur 上傳失敗：', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    if (data.success && data.data?.link) {
      console.log('✅ 圖片上傳成功：', data.data.link)
      return data.data.link
    } else {
      console.error('❌ Imgur 回應格式錯誤：', data)
      return null
    }
  } catch (error) {
    console.error('❌ 圖片上傳錯誤：', error)
    return null
  }
}

// 處理頭像上傳
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片檔案')
    return
  }

  // 檢查檔案大小 (限制 8MB)
  if (file.size > 8 * 1024 * 1024) {
    alert('圖片檔案大小不能超過 8MB')
    return
  }

  formData.value.avatar = file

  // 建立預覽
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 自動上傳到 Imgur
  isUploadingAvatar.value = true
  const imageUrl = await uploadImageToImgur(file)
  isUploadingAvatar.value = false

  if (imageUrl) {
    // 將上傳成功的 URL 存儲到表單數據中
    formData.value.avatarUrl = imageUrl
    console.log('✅ 頭像已上傳到圖床：', imageUrl)
  } else {
    alert('圖片上傳失敗，請稍後再試')
  }
}

// 移除頭像
const removeAvatar = () => {
  formData.value.avatar = null
  formData.value.avatarUrl = null
  avatarPreview.value = ''
  const fileInput = document.getElementById('avatar') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

// ---------- 驗證函數 ----------
const validateForm = () => {
  const errors: Record<string, string> = {}

  // 基本資料驗證
  if (!formData.value.nickname?.trim()) {
    errors.nickname = '請輸入暱稱'
  } else if (formData.value.nickname.trim().length < 1) {
    errors.nickname = '暱稱至少需要1個字元'
  }

  if (!formData.value.discord_user_id?.trim()) {
    errors.discord_user_id = '請輸入 Discord 使用者 ID'
  } else if (!/^\d{17,19}$/.test(formData.value.discord_user_id.trim())) {
    errors.discord_user_id = 'Discord ID 格式不正確（應為17-19位數字）'
  }

  if (!formData.value.discord_username?.trim()) {
    errors.discord_username = '請輸入 Discord 使用者名稱'
  } else if (!/^[a-zA-Z0-9._]+$/.test(formData.value.discord_username.trim())) {
    errors.discord_username = 'Discord 使用者名稱只能包含英文、數字、底線(_)、英文句號(.)'
  }

  // 遊戲資料驗證
  if (!formData.value.game_name?.trim()) {
    errors.game_name = '請輸入遊玩遊戲'
  }

  if (!formData.value.game_nickname?.trim()) {
    errors.game_nickname = '請輸入遊戲暱稱'
  }

  if (!formData.value.online_time?.trim()) {
    errors.online_time = '請輸入上線時間'
  }

  // 入群管道驗證
  if (!formData.value.join_source?.trim()) {
    errors.join_source = '請選擇入群管道'
  }

  // 自我介紹驗證
  if (!formData.value.self_introduction?.trim()) {
    errors.self_introduction = '請輸入自我介紹'
  } else if (formData.value.self_introduction.trim().length < 10) {
    errors.self_introduction = '自我介紹至少需要10個字元'
  }

  return errors
}

const clearValidationError = (field: string) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field]
  }
}


// Discord 發送自我介紹
const createDiscordIntroduction = async (webhookUrl: string, nickname: string, avatarUrl: string | null, content: string) => {
  try {
    const payload: {
      content: string
      username: string
      avatar_url?: string
      embeds: Array<{
        title: string
        description: string
        color: number
        timestamp: string
        footer: {
          text: string
          icon_url: string
        }
      }>
    } = {
      content: content,
      username: nickname,
      embeds: [{
        title: `👋 ${nickname} 的自我介紹`,
        description: content,
        color: 0x5865F2, // Discord 藍色
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Crazy_Clown 戰隊自我介紹',
          icon_url: 'https://crazyclown.online/media/favicon/crazyclown/favicon-light.png'
        }
      }]
    }

    // 如果有頭像 URL，設定為 webhook 的頭像
    if (avatarUrl) {
      payload.avatar_url = avatarUrl
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Discord 自我介紹發送失敗：', response.status, response.statusText)
      console.error('❌ 錯誤詳情:', errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Discord 自我介紹發送錯誤：', error)
    return false
  }
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
    // 準備 Discord 訊息內容
    const content = `**🎮 遊玩遊戲：** ${formData.value.game_name}
**🏷️ 遊戲暱稱：** ${formData.value.game_nickname}
**⏰ 上線時間：** ${formData.value.online_time}
**🚪 入群管道：** ${formData.value.join_source}

**📝 自我介紹：**
${formData.value.self_introduction}

---
*Discord ID: ${formData.value.discord_user_id} | Discord 使用者名稱: ${formData.value.discord_username}*`

    // 發送到 Discord
    const success = await createDiscordIntroduction(
      DISCORD_WEBHOOK_URL,
      formData.value.nickname,
      formData.value.avatarUrl,
      content
    )

    if (success) {
      console.log('✅ Discord 自我介紹發送成功')
      showSuccessModal.value = true
      resetForm()
    } else {
      alert('發送失敗，請稍後再試')
    }
  } catch (error) {
    console.error('提交過程發生錯誤：', error)
    alert('發送失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    nickname: '',
    discord_user_id: '',
    discord_username: '',
    avatar: null,
    avatarUrl: null,
    game_name: '',
    game_nickname: '',
    online_time: '',
    join_source: '',
    self_introduction: ''
  }
  avatarPreview.value = ''
  hasViewedDiscordIdHelp.value = false
  hasViewedDiscordUsernameHelp.value = false

  // 清除驗證錯誤
  validationErrors.value = {}
  showValidationErrors.value = false
}

// 關閉成功彈窗
const closeSuccessModal = () => {
  showSuccessModal.value = false
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
    <div id="discord-intro" class="max-w-7xl m-auto px-4 py-8">
      <DecorSection mainTitle="👋 Discord 自我介紹" enTitle="Discord Self Introduction">

        <!-- ========== 自我介紹表單 ========== -->
        <form class="text-gray-900 dark:text-zinc-100" autocomplete="off" @submit.prevent="handleSubmit">
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
                @input="clearValidationError('nickname')" :class="[
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
                  :disabled="!hasViewedDiscordIdHelp" @input="clearValidationError('discord_user_id')" :class="[
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
                  :disabled="!hasViewedDiscordUsernameHelp" @input="clearValidationError('discord_username')" :class="[
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

            <!-- 大頭貼上傳 -->
            <div class="col-span-12">
              <label class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                大頭貼 <span class="text-gray-500">(選填)</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs text-gray-500 dark:text-zinc-400">支援 JPG、PNG、GIF 格式，檔案大小限制 8MB，會自動上傳到圖床</p>

              <div class="flex items-center gap-4">
                <!-- 檔案上傳區域 -->
                <div class="flex-1">
                  <input id="avatar" type="file" accept="image/*" @change="handleAvatarUpload"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 border-gray-300 dark:border-zinc-600 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300" />
                </div>

                <!-- 預覽區域 -->
                <div v-if="avatarPreview" class="flex items-center gap-2">
                  <div class="relative">
                    <img :src="avatarPreview" alt="頭像預覽" class="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-zinc-600" />
                    <!-- 上傳中指示器 -->
                    <div v-if="isUploadingAvatar" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <i class="bi bi-arrow-repeat animate-spin text-white text-lg"></i>
                    </div>
                    <!-- 上傳成功指示器 -->
                    <div v-else-if="formData.avatarUrl" class="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <i class="bi bi-check text-white text-xs"></i>
                    </div>
                  </div>
                  <button type="button" @click="removeAvatar"
                    class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
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

            <!-- 遊玩遊戲 -->
            <div class="col-span-12 md:col-span-4">
              <label for="game_name" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                遊玩遊戲 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.game_name ? 'text-red-500 dark:text-red-400' : 'text-gray-500/0 dark:text-zinc-400/0'">
                {{ validationErrors.game_name || '.' }}
              </p>
              <input id="game_name" v-model="formData.game_name" type="text" placeholder="例如：PUBG、LOL、原神等" required
                @input="clearValidationError('game_name')" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.game_name
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- 遊戲暱稱 -->
            <div class="col-span-12 md:col-span-4">
              <label for="game_nickname" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                遊戲暱稱 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.game_nickname ? 'text-red-500 dark:text-red-400' : 'text-gray-500/0 dark:text-zinc-400/0'">
                {{ validationErrors.game_nickname || '.' }}
              </p>
              <input id="game_nickname" v-model="formData.game_nickname" type="text" placeholder="請輸入遊戲暱稱" required
                @input="clearValidationError('game_nickname')" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.game_nickname
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- 上線時間 -->
            <div class="col-span-12 md:col-span-4">
              <label for="online_time" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                上線時間 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.online_time ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.online_time">{{ validationErrors.online_time }}</span>
                <span v-else>例如：平日晚上、週末全天等</span>
              </p>
              <input id="online_time" v-model="formData.online_time" type="text" placeholder="請輸入上線時間" required
                @input="clearValidationError('online_time')" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500',
                  validationErrors.online_time
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600 focus:border-green-500 dark:focus:border-green-400'
                ]" />
            </div>

            <!-- ========== 入群管道 ========== -->
            <div class="col-span-12 pt-6 pb-2">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 flex items-center gap-2">
                <i class="bi bi-door-open"></i>
                入群管道
              </h3>
            </div>

            <!-- 入群管道選擇 -->
            <div class="col-span-12">
              <label for="join_source" class="block ml-2 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                如何得知本群？<span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.join_source ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.join_source">{{ validationErrors.join_source }}</span>
                <span v-else>請選擇您得知本群的方式</span>
              </p>
              <div class="relative">
                <select id="join_source" v-model="formData.join_source" required
                  @change="clearValidationError('join_source')" :class="[
                    'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:outline-none transition-colors appearance-none cursor-pointer',
                    validationErrors.join_source
                      ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                      : 'border-gray-300 dark:border-zinc-600 focus:border-orange-500 dark:focus:border-orange-400'
                  ]">
                  <option value="" disabled>請選擇入群管道</option>
                  <option value="PUBG 官方 Discord">PUBG 官方 Discord</option>
                  <option value="PUBG 9487 Discord">PUBG 9487 Discord</option>
                  <option value="Facebook 社團">Facebook 社團</option>
                  <option value="巴哈姆特">巴哈姆特</option>
                  <option value="朋友介紹">朋友介紹</option>
                  <option value="遊戲內遇到">遊戲內遇到</option>
                  <option value="其他">其他</option>
                </select>
                <i class="bi bi-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              </div>
            </div>

            <!-- ========== 自我介紹 ========== -->
            <div class="col-span-12 pt-6 pb-2">
              <h3
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 flex items-center gap-2">
                <i class="bi bi-chat-heart"></i>
                自我介紹
              </h3>
            </div>

            <!-- 自我介紹內容 -->
            <div class="col-span-12">
              <label for="self_introduction" class="block ml-2 mb-1 text-sm font-semibold text-gray-700 dark:text-zinc-300">
                自我介紹 <span class="text-red-500">*</span>
              </label>
              <p class="ml-2 mb-0.5 text-xs"
                :class="validationErrors.self_introduction ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'">
                <span v-if="validationErrors.self_introduction">{{ validationErrors.self_introduction }}</span>
                <span v-else>請簡單介紹自己，至少10個字元</span>
              </p>
              <textarea id="self_introduction" v-model="formData.self_introduction" rows="6"
                placeholder="請簡單介紹自己，例如：遊戲經驗、興趣、為什麼想加入群組等..." required
                @input="clearValidationError('self_introduction')" :class="[
                  'w-full px-4 py-3 bg-gray-50 dark:bg-zinc-700 border-2 rounded-2xl focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-zinc-500 resize-none',
                  validationErrors.self_introduction
                    ? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400'
                    : 'border-gray-300 dark:border-zinc-600'
                ]"></textarea>
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
                class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <span v-if="!isSubmitting">
                  <i class="bi bi-send mr-2"></i>
                  發布自我介紹
                </span>
                <span v-else class="flex items-center justify-center gap-2">
                  <i class="bi bi-arrow-repeat animate-spin"></i>
                  發布中...
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
              自我介紹發布成功！
            </h3>
          </div>

          <!-- 成功訊息 -->
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6">
            <div class="flex items-center gap-3 mb-2">
              <i class="bi bi-info-circle-fill text-green-500 text-xl mt-0.5"></i>
              <p class="font-semibold text-green-800 dark:text-green-300">發布完成</p>
            </div>
            <p class="text-gray-700 dark:text-zinc-200">
              您的自我介紹已成功發布到 Discord 論壇！其他成員現在可以看到您的介紹了。
            </p>
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
