import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  readTableFile,
  parseItemPerformance,
  parseInventoryHealth,
  parseStorageFees,
  parseReturnOrders,
  parseErpOrders,
  parseProductCatalog
} from '../utils/fileParser';
import {
  ItemPerformanceRow,
  InventoryHealthRow,
  StorageFeeRow,
  ReturnOrderRow,
  ERPOrderRow,
  ProductCatalogRow,
  AnalysisResult
} from '../types';

interface DataImportCenterProps {
  currentResult: AnalysisResult;
  onUpdateData: (data: {
    itemPerf?: ItemPerformanceRow[];
    inventory?: InventoryHealthRow[];
    storage?: StorageFeeRow[];
    returns?: ReturnOrderRow[];
    erpOrders?: ERPOrderRow[];
    catalog?: ProductCatalogRow[];
  }) => void;
  onLoadSampleData: () => void;
}

export const DataImportCenter: React.FC<DataImportCenterProps> = ({
  currentResult,
  onUpdateData,
  onLoadSampleData
}) => {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [successLogs, setSuccessLogs] = useState<Record<string, string>>({});

  const handleFileUpload = async (
    fileType: 'itemPerf' | 'inventory' | 'storage' | 'returns' | 'erpOrders' | 'catalog',
    file: File
  ) => {
    try {
      setLoadingFile(fileType);
      setFileErrors(prev => ({ ...prev, [fileType]: '' }));
      
      const rawRows = await readTableFile(file);
      if (!rawRows || rawRows.length === 0) {
        throw new Error('报表内容为空或格式无法读取');
      }

      let parsedCount = 0;
      switch (fileType) {
        case 'itemPerf': {
          const data = parseItemPerformance(rawRows);
          onUpdateData({ itemPerf: data });
          parsedCount = data.length;
          break;
        }
        case 'inventory': {
          const data = parseInventoryHealth(rawRows);
          onUpdateData({ inventory: data });
          parsedCount = data.length;
          break;
        }
        case 'storage': {
          const data = parseStorageFees(rawRows);
          onUpdateData({ storage: data });
          parsedCount = data.length;
          break;
        }
        case 'returns': {
          const data = parseReturnOrders(rawRows);
          onUpdateData({ returns: data });
          parsedCount = data.length;
          break;
        }
        case 'erpOrders': {
          const data = parseErpOrders(rawRows);
          onUpdateData({ erpOrders: data });
          parsedCount = data.length;
          break;
        }
        case 'catalog': {
          const data = parseProductCatalog(rawRows);
          onUpdateData({ catalog: data });
          parsedCount = data.length;
          break;
        }
      }

      setSuccessLogs(prev => ({
        ...prev,
        [fileType]: `成功解析 ${parsedCount} 条数据 (${file.name})`
      }));
    } catch (err: any) {
      console.error(err);
      setFileErrors(prev => ({
        ...prev,
        [fileType]: err.message || '文件解析失败，请核对表头格式'
      }));
    } finally {
      setLoadingFile(null);
    }
  };

  const uploadSlots = [
    {
      id: 'erpOrders',
      role: '【B1】公司 ERP 订单报表',
      desc: '店铺真实出货订单，唯一销售额与销量主源。自动剔除 Cancelled 订单。',
      headers: 'Order ID, SKU, Shipped Qty, Unit Price, Order Amount, Order Status, Cost(RMB)',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('ERP'))?.validRows || 0
    },
    {
      id: 'itemPerf',
      role: '【A1】Walmart 广告报表 (Item Performance)',
      desc: '广告支出、展现、点击、广告订单、归因销售额唯一来源。严禁混同为店铺总销售。',
      headers: 'Item ID, SKU, Ad Spend, Impressions, Clicks, Orders, Attributed Sales',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('广告'))?.validRows || 0
    },
    {
      id: 'inventory',
      role: '【A2】Walmart 库存与库龄 (Inventory Health)',
      desc: '总在库、可用、预留、在途、0-30/31-90/91-180/181-270/271-365/365-450/450+ 库龄阶梯。',
      headers: 'SKU, Total Inventory, Available, Reserved, Inbound, Age 0-30, Age 365+',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('库存'))?.validRows || 0
    },
    {
      id: 'storage',
      role: '【A3】Walmart 仓储费报表 (Storage Fees)',
      desc: '常规月度仓储费、365-450天附加费、450天+超期惩罚性仓储费。',
      headers: 'SKU, Normal Storage Fee, 365-450 Days Fee, 450+ Days Fee, Total Storage Fee',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('仓储'))?.validRows || 0
    },
    {
      id: 'returns',
      role: '【A4】Walmart 退货订单 (Return Orders)',
      desc: '退货单号、退货件数、退款金额、退货原因、Keep-It免退货标识、卖家责任。自动剔除取消退货。',
      headers: 'Return Order ID, Order ID, SKU, Return Qty, Return Amount, Reason, Keep It',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('退货'))?.validRows || 0
    },
    {
      id: 'catalog',
      role: '【B2】产品映射表 (Product Catalog)',
      desc: 'Item ID 与 SKU、SPU 款号、产品类目 (Product Type) 的统一直联匹配基石。',
      headers: 'Item ID, SKU, SPU, Product Type, Product Name',
      count: currentResult.skuMetrics.length || 0
    }
  ];

  return (
    <div className="space-y-4 pb-12 font-sans text-xs">
      {/* Top Technical Header */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-tight">
                数据清洗与多表映射导入中心
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0071dc]/10 text-[#0071dc] border border-[#0071dc]/20">
                MULTI-SOURCE PIPELINE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              严格遵循 Walmart 与 ERP 数据源职责划分。系统内置智能表头模糊匹配引擎，支持 CSV 与 Excel (.xlsx, .xls)。
              自动执行脏数据清洗、状态过滤与跨表防重。
            </p>
          </div>

          <button
            onClick={onLoadSampleData}
            id="btn-import-center-load-sample"
            className="inline-flex items-center px-3.5 py-2 rounded text-xs font-mono font-bold text-white bg-[#0071dc] hover:bg-[#005bb5] transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            一键载入完备仿真多源数据
          </button>
        </div>
      </div>

      {/* 6 Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {uploadSlots.map((slot) => {
          const isLoading = loadingFile === slot.id;
          const errorMsg = fileErrors[slot.id];
          const successMsg = successLogs[slot.id];

          return (
            <div
              key={slot.id}
              className="bg-white rounded border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 font-mono">{slot.role}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {slot.count} ROWS
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {slot.desc}
                </p>
                <div className="mt-2.5 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 font-mono break-all">
                  <span className="font-semibold text-slate-700">参考列: </span>{slot.headers}
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100">
                <label className="relative flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 hover:border-[#0071dc] hover:bg-[#0071dc]/5 rounded cursor-pointer transition-colors group">
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-[#0071dc] transition-colors" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0071dc] mt-1 font-mono">
                    {isLoading ? '解析清洗中...' : '点击或拖拽上传 CSV/Excel'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">支持 .csv, .xlsx, .xls</span>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                    disabled={isLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(slot.id as any, file);
                      }
                    }}
                  />
                </label>

                {errorMsg && (
                  <div className="mt-2 p-2 bg-rose-50 text-rose-700 text-[10px] font-mono rounded border border-rose-200 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span className="truncate">{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mt-2 p-2 bg-emerald-50 text-emerald-700 text-[10px] font-mono rounded border border-emerald-200 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span className="truncate">{successMsg}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cleaning and Rule Audit Summary */}
      <div className="bg-white rounded border border-slate-200 p-4 text-xs text-slate-600 space-y-2 font-mono">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h4 className="font-bold text-slate-900 text-xs flex items-center uppercase">
            <FileCheck className="w-4 h-4 mr-1.5 text-[#0071dc]" />
            系统内置严格清洗与校验规范 (Strict Data Integrity Rules)
          </h4>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            AUTO-CLEANED
          </span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed text-slate-700 font-sans">
          <li><strong>真实销售锁定</strong>: 仅以 ERP 订单表中状态为已发货/已完成的订单为准，状态为 Cancelled、Void 的订单在第一阶段已被彻底剔除（当前清洗掉 <span className="font-mono font-bold text-rose-600">{currentResult.dataQuality.cancelledOrdersExcludedCount}</span> 单）。</li>
          <li><strong>退货单净化</strong>: 仅对最终生效的退货订单计算损失，已取消的退货申请严格排除（当前清洗掉 <span className="font-mono font-bold text-rose-600">{currentResult.dataQuality.cancelledReturnsExcludedCount}</span> 单）。</li>
          <li><strong>统一主键关联</strong>: 所有模块一律依托 Catalog 关系映射表，以 <code className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-900">SKU</code> 作为核心数据锚点完成统一归集。</li>
          <li><strong>汇率计算闭环</strong>: 统一按固定汇率（7.20）将 ERP 中的产品成本 RMB 与头程费用 RMB 换算为美元口径，与 Walmart 美元费用同源汇总。</li>
        </ul>
      </div>
    </div>
  );
};
