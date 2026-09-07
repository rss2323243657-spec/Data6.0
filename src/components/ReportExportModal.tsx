import React, { useState } from 'react';
import {
  X,
  Copy,
  Download,
  Printer,
  Check,
  FileText
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fin = result.coreFinancials;
  const mom = result.momComparison;
  const dq = result.dataQuality;

  const generateMarkdown = () => {
    let md = `# Walmart 店铺月度经营分析与利润诊断报告 (${result.month})\n\n`;
    md += `> 生成时间: ${new Date().toLocaleDateString('zh-CN')} | 分析口径: 资深运营财务联动系统\n\n`;

    md += `## 一、管理层经营摘要\n\n`;
    result.executiveSummaryText.forEach((p, idx) => {
      md += `${idx + 1}. ${p}\n\n`;
    });

    md += `## 二、数据质量与数据口径\n\n`;
    md += `- 数据可信度评级: ${dq.dataCredibility}\n`;
    md += `- 清洗剔除取消订单: ${dq.cancelledOrdersExcludedCount} 单 (严格不计入销售额)\n`;
    md += `- 清洗剔除取消退货: ${dq.cancelledReturnsExcludedCount} 单 (排除退款损失)\n\n`;

    md += `## 三、店铺核心经营指标\n\n`;
    md += `| 核心指标 | 本月数值 | 环比变化 |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| ERP 实际销售额 | $${fin.salesRevenue.toLocaleString()} | ${mom ? (mom.salesGrowthPct >= 0 ? '+' : '') + mom.salesGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 经营贡献利润 | $${fin.operatingProfit.toLocaleString()} | ${mom ? (mom.profitGrowthPct >= 0 ? '+' : '') + mom.profitGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 经营贡献利润率 | ${fin.operatingProfitMargin}% | ${mom ? (mom.profitMarginDiffPts >= 0 ? '+' : '') + mom.profitMarginDiffPts + ' pts' : 'N/A'} |\n`;
    md += `| Walmart 广告支出 | $${fin.adSpend.toLocaleString()} | ${mom ? (mom.adSpendGrowthPct >= 0 ? '+' : '') + mom.adSpendGrowthPct + '%' : 'N/A'} |\n`;
    md += `| 广告 ROAS | ${fin.roas} | 归因销售 $${fin.adSales.toLocaleString()} |\n`;
    md += `| 有效退货率 | ${fin.returnRatePct}% | 退款 $${fin.returnAmount.toLocaleString()} |\n`;
    md += `| 仓储总费用 | $${fin.totalStorageFee.toLocaleString()} | 超期罚金占比 ${fin.highAgingStorageFeePct}% |\n\n`;

    md += `## 十一、TOP 10 经营问题\n\n`;
    result.top10Problems.forEach((p, idx) => {
      md += `### ${idx + 1}. [${p.priority}] ${p.problem}\n`;
      md += `- **数据依据**: ${p.dataEvidence}\n`;
      md += `- **业务影响**: ${p.impact}\n`;
      md += `- **根本原因**: ${p.rootCause}\n`;
      md += `- **应对方案**: ${p.solution}\n\n`;
    });

    md += `## 十七、店长下月必做 Top 5 优先级纲领\n\n`;
    result.executiveTop5Priorities.forEach(p => {
      md += `### 优先级 ${p.priorityRank}: ${p.what}\n`;
      md += `- **为什么做**: ${p.why}\n`;
      md += `- **针对对象**: ${p.targetSkusOrSpus}\n`;
      md += `- **数据依据**: ${p.dataEvidence}\n`;
      md += `- **预期成效**: ${p.expectedResolution}\n\n`;
    });

    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Walmart_Monthly_Diagnosis_Report_${result.month}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 font-sans text-xs">
      <div className="bg-white rounded border border-slate-300 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#0071dc]" />
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-tight">
              导出经营分析与利润诊断报告 (EXPORT DIAGNOSIS REPORT)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Preview */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
            <span>报告包含完整的 17 章节，覆盖全店 KPI、五大跨模块联动、TOP10问题及下月策略。</span>
            <span className="font-bold text-[#0071dc]">MARKDOWN PREVIEW</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded border border-slate-800 font-mono text-slate-200 text-[11px] overflow-x-auto max-h-96 leading-relaxed whitespace-pre-wrap selection:bg-[#0071dc]/50">
            {generateMarkdown()}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-mono">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            浏览器原生打印 / PDF
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />}
              {copied ? '已复制' : '复制 Markdown'}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-bold text-white bg-[#0071dc] hover:bg-[#005bb5] transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              下载 .md 文件
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
