<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>

    <!-- 彈窗內容 -->
    <div
      class="relative bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl aspect-square mx-4 overflow-hidden"
    >
      <!-- 關閉按鈕 -->
      <button
        @click="closeModal"
        class="absolute top-2 right-2 z-10 border border-gray-200 dark:border-gray-700 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      <!-- 廣告圖片 -->
      <div class="relative">
        <a href="https://crazyclown.online/store" target="_blank" rel="noopener noreferrer">
          <img
            src="https://i.meee.com.tw/649mhWP.png"
            alt="廣告"
            class="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

const closeModal = () => {
  isVisible.value = false
  // 使用 sessionStorage，關閉瀏覽器後會自動清除
  sessionStorage.setItem('adModalShown', 'true')
}

onMounted(() => {
  // 檢查是否已經顯示過（使用 sessionStorage）
  const hasShown = sessionStorage.getItem('adModalShown')
  // 檢查 URL 參數是否要強制顯示（用於測試）
  const forceShow = new URLSearchParams(window.location.search).get('showAd')

  if (!hasShown || forceShow === 'true') {
    // 延遲一下再顯示，確保頁面載入完成
    setTimeout(() => {
      isVisible.value = true
    }, 1000)
  }
})
</script>
