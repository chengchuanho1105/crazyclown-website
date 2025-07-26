<template>
  <div class='flex flex-col gap-4'>
    <div
      class='m-4 p-4 bg-sky-100 dark:bg-sky-900 rounded-xl border border-sky-200/30 dark:border-sky-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>✅ 參與要件</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>活動截止前，加入「 <a
          class='text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium space-x-2 inline-flex items-center'
          href='https://kraftontw.info/Discord' target='_blank' rel='noopener'> Discord PUBG官方社群 TW/HK </a> 」。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>活動期間內，完成「 <a
          class='text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium'
          href='#task'> 指定任務 </a> 」。詳細說明請見下方「 <a
          class='text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium'
          href='#task'> 指定任務攻略建議 </a> 」。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>活動截止前，填寫「 <a
          class='text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium'
          href='https://kraftontw.info/PUBGxaespaEvent2' target='_blank' rel='noopener'> 報名表單 </a> 」。詳細說明請見下方「 <a
          class='text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium'
          href='#form'> 報名表單填寫建議 </a> 」。</div>
    </div>
    <div
      class='m-4 p-4 bg-green-100 dark:bg-green-900 rounded-xl border border-green-200/30 dark:border-green-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>📅 活動時間</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>即日起 至
        2025/07/30 23:59 UTC+08:00。</div>
    </div>
    <div
      class='m-4 p-4 bg-orange-100 dark:bg-orange-900 rounded-xl border border-orange-200/30 dark:border-orange-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>📜 活動任務</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        任務1️⃣：活動期間，累計遊玩 3 日，且這 3 日每日遊玩時間 &ge; 1 小時。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        任務2️⃣：活動期間，累計遊玩 &ge; 5 場遊戲排名前 10 的對局。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        任務3️⃣：活動期間，使用單一武器 Mini 14 or AKM 擊殺 7 人。<br />需使用單一任務要求武器完成擊殺任務，例如：活動期間使用 Mini 14 擊殺 3 人，使用 AKM 擊殺 4 人，視同未完成任務。
      </div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        任務4️⃣：活動期間，累計進行 7 場 Miramar 地圖的比賽且每場遊玩時間不低於 5 分鐘。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>任務5️⃣：活動期間，在
        Facebook 或 Instagram 發佈 1 則貼文，貼文需包含：#PUBGxAespa 標籤、Miramar Aespa 主題截圖，截圖內需顯示個人遊戲暱稱。<br />貼文須設置為公開，且 Facebook 名稱或
        Instagram 名稱與截圖內的遊戲暱稱，需與報名表單填寫資訊一致。若未設為公開、名稱不符，或有盜用他人資訊（帳號、圖片、文字內容）等行為，皆視同未完成任務。</div>
    </div>
    <div
      class='m-4 p-4 bg-pink-100 dark:bg-pink-900 rounded-xl border border-pink-200/30 dark:border-pink-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>📌 活動規則</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        遊戲模式：僅限標準模式（含休閒模式），普通對戰／競技對戰，FPP／TPP，單人至四人小隊。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        遊戲模式：不接受自定義、街機模式。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>僅限台港澳 STEAM
        玩家參加。<br />本次活動獎勵僅發放於台港澳地區參與的用戶，只計算在台港澳地區遊玩數據，其他地區用戶遊玩數據不會參與活動計算。<br />本次活動需更改 Windows 系統設定以符合要求，詳細說明請見下方「 <a
          class='text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium'
          href='#'> 系統設定建議 </a> 」。</div>
    </div>
    <div
      class='m-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-xl border border-yellow-200/30 dark:border-yellow-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>🎁 獎勵一覽</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>🎰 抽獎獎勵（ 79
        人）：2000 G-Coin（ 30 天）。在活動期間，完成 1 個任務即可參與抽獎。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>🥇 完成 5
        個任務獎勵：500 G-Coin （ 30 天）</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>🥈 完成 4
        個任務獎勵：銀 G-Coin 寶箱</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>🥉 完成 3
        個任務獎勵：銅 G-Coin 寶箱</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>🎟️ 完成 1
        個任務獎勵：鎳 G-Coin 寶箱</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        在活動期間，可透過任務完成數量，升級獎勵。<br />每人最多可獲得 2 個獎勵，其中包含抽獎獎勵。<br />本次活動獎勵最多可獲得 2 個。<br />範例A：完成 5 個任務並中獎，可獲得 500 G-Coin ＋
        2000 G-Coin。<br />範例B：完成 5 個任務並未中獎，可獲得 500 G-Coin ＋ 銀 G-Coin寶箱。 <br />若未完成任何任務，將無法獲得獎勵。</div>
    </div>
    <div
      class='m-4 p-4 bg-amber-100 dark:bg-amber-900 rounded-xl border border-amber-200/30 dark:border-amber-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>⚠️ 注意事項</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        本次獎勵發放將在遊戲內發放，請在獎勵公告公佈後一週內主動聯繫官方 DC 營運人員，未在名單公佈後一週內聯繫將視同自動放棄獎勵。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        活動期間內，只要成功完成報名，將自動統計整個活動週期內的相關數據。即使您在活動截止前才報名，先前期間的遊戲數據也會納入計算！</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        活動結束後會儘快公佈獲獎名單。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>活動最終解釋權歸 PUBG
        所有。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>❗
        本文為攻略建議，僅供參考，非官方規則依據，實際內容請以官方公告為準。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>❗
        本文為攻略建議，僅供參考，若因參考本文導致領獎異常，恕不負相關責任。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>❗
        本文為攻略建議，僅供參考，本文屬非正式攻略建議，參與細節請依官方活動組公告說明為準。</div>
    </div>
    <div id='task'
      class='m-4 p-4 bg-orange-100 dark:bg-orange-900 rounded-xl border border-orange-200/30 dark:border-orange-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>👊 指定任務攻略建議 <span
          class='text-sm'>(採最保險算法)</span></h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>任務1：活動期間，累計遊玩
        3 日且這 3 日每日遊玩時間&ge; 1 小時。<br />- 📚 遊玩時間計算：從階段1圈出現後開始計算，且建議排除觀看時間。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>任務2：活動期間，累計遊玩
        &ge; 5 場遊戲排名前 10 的對局。<br />- 📚 無特別建議。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        任務3：活動期間，使用單一武器 Mini 14 or AKM 擊殺 7 人。<br />- 📚 擊殺人數計算建議：使用 Mini 14 / AKM ，二把武器各擊倒且擊殺 7 人以上。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>任務4：活動期間，累計進行
        7 場 Miramar 地圖的比賽且每場遊玩時間不低於 5 分鐘。<br />- 📚 遊玩時間計算建議：從階段1圈出現後開始計算，且建議排除觀看時間。</div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>任務5：活動期間在
        Facebook 或 Instagram 發佈 1 則貼文。<br />- 📚 遊玩 Miramar ，並在跳傘落地後，前往 aespa 聯名主題場景，使用截圖功能截圖。<br />- 📚
        截圖中須包含個人遊戲暱稱。<br />- 📚 截圖須清楚、不可模糊。截圖須完整、不可裁切。<br /><img class='w-full rounded-lg shadow'
          src='https://i.meee.com.tw/wY5PwnM.png' alt='' /> <br />- 📚 貼文終須包含Tag：「#PUBGxAespa」，請注意Tag的大小寫。<br />- 📚
        貼文須設置為公開。<br />- 📚 貼文ID不必與遊戲ID相同。<br /><img class='w-full rounded-lg shadow'
          src='https://i.meee.com.tw/wImkqsJ.png' alt='' /></div>
    </div>
    <div id='form'
      class='m-4 p-4 bg-orange-100 dark:bg-orange-900 rounded-xl border border-orange-200/30 dark:border-orange-700/30 shadow-lg'>
      <h2 class='mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100'>✒️ 報名表單填寫建議</h2>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        <h3 class='text-lg font-bold text-zinc-900 dark:text-zinc-100'>遊戲暱稱</h3>
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 遊戲中前往「<strong><u>生涯頁面</u></strong>」 &gt;
          點擊「<strong><u>概要</u></strong>」頁籤 &gt; 右下角名條中的ID即為您的「<strong><u>遊戲暱稱</u></strong>」。<br /><img
            class='w-full rounded-lg shadow' src='https://i.meee.com.tw/s3UfpUq.png' alt='' /></p>
      </div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        <h3 class='text-lg font-bold text-zinc-900 dark:text-zinc-100'>Steam 數字 ID</h3>
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 <strong>Steam 數字 ID查詢：</strong>前往「 <a
            class='text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium'
            target='_blank' rel='noopener'>Steam 帳戶 </a> 」頁面，Steam 名稱會以較大的字體顯示在頂端，而「數字 ID」會顯示在名稱底下。</p><img
          class='w-full rounded-lg shadow' src='https://i.meee.com.tw/Yms3wYj.png' alt='' /> <br />
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 Discord 暱稱 填寫範例：</p>
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 數字前面需加上
          [<strong><u>steam.</u></strong>]，例如：<strong><u>steam.76561234567890123</u></strong></p><img
          class='w-full rounded-lg shadow' src='https://i.meee.com.tw/QUbOEvm.png' alt='' />
      </div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        <h3 class='text-lg font-bold text-zinc-900 dark:text-zinc-100'>Discord 暱稱</h3>
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 Discord 開啟「<strong><u>使用者設定</u></strong>」 &gt;
          點擊「<strong><u>我的帳號</u></strong>」頁籤 &gt; 「<strong><u>使用者名稱</u></strong>」即為要輸入的資料。</p><img
          class='w-full rounded-lg shadow' src='https://i.meee.com.tw/2QPvE8N.png' alt='' /> <br />
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 Discord 暱稱 填寫範例：</p><img class='w-full rounded-lg shadow'
          src='https://i.meee.com.tw/Ybr5YfI.png' alt='' />
      </div>
      <div class='mx-2 my-4 p-2 bg-white/90 dark:bg-black/10 rounded-lg text-zinc-900 dark:text-zinc-100'>
        <h3 class='text-lg font-bold text-zinc-900 dark:text-zinc-100'>任務 5 貼文連結</h3>
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 請貼文後點擊分享功能&gt;複製網址。</p><img class='w-full rounded-lg shadow'
          src='https://i.meee.com.tw/Zf1ykiw.png' alt='' /> <br />
        <p class='text-zinc-900 dark:text-zinc-100'>- 📚 貼文連結填寫範例：</p><img class='w-full rounded-lg shadow'
          src='https://i.meee.com.tw/SbtzIq4.png' alt='' />
      </div>
    </div>
  </div>
</template>
