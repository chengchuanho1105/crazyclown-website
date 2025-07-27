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

// 生成 sitemap XML
function generateSitemapXml(urls) {
  const baseUrl = 'https://crazyclown.online'
  const now = new Date().toISOString()

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  urls.forEach((url) => {
    xml += '  <url>\n'
    xml += `    <loc>${baseUrl}${url}</loc>\n`
    xml += `    <lastmod>${now}</lastmod>\n`
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    xml += '  </url>\n'
  })

  xml += '</urlset>'
  return xml
}

// 主函數
function main() {
  const urls = []

  // 添加靜態路由
  const staticRoutes = [
    '/',
    '/about',
    '/store',
    '/join',
    '/news',
    '/chuanlife',
    '/chuanlife/about',
    '/chuanlife/contact',
    '/chuanlife/services',
    '/chuanlife/news',
    '/yuanpinxiang',
    '/yuanpinxiang/about',
    '/yuanpinxiang/contact',
    '/yuanpinxiang/faq',
    '/yuanpinxiang/media',
    '/yuanpinxiang/news',
    '/yuanpinxiang/product',
    '/yuanpinxiang/product/certification',
    '/yuanpinxiang/product/list',
  ]

  urls.push(...staticRoutes)

  // 添加動態新聞路由
  const brands = ['crazyclown', 'yuanpinxiang']

  brands.forEach((brand) => {
    const newsData = readNewsData(brand)
    newsData.forEach((news) => {
      if (news.id) {
        const url = brand === 'crazyclown' ? `/news/${news.id}` : `/yuanpinxiang/news/${news.id}`
        urls.push(url)
      }
    })
  })

  // 生成 sitemap
  const sitemapXml = generateSitemapXml(urls)

  // 寫入檔案
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  fs.writeFileSync(outputPath, sitemapXml)

  console.log(`✅ 已生成 sitemap，包含 ${urls.length} 個 URL`)
  console.log(`📁 輸出位置: ${outputPath}`)

  // 顯示動態路由數量
  const dynamicRoutes = urls.filter((url) => url.includes('/news/'))
  console.log(`📰 動態新聞路由: ${dynamicRoutes.length} 個`)
}

main()
