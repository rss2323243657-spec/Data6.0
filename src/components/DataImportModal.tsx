import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Layers,
  ArrowRight
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

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onClearAllData: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  currentResult,
  onUpdateData,
  onLoadSampleData,
  onClearAllData
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [successLogs, setSuccessLogs] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Single file parse helper
  const processSingleFile = async (
    fileType: 'itemPerf' | 'inventory' | 'storage' | 'returns' | 'erpOrders' | 'catalog',
    file: File
  ) => {
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
      [fileType]: `已成功导入 ${parsedCount} 条数据 (${file.name})`
    }));
  };

  // Handle single file upload
  const handleSingleUpload = async (
    fileType: 'itemPerf' | 'inventory' | 'storage' | 'returns' | 'erpOrders' | 'catalog',
    file: File
  ) => {
    try {
      setLoadingType(fileType);
      setFileErrors(prev => ({ ...prev, [fileType]: '' }));
      await processSingleFile(fileType, file);
    } catch (err: any) {
      console.error(err);
      setFileErrors(prev => ({
        ...prev,
        [fileType]: err.message || '文件解析失败，请检查数据格式'
      }));
    } finally {
      setLoadingType(null);
    }
  };

  // Auto-detect file type based on file name and header content
  const detectFileType = (fileName: string, firstRows: any[]): 'itemPerf' | 'inventory' | 'storage' | 'returns' | 'erpOrders' | 'catalog' | null => {
    const fn = fileName.toLowerCase();
    if (fn.includes('storage') || fn.includes('仓储') || fn.includes('final storage')) return 'storage';
    if (fn.includes('return') || fn.includes('退货') || fn.includes('refund')) return 'returns';
    if (fn.includes('item') || fn.includes('ad') || fn.includes('performance') || fn.includes('广告')) return 'itemPerf';
    if (fn.includes('inventory') || fn.includes('health') || fn.includes('库存') || fn.includes('aging')) return 'inventory';
    if (fn.includes('erp') || fn.includes('order') || fn.includes('订单') || fn.includes('出货')) return 'erpOrders';
    if (fn.includes('catalog') || fn.includes('mapping') || fn.includes('产品') || fn.includes('spu')) return 'catalog';

    // Inspect content sample
    const strContent = JSON.stringify(firstRows.slice(0, 10)).toLowerCase();
    if (strContent.includes('final storage fee') || strContent.includes('peak storage')) return 'storage';
    if (strContent.includes('refund_covered_by') || strContent.includes('return reason') || strContent.includes('keep it')) return 'returns';
    if (strContent.includes('ad spend') || strContent.includes('impressions') || strContent.includes('attributed sales')) return 'itemPerf';
    if (strContent.includes('available units') || strContent.includes('reserved units') || strContent.includes('0-30 days')) return 'inventory';
    if (strContent.includes('shipped qty') || strContent.includes('order status') || strContent.includes('unit price')) return 'erpOrders';
    if (strContent.includes('product type') || strContent.includes('spu')) return 'catalog';

    return null;
  };

  // Batch Multi-File Drag & Drop handler
  const handleBatchFiles = async (files: FileList | File[]) => {
    setBatchLoading(true);
    const errors: Record<string, string> = {};
    const successes: Record<string, string> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const rawRows = await readTableFile(file);
        const identifiedType = detectFileType(file.name, rawRows);
        if (identifiedType) {
          await processSingleFile(identifiedType, file);
          successes[identifiedType] = `智能识别为 [${identifiedType}]，成功导入 (${file.name})`;
        } else {
          errors[file.name] = `无法自动识别报表类型，请手动点选对应卡片上传`;
        }
      } catch (err: any) {
        errors[file.name] = err.message || '解析异常';
      }
    }

    setFileErrors(prev => ({ ...prev, ...errors }));
    setSuccessLogs(prev => ({ ...prev, ...successes }));
    setBatchLoading(false);
  };

  const uploadSlots = [
    {
      id: 'erpOrders',
      title: '1. 公司 ERP 订单报表',
      sub: '出货额、销量唯一主源 (自动剔除 Cancelled)',
      cols: 'Order ID, SKU, Shipped Qty, Unit Price, Order Amount, Cost(RMB)',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('ERP'))?.validRows || 0
    },
    {
      id: 'itemPerf',
      title: '2. Walmart 广告报表 (Item Performance)',
      sub: '广告花费、展现、点击、归因销售额唯一来源',
      cols: 'Item ID, SKU, Ad Spend, Impressions, Clicks, Orders, Attributed Sales',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('广告'))?.validRows || 0
    },
    {
      id: 'inventory',
      title: '3. Walmart 库存与库龄报表 (Inventory Health)',
      sub: '在库量、可用、预留、0-30天及各库龄阶梯',
      cols: 'SKU, Total Inventory, Available, Age 0-30, Age 365+',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('库存'))?.validRows || 0
    },
    {
      id: 'storage',
      title: '4. Walmart 仓储费报表 (Storage Fees)',
      sub: '自动定位第7/9列，提取 Final storage fee',
      cols: 'SKU, Final storage fee, Normal Fee, 365-450 Fee, 450+ Fee',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('仓储'))?.validRows || 0
    },
    {
      id: 'returns',
      title: '5. Walmart 退货订单报表 (Return Orders)',
      sub: '基于 REFUND_COVERED_BY 识别责任与 Keep-It',
      cols: 'Return ID, SKU, Qty, Refund Amount, REFUND_COVERED_BY, Keep It',
      count: currentResult.dataQuality.sources.find(s => s.name.includes('退货'))?.validRows || 0
    },
    {
      id: 'catalog',
      title: '6. 产品映射字典 (Product Catalog)',
      sub: 'Item ID 与 SKU、SPU、类目的核心主键映射',
      cols: 'Item ID, SKU, SPU, Product Type, Product Name',
      count: currentResult.skuMetrics.length || 0
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#0071dc] text-white rounded">
                <UploadCloud className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                数据导入与报表清洗中心 (Data Ingestion Hub)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                READY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              支持一键批量拖拽所有 Walmart 与 ERP 报表，系统智能识别并执行清洗计算。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Multi-file Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleBatchFiles(e.dataTransfer.files);
              }
            }}
            className="border-2 border-dashed border-[#0071dc]/40 hover:border-[#0071dc] bg-blue-50/40 hover:bg-blue-50/80 rounded-xl p-5 text-center transition-all cursor-pointer group"
          >
            <input
              type="file"
              multiple
              accept=".csv, .xlsx, .xls"
              className="hidden"
              id="batch-upload-input"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handleBatchFiles(e.target.files);
                }
              }}
            />
            <label htmlFor="batch-upload-input" className="cursor-pointer block">
              <UploadCloud className="w-8 h-8 mx-auto text-[#0071dc] group-hover:scale-110 transition-transform mb-2" />
              <div className="text-sm font-bold text-slate-800 font-mono">
                {batchLoading ? '正在智能识别并批量解析...' : '拖拽所有报表至此处，或点击批量选择'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                同时支持多个 CSV / Excel 报表，系统将按文件名与表头自动分发至对应模块
              </p>
            </label>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
              <span>当前已成功匹配 SKU:</span>
              <strong className="text-emerald-600 text-sm">{currentResult.skuMetrics.length}</strong>
              <span className="text-slate-300">|</span>
              <span>清洗排除取消订单:</span>
              <strong className="text-rose-600 text-sm">{currentResult.dataQuality.cancelledOrdersExcludedCount}</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClearAllData}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-mono font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                清空数据，从零导入
              </button>
              <button
                type="button"
                onClick={onLoadSampleData}
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-mono font-medium text-[#0071dc] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                恢复实战演示数据
              </button>
            </div>
          </div>

          {/* 6 Upload Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadSlots.map(slot => {
              const isLoading = loadingType === slot.id;
              const errorMsg = fileErrors[slot.id];
              const successMsg = successLogs[slot.id];

              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 font-mono">{slot.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {slot.count} 条
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[32px]">{slot.sub}</p>
                    <div className="mt-2 p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 font-mono break-all">
                      <span className="font-semibold text-slate-700">字段: </span>
                      {slot.cols}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <label className="flex items-center justify-center px-3 py-2 border border-slate-200 hover:border-[#0071dc] hover:bg-blue-50/50 rounded cursor-pointer transition-colors text-xs font-mono text-slate-700 hover:text-[#0071dc]">
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                      <span>{isLoading ? '解析中...' : '单独上传此表'}</span>
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        className="hidden"
                        disabled={isLoading}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSingleUpload(slot.id as any, file);
                          }
                        }}
                      />
                    </label>

                    {errorMsg && (
                      <div className="mt-1.5 p-1.5 bg-rose-50 text-rose-700 text-[10px] font-mono rounded border border-rose-200 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="mt-1.5 p-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono rounded border border-emerald-200 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">{successMsg}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            提示：上传新报表后，系统各模块与利润诊断结论将即时联动刷新。
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0071dc] hover:bg-[#005bb5] text-white font-bold rounded-lg transition-colors cursor-pointer"
          >
            完成导入并查看诊断
          </button>
        </div>
      </div>
    </div>
  );
};
