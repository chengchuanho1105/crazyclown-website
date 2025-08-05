# HTML 拍扁腳本使用說明

## 功能

- 將 HTML/Vue 文件拍扁（移除換行和空格）
- 將雙引號替換為單引號
- 另存為 txt 文件

## 使用方法

### 基本用法

```bash
node scripts/flatten-html.js <輸入文件>
```

### 指定輸出文件

```bash
node scripts/flatten-html.js <輸入文件> <輸出文件>
```

## 範例

### 處理 Vue 文件

```bash
node scripts/flatten-html.js src/pages/test.vue
```

輸出：`src/pages/test.flattened.txt`

### 處理 HTML 文件

```bash
node scripts/flatten-html.js index.html
```

輸出：`index.flattened.txt`

### 指定輸出文件名

```bash
node scripts/flatten-html.js src/pages/test.vue output.txt
```

## 處理效果

- ✅ 移除所有換行符
- ✅ 移除多餘空格
- ✅ 將雙引號替換為單引號
- ✅ 顯示壓縮統計信息

## 輸出範例

原始 HTML：

```html
<div class="container">
  <h1>標題</h1>
  <p>內容</p>
</div>
```

處理後：

```html
<div class="container">
  <h1>標題</h1>
  <p>內容</p>
</div>
```
