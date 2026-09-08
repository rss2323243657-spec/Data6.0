import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Clock,
  AlertTriangle,
  Flame,
  Search,
  ArrowUpDown,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AnalysisResult } from '../types';
import { CollapsibleTableWrapper } from './CollapsibleTableWrapper';

interface StorageAnalysisViewProps {
  result: AnalysisResult;
}

const COLORS = ['#0071dc', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4'];

export const StorageAnalysisView: React.FC<StorageAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('storageFeeUsd');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const coreFinancials = result.coreFinancials || ({} as any);
  const skuMetrics = result.skuMetrics || [];
  const spuMetrics = result.spuMetrics || [];
  const productTypeMetrics = result.productTypeMetrics || [];
  const agingStorageLinkage = result.agingStorageLinkage || {
    normalStoragePct: 0,
    storageFee365_450Pct: 0,
    storageFee450PlusPct: 0,
    highAgingUnitsPct: 0,
    highAgingStorageFeePct: 0,
    highAgingStoragePct: 0,
    highAgingFeePct: 0,
    highAgingSkusCount: 0,
    riskSkus: [],
    topStorageSkus: []
  };

  const formatUsd = (n: number) =>
    `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Storage Structure Chart Data (常规 vs 365-450天 vs 450天+)
  const storageStructureData = useMemo(() => {
    return [
      {
        name: '常规基础仓储费',
        amount: coreFinancials.normalStorageFee || 0,
        pct: agingStorageLinkage.normalStoragePct || 0,
        color: '#0071dc'
      },
      {
        name: '365-450天高库龄附加费',
        amount: coreFinancials.storageFee365_450 || 0,
        pct: agingStorageLinkage.storageFee365_450Pct || 0,
        color: '#f59e0b'
      },
      {
        name: '450天以上超期惩罚费',
        amount: coreFinancials.storageFee450Plus || 0,
        pct: agingStorageLinkage.storageFee450PlusPct || 0,
        color: '#ef4444'
      }
    ].filter(d => d.amount > 0);
  }, [coreFinancials, agingStorageLinkage]);

  // Category Storage Chart Data
  const categoryStorageChartData = useMemo(() => {
    return productTypeMetrics.map((c, i) => ({
      name: c.productType,
      storageFeeUsd: c.storageFeeUsd,
      salesAmount: c.salesAmount,
      color: COLORS[i % COLORS.length]
    }));
  }, [productTypeMetrics]);

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
      .filter(c => c.productType.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [productTypeMetrics, searchTerm, sortField, sortDirection]);

  const filteredSpuData = useMemo(() => {
    return spuMetrics
      .filter(
        s =>
          s.spu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.productType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [spuMetrics, searchTerm, sortField, sortDirection]);

  const filteredSkuData = useMemo(() => {
    return skuMetrics
      .filter(
        s =>
          s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.spu.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        return sortDirection === 'desc' ? valB - valA : valA - valB;
      });
  }, [skuMetrics, searchTerm, sortField, sortDirection]);

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0071dc] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · Storage & Aging Expense Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            仓储费用分析：Final Storage Fee 精准核算与高库龄惩罚费透视
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            系统已全面优化识别规则：单 SKU 仓储费严格直接对应报表中的 <code className="text-[#0071dc] font-mono font-semibold">Final storage fee</code> 字段，SPU 仓储费为所属 SKU 之和。
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">当月总仓储费</span>
            <span className="font-bold text-slate-900">{formatUsd(coreFinancials.storageFeeUsd ?? coreFinancials.totalStorageFee ?? 0)}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-rose-600 block uppercase">超365天高库龄附加费</span>
            <span className="font-bold text-rose-700">{formatUsd(coreFinancials.highAgingStorageFee || 0)}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-amber-600 block uppercase">高库龄附加费占比</span>
            <span className="font-bold text-amber-700">{coreFinancials.highAgingStorageFeePct || 0}%</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: 仓储费结构 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              仓储费梯队结构 (常规 vs 超期惩罚)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Aging Tiers</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageStructureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {storageStructureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatUsd(Number(val))} (${item.payload.pct}%)`,
                    item.payload.name
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 text-[11px] font-mono">
            {storageStructureData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">
                  {formatUsd(item.amount)} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: 品类仓储费柱状图 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Warehouse className="w-3.5 h-3.5 mr-1.5 text-[#0071dc]" />
              各品类仓储费支出与销售额比对
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Category</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStorageChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={val => `$${val}`} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatUsd(Number(val)),
                    name === 'storageFeeUsd' ? '仓储费用' : '销售额'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="storageFeeUsd" name="仓储费用" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3-Dimensional Analysis Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setActiveDimension('category');
                setSortField('storageFeeUsd');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeDimension === 'category'
                  ? 'bg-white text-[#0071dc] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              品类维度 (Category)
            </button>
            <button
              onClick={() => {
                setActiveDimension('spu');
                setSortField('storageFeeUsd');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeDimension === 'spu'
                  ? 'bg-white text-[#0071dc] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SPU 维度 (单SKU之和)
            </button>
            <button
              onClick={() => {
                setActiveDimension('sku');
                setSortField('storageFeeUsd');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeDimension === 'sku'
                  ? 'bg-white text-[#0071dc] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SKU 细分 (Final storage fee)
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`搜索${
                activeDimension === 'category' ? '品类名称' : activeDimension === 'spu' ? 'SPU编码' : 'SKU/商品名'
              }...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0071dc] w-56 font-mono"
            />
          </div>
        </div>

        {/* Collapsible Table Content */}
        {activeDimension === 'category' && (
          <CollapsibleTableWrapper totalCount={filteredCategoryData.length} maxCollapsedHeight="max-h-[460px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded">
                <thead className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">品类名称</th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('storageFeeUsd')}>
                      仓储费合计 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">仓储费占销售比</th>
                    <th className="py-2.5 px-3 text-right">销售额</th>
                    <th className="py-2.5 px-3 text-right">总库存量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredCategoryData.map((cat, idx) => {
                    const storageToSalesPct =
                      cat.salesAmount > 0 ? Number(((cat.storageFeeUsd / cat.salesAmount) * 100).toFixed(2)) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{cat.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(cat.storageFeeUsd)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              storageToSalesPct > 5
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {storageToSalesPct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(cat.salesAmount)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.totalInventory.toLocaleString()} 件</td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('storageFeeUsd')}>
                      SPU仓储费 (单SKU之和) <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">仓储费/销售额</th>
                    <th className="py-2.5 px-3 text-right">总在库件数</th>
                    <th className="py-2.5 px-3 text-right">周转天数 (DOS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSpuData.map((spu, idx) => {
                    const storageToSalesPct =
                      spu.salesAmount > 0 ? Number(((spu.storageFeeUsd / spu.salesAmount) * 100).toFixed(2)) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{spu.spu}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">{spu.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(spu.storageFeeUsd)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              storageToSalesPct > 6 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-700'
                            }`}
                          >
                            {storageToSalesPct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{spu.totalInventory} 件</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{spu.daysOfSupply} 天</td>
                      </tr>
                    );
                  })}
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('storageFeeUsd')}>
                      Final Storage Fee <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">超365天滞销库存</th>
                    <th className="py-2.5 px-3 text-right">总库存量</th>
                    <th className="py-2.5 px-3 text-right">周转天数 (DOS)</th>
                    <th className="py-2.5 px-3">仓储失血诊断与建议</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSkuData.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sku.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[180px] truncate">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(sku.storageFeeUsd)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                        {sku.age365Plus > 0 ? `${sku.age365Plus} 件` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.totalInventory}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.daysOfSupply} 天</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {sku.age365Plus > 50 || sku.storageFeeUsd > 300 ? (
                          <span className="text-rose-600 font-medium">🚨 高库龄惩罚费重度侵蚀，建议限时清仓/退仓</span>
                        ) : sku.daysOfSupply > 180 ? (
                          <span className="text-amber-600 font-medium">⚠️ 周转滞缓，谨防恶化为超期罚金</span>
                        ) : (
                          <span className="text-emerald-600">健康周转</span>
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
