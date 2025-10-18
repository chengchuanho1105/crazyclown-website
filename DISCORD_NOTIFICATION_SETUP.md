# Discord 通知功能設定指南

## 功能說明

此功能會在以下情況自動發送 Discord 通知：

1. **提交申請時**：建立專屬通知串並發送初始通知
2. **審核狀態變動時**：在通知串中發送狀態更新通知

## 設定步驟

### 1. 建立 Discord Webhook

1. 在 Discord 伺服器中，前往「伺服器設定」
2. 選擇「整合」>「Webhook」
3. 點擊「建立 Webhook」
4. 設定 Webhook 名稱和頻道
5. 複製 Webhook URL

### 2. 設定環境變數

在專案根目錄建立 `.env.local` 文件：

```env
# Discord Webhook URL (必填)
VITE_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# 是否啟用 Discord 通知 (可選，預設為 false)
VITE_DISCORD_NOTIFICATIONS_ENABLED=true
```

**注意：** 在 Vite 中，環境變數必須以 `VITE_` 開頭才能在客戶端代碼中使用。

### 3. 重新啟動開發伺服器

```bash
npm run dev
```

## 通知範本

### 申請提交成功通知

**標題：** `🔔 {nickname}[{pubg_nickname}] 的專屬通知串`

**內容：**
```
嗨！{nickname}，您已正式進入審核/考核流程👀。
✅ 請立即完成指定要求，以確保審核/考核順利通過。
📜 考核包括：戰隊DC報到、社群活躍、遊戲內活躍等。
🔔 審核/考核狀態有任何變動，將會在通知串內更新。
🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id={steam_id})」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。
```

### 狀態變動通知

**內容：**
```
嗨！{nickname}，審核/考核狀態有變動🔔。

**{欄位名稱}** 更新為 **{新狀態}**，原因：{說明}。

🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id={steam_id})」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。
```

## 監控的欄位

系統會監控以下欄位的變動：

- 基本資料審核
- 遊戲資料審核
- 補充資料審核
- 是否加入戰隊DC
- 是否完成戰隊DC報到
- 是否加入官方DC
- 社群活躍審核
- 遊戲內活躍審核
- 戰隊初審
- 官方複審
- 是否於遊戲內送出申請
- 是否完成加入作業
- 是否獲得DC身分組
- 整體狀態
- 案件備註

## 故障排除

### 通知沒有發送

1. 檢查環境變數是否正確設定
2. 確認 `VITE_DISCORD_NOTIFICATIONS_ENABLED=true`
3. 檢查 Discord Webhook URL 是否有效
4. 查看瀏覽器控制台是否有錯誤訊息

### 通知格式錯誤

1. 檢查 Discord 頻道是否有足夠的權限
2. 確認 Webhook 設定正確
3. 檢查通知內容是否包含特殊字元

## 自訂通知範本

如需自訂通知範本，請修改 `src/config/discord.ts` 文件中的 `DISCORD_TEMPLATES` 物件。

## 安全性注意事項

1. 請勿將 Webhook URL 提交到版本控制系統
2. 定期更新 Webhook URL
3. 限制 Webhook 的使用權限
