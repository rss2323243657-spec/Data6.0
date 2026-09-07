import React, { useState } from 'react';
import {
  Sliders,
  DollarSign,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ManualCostInput } from '../types';

interface CostConfigPanelProps {
  currentConfig: ManualCostInput;
  onSaveConfig: (newConfig: ManualCostInput) => void;
}

export const CostConfigPanel: React.FC<CostConfigPanelProps> = ({
  currentConfig,
  onSaveConfig
}) => {
  const [config, setConfig] = useState<ManualCostInput>({ ...currentConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 font-sans text-xs">
      <div className="bg-white rounded border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
          <div className="p-1.5 bg-[#0071dc]/10 text-[#0071dc] rounded border border-[#0071dc]/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-tight">
                经营参数、汇率与费用分摊规则配置
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                CONFIG MATRIX
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              设置核算月度、USD/RMB 汇率、头程运费总额及未录入系统时各模块的分摊算法
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Section 1: Basic Parameters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="font-bold text-slate-900 text-xs font-mono uppercase">一、基础财务换算参数 (Base Financial Parameters)</h3>
              <span className="text-[10px] font-mono text-slate-400">CURRENCY / TIMEFRAME</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-mono text-[11px]">
                  核算月份标识 (Month)
                </label>
                <input
                  type="text"
                  value={config.month}
                  onChange={(e) => setConfig({ ...config, month: e.target.value })}
                  placeholder="例如 2026-03"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-[#0071dc] focus:border-[#0071dc] text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-mono text-[11px]">
                  结算汇率 (USD 兑 RMB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={config.exchangeRate}
                    onChange={(e) => setConfig({ ...config, exchangeRate: parseFloat(e.target.value) || 7.20 })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-[#0071dc] focus:border-[#0071dc] text-slate-900 bg-slate-50/50"
                  />
                  <span className="absolute right-3 top-1.5 text-slate-400 font-mono text-[11px] font-semibold">USD/RMB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Freight & Operating Expenses */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="font-bold text-slate-900 text-xs font-mono uppercase">二、头程运费与杂费录入 (Freight & Indirect OpEx)</h3>
              <span className="text-[10px] font-mono text-slate-400">LOGISTICS ALLOCATION</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-mono text-[11px]">
                  当月店铺总头程运费 (RMB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.totalHeadFreightRmb || 0}
                  onChange={(e) => setConfig({ ...config, totalHeadFreightRmb: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-[#0071dc] focus:border-[#0071dc] text-slate-900 bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 font-mono mt-1">若单SKU未维护头程，将以此总额按分摊规则分配</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 font-mono text-[11px]">
                  当月其他运营杂项支出 (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.otherExpensesUsd || 0}
                  onChange={(e) => setConfig({ ...config, otherExpensesUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-[#0071dc] focus:border-[#0071dc] text-slate-900 bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 font-mono mt-1">如外部测款费、第三方图片拍摄等直接杂费</p>
              </div>
            </div>
          </div>

          {/* Section 3: Cost Allocation Methods */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="font-bold text-slate-900 text-xs font-mono uppercase">三、成本分摊机制 (Allocation Rules & Prioritization)</h3>
              <span className="text-[10px] font-mono text-slate-400">ENGINE PRIORITY</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <label className="block font-semibold text-slate-900 mb-1 font-mono text-[11px]">产品成本归集规则</label>
                <select
                  value={config.costAllocationMethod}
                  onChange={(e) => setConfig({ ...config, costAllocationMethod: e.target.value as any })}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-mono text-slate-800"
                >
                  <option value="erp_first">ERP单品优先 (精确匹配)</option>
                  <option value="sales_ratio">销售额比例平摊 (兜底算法)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-tight">优先读取订单表 unitCostRmb，缺失时用均值平摊</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <label className="block font-semibold text-slate-900 mb-1 font-mono text-[11px]">头程运费归集规则</label>
                <select
                  value={config.freightAllocationMethod}
                  onChange={(e) => setConfig({ ...config, freightAllocationMethod: e.target.value as any })}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-mono text-slate-800"
                >
                  <option value="erp_first">ERP单品优先 (按录入)</option>
                  <option value="sales_ratio">全店总头程按销售额占比分摊</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-tight">将总头程费用按 SKU 销售权重分摊至各单品</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <label className="block font-semibold text-slate-900 mb-1 font-mono text-[11px]">仓储费用归集规则</label>
                <select
                  value={config.storageAllocationMethod}
                  onChange={(e) => setConfig({ ...config, storageAllocationMethod: e.target.value as any })}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-xs font-mono text-slate-800"
                >
                  <option value="actual_first">Walmart 实际报表归集 (精确)</option>
                  <option value="sales_ratio">按在库库存占比分摊</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 font-sans leading-tight">按 Storage 报表精准追溯至产生费用的具体 SKU</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between font-mono">
            <span className="text-slate-500 text-[11px]">
              {savedSuccess ? (
                <span className="text-emerald-600 font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  参数已更新，全店指标已重新联动计算！
                </span>
              ) : (
                'STATUS: ENGINE READY FOR RE-EVALUATION'
              )}
            </span>

            <button
              type="submit"
              id="save-config-btn"
              className="px-4 py-2 rounded bg-[#0071dc] hover:bg-[#005bb5] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              保存参数并重新计算
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
