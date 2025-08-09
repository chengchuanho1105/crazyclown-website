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
      component: () => import(`@/pages/${brandName}/index.vue`),
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
      component: () => import(`@/pages/${brandName}/about.vue`),
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
      component: () => import(`@/pages/${brandName}/store.vue`),
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
      component: () => import(`@/pages/${brandName}/news/index.vue`),
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
          component: () => import(`@/pages/${brandName}/news/[id].vue`),
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
      component: () => import(`@/pages/${brandName}/join.vue`),
      meta: {
        title: `加入我們 | ${brandDisplayName}`,
        description:
          '想在《PUBG》中找到並肩作戰的夥伴嗎？加入 Crazy_Clown 戰隊，與一群熱血玩家一起歡樂吃雞、互相支援，打造屬於我們的瘋狂戰場！現在就成為我們的一員！',
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
          navbarOrder: 5,
        },
      },
    },
    {
      path: '/admin',
      name: `${brandName}-Admin`,
      component: () => import(`@/pages/admin/index.vue`),
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
      path: '/admin/inventory',
      name: `${brandName}-Inventory`,
      component: () => import(`@/pages/admin/inventory.vue`),
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
      path: '/admin/reservation',
      name: `${brandName}-Reservation`,
      component: () => import(`@/pages/admin/reservation.vue`),
      meta: {
        title: `預訂管理 | ${brandDisplayName}`,
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
      path: '/admin/supabase-test',
      name: `${brandName}-SupabaseTest`,
      component: () => import(`@/pages/admin/supabase-test.vue`),
      meta: {
        title: `Supabase 測試 | ${brandDisplayName}`,
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
      path: '/admin/customers',
      name: `${brandName}-Customers`,
      component: () => import(`@/pages/admin/customers.vue`),
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
      component: () => import(`@/pages/${brandName}/customer/index.vue`),
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
