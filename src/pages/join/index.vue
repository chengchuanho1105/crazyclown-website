<script setup lang="ts">
defineOptions({ name: 'CrazyClown-Join' })

// ---------- Vue 核心工具函式 ----------
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// ---------- Composables ----------
import { useFormField, validators } from '@/composables/useFormField'

// ---------- Services ----------
import { ClanApplicationService } from '@/services/supabaseService'
import type { ClanApplication } from '@/config/supabase'

// ---------- 組件引入區 ----------
import DecorSection from '@/components/DecorSection.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import FormTextarea from '@/components/form/FormTextarea.vue'

/** ========== 表單字段定義 ========== */

// 1. 基本資料
const nickName = useFormField('', validators.notEmpty)
const discordUsername = useFormField('', validators.discordFormat)

// 2. 遊戲資料
const gameOptions = [
  { value: '', label: '' },
  { value: '皆可', label: 'Crazy_Clown (一軍)、Crazy_Clown_II (二軍) 皆可' },
  { value: '一軍', label: 'Crazy_Clown (一軍) 優先' },
  { value: '二軍', label: 'Crazy_Clown_II (二軍) 優先' },
  { value: '', label: '==========注意事項==========' },
  { value: '', label: '1. 選擇一軍，若因資格不符，將自動改為二軍優先' },
  { value: '', label: '2. 選擇一軍，若因一軍滿員，將自動改為二軍優先' },
  { value: '', label: '3. 入取二軍，於加入滿一個月後申請加入一軍審核' },
]

const clan_applied = useFormField<string | null>(null, validators.notEmpty)
const pubgGameNickname = useFormField('', validators.notEmpty)
const steam17Id = useFormField('', validators.steam17Id)
const totalPlaytime = useFormField<number | null>(null, validators.positiveNumber)
const weeklyPlaytime = useFormField<number | null>(null, validators.weeklyPlaytime)

// 3. 其他資訊
const hasFriends = ref(false)

// 朋友遊戲 ID - 使用陣列管理（類似 tag 輸入）
const friendNicknames = ref<string[]>([])
const friendNicknameInput = ref('')
const friendNicknamesStatus = ref<null | 'success' | 'error'>(null)

// 監聽 has_friends 變化來清空列表
watch(hasFriends, (newValue) => {
  if (!newValue) {
    // 取消勾選時立即清空
    friendNicknames.value = []
    friendNicknamesStatus.value = null
    friendNicknameInput.value = ''
  }
})

// 監聽朋友列表變化以更新驗證狀態
watch(friendNicknames, () => {
  if (hasFriends.value) {
    friendNicknamesStatus.value = friendNicknames.value.length > 0 ? 'success' : 'error'
  }
}, { deep: true })

// 添加朋友 ID
const addFriendNickname = () => {
  const nickname = friendNicknameInput.value.trim()
  if (nickname && !friendNicknames.value.includes(nickname)) {
    friendNicknames.value.push(nickname)
    friendNicknameInput.value = ''
  }
}

// 移除朋友 ID
const removeFriendNickname = (index: number) => {
  friendNicknames.value.splice(index, 1)
}

const hasReferrer = ref(false)
const referrerPubgNickname = useFormField('', validators.notEmpty, {
  shouldValidate: () => hasReferrer.value, // 只有勾選時才驗證
})

const notes = useFormField('', () => true) // 備註不必驗證

/** ========== 表單提交和驗證 ========== */

const showErrorMessage = ref(false)
const showSuccessModal = ref(false)
const showDiscordTooltipModal = ref(false)
const isSubmitting = ref(false) // 提交中狀態

// Discord Webhook URL（建議放在環境變數中）
const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL || ''

// 在開發時顯示環境變數狀態
console.log('環境變數檢查:', {
  hasWebhookUrl: !!DISCORD_WEBHOOK_URL,
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
})

// 計算表單是否有效
const isFormValid = computed(() => {
  return (
    nickName.status.value === 'success' &&
    discordUsername.status.value === 'success' &&
    clan_applied.status.value === 'success' &&
    pubgGameNickname.status.value === 'success' &&
    steam17Id.status.value === 'success' &&
    totalPlaytime.status.value === 'success' &&
    weeklyPlaytime.status.value === 'success' &&
    (!hasFriends.value || friendNicknamesStatus.value === 'success') &&
    (!hasReferrer.value || referrerPubgNickname.status.value === 'success')
  )
})

// 驗證所有必填欄位
const validateForm = () => {
  nickName.validate()
  discordUsername.validate()
  clan_applied.validate()
  pubgGameNickname.validate()
  steam17Id.validate()
  totalPlaytime.validate()
  weeklyPlaytime.validate()
  // 朋友 ID 驗證已在 watch 中處理
  referrerPubgNickname.validate()
}

// 發送到 Discord Webhook
const sendToDiscord = async (
  applicationData: Omit<ClanApplication, 'id' | 'created_at' | 'updated_at'>,
  steamId: string
) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord Webhook URL 未設定，跳過通知')
    return
  }

  try {
    // 建立 Discord Embed 訊息
    const embed = {
      title: `📜 ${applicationData.nickName}[${applicationData.pubg_nickname}] 的戰隊申請`,
      color: 0xff4000, // #FF4000
      fields: [
        {
          name: '',
          value: `**Discord 使用者名稱：** \`${applicationData.discord_username}\``,
          inline: false
        },
        {
          name: '',
          value: `**Steam ID：** \`${applicationData.steam_17_id}\``,
          inline: false
        },
        {
          name: '',
          value: `### [🔍 審核進度查詢](https://crazyclown.online/join/${steamId})`,
          inline: false
        },
      ],
    }

    // 發送到 Discord
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Crazy Clown 戰隊申請',
        avatar_url: 'https://crazyclown.online/media/favicon/crazyclown/favicon-light.png',
        embeds: [embed]
      })
    })

  } catch (error) {
    console.error('❌ Discord 通知發送失敗:', error)
    // 不要因為 Discord 發送失敗而影響主流程
  }
}

// 提交表單
const handleSubmit = async (event: Event) => {
  event.preventDefault()

  // 防止重複提交
  if (isSubmitting.value) return

  validateForm()

  if (isFormValid.value) {
    isSubmitting.value = true

    // 準備提交到 Supabase 的資料 (欄位名稱需對應資料庫)
    const applicationData = {
      nickName: nickName.value.value as string, // 注意：資料庫欄位為 nickName (駝峰式)
      discord_username: discordUsername.value.value as string,
      discord_uid: null, // Discord UID，由管理員手動更新
      clan_applied: clan_applied.value.value as string,
      pubg_nickname: pubgGameNickname.value.value as string,
      steam_17_id: steam17Id.value.value as string,
      tol_play_time: totalPlaytime.value.value as number,
      weekly_play_time: weeklyPlaytime.value.value as number,
      has_friends: hasFriends.value,
      // 朋友 ID 陣列
      friend_pubg_nickname: hasFriends.value && friendNicknames.value.length > 0
        ? friendNicknames.value
        : null,
      has_referrer: hasReferrer.value,
      introducer_pubg_nickname: hasReferrer.value ? (referrerPubgNickname.value.value as string) : null,
      notes: notes.value.value ? (notes.value.value as string) : null,
      thread_id: null, // Discord 討論串 ID，由管理員手動更新

      // 審核進度欄位的默認值
      crazy_clown_discord: '❌ 未加入' as const,
      pubg_official_discord: '❌ 未加入' as const,
      clan_review: '⚠️ 前二項未完成' as const,
      clan_review_reason: null,
      official_review: '⚠️ 待前項完成' as const,
      official_review_reason: null,
      in_game_application: '❌ 未申請' as const,
      role_assignment: '⚠️ 待前項完成' as const,
      is_closed: false  // 預設未結案
    }

    try {
      // 提交申請到資料庫（包含審核進度欄位）
      const response = await ClanApplicationService.createApplication(applicationData)

      if (response.error) {
        showErrorMessage.value = true
        showSuccessModal.value = false
        setTimeout(() => {
          showErrorMessage.value = false
        }, 5000)
        console.error('表單提交失敗:', response.error)
      } else if (response.data) {
        // 發送到 Discord（包含查詢 URL）
        await sendToDiscord(applicationData, applicationData.steam_17_id)

        showSuccessModal.value = true
        showErrorMessage.value = false
      }
    } catch (error) {
      showErrorMessage.value = true
      showSuccessModal.value = false
      setTimeout(() => {
        showErrorMessage.value = false
      }, 5000)
      console.error('提交過程中發生錯誤:', error)
    } finally {
      isSubmitting.value = false
    }
  } else {
    const firstErrorField = document.querySelector('.border-red-500')
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}

// 重置表單
const handleResetForm = () => {
  nickName.reset()
  discordUsername.reset()
  clan_applied.reset()
  pubgGameNickname.reset()
  steam17Id.reset()
  totalPlaytime.reset()
  weeklyPlaytime.reset()
  hasFriends.value = false
  friendNicknames.value = []
  friendNicknameInput.value = ''
  friendNicknamesStatus.value = null
  hasReferrer.value = false
  referrerPubgNickname.reset()
  notes.reset()
  showErrorMessage.value = false
  showSuccessModal.value = false
  showDiscordTooltipModal.value = false
}

const router = useRouter()

const closeSuccessModalAndResetForm = () => {
  showSuccessModal.value = false
  handleResetForm()
  router.push({ name: 'index' })
}
</script>

<template>
  <div class="max-w-7xl m-auto px-4 py-8">
    <DecorSection mainTitle="🎮 遊戲戰隊/公會申請" enTitle="Join Us">
      <form class="text-gray-900 dark:bg-zinc-900" autocomplete="off" @submit="handleSubmit">
        <!-- 重要注意事項 -->
        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800">
          <div class="text-center mb-8">
            <h1 class="mb-2 text-4xl font-extrabold text-gray-800 dark:text-zinc-50"></h1>
          </div>

          <div class="p-4 mb-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-zinc-700 rounded-md shadow-inner">
            <h2 class="ml-2 space-x-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              <i class="bi bi-exclamation-triangle" /><span>重要注意事項</span>
            </h2>

            <hr class="my-3 border-yellow-300 dark:border-zinc-600" />

            <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
              <li>
                請務必<span>立即加入</span>
                <a href="https://crazyclown.online/dc" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「Crazy_clown Discord 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>及<a
                  href="https://kraftontw.info/Discord" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「PUBG 官方 Discord 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>。
              </li>
              <li>
                審核進度/通知皆在
                <a href="https://discord.com/channels/490129931808931840/1389642260936790211" target="_blank"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  <span class="font-mono text-purple-700 dark:text-purple-300">
                    「#⚖️⇜戰隊審核進度<i class="bi bi-box-arrow-up-right ml-1"></i>」
                  </span>
                </a>頻道發布，請多加留意！。
              </li>
            </ul>
            <hr class="my-3 border-yellow-300 dark:border-zinc-600" />
            <p class="text-gray-700 dark:text-zinc-200">
              如頻繁提交失敗，可前直接前往
              <a href="https://crazyclown.online/dc" target="_blank" rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                「Crazy_Clown Discord 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」
              </a>的<a href="https://discord.com/channels/490129931808931840/1182389838582915162" target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                「📭⇜客服服務台<i class="bi bi-box-arrow-up-right ml-1"></i>」
              </a>頻道申請。
            </p>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div v-if="showErrorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong class="font-bold">提交失敗！</strong>
          <span class="block sm:inline">您的申請未能送出，請稍後再試或聯繫管理員。</span>
          <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" @click="showErrorMessage = false">
            ❌
          </span>
        </div>

        <!-- 基本資料區塊 -->
        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">您的基本資料</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 暱稱 -->
            <FormInput v-model="nickName.value.value" label="姓名/暱稱" :is-focused="nickName.isFocused.value"
              :status="nickName.status.value" name="暱稱" error-message="請輸入姓名/暱稱" required
              @focus="nickName.handleFocus()" @blur="nickName.handleBlur()" />

            <!-- Discord 使用者名稱 -->
            <FormInput v-model="discordUsername.value.value" label="Discord 使用者名稱"
              :is-focused="discordUsername.isFocused.value" :status="discordUsername.status.value" name="Discord 使用者名稱"
              error-message="請輸入有效的 Discord 使用者名稱 (僅限數字、字母、底線_、英文句號.)" hint=" 👉請先查看右方範例，避免填寫錯誤" required
              @focus="discordUsername.handleFocus()" @blur="discordUsername.handleBlur()">
              <template #suffix>
                <button type="button" @click="showDiscordTooltipModal = true"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none">
                  <i class="bi bi-exclamation-circle"></i>
                </button>
              </template>
            </FormInput>
          </div>
        </div>

        <!-- 遊戲資料區塊 -->
        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">您的遊戲資料</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 申請戰隊 -->
            <FormSelect v-model="clan_applied.value.value" label="欲申請的戰隊" :options="gameOptions"
              :is-focused="clan_applied.isFocused.value" :status="clan_applied.status.value" name="欲申請的戰隊"
              error-message="請選擇欲申請的戰隊" required @focus="clan_applied.handleFocus()"
              @blur="clan_applied.handleBlur()" />

            <!-- 遊戲 ID -->
            <FormInput v-model="pubgGameNickname.value.value" label="遊戲 ID"
              :is-focused="pubgGameNickname.isFocused.value" :status="pubgGameNickname.status.value" name="遊戲 ID"
              error-message="請輸入遊戲 ID" required @focus="pubgGameNickname.handleFocus()"
              @blur="pubgGameNickname.handleBlur()" />

            <!-- Steam 17位數字ID -->
            <FormInput v-model="steam17Id.value.value" label="Steam 17位數字ID" :is-focused="steam17Id.isFocused.value"
              :status="steam17Id.status.value" name="Steam 17位數字ID" error-message="請輸入有效的 Steam 17位數字ID" maxlength="17"
              required @focus="steam17Id.handleFocus()" @blur="steam17Id.handleBlur()" />

            <!-- 累計遊玩時數 -->
            <FormInput v-model="totalPlaytime.value.value" label="累計遊玩時數" type="number"
              :is-focused="totalPlaytime.isFocused.value" :status="totalPlaytime.status.value" name="累計遊玩時數"
              error-message="請輸入有效數字" required @focus="totalPlaytime.handleFocus()"
              @blur="totalPlaytime.handleBlur()" />

            <!-- 每週遊玩時數 -->
            <FormInput v-model="weeklyPlaytime.value.value" label="每週遊玩時數" type="number"
              :is-focused="weeklyPlaytime.isFocused.value" :status="weeklyPlaytime.status.value" name="每週遊玩時數"
              error-message="請輸入有效數值 (上限168小時)" required @focus="weeklyPlaytime.handleFocus()"
              @blur="weeklyPlaytime.handleBlur()" />
          </div>
        </div>

        <!-- 其他相關資訊區塊 -->
        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">其他相關資訊</h2>

          <div class="grid grid-cols-1 gap-8">
            <!-- 是否有朋友 -->
            <div class="flex items-center">
              <input type="checkbox" id="hasFriends" v-model="hasFriends"
                class="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                name="是否有朋友一同加入" />
              <label for="hasFriends" class="text-gray-900 dark:text-zinc-100 text-lg font-medium">是否有朋友一同加入?</label>
            </div>

            <!-- 朋友遊戲 ID - Tag 輸入方式 -->
            <div v-if="hasFriends" class="space-y-3">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                朋友遊戲 ID <span class="text-red-500">*</span>
              </label>

              <!-- 已添加的朋友 ID 標籤 -->
              <div v-if="friendNicknames.length > 0"
                class="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border-2"
                :class="{
                  'border-gray-300 dark:border-zinc-600': friendNicknamesStatus === null,
                  'border-green-500 dark:border-green-400': friendNicknamesStatus === 'success',
                  'border-red-500 dark:border-red-400': friendNicknamesStatus === 'error'
                }">
                <span
                  v-for="(nickname, index) in friendNicknames"
                  :key="index"
                  class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  {{ nickname }}
                  <button
                    type="button"
                    @click="removeFriendNickname(index)"
                    class="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-bold"
                  >
                    ×
                  </button>
                </span>
              </div>

              <!-- 添加朋友 ID -->
              <div class="flex gap-2">
                <input
                  v-model="friendNicknameInput"
                  @keyup.enter="addFriendNickname"
                  type="text"
                  placeholder="輸入朋友遊戲 ID 後按 Enter 或點擊新增"
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  @click="addFriendNickname"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  新增
                </button>
              </div>

              <p v-if="friendNicknamesStatus === 'error'" class="text-red-500 dark:text-red-400 text-xs">
                請至少添加一位朋友的遊戲 ID
              </p>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                已添加 {{ friendNicknames.length }} 位朋友
              </p>
            </div>

            <!-- 是否有介紹人 -->
            <div class="flex items-center">
              <input type="checkbox" id="hasReferrer" v-model="hasReferrer"
                class="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                name="是否有介紹人" />
              <label for="hasReferrer" class="text-gray-900 dark:text-zinc-100 text-lg font-medium">是否有介紹人?</label>
            </div>

            <!-- 介紹人姓名 -->
            <FormInput v-if="hasReferrer" v-model="referrerPubgNickname.value.value" label="介紹人姓名"
              :is-focused="referrerPubgNickname.isFocused.value" :status="referrerPubgNickname.status.value"
              name="介紹人姓名" error-message="請輸入介紹人姓名" required @focus="referrerPubgNickname.handleFocus()"
              @blur="referrerPubgNickname.handleBlur()" />

            <!-- 備註 -->
            <FormTextarea v-model="notes.value.value" label="備註" :is-focused="notes.isFocused.value"
              :status="notes.status.value" name="備註" @focus="notes.handleFocus()" @blur="notes.handleBlur()" />
          </div>
        </div>

        <!-- 按鈕 -->
        <div class="flex justify-center mt-10">
          <button type="button" @click="handleResetForm" :disabled="isSubmitting"
            class="inline-block w-1/2 md:w-1/3 rounded-l-full border border-gray-300 dark:border-zinc-700 bg-gray-200 dark:bg-zinc-700 px-5 py-3 font-medium text-gray-700 dark:text-zinc-200 shadow-sm transition-colors hover:bg-gray-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed">
            清除
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="inline-block w-1/2 md:w-1/3 rounded-r-full border border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ isSubmitting ? '提交中...' : '提交申請' }}
          </button>
        </div>
      </form>

      <!-- 成功 Modal (保持不變) -->
      <div v-if="showSuccessModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div
          class="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-8 w-full max-w-lg mx-auto relative transform transition-all duration-300 scale-100 opacity-100 sm:max-w-xl md:max-w-2xl">
          <div class="text-center mb-6">
            <div
              class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-700 mb-4">
              <svg class="h-8 w-8 text-green-600 dark:text-green-200" fill="none" stroke="currentColor"
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-2xl leading-8 font-extrabold text-gray-900 dark:text-zinc-100" id="modal-title">
              恭喜！申請已成功送出！
            </h3>
          </div>

          <div class="border-l-4 border-blue-500 bg-blue-50 dark:bg-zinc-700 p-4 rounded-md shadow-inner">
            <div class="flex items-center mb-3">
              <h2 class="text-xl font-bold text-blue-700 dark:text-blue-300">🌐 重要指引</h2>
            </div>
            <hr class="my-3 border-blue-300 dark:border-zinc-600" />
            <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
              <li>
                請務必<span>立即加入</span>
                <a href="https://crazyclown.online/dc" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「Crazy_clown Discord 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>及<a
                  href="https://kraftontw.info/Discord" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「PUBG 官方 Discord 社群<i class="bi bi-box-arrow-up-right ml-1"></i>」 </a>。
              </li>
              <li>
                審核進度/通知皆在
                <a href="https://discord.com/channels/490129931808931840/1389642260936790211" target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  <span class="font-mono text-purple-700 dark:text-purple-300">
                    「#⚖️⇜戰隊審核進度<i class="bi bi-box-arrow-up-right ml-1"></i>」
                  </span>
                </a>頻道發布，請多加留意！。
              </li>
            </ul>
          </div>

          <div class="mt-6 sm:mt-7 grid grid-cols-1 gap-3 ">
            <a href="https://crazyclown.online/dc" target="_blank" rel="noopener noreferrer"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-purple-700 text-base font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-lg dark:bg-purple-600 dark:hover:bg-purple-700 transition-colors duration-200">
              立即加入 Crazy_Clown Discord 社群❗
            </a>
            <a href="https://kraftontw.info/Discord" target="_blank" rel="noopener noreferrer"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-purple-700 text-base font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-lg dark:bg-purple-600 dark:hover:bg-purple-700 transition-colors duration-200">
              立即加入 PUBG 官方 Discord 社群❗
            </a>
            <a href="https://crazyclown.online/join/query" target="_blank" rel="noopener noreferrer"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-blue-700 text-base font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-lg dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200">
              查詢審核進度
            </a>
            <button type="button"
              class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-lg dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:border-zinc-600 transition-colors duration-200"
              @click="closeSuccessModalAndResetForm">
              回到首頁
            </button>
          </div>
        </div>
      </div>

      <!-- Discord 提示 Modal (保持不變) -->
      <div v-if="showDiscordTooltipModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl p-4 w-full max-w-lg mx-auto relative">
          <button @click="showDiscordTooltipModal = false"
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <div class="text-center">
            <h4 class="text-lg font-bold mb-4 text-gray-900 dark:text-zinc-100">Discord 使用者名稱範例</h4>
            <img src="https://i.meee.com.tw/lD5Gz9t.png" alt="Discord Username Example"
              class="max-w-full h-auto mx-auto rounded-md shadow-md" />
            <p class="mt-4 text-sm text-gray-600 dark:text-zinc-300">請輸入紅框處顯示的 Discord 使用者名稱。</p>
          </div>
        </div>
      </div>
    </DecorSection>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 2, 0.6, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
