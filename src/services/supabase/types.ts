// 錯誤處理類型
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// 通用回應類型
export interface ApiResponse<T> {
  data: T | null
  error: SupabaseError | null
}
