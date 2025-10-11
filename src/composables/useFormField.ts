import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export type ValidationStatus = null | 'success' | 'error'
export type ValidatorFn<T> = (value: T) => boolean

/**
 * 通用表單字段 Composable
 * 封裝表單字段的狀態管理、驗證和焦點處理
 */
export function useFormField<T>(
  initialValue: T,
  validator: ValidatorFn<T>,
  options?: {
    /** 是否在有值時就驗證（不等失焦） */
    validateOnChange?: boolean
    /** 條件驗證：只有當此函數返回 true 時才驗證 */
    shouldValidate?: () => boolean
  }
) {
  const value = ref(initialValue) as Ref<T>
  const isFocused = ref(false)
  const status = ref<ValidationStatus>(null)

  /** 更新驗證狀態 */
  const updateStatus = () => {
    // 如果有條件驗證，檢查是否需要驗證
    if (options?.shouldValidate && !options.shouldValidate()) {
      status.value = null
      return
    }

    if (validator(value.value)) {
      status.value = 'success'
    } else if (!isFocused.value) {
      // 僅在失去焦點且驗證失敗時標記為錯誤
      status.value = 'error'
    } else {
      status.value = null
    }
  }

  /** 處理失焦事件 */
  const handleBlur = () => {
    isFocused.value = false
    updateStatus()
  }

  /** 處理聚焦事件 */
  const handleFocus = () => {
    isFocused.value = true
  }

  /** 重置字段 */
  const reset = () => {
    value.value = initialValue
    isFocused.value = false
    status.value = null
  }

  // 監聽值的變化
  watch(value, () => {
    if (options?.validateOnChange || isFocused.value || status.value !== null) {
      updateStatus()
    }
  })

  return {
    value,
    isFocused,
    status,
    handleFocus,
    handleBlur,
    reset,
    /** 手動觸發驗證（用於表單提交時） */
    validate: updateStatus,
  }
}

/** ========== 預定義驗證器 ========== */

/** 檢查字串是否為空 */
const isStringEmpty = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

export const validators = {
  /** 字串不為空 */
  notEmpty: (value: string | null | undefined): boolean => {
    return !isStringEmpty(value)
  },

  /** Discord 使用者名稱格式 */
  discordFormat: (value: string | null | undefined): boolean => {
    if (isStringEmpty(value)) return false
    const discordUsernameRegex = /^[a-zA-Z0-9_.]+$/
    return discordUsernameRegex.test(value as string)
  },

  /** Steam 17位數字ID */
  steam17Id: (value: string | null | undefined): boolean => {
    if (isStringEmpty(value)) return false
    const steam17IdRegex = /^\d{17}$/
    return steam17IdRegex.test(value as string)
  },

  /** 正數驗證 */
  positiveNumber: (value: number | null | undefined): boolean => {
    return value !== null && value !== undefined && !isNaN(value) && value >= 0
  },

  /** 每週遊玩時數 (0-168) */
  weeklyPlaytime: (value: number | null | undefined): boolean => {
    return value !== null && value !== undefined && !isNaN(value) && value >= 0 && value <= 168
  },
}

