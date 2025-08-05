import { BRANDS, MAIN_BRAND } from '@/brands'
import generatedRoutes from 'virtual:generated-pages'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { PAGE_CONFIGS } from '@/routes'
import type { PageRoute } from '@/routes/pageConfig/types'

// 從 pageConfig 中尋找對應路由的 layout 資訊
function findLayoutFromPageConfig(path: string, brand: string): string | undefined {
  const pageConfig = PAGE_CONFIGS[brand as keyof typeof PAGE_CONFIGS]
  if (!pageConfig?.routes) return undefined

  // 移除品牌前綴
  const normalizedPath = path.startsWith(`/${brand}`) ? path.replace(`/${brand}`, '') || '/' : path

  // 遞迴尋找對應的路由配置
  function findRoute(routes: PageRoute[], targetPath: string): PageRoute | undefined {
    for (const route of routes) {
      // 處理動態路由參數
      const routePath = route.path
      const targetPathParts = targetPath.split('/')
      const routePathParts = routePath.split('/')

      // 如果路徑段數不同，跳過
      if (targetPathParts.length !== routePathParts.length) {
        continue
      }

      // 比對路徑段
      let isMatch = true
      for (let i = 0; i < routePathParts.length; i++) {
        const routePart = routePathParts[i]
        const targetPart = targetPathParts[i]

        // 如果是動態參數（以 : 開頭），則匹配任何值
        if (routePart.startsWith(':')) {
          continue
        }

        // 否則必須完全匹配
        if (routePart !== targetPart) {
          isMatch = false
          break
        }
      }

      if (isMatch) {
        return route
      }

      if (route.children) {
        const found = findRoute(route.children, targetPath)
        if (found) return found
      }
    }
    return undefined
  }

  const matchedRoute = findRoute(pageConfig.routes, normalizedPath)
  return matchedRoute?.meta?.layout
}

// 將 vite-plugin-pages 產生的 routes 依品牌包裝
function wrapBrandRoutes(routes: RouteRecordRaw[], mainBrand: string, brands: string[]) {
  const brandRoutes = []

  for (const brand of brands) {
    if (brand === mainBrand) {
      // 主品牌：包含根路徑（/）開頭的所有路由
      brandRoutes.push(
        ...routes
          .filter((r) => !brands.some((b) => b !== mainBrand && r.path.startsWith(`/${b}`)))
          .map((r) => {
            // 從 pageConfig 中尋找 layout 資訊
            const layout = findLayoutFromPageConfig(r.path, brand)
            return {
              ...r,
              meta: {
                ...r.meta,
                brand,
                layout: layout || r.meta?.layout || 'default'
              },
            }
          }),
      )
    } else {
      // 其他品牌加上品牌前綴
      brandRoutes.push(
        ...routes
          .filter((r) => r.path.startsWith(`/${brand}`))
          .map((r) => {
            // 從 pageConfig 中尋找 layout 資訊
            const layout = findLayoutFromPageConfig(r.path, brand)
            return {
              ...r,
              path: `/${brand}${r.path.replace(`/${brand}`, '')}`,
              meta: {
                ...r.meta,
                brand,
                layout: layout || r.meta?.layout || 'default'
              },
            }
          }),
      )
    }
  }
  return brandRoutes
}

const routes = wrapBrandRoutes(generatedRoutes, MAIN_BRAND, BRANDS)

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router
