<script setup lang="ts">
import type { ValidationStatus } from '@/composables/useFormField'

interface Props {
  modelValue: string
  label: string
  isFocused: boolean
  status: ValidationStatus
  errorMessage?: string
  placeholder?: string
  required?: boolean
  name?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
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
        'top-3': !isFocused && !modelValue,
      }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 dark:text-red-400">*</span>
    </label>

    <textarea
      :id="name"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      class="block w-full px-1 pt-6 pb-1 bg-transparent appearance-none h-24 resize-y text-gray-900 dark:text-zinc-100 focus:outline-none placeholder-gray-400 dark:placeholder-zinc-500"
      @input="handleInput"
      @focus="emit('focus')"
      @blur="emit('blur')"
    ></textarea>

    <p v-if="status === 'error'" class="absolute -bottom-5 left-0 text-red-500 dark:text-red-400 text-xs">
      {{ errorMessage }}
    </p>
  </div>
</template>

