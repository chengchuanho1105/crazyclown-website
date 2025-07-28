import fs from 'fs'

// 讀取HTML文件並處理
function flattenHtml(inputFile, outputFile) {
  try {
    // 讀取HTML文件
    const htmlContent = fs.readFileSync(inputFile, 'utf8')

    // 拍扁HTML：移除換行符、多餘空格，並將雙引號替換為單引號
    const flattenedHtml = htmlContent
      .replace(/\s+/g, ' ') // 將多個空白字符替換為單個空格
      .replace(/>\s+</g, '><') // 移除標籤之間的空白
      .replace(/"/g, "'") // 將雙引號替換為單引號
      .trim() // 移除首尾空白

    // 寫入txt文件
    fs.writeFileSync(outputFile, flattenedHtml, 'utf8')

    console.log(`✅ 處理完成！`)
    console.log(`📁 輸入文件: ${inputFile}`)
    console.log(`📁 輸出文件: ${outputFile}`)
    console.log(`📊 原始大小: ${htmlContent.length} 字符`)
    console.log(`📊 處理後大小: ${flattenedHtml.length} 字符`)
    console.log(`📊 壓縮率: ${((1 - flattenedHtml.length / htmlContent.length) * 100).toFixed(2)}%`)
  } catch (error) {
    console.error('❌ 處理文件時發生錯誤:', error.message)
  }
}

// 主函數
function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log('使用方法: node flatten-html.js <輸入HTML文件> [輸出TXT文件]')
    console.log('例如: node flatten-html.js src/pages/test.vue')
    console.log('例如: node flatten-html.js src/pages/test.vue output.txt')
    return
  }

  const inputFile = args[0]
  const outputFile = args[1] || inputFile.replace(/\.(vue|html)$/, '.flattened.txt')

  // 檢查輸入文件是否存在
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 輸入文件不存在: ${inputFile}`)
    return
  }

  flattenHtml(inputFile, outputFile)
}

// 如果直接運行此腳本
main()
