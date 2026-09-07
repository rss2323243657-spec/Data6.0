import {
  ProductCatalogRow,
  ERPOrderRow,
  ItemPerformanceRow,
  InventoryHealthRow,
  StorageFeeRow,
  ReturnOrderRow,
  ManualInputs
} from '../types';

export const SAMPLE_CATALOG: ProductCatalogRow[] = [
  { itemId: 'WMT-70101', sku: 'SKU-CHAIR-BLK', spu: 'SPU-CHAIR', productType: '办公家具', productName: '人体工学网布办公椅 (黑色尊贵版)' },
  { itemId: 'WMT-70102', sku: 'SKU-CHAIR-GRY', spu: 'SPU-CHAIR', productType: '办公家具', productName: '人体工学网布办公椅 (浅灰透气版)' },
  { itemId: 'WMT-70103', sku: 'SKU-CHAIR-WHT', spu: 'SPU-CHAIR', productType: '办公家具', productName: '现代极简皮面电脑椅 (纯白轻奢款)' },
  { itemId: 'WMT-80201', sku: 'SKU-DESK-MOTO', spu: 'SPU-DESK', productType: '智能升降桌', productName: '双电机电动升降办公桌 (胡桃木色 55寸)' },
  { itemId: 'WMT-80202', sku: 'SKU-DESK-MANU', spu: 'SPU-DESK', productType: '智能升降桌', productName: '手动手摇调节升降桌 (橡木原色 48寸)' },
  { itemId: 'WMT-80203', sku: 'SKU-DESK-CORNER', spu: 'SPU-DESK', productType: '智能升降桌', productName: 'L型转角双电机升降电竞桌 (碳纤黑)' },
  { itemId: 'WMT-90301', sku: 'SKU-ARM-SNGL', spu: 'SPU-ARM', productType: '办公配件', productName: '铝合金气压单屏幕显示器支架 (17-32寸)' },
  { itemId: 'WMT-90302', sku: 'SKU-ARM-DUAL', spu: 'SPU-ARM', productType: '办公配件', productName: '重型双联机械臂显示器支架 (带USB3.0)' },
  { itemId: 'WMT-90303', sku: 'SKU-ARM-TRPL', spu: 'SPU-ARM', productType: '办公配件', productName: '三屏独立多角度悬臂显示器支架' },
  { itemId: 'WMT-60401', sku: 'SKU-ACC-MAT', spu: 'SPU-ACC', productType: '健康工位配件', productName: '站立办公抗疲劳缓压脚垫 (加厚菱形纹)' },
  { itemId: 'WMT-60402', sku: 'SKU-ACC-FOOT', spu: 'SPU-ACC', productType: '健康工位配件', productName: '可调节角度按摩滚轮人体工学搁脚凳' },
  { itemId: 'WMT-60403', sku: 'SKU-ACC-MOUSE', spu: 'SPU-ACC', productType: '健康工位配件', productName: '握手式无线垂直静音人体工学鼠标' }
];

export const SAMPLE_MANUAL_INPUTS: ManualInputs = {
  month: '2026-08',
  headFreightRmb: 52000,
  totalProductCostRmb: 418000,
  exchangeRate: 7.20,
  otherExpensesUsd: 1850,
  otherExpensesRmb: 3600,
  costAllocationMethod: 'erp_first'
};

export const SAMPLE_ERP_ORDERS: ERPOrderRow[] = [
  // SKU-CHAIR-BLK: 220 units, $189.99, cost RMB 460
  { orderId: 'ORD-202608-001', orderDate: '2026-08-02', sku: 'SKU-CHAIR-BLK', unitPrice: 189.99, shippedQty: 60, orderAmount: 11399.40, unitCostRmb: 460, orderStatus: 'Shipped' },
  { orderId: 'ORD-202608-002', orderDate: '2026-08-11', sku: 'SKU-CHAIR-BLK', unitPrice: 189.99, shippedQty: 75, orderAmount: 14249.25, unitCostRmb: 460, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-003', orderDate: '2026-08-20', sku: 'SKU-CHAIR-BLK', unitPrice: 189.99, shippedQty: 85, orderAmount: 16149.15, unitCostRmb: 460, orderStatus: 'Shipped' },
  { orderId: 'ORD-202608-004', orderDate: '2026-08-25', sku: 'SKU-CHAIR-BLK', unitPrice: 189.99, shippedQty: 10, orderAmount: 1899.90, unitCostRmb: 460, orderStatus: 'Cancelled' }, // Should be excluded!

  // SKU-CHAIR-GRY: 180 units, $179.99, cost RMB 440
  { orderId: 'ORD-202608-011', orderDate: '2026-08-04', sku: 'SKU-CHAIR-GRY', unitPrice: 179.99, shippedQty: 80, orderAmount: 14399.20, unitCostRmb: 440, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-012', orderDate: '2026-08-18', sku: 'SKU-CHAIR-GRY', unitPrice: 179.99, shippedQty: 100, orderAmount: 17999.00, unitCostRmb: 440, orderStatus: 'Shipped' },

  // SKU-CHAIR-WHT: 25 units, $169.99, cost RMB 430 (Aging issue)
  { orderId: 'ORD-202608-021', orderDate: '2026-08-08', sku: 'SKU-CHAIR-WHT', unitPrice: 169.99, shippedQty: 15, orderAmount: 2549.85, unitCostRmb: 430, orderStatus: 'Shipped' },
  { orderId: 'ORD-202608-022', orderDate: '2026-08-22', sku: 'SKU-CHAIR-WHT', unitPrice: 169.99, shippedQty: 10, orderAmount: 1699.90, unitCostRmb: 430, orderStatus: 'Delivered' },

  // SKU-DESK-MOTO: 110 units, $359.99, cost RMB 920 (High ticket star)
  { orderId: 'ORD-202608-031', orderDate: '2026-08-05', sku: 'SKU-DESK-MOTO', unitPrice: 359.99, shippedQty: 50, orderAmount: 17999.50, unitCostRmb: 920, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-032', orderDate: '2026-08-19', sku: 'SKU-DESK-MOTO', unitPrice: 359.99, shippedQty: 60, orderAmount: 21599.40, unitCostRmb: 920, orderStatus: 'Shipped' },

  // SKU-DESK-MANU: 30 units, $199.99, cost RMB 550 (Stagnant)
  { orderId: 'ORD-202608-041', orderDate: '2026-08-10', sku: 'SKU-DESK-MANU', unitPrice: 199.99, shippedQty: 30, orderAmount: 5999.70, unitCostRmb: 550, orderStatus: 'Delivered' },

  // SKU-DESK-CORNER: 90 units, $429.99, cost RMB 1150 (Ad/Stock conflict)
  { orderId: 'ORD-202608-051', orderDate: '2026-08-07', sku: 'SKU-DESK-CORNER', unitPrice: 429.99, shippedQty: 45, orderAmount: 19349.55, unitCostRmb: 1150, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-052', orderDate: '2026-08-24', sku: 'SKU-DESK-CORNER', unitPrice: 429.99, shippedQty: 45, orderAmount: 19349.55, unitCostRmb: 1150, orderStatus: 'Shipped' },

  // SKU-ARM-SNGL: 320 units, $39.99, cost RMB 90 (Steady volume)
  { orderId: 'ORD-202608-061', orderDate: '2026-08-03', sku: 'SKU-ARM-SNGL', unitPrice: 39.99, shippedQty: 150, orderAmount: 5998.50, unitCostRmb: 90, orderStatus: 'Shipped' },
  { orderId: 'ORD-202608-062', orderDate: '2026-08-17', sku: 'SKU-ARM-SNGL', unitPrice: 39.99, shippedQty: 170, orderAmount: 6798.30, unitCostRmb: 90, orderStatus: 'Delivered' },

  // SKU-ARM-DUAL: 160 units, $79.99, cost RMB 190 (High returns)
  { orderId: 'ORD-202608-071', orderDate: '2026-08-06', sku: 'SKU-ARM-DUAL', unitPrice: 79.99, shippedQty: 80, orderAmount: 6399.20, unitCostRmb: 190, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-072', orderDate: '2026-08-21', sku: 'SKU-ARM-DUAL', unitPrice: 79.99, shippedQty: 80, orderAmount: 6399.20, unitCostRmb: 190, orderStatus: 'Shipped' },

  // SKU-ARM-TRPL: 15 units, $139.99, cost RMB 360 (Low sales)
  { orderId: 'ORD-202608-081', orderDate: '2026-08-14', sku: 'SKU-ARM-TRPL', unitPrice: 139.99, shippedQty: 15, orderAmount: 2099.85, unitCostRmb: 360, orderStatus: 'Shipped' },

  // SKU-ACC-MAT: 240 units, $49.99, cost RMB 110 (Keep it issue)
  { orderId: 'ORD-202608-091', orderDate: '2026-08-09', sku: 'SKU-ACC-MAT', unitPrice: 49.99, shippedQty: 120, orderAmount: 5998.80, unitCostRmb: 110, orderStatus: 'Delivered' },
  { orderId: 'ORD-202608-092', orderDate: '2026-08-23', sku: 'SKU-ACC-MAT', unitPrice: 49.99, shippedQty: 120, orderAmount: 5998.80, unitCostRmb: 110, orderStatus: 'Shipped' },

  // SKU-ACC-FOOT: 110 units, $34.99, cost RMB 75 (Launch phase)
  { orderId: 'ORD-202608-101', orderDate: '2026-08-12', sku: 'SKU-ACC-FOOT', unitPrice: 34.99, shippedQty: 110, orderAmount: 3848.90, unitCostRmb: 75, orderStatus: 'Delivered' },

  // SKU-ACC-MOUSE: 180 units, $29.99, cost RMB 65
  { orderId: 'ORD-202608-111', orderDate: '2026-08-15', sku: 'SKU-ACC-MOUSE', unitPrice: 29.99, shippedQty: 180, orderAmount: 5398.20, unitCostRmb: 65, orderStatus: 'Shipped' }
];

export const SAMPLE_ITEM_PERFORMANCE: ItemPerformanceRow[] = [
  { itemId: 'WMT-70101', sku: 'SKU-CHAIR-BLK', itemName: '人体工学网布办公椅 (黑色尊贵版)', adSpend: 3420.00, impressions: 85000, clicks: 1780, orders: 112, attributedSales: 21278.88, unitsSold: 112 },
  { itemId: 'WMT-70102', sku: 'SKU-CHAIR-GRY', itemName: '人体工学网布办公椅 (浅灰透气版)', adSpend: 6850.00, impressions: 142000, clicks: 2980, orders: 98, attributedSales: 17639.02, unitsSold: 98 }, // Surging ad spend, low ROAS 2.57
  { itemId: 'WMT-70103', sku: 'SKU-CHAIR-WHT', itemName: '现代极简皮面电脑椅 (纯白轻奢款)', adSpend: 150.00, impressions: 5200, clicks: 88, orders: 4, attributedSales: 679.96, unitsSold: 4 },
  { itemId: 'WMT-80201', sku: 'SKU-DESK-MOTO', itemName: '双电机电动升降办公桌 (胡桃木色 55寸)', adSpend: 2800.00, impressions: 68000, clicks: 1320, orders: 64, attributedSales: 23039.36, unitsSold: 64 }, // High ROAS 8.23!
  { itemId: 'WMT-80202', sku: 'SKU-DESK-MANU', itemName: '手动手摇调节升降桌 (橡木原色 48寸)', adSpend: 320.00, impressions: 12000, clicks: 210, orders: 12, attributedSales: 2399.88, unitsSold: 12 },
  { itemId: 'WMT-80203', sku: 'SKU-DESK-CORNER', itemName: 'L型转角双电机升降电竞桌 (碳纤黑)', adSpend: 5400.00, impressions: 112000, clicks: 2150, orders: 62, attributedSales: 26659.38, unitsSold: 62 }, // High spend but low stock!
  { itemId: 'WMT-90301', sku: 'SKU-ARM-SNGL', itemName: '铝合金气压单屏幕显示器支架 (17-32寸)', adSpend: 620.00, impressions: 45000, clicks: 920, orders: 85, attributedSales: 3399.15, unitsSold: 85 }, // Efficient
  { itemId: 'WMT-90302', sku: 'SKU-ARM-DUAL', itemName: '重型双联机械臂显示器支架 (带USB3.0)', adSpend: 1950.00, impressions: 58000, clicks: 1260, orders: 74, attributedSales: 5919.26, unitsSold: 74 },
  { itemId: 'WMT-90303', sku: 'SKU-ARM-TRPL', itemName: '三屏独立多角度悬臂显示器支架', adSpend: 480.00, impressions: 18000, clicks: 310, orders: 7, attributedSales: 979.93, unitsSold: 7 }, // Poor
  { itemId: 'WMT-60401', sku: 'SKU-ACC-MAT', itemName: '站立办公抗疲劳缓压脚垫 (加厚菱形纹)', adSpend: 980.00, impressions: 49000, clicks: 1150, orders: 95, attributedSales: 4749.05, unitsSold: 95 },
  { itemId: 'WMT-60402', sku: 'SKU-ACC-FOOT', itemName: '可调节角度按摩滚轮人体工学搁脚凳', adSpend: 1150.00, impressions: 42000, clicks: 960, orders: 52, attributedSales: 1819.48, unitsSold: 52 },
  { itemId: 'WMT-60403', sku: 'SKU-ACC-MOUSE', itemName: '握手式无线垂直静音人体工学鼠标', adSpend: 820.00, impressions: 38000, clicks: 880, orders: 68, attributedSales: 2039.32, unitsSold: 68 }
];

export const SAMPLE_INVENTORY_HEALTH: InventoryHealthRow[] = [
  { sku: 'SKU-CHAIR-BLK', itemId: 'WMT-70101', totalInventory: 260, availableInventory: 240, reservedInventory: 20, inboundInventory: 150, age0_30: 160, age31_90: 80, age91_180: 20, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-CHAIR-GRY', itemId: 'WMT-70102', totalInventory: 190, availableInventory: 175, reservedInventory: 15, inboundInventory: 100, age0_30: 110, age31_90: 60, age91_180: 20, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  // SKU-CHAIR-WHT: High Aging (450+ days = 210 units)
  { sku: 'SKU-CHAIR-WHT', itemId: 'WMT-70103', totalInventory: 320, availableInventory: 310, reservedInventory: 10, inboundInventory: 0, age0_30: 10, age31_90: 20, age91_180: 30, age181_270: 20, age271_365: 30, age365_450: 80, age450Plus: 130 },
  { sku: 'SKU-DESK-MOTO', itemId: 'WMT-80201', totalInventory: 180, availableInventory: 160, reservedInventory: 20, inboundInventory: 200, age0_30: 120, age31_90: 50, age91_180: 10, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-DESK-MANU', itemId: 'WMT-80202', totalInventory: 280, availableInventory: 270, reservedInventory: 10, inboundInventory: 0, age0_30: 20, age31_90: 40, age91_180: 80, age181_270: 90, age271_365: 50, age365_450: 0, age450Plus: 0 },
  // SKU-DESK-CORNER: Low available inventory (only 18 available, sales 90/mo! Conflict with high ad spend)
  { sku: 'SKU-DESK-CORNER', itemId: 'WMT-80203', totalInventory: 28, availableInventory: 18, reservedInventory: 10, inboundInventory: 80, age0_30: 28, age31_90: 0, age91_180: 0, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-ARM-SNGL', itemId: 'WMT-90301', totalInventory: 450, availableInventory: 430, reservedInventory: 20, inboundInventory: 300, age0_30: 280, age31_90: 140, age91_180: 30, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-ARM-DUAL', itemId: 'WMT-90302', totalInventory: 220, availableInventory: 205, reservedInventory: 15, inboundInventory: 100, age0_30: 90, age31_90: 80, age91_180: 50, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-ARM-TRPL', itemId: 'WMT-90303', totalInventory: 140, availableInventory: 135, reservedInventory: 5, inboundInventory: 0, age0_30: 10, age31_90: 20, age91_180: 30, age181_270: 30, age271_365: 25, age365_450: 15, age450Plus: 10 },
  { sku: 'SKU-ACC-MAT', itemId: 'WMT-60401', totalInventory: 380, availableInventory: 360, reservedInventory: 20, inboundInventory: 200, age0_30: 200, age31_90: 120, age91_180: 60, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-ACC-FOOT', itemId: 'WMT-60402', totalInventory: 210, availableInventory: 200, reservedInventory: 10, inboundInventory: 150, age0_30: 180, age31_90: 30, age91_180: 0, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 },
  { sku: 'SKU-ACC-MOUSE', itemId: 'WMT-60403', totalInventory: 310, availableInventory: 295, reservedInventory: 15, inboundInventory: 100, age0_30: 190, age31_90: 90, age91_180: 30, age181_270: 0, age271_365: 0, age365_450: 0, age450Plus: 0 }
];

export const SAMPLE_STORAGE_FEES: StorageFeeRow[] = [
  { sku: 'SKU-CHAIR-BLK', itemId: 'WMT-70101', normalStorageFee: 165.20, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 165.20 },
  { sku: 'SKU-CHAIR-GRY', itemId: 'WMT-70102', normalStorageFee: 124.50, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 124.50 },
  // SKU-CHAIR-WHT: Heavy aged surcharge!
  { sku: 'SKU-CHAIR-WHT', itemId: 'WMT-70103', normalStorageFee: 198.80, storageFee365_450: 480.00, storageFee450Plus: 1170.00, totalStorageFee: 1848.80 },
  { sku: 'SKU-DESK-MOTO', itemId: 'WMT-80201', normalStorageFee: 210.00, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 210.00 },
  { sku: 'SKU-DESK-MANU', itemId: 'WMT-80202', normalStorageFee: 185.30, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 185.30 },
  { sku: 'SKU-DESK-CORNER', itemId: 'WMT-80203', normalStorageFee: 42.10, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 42.10 },
  { sku: 'SKU-ARM-SNGL', itemId: 'WMT-90301', normalStorageFee: 65.40, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 65.40 },
  { sku: 'SKU-ARM-DUAL', itemId: 'WMT-90302', normalStorageFee: 58.70, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 58.70 },
  { sku: 'SKU-ARM-TRPL', itemId: 'WMT-90303', normalStorageFee: 32.20, storageFee365_450: 45.00, storageFee450Plus: 70.00, totalStorageFee: 147.20 },
  { sku: 'SKU-ACC-MAT', itemId: 'WMT-60401', normalStorageFee: 48.60, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 48.60 },
  { sku: 'SKU-ACC-FOOT', itemId: 'WMT-60402', normalStorageFee: 36.10, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 36.10 },
  { sku: 'SKU-ACC-MOUSE', itemId: 'WMT-60403', normalStorageFee: 24.50, storageFee365_450: 0, storageFee450Plus: 0, totalStorageFee: 24.50 }
];

export const SAMPLE_RETURN_ORDERS: ReturnOrderRow[] = [
  // Cancelled returns (must be completely excluded!)
  { returnOrderId: 'RET-CAN-01', orderId: 'ORD-202608-001', returnDate: '2026-08-14', sku: 'SKU-CHAIR-BLK', returnQty: 2, returnAmount: 379.98, returnReason: '客户误拍', keepIt: false, returnStatus: 'Cancelled', sellerResponsible: false },
  { returnOrderId: 'RET-CAN-02', orderId: 'ORD-202608-011', returnDate: '2026-08-20', sku: 'SKU-CHAIR-GRY', returnQty: 1, returnAmount: 179.99, returnReason: '包装微破损', keepIt: false, returnStatus: 'Canceled', sellerResponsible: true },

  // SKU-CHAIR-BLK: Normal low returns (3 units, reason: 客户不需要)
  { returnOrderId: 'RET-001', orderId: 'ORD-202608-001', returnDate: '2026-08-15', sku: 'SKU-CHAIR-BLK', returnQty: 2, returnAmount: 379.98, returnReason: '客户不需要/无理由', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },
  { returnOrderId: 'RET-002', orderId: 'ORD-202608-002', returnDate: '2026-08-22', sku: 'SKU-CHAIR-BLK', returnQty: 1, returnAmount: 189.99, returnReason: '尺寸不合适', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },

  // SKU-CHAIR-GRY: 6 units returned (reasons: 颜色色差, 螺丝松动)
  { returnOrderId: 'RET-011', orderId: 'ORD-202608-011', returnDate: '2026-08-16', sku: 'SKU-CHAIR-GRY', returnQty: 3, returnAmount: 539.97, returnReason: '颜色与描述不符', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },
  { returnOrderId: 'RET-012', orderId: 'ORD-202608-012', returnDate: '2026-08-25', sku: 'SKU-CHAIR-GRY', returnQty: 3, returnAmount: 539.97, returnReason: '坐垫偏硬/不舒适', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },

  // SKU-CHAIR-WHT: 1 unit
  { returnOrderId: 'RET-021', orderId: 'ORD-202608-021', returnDate: '2026-08-26', sku: 'SKU-CHAIR-WHT', returnQty: 1, returnAmount: 169.99, returnReason: '表面轻微划痕', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },

  // SKU-DESK-MOTO: 2 units (High value, shipping damage)
  { returnOrderId: 'RET-031', orderId: 'ORD-202608-031', returnDate: '2026-08-18', sku: 'SKU-DESK-MOTO', returnQty: 2, returnAmount: 719.98, returnReason: '运输物流损坏', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },

  // SKU-DESK-MANU: 1 unit
  { returnOrderId: 'RET-041', orderId: 'ORD-202608-041', returnDate: '2026-08-20', sku: 'SKU-DESK-MANU', returnQty: 1, returnAmount: 199.99, returnReason: '手摇升降阻力大', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },

  // SKU-DESK-CORNER: 1 unit
  { returnOrderId: 'RET-051', orderId: 'ORD-202608-051', returnDate: '2026-08-27', sku: 'SKU-DESK-CORNER', returnQty: 1, returnAmount: 429.99, returnReason: '孔位略有偏差', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },

  // SKU-ARM-DUAL: High Return Alert! (18 units, 11.25% return rate! Missing screws/assembly failure)
  { returnOrderId: 'RET-071', orderId: 'ORD-202608-071', returnDate: '2026-08-12', sku: 'SKU-ARM-DUAL', returnQty: 6, returnAmount: 479.94, returnReason: '缺少五金安装螺丝配件', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },
  { returnOrderId: 'RET-072', orderId: 'ORD-202608-071', returnDate: '2026-08-19', sku: 'SKU-ARM-DUAL', returnQty: 7, returnAmount: 559.93, returnReason: '说明书错误导致无法组装', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },
  { returnOrderId: 'RET-073', orderId: 'ORD-202608-072', returnDate: '2026-08-26', sku: 'SKU-ARM-DUAL', returnQty: 5, returnAmount: 399.95, returnReason: '关节松旷下垂', keepIt: false, returnStatus: 'Completed', sellerResponsible: true },

  // SKU-ARM-SNGL: 4 units
  { returnOrderId: 'RET-061', orderId: 'ORD-202608-061', returnDate: '2026-08-13', sku: 'SKU-ARM-SNGL', returnQty: 4, returnAmount: 159.96, returnReason: '客户不需要/无理由', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },

  // SKU-ACC-MAT: High Keep It! (15 units returned, but 12 are Keep-It: Walmart refunded customer without requiring return!)
  { returnOrderId: 'RET-091', orderId: 'ORD-202608-091', returnDate: '2026-08-14', sku: 'SKU-ACC-MAT', returnQty: 6, returnAmount: 299.94, returnReason: '气味偏大', keepIt: true, returnStatus: 'Completed', sellerResponsible: true },
  { returnOrderId: 'RET-092', orderId: 'ORD-202608-092', returnDate: '2026-08-22', sku: 'SKU-ACC-MAT', returnQty: 6, returnAmount: 299.94, returnReason: '厚度不符合预期', keepIt: true, returnStatus: 'Completed', sellerResponsible: false },
  { returnOrderId: 'RET-093', orderId: 'ORD-202608-092', returnDate: '2026-08-28', sku: 'SKU-ACC-MAT', returnQty: 3, returnAmount: 149.97, returnReason: '客户误购', keepIt: false, returnStatus: 'Completed', sellerResponsible: false },

  // SKU-ACC-MOUSE: 2 units
  { returnOrderId: 'RET-111', orderId: 'ORD-202608-111', returnDate: '2026-08-25', sku: 'SKU-ACC-MOUSE', returnQty: 2, returnAmount: 59.98, returnReason: '蓝牙偶发断连', keepIt: false, returnStatus: 'Completed', sellerResponsible: true }
];

// July 2026 previous month benchmark for Month-over-Month (环比) comparison
export const SAMPLE_LAST_MONTH_METRICS = {
  salesRevenue: 138500.00,
  orderCount: 1320,
  salesUnits: 1410,
  averageOrderValue: 104.92,
  adSpend: 19800.00,
  adSales: 89000.00,
  roas: 4.49,
  acos: 0.222,
  adSpendToSalesPct: 14.30,
  returnUnits: 38,
  returnAmount: 2890.00,
  returnRatePct: 2.70,
  returnAmountRatePct: 2.09,
  keepItUnits: 4,
  keepItLossUsd: 199.96,
  sellerResponsibleRatePct: 42.1,
  totalStorageFee: 2450.00,
  normalStorageFee: 1100.00,
  storageFee365_450: 380.00,
  storageFee450Plus: 970.00,
  highAgingStorageFeePct: 55.10,
  productCostUsd: 51200.00,
  headFreightUsd: 6800.00,
  otherExpensesUsd: 2100.00,
  totalOperatingCost: 82350.00,
  operatingProfit: 56150.00,
  operatingProfitMargin: 40.54
};

export const SAMPLE_RAW_DATASET = {
  productCatalog: SAMPLE_CATALOG,
  erpOrders: SAMPLE_ERP_ORDERS,
  itemPerformance: SAMPLE_ITEM_PERFORMANCE,
  inventoryHealth: SAMPLE_INVENTORY_HEALTH,
  storageFees: SAMPLE_STORAGE_FEES,
  returnOrders: SAMPLE_RETURN_ORDERS
};

export const SAMPLE_CONFIG = {
  ...SAMPLE_MANUAL_INPUTS,
  totalHeadFreightRmb: SAMPLE_MANUAL_INPUTS.headFreightRmb,
  freightAllocationMethod: 'sales_ratio' as const,
  storageAllocationMethod: 'actual_first' as const
};

