import React from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  AlertCircle,
  Clock,
  RotateCcw,
  Warehouse,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardProps {
  result: AnalysisResult;
  onNavigateToTab: (tab: string) => void;
}

export const ExecutiveDashboard: React.FC<DashboardProps> = ({ result, onNavigateToTab }) => {
  const fin = result.coreFinancials;
  const mom = result.momComparison;
  const score = result.healthScore;

  const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner: Technical Findings Alert */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs border-l-4 border-l-[#0071dc]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-[#0071dc]/10 text-[#0071dc] border border-[#0071dc]/20">
                本月经营结论定位
              </span>
              <span className="text-xs text-slate-400 font-mono">
                DATA SOURCE: ERP_ORDERS + WMT_REPORTS | AUDIT CONFIRMED
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1.5 tracking-tight text-slate-900">
              经营贡献利润 <span className="font-mono text-emerald-600">{formatUsd(fin.operatingProfit)}</span>
              <span className="text-slate-400 text-sm font-normal ml-2 font-mono">(利润率 {fin.operatingProfitMargin}%)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              五维联动诊断判定为【<span className="text-amber-700 font-semibold">{result.salesAdProfitLinkage.caseType}</span>】：
              {result.salesAdProfitLinkage.description}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigateToTab('report')}
              id="dash-view-formal-report-btn"
              className="px-3.5 py-2 rounded text-white bg-[#0071dc] hover:bg-[#005bb5] font-medium text-xs transition-colors flex items-center shadow-xs cursor-pointer"
            >
              查阅完整17章诊断报告
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Technical Efficiency Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ad Efficiency */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ad Efficiency</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{fin.roas}</span>
            <span className="text-xs text-slate-400 font-mono">ROAS</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0071dc]" style={{ width: `${Math.min(100, (fin.roas / 6) * 100)}%` }}></div>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 font-mono">ACOS: {fin.adSpendToSalesPct}% | 归因销售: {formatUsd(fin.adSales)}</p>
        </div>

        {/* Inventory Health */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Health</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{fin.highAgingStorageFeePct}%</span>
            <span className="text-xs text-slate-400 font-mono">超期罚金占比</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${fin.highAgingStorageFeePct > 30 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, fin.highAgingStorageFeePct)}%` }}></div>
          </div>
          <p className="mt-2 text-[10px] text-rose-600 font-mono">
            超期罚金: {formatUsd(fin.totalStorageFee * (fin.highAgingStorageFeePct / 100))} | 现货{fin.inventoryUnits}件
          </p>
        </div>

        {/* Return Risk */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Return Risk</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{fin.returnRatePct}%</span>
            <span className="text-xs text-slate-400 font-mono">退货率</span>
          </div>
          <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${fin.returnRatePct > 4 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, fin.returnRatePct * 15)}%` }}></div>
          </div>
          <p className="mt-2 text-[10px] text-amber-600 font-mono">
            有效退款: {formatUsd(fin.returnAmount)} | Keep-It: {fin.keepItUnits}件
          </p>
        </div>
      </div>

      {/* 3-Column Technical Grid: P&L Summary (Left) + SPU Matrix (Center) + Diagnosis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1-3: Monthly P&L Summary */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex-1">
            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Monthly P&L Summary
            </h2>
            <div className="space-y-3.5">
              <div>
                <p className="text-xs text-slate-500">Gross Sales (ERP 实际销售额)</p>
                <p className="text-2xl font-bold font-mono text-slate-900">{formatUsd(fin.salesRevenue)}</p>
                {mom && (
                  <p className={`text-xs font-mono mt-0.5 ${mom.salesGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {mom.salesGrowthPct >= 0 ? '↑' : '↓'} {Math.abs(mom.salesGrowthPct)}% vs Last Month
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Net Profit</p>
                  <p className="text-base font-bold font-mono text-emerald-600">{formatUsd(fin.operatingProfit)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Margin</p>
                  <p className="text-base font-bold font-mono text-emerald-600">{fin.operatingProfitMargin}%</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">产品采购成本</span>
                  <span className="font-mono text-slate-700">-{formatUsd(fin.productCostUsd)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">头程物流运费</span>
                  <span className="font-mono text-slate-700">-{formatUsd(fin.headFreightUsd)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Walmart 广告支出</span>
                  <span className="font-mono text-amber-600">-{formatUsd(fin.adSpend)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Walmart 仓储总费</span>
                  <span className="font-mono text-rose-600">-{formatUsd(fin.totalStorageFee)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">退货损失与Keep-It</span>
                  <span className="font-mono text-rose-600">-{formatUsd(fin.returnAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-2.5">
                  <span className="text-slate-800">经营贡献利润</span>
                  <span className="font-mono text-[#0071dc]">{formatUsd(fin.operatingProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 4-9: Top SPU Profitability Matrix */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex-1 flex flex-col">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Top SPU Profitability Matrix
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">*按款号聚合实际销售、广告与利润贡献</span>
              </div>
              <button
                onClick={() => onNavigateToTab('profit')}
                className="text-xs font-semibold text-[#0071dc] hover:underline cursor-pointer font-mono"
              >
                四象限矩阵 &rarr;
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2 font-medium">SPU 款号 / 品类</th>
                    <th className="px-3 py-2 font-medium text-right">Sales</th>
                    <th className="px-3 py-2 font-medium text-right">Ad Spend</th>
                    <th className="px-3 py-2 font-medium text-right">ROAS</th>
                    <th className="px-3 py-2 font-medium text-right">Net Profit</th>
                    <th className="px-3 py-2 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.spuMetrics.map((spu) => {
                    const isProfitable = spu.operatingProfitUsd >= 0;
                    const isHighRoas = spu.roas >= 4;
                    const isHighRisk = spu.operatingProfitUsd < 0 || spu.highAgingStorageFeeUsd > 100;
                    const statusLabel = isHighRisk ? 'Critical' : isHighRoas ? 'Core' : 'Optimizing';
                    const statusClass = isHighRisk
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : isHighRoas
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border-amber-200';

                    return (
                      <tr key={spu.spu} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-2.5">
                          <p className="font-bold text-slate-900">{spu.spu}</p>
                          <p className="text-[10px] text-slate-400 italic">{spu.productType}</p>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-right text-slate-900 font-medium">
                          {formatUsd(spu.salesAmount)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-right text-slate-500">
                          {formatUsd(spu.adSpend)}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-right font-bold text-slate-700">
                          {spu.roas}
                        </td>
                        <td className={`px-3 py-2.5 font-mono text-right font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatUsd(spu.operatingProfitUsd)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col 10-12: Diagnosis & Action Items */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex-1">
            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Diagnosis & Action Items
            </h2>
            <div className="space-y-3">
              {result.top10Problems.slice(0, 3).map((prob, idx) => {
                const isP0 = prob.priority === 'P0';
                const isP1 = prob.priority === 'P1';
                const cardBorder = isP0
                  ? 'border-l-4 border-rose-500 bg-rose-50/70 text-rose-900'
                  : isP1
                  ? 'border-l-4 border-amber-500 bg-amber-50/70 text-amber-900'
                  : 'border-l-4 border-emerald-500 bg-emerald-50/70 text-emerald-900';
                const titleColor = isP0 ? 'text-rose-800' : isP1 ? 'text-amber-800' : 'text-emerald-800';
                const actionColor = isP0 ? 'text-rose-950' : isP1 ? 'text-amber-950' : 'text-emerald-950';

                return (
                  <div key={prob.id} className={`rounded-lg p-3 ${cardBorder}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider font-mono ${titleColor}`}>
                      {prob.priority}: {prob.problem}
                    </p>
                    <p className="text-xs text-slate-700 mt-1 leading-snug">
                      {prob.dataEvidence}
                    </p>
                    <p className={`mt-2 text-[10px] font-bold underline cursor-pointer font-mono ${actionColor}`}>
                      ACTION: {prob.solution.split('；')[0] || prob.solution}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Next Month Targets */}
            <div className="mt-4 border-t border-slate-200 pt-3.5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Next Month Targets
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500 font-mono">Sales Goal</p>
                  <p className="text-sm font-bold font-mono text-slate-900">$550,000</p>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[10px] text-slate-500 font-mono">Profit Goal</p>
                  <p className="text-sm font-bold font-mono text-emerald-600">$90,000</p>
                </div>
              </div>
            </div>

            {/* Health Score Mini Widget */}
            <div className="mt-4 border-t border-slate-200 pt-3.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Health Index
                </span>
                <span className="text-xs font-bold font-mono text-[#0071dc]">{score.totalScore}/100 ({score.level})</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0071dc] h-1.5 rounded-full" style={{ width: `${score.totalScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Technical Grid: Health Evaluation Matrix & Store Manager Top 5 Action Framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 6-Dimension Health Evaluation Matrix */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              6-Dimension Store Health Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400">100-PT EVALUATION</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>销售规模 (20)</span>
                <span className="font-bold text-slate-900">{score.salesScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(score.salesScore / 20) * 100}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>利润能力 (25)</span>
                <span className="font-bold text-slate-900">{score.profitScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-[#0071dc] h-full" style={{ width: `${(score.profitScore / 25) * 100}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>广告效能 (15)</span>
                <span className="font-bold text-slate-900">{score.adScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full" style={{ width: `${(score.adScore / 15) * 100}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>库存动销 (15)</span>
                <span className="font-bold text-slate-900">{score.inventoryScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${(score.inventoryScore / 15) * 100}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>退货控制 (10)</span>
                <span className="font-bold text-slate-900">{score.returnScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${(score.returnScore / 10) * 100}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>仓储罚金 (10)</span>
                <span className="font-bold text-slate-900">{score.storageScore}分</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${(score.storageScore / 10) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Priorities */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Store Manager Top 5 Action Framework
            </h3>
            <span className="text-[10px] font-mono text-[#0071dc] font-semibold">EXECUTION PROTOCOL</span>
          </div>
          <div className="space-y-2">
            {result.executiveTop5Priorities.map((item) => (
              <div key={item.priorityRank} className="text-xs border-l-2 border-[#0071dc] pl-2.5 py-1 bg-slate-50/70 rounded-r">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0071dc] font-mono">TOP {item.priorityRank}: {item.what}</span>
                  <span className="text-[10px] font-mono text-slate-400">{item.targetSkusOrSpus}</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  TARGET: {item.expectedResolution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
