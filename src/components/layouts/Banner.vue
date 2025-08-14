<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentRoute } from '@/composables/useCurrentRouth'

defineOptions({ name: 'Layout-Banner' })

const { isHomePage } = useCurrentRoute()

// 根據頁面類型決定容器高度和顯示方式
const containerClass = computed(() => {

  if (isHomePage.value) {
    return 'h-screen' // 首頁占滿畫面
  }

  return 'h-[30svh]' // 其他頁面占30%
})

// 是否顯示向下提示（只在首頁顯示）
const showScrollHint = computed(() => isHomePage.value)

const scrollPastBanner = () => {
  const section = document.querySelector('.relative.w-full.overflow-hidden') as HTMLElement
  if (section) {
    const bannerBottom = section.offsetTop + section.offsetHeight
    window.scrollTo({
      top: bannerBottom,
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <section id="banner" :class="['relative w-full overflow-hidden', containerClass]">
    <!-- 預設背景 -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800"
    ></div>

    <!-- 內容插槽 -->
    <div class="relative z-10 h-full w-full">
      <slot />
    </div>

    <!-- 首頁向下提示 -->
    <Transition name="fade">
      <div
        v-if="showScrollHint"
        class="absolute left-1/2 bottom-8 -translate-x-1/2 flex flex-col items-center z-20 select-none cursor-pointer"
        style="pointer-events: auto"
        @click="scrollPastBanner"
        data-aos="fade-up"
      >
        <span class="animate-bounce text-3xl text-sky-400 dark:text-sky-200">↓</span>
        <span class="mt-1 text-xs text-sky-500 dark:text-sky-200 tracking-wide">向下瀏覽</span>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
