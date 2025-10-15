import { supabase, TABLES, type ClanApplication, type ApplicationStatus } from '@/config/supabase'
import type { ApiResponse, SupabaseError } from './types'

// 輔助函數：將未知錯誤轉換為 SupabaseError
function toSupabaseError(error: unknown, defaultMessage: string): SupabaseError {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    return {
      message: typeof errorObj.message === 'string' ? errorObj.message : defaultMessage,
      details: typeof errorObj.details === 'string' ? errorObj.details : undefined,
      code: typeof errorObj.code === 'string' ? errorObj.code : undefined,
      hint: typeof errorObj.hint === 'string' ? errorObj.hint : undefined,
    }
  }
  return {
    message: defaultMessage,
  }
}

// 戰隊申請服務
export class ClanApplicationService {
  // 創建新申請
  static async createApplication(
    application: Omit<ClanApplication, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<ClanApplication>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .insert(application)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '提交申請失敗'),
      }
    }
  }

  // 獲取所有申請
  static async getAllApplications(): Promise<ApiResponse<ClanApplication[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取申請列表失敗'),
      }
    }
  }

  // 根據 ID 獲取單筆申請
  static async getApplicationById(id: string): Promise<ApiResponse<ClanApplication>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取申請失敗'),
      }
    }
  }

  // 更新申請 (通用更新方法)
  static async updateApplication(
    id: string,
    updates: Partial<Omit<ClanApplication, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<ApiResponse<ClanApplication>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新申請失敗'),
      }
    }
  }

  // 刪除申請
  static async deleteApplication(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.CLAN_APPLICATIONS).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除申請失敗'),
      }
    }
  }
}

// 審核進度服務
export class ApplicationStatusService {
  static async createStatus(
    status: Omit<ApplicationStatus, 'created_at' | 'updated_at'>,
  ): Promise<ApiResponse<ApplicationStatus>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .insert(status)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '創建審核進度失敗'),
      }
    }
  }

  // 根據 Steam ID 查詢申請（含審核進度）
  static async getStatusBySteamId(steamId: string): Promise<ApiResponse<ClanApplication>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .select('*')
        .eq('steam_17_id', steamId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '查詢申請失敗'),
      }
    }
  }

  // 獲取所有申請（含審核進度）
  static async getAllStatusWithDetails(): Promise<ApiResponse<ClanApplication[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '獲取申請列表失敗'),
      }
    }
  }

  // 更新審核進度
  static async updateStatus(
    id: string,
    updates: Partial<Omit<ClanApplication, 'id' | 'steam_17_id' | 'created_at' | 'updated_at'>>,
  ): Promise<ApiResponse<ClanApplication>> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLAN_APPLICATIONS)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '更新審核進度失敗'),
      }
    }
  }

  // 根據篩選條件獲取申請（含審核進度）
  static async getStatusByFilters(filters: {
    crazy_clown_discord?: string
    pubg_official_discord?: string
    clan_review?: string
    official_review?: string
    in_game_application?: string
    role_assignment?: string
  }): Promise<ApiResponse<ClanApplication[]>> {
    try {
      let query = supabase.from(TABLES.CLAN_APPLICATIONS).select('*')

      // 應用篩選條件
      if (filters.crazy_clown_discord) {
        query = query.eq('crazy_clown_discord', filters.crazy_clown_discord)
      }
      if (filters.pubg_official_discord) {
        query = query.eq('pubg_official_discord', filters.pubg_official_discord)
      }
      if (filters.clan_review) {
        query = query.eq('clan_review', filters.clan_review)
      }
      if (filters.official_review) {
        query = query.eq('official_review', filters.official_review)
      }
      if (filters.in_game_application) {
        query = query.eq('in_game_application', filters.in_game_application)
      }
      if (filters.role_assignment) {
        query = query.eq('role_assignment', filters.role_assignment)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '篩選申請失敗'),
      }
    }
  }

  // 刪除申請（含審核進度）
  static async deleteStatus(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase.from(TABLES.CLAN_APPLICATIONS).delete().eq('id', id)

      if (error) throw error

      return { data: true, error: null }
    } catch (error: unknown) {
      return {
        data: null,
        error: toSupabaseError(error, '刪除申請失敗'),
      }
    }
  }
}


