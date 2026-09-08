import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Package,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpDown
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
import { AnalysisResult, SkuMetric, SpuMetric, ProductTypeMetric } from '../types';
import { CollapsibleTableWrapper } from './CollapsibleTableWrapper';
import { DimensionSortToolbar, SortOption } from './DimensionSortToolbar';

interface ReturnAnalysisViewProps {
  result: AnalysisResult;
}

const COLORS = ['#ef4444', '#0071dc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReturnAnalysisView: React.FC<ReturnAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('returnAmount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hideZeroData, setHideZeroData] = useState<boolean>(true);

  const coreFinancials = result.coreFinancials || ({} as any);
  const skuMetrics = result.skuMetrics || [];
  const spuMetrics = result.spuMetrics || [];
  const productTypeMetrics = result.productTypeMetrics || [];
  const returnBreakdown = result.returnBreakdown || {
    responsibility: {
      sellerQty: 0,
      sellerAmount: 0,
      sellerPct: 0,
      walmartQty: 0,
      walmartAmount: 0,
      walmartPct: 0,
      customerQty: 0,
      customerAmount: 0,
      customerPct: 0
    },
    keepIt: {
      keepItQty: 0,
      keepItAmount: 0,
      keepItPct: 0,
      physicalQty: 0,
      physicalAmount: 0,
      physicalPct: 0
    },
    byCategory: [],
    bySpu: []
  };

  const formatUsd = (n: number) =>
    `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Chart 1: Responsibility Breakdown (卖家责任 vs 平台责任 vs 买家责任)
  const responsibilityData = useMemo(() => {
    const resp = returnBreakdown?.responsibility;
    if (!resp) return [];
    return [
      {
        name: '卖家责任 (Seller)',
        qty: resp.sellerQty,
        amount: resp.sellerAmount,
        pct: resp.sellerPct,
        color: '#ef4444' // Red warning
      },
      {
        name: '平台责任 (Walmart)',
        qty: resp.walmartQty,
        amount: resp.walmartAmount,
        pct: resp.walmartPct,
        color: '#0071dc' // Walmart Blue
      },
      {
        name: '买家责任 (Customer)',
        qty: resp.customerQty,
        amount: resp.customerAmount,
        pct: resp.customerPct,
        color: '#10b981' // Emerald
      }
    ].filter(d => d.qty > 0 || d.amount > 0);
  }, [returnBreakdown]);

  // Chart 2: Keep-It Breakdown (免退货 vs 物理退回)
  const keepItData = useMemo(() => {
    const ki = returnBreakdown?.keepIt;
    if (!ki) return [];
    return [
      {
        name: 'Keep-It (仅退款不退货)',
        qty: ki.keepItQty,
        amount: ki.keepItAmount,
        pct: ki.keepItPct,
        color: '#f59e0b'
      },
      {
        name: '标准物理退仓',
        qty: ki.physicalQty,
        amount: ki.physicalAmount,
        pct: ki.physicalPct,
        color: '#64748b'
      }
    ];
  }, [returnBreakdown]);

  // Chart 3: Category Return (品类退货金额与件数，过滤全零项)
  const categoryChartData = useMemo(() => {
    return productTypeMetrics
      .filter(c => c.returnQty > 0 || c.returnAmount > 0)
      .map((c, i) => ({
        name: c.productType,
        returnQty: c.returnQty,
        returnAmount: c.returnAmount,
        returnRatePct: c.returnRatePct,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.returnAmount - a.returnAmount);
  }, [productTypeMetrics]);

  // Chart 4: SPU Return (SPU 退货排行，过滤全零项)
  const spuChartData = useMemo(() => {
    return spuMetrics
      .filter(s => s.returnQty > 0 || s.returnAmount > 0)
      .sort((a, b) => b.returnQty - a.returnQty)
      .slice(0, 8)
      .map((s, i) => ({
        name: s.spu,
        returnQty: s.returnQty,
        returnAmount: s.returnAmount,
        returnRatePct: s.returnRate,
        color: COLORS[i % COLORS.length]
      }));
  }, [spuMetrics]);

  // Dimension-specific Sort Options
  const sortOptions = useMemo<SortOption[]>(() => {
    if (activeDimension === 'category') {
      return [
        { value: 'returnAmount', label: '退货总金额' },
        { value: 'returnQty', label: '退货件数' },
        { value: 'returnRatePct', label: '退货率 (%)' },
        { value: 'salesQty', label: '总销量' }
      ];
    } else if (activeDimension === 'spu') {
      return [
        { value: 'returnAmount', label: '退货总金额' },
        { value: 'returnQty', label: '退货件数' },
        { value: 'returnRate', label: '退货率 (%)' },
        { value: 'salesQty', label: '总销量' }
      ];
    } else {
      return [
        { value: 'returnAmount', label: '退货总金额' },
        { value: 'returnQty', label: '退货件数' },
        { value: 'returnRate', label: '退货率 (%)' },
        { value: 'keepItLossUsd', label: 'Keep-It净亏损' }
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

  // Filter and Sort Table Data
  const filteredCategoryData = useMemo(() => {
    return productTypeMetrics
      .filter(c => {
        if (hideZeroData && c.returnQty === 0 && c.returnAmount === 0 && c.salesQty === 0) return false;
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
        if (hideZeroData && s.returnQty === 0 && s.returnAmount === 0 && s.salesQty === 0) return false;
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
        if (hideZeroData && s.returnQty === 0 && s.returnAmount === 0 && s.salesQty === 0) return false;
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
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · Returns & Defect Diagnostic Module</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            退货深度诊断：责任归属、Keep-It货值损失与品类/SPU分布
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            依据 <code className="text-[#0071dc] font-mono font-semibold">REFUND_COVERED_BY</code> 字段判定责任方（有
            Seller 为卖家责任，有 Walmart 为平台责任），多维拆解退货黑洞。
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">总退货额</span>
            <span className="font-bold text-slate-900">{formatUsd(coreFinancials.returnAmount || 0)}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-rose-600 block uppercase">卖家责任退款</span>
            <span className="font-bold text-rose-700">
              {formatUsd(returnBreakdown?.responsibility?.sellerAmount || 0)}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-amber-600 block uppercase">Keep-It 损失</span>
            <span className="font-bold text-amber-700">
              {formatUsd(returnBreakdown?.keepIt?.keepItAmount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* The 4 Required Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chart 1: 责任占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              1. 退款责任方占比
            </h3>
            <span className="text-[10px] font-mono text-slate-400">REFUND_COVERED_BY</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={responsibilityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {responsibilityData.map((entry, index) => (
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
            {responsibilityData.map((item, idx) => (
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

        {/* Chart 2: Keep It 占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              2. Keep-It (免退货) 占比
            </h3>
            <span className="text-[10px] font-mono text-slate-400">货值净亏损</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={keepItData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {keepItData.map((entry, index) => (
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
            {keepItData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">
                  {item.qty}件 ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: 退货品类占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
              3. 各品类退货金额分布
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Amount</span>
          </div>
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={val => `$${val}`} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatUsd(Number(val))} (${item.payload.returnQty}件, 退货率: ${item.payload.returnRatePct}%)`,
                    '退货金额'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="returnAmount" name="退货金额" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto space-y-1 pt-2 border-t border-slate-100 text-[11px] font-mono max-h-24 overflow-y-auto">
            {categoryChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-600 flex items-center">
                  <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">
                  {formatUsd(item.returnAmount)} ({item.returnQty}件)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: 退货 SPU 占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Package className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              4. 高退货 SPU 重点监控 (TOP)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Qty</span>
          </div>
          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spuChartData} layout="vertical" margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val} 件 (金额: ${formatUsd(item.payload.returnAmount)}, 退货率: ${item.payload.returnRatePct}%)`,
                    '退货数量'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="returnQty" name="退货件数" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>最高退货率 SPU:</span>
            <span className="font-bold text-rose-600">
              {spuChartData[0]?.name || '无异常'} ({spuChartData[0]?.returnRatePct || 0}%)
            </span>
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
            setSortField('returnAmount');
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      销售总量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnQty')}>
                      退货总量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnRatePct')}>
                      退货率 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnAmount')}>
                      退款金额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">退货额占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredCategoryData.map((cat, idx) => {
                    const retPct =
                      coreFinancials.returnAmount > 0
                        ? Number(((cat.returnAmount / coreFinancials.returnAmount) * 100).toFixed(1))
                        : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{cat.productType}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.salesQty.toLocaleString()} 件</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600">{cat.returnQty} 件</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              cat.returnRatePct > 5
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'text-slate-700'
                            }`}
                          >
                            {cat.returnRatePct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(cat.returnAmount)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{retPct}%</td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      出货量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnQty')}>
                      退货量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnRate')}>
                      退货率 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnAmount')}>
                      退款金额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">Keep-It 损失</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSpuData.map((spu, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{spu.spu}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{spu.productType}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{spu.salesQty} 件</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">{spu.returnQty} 件</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            spu.returnRate > 6 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-700'
                          }`}
                        >
                          {spu.returnRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(spu.returnAmount)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-700">
                        {spu.keepItLossUsd > 0 ? formatUsd(spu.keepItLossUsd) : '-'}
                      </td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      销量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnQty')}>
                      退货件数 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnRate')}>
                      退货率 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('returnAmount')}>
                      退款金额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">卖家责任数</th>
                    <th className="py-2.5 px-3 text-right">Keep-It 损失</th>
                    <th className="py-2.5 px-3">品质与退货诊断</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSkuData.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sku.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[180px] truncate">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.salesQty}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">{sku.returnQty}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            sku.returnRate > 7 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-700'
                          }`}
                        >
                          {sku.returnRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(sku.returnAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700">
                        {sku.sellerResponsibleQty > 0 ? `${sku.sellerResponsibleQty} 件` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-700">
                        {sku.keepItLossUsd > 0 ? formatUsd(sku.keepItLossUsd) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {sku.sellerResponsibleQty > 0 ? (
                          <span className="text-rose-600 font-medium">⚠️ 存在品质/配件缺陷 (卖家责任)</span>
                        ) : sku.keepItCount > 0 ? (
                          <span className="text-amber-600 font-medium">📦 Keep-It 货值免退损失</span>
                        ) : (
                          <span className="text-emerald-600">正常退货</span>
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
