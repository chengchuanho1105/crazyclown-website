<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentBrand } from '@/composables/useCurrentBrand'

defineOptions({ name: 'LoginPage' })

const router = useRouter()
const { brandDisplayName, brandLogo, brandSlogan } = useCurrentBrand()

// 表單數據
const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 驗證狀態
const validation = reactive({
  email: { isValid: true, message: '' },
  password: { isValid: true, message: '' },
  captcha: { isValid: true, message: '' }
})

// 人機驗證相關
const captcha = reactive({
  code: '',
  userInput: '',
  isVerified: false,
  attempts: 0,
  maxAttempts: 3
})

// UI 狀態
const isLoading = ref(false)
const showPassword = ref(false)
const captchaImage = ref('')

// 生成隨機驗證碼
const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captcha.code = result

  // 創建 Canvas 驗證碼圖片
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    canvas.width = 200
    canvas.height = 60

    // 背景
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, 200, 60)

    // 干擾線
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 80%)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * 200, Math.random() * 60)
      ctx.lineTo(Math.random() * 200, Math.random() * 60)
      ctx.stroke()
    }

    // 干擾點
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 80%)`
      ctx.fillRect(Math.random() * 200, Math.random() * 60, 1, 1)
    }

    // 文字
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < captcha.code.length; i++) {
      const x = 30 + i * 25
      const y = 30 + Math.sin(i) * 5
      const rotation = (Math.random() - 0.5) * 0.3

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.fillText(captcha.code[i], 0, 0)
      ctx.restore()
    }

    captchaImage.value = canvas.toDataURL()
  }
}

// 驗證表單
const validateForm = () => {
  let isValid = true

  // 驗證 Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email) {
    validation.email = { isValid: false, message: '請輸入電子郵件' }
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    validation.email = { isValid: false, message: '請輸入有效的電子郵件格式' }
    isValid = false
  } else {
    validation.email = { isValid: true, message: '' }
  }

  // 驗證密碼
  if (!formData.password) {
    validation.password = { isValid: false, message: '請輸入密碼' }
    isValid = false
  } else if (formData.password.length < 6) {
    validation.password = { isValid: false, message: '密碼至少需要6個字符' }
    isValid = false
  } else {
    validation.password = { isValid: true, message: '' }
  }

  // 驗證人機驗證
  if (!captcha.userInput) {
    validation.captcha = { isValid: false, message: '請輸入驗證碼' }
    isValid = false
  } else if (captcha.userInput.toUpperCase() !== captcha.code) {
    validation.captcha = { isValid: false, message: '驗證碼錯誤' }
    captcha.attempts++
    if (captcha.attempts >= captcha.maxAttempts) {
      generateCaptcha()
      captcha.attempts = 0
    }
    isValid = false
  } else {
    validation.captcha = { isValid: true, message: '' }
    captcha.isVerified = true
  }

  return isValid
}

// 處理登入
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    // 模擬登入 API 調用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 登入成功後跳轉到顧客頁面
    router.push('/customer')
  } catch (error) {
    console.error('登入失敗:', error)
    // 重置驗證碼
    generateCaptcha()
    captcha.userInput = ''
    captcha.isVerified = false
  } finally {
    isLoading.value = false
  }
}

// 重新生成驗證碼
const refreshCaptcha = () => {
  generateCaptcha()
  captcha.userInput = ''
  captcha.isVerified = false
  validation.captcha = { isValid: true, message: '' }
}

// 移除品牌顏色樣式以避免類型錯誤

onMounted(() => {
  generateCaptcha()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- 品牌 Logo 和標題 -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img
            v-if="brandLogo"
            :src="brandLogo"
            :alt="brandDisplayName as string"
            class="h-16 w-auto object-contain rounded-xl"
          />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ brandDisplayName }} 管理員登入
        </h1>
        <p v-if="brandSlogan" class="text-gray-600 text-sm">
          {{ brandSlogan }}
        </p>
      </div>

      <!-- 登入表單 -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 電子郵件 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              電子郵件
            </label>
            <div class="relative">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 transition-colors',
                  validation.email.isValid
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                ]"
                placeholder="請輸入您的電子郵件"
                :disabled="isLoading"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <i class="bi bi-envelope text-gray-400"/>
              </div>
            </div>
            <p v-if="!validation.email.isValid" class="mt-1 text-sm text-red-600">
              {{ validation.email.message }}
            </p>
          </div>

          <!-- 密碼 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              密碼
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 transition-colors pr-12',
                  validation.password.isValid
                    ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                ]"
                placeholder="請輸入您的密碼"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center px-3"
                :disabled="isLoading"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-gray-400 hover:text-gray-600"/>
              </button>
            </div>
            <p v-if="!validation.password.isValid" class="mt-1 text-sm text-red-600">
              {{ validation.password.message }}
            </p>
          </div>

          <!-- 人機驗證 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              人機驗證
            </label>
            <div class="flex space-x-3">
              <div class="flex-1">
                <input
                  v-model="captcha.userInput"
                  type="text"
                  :class="[
                    'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-offset-0 transition-colors',
                    validation.captcha.isValid
                      ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  ]"
                  placeholder="請輸入驗證碼"
                  :disabled="isLoading"
                  maxlength="6"
                />
              </div>
              <div class="flex-shrink-0">
                <div class="relative">
                  <img
                    :src="captchaImage"
                    alt="驗證碼"
                    class="h-12 w-20 border rounded cursor-pointer"
                    @click="refreshCaptcha"
                    title="點擊重新生成驗證碼"
                  />
                  <button
                    type="button"
                    @click="refreshCaptcha"
                    class="absolute -top-1 -right-1 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors"
                    :disabled="isLoading"
                  >
                    <i class="bi bi-arrow-clockwise text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
            <p v-if="!validation.captcha.isValid" class="mt-1 text-sm text-red-600">
              {{ validation.captcha.message }}
            </p>
            <p v-else class="mt-1 text-xs text-gray-500">
              請輸入上方圖片中的驗證碼，點擊圖片可重新生成
            </p>
          </div>

          <!-- 記住我 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="formData.rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                :disabled="isLoading"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                記住我
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                忘記密碼？
              </a>
            </div>
          </div>

          <!-- 登入按鈕 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i v-if="isLoading" class="bi bi-arrow-clockwise animate-spin mr-2"></i>
            {{ isLoading ? '登入中...' : '登入' }}
          </button>
        </form>

        <!-- 分隔線 -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">或</span>
            </div>
          </div>
        </div>

        <!-- 其他登入選項 -->
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <i class="bi bi-google text-xl mr-2 text-red-500"/>
          </button>

          <button
            type="button"
            class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <i class="bi bi-line text-xl mr-2 text-green-600"/>
          </button>
        </div>

        <!-- 註冊連結 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            還沒有帳號？
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              立即註冊
            </a>
          </p>
        </div>
      </div>

      <!-- 頁腳 -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          登入即表示您同意我們的
          <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors">服務條款</a>
          和
          <a href="#" class="text-blue-600 hover:text-blue-500 transition-colors">隱私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定義動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.min-h-screen {
  animation: fadeIn 0.6s ease-out;
}

/* 驗證碼圖片懸停效果 */
img[alt="驗證碼"]:hover {
  filter: brightness(0.9);
  transform: scale(1.02);
  transition: all 0.2s ease;
}

/* 表單輸入框焦點效果 */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}


/* 響應式設計 */
@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
  }

  .p-8 {
    padding: 1.5rem;
  }
}
</style>
