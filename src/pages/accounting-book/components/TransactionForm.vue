<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transaction } from '../types'

interface Props {
  show: boolean
  accounts: any[]
  categories: any[]
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const transaction = ref({
  type: 'expense' as 'income' | 'expense' | 'transfer',
  amount: 0,
  description: '',
  category: '',
  accountId: '',
  targetAccountId: '',
  date: new Date()
})

const isTransfer = computed(() => transaction.value.type === 'transfer')

const submit = () => {
  if (transaction.value.amount > 0 && transaction.value.description && transaction.value.accountId) {
    emit('submit', {
      ...transaction.value,
      amount: transaction.value.amount
    })

    // 重置表單
    transaction.value = {
      type: 'expense',
      amount: 0,
      description: '',
      category: '',
      accountId: '',
      targetAccountId: '',
      date: new Date()
    }
    emit('close')
  }
}

const close = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>新增交易</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>交易類型</label>
          <select v-model="transaction.type">
            <option value="income">收入</option>
            <option value="expense">支出</option>
            <option value="transfer">轉帳</option>
          </select>
        </div>

        <div class="form-group">
          <label>金額</label>
          <input
            type="number"
            v-model="transaction.amount"
            placeholder="請輸入金額"
            min="0"
            step="0.01"
          >
        </div>

        <div class="form-group">
          <label>描述</label>
          <input
            type="text"
            v-model="transaction.description"
            placeholder="請輸入描述"
          >
        </div>

        <div class="form-group">
          <label>分類</label>
          <input
            type="text"
            v-model="transaction.category"
            placeholder="請輸入分類"
          >
        </div>

        <div class="form-group">
          <label>{{ isTransfer ? '轉出帳戶' : '帳戶' }}</label>
          <select v-model="transaction.accountId">
            <option value="">請選擇帳戶</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <div v-if="isTransfer" class="form-group">
          <label>轉入帳戶</label>
          <select v-model="transaction.targetAccountId">
            <option value="">請選擇轉入帳戶</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>日期</label>
          <input
            type="date"
            v-model="transaction.date"
          >
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn btn-primary" @click="submit">確認</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}
</style>
