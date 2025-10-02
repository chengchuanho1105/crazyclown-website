<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Transaction, TransactionItem } from '../types'

interface Props {
  show: boolean
  accounts: any[]
}

interface Emits {
  (e: 'close'): void
  (e: 'submit', transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const transaction = ref({
  type: 'expense' as 'income' | 'expense' | 'transfer',
  date: new Date(),
  time: new Date().toTimeString().slice(0, 5),
  items: [] as TransactionItem[],
  totalAmount: 0,
  paymentMethod: '',
  notes: '',
  accountId: '',
  targetAccountId: '',
  invoiceNumber: ''
})

const newItem = ref({
  lineNumber: '',
  itemName: '',
  unitPrice: 0,
  quantity: 1,
  discount: 0,
  notes: ''
})

const isTransfer = computed(() => transaction.value.type === 'transfer')
const isExpense = computed(() => transaction.value.type === 'expense')

// 計算小計
const calculateSubtotal = (item: typeof newItem.value) => {
  return (item.unitPrice * item.quantity) - item.discount
}

// 計算總金額
const calculateTotal = () => {
  return transaction.value.items.reduce((total, item) => total + item.subtotal, 0)
}

// 新增項目
const addItem = () => {
  if (newItem.value.itemName && newItem.value.unitPrice > 0) {
    const subtotal = calculateSubtotal(newItem.value)
    const item: TransactionItem = {
      id: Date.now().toString(),
      lineNumber: newItem.value.lineNumber || (transaction.value.items.length + 1).toString(),
      itemName: newItem.value.itemName,
      unitPrice: newItem.value.unitPrice,
      quantity: newItem.value.quantity,
      discount: newItem.value.discount,
      subtotal: subtotal,
      notes: newItem.value.notes
    }

    transaction.value.items.push(item)
    transaction.value.totalAmount = calculateTotal()

    // 重置新項目表單
    newItem.value = {
      lineNumber: '',
      itemName: '',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      notes: ''
    }
  }
}

// 刪除項目
const removeItem = (index: number) => {
  transaction.value.items.splice(index, 1)
  transaction.value.totalAmount = calculateTotal()
}

// 提交交易
const submit = () => {
  if (transaction.value.items.length > 0 && transaction.value.accountId) {
    emit('submit', {
      ...transaction.value,
      totalAmount: transaction.value.totalAmount
    })

    // 重置表單
    transaction.value = {
      type: 'expense',
      date: new Date(),
      time: new Date().toTimeString().slice(0, 5),
      items: [],
      totalAmount: 0,
      paymentMethod: '',
      notes: '',
      accountId: '',
      targetAccountId: '',
      invoiceNumber: ''
    }
    emit('close')
  }
}

const close = () => {
  emit('close')
}

// 格式化金額
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD'
  }).format(amount)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal large-modal" @click.stop>
      <div class="modal-header">
        <h3>新增{{ transaction.type === 'income' ? '收入' : transaction.type === 'expense' ? '支出' : '轉帳' }}記錄</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="modal-body">
        <!-- 基本資訊 -->
        <div class="form-section">
          <h4>基本資訊</h4>
          <div class="form-row">
            <div class="form-group">
              <label>交易類型</label>
              <select v-model="transaction.type">
                <option value="income">收入</option>
                <option value="expense">支出</option>
                <option value="transfer">轉帳</option>
              </select>
            </div>
            <div class="form-group">
              <label>日期</label>
              <input type="date" v-model="transaction.date">
            </div>
            <div class="form-group">
              <label>時間</label>
              <input type="time" v-model="transaction.time">
            </div>
          </div>

          <div class="form-row">
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
            <div v-if="!isTransfer" class="form-group">
              <label>{{ transaction.type === 'income' ? '收款方式' : '付款方式' }}</label>
              <select v-model="transaction.paymentMethod">
                <option value="">請選擇方式</option>
                <option value="cash">現金</option>
                <option value="bank">銀行轉帳</option>
                <option value="credit">信用卡</option>
                <option value="check">支票</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <div v-if="isExpense" class="form-row">
            <div class="form-group">
              <label>發票號碼</label>
              <input type="text" v-model="transaction.invoiceNumber" placeholder="請輸入發票號碼">
            </div>
          </div>
        </div>

        <!-- 項目明細 (非轉帳時顯示) -->
        <div v-if="!isTransfer" class="form-section">
          <h4>項目明細</h4>

          <!-- 新增項目表單 -->
          <div class="add-item-form">
            <div class="form-row">
              <div class="form-group">
                <label>行號</label>
                <input type="text" v-model="newItem.lineNumber" placeholder="自動編號">
              </div>
              <div class="form-group">
                <label>品名</label>
                <input type="text" v-model="newItem.itemName" placeholder="請輸入品名">
              </div>
              <div class="form-group">
                <label>單價</label>
                <input type="number" v-model="newItem.unitPrice" placeholder="0" min="0" step="0.01">
              </div>
              <div class="form-group">
                <label>數量</label>
                <input type="number" v-model="newItem.quantity" placeholder="1" min="1">
              </div>
              <div class="form-group">
                <label>折扣</label>
                <input type="number" v-model="newItem.discount" placeholder="0" min="0" step="0.01">
              </div>
              <div class="form-group">
                <label>小計</label>
                <input type="text" :value="formatCurrency(calculateSubtotal(newItem))" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>備註</label>
                <input type="text" v-model="newItem.notes" placeholder="請輸入備註">
              </div>
              <div class="form-group">
                <button type="button" class="btn btn-primary" @click="addItem">新增項目</button>
              </div>
            </div>
          </div>

          <!-- 項目列表 -->
          <div v-if="transaction.items.length > 0" class="items-list">
            <div class="items-header">
              <div>行號</div>
              <div>品名</div>
              <div>單價</div>
              <div>數量</div>
              <div>折扣</div>
              <div>小計</div>
              <div>操作</div>
            </div>
            <div v-for="(item, index) in transaction.items" :key="item.id" class="item-row">
              <div>{{ item.lineNumber }}</div>
              <div>{{ item.itemName }}</div>
              <div>{{ formatCurrency(item.unitPrice) }}</div>
              <div>{{ item.quantity }}</div>
              <div>{{ formatCurrency(item.discount) }}</div>
              <div>{{ formatCurrency(item.subtotal) }}</div>
              <div>
                <button type="button" class="btn btn-sm btn-danger" @click="removeItem(index)">刪除</button>
              </div>
            </div>
            <div class="items-total">
              <div class="total-label">總計:</div>
              <div class="total-amount">{{ formatCurrency(transaction.totalAmount) }}</div>
            </div>
          </div>
        </div>

        <!-- 轉帳金額 (轉帳時顯示) -->
        <div v-if="isTransfer" class="form-section">
          <div class="form-group">
            <label>轉帳金額</label>
            <input type="number" v-model="transaction.totalAmount" placeholder="請輸入轉帳金額" min="0" step="0.01">
          </div>
        </div>

        <!-- 備註 -->
        <div class="form-section">
          <div class="form-group full-width">
            <label>備註</label>
            <textarea v-model="transaction.notes" placeholder="請輸入備註" rows="3"></textarea>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn btn-primary" @click="submit" :disabled="transaction.items.length === 0 && !isTransfer">確認</button>
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 1000px;
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

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h4 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.add-item-form {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.items-list {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.items-header {
  display: grid;
  grid-template-columns: 60px 1fr 100px 60px 100px 100px 80px;
  background: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
  padding: 10px;
  border-bottom: 1px solid #ecf0f1;
}

.item-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px 60px 100px 100px 80px;
  padding: 10px;
  border-bottom: 1px solid #ecf0f1;
  align-items: center;
}

.item-row:last-child {
  border-bottom: none;
}

.items-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #e8f4f8;
  font-weight: bold;
  font-size: 1.1rem;
}

.total-label {
  color: #2c3e50;
}

.total-amount {
  color: #27ae60;
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

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    max-height: 95vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .items-header,
  .item-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .items-header > div,
  .item-row > div {
    padding: 5px 0;
  }
}
</style>

