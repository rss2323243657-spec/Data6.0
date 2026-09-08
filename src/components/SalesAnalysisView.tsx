import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Search,
  ArrowUpDown,
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
import { DimensionSortToolbar, SortOption } from './DimensionSortToolbar';

interface SalesAnalysisViewProps {
  result: AnalysisResult;
}

const COLORS = ['#0071dc', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const SalesAnalysisView: React.FC<SalesAnalysisViewProps> = ({ result }) => {
  const [activeDimension, setActiveDimension] = useState<'category' | 'spu' | 'sku'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('salesAmount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [hideZeroData, setHideZeroData] = useState<boolean>(true);

  const coreFinancials = result.coreFinancials || ({} as any);
  const skuMetrics = result.skuMetrics || [];
  const spuMetrics = result.spuMetrics || [];
  const productTypeMetrics = result.productTypeMetrics || [];

  const formatUsd = (n: number) =>
    `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Category Sales Chart Data (filter zero)
  const categorySalesData = useMemo(() => {
    return productTypeMetrics
      .filter(c => c.salesAmount > 0 || c.salesQty > 0)
      .map((c, i) => ({
        name: c.productType,
        salesAmount: c.salesAmount,
        salesQty: c.salesQty,
        salesSharePct: c.salesSharePct,
        color: COLORS[i % COLORS.length]
      }));
  }, [productTypeMetrics]);

  // SPU Top 10 Sales Chart Data (filter zero)
  const spuSalesData = useMemo(() => {
    return [...spuMetrics]
      .filter(s => s.salesAmount > 0 || s.salesQty > 0)
      .sort((a, b) => b.salesAmount - a.salesAmount)
      .slice(0, 8)
      .map(s => ({
        name: s.spu,
        salesAmount: s.salesAmount,
        salesQty: s.salesQty,
        productType: s.productType
      }));
  }, [spuMetrics]);

  // Sort Options
  const sortOptions = useMemo<SortOption[]>(() => {
    if (activeDimension === 'category') {
      return [
        { value: 'salesAmount', label: '销售额' },
        { value: 'salesQty', label: '销售件数' },
        { value: 'salesSharePct', label: '全店销售占比' },
        { value: 'operatingProfit', label: '贡献利润额' }
      ];
    } else if (activeDimension === 'spu') {
      return [
        { value: 'salesAmount', label: '销售额' },
        { value: 'salesQty', label: '销售件数' },
        { value: 'spuSharePct', label: 'SPU销售占比' },
        { value: 'daysOfSupply', label: '周转天数 (DOS)' }
      ];
    } else {
      return [
        { value: 'salesAmount', label: '销售额' },
        { value: 'salesQty', label: '销售件数' },
        { value: 'sellingPriceAvg', label: '平均售价' },
        { value: 'availableInventory', label: '可用库存' }
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
        if (hideZeroData && c.salesAmount === 0 && c.salesQty === 0) return false;
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
        if (hideZeroData && s.salesAmount === 0 && s.salesQty === 0) return false;
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
        if (hideZeroData && s.salesAmount === 0 && s.salesQty === 0) return false;
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
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · Sales Performance Diagnostic Module</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            销售情况统计与透视：品类矩阵、SPU主力梯队与SKU动销
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            数据严格来源于公司真实出货订单（自动剔除 Cancelled 订单），多维核算真实出货额、客单价与动销分布。
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">当月总销售额</span>
            <span className="font-bold text-slate-900">{formatUsd(coreFinancials.salesRevenue || 0)}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-[#0071dc] block uppercase">总出货件数</span>
            <span className="font-bold text-[#0071dc]">{(coreFinancials.salesQty ?? coreFinancials.salesUnits ?? 0).toLocaleString()} 件</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 text-right">
            <span className="text-[10px] text-emerald-600 block uppercase">全店平均客单价</span>
            <span className="font-bold text-emerald-700">{formatUsd(coreFinancials.averageOrderValue || 0)}</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: 品类销售额占比 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-[#0071dc]" />
              各品类销售额占比 (Category Share)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Sales</span>
          </div>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="salesAmount"
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${formatUsd(Number(val))} (${item.payload.salesSharePct}%)`,
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
            {categorySalesData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center text-slate-600">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800">
                  {formatUsd(item.salesAmount)} ({item.salesSharePct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: SPU Top 8 销售额排名 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 font-mono flex items-center">
              <Package className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              主力 SPU 销售额排名 (TOP 8)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Sales Amount</span>
          </div>
          <div className="h-56 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spuSalesData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={val => `$${val}`} />
                <Tooltip
                  formatter={(val: any) => [formatUsd(Number(val)), '销售额']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="salesAmount" name="销售额" fill="#0071dc" radius={[4, 4, 0, 0]} />
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
            setSortField('salesAmount');
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesAmount')}>
                      销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">全店销售占比</th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      销量件数 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">平均客单价</th>
                    <th className="py-2.5 px-3 text-right">贡献利润额</th>
                    <th className="py-2.5 px-3 text-right">利润率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredCategoryData.map((cat, idx) => {
                    const avgPrice = cat.salesQty > 0 ? Number((cat.salesAmount / cat.salesQty).toFixed(2)) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{cat.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(cat.salesAmount)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.salesSharePct}%</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{cat.salesQty.toLocaleString()} 件</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(avgPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatUsd(cat.operatingProfitUsd)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              cat.operatingProfitMargin > 30
                                ? 'bg-emerald-50 text-emerald-700'
                                : cat.operatingProfitMargin > 15
                                ? 'text-slate-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {cat.operatingProfitMargin}%
                          </span>
                        </td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesAmount')}>
                      销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      销量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">客单价</th>
                    <th className="py-2.5 px-3 text-right">贡献利润额</th>
                    <th className="py-2.5 px-3 text-right">贡献利润率</th>
                    <th className="py-2.5 px-3">四象限定位</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSpuData.map((spu, idx) => {
                    const avgPrice = spu.salesQty > 0 ? Number((spu.salesAmount / spu.salesQty).toFixed(2)) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{spu.spu}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">{spu.productType}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(spu.salesAmount)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{spu.salesQty} 件</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(avgPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatUsd(spu.operatingProfitUsd)}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{spu.operatingProfitMargin}%</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              spu.quadrant === 'Star'
                                ? 'bg-emerald-100 text-emerald-800'
                                : spu.quadrant === 'CashCow'
                                ? 'bg-blue-100 text-blue-800'
                                : spu.quadrant === 'Question'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {spu.quadrant}
                          </span>
                        </td>
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
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesAmount')}>
                      销售额 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('salesQty')}>
                      销量 <ArrowUpDown className="w-3 h-3 inline ml-0.5 text-slate-400" />
                    </th>
                    <th className="py-2.5 px-3 text-right">单价</th>
                    <th className="py-2.5 px-3 text-right">贡献利润额</th>
                    <th className="py-2.5 px-3 text-right">利润率</th>
                    <th className="py-2.5 px-3 text-right">日均销量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredSkuData.map((sku, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{sku.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[180px] truncate">{sku.productName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatUsd(sku.salesAmount)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{sku.salesQty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{formatUsd(sku.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatUsd(sku.operatingProfitUsd)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{sku.operatingProfitMargin}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{(sku.salesQty / 30).toFixed(1)} 件/天</td>
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
