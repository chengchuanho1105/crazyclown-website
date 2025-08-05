// 環境變數配置
export const config = {
  // API 基礎 URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  // 應用環境
  environment: import.meta.env.VITE_APP_ENV || 'development',

  // 是否為生產環境
  isProduction: import.meta.env.PROD,

  // 是否為開發環境
  isDevelopment: import.meta.env.DEV,

  // 品牌配置
  brand: import.meta.env.VITE_BRAND || 'crazyclown',

  // 功能開關
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },

  // 外部服務配置
  services: {
    // Google Analytics
    googleAnalytics: {
      id: import.meta.env.VITE_GA_ID,
      enabled: import.meta.env.VITE_ENABLE_GA === 'true',
    },

    // 其他第三方服務
    external: {
      apiKey: import.meta.env.VITE_EXTERNAL_API_KEY,
    }
  }
}

// 環境檢查
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_APP_ENV'
  ]

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName])

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars)
  }

  return missingVars.length === 0
}

// 獲取當前環境的 API URL
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.apiUrl.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  return `${baseUrl}/${cleanEndpoint}`
}

// 環境特定的配置
export const getEnvironmentConfig = () => {
  switch (config.environment) {
    case 'production':
      return {
        apiTimeout: 10000,
        retryAttempts: 3,
        cacheEnabled: true,
        debugMode: false
      }
    case 'staging':
      return {
        apiTimeout: 15000,
        retryAttempts: 2,
        cacheEnabled: true,
        debugMode: true
      }
    default: // development
      return {
        apiTimeout: 30000,
        retryAttempts: 1,
        cacheEnabled: false,
        debugMode: true
      }
  }
}
