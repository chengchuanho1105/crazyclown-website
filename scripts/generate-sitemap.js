import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// 嘗試讀取 .env.local 檔案
function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const envVars = {}

      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
          envVars[key.trim()] = value.trim()
        }
      })

      return envVars
    }
  } catch (error) {
    console.warn('讀取 .env.local 檔案時發生錯誤:', error.message)
  }
  return {}
}

// 載入環境變數
const envLocal = loadEnvLocal()

// Supabase 配置 - 優先使用環境變數，然後是 .env.local
const supabaseUrl = process.env.VITE_SUPABASE_URL || envLocal.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || envLocal.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ 成功載入 Supabase 配置')
} else {
  console.warn('⚠️  缺少 Supabase 環境變數，將使用本地 JSON 檔案作為備用方案')
  console.warn('💡 提示：請檢查 .env.local 檔案或設定環境變數 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

// 從本地 JSON 檔案讀取新聞資料（備用方案）
function readNewsDataFromLocal() {
  try {
    const dataPath = path.join(
      process.cwd(),
      'src',
      'data',
      'pageData',
      'crazyclown',
      'news',
      'newsData.json',
    )
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return data
  } catch (error) {
    console.warn('無法讀取本地新聞資料:', error.message)
    return []
  }
}

// 從 Supabase 讀取新聞資料
async function readNewsDataFromSupabase() {
  if (!supabase) {
    console.log('📁 使用本地 JSON 檔案作為資料來源')
    return readNewsDataFromLocal()
  }

  try {
    const { data, error } = await supabase
      .from('news')
      .select('id')
      .eq('show', true)  // 只取得顯示的新聞
      .order('pin', { ascending: false })
      .order('show_date', { ascending: false })

    if (error) {
      console.warn('從 Supabase 讀取新聞資料時發生錯誤:', error.message)
      console.log('📁 回退到本地 JSON 檔案')
      return readNewsDataFromLocal()
    }

    console.log('📰 從 Supabase 取得新聞資料')
    return data || []
  } catch (error) {
    console.warn('從 Supabase 讀取新聞資料時發生錯誤:', error.message)
    console.log('📁 回退到本地 JSON 檔案')
    return readNewsDataFromLocal()
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
async function main() {
  const urls = []

  // 添加靜態路由
  const staticRoutes = [
    '/',
    '/about',
    '/store',
    '/join',
    '/news',
  ]

  urls.push(...staticRoutes)

  // 添加動態新聞路由
  try {
    const newsData = await readNewsDataFromSupabase()
    newsData.forEach((news) => {
      if (news.id) {
        const url = `/news/${news.id}`
        urls.push(url)
      }
    })

    console.log(`📰 取得 ${newsData.length} 個新聞項目`)
  } catch (error) {
    console.warn('取得新聞資料時發生錯誤:', error.message)
  }

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

main().catch((error) => {
  console.error('生成 sitemap 時發生錯誤:', error)
  process.exit(1)
})
