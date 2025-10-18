// PUBG API 查詢服務
// 基於 batch_process.py 的邏輯改寫為 TypeScript

// PUBG API 配置
const PUBG_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2YWE1MTA2MC0yN2UwLTAxM2UtYzVmOS02ZTNkYzVjNjMwMjgiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzQ5NTI5MzM3LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImNyYXp5X2Nsb3duIn0.fyleWTGeMCULRDa2tmllaktFo2AIchbKhTRE2MoM708"

// 支援的平台
const PLATFORMS = {
  "steam": "https://api.pubg.com/shards/steam",
  "pc-na": "https://api.pubg.com/shards/pc-na",
  "pc-eu": "https://api.pubg.com/shards/pc-eu",
  "pc-as": "https://api.pubg.com/shards/pc-as",
  "pc-krjp": "https://api.pubg.com/shards/pc-krjp",
  "pc-sa": "https://api.pubg.com/shards/pc-sa",
  "pc-oc": "https://api.pubg.com/shards/pc-oc",
  "pc-sea": "https://api.pubg.com/shards/pc-sea"
} as const

// 預設平台
const DEFAULT_PLATFORM = "steam"

// API 限制設定
const API_LIMIT_PER_MINUTE = 10
const API_WAIT_TIME = 65 // 等待時間（秒）

// 全域變數追蹤 API 使用情況
let apiRequestCount = 0
let apiResetTime = new Date(Date.now() + 60 * 1000) // 1分鐘後重置

// 類型定義
export interface PlayerData {
  id: string
  name: string
  platform: string
}

export interface PubgApiResponse {
  data: Array<{
    id: string
    attributes: {
      name: string
    }
  }>
}

export interface PubgPlayerResponse {
  data: {
    id: string
    attributes: {
      name: string
    }
  }
}

// 檢查 API 限制
function checkApiLimit(): Promise<void> {
  return new Promise((resolve) => {
    const currentTime = new Date()

    // 如果超過重置時間，重置計數器
    if (currentTime >= apiResetTime) {
      apiRequestCount = 0
      apiResetTime = new Date(Date.now() + 60 * 1000)
    }

    // 如果達到限制，等待
    if (apiRequestCount >= API_LIMIT_PER_MINUTE) {
      console.log(`\n⏳ 已達到 API 限制 (${API_LIMIT_PER_MINUTE} 次/分鐘)`)
      console.log(`⏰ 等待 ${API_WAIT_TIME} 秒後繼續...`)

      setTimeout(() => {
        console.log("\n✅ 等待完成，繼續查詢")
        // 重置計數器
        apiRequestCount = 0
        apiResetTime = new Date(Date.now() + 60 * 1000)
        resolve()
      }, API_WAIT_TIME * 1000)
    } else {
      resolve()
    }
  })
}

// 增加 API 請求計數
function incrementApiCount(): void {
  apiRequestCount++
}

// 發送 HTTP 請求
async function makeRequest(url: string, params?: Record<string, string>): Promise<any> {
  // 檢查 API 限制
  await checkApiLimit()

  try {
    let fullUrl = url
    if (params) {
      const searchParams = new URLSearchParams(params)
      fullUrl += "?" + searchParams.toString()
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PUBG_API_KEY}`,
        'Accept': 'application/vnd.api+json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`❌ 找不到資源 (404): ${url}`)
        return null
      } else if (response.status === 429) {
        console.log(`❌ API 請求過於頻繁 (429)`)
        console.log("⏰ 等待 70 秒後重試...")
        await new Promise(resolve => setTimeout(resolve, 70000))
        return null
      } else {
        console.log(`❌ HTTP 錯誤 ${response.status}`)
        return null
      }
    }

    // 請求成功後增加計數
    incrementApiCount()
    return await response.json()
  } catch (error) {
    console.log(`❌ 請求失敗: ${error}`)
    return null
  }
}

// 透過玩家名稱查詢玩家資訊
export async function getPlayerByName(
  playerName: string,
  platform: keyof typeof PLATFORMS = DEFAULT_PLATFORM
): Promise<PlayerData | null> {
  if (!(platform in PLATFORMS)) {
    platform = DEFAULT_PLATFORM
  }

  const baseUrl = PLATFORMS[platform]
  const url = `${baseUrl}/players`
  const params = { "filter[playerNames]": playerName }

  const data = await makeRequest(url, params)
  if (data && data.data && data.data.length > 0) {
    const player = data.data[0]
    return {
      id: player.id,
      name: player.attributes.name,
      platform
    }
  }
  return null
}

// 透過玩家 ID 查詢玩家資訊
export async function getPlayerById(
  playerId: string,
  platform: keyof typeof PLATFORMS = DEFAULT_PLATFORM
): Promise<PlayerData | null> {
  if (!(platform in PLATFORMS)) {
    platform = DEFAULT_PLATFORM
  }

  const baseUrl = PLATFORMS[platform]
  const url = `${baseUrl}/players/${playerId}`

  const data = await makeRequest(url)
  if (data && data.data) {
    const playerData = data.data
    return {
      id: playerData.id,
      name: playerData.attributes.name,
      platform
    }
  }
  return null
}

// 自動偵測輸入類型
export function detectInputType(userInput: string): 'id' | 'name' {
  if (userInput.startsWith("account.")) {
    return "id"
  }
  return "name"
}

// 搜尋單一玩家
export async function searchSinglePlayer(userInput: string): Promise<{
  success: boolean
  data?: PlayerData
  error?: string
}> {
  const inputType = detectInputType(userInput)

  try {
    if (inputType === "id") {
      const player = await getPlayerById(userInput)
      if (player) {
        return {
          success: true,
          data: player
        }
      } else {
        return {
          success: false,
          error: "未找到該玩家 ID"
        }
      }
    } else {
      const player = await getPlayerByName(userInput)
      if (player) {
        return {
          success: true,
          data: player
        }
      } else {
        return {
          success: false,
          error: "檢查 PUBG 暱稱是否輸入正確"
        }
      }
    }
  } catch (error) {
    return {
      success: false,
      error: "查詢失敗，請稍後再試"
    }
  }
}

// 批次搜尋玩家
export async function batchSearchPlayers(players: string[]): Promise<{
  results: Array<{
    input: string
    success: boolean
    data?: PlayerData
    error?: string
  }>
  summary: {
    total: number
    success: number
    failed: number
    apiUsed: number
  }
}> {
  console.log(`\n🔍 開始批次處理 ${players.length} 筆資料...`)
  console.log(`📊 API 限制: ${API_LIMIT_PER_MINUTE} 次/分鐘`)
  console.log(`📈 當前使用: ${apiRequestCount}/${API_LIMIT_PER_MINUTE}`)
  console.log("=" * 60)

  const results = []

  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    console.log(`📝 處理第 ${i + 1}/${players.length} 筆: ${player}`)

    const result = await searchSinglePlayer(player)
    const resultWithInput = {
      input: player,
      ...result
    }
    results.push(resultWithInput)

    console.log(`   ${result.success ? `✅ ${result.data?.name} (${result.data?.id})` : `❌ ${result.error}`}`)

    // 避免 API 請求過於頻繁（只在未達到限制時）
    if (i < players.length - 1 && apiRequestCount < API_LIMIT_PER_MINUTE) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const successCount = results.filter(r => r.success).length

  console.log("\n" + "=" * 60)
  console.log("📊 批次處理結果總結:")
  console.log("=" * 60)

  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.input} → ${result.success ? `${result.data?.name} (${result.data?.id})` : result.error}`)
  })

  console.log(`\n📈 成功: ${successCount}/${players.length} 筆`)
  console.log(`📉 失敗: ${players.length - successCount}/${players.length} 筆`)
  console.log(`🔢 API 使用: ${apiRequestCount}/${API_LIMIT_PER_MINUTE} 次`)

  // 顯示下次重置時間
  const remainingTime = (apiResetTime.getTime() - Date.now()) / 1000
  if (remainingTime > 0) {
    console.log(`⏰ API 限制重置時間: ${Math.floor(remainingTime)} 秒後`)
  }

  return {
    results,
    summary: {
      total: players.length,
      success: successCount,
      failed: players.length - successCount,
      apiUsed: apiRequestCount
    }
  }
}

// 取得當前 API 使用狀態
export function getApiStatus(): {
  used: number
  limit: number
  resetTime: Date
  remaining: number
} {
  const remaining = Math.max(0, (apiResetTime.getTime() - Date.now()) / 1000)
  return {
    used: apiRequestCount,
    limit: API_LIMIT_PER_MINUTE,
    resetTime: apiResetTime,
    remaining: Math.floor(remaining)
  }
}

// 重置 API 計數器（用於測試）
export function resetApiCounter(): void {
  apiRequestCount = 0
  apiResetTime = new Date(Date.now() + 60 * 1000)
}
