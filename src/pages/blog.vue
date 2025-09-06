<script setup lang="ts">
defineOptions({
  name: 'BlogTest',
})
</script>

<template>
  <div class="max-w-5xl mx-auto my-8 p-4 md:p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-lg space-y-8">
    <!-- Blog Start -->

    <!-- 參與條件 -->
    <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> ✅ 參與條件 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 活動截止前，加入 <i class='bi bi-discord text-[#5662f6]'></i> Discord 「 <a href='https://kraftontw.info/Discord'
                target='_blank' class='font-bold text-blue-500 dark:text-blue-300 underline'> PUBG 官方社群 TW/HK </a> 」。
            </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>僅限 STEAM 玩家參加。</p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>3️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 活動期間內，完成「 <a href='#strategy' class='font-bold text-green-500 dark:text-green-300 underline'> 指定任務 </a>
              」。詳細說明請見下方「 <a href='#strategy' class='font-bold text-green-500 dark:text-green-300 underline'> 指定任務攻略建議
              </a>」。 </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>4️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 活動截止前，填寫「 <a href='https://kraftontw.info/KillChallenge52' target='_blank'
                class='font-bold text-blue-500 dark:text-blue-300 underline'> 報名表單 </a> 」。詳細說明請見下方「 <a href='#form'
                class='font-bold text-green-500 dark:text-green-300 underline'> 報名表單填寫建議 </a>」。 </p>
          </div>
        </div>
      </div>
    </div><!-- 活動期間 -->
    <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 📅 活動期間 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>⏰</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>即日起 至 2025/08/10 23:59:59 UTC+08:00 止。</p>
          </div>
        </div>
      </div>
    </div><!-- 活動規則 -->
    <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 📌 活動規則 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>✅</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 遊戲模式：僅限標準模式（含休閒模式），普通對戰／競技對戰，FPP／TPP，單人至四人小隊。 </p>
            <p> 述不接受自定義、街機模式。即須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。 </p>
          </div>
        </div>
      </div>
    </div><!-- 挑戰任務 -->
    <div id='strategy'
      class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 🏹 挑戰任務 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>✅</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>使用 M416 & Kar-98K 對玩家造成擊殺。</p>
          </div>
        </div>
      </div>
    </div><!-- 活動獎勵 -->
    <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 🎁 活動獎勵 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🥇</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>前 10 ：金 G-Coin 寶箱</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🥈</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>11~20 ：銀 G-Coin 寶箱</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🥉</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>21~300 ： 銅 G-Coin 寶箱</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🔆</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>任務獎：鎳 G-Coin 寶箱 (100人)</p>
            <p>參與條件：活動時間內吃雞≥ 1 次，即可參與抽獎。</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🔆</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>參與獎：鐵 G-Coin 寶箱</p>
            <p>領取條件：擊殺玩家數量≥ 1</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🔆</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>NZXT 週邊獎勵：滑鼠墊 1 個<br />
              （可能顏色與照片不同，根據庫存發放不同顏色）</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🔆</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>NZXT 週邊獎勵：NZXT 週邊 6 個 -（IPhone 卡套 & 工具包）</p>
          </div>
        </div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
            <p>平手情況：擊殺量相同，遊戲時長更長者勝。</p>
          </div>
        </div>
      </div>
    </div><!-- 注意事項 -->
    <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> ⚠️ 注意事項 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>本次活動獎勵之實體獎品，得獎者須在名單公布後，於官方人員「止痛藥」透過 Discord 聯繫起一週內提供資料，逾期將視同放棄，請確認已加入台港澳官方 DC 並留意訊息。</p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>實體獎勵因物流問題僅限寄送至台灣地區，本活動禁止出現代領等情況，一經發現將取消獲獎資格。 </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 本次活動 G-Coin 寶箱獎勵發放將在遊戲內發放。<br /> 請在獎勵公告公佈後一週內主動聯繫官方 DC 營運人員，未在名單公佈後一週內聯繫將視同自動放棄獎勵。 </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p> 活動期間內，只要成功完成報名，將自動統計整個活動週期內的相關數據。<br /> 即使您在活動截止前才報名，先前期間的遊戲數據也會納入計算！ </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>活動結束後會儘快公佈獲獎名單。</p>
            <p> 請靜候後續於「⁠ <a href='https://discord.com/channels/907210051792564244/1338803107005468692' target='_blank'
                class='text-blue-500 dark:text-blue-400'> # 🧨丨《官方獎勵公告》 </a> 」頻道發放的公告。<br />
              若您沒有看到對應的公告，即代表該活動獎勵仍在處理流程中。<br /> 社群活動需經統計、審核流程，無法如遊戲內任務般立即發送。<br /> 這也是社群活動一貫的獎勵處理方式，還請各位玩家耐心等候。 </p>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>❗</span>
          <div
            class='space-y-2 flex flex-col pl-2 border-l-2 border-red-500 dark:border-red-400 font-bold text-red-500 dark:text-red-400'>
            <p>活動最終解釋權歸 PUBG 所有。</p>
            <p>本文為攻略建議，僅供參考。本文非官方規則依據，實際內容請以官方公告為準。</p>
            <p>本文為攻略建議，僅供參考。若因參考本文導致數據/領獎異常，恕不負相關責任。</p>
            <p>本文為攻略建議，僅供參考。會視情況進行內容調整，請自行查閱最新內容。</p>
          </div>
        </div>
      </div>
    </div><!-- 任務攻略建議 -->
    <div id='strategy'
      class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 👊 任務攻略建議 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>使用 M416 & Kar-98K 對玩家造成擊殺。</p>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
                <p>2把武器可同時累加擊殺數</p>
              </div>
            </div>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
                <p>建議至少符合一次「擊倒＋擊殺」皆是自己使用指定槍枝完成。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div><!-- 報名表單填寫建議 -->
    <div id='form'
      class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
      <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> ✒️ 報名表單填寫建議 </h2>
      <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
        <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
      </div>
      <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>遊戲暱稱</p>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
                <p>遊戲中前往「生涯 > 概要 > 比賽報告 > 右下角名條中的ID」。</p><img src='https://i.meee.com.tw/7Dxhtbb.png'
                  title='遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID' alt='遊戲畫面：生涯 > 概要 > 比賽報告 > 右下角名條中的ID'
                  class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
              </div>
            </div>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>Steam 數字 ID</p>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
                <p> Steam 數字 ID查詢：前往「 <a href='https://store.steampowered.com/account/' target='_blank'
                    class='text-blue-500 dark:text-blue-400'> Steam 帳戶 </a> 」頁面。 </p>
                <p>Steam 名稱會以較大的字體顯示在頂端，而「數字 ID」會顯示在名稱底下。</p><img src='https://i.meee.com.tw/gj4XvRU.png'
                  title='Steam：Steam 帳戶 > 數字 ID' alt='Steam：Steam 帳戶 > 數字 ID'
                  class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
              </div>
            </div>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
                <p> 填寫時，數字前面需加上「 <code class='select-all'>steam.</code> 」，例如：steam.76561234567890123。 </p>
                <p>填寫參考圖如下：</p><img src='https://i.meee.com.tw/QUbOEvm.png' title='Steam 數字 ID 填寫範例'
                  alt='Steam 數字 ID 填寫範例'
                  class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
              </div>
            </div>
          </div>
        </div>
        <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>3️⃣</span>
          <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
            <p>Discord 暱稱</p>
            <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
              <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
                <p>Discord 前往「使用者設定 > 我的帳號 > 使用者名稱」即為要輸入的資料。</p>
                <p>Discord 使用者名稱 只會出現「0~9」、「_」、「.」。</p>
                <p class='line-through'> 報名表單叫「暱稱」，跟實際要的資料是不同。報名表單應該改叫「使用者名稱」才正確。 </p><img
                  src='https://i.meee.com.tw/2QPvE8N.png' title='Discord：使用者設定 > 我的帳號 > 使用者名稱'
                  alt='Discord：使用者設定 > 我的帳號 > 使用者名稱'
                  class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
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
