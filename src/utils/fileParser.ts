import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ItemPerformanceRow,
  InventoryHealthRow,
  StorageFeeRow,
  ReturnOrderRow,
  ERPOrderRow,
  ProductCatalogRow
} from '../types';

// Helper to normalize header string for comparison
function cleanHeader(h: string): string {
  return h.toLowerCase().replace(/[\s_\-\.\(\)\[\]（）]/g, '');
}

// Helper to parse numeric values safely
function parseNum(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/[$,¥￥\s,%]/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

// Helper to parse boolean values safely
function parseBool(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'boolean') return val;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === 'yes' || s === 'y' || s === '1' || s === '是' || s === 'keepit';
}

// Generic file reader: parses File object into Array of JSON rows
// Intelligently scans rows (e.g. row 7 header, row 9 data) to accurately extract headers and data
function convertRawGridToObjects(grid: any[][]): Record<string, any>[] {
  if (!grid || grid.length === 0) return [];

  // Keywords that strongly signify table header columns in Walmart & ERP reports
  const HEADER_KEYWORDS = [
    'sku', 'item id', 'final storage fee', 'final fee', 'storage fee', 'normal storage',
    'refund_covered_by', 'covered by', 'order id', 'order number', 'shipped qty', 'product name',
    'ad spend', 'impressions', 'clicks', 'orders', 'sales', 'quantity',
    'unit price', 'unit cost', 'category', 'product type', 'total inventory',
    'available', '365', '450', 'keep it', 'rma', 'partner id', 'fee'
  ];

  // Search first 25 rows for the best matching header row
  let bestHeaderRowIndex = -1;
  let maxKeywordMatches = 0;

  for (let r = 0; r < Math.min(grid.length, 25); r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    let matchCount = 0;
    for (const cell of row) {
      if (cell === null || cell === undefined) continue;
      const cellClean = cleanHeader(String(cell));
      if (!cellClean) continue;
      for (const kw of HEADER_KEYWORDS) {
        if (cellClean.includes(cleanHeader(kw))) {
          matchCount++;
          break;
        }
      }
    }

    if (matchCount > maxKeywordMatches) {
      maxKeywordMatches = matchCount;
      bestHeaderRowIndex = r;
    }
  }

  // If no good header row found, default to row 0, or row 6 (7th row) if row 6 has content
  if (bestHeaderRowIndex < 0) {
    bestHeaderRowIndex = (grid.length > 6 && grid[6] && grid[6].some((c: any) => c)) ? 6 : 0;
  }

  const rawHeaderRow = grid[bestHeaderRowIndex] || [];
  const headers = rawHeaderRow.map((h: any, idx: number) => {
    const str = String(h ?? '').trim();
    return str || `col_${idx}`;
  });

  // Determine where data starts:
  // Usually right after header row, but if header is on row 6 (7th row) and formal data starts on row 8 (9th row)
  let dataStartIndex = bestHeaderRowIndex + 1;
  if (bestHeaderRowIndex === 6 && grid.length > 8) {
    // Check if row 7 is metadata/units/empty and row 8 has actual rows
    const row7 = grid[7];
    const row8 = grid[8];
    const row7HasRealData = row7 && row7.some((c: any) => typeof c === 'number' || (typeof c === 'string' && c.trim().length > 3));
    if (!row7HasRealData && row8) {
      dataStartIndex = 8;
    }
  }

  const result: Record<string, any>[] = [];
  for (let r = dataStartIndex; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    // Check if row is completely empty
    const hasValue = row.some((val: any) => val !== null && val !== undefined && String(val).trim() !== '');
    if (!hasValue) continue;

    const obj: Record<string, any> = {};
    for (let c = 0; c < headers.length; c++) {
      const headerKey = headers[c];
      obj[headerKey] = row[c] ?? '';
    }
    result.push(obj);
  }

  return result;
}

export async function readTableFile(file: File): Promise<Record<string, any>[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: false,
        complete: (results) => {
          const grid = results.data as any[][];
          resolve(convertRawGridToObjects(grid));
        },
        error: (err) => reject(err)
      });
    });
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[firstSheetName];
    const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
    return convertRawGridToObjects(grid);
  } else {
    throw new Error('仅支持上传 CSV 或 Excel (.xlsx, .xls) 格式报表');
  }
}

// Semantic field extractor based on candidate aliases
function findField(row: Record<string, any>, aliases: string[]): any {
  const cleanedKeys = Object.keys(row).map(k => ({ original: k, cleaned: cleanHeader(k) }));
  for (const alias of aliases) {
    const cleanedAlias = cleanHeader(alias);
    const match = cleanedKeys.find(k => k.cleaned.includes(cleanedAlias) || cleanedAlias.includes(k.cleaned));
    if (match && row[match.original] !== undefined && row[match.original] !== '') {
      return row[match.original];
    }
  }
  return undefined;
}

export function parseItemPerformance(rows: Record<string, any>[]): ItemPerformanceRow[] {
  return rows.map(r => {
    const itemId = String(findField(r, ['item id', 'item_id', 'itemid', '商品id', '沃尔玛id', 'walmart item id', 'id']) || '').trim();
    const sku = String(findField(r, ['sku', 'seller sku', 'seller_sku', '商家sku', 'product sku', '子sku', 'item sku']) || '').trim();
    const itemName = String(findField(r, ['item name', 'product name', '商品名称', '品名', 'title']) || '').trim();
    
    // User requirement: Ad Spend, Advertised SKU Sales, Orders
    const adSpend = parseNum(findField(r, [
      'ad spend', 'ad_spend', 'adspend', 'spend', 'advertising spend', 'ad cost', '花费', '广告花费', '广告支出', '总花费', 'cost'
    ]));
    const impressions = parseNum(findField(r, ['impressions', 'impr', '曝光', '展现', '曝光量']));
    const clicks = parseNum(findField(r, ['clicks', '点击', '点击量']));
    const orders = parseNum(findField(r, [
      'orders', 'advertised sku units', 'ad orders', '广告订单数', '广告订单', '订单数', '订单量', 'conversions'
    ]));
    const attributedSales = parseNum(findField(r, [
      'advertised sku sales', 'advertised_sku_sales', 'advertisedskusales', 'ad sales', 'attributed sales', 'ad_sales', 'attributedsales', '广告销售额', '广告销售', '广告成交额', 'sales amount', 'sales'
    ]));
    const unitsSold = parseNum(findField(r, [
      'units sold', 'units_sold', 'advertised sku units', 'units', '广告销量', '销量', '件数'
    ])) || orders;

    return {
      itemId,
      sku,
      itemName,
      adSpend,
      impressions,
      clicks,
      orders,
      attributedSales,
      unitsSold,
      ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      cpc: clicks > 0 ? Number((adSpend / clicks).toFixed(2)) : 0,
      cvr: clicks > 0 ? Number(((orders / clicks) * 100).toFixed(2)) : 0,
      roas: adSpend > 0 ? Number((attributedSales / adSpend).toFixed(2)) : 0,
      acos: attributedSales > 0 ? Number((adSpend / attributedSales).toFixed(4)) : 0,
      rawRow: r
    };
  }).filter(row => row.sku || row.itemId);
}

export function parseInventoryHealth(rows: Record<string, any>[]): InventoryHealthRow[] {
  return rows.map(r => {
    const sku = String(findField(r, ['sku', 'seller sku', '商家sku', 'product sku', 'seller_sku', 'item sku']) || '').trim();
    const itemId = String(findField(r, ['item id', 'itemid', '商品id', 'walmart item id', 'item_id']) || '').trim();
    
    // User requirement: 在库库存数主要看库存表中的Available Units字段
    const availableInventory = parseNum(findField(r, [
      'available units', 'available_units', 'available', 'available inventory', '可售库存', '在库库存', 'fulfillable'
    ]));
    const totalInventoryRaw = parseNum(findField(r, ['total inventory', 'total on hand', '总库存', 'on hand']));
    const reservedInventory = parseNum(findField(r, ['reserved', '预留库存', '锁定库存', 'reserved units']));
    const inboundInventory = parseNum(findField(r, ['inbound', '在途', '在途库存', '在途数量', 'inbound units']));

    // User requirement:
    // 365天以内库存数 = ATS 0-90 days + ATS 91-180 days + ATS 181-270 days + ATS 271-365 days
    // 365-450天 = ATS 366-450 days 字段
    // 450天以上 = ATS 450+ days 字段
    const age0_90 = parseNum(findField(r, ['ats 0-90 days', 'ats 0-90', 'ats 0 to 90 days', '0-90 days', '0-90', '0-90天']));
    const age0_30 = parseNum(findField(r, ['0-30', '0 to 30', '0-30天', 'age 0-30', 'ats 0-30']));
    const age31_90 = parseNum(findField(r, ['31-90', '31 to 90', '31-90天', 'age 31-90', 'ats 31-90']));
    
    const finalAge0_30 = age0_30 || (age0_90 > 0 ? Math.round(age0_90 / 3) : 0);
    const finalAge31_90 = age31_90 || (age0_90 > 0 ? (age0_90 - finalAge0_30) : 0);

    const age91_180 = parseNum(findField(r, ['ats 91-180 days', 'ats 91-180', 'ats 91 to 180 days', '91-180 days', '91-180', '91-180天', 'age 91-180']));
    const age181_270 = parseNum(findField(r, ['ats 181-270 days', 'ats 181-270', 'ats 181 to 270 days', '181-270 days', '181-270', '181-270天', 'age 181-270']));
    const age271_365 = parseNum(findField(r, ['ats 271-365 days', 'ats 271-365', 'ats 271 to 365 days', '271-365 days', '271-365', '271-365天', 'age 271-365']));
    
    const age365_450 = parseNum(findField(r, [
      'ats 366-450 days', 'ats 365-450 days', 'ats 366-450', 'ats 365-450', 
      '366-450 days', '365-450 days', '366-450', '365-450', '365-450天', '366-450天', 'age 365-450'
    ]));
    
    const age450Plus = parseNum(findField(r, [
      'ats 450+ days', 'ats 450+', 'ats >450 days', '450+ days', '450+', '450 +', '450天以上', '450+天', 'age 450+'
    ]));

    // Total in-stock inventory: primarily Available Units as specified
    const totalInventory = availableInventory > 0 ? availableInventory : (totalInventoryRaw || (availableInventory + reservedInventory));

    return {
      sku,
      itemId,
      totalInventory,
      availableInventory: availableInventory || totalInventory,
      reservedInventory,
      inboundInventory,
      age0_30: finalAge0_30,
      age31_90: finalAge31_90,
      age91_180,
      age181_270,
      age271_365,
      age365_450,
      age450Plus,
      rawRow: r
    };
  }).filter(row => row.sku || row.itemId);
}

export function parseStorageFees(rows: Record<string, any>[]): StorageFeeRow[] {
  return rows.map(r => {
    const sku = String(findField(r, ['sku', 'seller sku', '商家sku', 'product sku', 'item sku', 'seller_sku']) || '').trim();
    const itemId = String(findField(r, ['item id', 'itemid', '商品id', 'walmart item id', 'partner item id']) || '').trim();
    
    // Exact user requirement: directly recognize Final storage fee field for single SKU
    const finalStorageFee = parseNum(findField(r, [
      'final storage fee',
      'final_storage_fee',
      'finalstoragefee',
      'final storage',
      'final fee',
      '最终仓储费',
      '实际仓储费',
      '总仓储费',
      '仓储费合计',
      'total storage fee',
      'total fee',
      'storage fee'
    ]));
    
    const normalStorageFee = parseNum(findField(r, ['normal storage fee', 'base storage', '常规仓储费', '正常仓储费', '月度仓储费']));
    const storageFee365_450 = parseNum(findField(r, ['365-450 days storage fee', '365-450 fee', '365-450天仓储费', '365-450仓储费', '365-450']));
    const storageFee450Plus = parseNum(findField(r, ['450+ days storage fee', '450+ fee', '450天以上仓储费', '450+仓储费', '超期仓储费', '450+']));

    let totalStorageFee = finalStorageFee;
    if (!totalStorageFee) {
      totalStorageFee = normalStorageFee + storageFee365_450 + storageFee450Plus;
    }

    return {
      sku,
      itemId,
      normalStorageFee: normalStorageFee || (totalStorageFee - storageFee365_450 - storageFee450Plus > 0 ? (totalStorageFee - storageFee365_450 - storageFee450Plus) : totalStorageFee),
      storageFee365_450,
      storageFee450Plus,
      totalStorageFee,
      rawRow: r
    };
  }).filter(row => row.sku || row.itemId || row.totalStorageFee > 0);
}

export function parseReturnOrders(rows: Record<string, any>[]): ReturnOrderRow[] {
  return rows.map((r, idx) => {
    const returnOrderId = String(findField(r, ['return order id', 'return id', 'rma', '退货单号', '退货id', 'order number']) || `RET-${idx}`).trim();
    const orderId = String(findField(r, ['order id', 'order number', '原订单号', '订单号']) || '').trim();
    const returnDate = String(findField(r, ['return date', 'date', '退货时间', '退货日期', '申请时间', 'refund date']) || '').trim();
    const sku = String(findField(r, ['sku', 'seller sku', '商家sku', 'product sku', 'item sku']) || '').trim();
    const itemId = String(findField(r, ['item id', 'itemid', '商品id', 'walmart item id']) || '').trim();
    const returnQty = parseNum(findField(r, ['return qty', 'qty', 'quantity', '退货数量', '数量', 'refund qty'])) || 1;
    const returnAmount = parseNum(findField(r, ['return amount', 'refund amount', '退款金额', '退货金额', 'amount', 'total refund']));
    const returnReason = String(findField(r, ['return reason', 'reason', '退货原因', '原因', 'customer comment', 'return description']) || '客户不需要/其他').trim();
    const keepIt = parseBool(findField(r, ['keep it', 'keepit', 'keep_it', '免退货', '仅退款', '客户保留', 'customer keep']));
    const returnStatus = String(findField(r, ['return status', 'status', '退货状态', '状态']) || 'Completed').trim();
    
    // Exact user requirement for REFUND_COVERED_BY:
    // If has 'seller' -> seller responsibility; if has 'walmart' -> platform responsibility
    const refundCoveredByRaw = String(findField(r, [
      'refund_covered_by',
      'refund covered by',
      'refundcoveredby',
      'covered_by',
      'covered by',
      '责任方',
      '费用承担方',
      '承担方'
    ]) || '').trim();

    let sellerResponsible = false;
    let responsibleParty: 'Seller' | 'Walmart' | 'Customer' = 'Walmart';

    if (refundCoveredByRaw) {
      const lower = refundCoveredByRaw.toLowerCase();
      if (lower.includes('seller') || lower.includes('卖家') || lower.includes('商家')) {
        sellerResponsible = true;
        responsibleParty = 'Seller';
      } else if (lower.includes('walmart') || lower.includes('wmt') || lower.includes('平台') || lower.includes('wfs')) {
        sellerResponsible = false;
        responsibleParty = 'Walmart';
      } else if (lower.includes('customer') || lower.includes('buyer') || lower.includes('买家') || lower.includes('客户')) {
        sellerResponsible = false;
        responsibleParty = 'Customer';
      }
    } else {
      const sellerResponsibleRaw = findField(r, ['seller responsible', 'seller responsibility', '卖家责任', '品质问题']);
      if (sellerResponsibleRaw !== undefined) {
        sellerResponsible = parseBool(sellerResponsibleRaw);
        responsibleParty = sellerResponsible ? 'Seller' : 'Walmart';
      } else {
        const lowerReason = returnReason.toLowerCase();
        if (lowerReason.includes('defect') || lowerReason.includes('damage') || lowerReason.includes('missing') || lowerReason.includes('broken') || lowerReason.includes('瑕疵') || lowerReason.includes('少件') || lowerReason.includes('破损')) {
          sellerResponsible = true;
          responsibleParty = 'Seller';
        }
      }
    }

    return {
      returnOrderId,
      orderId,
      returnDate,
      sku,
      itemId,
      returnQty,
      returnAmount,
      returnReason,
      keepIt,
      returnStatus,
      sellerResponsible,
      responsibleParty,
      refundCoveredBy: refundCoveredByRaw || responsibleParty,
      rawRow: r
    };
  }).filter(row => row.sku || row.itemId || row.returnOrderId);
}

export function parseErpOrders(rows: Record<string, any>[]): ERPOrderRow[] {
  return rows.map((r, idx) => {
    const orderId = String(findField(r, ['order id', 'order number', '订单编号', '订单号', 'erp order id', '平台订单号', '销售单号']) || `ORD-${idx}`).trim();
    const orderDate = String(findField(r, ['order date', 'order time', '下单时间', '订单时间', '支付时间', '发货时间', 'date']) || '').trim();
    const sku = String(findField(r, ['sku', 'seller sku', '产品sku', '商家sku', 'item sku', '商品sku', '商品编码', '条形码', '品名']) || '').trim();
    const itemId = String(findField(r, ['item id', 'itemid', '商品id', 'walmart item id', '平台商品编码', 'item_id']) || '').trim();
    
    // Shipped Qty: check all possible shipped qty aliases
    const shippedQtyRaw = findField(r, [
      'shipped qty', 'shipped_qty', 'ship qty', '发货数量', '发货数', '已发货数量', '出货数量', 
      '实际发货数量', '发货件数', '订单发货数量', '出库数量', '购买数量', '数量', 'qty', 'quantity'
    ]);
    const shippedQty = shippedQtyRaw !== undefined ? parseNum(shippedQtyRaw) : 1;
    
    let unitPrice = parseNum(findField(r, ['unit price', 'price', '单价', '产品单价', '售价', '销售单价', '成交单价']));
    let orderAmount = parseNum(findField(r, ['order amount', 'total amount', '订单金额', '金额', '销售额', '总金额', '总销售额', '成交金额']));

    // User requirement: "销售额=发货数量*商品单价，因此如果发货数量统计不对，销售额也会是错的"
    if (unitPrice > 0 && shippedQty > 0) {
      if (!orderAmount || (Math.abs(orderAmount - unitPrice) < 0.001 && shippedQty > 1)) {
        orderAmount = Number((unitPrice * shippedQty).toFixed(2));
      }
    } else if (orderAmount > 0 && shippedQty > 0 && unitPrice === 0) {
      unitPrice = Number((orderAmount / shippedQty).toFixed(2));
    }

    const unitCostRmb = parseNum(findField(r, ['unit cost', 'product cost', '采购单价', '产品成本', '成本(rmb)', '成本', 'cost']));
    const orderStatus = String(findField(r, ['order status', 'status', '订单状态', '状态', '发货状态']) || 'Shipped').trim();

    return {
      orderId,
      orderDate,
      sku,
      itemId: itemId || undefined,
      unitPrice,
      shippedQty,
      orderAmount,
      unitCostRmb: unitCostRmb > 0 ? unitCostRmb : undefined,
      orderStatus,
      rawRow: r
    };
  }).filter(row => row.sku || row.itemId);
}

export function parseProductCatalog(rows: Record<string, any>[]): ProductCatalogRow[] {
  return rows.map(r => {
    const itemId = String(findField(r, ['item id', 'itemid', '商品id', 'walmart item id']) || '').trim();
    const sku = String(findField(r, ['sku', 'seller sku', '商家sku', 'product sku']) || '').trim();
    const spu = String(findField(r, ['spu', 'parent sku', '父sku', '款号', '系列']) || 'SPU-DEFAULT').trim();
    const productType = String(findField(r, ['product type', 'category', '产品类型', '品类', '类目']) || '未分类').trim();
    const productName = String(findField(r, ['product name', 'item name', '商品名称', '品名']) || '').trim();

    return {
      itemId,
      sku,
      spu,
      productType,
      productName
    };
  }).filter(row => row.sku || row.itemId);
}
