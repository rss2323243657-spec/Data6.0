import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  Star,
  HelpCircle,
  TrendingDown,
  Layers
} from 'lucide-react';
import { SKUMetrics, SPUMetrics, AnalysisResult, SkuMetric } from '../types';

interface SkuProfitAnalysisProps {
  result: AnalysisResult;
}

export const SkuProfitAnalysis: React.FC<SkuProfitAnalysisProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<'sku' | 'spu'>('sku');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof SKUMetrics>('salesAmount');
  const [sortAsc, setSortAsc] = useState(false);

  const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getQuadrantLabel = (q: SkuMetric['salesProfitQuadrant']) => {
    switch (q) {
      case 'Core': return '明星金牛品';
      case 'Potential': return '潜力培育品';
      case 'ProfitOptimize': return '薄利走量品';
      case 'Clearance': return '亏损滞销品';
      default: return '其他';
    }
  };

  // Filter and sort SKUs
  const filteredSkus = useMemo(() => {
    return result.skuMetrics
      .filter(item => {
        const matchesSearch =
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.spu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productType.toLowerCase().includes(searchTerm.toLowerCase());

        const quadrantLabel = getQuadrantLabel(item.salesProfitQuadrant);
        const matchesQuadrant =
          selectedQuadrant === 'all' || quadrantLabel === selectedQuadrant;

        return matchesSearch && matchesQuadrant;
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [result.skuMetrics, searchTerm, selectedQuadrant, sortField, sortAsc]);

  const handleSort = (field: keyof SKUMetrics) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const quadrantStats = useMemo(() => {
    const stats: Record<string, { count: number; sales: number; profit: number }> = {
      '明星金牛品': { count: 0, sales: 0, profit: 0 },
      '潜力培育品': { count: 0, sales: 0, profit: 0 },
      '薄利走量品': { count: 0, sales: 0, profit: 0 },
      '亏损滞销品': { count: 0, sales: 0, profit: 0 }
    };
    result.skuMetrics.forEach(s => {
      const qLabel = getQuadrantLabel(s.salesProfitQuadrant);
      if (stats[qLabel]) {
        stats[qLabel].count += 1;
        stats[qLabel].sales += s.salesAmount;
        stats[qLabel].profit += s.operatingProfitUsd;
      }
    });
    return stats;
  }, [result.skuMetrics]);


  return (
    <div className="space-y-5 pb-12">
      {/* 4 Quadrants Technical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Star / Cash Cow */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === '明星金牛品' ? 'all' : '明星金牛品')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedQuadrant === '明星金牛品'
              ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-800">
            <span className="flex items-center uppercase tracking-wider text-[10px]">
              <Star className="w-3.5 h-3.5 mr-1 text-emerald-600 fill-emerald-600" />
              Q1: 明星金牛品
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {quadrantStats['明星金牛品'].count}款
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatUsd(quadrantStats['明星金牛品'].profit)}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 border-t border-slate-100 pt-1.5">
            <span>销售: {formatUsd(quadrantStats['明星金牛品'].sales)}</span>
            <span className="text-emerald-700 font-medium">高销 × 高利</span>
          </div>
        </div>

        {/* Potential / Question Mark */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === '潜力培育品' ? 'all' : '潜力培育品')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedQuadrant === '潜力培育品'
              ? 'bg-blue-50/80 border-[#0071dc] ring-1 ring-[#0071dc]'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-[#0071dc]">
            <span className="flex items-center uppercase tracking-wider text-[10px]">
              <HelpCircle className="w-3.5 h-3.5 mr-1 text-[#0071dc]" />
              Q2: 潜力培育品
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-[#0071dc] border border-blue-200">
              {quadrantStats['潜力培育品'].count}款
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0071dc]">
            {formatUsd(quadrantStats['潜力培育品'].profit)}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 border-t border-slate-100 pt-1.5">
            <span>销售: {formatUsd(quadrantStats['潜力培育品'].sales)}</span>
            <span className="text-[#0071dc] font-medium">低销 × 高率</span>
          </div>
        </div>

        {/* Thin Margin High Volume */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === '薄利走量品' ? 'all' : '薄利走量品')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedQuadrant === '薄利走量品'
              ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-500'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-amber-800">
            <span className="flex items-center uppercase tracking-wider text-[10px]">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Q3: 薄利走量品
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {quadrantStats['薄利走量品'].count}款
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700">
            {formatUsd(quadrantStats['薄利走量品'].profit)}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 border-t border-slate-100 pt-1.5">
            <span>销售: {formatUsd(quadrantStats['薄利走量品'].sales)}</span>
            <span className="text-amber-700 font-medium">高销 × 薄利</span>
          </div>
        </div>

        {/* Loss Maker / Dog */}
        <div
          onClick={() => setSelectedQuadrant(selectedQuadrant === '亏损滞销品' ? 'all' : '亏损滞销品')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
            selectedQuadrant === '亏损滞销品'
              ? 'bg-rose-50/80 border-rose-500 ring-1 ring-rose-500'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-mono text-rose-800">
            <span className="flex items-center uppercase tracking-wider text-[10px]">
              <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600" />
              Q4: 亏损滞销品
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {quadrantStats['亏损滞销品'].count}款
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700">
            {formatUsd(quadrantStats['亏损滞销品'].profit)}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1 border-t border-slate-100 pt-1.5">
            <span>销售: {formatUsd(quadrantStats['亏损滞销品'].sales)}</span>
            <span className="text-rose-700 font-medium">低销 × 亏损</span>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded border border-slate-200 bg-white p-0.5 text-xs font-medium font-mono">
              <button
                onClick={() => setViewMode('sku')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'sku' ? 'bg-[#0071dc] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SKU 明细视图 ({result.skuMetrics.length})
              </button>
              <button
                onClick={() => setViewMode('spu')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'spu' ? 'bg-[#0071dc] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SPU 款号视图 ({result.spuMetrics.length})
              </button>
            </div>

            {selectedQuadrant !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[#0071dc] text-xs font-mono font-medium">
                过滤: {selectedQuadrant}
                <button
                  onClick={() => setSelectedQuadrant('all')}
                  className="ml-1.5 text-blue-500 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索 SKU / SPU / 品名 / 类目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0071dc] focus:border-[#0071dc] font-mono"
            />
          </div>
        </div>

        {/* SKU View Table */}
        {viewMode === 'sku' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">SKU 信息</th>
                  <th className="py-2.5 px-3">归属 SPU / 类目</th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('salesAmount')}
                  >
                    <span className="inline-flex items-center">
                      销售额
                      <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                    </span>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('salesQty')}
                  >
                    销量
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('adSpend')}
                  >
                    广告花费 (ROAS)
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('storageFeeUsd')}
                  >
                    仓储费 (高库龄)
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('returnRate')}
                  >
                    退货率 (损失)
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('operatingProfitUsd')}
                  >
                    <span className="inline-flex items-center font-bold text-slate-900">
                      经营贡献利润
                      <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />
                    </span>
                  </th>
                  <th
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-[#0071dc]"
                    onClick={() => handleSort('operatingProfitMargin')}
                  >
                    利润率
                  </th>
                  <th className="py-2.5 px-3 text-center">四象限定位</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSkus.map((s) => (
                  <tr key={s.sku} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900 font-mono">{s.sku}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{s.productName}</div>
                      {s.inventoryHealthTag === 'AdStockConflict' && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-mono font-medium text-[10px] border border-rose-200">
                          断货高投冲突
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono text-slate-700 block">{s.spu}</span>
                      <span className="text-[11px] text-slate-500">{s.productType}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                      {formatUsd(s.salesAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      {s.salesQty}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      <div>{formatUsd(s.adSpend)}</div>
                      <span className="text-[10px] font-semibold text-purple-700">ROAS {s.roas}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      <div>{formatUsd(s.storageFeeUsd)}</div>
                      {s.highAgingStorageFeeUsd > 50 && (
                        <span className="text-[10px] text-rose-600 font-medium block">罚金${s.highAgingStorageFeeUsd.toFixed(0)}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      <div>{s.returnRate}%</div>
                      <span className="text-[10px] text-slate-500 block">退款${s.returnAmount.toFixed(0)}</span>
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-bold ${s.operatingProfitUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatUsd(s.operatingProfitUsd)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      <span className={`font-semibold ${s.operatingProfitMargin >= 25 ? 'text-emerald-600' : (s.operatingProfitMargin < 10 ? 'text-rose-600' : 'text-slate-800')}`}>
                        {s.operatingProfitMargin}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        getQuadrantLabel(s.salesProfitQuadrant) === '明星金牛品'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : getQuadrantLabel(s.salesProfitQuadrant) === '潜力培育品'
                          ? 'bg-blue-100 text-[#0071dc] border-blue-200'
                          : getQuadrantLabel(s.salesProfitQuadrant) === '薄利走量品'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {getQuadrantLabel(s.salesProfitQuadrant)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SPU View Table */}
        {viewMode === 'spu' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">SPU 款号</th>
                  <th className="py-2.5 px-3">产品类目</th>
                  <th className="py-2.5 px-3 text-right">总销售额</th>
                  <th className="py-2.5 px-3 text-right">总销量</th>
                  <th className="py-2.5 px-3 text-right">总广告投入 (ROAS)</th>
                  <th className="py-2.5 px-3 text-right">总仓储费 (高库龄)</th>
                  <th className="py-2.5 px-3 text-right">退货件数 (Keep-It)</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">经营贡献利润</th>
                  <th className="py-2.5 px-3 text-right">利润率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.spuMetrics.map((spu) => (
                  <tr key={spu.spu} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <span className="font-mono">{spu.spu}</span>
                      <span className="block text-[11px] text-slate-500 font-mono">子SKU: {result.skuMetrics.filter(s => s.spu === spu.spu).length} 款</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{spu.productType}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">{formatUsd(spu.salesAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{spu.salesQty} 件</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      <div>{formatUsd(spu.adSpend)}</div>
                      <span className="text-[10px] font-semibold text-purple-700">ROAS {spu.roas}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      <div>{formatUsd(spu.storageFeeUsd)}</div>
                      {spu.highAgingStorageFeeUsd > 100 && (
                        <span className="text-[10px] text-rose-600 font-medium block">罚金${spu.highAgingStorageFeeUsd.toFixed(0)}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      <div>{spu.returnUnits} 件</div>
                      <span className="text-[10px] text-amber-700 block">KeepIt {spu.keepItUnits}件</span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${spu.operatingProfitUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatUsd(spu.operatingProfitUsd)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                      {spu.operatingProfitMargin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
