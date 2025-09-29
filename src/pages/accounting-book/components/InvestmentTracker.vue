<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Investment } from '../types'

interface Props {
  investments: Investment[]
}

const props = defineProps<Props>()

const showAddForm = ref(false)
const newInvestment = ref({
  symbol: '',
  name: '',
  shares: 0,
  averageCost: 0,
  currentPrice: 0
})

const totalValue = computed(() => {
  return props.investments.reduce((total, inv) => total + inv.totalValue, 0)
})

const totalGainLoss = computed(() => {
  return props.investments.reduce((total, inv) => total + inv.unrealizedGainLoss, 0)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount)
}

const formatPercentage = (value: number, total: number) => {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
</script>

<template>
  <div class="investment-tracker">
    <div class="investment-summary">
      <div class="summary-card">
        <h3>投資總覽</h3>
        <div class="summary-stats">
          <div class="stat">
            <div class="stat-label">總價值</div>
            <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
          </div>
          <div class="stat">
            <div class="stat-label">未實現損益</div>
            <div class="stat-value" :class="totalGainLoss >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(totalGainLoss) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="investment-list">
      <div class="list-header">
        <h3>投資組合</h3>
        <button class="btn btn-primary" @click="showAddForm = true">新增投資</button>
      </div>

      <div v-if="investments.length === 0" class="empty-state">
        <p>尚未有投資記錄</p>
      </div>

      <div v-else class="investment-items">
        <div v-for="investment in investments" :key="investment.id" class="investment-item">
          <div class="investment-info">
            <div class="investment-symbol">{{ investment.symbol }}</div>
            <div class="investment-name">{{ investment.name }}</div>
          </div>
          <div class="investment-details">
            <div class="investment-shares">{{ investment.shares }} 股</div>
            <div class="investment-price">@ {{ formatCurrency(investment.currentPrice) }}</div>
          </div>
          <div class="investment-value">
            <div class="total-value">{{ formatCurrency(investment.totalValue) }}</div>
            <div class="gain-loss" :class="investment.unrealizedGainLoss >= 0 ? 'positive' : 'negative'">
              {{ investment.unrealizedGainLoss >= 0 ? '+' : '' }}{{ formatCurrency(investment.unrealizedGainLoss) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增投資表單 -->
    <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新增投資</h3>
          <button class="close-btn" @click="showAddForm = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>股票代碼</label>
            <input type="text" v-model="newInvestment.symbol" placeholder="例如: 2330">
          </div>
          <div class="form-group">
            <label>股票名稱</label>
            <input type="text" v-model="newInvestment.name" placeholder="例如: 台積電">
          </div>
          <div class="form-group">
            <label>持股數量</label>
            <input type="number" v-model="newInvestment.shares" placeholder="請輸入持股數量">
          </div>
          <div class="form-group">
            <label>平均成本</label>
            <input type="number" v-model="newInvestment.averageCost" placeholder="請輸入平均成本">
          </div>
          <div class="form-group">
            <label>目前價格</label>
            <input type="number" v-model="newInvestment.currentPrice" placeholder="請輸入目前價格">
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
.investment-tracker {
  max-width: 800px;
}

.investment-summary {
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

.stat-value.positive {
  color: #27ae60;
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

.investment-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.investment-item {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  align-items: center;
}

.investment-symbol {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
}

.investment-name {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.investment-shares {
  font-weight: bold;
  color: #2c3e50;
}

.investment-price {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.total-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
}

.gain-loss {
  font-size: 0.9rem;
  font-weight: bold;
}

.gain-loss.positive {
  color: #27ae60;
}

.gain-loss.negative {
  color: #e74c3c;
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
  .investment-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
