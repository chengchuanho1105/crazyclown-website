# 🚀 Netlify 部署指南

## 📋 部署前檢查清單

### ✅ 環境配置
- [ ] 設定環境變數
- [ ] 配置 API 端點
- [ ] 設定品牌配置
- [ ] 啟用/禁用功能開關

### ✅ 建置配置
- [ ] 更新 `netlify.toml`
- [ ] 配置重定向規則
- [ ] 設定快取策略
- [ ] 配置安全標頭

### ✅ 代碼品質
- [ ] 執行 TypeScript 檢查
- [ ] 執行 ESLint 檢查
- [ ] 執行單元測試
- [ ] 執行 E2E 測試

### ✅ 性能優化
- [ ] 代碼分割
- [ ] 圖片優化
- [ ] 快取策略
- [ ] 壓縮配置

## 🔧 部署步驟

### 1. 本地測試
```bash
# 安裝依賴
npm install

# 執行測試
npm run test

# 類型檢查
npm run type-check

# 本地建置
npm run build

# 預覽建置結果
npm run preview
```

### 2. 環境變數設定

在 Netlify 控制台設定以下環境變數：

```bash
# 生產環境
VITE_APP_ENV=production
VITE_API_URL=https://your-api-domain.com
VITE_BRAND=crazyclown
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# 預覽環境
VITE_APP_ENV=staging
VITE_API_URL=https://staging-api-domain.com
VITE_BRAND=crazyclown
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 3. 自動部署

#### GitHub Actions 部署
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Type check
        run: npm run type-check
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

#### 手動部署
```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 部署
netlify deploy --prod --dir=dist
```

## 🔍 部署後檢查

### ✅ 功能測試
- [ ] 首頁載入正常
- [ ] 路由跳轉正常
- [ ] 後台功能正常
- [ ] API 調用正常
- [ ] 錯誤處理正常

### ✅ 性能檢查
- [ ] 頁面載入速度
- [ ] 資源壓縮情況
- [ ] 快取策略生效
- [ ] CDN 分發正常

### ✅ 安全檢查
- [ ] HTTPS 正常
- [ ] 安全標頭設定
- [ ] CORS 配置正確
- [ ] 敏感信息保護

## 🐛 常見問題

### 1. 建置失敗
```bash
# 檢查 Node.js 版本
node --version

# 清除快取
npm run clean
rm -rf node_modules
npm install

# 重新建置
npm run build
```

### 2. 環境變數問題
```bash
# 檢查環境變數
echo $VITE_API_URL

# 重新部署
netlify deploy --prod --dir=dist
```

### 3. 路由問題
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. API 調用失敗
```typescript
// 檢查 API 配置
console.log('API URL:', import.meta.env.VITE_API_URL)

// 檢查 CORS 配置
fetch('/api/test', {
  mode: 'cors',
  credentials: 'include'
})
```

## 📊 監控和維護

### 性能監控
- 使用 Netlify Analytics
- 配置 Google Analytics
- 監控錯誤率
- 追蹤用戶行為

### 定期維護
- 更新依賴包
- 檢查安全漏洞
- 優化建置配置
- 清理無用代碼

## 🎯 最佳實踐

1. **環境分離**：開發、測試、生產環境分離
2. **自動化部署**：使用 CI/CD 流程
3. **錯誤監控**：配置錯誤追蹤
4. **性能優化**：定期檢查和優化
5. **安全加固**：定期安全檢查
6. **備份策略**：重要數據備份
7. **文檔維護**：保持文檔更新
8. **團隊協作**：建立部署流程 