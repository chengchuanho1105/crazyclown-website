# Netlify Edge Functions

## news-meta.ts

為新聞詳情頁動態注入正確的 Open Graph meta 標籤。

### 功能

- 攔截 `/news/:id` 路由的請求
- 從 Supabase 讀取新聞資料
- 動態替換 HTML 中的 meta 標籤（title, description, og:*, twitter:*）
- 支援社群平台爬蟲（Facebook, Twitter, LINE 等）
- 快取 5-10 分鐘以提升效能

### 環境變數

確保在 Netlify Dashboard 中設定以下環境變數：

- `VITE_SUPABASE_URL`: Supabase 專案 URL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名金鑰

### 測試方式

#### 本地測試（需要 Netlify CLI）

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 啟動本地開發伺服器（包含 Edge Functions）
netlify dev
```

#### 線上測試

部署後測試：

```bash
# 測試一般網址
curl -I https://crazyclown.online/news/1

# 模擬 Facebook 爬蟲
curl -A "facebookexternalhit/1.1" https://crazyclown.online/news/1
```

或使用 [Meta 分享偵錯工具](https://developers.facebook.com/tools/debug/)：
1. 輸入網址：`https://crazyclown.online/news/1`
2. 點擊「再次抓取」
3. 檢查 og:url, og:title, og:description, og:image 是否正確

### 如何運作

```
使用者/爬蟲
      ↓
   請求 /news/1
      ↓
Netlify Edge Function (CDN 邊緣)
      ↓
1. 從 Supabase 取得新聞資料
2. 替換 HTML 中的 meta 標籤
3. 返回修改後的 HTML
      ↓
  使用者/爬蟲收到
```

### 效能

- 快取時間：5-10 分鐘
- 冷啟動：~100-200ms
- 熱啟動：~10-20ms
- Netlify 免費方案：每月 300 萬次請求

### 除錯

檢查 Netlify Function Logs：
1. 前往 Netlify Dashboard
2. 選擇你的網站
3. 前往 "Functions" 頁籤
4. 查看 "Edge Functions" 的 logs

