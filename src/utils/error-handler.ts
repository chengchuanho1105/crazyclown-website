import { config } from '@/config/environment'

// 錯誤類型
export interface AppError {
  message: string
  code?: string
  status?: number
  timestamp: number
  userAgent: string
  url: string
}

// 錯誤處理器
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: AppError[] = []
  private maxQueueSize = 10

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 設置全局錯誤處理
  private setupGlobalErrorHandlers() {
    // 捕獲未處理的 Promise 錯誤
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        code: 'UNHANDLED_PROMISE',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })

    // 捕獲 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        code: 'JAVASCRIPT_ERROR',
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })
  }

  // 處理錯誤
  handleError(error: AppError) {
    console.error('Application Error:', error)

    // 添加到錯誤隊列
    this.errorQueue.push(error)
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // 在生產環境中發送到錯誤追蹤服務
    if (config.isProduction) {
      this.sendErrorToService(error)
    }

    // 顯示用戶友好的錯誤信息
    this.showUserFriendlyError(error)
  }

  // 發送錯誤到服務
  private async sendErrorToService(error: AppError) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      })
    } catch (err) {
      console.error('Failed to send error to service:', err)
    }
  }

  // 顯示用戶友好的錯誤信息
  private showUserFriendlyError(error: AppError) {
    // 創建錯誤通知
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50'
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">⚠️</span>
        <span>發生錯誤，請稍後再試</span>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `
    document.body.appendChild(notification)

    // 5秒後自動移除
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }

  // 獲取錯誤隊列
  getErrorQueue(): AppError[] {
    return [...this.errorQueue]
  }

  // 清除錯誤隊列
  clearErrorQueue() {
    this.errorQueue = []
  }
}

// 創建全局錯誤處理器實例
export const errorHandler = ErrorHandler.getInstance()

// 便捷的錯誤處理函數
export const handleError = (message: string, code?: string) => {
  errorHandler.handleError({
    message,
    code,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  })
}

// API 錯誤處理
export const handleApiError = (error: unknown) => {
  const errorMessage = error.message || 'API 請求失敗'
  const errorCode = error.code || 'API_ERROR'

  errorHandler.handleError({
    message: errorMessage,
    code: errorCode,
    status: error.status,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  })
}
