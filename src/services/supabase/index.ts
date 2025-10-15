// 統一導出所有 Supabase 服務

// 通用型別
export type { ApiResponse, SupabaseError } from './types'

// 庫存服務
export { InventoryService } from './inventory.service'

// 交易與客戶服務
export { TransactionService, CustomerService } from './transaction.service'

// 商品服務
export { ProductService, ProductCategoryService } from './product.service'

// 付款與銀行服務
export { PaymentMethodService, OurBankDataService } from './payment.service'

// 統計服務
export { StatisticsService } from './statistics.service'

// 新聞服務
export { NewsService } from './news.service'

// 網站內容服務
export { HomepageHeroService, PriceListService } from './content.service'

// 訊息管理服務
export { CannedMessageService } from './message.service'

// 戰隊申請服務
export { ClanApplicationService, ApplicationStatusService } from './clan.service'


