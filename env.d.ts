/// <reference types="vite/client" />
// vite-plugin-pages 虛擬模組型別宣告
declare module 'virtual:generated-pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

// JSON 模組型別宣告
declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}
