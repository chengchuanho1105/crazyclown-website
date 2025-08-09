<script setup lang="ts">
defineOptions({
  name: 'TestPage2'
})
</script>

<template>
  <!-- 彈出視窗 編輯交易資料用 -->
  <div class="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-1/2 -translate-y-1/2 mx-auto my-auto w-full max-w-4xl bg-white rounded-lg shadow-lg">

      <h2 class="p-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-widest">編輯資料</h2>

      <div class="w-full z-10 mb-4 bg-black/20 dark:bg-white/20 rounded-full">
        <div class="w-1/2 border-2 border-indigo-400 rounded-full"></div>
      </div>

      <!-- 商品資料 -->
      <div class="flex flex-col gap-2 mb-8 px-4">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8 flex flex-col">
            <label for="product-id" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">庫存 UUID</label>
            <input type="text" id="product-id"
            class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25"
              disabled>
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="product-category" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">商品狀態</label>
            <input type="text" id="product-status"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="product-category" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">商品分類</label>
            <input type="text" id="product-category"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="product-series" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">商品系列</label>
            <input type="text" id="product-series"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="product-name" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">商品名稱</label>
            <input type="text" id="product-name"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-12 flex flex-col">
            <label for="cd_key" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">cd_key</label>
            <input type="text" id="cd_key"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="inbound-time" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">進貨日期及時間</label>
            <input type="datetime-local" id="inbound-time"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="inbound-number" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">進貨編號</label>
            <input type="text" id="inbound-number"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="inbound-store" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">進貨店家</label>
            <input type="text" id="inbound-store"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="payment-method" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">付款方式</label>
            <input type="text" id="payment-method"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="inbound-amount-cny" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">進貨金額(CNY)</label>
            <input type="number" id="inbound-amount-cny"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="inbound-amount-twd" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">進貨金額(TWD)</label>
            <input type="number" id="inbound-amount-twd"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="suggested-price" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">建議價格</label>
            <input type="number" id="suggested-price"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
        </div>
      </div>
      <hr class="my-4 border-zinc-200">
      <!-- 銷貨資料 -->
      <div class="flex flex-col gap-2 mb-8 px-4">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8 flex flex-col">
            <label for="sale-uuid" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">銷貨 UUID</label>
            <input type="text" id="sale-uuid"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25"
              disabled>
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="sale-time" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">銷貨日期及時間</label>
            <input type="datetime-local" id="sale-time"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-6 flex flex-col">
            <label for="my-payment-method" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">我方收款方式</label>
            <input type="text" id="my-payment-method"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-6 flex flex-col">
            <label for="my-account" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">我方收款帳號</label>
            <input type="text" id="my-account"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-payment-method" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客付款方式</label>
            <input type="text" id="customer-payment-method"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-8 flex flex-col">
            <label for="customer-account-name" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客付款帳號名稱</label>
            <input type="text" id="customer-account-name"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-bank-code" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客付款銀行代號</label>
            <input type="text" id="customer-bank-code"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-8 flex flex-col">
            <label for="customer-bank-account" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客付款銀行帳號</label>
            <input type="text" id="customer-bank-account"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="actual-price" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">實際售價</label>
            <input type="number" id="actual-price"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="actual-amount" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">實收金額</label>
            <input type="number" id="actual-amount"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="difference" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">款項差異</label>
            <input type="number" id="difference"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
        </div>
      </div>
      <hr class="my-4 border-zinc-200">
      <!-- 顧客資料 -->
      <div class="flex flex-col gap-2 px-4">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-8 flex flex-col">
            <label for="customer-id" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">客戶 ID</label>
            <input type="text" id="customer-id"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-id-number" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客身份證字號</label>
            <input type="text" id="customer-id-number"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-name" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">客戶姓名</label>
            <input type="text" id="customer-name"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-nickname" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">客戶暱稱</label>
            <input type="text" id="customer-nickname"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="customer-phone" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客連絡電話</label>
            <input type="text" id="customer-phone"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-12 flex flex-col">
            <label for="customer-address" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客地址</label>
            <input type="text" id="customer-address"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="customer-contact-method" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">顧客聯絡方式</label>
            <input type="text" id="customer-contact-method"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="contact-method-id" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">聯絡方式 ID</label>
            <input type="text" id="contact-method-id"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="contact-method-account" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">聯絡方式帳號</label>
            <input type="text" id="contact-method-account"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-3 flex flex-col">
            <label for="contact-method-nickname" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">聯絡方式暱稱</label>
            <input type="text" id="contact-method-nickname"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="pubg-nickname" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">PUBG Nickname</label>
            <input type="text" id="pubg-nickname"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="pubg-account-id" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">PUBG Account ID</label>
            <input type="text" id="pubg-account-id"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
          <div class="col-span-4 flex flex-col">
            <label for="steam-id" class="text-sm relative top-2.5 ml-2 px-1 bg-white w-fit">Steam ID</label>
            <input type="text" id="steam-id"
              class="pt-2 py-1 px-3 border border-zinc-200 focus:border-indigo-500 focus:outline-none rounded-lg placeholder:text-black/25">
          </div>
        </div>
      </div>

      <hr class="my-4 border-zinc-200">
      <div class="flex justify-end gap-2 px-4 pb-4">
        <button class="px-4 py-1 bg-zinc-200 rounded-md">取消</button>
        <button class="px-4 py-1 bg-indigo-500 text-white rounded-md">編輯</button>
      </div>
    </div>
  </div>
</template>
