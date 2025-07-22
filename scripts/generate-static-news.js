import fs from 'fs'
import path from 'path'

// 讀取新聞資料
function readNewsData(brand) {
  try {
    const dataPath = path.join(
      process.cwd(),
      'src',
      'data',
      'pageData',
      brand,
      'news',
      'newsData.json',
    )
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return data
  } catch (error) {
    console.warn(`無法讀取 ${brand} 的新聞資料:`, error.message)
    return []
  }
}

// 生成新聞頁面的靜態 HTML
function generateNewsHtml(news, brand) {
  const baseUrl = 'https://crazyclown.online'
  const url =
    brand === 'crazyclown'
      ? `${baseUrl}/news/${news.id}`
      : `${baseUrl}/yuanpinxiang/news/${news.id}`
  const siteName = brand === 'crazyclown' ? 'Crazy Clown' : '源品香'

  // 生成 description
  const title = news.title || ''
  const content = news.content || ''
  const description = `${title} - ${content}`.trim()
  const finalDescription =
    description.length > 160 ? description.substring(0, 157) + '...' : description

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${news.title}</title>
  <meta name="description" content="${finalDescription}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${news.title}" />
  <meta property="og:description" content="${finalDescription}" />
  <meta property="og:image" content="${news.image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${siteName}" />
  <meta property="og:locale" content="zh_TW" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${news.title}" />
  <meta name="twitter:description" content="${finalDescription}" />
  <meta name="twitter:image" content="${news.image}" />

  <!-- 其他 meta -->
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />

  <!-- 重定向到實際的 Vue 應用 -->
  <script>
    window.location.href = '${url}';
  </script>
</head>
<body>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>${news.title}</h1>
    <p>正在載入...</p>
    <p>如果沒有自動跳轉，請 <a href="${url}">點擊這裡</a></p>
  </div>
</body>
</html>`

  return html
}

// 主函數
function main() {
  const brands = ['crazyclown', 'yuanpinxiang']
  const outputDir = path.join(process.cwd(), 'public')

  // 確保輸出目錄存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  brands.forEach((brand) => {
    const newsData = readNewsData(brand)

    newsData.forEach((news) => {
      if (news.id) {
        const html = generateNewsHtml(news, brand)
        const fileName =
          brand === 'crazyclown' ? `news-${news.id}.html` : `yuanpinxiang-news-${news.id}.html`
        const filePath = path.join(outputDir, fileName)

        fs.writeFileSync(filePath, html)
        console.log(`✅ 已生成: ${fileName}`)
      }
    })
  })

  console.log('\n📝 使用說明:')
  console.log('1. 這些靜態 HTML 檔案包含正確的 meta 標籤')
  console.log('2. 訪問這些檔案來測試 Facebook 抓取:')
  console.log('   - https://crazyclown.online/news-1.html')
  console.log('   - https://crazyclown.online/yuanpinxiang-news-1.html')
  console.log('3. 在 Facebook 調試工具中測試這些 URL')
}

main()
