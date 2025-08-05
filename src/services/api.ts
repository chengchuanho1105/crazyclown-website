import { config, getApiUrl, getEnvironmentConfig } from '@/config/environment'

// API 響應類型
interface ApiResponse<T = unknown> {
  data: T
  message: string
  success: boolean
}

// API 錯誤類型
interface ApiError {
  message: string
  status: number
  code?: string
}

// API 配置
const apiConfig = getEnvironmentConfig()

// 創建 API 客戶端
class ApiClient {
  private baseURL: string
  private timeout: number
  private retryAttempts: number

  constructor() {
    this.baseURL = config.apiUrl
    this.timeout = apiConfig.apiTimeout
    this.retryAttempts = apiConfig.retryAttempts
  }

  // 創建請求配置
  private createRequestConfig(method: string, data?: unknown): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 添加認證標頭
    const token = localStorage.getItem('admin_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      method,
      headers,
      mode: 'cors',
      credentials: 'include',
    }

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data)
    }

    return config
  }

  // 處理響應
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText,
        status: response.status,
      }

      try {
        const errorData = await response.json()
        error.message = errorData.message || error.message
        error.code = errorData.code
      } catch {
        // 如果無法解析錯誤響應，使用默認錯誤信息
      }

      throw error
    }

    return response.json()
  }

  // 重試機制
  private async retryRequest<T>(
    url: string,
    config: RequestInit,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response)
    } catch (error) {
      if (attempt < this.retryAttempts && (error as Error).name !== 'AbortError') {
        console.warn(`API request failed, retrying... (${attempt}/${this.retryAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        return this.retryRequest<T>(url, config, attempt + 1)
      }
      throw error
    }
  }

  // 通用請求方法
  async request<T>(
    endpoint: string,
    method: string = 'GET',
    data?: unknown
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint)
    const config = this.createRequestConfig(method, data)

    return this.retryRequest<T>(url, config)
  }

  // GET 請求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET')
  }

  // POST 請求
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data)
  }

  // PUT 請求
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data)
  }

  // DELETE 請求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE')
  }

  // PATCH 請求
  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', data)
  }
}

// 創建 API 實例
export const api = new ApiClient()

// 交易相關 API
export const transactionApi = {
  // 獲取交易列表
  getTransactions: (params?: unknown) => api.get('/transactions'),

  // 獲取單筆交易
  getTransaction: (id: string) => api.get(`/transactions/${id}`),

  // 創建交易
  createTransaction: (data: unknown) => api.post('/transactions', data),

  // 更新交易
  updateTransaction: (id: string, data: unknown) => api.put(`/transactions/${id}`, data),

  // 刪除交易
  deleteTransaction: (id: string) => api.delete(`/transactions/${id}`),
}

// 客戶相關 API
export const customerApi = {
  // 獲取客戶列表
  getCustomers: (params?: unknown) => api.get('/customers'),

  // 獲取客戶詳情
  getCustomer: (id: string) => api.get(`/customers/${id}`),

  // 創建客戶
  createCustomer: (data: unknown) => api.post('/customers', data),

  // 更新客戶
  updateCustomer: (id: string, data: unknown) => api.put(`/customers/${id}`, data),

  // 刪除客戶
  deleteCustomer: (id: string) => api.delete(`/customers/${id}`),
}

// 分析相關 API
export const analyticsApi = {
  // 獲取營收統計
  getRevenueStats: () => api.get('/analytics/revenue'),

  // 獲取商品系列分析
  getSeriesStats: () => api.get('/analytics/series'),

  // 獲取店家分析
  getStoreStats: () => api.get('/analytics/stores'),

  // 獲取月營收統計
  getMonthlyStats: () => api.get('/analytics/monthly'),
}

// 認證相關 API
export const authApi = {
  // 登入
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),

  // 登出
  logout: () => api.post('/auth/logout'),

  // 檢查認證狀態
  checkAuth: () => api.get('/auth/me'),
}
