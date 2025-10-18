// Discord 配置
export const DISCORD_CONFIG = {
  // Discord Webhook URL - 請替換為您的實際 Webhook URL
  WEBHOOK_URL: import.meta.env.VITE_DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1429136044271341599/4t36r1PZr7z9E5SbCva5d-Tgb6FXjmgCzdwrhr51PBUWkl-G6QfqhAIHcIHUfUrFYCdy',

  // 通知相關設定
  NOTIFICATION: {
    // 是否啟用 Discord 通知 (預設啟用，除非明確設為 false)
    ENABLED: import.meta.env.VITE_DISCORD_NOTIFICATIONS_ENABLED !== 'false',

    // 通知重試次數
    RETRY_COUNT: 3,

    // 通知重試延遲 (毫秒)
    RETRY_DELAY: 1000
  }
}

// Discord 通知範本
export const DISCORD_TEMPLATES = {
  // 申請提交成功通知標題
  APPLICATION_SUBMITTED_TITLE: '🔔 {nickname}[{pubg_nickname}] 的專屬通知串',

  // 初始通知訊息
  INITIAL_NOTIFICATION: `嗨！<@{discord_user_id}>，您已正式進入審核/考核流程👀。
✅ 請立即完成指定要求，以確保審核/考核順利通過。
📜 考核包括：戰隊DC報到、社群活躍、遊戲內活躍等。
🔔 審核/考核狀態有任何變動，將會在通知串內更新。
🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id={steam_id})」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。`,

  // 狀態變動通知
  STATUS_CHANGE_NOTIFICATION: `嗨！<@{discord_user_id}>，審核/考核狀態有變動🔔。
{changes}
🔍 可前往「[您的審核進度](https://crazyclown.online/join/query?steam_id={steam_id})」頁面查看最新狀態與說明。
❔ 若有任何疑問，可於此通知串內留言詢問。`
}

// 欄位名稱對應表
export const FIELD_NAMES = {
  basic_status: '基本資料審核',
  basic_reasons: '基本資料審核說明',
  game_status: '遊戲資料審核',
  game_reasons: '遊戲資料審核說明',
  supplement_status: '補充資料審核',
  supplement_reasons: '補充資料審核說明',
  joined_clan_dc_status: '是否加入戰隊DC',
  joined_clan_dc_reasons: '加入戰隊DC說明',
  clan_dc_checkin_status: '是否完成戰隊DC報到',
  clan_dc_checkin_reasons: '戰隊DC報到說明',
  joined_official_dc_status: '是否加入官方DC',
  joined_official_dc_reasons: '加入官方DC說明',
  discord_active_status: '社群活躍審核',
  discord_active_reasons: '社群活躍審核說明',
  game_active_status: '遊戲內活躍審核',
  game_active_reasons: '遊戲內活躍審核說明',
  clan_review_status: '戰隊初審',
  clan_review_reasons: '戰隊初審說明',
  official_review_status: '官方複審',
  official_review_reasons: '官方複審說明',
  game_apply_status: '是否於遊戲內送出申請',
  game_apply_reasons: '遊戲內申請說明',
  join_status: '是否完成加入作業',
  join_reasons: '加入作業說明',
  discord_role_status: '是否獲得DC身分組',
  discord_role_reasons: 'DC身分組說明',
  case_status: '整體狀態',
  case_note: '案件備註'
}
