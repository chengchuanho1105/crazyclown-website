import type { PageConfig } from '@/routes/pageConfig/types.ts'

const brandName = 'crazyclown'
const brandDisplayName = 'CrazyClown'

export const pageConfig: PageConfig = {
  name: brandName,
  displayName: brandDisplayName,
  routes: [
    {
      path: '/',
      name: `${brandName}-Home`,
      component: () => import(`@/pages/index.vue`),
      meta: {
        title: `首頁 | ${brandDisplayName}`,
        description:
          'Crazy_Clown 是一個活躍於《PUBG》的玩家戰隊，致力於打造充滿樂趣與團隊合作的遊戲環境。無論你是尋找並肩作戰的夥伴，還是想在每場對戰中盡情表演，Crazy_Clown 都歡迎你的加入。一起享受瘋狂的戰場秀，在每一場對戰中上演瘋狂又精彩的表演，體驗最瘋狂的吃雞旅程！',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin', 'user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: true,
          navbarOrder: 1,
        },
      },
    },
    {
      path: '/about',
      name: `${brandName}-About`,
      component: () => import(`@/pages/about.vue`),
      meta: {
        title: `關於我們 | ${brandDisplayName}`,
        description:
          '認識 Crazy_Clown — 一個熱血又瘋狂的《PUBG》戰隊。我們相信遊戲不只是競技，更是找到歡樂與朋友的地方。了解我們的理念、成員文化與一起吃雞的精彩旅程！',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin', 'user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: true,
          navbarOrder: 2,
        },
      },
    },
    {
      path: '/store',
      name: `${brandName}-Store`,
      component: () => import(`@/pages/store.vue`),
      meta: {
        title: `戰隊特惠 | ${brandDisplayName}`,
        description: 'G-Coin 是 Crazy_Clown 戰隊的獨家貨幣，可以購買戰隊獨享優惠。',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin', 'user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: true,
          navbarOrder: 3,
        },
      },
    },
    {
      path: '/news',
      name: `${brandName}-News`,
      component: () => import(`@/pages/news/index.vue`),
      meta: {
        title: `最新消息 | ${brandDisplayName}`,
        description: '',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin', 'user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: true,
          navbarOrder: 4,
        },
      },
      children: [
        {
          path: ':id',
          name: `${brandName}-News-Detail`,
          component: () => import(`@/pages/news/[id].vue`),
          meta: {
            title: `最新消息詳情 | ${brandDisplayName}`,
            description: '',
            layout: 'default',
            requiresAuth: false,
            roles: ['admin', 'user', 'guest'],
            seo: {
              sitemap: false,
              sitemapXml: false,
              robots: true,
            },
            ui: {
              navbar: false,
            },
          },
        },
      ],
    },
    {
      path: '/join',
      name: `${brandName}-Join`,
      component: () => import(`@/pages/join/index_old.vue`),
      meta: {
        title: `加入我們 | ${brandDisplayName}`,
        description: '',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin', 'user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: true,
          navbarOrder: 4,
        },
      },
      children: [
        {
          path: '/',
          name: `${brandName}-Join`,
          component: () => import(`@/pages/join/index_old.vue`),
          meta: {
            title: `加入我們 | ${brandDisplayName}`,
            description: '',
            layout: 'default',
            requiresAuth: false,
            roles: ['admin', 'user', 'guest'],
            seo: {
              sitemap: true,
              sitemapXml: true,
              robots: true,
            },
            ui: {
              navbar: true,
            },
          },
        },
        {
          path: '/query',
          name: `${brandName}-Join-Query`,
          component: () => import(`@/pages/join/query.vue`),
          meta: {
            title: `審核進度查詢 | ${brandDisplayName}`,
            description: '',
            layout: 'default',
            requiresAuth: false,
            roles: ['admin', 'user', 'guest'],
            seo: {
              sitemap: true,
              sitemapXml: true,
              robots: true,
            },
            ui: {
              navbar: true,
            },
          },
        },
      ],
    },
    {
      path: '/yummy-canned',
      name: `${brandName}-Yummy-Canned`,
      component: () => import(`@/pages/yummy-canned.vue`),
      meta: {
        title: `好吃的罐頭 | ${brandDisplayName}`,
        description:
          '好吃的罐頭',
        layout: 'default',
        requiresAuth: false,
        roles: ['admin'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
        ui: {
          navbar: false,
          navbarOrder: 6,
        },
      },
    },
    {
      path: '/login',
      name: `${brandName}-Login`,
      component: () => import(`@/pages/login.vue`),
      meta: {
        title: `顧客登入 | ${brandDisplayName}`,
        description:
          '登入顧客中心',
        layout: 'blank',
        requiresAuth: false,
        roles: ['user', 'guest'],
        seo: {
          sitemap: true,
          sitemapXml: true,
          robots: true,
        },
        ui: {
          navbar: false,
          navbarOrder: 0,
        },
      },
    },
    {
      path: '/1105admin1123/login',
      name: `${brandName}-Admin-Login`,
      component: () => import(`@/pages/1105admin1123/login.vue`),
      meta: {
        title: `管理員登入 | ${brandDisplayName}`,
        description:
          '登入管理員中心',
        layout: 'blank',
        requiresAuth: false,
        roles: ['admin', 'guest'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
        ui: {
          navbar: false,
          navbarOrder: 0,
        },
      },
    },
    {
      path: '/1105admin1123',
      name: `${brandName}-Admin`,
      component: () => import(`@/pages/1105admin1123/index.vue`),
      meta: {
        title: `管理員 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
      },
    },
    {
      path: '/1105admin1123/inventory',
      name: `${brandName}-Inventory`,
      component: () => import(`@/pages/1105admin1123/inventory.vue`),
      meta: {
        title: `庫存管理 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
      },
    },
    {
      path: '/1105admin1123/price-list',
      name: `${brandName}-Price-List`,
      component: () => import(`@/pages/1105admin1123/price-list.vue`),
      meta: {
        title: `價目表 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/1105admin1123/pages',
      name: `${brandName}-Pages`,
      component: () => import(`@/pages/1105admin1123/pages.vue`),
      meta: {
        title: `頁面內容 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/1105admin1123/news',
      name: `${brandName}-News`,
      component: () => import(`@/pages/1105admin1123/news.vue`),
      meta: {
        title: `新聞管理 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
      },
    },


    {
      path: '/1105admin1123/customers',
      name: `${brandName}-Customers`,
      component: () => import(`@/pages/1105admin1123/customers.vue`),
      meta: {
        title: `用戶管理 | ${brandDisplayName}`,
        description: '',
        layout: 'admin',
        requiresAuth: true,
        roles: ['admin'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
      },
    },
    {
      path: '/customer',
      name: `${brandName}-Customer`,
      component: () => import(`@/pages/customer/index.vue`),
      meta: {
        title: `用戶中心 | ${brandDisplayName}`,
        description: '',
        layout: 'customer',
        requiresAuth: true,
        roles: ['user'],
        seo: {
          sitemap: false,
          sitemapXml: false,
          robots: false,
        },
      },
    },
  ],
}
