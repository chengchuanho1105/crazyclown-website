#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import urllib.request
import urllib.parse
import json
import sys
import time
from datetime import datetime, timedelta

# PUBG API 配置
PUBG_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2YWE1MTA2MC0yN2UwLTAxM2UtYzVmOS02ZTNkYzVjNjMwMjgiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzQ5NTI5MzM3LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6ImNyYXp5X2Nsb3duIn0.fyleWTGeMCULRDa2tmllaktFo2AIchbKhTRE2MoM708"

# 支援的平台
PLATFORMS = {
    "steam": "https://api.pubg.com/shards/steam",
    "pc-na": "https://api.pubg.com/shards/pc-na",
    "pc-eu": "https://api.pubg.com/shards/pc-eu", 
    "pc-as": "https://api.pubg.com/shards/pc-as",
    "pc-krjp": "https://api.pubg.com/shards/pc-krjp",
    "pc-sa": "https://api.pubg.com/shards/pc-sa",
    "pc-oc": "https://api.pubg.com/shards/pc-oc",
    "pc-sea": "https://api.pubg.com/shards/pc-sea"
}

# 預設平台
DEFAULT_PLATFORM = "steam"

# API 限制設定
API_LIMIT_PER_MINUTE = 10
API_WAIT_TIME = 65  # 等待時間（秒）

# 全域變數追蹤 API 使用情況
api_request_count = 0
api_reset_time = datetime.now() + timedelta(minutes=1)

def check_api_limit():
    """檢查 API 限制並等待如果需要"""
    global api_request_count, api_reset_time
    
    current_time = datetime.now()
    
    # 如果超過重置時間，重置計數器
    if current_time >= api_reset_time:
        api_request_count = 0
        api_reset_time = current_time + timedelta(minutes=1)
        print(f"🔄 API 限制已重置，可以繼續查詢")
    
    # 如果達到限制，等待
    if api_request_count >= API_LIMIT_PER_MINUTE:
        wait_seconds = API_WAIT_TIME
        print(f"\n⏳ 已達到 API 限制 ({API_LIMIT_PER_MINUTE} 次/分鐘)")
        print(f"⏰ 等待 {wait_seconds} 秒後繼續...")
        
        while wait_seconds > 0:
            print(f"\r⏱️  倒數: {wait_seconds:2d} 秒", end="", flush=True)
            time.sleep(1)
            wait_seconds -= 1
        
        print(f"\n✅ 等待完成，繼續查詢")
        
        # 重置計數器
        api_request_count = 0
        api_reset_time = datetime.now() + timedelta(minutes=1)

def increment_api_count():
    """增加 API 請求計數"""
    global api_request_count
    api_request_count += 1

def make_request(url, params=None):
    """發送 HTTP 請求"""
    # 檢查 API 限制
    check_api_limit()
    
    try:
        if params:
            url += "?" + urllib.parse.urlencode(params)
        
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {PUBG_API_KEY}")
        req.add_header("Accept", "application/vnd.api+json")
        
        with urllib.request.urlopen(req) as response:
            # 請求成功後增加計數
            increment_api_count()
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"❌ 找不到資源 (404): {url}")
            return None
        elif e.code == 429:  # Too Many Requests
            print(f"❌ API 請求過於頻繁 (429): {str(e)}")
            print("⏰ 等待 70 秒後重試...")
            time.sleep(70)
            return None
        else:
            print(f"❌ HTTP 錯誤 {e.code}: {str(e)}")
            return None
    except Exception as e:
        print(f"❌ 請求失敗: {str(e)}")
        return None

def get_player_by_name(player_name, platform=DEFAULT_PLATFORM):
    """透過玩家名稱查詢玩家資訊"""
    if platform not in PLATFORMS:
        platform = DEFAULT_PLATFORM
    
    base_url = PLATFORMS[platform]
    url = f"{base_url}/players"
    params = {"filter[playerNames]": player_name}
    
    data = make_request(url, params)
    if data and data.get('data') and len(data['data']) > 0:
        player = data['data'][0]
        player_id = player['id']
        player_name = player['attributes']['name']
        return player_id, player_name, platform
    return None, None, None

def get_player_by_id(player_id, platform=DEFAULT_PLATFORM):
    """透過玩家 ID 查詢玩家資訊"""
    if platform not in PLATFORMS:
        platform = DEFAULT_PLATFORM
    
    base_url = PLATFORMS[platform]
    url = f"{base_url}/players/{player_id}"
    
    data = make_request(url)
    if data and data.get('data'):
        player_data = data['data']
        player_name = player_data['attributes']['name']
        return player_name, player_data, platform
    return None, None, None

def detect_input_type(user_input):
    """自動偵測輸入類型"""
    if user_input.startswith("account."):
        return "id"
    else:
        return "name"


def search_single_player(user_input):
    """搜尋單一玩家"""
    input_type = detect_input_type(user_input)
    
    if input_type == "id":
        player_name, _, platform = get_player_by_id(user_input)
        if player_name:
            return f"{user_input} → {player_name} ({user_input})"
        else:
            return f"{user_input} → 未找到"
    else:
        player_id, found_name, platform = get_player_by_name(user_input)
        if player_id and found_name:
            return f"{user_input} → {found_name} ({player_id})"
        else:
            return f"{user_input} → 未找到"

def batch_search_players(batch_input):
    """批次搜尋玩家"""
    global api_request_count, api_reset_time
    
    # 分割輸入，去除空白
    players = [player.strip() for player in batch_input.split('|') if player.strip()]
    
    if not players:
        print("❌ 沒有有效的輸入資料")
        return
    
    print(f"\n🔍 開始批次處理 {len(players)} 筆資料...")
    print(f"📊 API 限制: {API_LIMIT_PER_MINUTE} 次/分鐘")
    print(f"📈 當前使用: {api_request_count}/{API_LIMIT_PER_MINUTE}")
    print("=" * 60)
    
    results = []
    for i, player in enumerate(players, 1):
        print(f"📝 處理第 {i}/{len(players)} 筆: {player}")
        
        result = search_single_player(player)
        results.append(result)
        print(f"   {result}")
        
        # 避免 API 請求過於頻繁（只在未達到限制時）
        if i < len(players) and api_request_count < API_LIMIT_PER_MINUTE:
            time.sleep(0.5)
    
    # 顯示總結
    print("\n" + "=" * 60)
    print("📊 批次處理結果總結:")
    print("=" * 60)
    
    success_count = 0
    for result in results:
        if "→" in result and not result.endswith("未找到"):
            success_count += 1
        print(result)
    
    print(f"\n📈 成功: {success_count}/{len(players)} 筆")
    print(f"📉 失敗: {len(players) - success_count}/{len(players)} 筆")
    print(f"🔢 API 使用: {api_request_count}/{API_LIMIT_PER_MINUTE} 次")
    
    # 顯示下次重置時間
    remaining_time = (api_reset_time - datetime.now()).total_seconds()
    if remaining_time > 0:
        print(f"⏰ API 限制重置時間: {remaining_time:.0f} 秒後")

def print_banner():
    """顯示應用程式標題"""
    print("=" * 60)
    print("🎮 PUBG 批次玩家查詢系統")
    print("=" * 60)
    print("📝 功能選項:")
    print("1. 批次查詢玩家")
    print("2. 退出程式")
    print("=" * 60)

def print_batch_help():
    """顯示批次查詢說明"""
    print("📝 批次查詢使用說明:")
    print("• 輸入多筆資料，用 | 分隔")
    print("• 範例: PlayerName1|PlayerName2|account.123456789")
    print("• 程式會自動判斷是名稱還是 ID")
    print("• 輸入 'back' 返回主選單")

def main():
    """主程式"""
    while True:
        print_banner()
        
        try:
            choice = input("\n請選擇功能 (1-2): ").strip()
            
            if choice == "1":
                # 批次查詢玩家
                while True:
                    print_batch_help()
                    user_input = input("\n請輸入玩家名稱或 ID (用 | 分隔): ").strip()
                    
                    if user_input.lower() == 'back':
                        break
                    
                    if not user_input:
                        print("❌ 輸入不能為空")
                        continue
                    
                    batch_search_players(user_input)
                    print("\n" + "=" * 60)
                    print("批次處理完成！")
                    print("=" * 60)
            
            elif choice == "2":
                print("\n👋 感謝使用 PUBG 批次玩家查詢系統!")
                break
            
            else:
                print("❌ 無效的選項，請重新選擇")
                
        except KeyboardInterrupt:
            print("\n\n👋 再見!")
            sys.exit(0)
        except Exception as e:
            print(f"❌ 發生錯誤: {str(e)}")
            continue

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 再見!")
        sys.exit(0) 