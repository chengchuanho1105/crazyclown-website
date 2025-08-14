import '@/assets/css/public/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import { setupFavicon } from '@/routes/hook/setFavicon'
import { setupPageTitleDescription } from '@/routes/hook/setTitlrDescription'
import { setupPageSeo } from '@/routes/hook/setSeo'
import App from './App.vue'
import router from './router'

// 移除全域 Supabase 初始化，改為按需載入
// import { useSupabaseInit } from './composables/useSupabase'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)

// 移除全域初始化，改為在需要資料的頁面中按需載入
// const { initializeData } = useSupabaseInit()
// initializeData()

setupFavicon(router)
setupPageTitleDescription(router)
setupPageSeo(router)

app.use(head)
app.mount('#app')
