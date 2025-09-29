<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Debt } from '../types'

interface Props {
  debts: Debt[]
}

const props = defineProps<Props>()

const showAddForm = ref(false)
const newDebt = ref({
  name: '',
  principal: 0,
  interestRate: 0,
  term: 0,
  startDate: new Date()
})

const totalDebt = computed(() => {
  return props.debts.reduce((total, debt) => total + debt.remainingBalance, 0)
})

const totalMonthlyPayment = computed(() => {
  return props.debts.reduce((total, debt) => total + debt.monthlyPayment, 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const calculateMonthlyPayment = (principal: number, rate: number, term: number) => {
  if (rate === 0) return principal / term
  const monthlyRate = rate / 100 / 12
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
}

const getRemainingMonths = (debt: Debt) => {
  const now = new Date()
  const endDate = new Date(debt.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
  return Math.max(0, diffMonths)
}
</script>

<template>
  <div class="debt-manager">
    <div class="debt-summary">
      <div class="summary-card">
        <h3>債務總覽</h3>
        <div class="summary-stats">
          <div class="stat">
            <div class="stat-label">總債務</div>
            <div class="stat-value negative">{{ formatCurrency(totalDebt) }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">月還款</div>
            <div class="stat-value">{{ formatCurrency(totalMonthlyPayment) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="debt-list">
      <div class="list-header">
        <h3>債務清單</h3>
        <button class="btn btn-primary" @click="showAddForm = true">新增債務</button>
      </div>

      <div v-if="debts.length === 0" class="empty-state">
        <p>尚未有債務記錄</p>
      </div>

      <div v-else class="debt-items">
        <div v-for="debt in debts" :key="debt.id" class="debt-item">
          <div class="debt-info">
            <div class="debt-name">{{ debt.name }}</div>
            <div class="debt-details">
              <span>利率: {{ debt.interestRate }}%</span>
              <span>期限: {{ debt.term }} 個月</span>
            </div>
          </div>
          <div class="debt-balance">
            <div class="remaining-balance">{{ formatCurrency(debt.remainingBalance) }}</div>
            <div class="monthly-payment">月還款: {{ formatCurrency(debt.monthlyPayment) }}</div>
          </div>
          <div class="debt-progress">
            <div class="progress-info">
              <span>剩餘: {{ getRemainingMonths(debt) }} 個月</span>
              <span>到期: {{ formatDate(debt.endDate) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((debt.term - getRemainingMonths(debt)) / debt.term) * 100}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增債務表單 -->
    <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新增債務</h3>
          <button class="close-btn" @click="showAddForm = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>債務名稱</label>
            <input type="text" v-model="newDebt.name" placeholder="例如: 房貸">
          </div>
          <div class="form-group">
            <label>本金</label>
            <input type="number" v-model="newDebt.principal" placeholder="請輸入本金">
          </div>
          <div class="form-group">
            <label>年利率 (%)</label>
            <input type="number" v-model="newDebt.interestRate" placeholder="請輸入年利率" step="0.01">
          </div>
          <div class="form-group">
            <label>期限 (月)</label>
            <input type="number" v-model="newDebt.term" placeholder="請輸入期限">
          </div>
          <div class="form-group">
            <label>開始日期</label>
            <input type="date" v-model="newDebt.startDate">
          </div>
          <div v-if="newDebt.principal && newDebt.interestRate && newDebt.term" class="calculation-preview">
            <div class="preview-item">
              <span>月還款金額:</span>
              <span class="preview-value">{{ formatCurrency(calculateMonthlyPayment(newDebt.principal, newDebt.interestRate, newDebt.term)) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddForm = false">取消</button>
          <button class="btn btn-primary">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.debt-manager {
  max-width: 800px;
}

.debt-summary {
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-value.negative {
  color: #e74c3c;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h3 {
  color: #2c3e50;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.debt-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.debt-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  align-items: center;
}

.debt-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.debt-details {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.remaining-balance {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 5px;
}

.monthly-payment {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.progress-bar {
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.calculation-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-value {
  font-weight: bold;
  color: #2c3e50;
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

@media (max-width: 768px) {
  .debt-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .debt-details {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
