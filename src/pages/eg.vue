<script setup lang="ts">
defineOptions({ name: 'Eg-Page' })
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg">
    <div
      id="task"
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        👊 區塊標題
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>

      <!-- 簡化的巢狀結構 -->
      <div class="gap-2 md:gap-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="gap-2 flex flex-row">
          <span class="flex items-start">1️⃣</span>
          <div
            class="flex flex-col pl-2 gap-2 border-l-2 border-blue-500 dark:border-blue-400 pb-2"
          >
            <p>內容第1層</p>
            <img
              src="https://picsum.photos/1920/1080"
              alt="random image"
              class="w-full h-auto border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
            />
            <div class="gap-2 flex flex-row">
              <span class="flex items-start">1️⃣</span>
              <div
                class="flex flex-col pl-2 gap-2 border-l-2 border-green-500 dark:border-green-400 pb-2"
              >
                <p>內容第2層</p>
                <img
                  src="https://picsum.photos/1920/1080"
                  alt="random image"
                  class="w-full h-auto border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
                />
                <div class="gap-2 flex flex-row">
                  <span class="flex items-start">1️⃣</span>
                  <div
                    class="flex flex-col pl-2 gap-2 border-l-2 border-yellow-500 dark:border-yellow-400 pb-2"
                  >
                    <p>內容第3層</p>
                    <img
                      src="https://picsum.photos/1920/1080"
                      alt="random image"
                      class="w-full h-auto border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
