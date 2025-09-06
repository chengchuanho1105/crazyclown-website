-- 建立 news 表格
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT,
  cover_image_url TEXT,
  author TEXT,
  status TEXT CHECK (status IN ('草稿', '發布', '下架')) DEFAULT '草稿',
  published_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  priority INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_deleted_at ON news(deleted_at);

-- 建立更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入範例資料
INSERT INTO news (
  title,
  slug,
  summary,
  content,
  cover_image_url,
  author,
  status,
  published_at,
  is_pinned,
  tags,
  category,
  priority,
  views_count
) VALUES (
  '【攻略建議】疾馳再度延伸，燃速戰場開戰｜PUBG × Bugatti DC社群活動 Part 2',
  '2025-pubg-x-bugatti-office-dc-event-2',
  '馬力全開，直奔戰場！<br>駕駛 BUGATTI 疾速破圈⚡衝鋒到底，制霸全場！<br>加碼活動升級🚀挑戰極限，贏取豐富獎勵，再次展現你的戰場實力！',
  '<!-- 參與條件 -->
<div id='' class='p-2 md:p-4 space-y-6 border border-zinc-200/20 rounded-xl shadow-sm shadow-zinc-200 dark:shadow-zinc-900'><div><h2 class='text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest'> ✅ 參與條件 </h2><div class='w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full'><div class='w-1/2 border-2 border-indigo-400 rounded-full'></div></div></div><div class='space-y-4 flex flex-col text-base text-zinc-800 dark:text-zinc-200'><div class='space-x-2 flex flex-row'><span class='flex items-start'>1️⃣</span><div class='space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'><p> 活動截止前，加入 <i class='bi bi-discord text-[#5662f6]'></i> Discord 「 <a href='https://kraftontw.info/Discord' target='_blank' class='font-bold text-blue-500 dark:text-blue-300 underline'> PUBG 官方社群 TW/HK </a> 」。 </p></div></div><div class='space-x-2 flex flex-row'><span class='flex items-start'>2️⃣</span><div class='space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'><p> 為「台灣 / 香港 / 澳門」玩家。詳細說明請見下方「 <a href='#setting' class='font-bold text-green-500 dark:text-green-300 underline'> 系統設定建議 </a> 」。 </p></div></div><div class='space-x-2 flex flex-row'><span class='flex items-start'>3️⃣</span><div class='space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'><p> 活動期間內，完成「 <a href='#strategy' class='font-bold text-green-500 dark:text-green-300 underline'> 指定任務 </a> 」。詳細說明請見下方「 <a href='#strategy' class='font-bold text-green-500 dark:text-green-300 underline'> 指定任務攻略建議 </a>」。 </p></div></div><div class='space-x-2 flex flex-row'><span class='flex items-start'>4️⃣</span><div class='space-y-4 flex flex-col pl-2 border-l-2 border-blue-500 dark:border-blue-400'><p> 活動截止前，填寫「 <a href='https://kraftontw.info/PUBGxBugatti_Event2' target='_blank' class='font-bold text-blue-500 dark:text-blue-300 underline'> 報名表單 </a> 」。詳細說明請見下方「 <a href='#form' class='font-bold text-green-500 dark:text-green-300 underline'> 報名表單填寫建議 </a>」。 </p></div></div></div></div>',
  'https://i.meee.com.tw/XOlfNQX.webp',
  '攻略組',
  '發布',
  '2025-08-25 10:30:00+00',
  FALSE,
  ARRAY['PUBG', 'Bugatti', '聯名活動', '超跑', '戰火疾馳', 'BUGATTI'],
  '官方活動',
  0,
  0
) ON CONFLICT (slug) DO NOTHING;

-- 設定 RLS (Row Level Security) 政策
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取已發布且未刪除的新聞
CREATE POLICY "Allow public read published news" ON news
  FOR SELECT USING (status = '發布' AND deleted_at IS NULL);

-- 允許管理員讀取所有新聞
CREATE POLICY "Allow admin read all news" ON news
  FOR SELECT USING (auth.role() = 'authenticated');

-- 允許管理員插入新聞
CREATE POLICY "Allow admin insert news" ON news
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允許管理員更新新聞
CREATE POLICY "Allow admin update news" ON news
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 允許管理員刪除新聞（軟刪除）
CREATE POLICY "Allow admin delete news" ON news
  FOR UPDATE USING (auth.role() = 'authenticated');
