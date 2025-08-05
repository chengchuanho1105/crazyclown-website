#!/bin/bash

# Netlify 部署腳本
set -e

echo "🚀 開始 Netlify 部署..."

# 檢查環境變數
if [ -z "$NETLIFY_SITE_ID" ]; then
  echo "❌ 錯誤: 未設定 NETLIFY_SITE_ID"
  exit 1
fi

if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  echo "❌ 錯誤: 未設定 NETLIFY_AUTH_TOKEN"
  exit 1
fi

# 安裝依賴
echo "📦 安裝依賴..."
npm ci

# 類型檢查
echo "🔍 執行類型檢查..."
npm run type-check

# 執行測試
echo "🧪 執行測試..."
npm run test

# 建置專案
echo "🔨 建置專案..."
npm run build:netlify

# 檢查建置結果
if [ ! -d "dist" ]; then
  echo "❌ 錯誤: 建置失敗，dist 目錄不存在"
  exit 1
fi

echo "✅ 建置完成"

# 部署到 Netlify
echo "🌐 部署到 Netlify..."
npx netlify-cli deploy --prod --dir=dist --site=$NETLIFY_SITE_ID

echo "🎉 部署完成！" 