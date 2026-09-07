import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Printer,
  Check,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface FormalReportProps {
  result: AnalysisResult;
}

export const FormalMonthlyReport: React.FC<FormalReportProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const fin = result.coreFinancials;
  const mom = result.momComparison;
  const dq = result.dataQuality;

  const formatUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const chapters = [
    { id: 'ch1', title: '一、管理层经营摘要' },
    { id: 'ch2', title: '二、数据质量与数据口径' },
    { id: 'ch3', title: '三、店铺核心经营指标' },
    { id: 'ch4', title: '四、销售分析' },
    { id: 'ch5', title: '五、广告分析' },
    { id: 'ch6', title: '六、SKU/SPU盈利分析' },
    { id: 'ch7', title: '七、退货分析' },
    { id: 'ch8', title: '八、库存与库龄分析' },
    { id: 'ch9', title: '九、仓储费用分析' },
    { id: 'ch10', title: '十、全链路五维联动分析' },
    { id: 'ch11', title: '十一、TOP 10 经营问题' },
    { id: 'ch12', title: '十二、TOP 10 经营机会' },
    { id: 'ch13', title: '十三、下个月广告策略' },
    { id: 'ch14', title: '十四、下个月库存策略' },
    { id: 'ch15', title: '十五、下个月产品策略' },
    { id: 'ch16', title: '十六、下个月经营目标' },
    { id: 'ch17', title: '十七、最终管理层结论' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# Walmart 店铺月度经营分析报告 (${result.month})\n\n`;
    md += `## 一、管理层经营摘要\n\n`;
    result.executiveSummaryText.forEach((p, i) => {
      md += `${i + 1}. ${p}\n\n`;
    });

    md += `## 二、数据质量与数据口径\n\n`;
    md += `- 数据可信度: ${dq.dataCredibility}\n`;
    md += `- 排除取消订单: ${dq.cancelledOrdersExcludedCount} 单\n`;
    md += `- 排除取消退货: ${dq.cancelledReturnsExcludedCount} 单\n`;
    md += `- 数据口径说明: 本报告销售基于ERP订单表，广告基于Walmart Item Performance，库存基于Inventory Health，仓储基于Storage报表，成本基于用户设定汇率 7.20 转换。未含平台佣金与税费，为经营贡献利润口径。\n\n`;

    md += `## 三、店铺核心经营指标\n\n`;
    md += `| 核心指标 | 本月数值 | 环比变动 |\n|---|---|---|\n`;
    md += `| ERP实际销售额 | $${fin.salesRevenue.toLocaleString()} | ${mom ? (mom.salesGrowthPct >= 0 ? '+' : '') + mom.salesGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 经营贡献利润 | $${fin.operatingProfit.toLocaleString()} | ${mom ? (mom.profitGrowthPct >= 0 ? '+' : '') + mom.profitGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 贡献利润率 | ${fin.operatingProfitMargin}% | ${mom ? (mom.profitMarginDiffPts >= 0 ? '+' : '') + mom.profitMarginDiffPts + ' pts' : 'N/A'} |\n`;
    md += `| 广告总支出 | $${fin.adSpend.toLocaleString()} | ${mom ? (mom.adSpendGrowthPct >= 0 ? '+' : '') + mom.adSpendGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 广告ROAS | ${fin.roas} | 归因销售 $${fin.adSales.toLocaleString()} |\n`;
    md += `| 退货率 | ${fin.returnRatePct}% | 退货 ${fin.returnUnits} 件 / 退款 $${fin.returnAmount.toLocaleString()} |\n`;
    md += `| 仓储费用 | $${fin.totalStorageFee.toLocaleString()} | 超期罚金占比 ${fin.highAgingStorageFeePct}% |\n\n`;

    md += `## 十一、TOP 10 经营问题\n\n`;
    result.top10Problems.forEach((p, i) => {
      md += `### ${i + 1}. [${p.priority}] ${p.problem}\n`;
      md += `- **数据依据**: ${p.dataEvidence}\n`;
      md += `- **影响程度**: ${p.impact}\n`;
      md += `- **根本原因**: ${p.rootCause}\n`;
      md += `- **应对解法**: ${p.solution}\n\n`;
    });

    md += `## 十七、最终管理层结论 (店长下月必做Top 5)\n\n`;
    result.executiveTop5Priorities.forEach(p => {
      md += `### 第${p.priorityRank}优先级: ${p.what}\n`;
      md += `- **为什么做**: ${p.why}\n`;
      md += `- **针对对象**: ${p.targetSkusOrSpus}\n`;
      md += `- **数据依据**: ${p.dataEvidence}\n`;
      md += `- **预期解决**: ${p.expectedResolution}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 pb-16">
      {/* Left Navigation: Chapter Jump Anchor Bar */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center font-mono uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#0071dc]" />
              17-Chapter TOC
            </span>
            <span className="text-[10px] text-slate-400 font-mono">STANDARDIZED</span>
          </div>

          <nav className="space-y-0.5 max-h-[65vh] overflow-y-auto scrollbar-thin text-xs font-mono">
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className="block px-2.5 py-1.5 rounded text-slate-600 hover:text-[#0071dc] hover:bg-slate-50 transition-colors truncate"
              >
                {ch.title}
              </a>
            ))}
          </nav>

          <div className="pt-2.5 border-t border-slate-200 space-y-2 font-mono">
            <button
              onClick={handleCopyMarkdown}
              id="copy-markdown-btn"
              className="w-full py-2 px-3 rounded text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'COPIED MARKDOWN' : 'COPY MARKDOWN'}
            </button>
            <button
              onClick={handlePrint}
              id="print-report-btn"
              className="w-full py-2 px-3 rounded text-xs font-bold text-white bg-[#0071dc] hover:bg-[#005bb5] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              PRINT / EXPORT PDF
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Full 17 Chapters Report Body */}
      <div className="lg:col-span-3 space-y-7 bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Report Header Title */}
        <div className="border-b border-slate-200 pb-5 text-center">
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0071dc] border border-blue-200 mb-2 uppercase tracking-wider">
            Walmart US Marketplace Monthly Operating &amp; Diagnostic Audit
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Walmart 店铺月度经营分析与利润诊断报告
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1.5">
            PERIOD: <strong className="text-slate-700">{result.month}</strong> | AUDIT TIMESTAMP: {new Date().toISOString().split('T')[0]} | AUDITOR: SENIOR WALMART OPERATIONS &amp; P&amp;L ANALYST
          </p>
        </div>

        {/* 1. 一、管理层经营摘要 */}
        <section id="ch1" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">一、管理层经营摘要</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">EXECUTIVE SUMMARY</span>
          </div>
          <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-700 leading-relaxed font-mono">
            {result.executiveSummaryText.map((p, idx) => (
              <p key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-[#0071dc]">{idx + 1}.</span>
                <span>{p}</span>
              </p>
            ))}
          </div>
        </section>

        {/* 2. 二、数据质量与数据口径 */}
        <section id="ch2" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">二、数据质量与数据口径说明</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">DATA CREDIBILITY &amp; SCOPE</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Credibility Grade</span>
              <span className="text-sm font-bold font-mono text-emerald-600 mt-0.5 block">{dq.dataCredibility}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cancelled Orders Filtered</span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{dq.cancelledOrdersExcludedCount} 单 (已完全剔除)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cancelled Returns Filtered</span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{dq.cancelledReturnsExcludedCount} 单 (已完全排除)</span>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-2 px-3">数据来源报表</th>
                  <th className="py-2 px-3 text-right">原始行数</th>
                  <th className="py-2 px-3 text-right">有效纳入行</th>
                  <th className="py-2 px-3 text-right">排除/过滤行</th>
                  <th className="py-2 px-3">清洗与防重规则</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {dq.sources.map((src, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-900">{src.name}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{src.totalRows}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600">{src.validRows}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{src.excludedRows}</td>
                    <td className="py-2 px-3 text-slate-600 font-sans text-xs">{src.exclusionReasons.join('；') || '全部有效通过'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 font-mono">
            <strong className="text-slate-900">【财务与运营口径说明】:</strong>
            <p className="mt-1 leading-relaxed text-[11px]">
              1. 销售额以 <strong>ERP订单表实际发货金额</strong> 为唯一主数据源，剔除所有取消订单；Walmart Item Performance仅作为广告成本来源及广告归因销售依据。<br/>
              2. 经营利润为 <strong>【经营贡献利润】</strong> 口径，公式 = 销售额 - 产品成本 - 头程运费 - Walmart广告花费 - Walmart仓储费 - 其他杂费。<br/>
              3. 汇率采用用户手动输入的 <strong>7.20 USD/RMB</strong> 进行严格转换。
            </p>
          </div>
        </section>

        {/* 3. 三、店铺核心经营指标 */}
        <section id="ch3" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">三、店铺核心经营指标</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">FINANCIAL MATRIX</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-2.5 px-3">指标名称</th>
                  <th className="py-2.5 px-3 text-right">本月数值</th>
                  <th className="py-2.5 px-3 text-right">上月数值</th>
                  <th className="py-2.5 px-3 text-right">环比变动 (MoM)</th>
                  <th className="py-2.5 px-3 text-center">状态诊断</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">ERP 实际销售额 (USD)</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{formatUsd(fin.salesRevenue)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? formatUsd(result.lastMonthFinancials.salesRevenue) : '-'}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">{mom ? `+${mom.salesGrowthPct}%` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">稳步扩张</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">经营贡献利润 (USD)</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">{formatUsd(fin.operatingProfit)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? formatUsd(result.lastMonthFinancials.operatingProfit) : '-'}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600">{mom ? `+${mom.profitGrowthPct}%` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">良性增长</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">经营贡献利润率 (%)</td>
                  <td className="py-2 px-3 text-right font-bold text-[#0071dc]">{fin.operatingProfitMargin}%</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? `${result.lastMonthFinancials.operatingProfitMargin}%` : '-'}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{mom ? `${mom.profitMarginDiffPts >= 0 ? '+' : ''}${mom.profitMarginDiffPts} pts` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#0071dc] text-[10px] font-bold border border-blue-200">健康区间</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Walmart 广告总支出 (USD)</td>
                  <td className="py-2 px-3 text-right text-slate-900">{formatUsd(fin.adSpend)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? formatUsd(result.lastMonthFinancials.adSpend) : '-'}</td>
                  <td className="py-2 px-3 text-right font-bold text-rose-600">{mom ? `+${mom.adSpendGrowthPct}%` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">增长偏快</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">广告总 ROAS</td>
                  <td className="py-2 px-3 text-right font-bold text-purple-700">{fin.roas}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? result.lastMonthFinancials.roas : '-'}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? (fin.roas - result.lastMonthFinancials.roas).toFixed(2) : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">产出稳健</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">有效退货率 / 退款额</td>
                  <td className="py-2 px-3 text-right text-slate-900">{fin.returnRatePct}% ({formatUsd(fin.returnAmount)})</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? `${result.lastMonthFinancials.returnRatePct}%` : '-'}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{mom ? `+${mom.returnGrowthPct}%` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">品类异常</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">Walmart 仓储总费 (USD)</td>
                  <td className="py-2 px-3 text-right text-rose-600 font-bold">{formatUsd(fin.totalStorageFee)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{result.lastMonthFinancials ? formatUsd(result.lastMonthFinancials.totalStorageFee) : '-'}</td>
                  <td className="py-2 px-3 text-right text-rose-600">{mom ? `+${mom.storageGrowthPct}%` : '-'}</td>
                  <td className="py-2 px-3 text-center"><span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">罚金过重</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 四、销售分析 */}
        <section id="ch4" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">四、销售分析与品类结构</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">SALES HIERARCHY</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-mono">
            本月出货共计 <strong>{fin.salesUnits} 件</strong>，产生有效订单 <strong>{fin.orderCount} 笔</strong>，平均客单价(AOV)为 <strong>{formatUsd(fin.averageOrderValue)}</strong>。
            销售结构呈现明显的品类集中度特征：
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            {result.productTypeMetrics.map((type, idx) => (
              <div key={idx} className="p-3.5 rounded border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 font-sans">{type.productType}</span>
                <div className="mt-1.5 text-base font-bold text-[#0071dc]">{formatUsd(type.salesAmount)}</div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>占比: {type.salesSharePct}%</span>
                  <span>在库: {type.inventory}件</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
            <strong className="text-slate-900">【销售集中度风险诊断】:</strong>
            <p className="text-[11px] leading-relaxed">
              Top 3 SKU（双电机升降桌、黑色工学椅、转角电竞桌）销售额合计达 <strong>{formatUsd((result.skuMetrics[0]?.salesAmount || 0) + (result.skuMetrics[1]?.salesAmount || 0) + (result.skuMetrics[2]?.salesAmount || 0))}</strong>，占全店销售总额的 <strong>55.4%</strong>。
              属于典型的头部拉动型店铺模型。核心优势在于打造了具有强防御力的标杆单品，但潜在风险是一旦核心SKU遭遇供应链断货或合规下架，店铺抵抗突发波动的容错率较低。
            </p>
          </div>
        </section>

        {/* 5. 五、广告分析 */}
        <section id="ch5" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">五、广告分析与效能审计</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">ADVERTISING PERFORMANCE</span>
          </div>

          <div className="p-3.5 rounded border border-purple-200 bg-purple-50/60 text-xs text-purple-900 leading-relaxed font-mono">
            全月广告花费 <strong>{formatUsd(fin.adSpend)}</strong>，产出广告归因销售额 <strong>{formatUsd(fin.adSales)}</strong>，综合广告 ROAS 为 <strong>{fin.roas}</strong> (ACOS 为 {(fin.acos * 100).toFixed(1)}%)，广告费占全店销售额比例为 <strong>{fin.adSpendToSalesPct}%</strong>。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded border border-emerald-200 bg-emerald-50/50">
              <span className="font-bold text-emerald-900 block mb-1.5 uppercase text-[11px]">⭐ 高效标杆 SKU (ROAS &gt; 5.0)</span>
              <ul className="space-y-1 text-emerald-800 text-[11px]">
                <li>• <strong>SKU-DESK-MOTO</strong>: ROAS 8.23，投入$2,800产出$23,039</li>
                <li>• <strong>SKU-CHAIR-BLK</strong>: ROAS 6.22，自然+广告飞轮运转顺畅</li>
                <li>• <strong>SKU-ARM-SNGL</strong>: ROAS 5.48，低预算高回报长尾品</li>
              </ul>
            </div>
            <div className="p-3.5 rounded border border-rose-200 bg-rose-50/50">
              <span className="font-bold text-rose-900 block mb-1.5 uppercase text-[11px]">⚠️ 低效侵蚀毛利 SKU</span>
              <ul className="space-y-1 text-rose-800 text-[11px]">
                <li>• <strong>SKU-CHAIR-GRY</strong>: 花费$6,850全店最高，ROAS仅2.57</li>
                <li>• <strong>SKU-ACC-FOOT</strong>: 新品投放ROAS仅1.58，Listing未成熟</li>
                <li>• <strong>SKU-ARM-TRPL</strong>: 转化率持续走低，ROAS 2.04</li>
              </ul>
            </div>
            <div className="p-3.5 rounded border border-blue-200 bg-blue-50/50">
              <span className="font-bold text-blue-900 block mb-1.5 uppercase text-[11px]">🚀 具备加投潜力的明星品</span>
              <ul className="space-y-1 text-blue-800 text-[11px]">
                <li>• <strong>SKU-DESK-MOTO</strong>: 建议增投50%广告抢占品类Top3</li>
                <li>• <strong>SKU-ACC-MOUSE</strong>: 高毛利小件，建议拓展精准长尾词</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. 六、SKU/SPU盈利分析 */}
        <section id="ch6" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">六、SKU / SPU 盈利全景分析</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">PROFIT ATTRIBUTION</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-2 px-2.5">SKU 编码</th>
                  <th className="py-2 px-2 text-right">销售额</th>
                  <th className="py-2 px-2 text-right">产品成本</th>
                  <th className="py-2 px-2 text-right">头程成本</th>
                  <th className="py-2 px-2 text-right">广告花费</th>
                  <th className="py-2 px-2 text-right">仓储费用</th>
                  <th className="py-2 px-2 text-right">经营贡献利润</th>
                  <th className="py-2 px-2 text-right">贡献利润率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {result.skuMetrics.map((s) => (
                  <tr key={s.sku} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2.5 font-bold text-slate-900">
                      {s.sku}
                      <span className="block text-[10px] font-normal text-slate-500 font-sans">{s.productName}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-medium text-slate-900">{formatUsd(s.salesAmount)}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{formatUsd(s.productCostUsd)}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{formatUsd(s.headFreightUsd)}</td>
                    <td className="py-2 px-2 text-right text-slate-600">{formatUsd(s.adSpend)}</td>
                    <td className="py-2 px-2 text-right text-slate-600">
                      {formatUsd(s.storageFeeUsd)}
                      {s.highAgingStorageFeeUsd > 100 && (
                        <span className="block text-[10px] text-rose-600 font-bold">罚金${s.highAgingStorageFeeUsd.toFixed(0)}</span>
                      )}
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${s.operatingProfitUsd >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatUsd(s.operatingProfitUsd)}
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${s.operatingProfitMargin >= 25 ? 'text-emerald-600' : (s.operatingProfitMargin < 10 ? 'text-rose-600' : 'text-slate-800')}`}>
                      {s.operatingProfitMargin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. 七、退货分析 */}
        <section id="ch7" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">七、退货深度分析与责任归因</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">RETURN &amp; KEEP-IT DIAGNOSTICS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">有效退货总量</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{fin.returnUnits} 件 ({fin.returnRatePct}%)</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">退款总金额</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{formatUsd(fin.returnAmount)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Keep-It 免退货退款</span>
              <span className="text-sm font-bold text-amber-700 mt-0.5 block">{fin.keepItUnits} 件 (净损 {formatUsd(fin.keepItLossUsd)})</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">卖家责任占比</span>
              <span className="text-sm font-bold text-rose-600 mt-0.5 block">{fin.sellerResponsibleRatePct}%</span>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded text-xs text-rose-900 leading-relaxed font-mono">
            <strong>【核心退货异常预警】:</strong>
            <p className="mt-1 text-[11px]">
              重型双联显示器支架 (<strong>SKU-ARM-DUAL</strong>) 退货率异常飙升至 <strong>11.25%</strong> (退货 18 件，退款金额 $1,439.82)，且经核验 <strong>100% 为卖家责任</strong>！退货原因全部集中于【缺少五金安装螺丝】与【说明书排版错误导致无法组装】。
              该问题纯属工厂产线装配漏检，并非设计不可逆问题，必须严查国内供应商包装防呆称重，立刻提供在线视频说明书止血！
            </p>
          </div>
        </section>

        {/* 8. 八、库存与库龄分析 */}
        <section id="ch8" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">八、库存健康与库龄阶梯分布</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">INVENTORY &amp; AGING</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono">
            全店当前在库库存总量为 <strong>{result.skuMetrics.reduce((sum, s) => sum + s.totalInventory, 0)} 件</strong>。
            库龄结构分布如下：
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-center">
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">0-30天健康</span>
                <span className="text-xs font-bold text-emerald-900">1,508 件</span>
              </div>
              <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-[10px] text-emerald-700 block">31-90天正常</span>
                <span className="text-xs font-bold text-emerald-900">670 件</span>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <span className="text-[10px] text-amber-700 block">91-180天预警</span>
                <span className="text-xs font-bold text-amber-900">260 件</span>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <span className="text-[10px] text-amber-700 block">181-270天滞销</span>
                <span className="text-xs font-bold text-amber-900">140 件</span>
              </div>
              <div className="p-2 bg-rose-50 rounded border border-rose-200">
                <span className="text-[10px] text-rose-700 block">271-365天高危</span>
                <span className="text-xs font-bold text-rose-900">105 件</span>
              </div>
              <div className="p-2 bg-rose-100 rounded border border-rose-300">
                <span className="text-[10px] text-rose-800 font-bold block">365天+惩罚期</span>
                <span className="text-xs font-bold text-rose-900">235 件</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. 九、仓储费用分析 */}
        <section id="ch9" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">九、仓储费用拆解与惩罚性费用溯源</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">STORAGE SURCHARGES</span>
          </div>

          <div className="p-4 rounded border border-rose-200 bg-rose-50/60 text-xs text-rose-950 space-y-2 font-mono">
            <div className="flex items-center space-x-2 text-rose-800 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>超期惩罚性仓储费占比高达 {fin.highAgingStorageFeePct}%！</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              当月全店总仓储费 <strong>{formatUsd(fin.totalStorageFee)}</strong> 中，常规正常仓储费仅为 <strong>{formatUsd(fin.normalStorageFee)}</strong> (占 {result.agingStorageLinkage.normalStoragePct}%)；
              而 365-450天仓储费 <strong>{formatUsd(fin.storageFee365_450)}</strong> + 450天以上仓储费 <strong>{formatUsd(fin.storageFee450Plus)}</strong> 合计高达 <strong>{formatUsd(fin.storageFee365_450 + fin.storageFee450Plus)}</strong>！
            </p>
            <p className="leading-relaxed font-semibold text-[11px]">
              主要产生源头：纯白轻奢办公椅 (<strong>SKU-CHAIR-WHT</strong>) 单一SKU贡献了 $1,650 的超期附加费（占全店超期罚金的 93%）。若不立即在下一计费周期间隔前执行批量退运(Removal)或深度清仓，每月该单品将持续吞噬逾千美元纯现金净利！
            </p>
          </div>
        </section>

        {/* 10. 十、全链路五维联动分析 */}
        <section id="ch10" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十、全链路五维联动核心诊断</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">5-WAY CROSS LINKAGE</span>
          </div>

          <div className="p-4 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-3 font-mono">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">必须回答的10大经营联动核心问题:</h4>
            
            <div className="space-y-2">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">1. 哪些产品销售增长但利润下降？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-CHAIR-GRY</strong> (浅灰工学椅)。销售额增长至$32,398，但广告花费激增至$6,850侵蚀毛利，经营利润率由31%滑落至18.2%。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">2. 哪些产品广告投入过高？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-CHAIR-GRY</strong> (广告占比21.1%) 与 <strong>SKU-ACC-FOOT</strong> (冷启动ROI仅1.58，广告占比近30%)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">3. 哪些产品ROAS高但利润低？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-ACC-MAT</strong>。ROAS达4.84表面亮眼，但因退货中Keep-It高达12件直接计入货值净损失，净利率被削薄。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">4. 哪些产品库存过高？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-DESK-MANU</strong> (手摇升降桌，库存280件，周转天数280天) 与 <strong>SKU-CHAIR-WHT</strong> (纯白电脑椅，在库320件)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">5. 哪些产品库龄过高？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-CHAIR-WHT</strong> (超365天库龄210件) 及 <strong>SKU-ARM-TRPL</strong> (超365天库龄25件)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">6. 哪些产品退货过高？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-ARM-DUAL</strong>。退货率高达11.25%且100%为卖家责任(漏装螺丝/说明书错误)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">7. 哪些产品广告投入与库存不匹配？</span>
                <p className="text-rose-600 font-bold mt-0.5 text-[11px]">答: <strong>SKU-DESK-CORNER</strong>！月投广告$5,400，但现货仅剩18件(6天周转)，面临极其危险的断货与广告空烧脱节冲突！</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">8. 哪些产品值得增加广告？</span>
                <p className="text-emerald-600 font-bold mt-0.5 text-[11px]">答: <strong>SKU-DESK-MOTO</strong> (ROAS 8.23，利润率38.9%，极强护城河) 与 <strong>SKU-ACC-MOUSE</strong> (轻小件毛利62%)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">9. 哪些产品值得减少广告？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-CHAIR-GRY</strong> (降预算30%剔除泛词) 与 <strong>SKU-DESK-CORNER</strong> (降预算60%减速等待海运抵港)。</p>
              </div>

              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="font-bold text-slate-900">10. 哪些产品应该清库存？</span>
                <p className="text-slate-600 mt-0.5 text-[11px]">答: <strong>SKU-CHAIR-WHT</strong> (4.5折清仓+批量Removal退仓) 与 <strong>SKU-DESK-MANU</strong> (打包B2B促销)。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. 十一、TOP 10 经营问题 */}
        <section id="ch11" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十一、TOP 10 经营问题诊断清单</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">PROBLEMS &amp; ROOT CAUSES</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {result.top10Problems.map((p, idx) => (
              <div key={p.id} className="p-3.5 rounded border border-slate-200 bg-white hover:border-[#0071dc] transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${p.priority === 'P0' ? 'bg-rose-100 text-rose-800 border-rose-200' : (p.priority === 'P1' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-slate-100 text-slate-800 border-slate-200')}`}>
                      {p.priority}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs font-sans">
                      {idx + 1}. {p.problem}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400">SKU: {p.affectedSkus.join(', ')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div><strong>数据依据:</strong> {p.dataEvidence}</div>
                  <div><strong>业务影响:</strong> {p.impact}</div>
                  <div><strong>根本原因:</strong> {p.rootCause}</div>
                  <div className="text-[#0071dc] font-bold"><strong>解决方案:</strong> {p.solution}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 12. 十二、TOP 10 经营机会 */}
        <section id="ch12" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十二、TOP 10 经营机会挖掘</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">GROWTH OPPORTUNITIES</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {result.top10Opportunities.map((op, idx) => (
              <div key={op.id} className="p-3.5 rounded border border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {op.priority} 机会
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs font-sans">
                      {idx + 1}. {op.opportunity}
                    </h4>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold">{op.target}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div><strong>数据依据:</strong> {op.dataEvidence}</div>
                  <div><strong>机会归因:</strong> {op.opportunityReason}</div>
                  <div className="text-emerald-700 font-bold"><strong>建议动作:</strong> {op.suggestedAction}</div>
                  <div className="text-[#0071dc] font-bold"><strong>预期价值:</strong> {op.expectedImpact}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 13. 十三、下个月广告策略 */}
        <section id="ch13" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十三、下个月广告策略</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">AD ALLOCATION STRATEGY</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded border border-emerald-200 bg-emerald-50/50">
              <span className="font-bold text-emerald-900 block mb-2 uppercase text-[11px]">▲ 增加预算 (Increase Budget)</span>
              {result.nextMonthStrategy.adBudgetAction.increase.map((item, i) => (
                <div key={i} className="mb-1 text-[11px]">
                  <strong className="text-emerald-800">{item.sku}:</strong> {item.reason}
                </div>
              ))}
            </div>

            <div className="p-3 rounded border border-blue-200 bg-blue-50/50">
              <span className="font-bold text-blue-900 block mb-2 uppercase text-[11px]">■ 维持预算 (Maintain Budget)</span>
              {result.nextMonthStrategy.adBudgetAction.maintain.map((item, i) => (
                <div key={i} className="mb-1 text-[11px]">
                  <strong className="text-blue-800">{item.sku}:</strong> {item.reason}
                </div>
              ))}
            </div>

            <div className="p-3 rounded border border-amber-200 bg-amber-50/50">
              <span className="font-bold text-amber-900 block mb-2 uppercase text-[11px]">▼ 降低预算 (Decrease Budget)</span>
              {result.nextMonthStrategy.adBudgetAction.decrease.map((item, i) => (
                <div key={i} className="mb-1 text-[11px]">
                  <strong className="text-amber-800">{item.sku}:</strong> {item.reason}
                </div>
              ))}
            </div>

            <div className="p-3 rounded border border-rose-200 bg-rose-50/50">
              <span className="font-bold text-rose-900 block mb-2 uppercase text-[11px]">✕ 暂停广告 (Pause Ads)</span>
              {result.nextMonthStrategy.adBudgetAction.pause.map((item, i) => (
                <div key={i} className="mb-1 text-[11px]">
                  <strong className="text-rose-800">{item.sku}:</strong> {item.reason}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14. 十四、下个月库存策略 */}
        <section id="ch14" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十四、下个月库存供应链策略</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">INVENTORY ACTION PLAN</span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border border-slate-200 rounded overflow-hidden">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 font-mono">
                <tr>
                  <th className="py-2 px-3">管控分类</th>
                  <th className="py-2 px-3">对应 SKU</th>
                  <th className="py-2 px-3 text-right">当前库存</th>
                  <th className="py-2 px-3 text-right">可用周转天数</th>
                  <th className="py-2 px-3">行动建议与原由</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {result.nextMonthStrategy.inventoryAction.urgentRestock.map((u, i) => (
                  <tr key={i} className="bg-rose-50/50">
                    <td className="py-2 px-3 font-bold text-rose-700">🚨 紧急补货</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{u.sku}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">{u.currentStock} 件</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600">{u.daysOfSupply} 天</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{u.reason}</td>
                  </tr>
                ))}
                {result.nextMonthStrategy.inventoryAction.normalRestock.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-bold text-[#0071dc]">📦 正常补货</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{u.sku}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{u.currentStock} 件</td>
                    <td className="py-2 px-3 text-right text-slate-800">{u.daysOfSupply} 天</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{u.reason}</td>
                  </tr>
                ))}
                {result.nextMonthStrategy.inventoryAction.clearance.map((u, i) => (
                  <tr key={i} className="bg-amber-50/50">
                    <td className="py-2 px-3 font-bold text-amber-800">🔥 重点清库存</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{u.sku}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{u.currentStock} 件</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">超365天 {u.aging365Plus} 件</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{u.reason}</td>
                  </tr>
                ))}
                {result.nextMonthStrategy.inventoryAction.stopRestock.map((u, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-bold text-slate-500">🛑 停止补货</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{u.sku}</td>
                    <td className="py-2 px-3 text-right text-slate-800">{u.currentStock} 件</td>
                    <td className="py-2 px-3 text-right text-slate-800">{u.daysOfSupply} 天</td>
                    <td className="py-2 px-3 text-slate-600 font-sans">{u.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 15. 十五、下个月产品策略 */}
        <section id="ch15" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十五、下个月产品线梯队策略</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">PRODUCT PORTFOLIO</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
            <div className="p-3 bg-blue-50/70 rounded border border-blue-200">
              <span className="font-bold text-blue-900 block mb-1 uppercase text-[10px]">⭐ 核心产品</span>
              <p className="text-blue-800 text-[11px]">{result.nextMonthStrategy.productAction.core.join(', ')}</p>
            </div>
            <div className="p-3 bg-emerald-50/70 rounded border border-emerald-200">
              <span className="font-bold text-emerald-900 block mb-1 uppercase text-[10px]">🚀 潜力产品</span>
              <p className="text-emerald-800 text-[11px]">{result.nextMonthStrategy.productAction.potential.join(', ')}</p>
            </div>
            <div className="p-3 bg-purple-50/70 rounded border border-purple-200">
              <span className="font-bold text-purple-900 block mb-1 uppercase text-[10px]">⚙️ 重点优化品</span>
              <p className="text-purple-800 text-[11px]">{result.nextMonthStrategy.productAction.optimize.join(', ')}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1 uppercase text-[10px]">📉 低效长尾品</span>
              <p className="text-slate-600 text-[11px]">{result.nextMonthStrategy.productAction.inefficient.join(', ')}</p>
            </div>
            <div className="p-3 bg-rose-50/70 rounded border border-rose-200">
              <span className="font-bold text-rose-900 block mb-1 uppercase text-[10px]">🔥 清库存品</span>
              <p className="text-rose-800 text-[11px]">{result.nextMonthStrategy.productAction.clearance.join(', ')}</p>
            </div>
            <div className="p-3 bg-amber-50/70 rounded border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1 uppercase text-[10px]">🌱 孵化新品</span>
              <p className="text-amber-800 text-[11px]">{result.nextMonthStrategy.productAction.newProducts.join(', ')}</p>
            </div>
          </div>
        </section>

        {/* 16. 十六、下个月经营目标 */}
        <section id="ch16" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-sm font-bold text-slate-900 font-mono uppercase">十六、下个月经营目标预算制定</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0071dc] border border-blue-200">FINANCIAL TARGET SETTING</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase">目标销售额 (+12%)</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">{formatUsd(result.nextMonthStrategy.targets.targetSales)}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase">目标经营利润 (+20%)</span>
              <span className="text-base font-bold text-emerald-600 mt-1 block">{formatUsd(result.nextMonthStrategy.targets.targetProfit)}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase">广告预算上限 (-5%)</span>
              <span className="text-base font-bold text-purple-700 mt-1 block">{formatUsd(result.nextMonthStrategy.targets.targetAdBudget)}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-400 text-[10px] block uppercase">仓储压降目标 (-55%)</span>
              <span className="text-base font-bold text-[#0071dc] mt-1 block">{formatUsd(result.nextMonthStrategy.targets.targetStorageFee)}</span>
            </div>
          </div>
        </section>

        {/* 17. 十七、最终管理层结论 */}
        <section id="ch17" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b-2 border-[#0071dc] pb-2">
            <span className="text-base font-bold text-slate-900 font-mono uppercase">十七、最终管理层决策纲领 (店长必做Top 5件事)</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0071dc] text-white">TOP 5 ACTION PRIORITIES</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {result.executiveTop5Priorities.map((item) => (
              <div key={item.priorityRank} className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="w-5 h-5 rounded bg-[#0071dc] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {item.priorityRank}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs font-sans">{item.what}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600 pl-7 text-[11px]">
                  <div><strong>【为什么做】:</strong> {item.why}</div>
                  <div><strong>【针对对象】:</strong> <span className="font-semibold text-slate-900">{item.targetSkusOrSpus}</span></div>
                  <div><strong>【数据依据】:</strong> {item.dataEvidence}</div>
                  <div className="text-[#0071dc] font-bold"><strong>【预期成效】:</strong> {item.expectedResolution}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
