import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Clock,
  AlertTriangle,
  Flame,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AnalysisResult } from '../types';
import { CollapsibleTableWrapper } from './CollapsibleTableWrapper';
import { DimensionSortToolbar, SortOption } from './DimensionSortToolbar';

interface InventoryAnalysisViewProps {
  result: AnalysisResult;
}

export const InventoryAnalysisView: React.FC<InventoryAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('totalInventory');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hideZeroData, setHideZeroData] = useState<boolean>(true);

  const coreFinancials = result.coreFinancials || ({} as any);
  const skuMetrics = result.skuMetrics || [];
  const spuMetrics = result.spuMetrics || [];
  const productTypeMetrics = result.productTypeMetrics || [];
  const inventoryAgingSummary = result.inventoryAgingSummary || {
    qty0_30: 0, pct0_30: 0,
    qty31_90: 0, pct31_90: 0,
    qty0_90: 0, pct0_90: 0,
    qty91_180: 0, pct91_180: 0,
    qty181_270: 0, pct181_270: 0,
    qty271_365: 0, pct271_365: 0,
    qty365Plus: 0, pct365Plus: 0,
    qty365_450: 0, pct365_450: 0,
    qty450Plus: 0, pct450Plus: 0,
    totalUnits: 0
  };

  // Inventory Aging Tiers Chart Data: 6-Tier Walmart ATS Standard
  const agingChartData = useMemo(() => {
    const total = inventoryAgingSummary.totalUnits || 1;
    const q0_90 = inventoryAgingSummary.qty0_90 || ((inventoryAgingSummary.qty0_30 || 0) + (inventoryAgingSummary.qty31_90 || 0));
    const q91_180 = inventoryAgingSummary.qty91_180 || 0;
    const q181_270 = inventoryAgingSummary.qty181_270 || 0;
    const q271_365 = inventoryAgingSummary.qty271_365 || 0;
    const q365_450 = inventoryAgingSummary.qty365_450 || 0;
    const q450Plus = inventoryAgingSummary.qty450Plus || 0;

    return [
      { name: '0-90天', qty: q0_90, pct: Number(((q0_90 / total) * 100).toFixed(1)), fill: '#10b981' },
      { name: '91-180天', qty: q91_180, pct: Number(((q91_180 / total) * 100).toFixed(1)), fill: '#3b82f6' },
      { name: '181-270天', qty: q181_270, pct: Number(((q181_270 / total) * 100).toFixed(1)), fill: '#8b5cf6' },
      { name: '271-365天', qty: q271_365, pct: Number(((q271_365 / total) * 100).toFixed(1)), fill: '#f59e0b' },
      { name: '366-450天', qty: q365_450, pct: Number(((q365_450 / total) * 100).toFixed(1)), fill: '#f97316' },
      { name: '450天+', qty: q450Plus, pct: Number(((q450Plus / total) * 100).toFixed(1)), fill: '#ef4444' }
    ];
  }, [inventoryAgingSummary]);

  // Category Inventory Chart Data (filter out zero items)
  const categoryInventoryChartData = useMemo(() => {
    return productTypeMetrics
      .filter(c => c.totalInventory > 0 || c.salesQty > 0)
      .map(c => ({
        name: c.productType,
        totalInventory: c.totalInventory,
        availableInventory: c.availableInventory,
        salesQty: c.salesQty
      }));
  }, [productTypeMetrics]);

  // Sort Options
  const sortOptions = useMemo<SortOption[]>(() => {
    if (activeDimension === 'category') {
      return [
        { value: 'totalInventory', label: '在库库存' },
        { value: 'availableInventory', label: '可售库存' },
        { value: 'salesQty', label: '当月销量' },
        { value: 'storageFeeUsd', label: '仓储费' }
      ];
    } else if (activeDimension === 'spu') {
      return [
        { value: 'totalInventory', label: '在库库存' },
        { value: 'availableInventory', label: '可售件数' },
        { value: 'daysOfSupply', label: '周转天数 (DOS)' },
        { value: 'highAgingInventory', label: '超365天件数' }
      ];
    } else {
      return [
        { value: 'totalInventory', label: '总库存' },
        { value: 'availableInventory', label: '可售件数' },
        { value: 'daysOfSupply', label: '周转天数 (DOS)' },
        { value: 'age0_90', label: '0-90天健康库龄' },
        { value: 'age365Plus', label: '365天+滞销库龄' }
      ];
    }
  }, [activeDimension]);

  // Handle Sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredCategoryData = useMemo(() => {
    return productTypeMetrics
      .filter(c => {
        if (hideZeroData && c.totalInventory === 0 && c.salesQty === 0 && c.availableInventory === 0) return false;
        return c.productType.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [productTypeMetrics, searchTerm, sortField, sortDirection, hideZeroData]);

  const filteredSpuData = useMemo(() => {
    return spuMetrics
      .filter(s => {
        if (hideZeroData && s.totalInventory === 0 && s.salesQty === 0) return false;
        return (
          s.spu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.productType.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [spuMetrics, searchTerm, sortField, sortDirection, hideZeroData]);

  const filteredSkuData = useMemo(() => {
    return skuMetrics
      .filter(s => {
        if (hideZeroData && s.totalInventory === 0 && s.salesQty === 0 && s.availableInventory === 0) return false;
        return (
          s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.spu.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [skuMetrics, searchTerm, sortField, sortDirection, hideZeroData]);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0071dc] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Boxes className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · Inventory Health & Aging Structure</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            库存与库龄结构分析：在库/在途量、DOS周转天数与库龄梯队
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            深入洞察在库健康度，监控 0-30天 快速动销 vs 365天+ 沉淀死库，防范断货与高额滞销压仓成本。
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">总在库库存</span>
            <span className="font-bold text-slate-900">{(coreFinancials.totalInventoryUnits || inventoryAgingSummary.totalUnits || 0).toLocaleString()} 件</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-[#0071dc] block uppercase">平均周转天数</span>
            <span className="font-bold text-[#0071dc]">{coreFinancials.averageDaysOfSupply ?? 0} 天</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-emerald-600 block uppercase">健康库龄 (&lt;90天)</span>
            <span className="font-bold text-emerald-700">
              {((inventoryAgingSummary.pct0_30 || 0) + (inventoryAgingSummary.pct31_90 || 0)).toFixed(1)}%
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-rose-600 block uppercase">超365天死库</span>
            <span className="font-bold text-rose-700">{inventoryAgingSummary.qty365Plus || 0} 件 ({inventoryAgingSummary.pct365Plus || 0}%)</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: 库龄梯队分布 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-[#0071dc]" />
              库存库龄梯队件数分布 (Aging Tiers)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Aging Segments</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} 件 (${item.payload.pct}%)`,
                    '库存件数'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="qty" name="库存量" radius={[4, 4, 0, 0]}>
                  {agingChartData.map((entry, index) => (
                    <Cell key={`cell-aging-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 各品类库存 vs 销量 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Boxes className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              各品类在库量与当月出货量对比
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Stock vs Sales</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryInventoryChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} 件`,
                    name === 'totalInventory' ? '在库库存' : '当月出货量'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="totalInventory" name="在库库存" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salesQty" name="当月销量" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Dimensional Analysis Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Table Controls via DimensionSortToolbar */}
        <DimensionSortToolbar
          activeDimension={activeDimension}
          onDimensionChange={dim => {
            setActiveDimension(dim);
            setSortField('totalInventory');
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOptions={sortOptions}
          sortDirection={sortDirection}
          onToggleSortDirection={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
          hideZeroData={hideZeroData}
          onToggleHideZeroData={setHideZeroData}
          totalCount={
            activeDimension === 'category'
              ? filteredCategoryData.length
              : activeDimension === 'spu'
              ? filteredSpuData.length
              : filteredSkuData.length
          }
        />

        {/* Collapsible Table Content */}
        {activeDimension === 'category' && (
          <CollapsibleTableWrapper totalCount={filteredCategoryData.length} maxCollapsedHeight="max-h-[460px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">品类名称</th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalInventory')}>
                      在库库存 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">可售库存</th>
                    <th className="py-2.5 px-3 text-right">当月销量</th>
                    <th className="py-2.5 px-3 text-right">平均周转 (DOS)</th>
                    <th className="py-2.5 px-3 text-right">仓储费</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredCategoryData.map((cat, idx) => {
                    const dos = cat.salesQty > 0 ? Number(((cat.totalInventory / cat.salesQty) * 30).toFixed(0)) : 999;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{cat.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{cat.totalInventory.toLocaleString()} 件</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.availableInventory.toLocaleString()} 件</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.salesQty.toLocaleString()} 件</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              dos > 120
                                ? 'bg-amber-50 text-amber-700'
                                : dos < 20
                                ? 'bg-rose-50 text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {dos} 天
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">${cat.storageFeeUsd.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CollapsibleTableWrapper>
        )}

        {activeDimension === 'spu' && (
          <CollapsibleTableWrapper totalCount={filteredSpuData.length} maxCollapsedHeight="max-h-[460px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SPU 编码</th>
                    <th className="py-2.5 px-3">所属品类</th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalInventory')}>
                      在库库存 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">可售件数</th>
                    <th className="py-2.5 px-3 text-right">预留/在途</th>
                    <th className="py-2.5 px-3 text-right">周转天数 (DOS)</th>
                    <th className="py-2.5 px-3 text-right">超365天件数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSpuData.map((spu, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{spu.spu}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{spu.productType}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{spu.totalInventory} 件</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{spu.availableInventory} 件</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{spu.reservedInventory} 件</td>
                      <td className="py-2.5 px-3 text-right font-bold">{spu.daysOfSupply} 天</td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{spu.highAgingInventory || spu.aging365Plus || 0} 件</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleTableWrapper>
        )}

        {activeDimension === 'sku' && (
          <CollapsibleTableWrapper totalCount={filteredSkuData.length} maxCollapsedHeight="max-h-[460px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">SKU 编码</th>
                    <th className="py-2.5 px-3">商品名称</th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalInventory')}>
                      在库总数 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">可售</th>
                    <th className="py-2.5 px-3 text-right">周转DOS</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">0-90天</th>
                    <th className="py-2.5 px-3 text-right text-blue-700">91-180天</th>
                    <th className="py-2.5 px-3 text-right text-purple-700">181-270天</th>
                    <th className="py-2.5 px-3 text-right text-amber-700">271-365天</th>
                    <th className="py-2.5 px-3 text-right text-orange-700">366-450天</th>
                    <th className="py-2.5 px-3 text-right text-rose-700">450天+</th>
                    <th className="py-2.5 px-3">库存健康诊断状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSkuData.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sku.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[160px] truncate">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{sku.totalInventory}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.availableInventory}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{sku.daysOfSupply} 天</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">{sku.age0_90 || 0}</td>
                      <td className="py-2.5 px-3 text-right text-blue-600">{sku.age91_180 || 0}</td>
                      <td className="py-2.5 px-3 text-right text-purple-600">{sku.age181_270 || 0}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600">{sku.age271_365 || 0}</td>
                      <td className="py-2.5 px-3 text-right text-orange-600 font-medium">{sku.age365_450 || 0}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{sku.age450Plus || (sku.age365Plus > 0 ? sku.age365Plus : 0)}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {sku.availableInventory < 15 && sku.salesQty > 20 ? (
                          <span className="text-rose-600 font-bold">🚨 现货告急 (即将断货)</span>
                        ) : (sku.age450Plus || 0) > 0 || (sku.age365_450 || 0) > 0 || sku.age365Plus > 50 ? (
                          <span className="text-rose-600 font-bold">⚠️ 严重滞销压仓 (需促销清仓)</span>
                        ) : sku.daysOfSupply > 150 ? (
                          <span className="text-amber-600 font-medium">📦 动销迟缓 (控制补货)</span>
                        ) : (
                          <span className="text-emerald-600">正常良性</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleTableWrapper>
        )}
      </div>
    </div>
  );
};
