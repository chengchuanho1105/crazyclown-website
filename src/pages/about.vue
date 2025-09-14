<script setup lang="ts">
defineOptions({ name: 'CrazyClown-About' })

// ---------- 組件引入區（版面用） ----------
import DecorSection from '@/components/DecorSection.vue'
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <DecorSection mainTitle="關於 Crazy_Clown" enTitle="About Crazy_Clown">
      <!-- 戰隊故事 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-4 flex items-center gap-2">
          <i class="bi bi-star-fill"></i> 戰隊故事
        </h2>
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-6 border-l-4 border-indigo-400">
          <p class="text-lg text-zinc-700 dark:text-zinc-200 mb-4">
            Crazy_Clown 戰隊創立於 2023 年，由一群熱愛 PUBG 的玩家共同發起，並於眾多戰隊中脫穎而出，<span class="font-bold text-indigo-600 dark:text-indigo-300">成功成為官方戰隊</span>。
          </p>
          <p class="text-base text-zinc-600 dark:text-zinc-400 mb-4">
            最初，Crazy_Clown 只是幾位好友為了娛樂與交流而組成的小隊，但隨著更多志同道合的成員加入，逐漸發展為一個強調 <span class="font-bold text-indigo-600 dark:text-indigo-300">團隊合作、愉快遊戲氛圍與正向互動</span> 的社群。
          </p>
          <p class="text-base text-zinc-600 dark:text-zinc-400 italic">
            我們相信，電競不僅僅是競爭，更是一種連結彼此、共同成長的方式。
          </p>
        </div>
      </div>

      <!-- 我們的特色 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-6 flex items-center gap-2">
          <i class="bi bi-heart-fill"></i> 我們的特色
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-xl p-6 border-l-4 border-yellow-400 text-center">
            <i class="bi bi-award-fill text-4xl text-yellow-600 dark:text-yellow-400 mb-3"></i>
            <h3 class="text-lg font-bold text-yellow-700 dark:text-yellow-200 mb-2">官方戰隊</h3>
            <p class="text-yellow-800 dark:text-yellow-100 text-sm">獲得官方認可的專業戰隊</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl p-6 border-l-4 border-green-400 text-center">
            <i class="bi bi-activity text-4xl text-green-600 dark:text-green-400 mb-3"></i>
            <h3 class="text-lg font-bold text-green-700 dark:text-green-200 mb-2">活躍戰隊</h3>
            <p class="text-green-800 dark:text-green-100 text-sm">每日活躍，持續成長的社群</p>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-6 border-l-4 border-purple-400 text-center">
            <i class="bi bi-gift-fill text-4xl text-purple-600 dark:text-purple-400 mb-3"></i>
            <h3 class="text-lg font-bold text-purple-700 dark:text-purple-200 mb-2">豐富獎勵</h3>
            <p class="text-purple-800 dark:text-purple-100 text-sm">多樣化的獎勵與福利制度</p>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-xl p-6 border-l-4 border-blue-400 text-center">
            <i class="bi bi-calendar-event text-4xl text-blue-600 dark:text-blue-400 mb-3"></i>
            <h3 class="text-lg font-bold text-blue-700 dark:text-blue-200 mb-2">大量活動</h3>
            <p class="text-blue-800 dark:text-blue-100 text-sm">定期舉辦各類精彩活動</p>
          </div>
          <div class="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 rounded-xl p-6 border-l-4 border-red-400 text-center">
            <i class="bi bi-shop text-4xl text-red-600 dark:text-red-400 mb-3"></i>
            <h3 class="text-lg font-bold text-red-700 dark:text-red-200 mb-2">特惠商店</h3>
            <p class="text-red-800 dark:text-red-100 text-sm">專屬優惠與特價商品</p>
          </div>
          <div class="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900 dark:to-violet-900 rounded-xl p-6 border-l-4 border-indigo-400 text-center">
            <i class="bi bi-people-fill text-4xl text-indigo-600 dark:text-indigo-400 mb-3"></i>
            <h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-200 mb-2">友善社群</h3>
            <p class="text-indigo-800 dark:text-indigo-100 text-sm">溫馨互助的遊戲環境</p>
          </div>
        </div>
      </div>

      <!-- 未來願景 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-indigo-700 dark:text-indigo-200 mb-4 flex items-center gap-2">
          <i class="bi bi-rocket-takeoff"></i> 未來願景
        </h2>
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 rounded-xl p-6 border-l-4 border-indigo-400">
          <p class="text-lg text-zinc-700 dark:text-zinc-200">
            Crazy_Clown 戰隊將持續參與更多官方及社群賽事，爭取亮眼成績的同時，也希望能成為 PUBG 玩家心中<span class="font-bold text-indigo-600 dark:text-indigo-300">最值得信賴、最具歸屬感</span>的戰隊。
          </p>
        </div>
      </div>

    </DecorSection>
  </div>
</template>

<style scoped></style>
