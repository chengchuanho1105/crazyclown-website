<script setup lang="ts">
import { computed } from 'vue'
import type { Account } from '../types'

interface Props {
  account: Account
}

const props = defineProps<Props>()

const accountTypeText = computed(() => {
  const typeMap = {
    cash: '現金',
    bank: '銀行',
    credit: '信用卡',
    investment: '投資',
    debt: '債務'
  }
  return typeMap[props.account.type] || props.account.type
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount)
}
</script>

<template>
  <div class="account-card">
    <div class="account-header">
      <h3>{{ account.name }}</h3>
      <span class="account-type">{{ accountTypeText }}</span>
    </div>
    <div class="account-balance">{{ formatCurrency(account.balance) }}</div>
    <div v-if="account.description" class="account-description">{{ account.description }}</div>
    <div class="account-actions">
      <button class="btn btn-sm">編輯</button>
      <button class="btn btn-sm btn-danger">刪除</button>
    </div>
  </div>
</template>

<style scoped>
.account-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.account-card:hover {
  transform: translateY(-2px);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.account-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.account-type {
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

.account-balance {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.account-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.account-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
