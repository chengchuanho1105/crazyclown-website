import { supabase, TABLES } from '@/config/supabase'
import type { ApiResponse } from './types'

// 統計服務
export class StatisticsService {
  // 獲取庫存統計
  static async getInventoryStatistics(): Promise<
    ApiResponse<{
      total: number
      available: number
      sold: number
      reserved: number
      personal: number
      welfare: number
      stolen: number
      refunded: number
      compensation: number
    }>
  > {
    try {
      const { data, error } = await supabase.from(TABLES.INVENTORY_ITEMS).select('status')

      if (error) throw error

      const stats = {
        total: data.length,
        available: data.filter((item) => item.status === '未售').length,
        sold: data.filter((item) => item.status === '已售').length,
        reserved: data.filter((item) => item.status === '預訂中').length,
        personal: data.filter((item) => item.status === '自用').length,
        welfare: data.filter((item) => item.status === '福利').length,
        stolen: data.filter((item) => item.status === '被盜').length,
        refunded: data.filter((item) => item.status === '淘退').length,
        compensation: data.filter((item) => item.status === '補償').length,
      }

      return { data: stats, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取統計資料失敗',
          details: error.details,
          code: error.code,
        },
      }
    }
  }

  // 獲取營收統計
  static async getRevenueStatistics(): Promise<
    ApiResponse<{
      totalRevenue: number
      monthlyRevenue: number
      totalTransactions: number
    }>
  > {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('amount_received, created_at')

      if (error) throw error

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalRevenue = data.reduce(
        (sum, transaction) => sum + (transaction.amount_received || 0),
        0,
      )
      const monthlyRevenue = data
        .filter((transaction) => new Date(transaction.created_at) >= thisMonth)
        .reduce((sum, transaction) => sum + (transaction.amount_received || 0), 0)

      const stats = {
        totalRevenue,
        monthlyRevenue,
        totalTransactions: data.length,
      }

      return { data: stats, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || '獲取營收統計失敗',
          details: error.details,
          code: error.code,
        },
      }
    }
  }
}


