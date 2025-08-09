# 修復資料庫問題指南

## 問題描述
您的 Supabase 資料庫中的某些欄位被錯誤地定義為 `timestamp` 類型，但實際上應該是 `text` 類型，導致資料無法正確導入。

## 錯誤訊息
- `invalid input syntax for type timestamp with time zone: "全盈支付"`
- `invalid input syntax for type timestamp with time zone: "拾柒"`
- `invalid input syntax for type numeric: "11:53:58.923324+00"`

## 解決步驟

### 步驟 1：修復資料庫表格結構

1. 登入您的 Supabase 控制台：https://supabase.com/dashboard
2. 選擇您的專案
3. 進入 SQL Editor
4. 執行以下 SQL 命令：

```sql
-- 修復銀行資料表
ALTER TABLE our_bank_data ALTER COLUMN bank_name TYPE text;
ALTER TABLE our_bank_data ALTER COLUMN bank_branche_name TYPE text;

-- 修復客戶表
ALTER TABLE customer ALTER COLUMN nickname TYPE text;

-- 修復庫存項目表
ALTER TABLE inventory_item ALTER COLUMN purchase_store TYPE text;
ALTER TABLE inventory_item ALTER COLUMN purchase_payment_method TYPE text;
ALTER TABLE inventory_item ALTER COLUMN purchase_order_number TYPE text;

-- 修復交易表
ALTER TABLE transaction ALTER COLUMN our_payment_method TYPE text;
ALTER TABLE transaction ALTER COLUMN our_bank_data TYPE text;
ALTER TABLE transaction ALTER COLUMN customer_payment_method TYPE text;
ALTER TABLE transaction ALTER COLUMN customer_bank_code TYPE text;
ALTER TABLE transaction ALTER COLUMN customer_bank_account TYPE text;
ALTER TABLE transaction ALTER COLUMN customer_account_name TYPE text;
```

### 步驟 2：重新導入資料

執行修復腳本：

```bash
node fix-inventory-data.js
```

### 步驟 3：驗證修復

執行測試腳本：

```bash
node test-supabase-connection.js
```

## 預期結果

修復完成後，您應該看到：
- `inventory_item` 表: 61 筆資料
- `customer` 表: 17 筆資料
- `our_bank_data` 表: 15 筆資料

## 如果問題持續

如果執行 SQL 命令後仍然有問題，請：

1. 檢查 Supabase 控制台中的錯誤訊息
2. 確認表格結構是否已正確修改
3. 重新執行資料導入腳本

## 聯繫支援

如果問題仍然存在，請提供：
1. Supabase 控制台中的錯誤截圖
2. 執行 SQL 命令後的結果截圖
3. 資料導入腳本的完整輸出 