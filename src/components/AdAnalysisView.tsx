import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  Search,
  ArrowUpDown,
  Flame,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import {
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
import { DimensionSortToolbar, SortOption } from './DimensionSortToolbar';

interface AdAnalysisViewProps {
  result: AnalysisResult;
}

export const AdAnalysisView: React.FC<AdAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('adSpend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hideZeroData, setHideZeroData] = useState<boolean>(true);

  const { coreFinancials, skuMetrics, spuMetrics, productTypeMetrics } = result;

  const formatUsd = (n: number) =>
    `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Category Ad Chart Data (Spend vs Sales, filter zero)
  const categoryAdChartData = useMemo(() => {
    return productTypeMetrics
      .filter(c => c.adSpend > 0 || c.adSales > 0)
      .map(c => ({
        name: c.productType,
        adSpend: c.adSpend,
        adSales: c.adSales,
        roas: c.roas
      }));
  }, [productTypeMetrics]);

  // SPU Ad Chart Data (filter zero)
  const spuAdChartData = useMemo(() => {
    return [...spuMetrics]
      .filter(s => s.adSpend > 0 || s.adSales > 0)
      .sort((a, b) => b.adSpend - a.adSpend)
      .slice(0, 8)
      .map(s => ({
        name: s.spu,
        adSpend: s.adSpend,
        adSales: s.adSales,
        roas: s.roas
      }));
  }, [spuMetrics]);

  // Sort Options
  const sortOptions = useMemo<SortOption[]>(() => {
    if (activeDimension === 'category') {
      return [
        { value: 'adSpend', label: '广告支出' },
        { value: 'adSales', label: '归因销售额' },
        { value: 'roas', label: 'ROAS 投产比' },
        { value: 'acos', label: 'ACOS 广告占比' }
      ];
    } else if (activeDimension === 'spu') {
      return [
        { value: 'adSpend', label: '广告支出' },
        { value: 'adSales', label: '归因销售额' },
        { value: 'roas', label: 'ROAS 投产比' },
        { value: 'adOrders', label: '广告订单数' },
        { value: 'acos', label: 'ACOS 广告占比' }
      ];
    } else {
      return [
        { value: 'adSpend', label: '广告支出' },
        { value: 'adSales', label: '归因销售额' },
        { value: 'roas', label: 'ROAS 投产比' },
        { value: 'ctr', label: '点击率 (CTR)' },
        { value: 'cpc', label: '单次点击花费 (CPC)' },
        { value: 'availableInventory', label: '在库库存' }
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
        if (hideZeroData && c.adSpend === 0 && c.adSales === 0) return false;
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
        if (hideZeroData && s.adSpend === 0 && s.adSales === 0) return false;
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
        if (hideZeroData && s.adSpend === 0 && s.adSales === 0) return false;
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · Advertising Efficiency Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            广告投放效益诊断：ROAS 回报、ACOS 占比与流量效率透视
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            区分广告支出与店铺实际销售额，深度排查“虚假繁荣侵蚀毛利”与“高效放量明星单品”。
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">广告总支出</span>
            <span className="font-bold text-slate-900">{formatUsd(coreFinancials.totalAdSpend)}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-[#0071dc] block uppercase">广告归因销售额</span>
            <span className="font-bold text-[#0071dc]">{formatUsd(coreFinancials.totalAdSales)}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-emerald-600 block uppercase">整体 ROAS</span>
            <span className="font-bold text-emerald-700">{coreFinancials.totalRoas}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-amber-600 block uppercase">广告销售比 (TACOS)</span>
            <span className="font-bold text-amber-700">{coreFinancials.adSpendToSalesPct}%</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: 品类广告花费 vs 归因销售额 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-[#0071dc]" />
              各品类广告花费与归因销售对比
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Category Spend vs Sales</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAdChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={val => `$${val}`} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatUsd(Number(val)),
                    name === 'adSpend' ? '广告支出' : '广告销售额'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="adSpend" name="广告支出" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adSales" name="广告归因销售额" fill="#0071dc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 主力 SPU 广告表现 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              TOP 8 SPU 广告投放与回报率 (ROAS)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Ad Spend</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spuAdChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={val => `$${val}`} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatUsd(Number(val))} (ROAS: ${item.payload.roas})`,
                    name === 'adSpend' ? '广告支出' : '广告归因销售额'
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="adSpend" name="广告支出" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="adSales" name="广告归因销售额" fill="#10b981" radius={[4, 4, 0, 0]} />
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
            setSortField('adSpend');
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSpend')}>
                      广告支出 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSales')}>
                      归因销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('roas')}>
                      ROAS <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">ACOS</th>
                    <th className="py-2.5 px-3 text-right">广告花费占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredCategoryData.map((cat, idx) => {
                    const spendPct =
                      coreFinancials.totalAdSpend > 0
                        ? Number(((cat.adSpend / coreFinancials.totalAdSpend) * 100).toFixed(1))
                        : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{cat.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(cat.adSpend)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(cat.adSales)}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              cat.roas >= 4
                                ? 'bg-emerald-50 text-emerald-700'
                                : cat.roas >= 2.5
                                ? 'text-slate-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {cat.roas}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.acos}%</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{spendPct}%</td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSpend')}>
                      广告支出 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSales')}>
                      归因销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('roas')}>
                      ROAS <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">广告订单数</th>
                    <th className="py-2.5 px-3 text-right">广告销售比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSpuData.map((spu, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{spu.spu}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans">{spu.productType}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(spu.adSpend)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(spu.adSales)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            spu.roas >= 4
                              ? 'bg-emerald-50 text-emerald-700'
                              : spu.roas >= 2.5
                              ? 'text-slate-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {spu.roas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{spu.adOrders}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{spu.acos}%</td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSpend')}>
                      广告支出 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('adSales')}>
                      归因销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('roas')}>
                      ROAS <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">CTR</th>
                    <th className="py-2.5 px-3 text-right">CPC</th>
                    <th className="py-2.5 px-3 text-right">在库库存</th>
                    <th className="py-2.5 px-3">广告与动销健康状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSkuData.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sku.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[180px] truncate">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(sku.adSpend)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(sku.adSales)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            sku.roas >= 4
                              ? 'bg-emerald-50 text-emerald-700'
                              : sku.roas >= 2.5
                              ? 'text-slate-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {sku.roas}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.ctr}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(sku.cpc)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.availableInventory} 件</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {sku.adSpend > 1000 && sku.availableInventory < 30 ? (
                          <span className="text-rose-600 font-medium">🚨 现货紧缺×广告高投 (即将断货)</span>
                        ) : sku.adSpend > 2000 && sku.roas < 2.8 ? (
                          <span className="text-rose-600 font-medium">⚠️ 虚假繁荣侵蚀毛利 (降预算)</span>
                        ) : sku.roas > 6 ? (
                          <span className="text-emerald-600 font-medium">⭐ 高ROAS明星产品 (可适度扩量)</span>
                        ) : (
                          <span className="text-slate-500">投放平稳</span>
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
