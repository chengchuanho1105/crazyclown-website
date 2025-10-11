<script setup lang="ts">
import type { ValidationStatus } from '@/composables/useFormField'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue: string | null
  label: string
  options: Option[]
  isFocused: boolean
  status: ValidationStatus
  errorMessage?: string
  required?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  errorMessage: '請選擇選項',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  focus: []
  blur: []
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value || null)
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
        'text-gray-600 dark:text-zinc-400': !isFocused && modelValue === null,
        'text-blue-500 dark:text-blue-400': isFocused,
        'text-green-500 dark:text-green-400': !isFocused && status === 'success',
        'text-red-500 dark:text-red-400': !isFocused && status === 'error',
        'text-xs -top-2 bg-white dark:bg-zinc-800 px-1': isFocused || modelValue !== null,
        'top-1/2 -translate-y-1/2': !isFocused && modelValue === null,
      }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 dark:text-red-400">*</span>
    </label>

    <select
      :id="name"
      :name="name"
      :value="modelValue"
      class="block w-full px-1 pt-3 pb-1 bg-transparent appearance-none h-10 cursor-pointer text-gray-900 dark:text-zinc-100 focus:outline-none"
      @change="handleChange"
      @focus="emit('focus')"
      @blur="emit('blur')"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.value === ''"
        class="bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100"
      >
        {{ option.label }}
      </option>
    </select>

    <p v-if="status === 'error'" class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
      {{ errorMessage }}
    </p>

    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-zinc-300">
      <i class="bi bi-chevron-down"></i>
    </div>
  </div>
</template>

