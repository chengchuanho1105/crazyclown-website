<script setup lang="ts">
defineOptions({
  name: 'TestPage2'
})
</script>

<template>
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
              target='_blank' class='font-bold text-blue-500 dark:text-blue-300 underline'> PUBG 官方社群 TW/HK </a> 」。 </p>
        </div>
      </div>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>
            為「台灣 / 香港 / 澳門」玩家。詳細說明請見下方「
            <a href='#setting' class='font-bold text-green-500 dark:text-green-300 underline'>
              系統設定建議
            </a>
            」。
          </p>
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
          <p> 活動截止前，填寫「 <a href='https://kraftontw.info/KillChallenge49' target='_blank'
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
          <p>即日起 至 2025/08/11 23:59:59 UTC+08:00 止。</p>
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
          <p> 不接受自定義、街機模式。即須同時符合「一般/競技」、「TPP/FPP」、「單人~四人」之模式。 </p>
        </div>
      </div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>✅</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p> 僅限台港澳 STEAM 玩家參加。 </p>
          <p> 本次活動獎勵僅發放於台港澳地區參與的用戶，只計算在台港澳地區遊玩數據，其他地區用戶遊玩數據不會參與活動計算。 </p>
        </div>
      </div>
    </div>
  </div><!-- 活動任務 -->
  <div id='strategy'
    class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
    <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 📜 活動任務 </h2>
    <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
      <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>✅</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>使用 M416、M249、Mini14、AKM 任一武器擊殺 1 名敵人。</p>
        </div>
      </div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>✅</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>於 Miramar 地圖內的 PUBG × aespa 舞台拍攝截圖並發佈至社群（Facebook、Instagram）平台。</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>❗</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>貼文須設置為公開，且 Facebook 名稱或 Instagram 名稱與截圖內的遊戲暱稱，需與報名表單填寫資訊一致。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>❗</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>若未設為公開、名稱不符，或有盜用他人資訊（帳號、圖片、文字內容）等行為，皆視同未完成任務。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>❗</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>貼文內容需包含：</p>
              <p>1️⃣ 「<code class="select-all">#PUBGxaespa</code>」 標籤</p>
              <p>2️⃣ Miramar aespa 主題截圖</p>
              <p>3️⃣ 顯示遊戲暱稱的截圖（不可遮擋）</p>
            </div>
          </div>
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
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🎁</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>簽名海報 1 張（共 1 名）</p>
        </div>
      </div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🎁</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>周邊商品 10 份（共 10 名）：貼紙 ＆ 鑰匙圈</p>
        </div>
      </div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🎁</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>500 G-coin × 100 份（共 100 名）</p>
        </div>
      </div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>🧧</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>參加獎：鎳 G-Coin 寶箱 1 個</p>
        </div>
      </div>
    </div>
  </div>
  <!-- 注意事項 -->
  <div id='' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
    <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> ⚠️ 注意事項 </h2>
    <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
      <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
    </div>
    <div class='flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>本次活動獎勵之實體獎品，得獎者須在名單公布後，於官方人員「止痛藥」透過 Discord 聯繫起一週內提供資料。</p>
          <p>逾期將視同放棄，請確認已加入台港澳官方 DC 並留意訊息。</p>
          <p>實體獎勵因物流問題僅限寄送至台灣地區，本活動禁止出現代領等情況，一經發現將取消獲獎資格。</p>
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
  </div>
  <!-- 系統設定建議 -->
  <div id='setting'
    class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
    <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'>⚙️ 系統設定建議 </h2>
    <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
      <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
    </div>
    <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>時區 / Windows 顯示語言 / 國家/地區 / 地區格式</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
              <p>請將系統設定為如下所示(以 Windows 11 為例)：</p>
              <p>- 時區：時間與語言 > 日期和時間 > 時區 > 台北</p>
              <p>- Windows 顯示語言：時間與語言 > 區域 > 語言 > 中文(台灣)</p>
              <p>- 國家/地區：時間與語言 > 區域 > 國家/地區 > 台灣</p>
              <p>- 地區格式：時間與語言 > 區域 > 地區格式 > 繁體中文(台灣)</p>
              <img src='https://i.meee.com.tw/0zMq7e9.webp' title='指定貼文範例' alt='指定貼文範例'
                class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
            </div>
          </div>
        </div>
      </div>
    </div>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>加速器 & VPN</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
              <p>加速器一般而言不影響判斷。但少數加速器的運作機制可能會影響。故不建議使用。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
              <p>VPN 運作機制極有可能會影響判斷，建議不要使用，避免出問題。</p>
            </div>
          </div>
        </div>
      </div>
  </div>
  <!-- 任務攻略建議 -->
  <div id='strategy'
    class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
    <h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> 👊 任務攻略建議 </h2>
    <div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'>
      <div class='w-1/2 border-2 border-indigo-400 rounded-full'></div>
    </div>
    <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>使用 M416、M249、Mini14、AKM 任一武器擊殺 1 名敵人。</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>建議只計算「擊倒＋擊殺」皆是自己使用 M416 / M249 / Mini14 / AKM 完成。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>建議多打幾場，避免因為某些因素，導致部分場次資料不被列入計算。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class='space-y-2 flex flex-col text-base text-zinc-800 dark:text-zinc-200'>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>於 Miramar 地圖內的 PUBG × aespa 舞台拍攝截圖並發佈至社群（Facebook、Instagram）平台。</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>遊玩 Miramar ，並在跳傘落地後，前往 aespa 聯名舞台場景，使用截圖功能截圖。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>截圖圖片中須包含個人遊戲暱稱(即遊戲ID)，且該暱稱須與報名表填寫的暱稱相同。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>截圖須清楚、不可模糊。截圖須完整、不可裁切。</p>
              <img src="https://i.meee.com.tw/wY5PwnM.png" alt="截圖須清楚、不可模糊。截圖須完整、不可裁切。" class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl">
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>貼文終須包含Tag：「 <code class='select-all'>#PUBGxaespa</code> 」。請注意Tag的大小寫。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>您發佈的貼文須設置為公開，若未設為公開，視同未完成任務。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>您發佈的貼文中的截圖圖片裡的遊戲 ID 須與報名表填寫的遊戲 ID 相同。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>Facebook 、 Instagram 的 ID 不必與遊戲 ID 相同。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>若名稱不符，或有盜用他人資訊（帳號、圖片、文字內容）等行為，皆視同未完成任務。</p>
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-amber-500 dark:border-amber-400'>
              <p>建議使用 Facebook 發布貼文，Facebook 圖片壓縮較小，較清楚，且不受到長寬比限制。</p>
              <img src="https://i.meee.com.tw/JOxg0s5.png" alt="建議使用 Facebook 發布貼文，Facebook 圖片壓縮較小，較清楚，且不受到長寬比限制。" class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 報名表單填寫建議 -->
  <div id='form' class='p-2 md:p-4 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'>
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
              <p>遊戲中前往「生涯 > 概要 > 比賽報告 > 右下角名條中的ID」。</p>
              <p>填寫的遊戲 ID 須與您發佈的貼文中的截圖圖片裡的遊戲 ID 相同。</p>
              <img src='https://i.meee.com.tw/7Dxhtbb.png'
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
              <p>Discord 使用者名稱 只會出現「0~9」、「a~z」、「_」、「.」。</p>
              <p class='line-through'> 報名表單叫「暱稱」，跟實際要的資料是不同。報名表單應該改叫「使用者名稱」才正確。 </p><img
                src='https://i.meee.com.tw/2QPvE8N.png' title='Discord：使用者設定 > 我的帳號 > 使用者名稱'
                alt='Discord：使用者設定 > 我的帳號 > 使用者名稱'
                class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
            </div>
          </div>
        </div>
      </div>
      <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>4️⃣</span>
        <div class='space-y-2 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'>
          <p>任務 2 貼文連結</p>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
              <p>請貼文後點擊分享功能>複製網址。</p>
              <img
                src='https://i.meee.com.tw/Zf1ykiw.png' title='任務 2 貼文連結'
                alt='任務 2 貼文連結'
                class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
            </div>
          </div>
          <div class='mb-4 space-x-2 flex flex-row'><span class='flex items-start'>📚</span>
            <div class='space-y-2 flex flex-col pl-2 border-l-2 border-green-500 dark:border-green-400'>
              <p>貼文連結只需填寫連結部分，不需要填寫其他文字。</p>
              <p>參考圖如下：</p>
              <img
                src='https://i.meee.com.tw/SbtzIq4.png' title='任務 2 貼文連結'
                alt='任務 2 貼文連結'
                class='w-full h-auto rounded-xl shadow-md shadow-zinc-200 dark:shadow-zinc-900' />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
