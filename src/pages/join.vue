<script setup lang="ts">
defineOptions({ name: 'CrazyClown-Join' });

// ---------- Vue 核心工具函式 ----------
import { ref, watch, computed, onMounted } from 'vue';
import type { Ref } from 'vue';
import { useRouter } from 'vue-router';

// ---------- 工具函式 ----------
import { useSheetData } from '@/composables/useSheetData'

// ---------- 組件引入區（版面用） ----------
import DecorSection from '@/components/DecorSection.vue';

/** ========== Clan Status Data 資料處裡 ========== */

/** 1. Clan Status Data 的資料格式 */
interface ClanStatusData {
  clanMemberCount: number
  availableSlots: number
  pendingReviewCount: number
}

/** 2. 取得 Clan Status Data CSV 來源 */
const CLANSTATUSDATA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRV4Q8MsKLZY-Acfw7jn6Ed9vMduP0gJ6R6eVVcq6cwXA24B_cx5OQ0mYT1VCcEZ3_BKaN7F4Vw0gya/pub?gid=0&single=true&output=csv'

/** 3. 定義 CSV 欄位轉換函式 */
const mapClanStatusData = (item: Record<string, string>): ClanStatusData => {
  return {
    clanMemberCount: Number(item.clanMemberCount) || 0,
    availableSlots: Number(item.availableSlots) || 0,
    pendingReviewCount: Number(item.pendingReviewCount) || 0,
  }
}

/** 4. 使用 useHybridData 來取得 Clan Status Data */
const { data: clanStatusData, loading: clanStatusLoading, load: loadClanStatusData } = useSheetData<ClanStatusData>(CLANSTATUSDATA_CSV_URL, mapClanStatusData)

onMounted(() => {
  loadClanStatusData()
})

/** ========== Review Status Data 資料處裡 ========== */

/** 1. Review Status Data 的資料格式 */
interface ReviewStatusData {
  status: string
  result: string
  rank: number
  nickName: string
  discordID: string
  pubgID: string
  gameAge: number
  weekTime: number
  date: string
  checkInA: boolean
  checkInB: boolean
  applyInGgame: boolean
  note: string
}

/** 2. 取得 Review Status Data CSV 來源 */
const REVIEWSTATUSDATA_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRV4Q8MsKLZY-Acfw7jn6Ed9vMduP0gJ6R6eVVcq6cwXA24B_cx5OQ0mYT1VCcEZ3_BKaN7F4Vw0gya/pub?gid=165769337&single=true&output=csv'

/** 3. 定義 CSV 欄位轉換函式 */
const mapReviewStatusData = (item: Record<string, string>): ReviewStatusData => {
  return {
    status: item.status || '',
    result: item.result || '',
    rank: Number(item.rank) || 0,
    nickName: item.nickName || '',
    discordID: item.discordID || '',
    pubgID: item.pubgID || '',
    gameAge: Number(item.gameAge) || 0,
    weekTime: Number(item.weekTime) || 0,
    date: item.date || '',
    checkInA: item.checkInA === 'true' || item.checkInA === 'TRUE' || item.checkInA === '1',
    checkInB: item.checkInB === 'true' || item.checkInB === 'TRUE' || item.checkInB === '1',
    applyInGgame: item.applyInGgame === 'true' || item.applyInGgame === 'TRUE' || item.applyInGgame === '1',
    note: item.note || '',
  }
}

/** 4. 使用 useHybridData 來取得 Review Status Data */
const { data: reviewStatusData, load: loadReviewStatusData } = useSheetData<ReviewStatusData>(REVIEWSTATUSDATA_CSV_URL, mapReviewStatusData)

onMounted(() => {
  loadReviewStatusData()
})

/** ========== 排序 Review Status Data ========== */

/** 1. 排序 Review Status Data */
// 排序 reviewStatusData
const sortedReviewStatusData = computed(() => {
  return [...(reviewStatusData.value || [])].sort((a, b) => Number(a.rank) - Number(b.rank))
})

/** ========== 輔助函式 ========== */

/** 1. 檢查字串是否為空 (考慮 trim()) */
// 輔助函式：檢查字串是否為空 (考慮 trim())
const isStringEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
};

/** 2. 檢查數字是否為有效非負數字 */
const isValidPositiveNumber = (value: number | null | undefined): boolean => {
  return value !== null && value !== undefined && !isNaN(value) && value >= 0;
};

/** 3. 根據值和焦點狀態更新驗證狀態 */
const updateValidationStatus = <T>(
  value: T,
  isFocused: Ref<boolean>,
  statusRef: Ref<null | 'success' | 'error'>,
  validationFn: (val: T) => boolean
) => {
  if (validationFn(value)) {
    statusRef.value = 'success';
  } else if (!isFocused.value) { // 僅在失去焦點且驗證失敗時標記為錯誤
    statusRef.value = 'error';
  } else {
    statusRef.value = null; // 聚焦時或有內容但還未完全驗證時，重置為 null
  }
};

/** 4. 檢查 Discord 使用者名稱是否符合規範 (數字、字母、底線、英文句號) */
const isValidDiscordUsernameFormat = (value: string | null | undefined): boolean => {
  if (isStringEmpty(value)) {
    return false; // 如果為空，則直接視為不符合格式
  }
  // 正規表達式：只允許數字 (0-9)、大寫字母 (A-Z)、小寫字母 (a-z)、底線 (_) 和英文句號 (.)
  const discordUsernameRegex = /^[a-zA-Z0-9_.]+$/;
  return discordUsernameRegex.test(value as string);
};


/** ========== Form State Variables ========== */

/** 1. 暱稱 */
const nickName = ref('');
const isNickNameFocused = ref(false);
const nickNameStatus = ref<null | 'success' | 'error'>(null);
const handleNickNameBlur = () => {
  isNickNameFocused.value = false;
  updateValidationStatus(nickName.value, isNickNameFocused, nickNameStatus, (val) => !isStringEmpty(val));
};
watch(nickName, (newValue) => {
  updateValidationStatus(newValue, isNickNameFocused, nickNameStatus, (val) => !isStringEmpty(val));
});

/** 2. Discord 使用者名稱 */
const discordUsername = ref('');
const isDiscordUsernameFocused = ref(false);
const discordUsernameStatus = ref<null | 'success' | 'error'>(null);
const handleDiscordUsernameBlur = () => {
  isDiscordUsernameFocused.value = false;
  updateValidationStatus(discordUsername.value, isDiscordUsernameFocused, discordUsernameStatus, isValidDiscordUsernameFormat);
};
watch(discordUsername, (newValue) => {
  updateValidationStatus(newValue, isDiscordUsernameFocused, discordUsernameStatus, isValidDiscordUsernameFormat);
});

/** 3. 申請遊戲 (下拉選單) */
const gameOptions = [{ value: '', label: '請選擇遊戲' }, { value: 'PUBG', label: 'PUBG' }];
const gameApplied = ref<string | null>(null); // 將初始值設為 null
const isGameAppliedFocused = ref(false);
const gameAppliedStatus = ref<null | 'success' | 'error'>(null);
const handleGameAppliedBlur = () => {
  isGameAppliedFocused.value = false;
  // 對於下拉選單，只要選擇了非空的 value 就算成功，如果還是 null/空字串就算錯誤
  updateValidationStatus(gameApplied.value, isGameAppliedFocused, gameAppliedStatus, (val) => !isStringEmpty(val));
};
watch(gameApplied, (newValue) => {
  updateValidationStatus(newValue, isGameAppliedFocused, gameAppliedStatus, (val) => !isStringEmpty(val));
});

/** 4. 遊戲 ID */
const gameId = ref('');
const isGameIdFocused = ref(false);
const gameIdStatus = ref<null | 'success' | 'error'>(null);
const handleGameIdBlur = () => {
  isGameIdFocused.value = false;
  updateValidationStatus(gameId.value, isGameIdFocused, gameIdStatus, (val) => !isStringEmpty(val));
};
watch(gameId, (newValue) => {
  updateValidationStatus(newValue, isGameIdFocused, gameIdStatus, (val) => !isStringEmpty(val));
});

/** 5. 累計遊玩時數 */
const totalPlaytime = ref<number | null>(null);
const isTotalPlaytimeFocused = ref(false);
const totalPlaytimeStatus = ref<null | 'success' | 'error'>(null);
const handleTotalPlaytimeBlur = () => {
  isTotalPlaytimeFocused.value = false;
  updateValidationStatus(totalPlaytime.value, isTotalPlaytimeFocused, totalPlaytimeStatus, isValidPositiveNumber);
};
watch(totalPlaytime, (newValue) => {
  updateValidationStatus(newValue, isTotalPlaytimeFocused, totalPlaytimeStatus, isValidPositiveNumber);
});

/** 6. 每週遊玩時數 */
const weeklyPlaytime = ref<number | null>(null);
const isWeeklyPlaytimeFocused = ref(false);
const weeklyPlaytimeStatus = ref<null | 'success' | 'error'>(null);
const handleWeeklyPlaytimeBlur = () => {
  isWeeklyPlaytimeFocused.value = false;
  updateValidationStatus(weeklyPlaytime.value, isWeeklyPlaytimeFocused, weeklyPlaytimeStatus, isValidPositiveNumber);
};
watch(weeklyPlaytime, (newValue) => {
  updateValidationStatus(newValue, isWeeklyPlaytimeFocused, weeklyPlaytimeStatus, isValidPositiveNumber);
});

/** 7. 是否有朋友一同加入 */
const hasFriends = ref(false);
watch(hasFriends, (newValue) => {
  if (!newValue) {
    friendGameId.value = ''; // 如果不選擇有朋友，清空朋友ID
    friendGameIdStatus.value = null; // 重置朋友ID的狀態
  }
});

/** 8. 朋友遊戲 ID */
const friendGameId = ref('');
const isFriendGameIdFocused = ref(false);
const friendGameIdStatus = ref<null | 'success' | 'error'>(null);
const handleFriendGameIdBlur = () => {
  isFriendGameIdFocused.value = false;
  if (hasFriends.value) { // 只有當 hasFriends 為 true 時才驗證
    updateValidationStatus(friendGameId.value, isFriendGameIdFocused, friendGameIdStatus, (val) => !isStringEmpty(val));
  } else {
    friendGameIdStatus.value = null; // 如果沒有朋友，則不驗證
  }
};
watch(friendGameId, (newValue) => {
  if (hasFriends.value) { // 只有當 hasFriends 為 true 時才監聽
    updateValidationStatus(newValue, isFriendGameIdFocused, friendGameIdStatus, (val) => !isStringEmpty(val));
  } else {
    friendGameIdStatus.value = null;
  }
});


/** 9. 備註 */
const notes = ref('');
const isNotesFocused = ref(false);
const notesStatus = ref<null | 'success' | 'error'>(null);
const handleNotesBlur = () => {
  isNotesFocused.value = false;
  notesStatus.value = notes.value.trim() !== '' ? 'success' : null;
};
watch(notes, (newValue) => {
  notesStatus.value = newValue.trim() !== '' ? 'success' : null;
});

/** ========== Form Submission and Validation ========== */

/** 1. 表單驗證 */
const isFormValid = ref(false);
const showErrorMessage = ref(false); // 保持錯誤訊息在原位顯示

/** 2. 新增 Modal 相關狀態 */
const showSuccessModal = ref(false);
const showDiscordTooltipModal = ref(false); // New state for Discord tooltip modal

/** 3. 驗證表單 */
const validateForm = () => {
  // 觸發所有必填欄位的驗證，確保在提交前更新狀態
  handleNickNameBlur();
  handleDiscordUsernameBlur();
  handleGameAppliedBlur();
  handleGameIdBlur();
  handleTotalPlaytimeBlur();
  handleWeeklyPlaytimeBlur();
  handleFriendGameIdBlur(); // 即使沒有朋友，也會執行，但會被內部邏輯處理

  isFormValid.value = (
    nickNameStatus.value === 'success' &&
    discordUsernameStatus.value === 'success' &&
    gameAppliedStatus.value === 'success' &&
    gameIdStatus.value === 'success' &&
    totalPlaytimeStatus.value === 'success' &&
    weeklyPlaytimeStatus.value === 'success' &&
    (!hasFriends.value || friendGameIdStatus.value === 'success') // 如果有朋友，朋友ID必須成功
  );
};

/** 4. 提交表單 */
const handleSubmit = async (event: Event) => {
  // 防止表單預設提交行為
  event.preventDefault();

  validateForm();

  if (isFormValid.value) {
    const formData = {
      暱稱: nickName.value,
      Discord使用者名稱: discordUsername.value,
      申請的遊戲: gameApplied.value,
      遊戲ID: gameId.value,
      累計遊玩時數: totalPlaytime.value,
      每週遊玩時數: weeklyPlaytime.value,
      是否有朋友一同加入: hasFriends.value ? '是' : '否',
      朋友遊戲ID: hasFriends.value ? friendGameId.value : '無',
      備註: notes.value || '無',
    };

    try {
      const response = await fetch('https://formspree.io/f/xpwrbkjp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccessModal.value = true; // 提交成功，顯示 Modal
        showErrorMessage.value = false;
        // 注意：這裡不呼叫 handleResetForm()，讓使用者可以在 Modal 中看到已填寫的內容
      } else {
        showErrorMessage.value = true;
        showSuccessModal.value = false; // 確保 Modal 不顯示
        setTimeout(() => {
          showErrorMessage.value = false;
        }, 5000);
        console.error('表單提交失敗:', response.statusText);
      }
    } catch (error) {
      showErrorMessage.value = true;
      showSuccessModal.value = false; // 確保 Modal 不顯示
      setTimeout(() => {
        showErrorMessage.value = false;
      }, 5000);
      console.error('提交過程中發生錯誤:', error);
    }
  } else {
    const firstErrorField = document.querySelector('.border-red-500');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
};

/** ========== Reset Function ========== */

/** 1. 重置表單 */
const handleResetForm = () => {
  nickName.value = '';
  isNickNameFocused.value = false;
  nickNameStatus.value = null;

  discordUsername.value = '';
  isDiscordUsernameFocused.value = false;
  discordUsernameStatus.value = null;

  gameApplied.value = null;
  isGameAppliedFocused.value = false;
  gameAppliedStatus.value = null;

  gameId.value = '';
  isGameIdFocused.value = false;
  gameIdStatus.value = null;

  totalPlaytime.value = null;
  isTotalPlaytimeFocused.value = false;
  totalPlaytimeStatus.value = null;

  weeklyPlaytime.value = null;
  isWeeklyPlaytimeFocused.value = false;
  weeklyPlaytimeStatus.value = null;

  hasFriends.value = false;
  friendGameId.value = '';
  isFriendGameIdFocused.value = false;
  friendGameIdStatus.value = null;

  notes.value = '';
  isNotesFocused.value = false;
  notesStatus.value = null;

  // 重置表單時隱藏所有提示
  showErrorMessage.value = false;
  showSuccessModal.value = false; // 確保 Modal 也被隱藏
  showDiscordTooltipModal.value = false; // Also hide the discord tooltip modal
};

const router = useRouter();

// 關閉成功 Modal 並重置表單
const closeSuccessModalAndResetForm = () => {
  showSuccessModal.value = false;
  handleResetForm();
  router.push({ name: 'crazyclown' });
};

// ICONS
const memberIcon = `<svg class='w-8 h-8 text-blue-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 4v2a2 2 0 01-2 2h-1M3 16v2a2 2 0 002 2h1'></path></svg>`
const slotIcon = `<svg class='w-8 h-8 text-green-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6a2 2 0 012-2h12a2 2 0 012 2v8c0 2.21-3.582 4-8 4z'></path></svg>`
const pendingIcon = `<svg class='w-8 h-8 text-yellow-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'></path></svg>`

// Chevron Down/Up SVG
const chevronDown = `<svg class='w-5 h-5 inline-block ml-1 transition-transform' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'></path></svg>`
const chevronUp = `<svg class='w-5 h-5 inline-block ml-1 transition-transform rotate-180' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'></path></svg>`

// ICON for Discord/PUBG
const discordIcon = `<svg class='w-4 h-4 inline-block mr-1 text-indigo-500' fill='currentColor' viewBox='0 0 24 24'><path d='M20.317 4.369A19.791 19.791 0 0016.885 3.2a.117.117 0 00-.124.06c-.537.96-1.13 2.22-1.552 3.2a18.524 18.524 0 00-5.034 0c-.423-.98-1.015-2.24-1.553-3.2a.117.117 0 00-.124-.06A19.736 19.736 0 003.684 4.369a.105.105 0 00-.047.043C.533 9.045-.32 13.579.099 18.057a.12.12 0 00.045.083c2.087 1.53 4.104 2.47 6.077 3.09a.115.115 0 00.125-.042c.47-.65.89-1.34 1.25-2.06a.112.112 0 00-.06-.155c-.66-.25-1.29-.55-1.89-.89a.112.112 0 01-.011-.19c.127-.096.254-.192.38-.29a.112.112 0 01.114-.01c3.927 1.793 8.18 1.793 12.062 0a.112.112 0 01.115.01c.127.098.253.194.38.29a.112.112 0 01-.011.19c-.6.34-1.23.64-1.89.89a.112.112 0 00-.06.155c.36.72.78 1.41 1.25 2.06a.115.115 0 00.125.042c1.973-.62 3.99-1.56 6.077-3.09a.12.12 0 00.045-.083c.5-5.177-.838-9.673-3.637-13.645a.104.104 0 00-.047-.043z'></path></svg>`
const pubgIcon = `<svg class='w-4 h-4 inline-block mr-1 text-yellow-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><path d='M16 8v8M8 8v8M8 12h8'/></svg>`

// Info icon for 備註
const infoIcon = `<svg class='w-4 h-4 inline-block mr-1 text-blue-400' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' d='M13 16h-1v-4h-1m1-4h.01'></path><circle cx='12' cy='12' r='10' /></svg>`

// 展開狀態（只允許一個展開）
const expandedRow = ref<number | null>(null)
function toggleRow(idx: number) {
  expandedRow.value = expandedRow.value === idx ? null : idx
}
</script>

<template>
  <div class="max-w-7xl m-auto px-4 py-8">
    <DecorSection main-title="戰隊狀態" en-title="Clan Status" :is-loading="clanStatusLoading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          class="flex flex-col items-center bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-blue-100 dark:border-zinc-700">
          <span v-html="memberIcon"></span>
          <div class="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">
            {{ clanStatusData[0]?.clanMemberCount || 0 }}
          </div>
          <div class="text-gray-600 dark:text-gray-300 mt-1">當前成員人數</div>
        </div>
        <div
          class="flex flex-col items-center bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-green-100 dark:border-zinc-700">
          <span v-html="slotIcon"></span>
          <div class="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
            {{ clanStatusData[0]?.availableSlots || 0 }}
          </div>
          <div class="text-gray-600 dark:text-gray-300 mt-1">開放加入人數</div>
        </div>
        <div
          class="flex flex-col items-center bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-yellow-100 dark:border-zinc-700">
          <span v-html="pendingIcon"></span>
          <div class="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {{ clanStatusData[0]?.pendingReviewCount || 0 }}
          </div>
          <div class="text-gray-600 dark:text-gray-300 mt-1">等候審核人數</div>
        </div>
      </div>
    </DecorSection>

    <DecorSection main-title="審核進度" en-title="Review Progress">

      <div class="p-4 mb-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-zinc-700 rounded-md shadow-inner">
        <p class="text-gray-700 dark:text-zinc-200">
          本頁面資料非即時更新，請以
          <a href="https://discord.gg/3TEHPZhYUK" target="_blank" rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
            「戰隊Discord社群<i class="bi bi-box-arrow-up-right ml-1"></i>」
          </a>的<a href="https://discord.com/channels/490129931808931840/1182389838582915162" target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
            「⚖️⇜戰隊審核進度<i class="bi bi-box-arrow-up-right ml-1"></i>」
          </a>頻道資料為準。
        </p>
      </div>


      <div class="space-y-6">
        <div v-for="(item, idx) in sortedReviewStatusData" :key="item.rank + '-' + item.nickName"
          class="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 transition-transform duration-200 hover:shadow-2xl hover:-translate-y-1">
          <button @click="toggleRow(idx)"
            class="w-full flex items-center justify-between px-6 py-4 focus:outline-none group">
            <div class="flex items-center space-x-6">
              <span class="font-semibold text-blue-700 dark:text-blue-300 text-base">{{ item.status }}</span>
              <span class="text-gray-700 dark:text-gray-200 text-base">{{ item.result }}</span>
              <span class="text-gray-500 dark:text-gray-400 text-base">{{ item.nickName }}</span>
            </div>
            <span v-html="expandedRow === idx ? chevronUp : chevronDown"
              class="text-blue-500 group-hover:text-blue-700 transition-transform duration-300"
              :class="expandedRow === idx ? 'rotate-180' : ''"></span>
          </button>
          <transition name="fade-slide">
            <div v-if="expandedRow === idx"
              class="px-6 pb-6 pt-4 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-zinc-700 bg-gradient-to-br from-blue-50/60 via-white/80 to-white dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-b-xl">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div class="flex items-center gap-2"><span class="text-gray-400"><svg class='w-4 h-4' fill='none'
                      stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'>
                      <path stroke-linecap='round' stroke-linejoin='round'
                        d='M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z'></path>
                      <circle cx='12' cy='12' r='10' />
                    </svg></span><b>審核排名：</b>{{ item.rank }}</div>
                <div class="flex items-center gap-2"><span class="text-gray-400"><svg class='w-4 h-4' fill='none'
                      stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'>
                      <path stroke-linecap='round' stroke-linejoin='round'
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'>
                      </path>
                    </svg></span><b>申請日期：</b>{{ item.date }}</div>
                <div class="flex items-center gap-2"><span v-html="discordIcon"></span><b>Discord ID：</b>{{
                  item.discordID }}</div>
                <div class="flex items-center gap-2"><span v-html="pubgIcon"></span><b>PUBG ID：</b>{{ item.pubgID }}
                </div>
                <div class="flex items-center gap-2"><span class="text-pink-400"><svg class='w-4 h-4' fill='none'
                      stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'>
                      <path stroke-linecap='round' stroke-linejoin='round' d='M12 8v4l3 3'></path>
                      <circle cx='12' cy='12' r='10' />
                    </svg></span><b>累計遊玩時數：</b>{{ item.gameAge }}</div>
                <div class="flex items-center gap-2"><span class="text-yellow-400"><svg class='w-4 h-4' fill='none'
                      stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'>
                      <path stroke-linecap='round' stroke-linejoin='round' d='M12 8v4l3 3'></path>
                      <circle cx='12' cy='12' r='10' />
                    </svg></span><b>每週遊玩時數：</b>{{ item.weekTime }}</div>
              </div>
              <div class="flex flex-wrap gap-3 items-center mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                  :class="item.checkInA ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'">
                  <svg v-if="item.checkInA" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  報到第一站
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                  :class="item.checkInB ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'">
                  <svg v-if="item.checkInB" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  報到第二站
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                  :class="item.applyInGgame ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-500 border border-gray-200'">
                  <svg v-if="item.applyInGgame" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  遊戲內申請
                </span>
              </div>
              <div
                class="bg-blue-50 dark:bg-zinc-900 rounded p-3 mt-2 text-gray-700 dark:text-gray-200 flex items-start">
                <span v-html="infoIcon" class="mr-2 mt-0.5"></span>
                <span><b>備註：</b>{{ item.note || '—' }}</span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </DecorSection>



    <DecorSection mainTitle="加入我們" enTitle="Join Us">
      <form class="text-gray-900 dark:bg-zinc-900" autocomplete="off" @submit="handleSubmit">
        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800">
          <div class="text-center mb-8">
            <h1 class="mb-2 text-4xl font-extrabold text-gray-800 dark:text-zinc-50">🎮 遊戲戰隊/公會申請</h1>
          </div>

          <div class="p-4 mb-6 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-zinc-700 rounded-md shadow-inner">

            <h2 class="ml-2 space-x-2 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              <i class="bi bi-exclamation-triangle" /><span>重要注意事項</span>
            </h2>

            <hr class="my-3 border-yellow-300 dark:border-zinc-600">

            <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
              <li>
                申請提交後，請務必
                <a href="https://discord.gg/3TEHPZhYUK"><span class="font-bold text-red-500">立即加入</span></a>
                我們的
                <a href="https://discord.gg/3TEHPZhYUK" target="_blank"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「戰隊Discord社群<i class="bi bi-box-arrow-up-right ml-1"></i>」
                </a>。
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
            <hr class="my-3 border-yellow-300 dark:border-zinc-600">
            <p class="text-gray-700 dark:text-zinc-200">
              如頻繁提交失敗，可前直接前往
              <a href="https://discord.gg/3TEHPZhYUK" target="_blank" rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                「戰隊Discord社群<i class="bi bi-box-arrow-up-right ml-1"></i>」
              </a>的<a href="https://discord.com/channels/490129931808931840/1182389838582915162" target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                「📭⇜客服服務台<i class="bi bi-box-arrow-up-right ml-1"></i>」
              </a>頻道申請。
            </p>
          </div>

        </div>

        <div v-if="showErrorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong class="font-bold">提交失敗！</strong>
          <span class="block sm:inline">您的申請未能送出，請稍後再試或聯繫管理員。</span>
          <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" @click="showErrorMessage = false">
            <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20">
              <title>Close</title>
              <path
                d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.103l-2.651 3.746a1.2 1.2 0 0 1-1.697-1.697l3.746-2.651-3.746-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.897l2.651-3.746a1.2 1.2 0 0 1 1.697 1.697L11.103 10l3.746 2.651a1.2 1.2 0 0 1 0 1.697z" />
            </svg>
          </span>
        </div>

        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">您的基本資料</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isNickNameFocused && nickNameStatus === null,
              'border-blue-500 dark:border-blue-400': isNickNameFocused,
              'border-green-500 dark:border-green-400': !isNickNameFocused && nickNameStatus === 'success',
              'border-red-500 dark:border-red-400': !isNickNameFocused && nickNameStatus === 'error',
            }">
              <label for="nickName" class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none"
                :class="{
                  'text-gray-600 dark:text-zinc-400': !isNickNameFocused && !nickName,
                  'text-blue-500 dark:text-blue-400': isNickNameFocused,
                  'text-green-500 dark:text-green-400': !isNickNameFocused && nickNameStatus === 'success',
                  'text-red-500 dark:text-red-400': !isNickNameFocused && nickNameStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isNickNameFocused || nickName,
                  'top-1/2 -translate-y-1/2': !isNickNameFocused && !nickName
                }">
                姓名/暱稱 <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="text" id="nickName" v-model="nickName" @focus="isNickNameFocused = true"
                @blur="handleNickNameBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder=""
                autocomplete="off" name="暱稱" />
              <p v-if="nickNameStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
                請輸入姓名/暱稱
              </p>
            </div>

            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isDiscordUsernameFocused && discordUsernameStatus === null,
              'border-blue-500 dark:border-blue-400': isDiscordUsernameFocused,
              'border-green-500 dark:border-green-400': !isDiscordUsernameFocused && discordUsernameStatus === 'success',
              'border-red-500 dark:border-red-400': !isDiscordUsernameFocused && discordUsernameStatus === 'error',
            }">
              <label for="discordUsername"
                class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none" :class="{
                  'text-gray-600 dark:text-zinc-400': !isDiscordUsernameFocused && !discordUsername,
                  'text-blue-500 dark:text-blue-400': isDiscordUsernameFocused,
                  'text-green-500 dark:text-green-400': !isDiscordUsernameFocused && discordUsernameStatus === 'success',
                  'text-red-500 dark:text-red-400': !isDiscordUsernameFocused && discordUsernameStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isDiscordUsernameFocused || discordUsername,
                  'top-1/2 -translate-y-1/2': !isDiscordUsernameFocused && !discordUsername
                }">
                Discord 使用者名稱 <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="text" id="discordUsername" v-model="discordUsername" @focus="isDiscordUsernameFocused = true"
                @blur="handleDiscordUsernameBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder=""
                autocomplete="off" name="Discord 使用者名稱" />
              <p v-if="discordUsernameStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
                請輸入有效的 Discord 使用者名稱 (僅限數字、字母、底線_、英文句號.)
              </p>
              <button type="button" @click="showDiscordTooltipModal = true"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none">
                <i class="bi bi-exclamation-circle"></i>
              </button>
            </div>
          </div>

        </div>

        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">您的遊戲資料</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isGameAppliedFocused && gameAppliedStatus === null,
              'border-blue-500 dark:border-blue-400': isGameAppliedFocused,
              'border-green-500 dark:border-green-400': !isGameAppliedFocused && gameAppliedStatus === 'success',
              'border-red-500 dark:border-red-400': !isGameAppliedFocused && gameAppliedStatus === 'error',
            }">
              <label for="gameApplied"
                class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none" :class="{
                  'text-gray-600 dark:text-zinc-400': !isGameAppliedFocused && gameApplied === null,
                  'text-blue-500 dark:text-blue-400': isGameAppliedFocused,
                  'text-green-500 dark:text-green-400': !isGameAppliedFocused && gameAppliedStatus === 'success',
                  'text-red-500 dark:text-red-400': !isGameAppliedFocused && gameAppliedStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isGameAppliedFocused || gameApplied !== null,
                  'top-1/2 -translate-y-1/2': !isGameAppliedFocused && gameApplied === null
                }">
                申請的遊戲 <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <select id="gameApplied" v-model="gameApplied" @focus="isGameAppliedFocused = true"
                @blur="handleGameAppliedBlur" class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10 cursor-pointer
                      text-gray-900 dark:text-zinc-100 focus:outline-none" autocomplete="off" name="申請的遊戲">
                <option v-for="game in gameOptions" :key="game.value" :value="game.value" :disabled="game.value === ''"
                  class="bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100">
                  {{ game.label }}
                </option>
              </select>
              <p v-if="gameAppliedStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">請選擇申請的遊戲
              </p>
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-zinc-300">
                <i class="bi bi-chevron-down"></i>
              </div>
            </div>

            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isGameIdFocused && gameIdStatus === null,
              'border-blue-500 dark:border-blue-400': isGameIdFocused,
              'border-green-500 dark:border-green-400': !isGameIdFocused && gameIdStatus === 'success',
              'border-red-500 dark:border-red-400': !isGameIdFocused && gameIdStatus === 'error',
            }">
              <label for="gameId" class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none"
                :class="{
                  'text-gray-600 dark:text-zinc-400': !isGameIdFocused && !gameId,
                  'text-blue-500 dark:text-blue-400': isGameIdFocused,
                  'text-green-500 dark:text-green-400': !isGameIdFocused && gameIdStatus === 'success',
                  'text-red-500 dark:text-red-400': !isGameIdFocused && gameIdStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isGameIdFocused || gameId,
                  'top-1/2 -translate-y-1/2': !isGameIdFocused && !gameId
                }">
                遊戲 ID <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="text" id="gameId" v-model="gameId" @focus="isGameIdFocused = true" @blur="handleGameIdBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500"
                placeholder="" autocomplete="off" name="遊戲 ID" />
              <p v-if="gameIdStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
                請輸入遊戲 ID</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isTotalPlaytimeFocused && totalPlaytimeStatus === null,
              'border-blue-500 dark:border-blue-400': isTotalPlaytimeFocused,
              'border-green-500 dark:border-green-400': !isTotalPlaytimeFocused && totalPlaytimeStatus === 'success',
              'border-red-500 dark:border-red-400': !isTotalPlaytimeFocused && totalPlaytimeStatus === 'error',
            }">
              <label for="totalPlaytime"
                class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none" :class="{
                  'text-gray-600 dark:text-zinc-400': !isTotalPlaytimeFocused && totalPlaytime === null,
                  'text-blue-500 dark:text-blue-400': isTotalPlaytimeFocused,
                  'text-green-500 dark:text-green-400': !isTotalPlaytimeFocused && totalPlaytimeStatus === 'success',
                  'text-red-500 dark:text-red-400': !isTotalPlaytimeFocused && totalPlaytimeStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isTotalPlaytimeFocused || totalPlaytime !== null,
                  'top-1/2 -translate-y-1/2': !isTotalPlaytimeFocused && totalPlaytime === null
                }">
                累計遊玩時數 <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="number" id="totalPlaytime" v-model.number="totalPlaytime"
                @focus="isTotalPlaytimeFocused = true" @blur="handleTotalPlaytimeBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder="" autocomplete="off" name="累計遊玩時數" />
              <p v-if="totalPlaytimeStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">請輸入有效數字</p>
            </div>

            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isWeeklyPlaytimeFocused && weeklyPlaytimeStatus === null,
              'border-blue-500 dark:border-blue-400': isWeeklyPlaytimeFocused,
              'border-green-500 dark:border-green-400': !isWeeklyPlaytimeFocused && weeklyPlaytimeStatus === 'success',
              'border-red-500 dark:border-red-400': !isWeeklyPlaytimeFocused && weeklyPlaytimeStatus === 'error',
            }">
              <label for="weeklyPlaytime"
                class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none" :class="{
                  'text-gray-600 dark:text-zinc-400': !isWeeklyPlaytimeFocused && weeklyPlaytime === null,
                  'text-blue-500 dark:text-blue-400': isWeeklyPlaytimeFocused,
                  'text-green-500 dark:text-green-400': !isWeeklyPlaytimeFocused && weeklyPlaytimeStatus === 'success',
                  'text-red-500 dark:text-red-400': !isWeeklyPlaytimeFocused && weeklyPlaytimeStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isWeeklyPlaytimeFocused || weeklyPlaytime !== null,
                  'top-1/2 -translate-y-1/2': !isWeeklyPlaytimeFocused && weeklyPlaytime === null
                }">
                每週遊玩時數 <span class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="number" id="weeklyPlaytime" v-model.number="weeklyPlaytime"
                @focus="isWeeklyPlaytimeFocused = true" @blur="handleWeeklyPlaytimeBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder="" autocomplete="off" name="每週遊玩時數" />
              <p v-if="weeklyPlaytimeStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">請輸入有效數字
              </p>
            </div>
          </div>

        </div>

        <div class="mb-8 p-6 bg-white rounded-lg shadow-md dark:bg-zinc-800 dark:shadow-lg">
          <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">其他相關資訊</h2>

          <div class="grid grid-cols-1 gap-8">
            <div class="flex items-center">
              <input type="checkbox" id="hasFriends" v-model="hasFriends"
                class="mr-3 h-5 w-5 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-zinc-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                name="是否有朋友一同加入">
              <label for="hasFriends" class="text-gray-900 dark:text-zinc-100 text-lg font-medium">是否有朋友一同加入?</label>
            </div>

            <div v-if="hasFriends"
              class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
                'border-gray-300 dark:border-zinc-600': !isFriendGameIdFocused && friendGameIdStatus === null,
                'border-blue-500 dark:border-blue-400': isFriendGameIdFocused,
                'border-green-500 dark:border-green-400': !isFriendGameIdFocused && friendGameIdStatus === 'success',
                'border-red-500 dark:border-red-400': !isFriendGameIdFocused && friendGameIdStatus === 'error',
              }">
              <label for="friendGameId"
                class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none" :class="{
                  'text-gray-600 dark:text-zinc-400': !isFriendGameIdFocused && !friendGameId,
                  'text-blue-500 dark:text-blue-400': isFriendGameIdFocused,
                  'text-green-500 dark:text-green-400': !isFriendGameIdFocused && friendGameIdStatus === 'success',
                  'text-red-500 dark:text-red-400': !isFriendGameIdFocused && friendGameIdStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isFriendGameIdFocused || friendGameId,
                  'top-1/2 -translate-y-1/2': !isFriendGameIdFocused && !friendGameId
                }">
                朋友遊戲 ID <span class="text-sm text-red-500 dark:text-red-400">(若有多位請用"、"區隔)</span> <span
                  class="text-red-500 dark:text-red-400">*</span>
              </label>
              <input type="text" id="friendGameId" v-model="friendGameId" @focus="isFriendGameIdFocused = true"
                @blur="handleFriendGameIdBlur"
                class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder=""
                autocomplete="off" name="朋友遊戲 ID" />
              <p v-if="friendGameIdStatus === 'error'"
                class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">請輸入朋友遊戲 ID
              </p>
            </div>

            <div class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out" :class="{
              'border-gray-300 dark:border-zinc-600': !isNotesFocused && notesStatus === null,
              'border-blue-500 dark:border-blue-400': isNotesFocused,
              'border-green-500 dark:border-green-400': !isNotesFocused && notesStatus === 'success',
              'border-red-500 dark:border-red-400': !isNotesFocused && notesStatus === 'error',
            }">
              <label for="notes" class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none"
                :class="{
                  'text-gray-600 dark:text-zinc-400': !isNotesFocused && !notes,
                  'text-blue-500 dark:text-blue-400': isNotesFocused,
                  'text-green-500 dark:text-green-400': !isNotesFocused && notesStatus === 'success',
                  'text-red-500 dark:text-red-400': !isNotesFocused && notesStatus === 'error',
                  'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isNotesFocused || notes,
                  'top-3': !isNotesFocused && !notes // 對於 textarea 調整預設 label 位置
                }">
                備註
              </label>
              <textarea id="notes" v-model="notes" @focus="isNotesFocused = true" @blur="handleNotesBlur"
                class="block w-full px-1 pt-6 pb-1 bg-transparent appearance-none h-24 resize-y
                      text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500" placeholder="" name="備註"></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-center mt-10">
          <button type="button" @click="handleResetForm" class="inline-block w-1/2 md:w-1/3 rounded-l-full border
                                 border-gray-300 dark:border-zinc-700 bg-gray-200 dark:bg-zinc-700 px-5 py-3 font-medium
                                 text-gray-700 dark:text-zinc-200 shadow-sm transition-colors
                                 hover:bg-gray-300 dark:hover:bg-zinc-600">
            清除
          </button>
          <button type="submit" class="inline-block w-1/2 md:w-1/3 rounded-r-full border
                                 border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 px-5 py-3 font-medium
                                 text-white shadow-sm transition-colors
                                 hover:bg-blue-700 dark:hover:bg-blue-600">
            提交申請
          </button>
        </div>

      </form>

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
            <div class="flex items-center mb-3"> <svg
                class="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="currentColor"
                viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9.293 11.293a1 1 0 001.414 1.414L12 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z"
                  clip-rule="evenodd" />
              </svg>
              <h2 class="text-xl font-bold text-blue-700 dark:text-blue-300">重要指引</h2>
            </div>
            <hr class="my-3 border-blue-300 dark:border-zinc-600">
            <ul class="list-disc pl-5 space-y-2 text-gray-700 dark:text-zinc-200">
              <li>
                請務必<a href="https://discord.gg/3TEHPZhYUK"><span class="font-bold text-red-500">立即加入</span></a>我們的
                <a href="https://discord.gg/3TEHPZhYUK" target="_blank" rel="noopener noreferrer"
                  class="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-200 flex-grow-0 inline-flex items-center">
                  「戰隊Discord社群<i class="bi bi-box-arrow-up-right ml-1"></i>」
                </a>。
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

          <div class="mt-6 sm:mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button type="button"
              class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-lg dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600 dark:border-zinc-600 transition-colors duration-200"
              @click="closeSuccessModalAndResetForm">
              回到首頁
            </button>
            <a href="https://discord.gg/3TEHPZhYUK" target="_blank" rel="noopener noreferrer"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-purple-700 text-base font-medium text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-lg dark:bg-purple-600 dark:hover:bg-purple-700 transition-colors duration-200">
              <svg class="mr-2 h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M6.29 18.29a1 1 0 01-1.41-1.41L15.59 7H12a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V7.41L6.29 18.29z" />
                <path fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zM2 10a8 8 0 1116 0 8 8 0 01-16 0z"
                  clip-rule="evenodd" />
                <path
                  d="M12.5 7.5a.5.5 0 11-1 0 .5.5 0 011 0zM7.5 7.5a.5.5 0 11-1 0 .5.5 0 011 0zM10 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                <path d="M11 9H9a1 1 0 100 2h2a1 1 0 100-2z" />
              </svg>
              立即加入 Discord
            </a>
          </div>
        </div>
      </div>

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
              class="max-w-full h-auto mx-auto rounded-md shadow-md">
            <p class="mt-4 text-sm text-gray-600 dark:text-zinc-300">
              請輸入紅框處顯示的 Discord 使用者名稱。
            </p>
          </div>
        </div>
      </div>
    </DecorSection>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(.4, 2, .6, 1);
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
