-- 修復資料庫表格結構
-- 請在 Supabase 控制台的 SQL Editor 中執行這些命令

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