<script setup lang="ts">
defineOptions({ name: 'Layout-CrazyClown-Default' })

// ---------- Vue 核心工具函式 ----------
import { useIsHomePage } from '@/composables/useIsHomePage'
import { RouterView } from 'vue-router'

import Banner from '@/components/layouts/Banner.vue'
import Breadcrumb from '@/components/layouts/Breadcrumb.vue'
import Footer from '@/components/layouts/Footer.vue'
import Navbar from '@/components/layouts/navbar/Navbar.vue'

// 判斷是否為首頁
const { isHomePage } = useIsHomePage()
</script>

<template>
  <div class="min-h-screen bg-stone-50 dark:bg-stone-950">
    <header>
      <Navbar />
      <Banner>
        <template v-if="isHomePage">
          <section id="home-hero">
            <div class="bg-white dark:bg-indigo-950 grid h-screen place-content-center">
              <div
                class="mx-auto w-screen max-w-screen-xl px-5 md:grid md:grid-cols-2 md:items-center md:gap-5"
              >
                <div
                  class="w-full flex items-center justify-center mb-10 md:mb-0 rounded-xl"
                  data-aos="zoom-in"
                >
                  <img
                    class="h-[25svh] md:h-[50svh] rounded-xl"
                    src="@/assets/media/logo/crazyclown/logo-light.png"
                    alt=""
                  />
                </div>

                <div class="max-w-prose text-left" data-aos="zoom-in">
                  <h3 class="font-bold text-gray-800 dark:text-gray-400 sm:text-5xl">
                    <span class="text-2xl md:text-4xl text-indigo-800 dark:text-gray-100"
                      >S級戰隊·強者集結</span
                    >
                    <br />
                    <span class="text-3xl md:text-5xl text-indigo-800 dark:text-gray-100"
                      >Crazy_Clown</span
                    >
                    <span class="text-3xl md:text-5xl text-gray-800 dark:text-gray-300"
                      >與您並肩而戰</span
                    >
                  </h3>

                  <p class="mt-4 text-xl text-pretty text-gray-700 dark:text-gray-300">
                    <strong class="text-indigo-700 dark:text-gray-100"
                      >PUBG:Crazy_Clown是你最佳的戰友陣線！</strong
                    ><br />
                    無論你是剛起步的新手，還是久經沙場的老兵，只要你是高活躍玩家，要的就是你！<br />
                  </p>

                  <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:mt-6">
                    <router-link
                      class="inline-block py-3 rounded-lg shadow-sm font-medium text-center border border-yellow-200 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 hover:text-yellow-900 transition-colors"
                      :to="{ name: 'store' }"
                      data-aos="fade-up"
                    >
                      🛒 戰隊特惠
                    </router-link>

                    <router-link
                      class="inline-block py-3 rounded-lg shadow-sm font-medium text-center border border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                      :to="{ name: 'news' }"
                      data-aos="fade-up"
                    >
                      🔥 最新消息
                    </router-link>

                    <router-link
                      class="inline-block py-3 rounded-lg shadow-sm font-medium text-center border border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                      :to="{ name: 'join' }"
                      data-aos="fade-up"
                    >
                      ✒️ 入隊申請
                    </router-link>

                    <a
                      class="inline-block py-3 rounded-lg shadow-sm font-medium text-center border border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                      href=" https://discord.gg/3TEHPZhYUK"
                      data-aos="fade-up"
                    >
                      <i class="bi bi-discord"></i> Discord 社群
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>
        <template v-else>
          <div class="relative w-full h-full bg-black">
            <img
              src="/src/assets/media/og-img/crazyclown/og-img.png"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/40"></div>
            <div class="relative z-10 flex flex-col items-center justify-center h-full">
              <h1 class="text-4xl md:text-6xl font-extrabold text-white"></h1>
              <p class="mt-4 text-lg text-white/80"></p>
            </div>
          </div>
        </template>
      </Banner>
      <Breadcrumb :style="'default'" />
    </header>
    <main>
      <RouterView />
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<style scoped></style>
