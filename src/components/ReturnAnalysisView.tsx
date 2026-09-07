import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Package,
  Layers,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertTriangle,
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
import { AnalysisResult, SkuMetric, SpuMetric, ProductTypeMetric } from '../types';
import { CollapsibleTableWrapper } from './CollapsibleTableWrapper';

interface ReturnAnalysisViewProps {
  result: AnalysisResult;
}

const COLORS = ['#ef4444', '#0071dc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReturnAnalysisView: React.FC<ReturnAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('returnQty');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { coreFinancials, returnBreakdown, skuMetrics, spuMetrics, productTypeMetrics } = result;

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

  // Chart 3: Category Return Share (品类退货占比)
  const categoryChartData = useMemo(() => {
    return (returnBreakdown?.byCategory || []).map((c, i) => ({
      name: c.category,
      returnQty: c.returnQty,
      returnAmount: c.returnAmount,
      returnRatePct: c.returnRatePct,
      color: COLORS[i % COLORS.length]
    }));
  }, [returnBreakdown]);

  // Chart 4: SPU Return Share (SPU 退货占比)
  const spuChartData = useMemo(() => {
    return (returnBreakdown?.bySpu || []).slice(0, 8).map((s, i) => ({
      name: s.spu,
      returnQty: s.returnQty,
      returnAmount: s.returnAmount,
      returnRatePct: s.returnRatePct,
      color: COLORS[i % COLORS.length]
    }));
  }, [returnBreakdown]);

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
            <span className="font-bold text-slate-900">{formatUsd(coreFinancials.returnAmount)}</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-rose-600 block uppercase">卖家责任退款</span>
            <span className="font-bold text-rose-700">
              {formatUsd(returnBreakdown?.responsibility.sellerAmount || 0)}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-amber-600 block uppercase">Keep-It 损失</span>
            <span className="font-bold text-amber-700">
              {formatUsd(returnBreakdown?.keepIt.keepItAmount || 0)}
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
              3. 退货品类金额占比
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Category Share</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="returnAmount"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatUsd(Number(val))}`,
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
          <div className="mt-auto space-y-1 pt-2 border-t border-slate-100 text-[11px] font-mono max-h-24 overflow-y-auto">
            {categoryChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="truncate max-w-[120px] text-slate-600 flex items-center">
                  <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">{formatUsd(item.returnAmount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: 退货 SPU 占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Package className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              4. 退货 SPU TOP 排名
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Qty</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spuChartData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={75}
                  tickFormatter={val => (val.length > 10 ? `${val.substring(0, 8)}...` : val)}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} 件`, '退货数量']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="returnQty" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>最高退货率 SPU:</span>
            <span className="font-bold text-rose-600">
              {spuChartData[0]?.name || 'N/A'} ({spuChartData[0]?.returnRatePct || 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3-Dimensional Analysis Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          {/* Dimension Tabs: 品类 / SPU / SKU */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setActiveDimension('category');
                setSortField('returnAmount');
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
                setSortField('returnAmount');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeDimension === 'spu'
                  ? 'bg-white text-[#0071dc] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SPU 维度
            </button>
            <button
              onClick={() => {
                setActiveDimension('sku');
                setSortField('returnAmount');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeDimension === 'sku'
                  ? 'bg-white text-[#0071dc] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SKU 细分维度
            </button>
          </div>

          {/* Search Input */}
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
