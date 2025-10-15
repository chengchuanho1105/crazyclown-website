import { supabase, TABLES, type PaymentMethod, type OurBankData } from '@/config/supabase'
import type { ApiResponse } from './types'

// 付款方式服務
export class PaymentMethodService {
  // 獲取所有付款方式
  static async getAllPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAYMENT_METHODS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取付款方式失敗',
          details: error.details,
          code: error.code,
        },
      }
    }
  }
}

// 銀行資料服務
export class OurBankDataService {
  // 獲取所有銀行資料
  static async getAllBankData(): Promise<ApiResponse<OurBankData[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OUR_BANK_DATA)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取銀行資料失敗',
          details: error.details,
          code: error.code,
        },
      }
    }
  }
}


