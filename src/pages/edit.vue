<script setup lang="ts">
defineOptions({
  name: 'EditPage',
})
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg prose space-y-8 ">
    <!-- start -->
    <!-- 活動期間 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">📅 活動期間</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">⏰</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>2025/10/01 00:00:00 至 2025/08/24 23:59:59 止 (UTC+08:00)。</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 活動任務 -->
    <div id="strategy"
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">🎯 活動任務</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">✅</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>參與者須於活動期間內，符合以下條件，始視為有效：</p>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p>個人使用「ACE32」完成一次擊殺；</p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p>與戰隊成員共同遊玩 經典模式（一般或排位皆可）。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 活動獎勵 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">🎁 任務獎勵</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">🎰</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>於完成任務並通過審核之名單中隨機抽取下列獎項：</p>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p>頭獎（1名）：100 G-Coin；</p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p>二獎（1名）：50 G-Coin；</p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p>三獎（5名）：鐵 G-Coin 寶箱 (最高可開出 3,000 G-Coin)。</p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400">
                  <p>每人限得其中一種獎勵。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 報名方式 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">📝 報名方式</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">✍️</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>請於活動期間內，依下列格式提交資料至活動討論串。</p>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start"></span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400">
                  <p class="select-all border rounded-2xl p-2">
                    1. PUBG 暱稱：<br>
                    2. Steam ID：<br>
                    3. 完成任務截圖：<br>
                  </p>
                  <img
                    class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900"
                    src="https://i.meee.com.tw/67ND4ST.png">
                  <img
                    class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900"
                    src="https://i.meee.com.tw/uLs2R7r.png">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 領獎須知 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">👛 領獎須知</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              請獲獎者於對應活動之獲獎公告發佈後七日內 (D+7)，主動至「⁠
              <a href="https://discord.com/channels/490129931808931840/1389642260936790211" target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline">
                📭⇜客服服務台
              </a>
              」提交以下資料，以完成領獎手續。
            </p>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start"></span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400">
                  <p class="select-all border rounded-2xl p-2">
                    1. PUBG ID：<br>
                    2. Steam 17 ID：<br>
                    3. 活動名稱：<br>
                    4. 獲獎項目：<br>
                    5. 「Discord 社群」活躍紀錄證明：
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              獎勵僅限中獎本人於指定期限內領取，不得轉讓、轉售、兌換現金，亦不得要求變更或折抵其他形式。逾期未完成領獎手續者，視同自動放棄，主辦單位將不再補發。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 注意事項 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">⚠️ 注意事項</h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與本戰隊舉辦之活動者，皆須為「Crazy_Clown 官方戰隊」之有效隊員。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與本戰隊舉辦之活動者，皆須為「
              <a href="https://kraftontw.info/Discord" target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline">
                <i class="bi bi-discord text-[#5662f6]"></i> Crazy_clown 戰隊社群
              </a>
              」及「
              <a href="https://kraftontw.info/Discord" target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline">
                <i class="bi bi-discord text-[#5662f6]"></i> PUBG 官方社群
              </a>
              」之有效成員。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與本戰隊舉辦之活動者，近二週內具「Discord 社群」公開活躍紀錄。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">4️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              近四週內未曾被列入任何一輪汰換候選名單。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">5️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              主辦單位保有活動最終解釋、審核及調整之權利。若因不可抗力或臨時狀況需變更、延期或終止活動，主辦單位將另行公告，並無義務作額外補償。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">6️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與者於活動期間若有任何違規行為，或處於懲處階段，主辦單位得立即取消其參與或獲獎資格，並保留後續處置權利。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">7️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與者所提交之社群或遊戲紀錄，若經審核無法查證、存在疑義，或被認定與活動規則不符，主辦單位有權不予承認。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">8️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>
              參與本活動之同時，即代表參與者已閱讀、理解並同意遵守本活動規則、Crazy_Clown 規範、PUBG 規範。
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- end -->
  </div>
</template>
