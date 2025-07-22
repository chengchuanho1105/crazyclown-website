import fs from 'fs'
import path from 'path'

// Facebook 快取清理和調試工具
function generateFacebookDebugUrls() {
  const baseUrl = 'https://crazyclown.online'
  const urls = []

  // 添加新聞頁面
  const newsIds = ['1'] // 可以根據實際新聞 ID 擴展

  newsIds.forEach((id) => {
    urls.push(`${baseUrl}/news/${id}`)
    urls.push(`${baseUrl}/yuanpinxiang/news/${id}`)
  })

  // 生成 Facebook 調試 URL
  const debugUrls = urls.map((url) => {
    return `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`
  })

  console.log('🔗 Facebook 調試 URL:')
  debugUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`)
  })

  console.log('\n📝 使用說明:')
  console.log('1. 點擊上面的 URL 進入 Facebook 調試工具')
  console.log('2. 點擊 "Scrape Again" 重新抓取頁面')
  console.log('3. 檢查 meta 標籤是否正確顯示')
  console.log('4. 如果還是不正確，可能需要等待幾分鐘讓快取更新')

  // 生成測試用的 HTML 片段
  const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="測試新聞標題" />
  <meta property="og:description" content="測試新聞描述" />
  <meta property="og:image" content="https://i.meee.com.tw/SEDqQby.jpg" />
  <meta property="og:url" content="https://crazyclown.online/news/1" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Crazy Clown" />
</head>
<body>
  <h1>測試頁面</h1>
  <p>這是一個測試頁面，用於驗證 Facebook 抓取功能。</p>
</body>
</html>
  `

  const testFilePath = path.join(process.cwd(), 'public', 'test-facebook.html')
  fs.writeFileSync(testFilePath, testHtml)

  console.log(`\n📄 測試頁面已生成: ${baseUrl}/test-facebook.html`)
  console.log(
    `🔗 Facebook 調試: https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(`${baseUrl}/test-facebook.html`)}`,
  )
}

generateFacebookDebugUrls()
