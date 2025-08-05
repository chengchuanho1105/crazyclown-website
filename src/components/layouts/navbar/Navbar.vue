<script setup lang="ts">
defineOptions({ name: 'AppNavbar' })
import { onMounted, onUnmounted, ref } from 'vue'
import Actions from './Actions.vue'
import Brand from './Brand.vue'
import Links from './Links.vue'
import MobileMenu from './MobileMenu.vue'

const mobileMenuRef = ref<InstanceType<typeof MobileMenu>>()

// 控制 navbar 顯示狀態
const isVisible = ref(true)
const lastScrollY = ref(0)

// 處理滾動事件
const handleScroll = () => {
  const currentScrollY = window.scrollY

  // 如果滾動距離小於 100px，始終顯示 navbar
  if (currentScrollY < 100) {
    isVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }

  // 向下滾動時隱藏，向上滾動時顯示
  if (currentScrollY > lastScrollY.value) {
    // 向下滾動
    isVisible.value = false
  } else {
    // 向上滾動
    isVisible.value = true
  }

  lastScrollY.value = currentScrollY
}

// 組件掛載時添加滾動監聽器
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// 組件卸載時移除滾動監聽器
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    :class="[
      'fixed top-0 z-50 w-full h-16 bg-white/50 dark:bg-black/50 backdrop-blur-lg transition-all duration-500 shadow-lg',
      isVisible ? 'translate-y-0' : '-translate-y-full',
    ]"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <Brand />

        <!-- 桌面版導航連結 -->
        <Links />

        <!-- 桌面版用戶操作 -->
        <div class="hidden lg:block">
          <Actions />
        </div>

        <!-- 手機版選單 -->
        <MobileMenu ref="mobileMenuRef" />
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
