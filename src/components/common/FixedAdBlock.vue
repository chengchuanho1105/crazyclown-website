<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Props {
  imageUrl?: string
  altText?: string
  storageKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: 'https://i.meee.com.tw/ycQkpZL.png',
  altText: '廣告圖片',
  storageKey: 'fixedAdBlockClosed',
})

// 廣告區塊狀態
const showAdBlock = ref(true)

// 關閉廣告區塊
const closeAdBlock = () => {
  showAdBlock.value = false
  // 將狀態保存到 localStorage
  localStorage.setItem(props.storageKey, 'true')
}

// 檢查是否已經關閉過廣告
onMounted(() => {
  const isClosed = localStorage.getItem(props.storageKey)
  if (isClosed === 'true') {
    showAdBlock.value = false
  }
})
</script>

<template>
  <!-- 常駐左下角廣告區塊 -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 transform translate-x-full"
    enter-to-class="opacity-100 transform translate-x-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 transform translate-x-0"
    leave-to-class="opacity-0 transform translate-x-full"
  >
    <div
      v-if="showAdBlock"
      class="fixed bottom-4 left-4 z-50 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- 廣告內容 -->
      <div class="relative w-full h-full">
        <!-- 關閉按鈕 -->
        <button
          @click="closeAdBlock"
          class="absolute top-2 right-2 z-10 w-6 h-6 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="關閉廣告"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <!-- 廣告圖片 -->
        <div class="w-full h-full flex items-center justify-center">
          <router-link :to="{ name: 'store' }">
            <img :src="imageUrl" :alt="altText" class="w-full h-full object-cover" />
          </router-link>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 確保圖片在 md 以上螢幕正確填滿 */
@media (min-width: 768px) {
  .object-cover {
    object-fit: cover;
  }
}
</style>
