# 🚀 部署指南

## Edge Functions 部署檢查清單

### 1. ✅ 已完成的設定

- [x] 建立 Edge Function 檔案 (`netlify/edge-functions/news-meta.ts`)
- [x] 更新 `netlify.toml` 配置
- [x] 建立說明文件

### 2. 📋 部署前檢查

#### A. Netlify 環境變數

確保在 **Netlify Dashboard** 中設定以下環境變數：

1. 前往：https://app.netlify.com/
2. 選擇你的網站
3. 前往 `Site configuration` → `Environment variables`
4. 確認有以下變數：
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`

> **注意**：Edge Functions 會使用這些環境變數來連接 Supabase

#### B. Git Commit & Push

```bash
# 確認變更
git status

# 提交變更
git add .
git commit -m "feat: 新增 Edge Functions 動態注入新聞 SEO meta 標籤

- 建立 news-meta Edge Function
- 從 Supabase 動態讀取新聞資料
- 在 CDN 邊緣注入正確的 og:* 和 twitter:* meta 標籤
- 支援社群平台爬蟲（Facebook, Twitter, LINE）
- 快取 5-10 分鐘以提升效能"

# 推送到 GitHub
git push origin main
```

#### C. Netlify 自動部署

推送後，Netlify 會自動：
1. 偵測到新的 commit
2. 開始構建專案
3. 部署 Edge Functions
4. 更新網站

查看部署狀態：https://app.netlify.com/

### 3. 🧪 測試部署結果

#### A. 測試 Edge Function 是否運作

等待部署完成後（約 2-5 分鐘），執行：

```bash
# 測試一般請求
curl -I https://crazyclown.online/news/1

# 檢查是否有 Edge Function header（可選）
curl -v https://crazyclown.online/news/1 2>&1 | grep -i "x-nf"
```

#### B. 測試 Meta 標籤

使用瀏覽器開發者工具：

1. 前往：https://crazyclown.online/news/1
2. 按 F12 開啟開發者工具
3. 在 Console 輸入：
```javascript
console.log(document.querySelector('meta[property="og:url"]').content);
console.log(document.querySelector('meta[property="og:title"]').content);
console.log(document.querySelector('meta[property="og:image"]').content);
```

#### C. 測試社群分享

**Meta（Facebook）分享偵錯工具**：
1. 前往：https://developers.facebook.com/tools/debug/
2. 輸入：`https://crazyclown.online/news/1`
3. 點擊「再次抓取」
4. 檢查結果：
   - ✅ `og:url` 應該是 `https://crazyclown.online/news/1`
   - ✅ `og:title` 應該是新聞標題
   - ✅ `og:image` 應該是新聞圖片
   - ✅ `og:description` 應該是新聞描述

**Twitter Card Validator**：
1. 前往：https://cards-dev.twitter.com/validator
2. 輸入網址測試

**LINE 測試**：
- 直接在 LINE 中貼上連結，查看預覽

### 4. 📊 監控 Edge Function

#### A. 查看執行日誌

1. 前往 Netlify Dashboard
2. 選擇網站
3. 前往 `Functions` 頁籤
4. 查看 `Edge Functions` 區塊
5. 點擊 `news-meta` 查看詳細資訊

#### B. 檢查執行統計

- 請求數量
- 平均回應時間
- 錯誤率

### 5. 🐛 常見問題排查

#### 問題 1：Facebook 還是抓到舊的 meta

**原因**：Facebook 快取

**解決方法**：
1. 前往 Meta 分享偵錯工具
2. 點擊「再次抓取」
3. 等待 1-2 分鐘

#### 問題 2：Edge Function 沒有執行

**檢查清單**：
- [ ] `netlify.toml` 中 `[[edge_functions]]` 設定正確
- [ ] Edge Function 檔案路徑正確：`netlify/edge-functions/news-meta.ts`
- [ ] 環境變數已在 Netlify Dashboard 設定
- [ ] 部署成功（查看 Netlify Deploy Log）

**除錯步驟**：
1. 查看 Netlify Deploy Log，搜尋 "edge function"
2. 查看 Function Logs，尋找錯誤訊息
3. 確認 Supabase 連線正常

#### 問題 3：Supabase 連線失敗

**檢查**：
1. 環境變數拼寫正確（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）
2. Supabase 專案狀態正常
3. API Key 沒有過期

### 6. 🎉 完成！

部署成功後：
- ✅ 新聞頁面會有正確的 SEO meta 標籤
- ✅ Facebook/Twitter/LINE 分享會顯示正確資訊
- ✅ 新文章發布後立即生效（無需重新 build）
- ✅ 效能極佳（CDN 邊緣執行）

---

## 需要幫助？

- [Netlify Edge Functions 文件](https://docs.netlify.com/edge-functions/overview/)
- [Supabase 文件](https://supabase.com/docs)
- [Meta 分享偵錯工具](https://developers.facebook.com/tools/debug/)

