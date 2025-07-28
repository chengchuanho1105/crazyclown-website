<script setup lang="ts">
defineOptions({ name: 'TestPage' })
</script>

<template>
  <!-- 頁面容器 -->
  <div
    class="max-w-5xl mx-auto my-8 p-4 md:p-6 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-xl shadow-zinc-200 dark:shadow-zinc-900"
  >
    <!-- 參與條件 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        ✅ 參與條件
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">
            <i class="bi bi-1-square-fill"></i>
          </div>
          <div class="space-y-2 flex flex-col">
            <p>
              活動截止前，加入 <i class="bi bi-discord text-[#5662f6]"></i> Discord 「
              <a
                href="https://kraftontw.info/Discord"
                target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline"
              >
                PUBG 官方社群 TW/HK
              </a>
              」。
            </p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">
            <i class="bi bi-2-square-fill"></i>
          </div>
          <div class="flex items-center">
            <span>
              為「台灣 / 香港 / 澳門」玩家。詳細說明請見下方「
              <a href="#" class="font-bold text-green-500 dark:text-green-300 underline">
                系統設定建議 </a
              >」。
            </span>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">
            <i class="bi bi-3-square-fill"></i>
          </div>
          <div class="flex items-center">
            <span>
              活動期間內，完成「
              <a
                href="#"
                target="_blank"
                class="font-bold text-green-500 dark:text-green-300 underline"
              >
                指定任務
              </a>
              」。詳細說明請見下方「
              <a href="#" class="font-bold text-green-500 dark:text-green-300 underline">
                指定任務攻略建議 </a
              >」。
            </span>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">
            <i class="bi bi-4-square-fill"></i>
          </div>
          <div class="flex items-center">
            <span>
              活動截止前，填寫「
              <a
                href="https://kraftontw.info/PUBGxaespaEvent2"
                target="_blank"
                class="font-bold text-blue-500 dark:text-blue-300 underline"
              >
                報名表單
              </a>
              」。詳細說明請見下方「
              <a href="#" class="font-bold text-green-500 dark:text-green-300 underline">
                報名表單填寫建議 </a
              >」。
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 活動期間 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        📅 活動期間
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">
            <i class="bi bi-calendar"></i>
          </div>
          <div class="space-y-2 flex flex-col">
            <p>即日起 至 2025/07/30 23:59:59 UTC+08:00 止。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活動規則 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        📌 活動規則
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">✅</div>
          <div class="space-y-2 flex flex-col">
            <p>
              遊戲模式：僅限標準模式（含休閒模式），普通對戰／競技對戰，FPP／TPP，單人至四人小隊。不接受自定義、街機模式。
            </p>
            <p>即須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">✅</div>
          <div class="space-y-2 flex flex-col">
            <p>僅限台港澳 STEAM 玩家參加。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">✅</div>
          <div class="space-y-2 flex flex-col">
            <p>
              本次活動獎勵僅發放於台港澳地區參與的用戶，只計算在台港澳地區遊玩數據，其他地區用戶遊玩數據不會參與活動計算。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活動任務 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        📜 活動任務
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">1️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計遊玩 3 日，且這 3 日每日遊玩時間 ≥ 1 小時。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">2️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計遊玩 ≥ 5 場遊戲排名前 10 的對局。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">3️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>使用單一武器 Mini 14 or AKM 擊殺 7 人。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">4️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計進行 7 場 Miramar 地圖的比賽且每場遊玩時間不低於 5 分鐘。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">5️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>
              活動期間在 Facebook 或 Instagram 發佈 1 則貼文。 <br />
              貼文需包含：「<code class="select-all">#PUBGxAespa</code>」標籤、Miramar Aespa
              主題截圖，截圖內需顯示個人遊戲暱稱。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活動獎勵 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        🎁 活動獎勵
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">🎰</div>
          <div class="space-y-2 flex flex-col">
            <p>抽獎獎勵 (79人)：2000 G-Coin (30天)</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>🔅 完成 1 個任務即可參與抽獎</p>
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">🥇</div>
          <div class="space-y-2 flex flex-col">
            <p>完成 5 個任務獎勵：500 G-Coin (30天)</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">🥈</div>
          <div class="space-y-2 flex flex-col">
            <p>完成 4 個任務獎勵：銀 G-Coin 寶箱 (30天)</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">🥉</div>
          <div class="space-y-2 flex flex-col">
            <p>完成 3 個任務獎勵：銅 G-Coin 寶箱 (30天)</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">🎟️</div>
          <div class="space-y-2 flex flex-col">
            <p>完成 1 個任務獎勵：鎳 G-Coin 寶箱 (30天)</p>
          </div>
        </div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-amber-500 dark:border-amber-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>在活動期間，可透過任務完成數量，升級獎勵。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>
              本次活動每人最多可獲得 2 個獎勵，其中包含抽獎獎勵。<br />
              例如：完成 5 個任務並中獎，可獲得 500 G-Coin ＋ 2000 G-Coin。
            </p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>若未完成任何任務，將無法獲得獎勵。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 注意事項 -->
    <div
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        ⚠️ 注意事項
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>
              本次獎勵發放將在遊戲內發放。<br />
              請在獎勵公告公佈後一週內主動聯繫官方 DC
              營運人員，未在名單公佈後一週內聯繫將視同自動放棄獎勵。
            </p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>
              活動期間內，只要成功完成報名，將自動統計整個活動週期內的相關數據。<br />
              即使您在活動截止前才報名，先前期間的遊戲數據也會納入計算！
            </p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="space-y-2 flex flex-col">
            <p>活動結束後會儘快公佈獲獎名單。</p>
            <p>
              請靜候後續於「⁠
              <a
                href="https://discord.com/channels/907210051792564244/1338803107005468692"
                target="_blank"
                class="text-blue-500 dark:text-blue-400"
              >
                #🧨丨《官方獎勵公告》
              </a>
              」頻道發放的公告。
            </p>
            <p>若您沒有看到對應的公告，即代表該活動獎勵仍在處理流程中。</p>
            <p>社群活動需經統計、審核流程，無法如遊戲內任務般立即發送。</p>
            <p>這也是社群活動一貫的獎勵處理方式，還請各位玩家耐心等候。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">❗</div>
          <div class="space-y-2 flex flex-col font-bold text-red-600 dark:text-red-200">
            <p>活動最終解釋權歸 PUBG 所有。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">❗</div>
          <div class="space-y-2 flex flex-col font-bold text-red-600 dark:text-red-200">
            <p>本文為攻略建議，僅供參考。本文非官方規則依據，實際內容請以官方公告為準。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">❗</div>
          <div class="space-y-2 flex flex-col font-bold text-red-600 dark:text-red-200">
            <p>本文為攻略建議，僅供參考。若因參考本文導致數據/領獎異常，恕不負相關責任。</p>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">❗</div>
          <div class="space-y-2 flex flex-col font-bold text-red-600 dark:text-red-200">
            <p>本文為攻略建議，僅供參考。會視情況進行內容調整，請自行查閱最新內容。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 系統設定建議 -->
    <div
      id="setting"
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        ⚙️ 系統設定建議
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">1️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>時區 / Windows 顯示語言 / 國家/地區 / 地區格式</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 以 Windows 11 為例：</p>
              <p>📚 時區：時間與語言 > 日期和時間 > 時區 > 台北</p>
              <p>📚 Windows 顯示語言：時間與語言 > 語言與地區 > Windows 顯示語言 > 中文(台灣)</p>
              <p>📚 國家/地區：時間與語言 > 語言與地區 > 國家/地區 > 台灣</p>
              <p>📚 地區格式：時間與語言 > 語言與地區 > 地區格式 > 繁體中文(台灣)</p>
              <img
                src="https://i.meee.com.tw/0zMq7e9.webp"
                title="系統設定建議：時區 / Windows 顯示語言 / 國家/地區 / 地區格式"
                alt="系統設定建議：時區 / Windows 顯示語言 / 國家/地區 / 地區格式"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">2️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>加速器</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 加速器不影響判斷。但少數加速器的運作機制可能會影響。故不建議使用。</p>
              <p>📚 VPN 運作機制可能會影響判斷，建議不要使用，避免出問題。</p>
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">3️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>其他建議事項</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 活動期間至領到獎勵截前，上述設定請保持不變。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 任務攻略建議 -->
    <div
      id="task"
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        👊 任務攻略建議
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">1️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計遊玩 3 日且這 3 日每日遊玩時間≥ 1 小時。</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>
                📚 建議採用「生涯 > 對局歷史 > 比賽報告 > 遊玩時間」計算。想保險一點就採用生存時間。
              </p>
              <p>📚 須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。</p>
              <p>📚 建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
              <img
                src="https://i.meee.com.tw/pDeIg6N.png"
                title="遊戲畫面：生涯 > 對局歷史 > 比賽報告 > 遊玩時間"
                alt="遊戲畫面：生涯 > 對局歷史 > 比賽報告 > 遊玩時間"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">2️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計遊玩 ≥ 5 場遊戲排名前 10 的對局。</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。</p>
              <p>📚 建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">3️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>使用單一武器 Mini 14 or AKM 擊殺 7 人。</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 需使用單一任務要求武器完成擊殺任務</p>
              <p>📚 例如：活動期間使用 Mini 14 擊殺 3 人，使用 AKM 擊殺 4 人，視同未完成任務。</p>
              <p>📚 建議只計算「擊倒＋擊殺」皆是自己使用 Mini 14 or AKM 完成。</p>
              <p>📚 建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">4️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>累計進行 7 場 Miramar 地圖的比賽且每場遊玩時間不低於 5 分鐘。</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。</p>
              <p>📚 建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">5️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>在 Facebook 或 Instagram 發佈 1 則貼文。</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 遊玩 Miramar ，並在跳傘落地後，前往 aespa 聯名主題場景，使用截圖功能截圖。</p>
              <p>📚 截圖圖片中須包含個人遊戲暱稱(即遊戲ID)，且該暱稱須與報名表填寫的暱稱相同。</p>
              <p>📚 截圖須清楚、不可模糊。截圖須完整、不可裁切。</p>
              <p>📚 參考圖如下：</p>
              <img
                src="https://i.meee.com.tw/wY5PwnM.png"
                title="指定內容截圖範例"
                alt="指定內容截圖範例"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
              <p>　</p>
              <p>
                📚 建議使用 Facebook 發布貼文，Facebook 圖片壓縮較小，較清楚，且不受到長寬比限制。
              </p>
              <p>
                📚 貼文終須包含Tag：「
                <code class="select-all">#PUBGxAespa</code>
                」。請注意Tag的大小寫。
              </p>
              <p>📚 您發佈的貼文須設置為公開，若未設為公開，視同未完成任務。</p>
              <p>📚 您發佈的貼文中的截圖圖片裡的遊戲 ID 須與報名表填寫的遊戲 ID 相同。</p>
              <p>📚 Facebook 、 Instagram 的 ID 不必與遊戲 ID 相同。</p>
              <p>
                📚 若名稱不符，或有盜用他人資訊（帳號、圖片、文字內容）等行為，皆視同未完成任務。
              </p>
              <p>📚 參考圖如下：</p>
              <img
                src="https://i.meee.com.tw/wImkqsJ.png"
                title="指定貼文範例"
                alt="指定貼文範例"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 報名表單填寫建議 -->
    <div
      id="form"
      class="p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900"
    >
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">
        ✒️ 報名表單填寫建議
      </h2>
      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>
      <div
        class="mt-4 pl-2 md:pl-4 py-2 space-y-8 border-l-2 border-blue-500 dark:border-blue-400 text-base text-zinc-800 dark:text-zinc-200"
      >
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">1️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>遊戲暱稱</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 遊戲中前往「生涯 > 概要 > 比賽報告 > 右下角名條中的ID」。</p>
              <p>📚 填寫的遊戲 ID 須與您發佈的貼文中的截圖圖片裡的遊戲 ID 相同。</p>
              <img
                src="https://i.meee.com.tw/7Dxhtbb.png"
                title="遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID"
                alt="遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">2️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>Steam 數字 ID</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>
                📚 Steam 數字 ID查詢：前往「
                <a
                  href="https://store.steampowered.com/account/"
                  target="_blank"
                  class="text-blue-500 dark:text-blue-400"
                >
                  Steam 帳戶
                </a>
                」頁面。
              </p>
              <p>📚 Steam 名稱會以較大的字體顯示在頂端，而「數字 ID」會顯示在名稱底下。</p>
              <img
                src="https://i.meee.com.tw/gj4XvRU.png"
                title="遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID"
                alt="遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
              <p>　</p>
              <p>
                📚 填寫時，數字前面需加上「
                <code class="select-all">steam.</code>
                」，例如：steam.76561234567890123。
              </p>
              <p>📚 填寫參考圖如下：</p>
              <img
                src="https://i.meee.com.tw/QUbOEvm.png"
                title="Discord 暱稱填寫範例"
                alt="Discord 暱稱填寫範例"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">3️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>Discord 暱稱</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 Discord 前往「使用者設定 > 我的帳號 > 使用者名稱」即為要輸入的資料。</p>
              <p>📚 Discord 使用者名稱 只會出現「0~9」、「a~z」、「A~Z」、「_」、「.」。</p>
              <img
                src="https://i.meee.com.tw/2QPvE8N.png"
                title="Discord 暱稱填寫範例"
                alt="Discord 暱稱填寫範例"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">4️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>任務 5 貼文連結</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>📚 請貼文後點擊分享功能>複製網址。</p>
              <img
                src="https://i.meee.com.tw/Zf1ykiw.png"
                title="貼文分享功能 > 複製網址"
                alt="貼文分享功能 > 複製網址"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
              <p>　</p>
              <p>📚 貼文連結填寫參考圖如下：</p>
              <img
                src="https://i.meee.com.tw/SbtzIq4.png"
                title="貼文連結填寫參考圖"
                alt="貼文連結填寫參考圖"
                class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-row space-x-2">
          <div class="flex items-start">5️⃣</div>
          <div class="space-y-2 flex flex-col">
            <p>其他建議事項</p>
            <div class="pl-2 py-1 space-y-2 border-l border-green-500 dark:border-green-400">
              <p>
                📚 活動期間至領到獎勵截前，「遊戲ID、Steam 數字 ID、Discord 使用者名稱」請保持不變。
              </p>
              <p>📚 上述填寫的資料如有異動，請立即修改送出或重新填寫。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
