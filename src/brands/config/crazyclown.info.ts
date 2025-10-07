import type { BrandInfoConfig } from '../types'

import logoLight from '@/assets/media/logo/crazyclown/logo-light.png'
import logoDark from '@/assets/media/logo/crazyclown/logo-dark.png'

export const brandInfoConfig: BrandInfoConfig = {
  name: 'crazyclown', // 品牌名稱
  displayName: 'Crazy Clown', // 品牌顯示名稱
  fullName: 'Crazy Clown', // 品牌全名
  shortName: 'Crazy Clown', // 品牌簡稱
  logo: logoLight, // 品牌LOGO
  logoDark: logoDark, // 品牌LOGO（暗色）
  favicon: 'https://crazyclown.online/media/favicon/crazyclown/favicon-light.png', // 品牌FAVICON
  faviconDark: 'https://crazyclown.online/media/favicon/crazyclown/favicon-dark.png', // 品牌FAVICON（暗色）
  primaryColor: '#000000', // 品牌主色
  secondaryColor: '#000000', // 品牌輔色
  accentColor: '#000000', // 品牌強調色
  slogan: '不瘋，不成團', // 品牌口號
  websiteUrl: 'https://crazyclown.online', // 品牌網站
  copyright: 'Chuan Life', // 版權方
  copyrightUrl: 'https://chuan.life', // 版權方Url
  contactEmail: 'pubg.crazyclown.2023@gmail.com', // 聯絡信箱
  paymentMethods: ['bank-transfer', 'cash'], // 付款方式
  language: 'zh-TW', // 語言
  currency: 'TWD', // 貨幣
  social: {
    discord: { name: 'Crazy_Clown', url: 'https://crazyclown.online/dc' },
    line: { id: 'MvNfwjVwKA', name: '銓生活', url: 'https://line.me/R/ti/g/MvNfwjVwKA' },
  },
}
