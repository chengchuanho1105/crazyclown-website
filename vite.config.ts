import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'child_process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import Pages from 'vite-plugin-pages'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('lord-icon'),
        },
      },
    }),
    vueJsx(),
    vueDevTools(),
    Pages({
      dirs: [{ dir: 'src/pages', baseRoute: '' }],
      extensions: ['vue'],
      // 生成包含動態路由的完整 sitemap
      onRoutesGenerated: () => {
        try {
          execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' })
        } catch (error: unknown) {
          console.warn('生成 sitemap 或靜態頁面時發生錯誤:', (error as Error).message)
        }
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/exchange-rate': {
        target: 'https://tw.rter.info',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/exchange-rate/, '/capi.php'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
})
