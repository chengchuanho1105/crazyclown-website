<script setup lang="ts">
import type { ValidationStatus } from '@/composables/useFormField'

interface Props {
  modelValue: string | number | null
  label: string
  type?: 'text' | 'number'
  isFocused: boolean
  status: ValidationStatus
  errorMessage?: string
  placeholder?: string
  required?: boolean
  maxlength?: string
  autocomplete?: string
  name?: string
  hint?: string // 提示文字（顯示在 label 旁）
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  autocomplete: 'off',
  errorMessage: '此欄位為必填',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  focus: []
  blur: []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? (target.value ? Number(target.value) : null) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div
    class="relative border-2 rounded-md px-3 py-2 transition-all duration-200 ease-in-out"
    :class="{
      'border-gray-300 dark:border-zinc-600': !isFocused && status === null,
      'border-blue-500 dark:border-blue-400': isFocused,
      'border-green-500 dark:border-green-400': !isFocused && status === 'success',
      'border-red-500 dark:border-red-400': !isFocused && status === 'error',
    }"
  >
    <label
      :for="name"
      class="absolute left-3 transition-all duration-200 ease-in-out pointer-events-none"
      :class="{
        'text-gray-600 dark:text-zinc-400': !isFocused && !modelValue,
        'text-blue-500 dark:text-blue-400': isFocused,
        'text-green-500 dark:text-green-400': !isFocused && status === 'success',
        'text-red-500 dark:text-red-400': !isFocused && status === 'error',
        'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isFocused || modelValue,
        'top-1/2 -translate-y-1/2': !isFocused && !modelValue,
      }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 dark:text-red-400">*</span>
      <span v-if="hint" class="text-red-500 dark:text-red-400">{{ hint }}</span>
    </label>

    <input
      :id="name"
      :type="type"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10 text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500"
      @input="handleInput"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />

    <p v-if="status === 'error'" class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
      {{ errorMessage }}
    </p>

    <!-- 插槽：用於右側圖標等 -->
    <slot name="suffix"></slot>
  </div>
</template>

