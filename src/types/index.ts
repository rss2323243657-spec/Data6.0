export interface ItemPerformanceRow {
  itemId: string;
  sku: string;
  itemName?: string;
  spu?: string;
  adSpend: number;
  impressions: number;
  clicks: number;
  orders: number;
  attributedSales: number;
  unitsSold: number;
  ctr?: number;
  cpc?: number;
  cvr?: number;
  roas?: number;
  acos?: number;
  rawRow?: Record<string, any>;
}

export interface InventoryHealthRow {
  sku: string;
  itemId?: string;
  spu?: string;
  totalInventory: number;
  availableInventory: number;
  reservedInventory: number;
  inboundInventory: number;
  age0_30: number;
  age31_90: number;
  age91_180: number;
  age181_270: number;
  age271_365: number;
  age365_450: number;
  age450Plus: number;
  rawRow?: Record<string, any>;
}

export interface StorageFeeRow {
  sku?: string;
  itemId?: string;
  spu?: string;
  normalStorageFee: number;
  storageFee365_450: number;
  storageFee450Plus: number;
  totalStorageFee: number;
  rawRow?: Record<string, any>;
}

export interface ReturnOrderRow {
  returnOrderId: string;
  orderId?: string;
  returnDate?: string;
  sku: string;
  itemId?: string;
  spu?: string;
  returnQty: number;
  returnAmount: number;
  returnReason: string;
  keepIt: boolean;
  returnStatus: string; // 'Completed', 'Cancelled', 'Pending', etc.
  sellerResponsible: boolean;
  responsibleParty?: 'Seller' | 'Walmart' | 'Customer';
  refundCoveredBy?: string;
  rawRow?: Record<string, any>;
}

export interface ERPOrderRow {
  orderId: string;
  orderDate: string; // YYYY-MM-DD
  sku: string;
  unitPrice: number;
  shippedQty: number;
  orderAmount: number;
  unitCostRmb?: number;
  orderStatus: string; // 'Shipped', 'Delivered', 'Cancelled', etc.
  rawRow?: Record<string, any>;
}

export interface ProductCatalogRow {
  itemId: string;
  sku: string;
  spu: string;
  productType: string;
  productName?: string;
}

export interface ManualInputs {
  month: string; // e.g., '2026-08'
  headFreightRmb: number; // 月度总头程 RMB
  totalProductCostRmb: number; // 月度总产品成本 RMB (当ERP无SKU级成本时使用)
  exchangeRate: number; // 汇率 USD/RMB，例如 7.20
  otherExpensesUsd: number; // 其他费用 USD
  otherExpensesRmb: number; // 其他费用 RMB
  costAllocationMethod: 'erp_first' | 'sales_ratio'; // ERP真实成本优先 vs 销售额分摊
}

export interface DataQualityReport {
  sources: {
    name: string;
    totalRows: number;
    validRows: number;
    excludedRows: number;
    exclusionReasons: string[];
    matchRatePct: number;
  }[];
  duplicateOrdersCount: number;
  cancelledOrdersExcludedCount: number;
  cancelledReturnsExcludedCount: number;
  unmatchedItemIdsCount: number;
  unmatchedSkusCount: number;
  amountDiscrepanciesCount: number;
  dataCredibility: '高 (数据完备且一致)' | '中 (部分分摊/轻微不一致)' | '低 (主键缺失较多)';
  notes: string[];
}

export interface SkuMetric {
  sku: string;
  itemId: string;
  spu: string;
  productType: string;
  productName: string;
  
  // Sales
  salesAmount: number;
  salesQty: number;
  orderCount: number;
  unitPrice: number;
  effectiveSalesQty: number; // salesQty - returnQty
  
  // Advertising
  adSpend: number;
  adSales: number;
  impressions: number;
  clicks: number;
  adOrders: number;
  ctr: number;
  cpc: number;
  cvr: number;
  roas: number;
  acos: number;
  adSpendSalesRatio: number;
  
  // Cost & Profit
  productCostUsd: number;
  isCostAllocated: boolean;
  headFreightUsd: number;
  storageFeeUsd: number;
  normalStorageFeeUsd: number;
  highAgingStorageFeeUsd: number;
  returnQty: number;
  returnAmount: number;
  returnRate: number;
  returnAmountRate: number;
  keepItQty: number;
  keepItLossUsd: number;
  sellerResponsibleQty: number;
  operatingProfitUsd: number;
  operatingProfitMargin: number;
  
  // Inventory
  totalInventory: number;
  availableInventory: number;
  age0_90: number;
  age91_365: number;
  age365Plus: number;
  daysOfSupply: number;
  
  // Diagnosis & Quadrant
  salesProfitQuadrant: 'Core' | 'Potential' | 'ProfitOptimize' | 'Clearance';
  adProfitQuadrant: 'HighAdHighProfit' | 'HighAdLowProfit' | 'LowAdHighProfit' | 'LowAdLowProfit';
  inventoryHealthTag: 'Healthy' | 'StockoutRisk' | 'Overstock' | 'ClearanceUrgent' | 'AdStockConflict';
  anomalies: string[];
  recommendedAction: string;
}

export interface SpuMetric {
  spu: string;
  productType: string;
  skuCount: number;
  skus: string[];
  salesAmount: number;
  salesQty: number;
  orderCount: number;
  adSpend: number;
  adSales: number;
  roas: number;
  acos: number;
  adSpendRatio: number;
  productCostUsd: number;
  headFreightUsd: number;
  storageFeeUsd: number;
  highAgingStorageFeeUsd: number;
  returnQty: number;
  returnAmount: number;
  returnRate: number;
  operatingProfitUsd: number;
  operatingProfitMargin: number;
  totalInventory: number;
  highAgingInventory: number;
}

export interface ProductTypeMetric {
  productType: string;
  skuCount: number;
  spuCount: number;
  salesAmount: number;
  salesQty: number;
  adSpend: number;
  adSales: number;
  returnQty: number;
  returnAmount: number;
  storageFeeUsd: number;
  operatingProfitUsd: number;
  operatingProfitMargin: number;
}

export interface CoreFinancialMetrics {
  salesRevenue: number;
  orderCount: number;
  salesUnits: number;
  averageOrderValue: number;
  
  adSpend: number;
  adSales: number;
  roas: number;
  acos: number;
  adSpendToSalesPct: number;
  
  returnUnits: number;
  returnAmount: number;
  returnRatePct: number;
  returnAmountRatePct: number;
  keepItUnits: number;
  keepItLossUsd: number;
  sellerResponsibleRatePct: number;
  
  totalStorageFee: number;
  normalStorageFee: number;
  storageFee365_450: number;
  storageFee450Plus: number;
  highAgingStorageFeePct: number;
  
  productCostUsd: number;
  headFreightUsd: number;
  otherExpensesUsd: number;
  
  totalOperatingCost: number;
  operatingProfit: number;
  operatingProfitMargin: number;
}

export interface MonthOverMonthDiff {
  salesGrowthPct: number;
  ordersGrowthPct: number;
  unitsGrowthPct: number;
  adSpendGrowthPct: number;
  storageGrowthPct: number;
  returnGrowthPct: number;
  profitGrowthPct: number;
  profitMarginDiffPts: number;
}

export interface HealthScoreBreakdown {
  totalScore: number;
  level: '优秀' | '健康' | '正常' | '需要重点改善' | '高风险';
  salesScore: number;      // max 20
  profitScore: number;     // max 25
  adScore: number;         // max 15
  inventoryScore: number;  // max 15
  returnScore: number;     // max 10
  storageScore: number;    // max 10
  catalogScore: number;    // max 5
  explanation: string[];
}

export interface Top10ProblemItem {
  id: string;
  problem: string;
  dataEvidence: string;
  impact: string;
  rootCause: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  solution: string;
  affectedSkus: string[];
}

export interface Top10OpportunityItem {
  id: string;
  opportunity: string;
  target: string;
  dataEvidence: string;
  opportunityReason: string;
  suggestedAction: string;
  expectedImpact: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface ActionPlanItem {
  priorityRank: number; // 1 to 5
  what: string;
  why: string;
  targetSkusOrSpus: string;
  dataEvidence: string;
  expectedResolution: string;
}

export interface NextMonthStrategyState {
  adBudgetAction: {
    increase: { sku: string; reason: string }[];
    maintain: { sku: string; reason: string }[];
    decrease: { sku: string; reason: string }[];
    pause: { sku: string; reason: string }[];
    test: { sku: string; reason: string }[];
  };
  inventoryAction: {
    urgentRestock: { sku: string; currentStock: number; daysOfSupply: number; reason: string }[];
    normalRestock: { sku: string; currentStock: number; daysOfSupply: number; reason: string }[];
    delayRestock: { sku: string; currentStock: number; daysOfSupply: number; reason: string }[];
    stopRestock: { sku: string; currentStock: number; daysOfSupply: number; reason: string }[];
    clearance: { sku: string; currentStock: number; aging365Plus: number; storageFee: number; reason: string }[];
  };
  productAction: {
    core: string[];
    potential: string[];
    optimize: string[];
    inefficient: string[];
    lossMaking: string[];
    clearance: string[];
    newProducts: string[];
  };
  targets: {
    targetSales: number;
    targetOrders: number;
    targetProfit: number;
    targetAdBudget: number;
    targetRoas: number;
    targetReturnRate: number;
    targetStorageFee: number;
  };
}

export interface AnalysisResult {
  month: string;
  dataQuality: DataQualityReport;
  coreFinancials: CoreFinancialMetrics;
  lastMonthFinancials?: CoreFinancialMetrics;
  momComparison?: MonthOverMonthDiff;
  skuMetrics: SkuMetric[];
  spuMetrics: SpuMetric[];
  productTypeMetrics: {
    productType: string;
    salesAmount: number;
    salesSharePct: number;
    profitAmount: number;
    adSpend: number;
    inventory: number;
  }[];
  healthScore: HealthScoreBreakdown;
  salesAdProfitLinkage: {
    caseType: '健康增长' | '广告/成本侵蚀利润' | '主动收缩' | '高风险' | '自然增长较好';
    description: string;
    details: string;
  };
  salesReturnLinkage: {
    salesGrowthPct: number;
    returnGrowthPct: number;
    isReturnSurging: boolean;
    description?: string;
    highLossSkus: { sku: string; returnAmount: number; returnRate: number; keepItLoss: number }[];
    highReturnSkus?: { sku: string; salesQty: number; returnUnits: number; returnRatePct: number; returnAmount: number; reason: string }[];
    topReturnReasons: { reason: string; count: number; pct: number }[];
  };
  inventorySalesLinkage: {
    description?: string;
    stockoutRisks?: { sku: string; daysOfSupply: number; currentStock: number; dailySales: number }[];
    overstockRisks?: { sku: string; daysOfSupply: number; currentStock: number; dailySales: number }[];
    stockoutRiskSkus: string[];
    overstockSkus: string[];
    clearanceUrgentSkus: string[];
  };
  inventoryAdLinkage: {
    description?: string;
    mismatchCases?: { mismatchType: string; sku: string; stock: number; adSpend: number; suggestedAction: string }[];
    conflictSkus: { sku: string; adSpend: number; availableStock: number; note: string }[];
    pressureSkus: { sku: string; stock: number; adSpend: number; note: string }[];
  };
  agingStorageLinkage: {
    description?: string;
    normalStoragePct: number;
    storageFee365_450Pct: number;
    storageFee450PlusPct: number;
    highAgingFeePct: number;
    highAgingStoragePct?: number;
    riskSkus?: { sku: string; aging365PlusQty: number; highAgingStorageFee: number; action: string }[];
    topStorageSkus: { sku: string; fee: number; aging365PlusStock: number }[];
    isStorageDeteriorating: boolean;
  };
  returnBreakdown?: {
    responsibility: {
      sellerQty: number;
      sellerAmount: number;
      sellerPct: number;
      walmartQty: number;
      walmartAmount: number;
      walmartPct: number;
      customerQty: number;
      customerAmount: number;
      customerPct: number;
    };
    keepIt: {
      keepItQty: number;
      keepItAmount: number;
      keepItPct: number;
      physicalQty: number;
      physicalAmount: number;
      physicalPct: number;
    };
    byCategory: { category: string; returnQty: number; returnAmount: number; returnRatePct: number }[];
    bySpu: { spu: string; returnQty: number; returnAmount: number; returnRatePct: number }[];
  };
  top10Problems: Top10ProblemItem[];
  top10Opportunities: Top10OpportunityItem[];
  nextMonthStrategy: NextMonthStrategyState;
  executiveTop5Priorities: ActionPlanItem[];
  executiveSummaryText: string[];
}

export interface RawUploadedData {
  productCatalog: ProductCatalogRow[];
  erpOrders: ERPOrderRow[];
  itemPerformance: ItemPerformanceRow[];
  inventoryHealth: InventoryHealthRow[];
  storageFees: StorageFeeRow[];
  returnOrders: ReturnOrderRow[];
}

export type ManualCostInput = ManualInputs & {
  totalHeadFreightRmb?: number;
  freightAllocationMethod?: 'erp_first' | 'sales_ratio';
  storageAllocationMethod?: 'actual_first' | 'sales_ratio';
};

export type SKUMetrics = SkuMetric;
export type SPUMetrics = SpuMetric;

