# Supabase 設定指南

## 1. 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 註冊帳號
2. 建立新專案
3. 記下專案的 URL 和 anon key

## 2. 設定環境變數

在專案根目錄建立 `.env` 檔案：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 建立資料庫表格

在 Supabase Dashboard 的 SQL Editor 中執行以下 SQL：

### 客戶表格
```sql
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(13) NOT NULL,
  id_number VARCHAR(10),
  contact_method VARCHAR(50),
  contact_method_id VARCHAR(255),
  contact_method_account VARCHAR(255),
  contact_method_nickname VARCHAR(255),
  address TEXT,
  pubg_nickname VARCHAR(255),
  pubg_account_id VARCHAR(255),
  steam_id VARCHAR(17),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 商品系列表格
```sql
CREATE TABLE product_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_product_series_updated_at 
    BEFORE UPDATE ON product_series 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 庫存商品表格
```sql
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status VARCHAR(20) DEFAULT '未售' CHECK (status IN ('未售', '預訂', '已售', '自用', '福利', '淘已退款', '被盜', '補償')),
  cd_key VARCHAR(25) NOT NULL UNIQUE,
  series_id UUID REFERENCES product_series(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  order_number VARCHAR(255),
  purchase_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  purchase_store VARCHAR(255),
  purchase_payment_method VARCHAR(100),
  purchase_amount_cny DECIMAL(10,2),
  purchase_amount_twd DECIMAL(10,2),
  suggested_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_inventory_items_updated_at 
    BEFORE UPDATE ON inventory_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 預訂表格
```sql
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  reservation_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 交易表格
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('進貨', '銷售', '退款', '轉帳')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  -- 我方收款資訊
  my_payment_method VARCHAR(100),
  my_bank_code VARCHAR(10),
  my_account_number VARCHAR(50),
  -- 顧客付款資訊
  customer_bank_code VARCHAR(10),
  customer_account_number VARCHAR(50),
  customer_account_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 活動記錄表格
```sql
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  related_item_id UUID,
  related_customer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. 設定 Row Level Security (RLS)

### 客戶表格 RLS
```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取客戶資料
CREATE POLICY "Allow public read access" ON customers
  FOR SELECT USING (true);

-- 允許所有用戶新增客戶（客戶可以自己註冊）
CREATE POLICY "Allow public insert" ON customers
  FOR INSERT WITH CHECK (true);

-- 只允許認證用戶更新客戶
CREATE POLICY "Allow authenticated update" ON customers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 只允許認證用戶刪除客戶
CREATE POLICY "Allow authenticated delete" ON customers
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 商品系列表格 RLS
```sql
ALTER TABLE product_series ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取商品系列
CREATE POLICY "Allow public read access" ON product_series
  FOR SELECT USING (true);

-- 只允許認證用戶管理商品系列
CREATE POLICY "Allow authenticated all" ON product_series
  FOR ALL USING (auth.role() = 'authenticated');
```

### 庫存商品表格 RLS
```sql
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取庫存資料
CREATE POLICY "Allow public read access" ON inventory_items
  FOR SELECT USING (true);

-- 只允許認證用戶管理庫存
CREATE POLICY "Allow authenticated all" ON inventory_items
  FOR ALL USING (auth.role() = 'authenticated');
```

### 預訂表格 RLS
```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取預訂資料
CREATE POLICY "Allow public read access" ON reservations
  FOR SELECT USING (true);

-- 允許所有用戶新增預訂（客戶可以自己預訂）
CREATE POLICY "Allow public insert" ON reservations
  FOR INSERT WITH CHECK (true);

-- 只允許認證用戶更新預訂
CREATE POLICY "Allow authenticated update" ON reservations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 只允許認證用戶刪除預訂
CREATE POLICY "Allow authenticated delete" ON reservations
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 交易表格 RLS
```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取交易資料
CREATE POLICY "Allow public read access" ON transactions
  FOR SELECT USING (true);

-- 只允許認證用戶管理交易
CREATE POLICY "Allow authenticated all" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');
```

### 活動記錄表格 RLS
```sql
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取活動記錄
CREATE POLICY "Allow public read access" ON activity_logs
  FOR SELECT USING (true);

-- 只允許認證用戶新增活動記錄
CREATE POLICY "Allow authenticated insert" ON activity_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 5. 建立索引以提升查詢效能

```sql
-- 庫存商品索引
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_series_id ON inventory_items(series_id);
CREATE INDEX idx_inventory_items_cd_key ON inventory_items(cd_key);

-- 預訂索引
CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_inventory_item_id ON reservations(inventory_item_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_reservation_time ON reservations(reservation_time);

-- 交易索引
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_inventory_item_id ON transactions(inventory_item_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);

-- 客戶索引
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);

-- 活動記錄索引
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## 6. 插入測試資料

```sql
-- 插入商品系列
INSERT INTO product_series (name, description) VALUES
('G-Coin', '遊戲內貨幣'),
('Survivor Pass 8W', '生存者通行證(8W)'),
('Survivor Pass 4W', '生存者通行證(4W)'),
('Skin', '角色造型'),
('其他', '其他商品');

-- 插入客戶資料
INSERT INTO customers (name, phone, id_number, contact_method, contact_method_id, contact_method_account, contact_method_nickname, pubg_nickname, pubg_account_id, steam_id) VALUES
('何晟全', '0908911153', 'P124628898', 'Discord', '424580403106545664', 'chuan._.1105', '銓', 'Yo_xiang_quan_Yo', '49cae0222b5b4895a50c8b1f5ab0d411', '76561198429709718');

-- 插入庫存商品
INSERT INTO inventory_items (status, cd_key, series_id, product_name, order_number, purchase_time, store, payment_method, purchase_amount_cny, purchase_amount_twd, suggested_price) VALUES
('自用', 'S06826-ZVLM-ZDSU-NDGN2', (SELECT id FROM product_series WHERE name = 'G-Coin'), '100 G-Coin', '2821030140109834559', '2025-07-09 16:03:54', '快樂無邊', '808-Unicard', 5.88, 25, 29),
('自用', 'S06831-LJNK-BEXJ-LWV74', (SELECT id FROM product_series WHERE name = 'G-Coin'), '11,200 G-Coin', '2821052858067834559', '2025-07-09 16:09:08', '快樂無邊', '808-Unicard', 615, 2594, 2749),
('未售', 'S06831-F6KN-E7DK-YNSWQ', (SELECT id FROM product_series WHERE name = 'G-Coin'), '11,200 G-Coin', '2821276778305834559', '2025-07-09 18:24:59', '歐皇電玩', '808-Unicard', 625, 2636, 2749);

-- 插入預訂
INSERT INTO reservations (inventory_item_id, customer_id, reservation_time, expected_price, status) VALUES
((SELECT id FROM inventory_items WHERE cd_key = 'S06831-F6KN-E7DK-YNSWQ'), (SELECT id FROM customers WHERE name = '何晟全'), '2024-08-01 10:30:00', 2749.00, 'confirmed');

-- 插入交易
INSERT INTO transactions (inventory_item_id, customer_id, transaction_type, amount, payment_method, my_payment_method, my_bank_code, my_account_number, customer_bank_code, customer_account_number, customer_account_name) VALUES
((SELECT id FROM inventory_items WHERE cd_key = 'S06831-F6KN-E7DK-YNSWQ'), (SELECT id FROM customers WHERE name = '何晟全'), '銷售', 2749, '銀行轉帳', '台新銀行', '812', '123456789012', '700', '123456789012', '何晟全');

-- 插入活動記錄
INSERT INTO activity_logs (type, title, description, amount, related_item_id, related_customer_id) VALUES
('銷售', '商品售出', 'G-Coin 11,200 已售出給 何晟全', 2749.00, (SELECT id FROM inventory_items WHERE cd_key = 'S06831-F6KN-E7DK-YNSWQ'), (SELECT id FROM customers WHERE name = '何晟全')),
('預訂', '新預訂', 'G-Coin 100 被 何晟全 預訂', 2749.00, (SELECT id FROM inventory_items WHERE cd_key = 'S06826-ZVLM-ZDSU-NDGN2'), (SELECT id FROM customers WHERE name = '何晟全')),
('進貨', '進貨完成', '從 歐皇電玩 進貨 5 件商品', 13180.00, NULL, NULL),
('退款', '退款處理', '淘已退款處理完成', 2749.00, NULL, NULL);
```

## 7. 建立檢視 (Views) 以簡化查詢

```sql
-- 庫存概覽檢視
CREATE VIEW inventory_overview AS
SELECT 
  ii.id,
  ii.status,
  ii.cd_key,
  ps.name as series_name,
  ii.product_name,
  ii.suggested_price,
  ii.store,
  ii.purchase_amount_twd,
  ii.created_at,
  r.reservation_time,
  c.name as customer_name,
  c.phone as customer_phone
FROM inventory_items ii
LEFT JOIN product_series ps ON ii.series_id = ps.id
LEFT JOIN reservations r ON ii.id = r.inventory_item_id AND r.status = 'confirmed'
LEFT JOIN customers c ON r.customer_id = c.id;

-- 預訂詳情檢視
CREATE VIEW reservation_details AS
SELECT 
  r.id,
  r.reservation_time,
  r.expected_price,
  r.status,
  r.notes,
  c.name as customer_name,
  c.phone as customer_phone,
  c.pubg_nickname,
  ii.cd_key,
  ii.product_name,
  ps.name as series_name,
  r.created_at
FROM reservations r
JOIN customers c ON r.customer_id = c.id
JOIN inventory_items ii ON r.inventory_item_id = ii.id
JOIN product_series ps ON ii.series_id = ps.id;

-- 統計資料檢視
CREATE VIEW dashboard_stats AS
SELECT 
  COUNT(*) as total_inventory,
  COUNT(CASE WHEN status = '未售' THEN 1 END) as available_items,
  COUNT(CASE WHEN status = '預訂' THEN 1 END) as reserved_items,
  COUNT(CASE WHEN status = '已售' THEN 1 END) as sold_items,
  SUM(CASE WHEN status = '已售' THEN suggested_price ELSE 0 END) as total_revenue
FROM inventory_items;

-- 交易詳情檢視
CREATE VIEW transaction_details AS
SELECT 
  t.id,
  t.transaction_type,
  t.amount,
  t.payment_method,
  t.transaction_date,
  t.notes,
  c.name as customer_name,
  c.phone as customer_phone,
  ii.cd_key,
  ii.product_name,
  ps.name as series_name,
  -- 我方收款資訊
  t.my_payment_method,
  t.my_bank_code,
  t.my_account_number,
  -- 顧客付款資訊
  t.customer_bank_code,
  t.customer_account_number,
  t.customer_account_name,
  t.created_at
FROM transactions t
LEFT JOIN customers c ON t.customer_id = c.id
LEFT JOIN inventory_items ii ON t.inventory_item_id = ii.id
LEFT JOIN product_series ps ON ii.series_id = ps.id;
```

## 8. 使用方式

### 在 Vue 組件中使用

```vue
<script setup>
import { useInventory, useReservations, useCustomers, useTransactions } from '@/composables/useSupabase'

const inventory = useInventory()
const reservations = useReservations()
const customers = useCustomers()
const transactions = useTransactions()

// 載入資料
onMounted(async () => {
  await inventory.fetchInventory()
  await reservations.fetchReservations()
  await customers.fetchCustomers()
  await transactions.fetchTransactions()
})

// 新增庫存商品
const createInventoryItem = async () => {
  await inventory.createInventoryItem({
    cd_key: 'S06831-F6KN-E7DK-YNSWQ',
    series_id: 'series-uuid',
    product_name: '11,200 G-Coin',
    suggested_price: 2749.00,
    store: '歐皇電玩',
    purchase_amount_twd: 2636.00
  })
}

// 新增交易
const createTransaction = async () => {
  await transactions.createTransaction({
    inventory_item_id: 'item-uuid',
    customer_id: 'customer-uuid',
    transaction_type: '銷售',
    amount: 2749.00,
    payment_method: '銀行轉帳',
    my_payment_method: '台新銀行',
    my_bank_code: '812',
    my_account_number: '123456789012',
    customer_bank_code: '700',
    customer_account_number: '123456789012',
    customer_account_name: '何晟全'
  })
}
</script>
```

### 在 API 服務中使用

```typescript
import { supabaseServices } from '@/services/supabaseService'

// 獲取庫存概覽
const { data, error } = await supabaseServices.inventory.getOverview()

// 新增預訂
const { data, error } = await supabaseServices.reservations.create({
  inventory_item_id: 'item-uuid',
  customer_id: 'customer-uuid',
  reservation_time: '2024-08-01 10:30:00',
  expected_price: 2749.00
})

// 新增交易
const { data, error } = await supabaseServices.transactions.create({
  inventory_item_id: 'item-uuid',
  customer_id: 'customer-uuid',
  transaction_type: '銷售',
  amount: 2749.00,
  payment_method: '銀行轉帳',
  my_payment_method: '台新銀行',
  my_bank_code: '812',
  my_account_number: '123456789012',
  customer_bank_code: '700',
  customer_account_number: '123456789012',
  customer_account_name: '何晟全'
})
```

## 9. 注意事項

1. **環境變數**: 確保 `.env` 檔案中的 Supabase URL 和 Key 正確
2. **CORS 設定**: 在 Supabase Dashboard 中設定允許的域名
3. **認證**: 如果需要用戶認證功能，需要在 Supabase 中設定 Auth 設定
4. **備份**: 定期備份資料庫資料
5. **監控**: 使用 Supabase 的 Logs 功能監控 API 使用情況

## 10. 故障排除

### 常見錯誤

1. **環境變數未設定**
   - 檢查 `.env` 檔案是否存在
   - 確認變數名稱正確

2. **CORS 錯誤**
   - 在 Supabase Dashboard 中設定允許的域名
   - 檢查瀏覽器開發者工具的網路標籤

3. **認證錯誤**
   - 確認 RLS 政策設定正確
   - 檢查用戶是否已登入

4. **資料庫連接錯誤**
   - 確認 Supabase 專案狀態
   - 檢查網路連接 