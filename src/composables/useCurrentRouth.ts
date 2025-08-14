import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BRANDS, MAIN_BRAND } from '@/brands'
import { PAGE_CONFIGS } from '@/routes'
import type { PageRoute } from '@/routes/pageConfig/types'

/**
 * 當前路由資訊管理
 * 提供當前路徑的詳細資訊，包括品牌、路徑、參數、查詢等
 */
export function useCurrentRoute() {
  const route = useRoute()
  const router = useRouter()

  // 當前品牌 key
  const brandKey = computed(() => route.meta?.brand || route.params?.brand || MAIN_BRAND)

  // 當前完整路徑
  const fullPath = computed(() => route.fullPath)

  // 當前路徑（不含查詢參數）
  const path = computed(() => route.path)

  // 當前路徑名稱
  const name = computed(() => route.name as string)

  // 當前路徑參數
  const params = computed(() => route.params)

  // 當前查詢參數
  const query = computed(() => route.query)

  // 當前路徑 hash
  const hash = computed(() => route.hash)

  // 當前路徑 meta 資訊
  const meta = computed(() => route.meta)

  // 當前路徑標題
  const title = computed(() => route.meta?.title as string)

  // 當前路徑描述
  const description = computed(() => route.meta?.description as string)

  // 當前路徑 layout
  const layout = computed(() => route.meta?.layout as string)

  // 是否需要認證
  const requiresAuth = computed(() => route.meta?.requiresAuth as boolean)

  // 所需角色
  const roles = computed(() => route.meta?.roles as string[])

  // 是否為主品牌
  const isMainBrand = computed(() => brandKey.value === MAIN_BRAND)

  // 品牌首頁 URL
  const homepageUrl = computed(() => (isMainBrand.value ? '/' : `/${brandKey.value}`))

  // 品牌路徑前綴
  const brandPathPrefix = computed(() => (isMainBrand.value ? '' : `/${brandKey.value}`))

  // 相對路徑（移除品牌前綴）
  const relativePath = computed(() => {
    if (isMainBrand.value) return path.value
    const brandPrefix = `/${brandKey.value}`
    return path.value.startsWith(brandPrefix) ? path.value.replace(brandPrefix, '') || '/' : path.value
  })

  // 路徑段
  const pathSegments = computed(() => {
    const segments = relativePath.value.split('/').filter(Boolean)
    return segments
  })

  // 路徑深度
  const pathDepth = computed(() => pathSegments.value.length)

  // 父路徑
  const parentPath = computed(() => {
    if (pathDepth.value <= 1) return homepageUrl.value
    const segments = pathSegments.value.slice(0, -1)
    return `${brandPathPrefix.value}/${segments.join('/')}`
  })

  // 根路徑
  const rootPath = computed(() => homepageUrl.value)

  // 是否為首頁
  const isHomePage = computed(() => {
    return relativePath.value === '/' || relativePath.value === ''
  })

  // 是否為品牌首頁
  const isBrandHomePage = computed(() => {
    return path.value === homepageUrl.value
  })

  // 是否為動態路由
  const isDynamicRoute = computed(() => {
    return Object.keys(params.value).length > 0
  })

  // 是否為巢狀路由
  const isNestedRoute = computed(() => {
    return pathDepth.value > 1
  })

  // 當前路徑的 SEO 配置
  const seoConfig = computed(() => {
    const pageConfig = PAGE_CONFIGS[brandKey.value as keyof typeof PAGE_CONFIGS]
    if (!pageConfig?.routes) return null

    // 尋找對應的路由配置
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

    return findRoute(pageConfig.routes, relativePath.value)
  })

  // 當前路徑的 UI 配置
  const uiConfig = computed(() => seoConfig.value?.meta?.ui)

  // 是否顯示導航欄
  const showNavbar = computed(() => uiConfig.value?.navbar !== false)

  // 導航欄順序
  const navbarOrder = computed(() => uiConfig.value?.navbarOrder || 0)

  // 路徑導航（麵包屑）
  const breadcrumbs = computed(() => {
    const crumbs = [
      {
        name: '首頁',
        path: homepageUrl.value,
        isActive: isHomePage.value
      }
    ]

    if (isHomePage.value) return crumbs

    let currentPath = brandPathPrefix.value
    for (let i = 0; i < pathSegments.value.length; i++) {
      const segment = pathSegments.value[i]
      currentPath += `/${segment}`

      // 嘗試從路由配置中獲取標題
      const segmentRoute = findRouteByPath(currentPath)
      const segmentTitle = segmentRoute?.meta?.title || segment

      crumbs.push({
        name: segmentTitle,
        path: currentPath,
        isActive: i === pathSegments.value.length - 1
      })
    }

    return crumbs
  })

  // 根據路徑尋找路由配置
  const findRouteByPath = (targetPath: string) => {
    const pageConfig = PAGE_CONFIGS[brandKey.value as keyof typeof PAGE_CONFIGS]
    if (!pageConfig?.routes) return null

    function findRoute(routes: PageRoute[], path: string): PageRoute | undefined {
      for (const route of routes) {
        if (route.path === path) {
          return route
        }
        if (route.children) {
          const found = findRoute(route.children, path)
          if (found) return found
        }
      }
      return undefined
    }

    return findRoute(pageConfig.routes, targetPath)
  }

  // 導航方法
  const navigate = {
    // 導航到指定路徑
    to: (path: string, options?: { replace?: boolean; query?: Record<string, string> }) => {
      const targetPath = path.startsWith('/') ? path : `${brandPathPrefix.value}/${path}`
      if (options && options.replace) {
        router.replace({ path: targetPath, query: options.query })
      } else {
        router.push({ path: targetPath, query: options?.query })
      }
    },

    // 導航到首頁
    home: () => router.push(homepageUrl.value),

    // 導航到父路徑
    parent: () => router.push(parentPath.value),

    // 導航到根路徑
    root: () => router.push(rootPath.value),

    // 返回上一頁
    back: () => router.back(),

    // 前進
    forward: () => router.forward(),

    // 重新載入當前頁面
    reload: () => router.go(0)
  }

  // 路徑工具方法
  const pathUtils = {
    // 檢查是否為指定路徑
    is: (targetPath: string) => {
      const normalizedTarget = targetPath.startsWith('/') ? targetPath : `${brandPathPrefix.value}/${targetPath}`
      return path.value === normalizedTarget
    },

    // 檢查是否為指定路徑的前綴
    startsWith: (targetPath: string) => {
      const normalizedTarget = targetPath.startsWith('/') ? targetPath : `${brandPathPrefix.value}/${targetPath}`
      return path.value.startsWith(normalizedTarget)
    },

    // 檢查是否為指定路徑的後綴
    endsWith: (targetPath: string) => {
      return path.value.endsWith(targetPath)
    },

    // 檢查是否包含指定路徑
    includes: (targetPath: string) => {
      return path.value.includes(targetPath)
    },

    // 獲取路徑參數
    getParam: (key: string) => {
      return params.value[key] as string
    },

    // 獲取查詢參數
    getQuery: (key: string) => {
      return query.value[key] as string
    },

    // 設置查詢參數
    setQuery: (key: string, value: string) => {
      const newQuery = { ...query.value, [key]: value }
      router.push({ path: path.value, query: newQuery })
    },

    // 移除查詢參數
    removeQuery: (key: string) => {
      const newQuery = { ...query.value }
      delete newQuery[key]
      router.push({ path: path.value, query: newQuery })
    }
  }

  return {
    // 基本路徑資訊
    brandKey,
    fullPath,
    path,
    name,
    params,
    query,
    hash,
    meta,
    title,
    description,
    layout,
    requiresAuth,
    roles,

    // 品牌相關
    isMainBrand,
    homepageUrl,
    brandPathPrefix,
    relativePath,
    pathSegments,
    pathDepth,
    parentPath,
    rootPath,

    // 路徑狀態
    isHomePage,
    isBrandHomePage,
    isDynamicRoute,
    isNestedRoute,

    // 配置資訊
    seoConfig,
    uiConfig,
    showNavbar,
    navbarOrder,

    // 導航
    breadcrumbs,
    navigate,
    pathUtils,

    // 工具方法
    findRouteByPath
  }
}
