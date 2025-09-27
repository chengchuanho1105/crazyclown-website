<script setup lang="ts">
defineOptions({
  name: 'BlogTest',
})
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg space-y-8">
    <!-- Blog Start -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> ✅ 參與條件 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 活動截止前，加入 <i class="bi bi-discord text-[#5662f6]"></i> Discord 「 <a href="https://kraftontw.info/Discord"
                target="_blank" class="font-bold text-blue-500 dark:text-blue-300 underline"> PUBG 官方社群 TW/HK </a> 」。
            </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 為「台灣 / 香港 / 澳門」玩家。詳細說明請見下方「 <a href="#setting"
                class="font-bold text-green-500 dark:text-green-300 underline"> 系統設定建議 </a> 」。 </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 活動期間內，完成「 <a href="#strategy" class="font-bold text-green-500 dark:text-green-300 underline"> 指定任務
              </a> 」。詳細說明請見下方「 <a href="#strategy" class="font-bold text-green-500 dark:text-green-300 underline">
                指定任務攻略建議 </a>」。 </p>
          </div>
        </div>
        <div class="space-x-2 flex flex-row"><span class="flex items-start">4️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 活動截止前，填寫「 <a href="https://kraftontw.info/PUBGxBugatti_Event1" target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline"> 報名表單 </a> 」。詳細說明請見下方「 <a href="#form"
                class="font-bold text-green-500 dark:text-green-300 underline"> 報名表單填寫建議 </a>」。 </p>
          </div>
        </div>
      </div>
    </div><!-- 活動期間 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> 📅 活動期間 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">⏰</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>即日起 至 2025/09/21 23:59:59 UTC+08:00 止。</p>
          </div>
        </div>
      </div>
    </div><!-- 活動規則 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> 📌 活動規則 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">✅</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 遊戲模式：僅限標準模式（含休閒模式），普通對戰／競技對戰，FPP／TPP，單人至四人小隊。 </p>
            <p> 不接受自定義、街機模式。即須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。 </p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">✅</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 僅限台港澳 STEAM 玩家參加。 </p>
            <p> 本次活動獎勵僅發放於台港澳地區參與的用戶，只計算在台港澳地區遊玩數據，其他地區用戶遊玩數據不會參與活動計算。 </p>
          </div>
        </div>
      </div>
    </div><!-- 活動任務 -->
    <div id="strategy"
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> 📜 活動任務 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>累計遊玩 3 日且這 3 日每日遊玩時間 ≥ 1 小時；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>累計遊玩 ≥ 8 場遊戲排名前 10 的對局；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>累計進行 8 場 Miramar 地圖的比賽且每場遊玩時間不低於 5 分鐘；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">4️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>使用 M24 擊殺 ≥ 18 人；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">5️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>使用平底鍋完成一次擊殺；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">6️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>使用 AUG 在同一場對局中擊殺 ≥ 8 人；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">7️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>使用 AUG 完成一次距離 188m 以上的擊殺；</p>
          </div>
        </div>
      </div>
      <div class="flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">8️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>社群分享任務：活動期間於 FB 活動貼文依指定格式留言。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>留言含遊戲暱稱 ＋ 角色與 G-DRAGON 相關截圖。</p>
                <p>社群分享任務不單獨發獎，但完成此任務並完成 7 個任務中任一項，即可參加 1000 G-Coin 抽獎活動！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 活動獎勵 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> 🎁 活動獎勵 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">🎰</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>抽獎獎勵（ 88 人）：1000 G-Coin（30 Days)</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>必須先追隨官方 FB 社群。</p>
                <p>必須至少完成1️⃣~7️⃣任務其中一項。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">🎁</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>活動期間完成1️⃣~7️⃣任務即可升級獎勵！</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">🥇</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>完成其中 5 個任務獎勵：500 G-Coin （ 30 天）</p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">🥉</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>完成其中 3 個任務獎勵：銅 G-Coin 寶箱</p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">🎟️</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>完成其中 1 個任務獎勵：鎳 G-Coin 寶箱</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 注意事項 -->
    <div id=""
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> ⚠️ 注意事項 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>本次獎勵發放將在遊戲內發放。<br> 請在獎勵公告公佈後一週內主動聯繫官方 DC 營運人員，未在名單公佈後一週內聯繫將視同自動放棄獎勵。</p>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>活動期間內，只要成功完成報名，將自動統計整個活動週期內的相關數據。<br> 即使您在活動截止前才報名，先前期間的遊戲數據也會納入計算！</p>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>活動結束後會儘快公佈獲獎名單。<br> 請靜候後續於「⁠ <a
                href="https://discord.com/channels/907210051792564244/1338803107005468692" target="_blank"
                class="text-blue-500 dark:text-blue-400"> # 🧨丨《官方獎勵公告》 </a> 」頻道發放的公告。<br>
              若您沒有看到對應的公告，即代表該活動獎勵仍在處理流程中。<br> 社群活動需經統計、審核流程，無法如遊戲內任務般立即發送。<br> 這也是社群活動一貫的獎勵處理方式，還請各位玩家耐心等候。 </p>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p> 官方社群活動後續獎勵統計、發放、異常處裡說明<br></p>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p> 統計流程<br><span class="ml-4"> 社群活動需經統計、審核流程，無法如遊戲內任務般立即發送。 </span><br><span class="ml-4">
                      這也是社群活動一貫的獎勵處理方式，還請各位玩家耐心等候。 </span></p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p> 發放流程<br><span class="ml-4"> 活動結束後會儘快公佈獲獎名單。 </span><br><span class="ml-4"> 請靜候後續於「 <a
                        href="https://discord.com/channels/907210051792564244/1338803107005468692" target="_blank"
                        class="text-blue-500 dark:text-blue-400"> # 🧨丨《官方獎勵公告》 </a> 」頻道發放的公告。 </span><br><span
                      class="ml-4"> 若您沒有看到對應的公告，即代表該活動獎勵仍在處理流程中。 </span><br><span class="ml-4">
                      社群活動需經統計、審核流程，無法如遊戲內任務般立即發送。 </span><br><span class="ml-4"> 這也是社群活動一貫的獎勵處理方式，還請各位玩家耐心等候。 </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
              <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
                <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
                  <p> 異常處裡<br><span class="ml-4"> 若對應的活動「發佈公告後」，您仍然未收到／收到異常獎勵。 </span><br><span class="ml-4">
                      請於一週內填妥下列訊息，並私訊對應的活動主辦者查詢處裡。 </span><br><span class="ml-4 font-bold">
                      請您先確定是否正確參與對應的活動，並免查詢資源遭到浪費。 </span><br></p><code
                    class="ml-4 p-2 select-all border rounded-2xl"> 參與活動：<br> PUBG ID：<br> Steam ID：<br> 問題描述： </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">❗</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-red-500 dark:border-red-400">
            <p class="font-bold text-red-500 dark:text-red-400"> 本文為攻略建議，僅供參考。此活動最終解釋權歸 PUBG 所有。<br>
              本文為攻略建議，僅供參考。本文非官方評判依據，實際內容請以官方公告為準。<br> 本文為攻略建議，僅供參考。若因參考本文導致數據/領獎異常，恕不負相關責任。<br>
              本文為攻略建議，僅供參考。會視情況進行內容調整，請自行查閱最新內容。 </p>
          </div>
        </div>
      </div>
    </div><!-- 系統設定建議 -->
    <div id="setting"
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">⚙️ 系統設定建議 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>時區 / Windows 顯示語言 / 國家/地區 / 地區格式</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>請將系統設定為如下所示(以 Windows 11 為例)：</p>
                <p>- 時區：時間與語言 &gt; 日期和時間 &gt; 時區 &gt; 台北</p>
                <p>- Windows 顯示語言：時間與語言 &gt; 區域 &gt; 語言 &gt; 中文(台灣)</p>
                <p>- 國家/地區：時間與語言 &gt; 區域 &gt; 國家/地區 &gt; 台灣</p>
                <p>- 地區格式：時間與語言 &gt; 區域 &gt; 地區格式 &gt; 繁體中文(台灣)</p><img src="https://i.meee.com.tw/0zMq7e9.webp"
                  title="指定貼文範例" alt="指定貼文範例"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
        <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
          <p>加速器 &amp; VPN</p>
          <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
            <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
              <p>加速器一般而言不影響判斷。但少數加速器的運作機制可能會影響。故不建議使用。</p>
            </div>
          </div>
          <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
            <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
              <p>VPN 運作機制極有可能會影響判斷，建議不要使用，避免出問題。</p>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 任務攻略建議 -->
    <div id="strategy"
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> 👊 任務攻略建議 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>累計遊玩 3 日且這 3 日每日遊玩時間 ≥ 1 小時。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議採用「生涯 &gt; 對局歷史 &gt; 比賽報告 &gt; 遊玩時間」計算。想保險一點就採用生存時間。</p><img
                  src="https://i.meee.com.tw/pDeIg6N.png" alt="遊戲畫面：生涯 &gt; 對局歷史 &gt; 比賽報告 &gt; 遊玩時間"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>使用各武器 MK-12、Mini-14、SLR、Dragunov 擊殺 ≥ 8人（合計32人）。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>每一種武器皆須達到急殺 ≥ 8 人。<br> 建議只計算「擊倒＋擊殺」皆是自己使用該武器完成。 </p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>累計進行 7 場 Erangel 地圖的比賽且每場遊玩時間不低於 5 分鐘。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議採用「生涯 &gt; 對局歷史 &gt; 比賽報告 &gt; 遊玩時間」計算。想保險一點就採用生存時間。</p><img
                  src="https://i.meee.com.tw/pDeIg6N.png" alt="遊戲畫面：生涯 &gt; 對局歷史 &gt; 比賽報告 &gt; 遊玩時間"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">4️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>計使用指定載具（Coupe RB、Blanc、Zima、皮卡車、UAZ）行駛 8,150m。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>所有載具合併計算。</p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>建議以同一輛載具完成任務。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">5️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>請於社群活動頻道依指定格式成功留言 1 次。</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>圖片內的遊戲暱稱必須與報名表單中的遊戲暱稱相同。</p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>本次活動可接受之截圖場景：<br><span class="ml-4">1. PUBG 遊戲大廳</span><br><span class="ml-4">2. 對局準備時
                    (對局倒數階段)</span><br><span class="ml-4">3. 對局中</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 報名表單填寫建議 -->
    <div id="form"
      class="p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900">
      <div>
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest"> ✒️ 報名表單填寫建議 </h2>
        <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
          <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">1️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>遊戲暱稱</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>填寫的遊戲 ID 須與您發佈的貼文中的截圖圖片裡的遊戲 ID 相同。</p>
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>遊戲中前往「生涯 &gt; 概要 &gt; 比賽報告 &gt; 右下角名條中的ID」。</p><img src="https://i.meee.com.tw/7Dxhtbb.png"
                  alt="遊戲畫面：生涯 &gt; 概要 &gt; 比賽報告 &gt; 右下角名條中的ID"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">2️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>Steam 數字 ID</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>Steam 數字 ID查詢：前往「 <a href="https://store.steampowered.com/account/" target="_blank"
                    class="text-blue-500 dark:text-blue-400"> Steam 帳戶 </a> 」頁面查看。</p>
                <p>Steam 名稱會以較大的字體顯示在頂端，而「數字 ID」會顯示在名稱底下。如下圖所示：</p><img src="https://i.meee.com.tw/gj4XvRU.png"
                  title="Steam：Steam 帳戶 &gt; 數字 ID" alt="Steam：Steam 帳戶 &gt; 數字 ID"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>填寫時，數字前面需加上「 <code class="select-all text-amber-500 dark:text-amber-400">steam.</code>
                  」，例如：steam.76561234567890123。如下圖所示：</p><img src="https://i.meee.com.tw/QUbOEvm.png"
                  title="Steam 數字 ID 填寫範例" alt="Steam 數字 ID 填寫範例"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">3️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>Discord 暱稱</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>Discord 前往「使用者設定 &gt; 我的帳號 &gt; 使用者名稱」即為要輸入的資料。如下圖所示：<br> Discord 使用者名稱 只會出現「0~9」、「a~z」、「_」、「.」。
                </p><img src="https://i.meee.com.tw/2QPvE8N.png" title="Discord：使用者設定 &gt; 我的帳號 &gt; 使用者名稱"
                  alt="Discord：使用者設定 &gt; 我的帳號 &gt; 使用者名稱"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p class="line-through text-red-500 dark:text-red-400"> 報名表單叫「暱稱」，跟實際要的資料是不同。報名表單應該要改成「使用者名稱」才正確。 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200">
        <div class="space-x-2 flex flex-row"><span class="flex items-start">4️⃣</span>
          <div class="space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400">
            <p>Discord 任務 5：活動頻道留言連結</p>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>請於您的留言空白處點擊右鍵，選擇「複製留言連結」。</p><img src="https://i.meee.com.tw/yVi3bXg.png" alt="Discord：任務 5：活動頻道留言連結"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
            <div class="space-x-2 flex flex-row"><span class="flex items-start">📚</span>
              <div class="space-y-4 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400">
                <p>只需填寫連結部分，不需要填寫其他文字。參考圖如下：</p><img src="https://i.meee.com.tw/YqexfUC.png" title="任務 2 貼文連結"
                  alt="任務 2 貼文連結"
                  class="w-full h-auto rounded-xl shadow-md border border-zinc-500/20 dark:border-zinc-400/20 shadow-zinc-200 dark:shadow-zinc-900">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Blog End -->
  </div>
</template>

<style scoped></style>
