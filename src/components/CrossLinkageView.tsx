import React from 'react';
import {
  TrendingUp,
  RotateCcw,
  Warehouse,
  Flame,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Info,
  AlertTriangle
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { CollapsibleTableWrapper } from './CollapsibleTableWrapper';

interface CrossLinkageViewProps {
  result: AnalysisResult;
}

export const CrossLinkageView: React.FC<CrossLinkageViewProps> = ({ result }) => {
  const formatUsd = (n: number) =>
    `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const {
    salesAdProfitLinkage = { caseType: '平衡型', description: '数据校验平稳' },
    salesReturnLinkage = { description: '全店退货处于正常波动区间', highReturnSkus: [] },
    inventorySalesLinkage = { description: '库存与出货节拍正常', stockoutRisks: [], overstockRisks: [] },
    inventoryAdLinkage = { description: '广告与库存节奏匹配', mismatchCases: [] },
    agingStorageLinkage = {
      description: '无超期惩罚性仓储费异常',
      highAgingStoragePct: 0,
      normalStoragePct: 100,
      storageFee365_450Pct: 0,
      storageFee450PlusPct: 0,
      riskSkus: []
    }
  } = result || {};

  const highReturnSkus = salesReturnLinkage?.highReturnSkus || [];
  const stockoutRisks = inventorySalesLinkage?.stockoutRisks || [];
  const overstockRisks = inventorySalesLinkage?.overstockRisks || [];
  const mismatchCases = inventoryAdLinkage?.mismatchCases || [];
  const riskSkus = agingStorageLinkage?.riskSkus || [];

  return (
    <div className="space-y-5 pb-12">
      {/* Technical Header Banner */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0071dc] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Info className="w-3.5 h-3.5" />
            <span>Walmart Marketplace · 5-Dimensional Diagnostic Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 tracking-tight">
            五大跨模块联动诊断：透视单品隐匿冲突与资金损耗
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            打通销售、广告投放、在库周转、库龄梯队与退货订单的深层因果关系，自动揪出经营中的“隐性出血点”。
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-right font-mono">
            <span className="block text-[10px] text-slate-400 uppercase">Linkage Health</span>
            <span className="text-xs font-bold text-emerald-600">5/5 SYNCED</span>
          </div>
        </div>
      </div>

      {/* 5 Linkage Cards */}
      <div className="space-y-4">
        {/* Linkage 1: 销售 × 广告 × 利润 */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-[#0071dc] rounded border border-blue-200">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  联动一：销售 × 广告 × 利润联动分析
                </h3>
                <p className="text-[11px] text-slate-500">
                  判断广告预算是真正驱动经营利润增长，还是造成“虚假繁荣侵蚀毛利”
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              CASE: {salesAdProfitLinkage.caseType}
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700 font-mono">
            <strong className="text-slate-900">【核心诊断结论】:</strong> {salesAdProfitLinkage.description}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
            <div className="p-3.5 rounded-lg bg-rose-50/70 border border-rose-200">
              <span className="font-bold font-mono text-rose-900 flex items-center mb-1 text-xs">
                <Flame className="w-3.5 h-3.5 mr-1 text-rose-600" />
                虚假繁荣典型风险警示
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed font-mono">
                部分高投SKU广告归因销售额虽高，但ROAS低于保本平衡线，扣除采购、头程与仓储费用后，利润已被高额广告费吞噬！必须立即核减低效关键字预算。
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <span className="font-bold font-mono text-emerald-900 flex items-center mb-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                健康飞轮与高效放量标杆
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed font-mono">
                明星SKU表现优异，ROAS稳定维持在健康线以上，广告销售比良性，自然流占比健康，建议保持核心词展示位并适度拓词。
              </p>
            </div>
          </div>
        </div>

        {/* Linkage 2: 销售 × 退货 */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  联动二：销售 × 退货联动分析
                </h3>
                <p className="text-[11px] text-slate-500">
                  排查高销背后的隐蔽退款黑洞、Keep-It免退货货值净损失及卖家责任事故
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              全店退货率: <strong className="text-slate-900">{result.coreFinancials?.returnRatePct || 0}%</strong> | 卖家责任: <strong className="text-rose-600">{result.coreFinancials?.sellerResponsibleRatePct || 0}%</strong>
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700 font-mono">
            <strong className="text-slate-900">【核心诊断结论】:</strong> {salesReturnLinkage.description}
          </div>

          {highReturnSkus.length > 0 ? (
            <CollapsibleTableWrapper totalCount={highReturnSkus.length} maxCollapsedHeight="max-h-[360px]">
              <div className="mt-3 overflow-x-auto text-xs">
                <table className="w-full text-left border border-slate-200 rounded">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 font-mono">
                    <tr>
                      <th className="py-2 px-3">异常 SKU</th>
                      <th className="py-2 px-3 text-right">出货量</th>
                      <th className="py-2 px-3 text-right">退货量</th>
                      <th className="py-2 px-3 text-right">退货率</th>
                      <th className="py-2 px-3 text-right">退款金额</th>
                      <th className="py-2 px-3">主要原因与责任</th>
                      <th className="py-2 px-3">紧急运营对策</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {highReturnSkus.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-bold text-slate-900">{r.sku}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{r.salesQty}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">{r.returnUnits}</td>
                        <td className="py-2 px-3 text-right font-bold text-rose-600">{r.returnRatePct}%</td>
                        <td className="py-2 px-3 text-right text-slate-900">{formatUsd(r.returnAmount)}</td>
                        <td className="py-2 px-3 text-slate-700 font-sans text-xs">{r.reason}</td>
                        <td className="py-2 px-3 text-[#0071dc] font-sans text-xs font-medium">完善组装图纸并核查配件包</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleTableWrapper>
          ) : (
            <div className="mt-3 p-4 rounded bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              未检测到退货率异常 (&gt;6%) 的高危单品，退货管控状态良好。
            </div>
          )}
        </div>

        {/* Linkage 3: 库存 × 销售 (断货 vs 积压) */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  联动三：库存 × 销售联动分析 (周转 DOS 与供需平衡)
                </h3>
                <p className="text-[11px] text-slate-500">
                  全方位排查 “断货停摆” 与 “滞销积压” 两极分化风险
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              全店平均周转天数: <strong className="text-slate-900">{result.coreFinancials?.averageDaysOfSupply || 0} 天</strong>
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700 font-mono">
            <strong className="text-slate-900">【核心诊断结论】:</strong> {inventorySalesLinkage.description}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
            {/* 断货高危 */}
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs font-mono text-rose-900 flex items-center">
                  <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  断货高危警戒名单 (DOS &lt; 15 天)
                </span>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                  {stockoutRisks.length} 个 SKU
                </span>
              </div>
              {stockoutRisks.length > 0 ? (
                <div className="space-y-1.5 text-xs font-mono">
                  {stockoutRisks.map((s, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{s.sku}</span>
                        <span className="text-slate-400 text-[10px] ml-2">日均销: {s.dailyVelocity} 件</span>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-600 font-bold">可售 {s.stock} 件</span>
                        <span className="text-slate-400 text-[10px] block">剩余 {s.dos} 天</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">暂无面临紧急断货断档的 SKU。</p>
              )}
            </div>

            {/* 严重积压 */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs font-mono text-amber-900 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  严重积压滞销名单 (DOS &gt; 120 天)
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                  {overstockRisks.length} 个 SKU
                </span>
              </div>
              {overstockRisks.length > 0 ? (
                <div className="space-y-1.5 text-xs font-mono">
                  {overstockRisks.map((s, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{s.sku}</span>
                        <span className="text-slate-400 text-[10px] ml-2">库存: {s.stock} 件</span>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-700 font-bold">周转 {s.dos} 天</span>
                        <span className="text-slate-400 text-[10px] block">超期压仓风险</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">暂无周转超过120天的严重积压 SKU。</p>
              )}
            </div>
          </div>
        </div>

        {/* Linkage 4: 库存 × 广告 */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-rose-50 text-rose-700 rounded border border-rose-200">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  联动四：库存 × 广告错配诊断
                </h3>
                <p className="text-[11px] text-slate-500">
                  严防两类严重运营事故：低库存持续猛砸广告(断货前夕) vs 积压死库完全零广告
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-bold">
              严重错配风险: {mismatchCases.length} 个
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded border border-rose-200 bg-rose-50/60 text-xs leading-relaxed text-rose-950 font-mono">
            <strong>【运营排查结论】:</strong> {inventoryAdLinkage.description}
          </div>

          {mismatchCases.length > 0 ? (
            <CollapsibleTableWrapper totalCount={mismatchCases.length} maxCollapsedHeight="max-h-[360px]">
              <div className="mt-3 space-y-2 text-xs">
                {mismatchCases.map((m, idx) => (
                  <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {m.mismatchType}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{m.sku}</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-1">
                        在库库存: <strong>{m.stock}件</strong> | 当月广告花费: <strong>{formatUsd(m.adSpend)}</strong>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#0071dc] shrink-0 font-sans">
                      处置: {m.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleTableWrapper>
          ) : (
            <div className="mt-3 p-4 rounded bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              未检测到广告投放与在库量出现矛盾错配情况。
            </div>
          )}
        </div>

        {/* Linkage 5: 库龄 × 仓储 */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-50 text-purple-700 rounded border border-purple-200">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                  联动五：库龄 × 仓储费用透视
                </h3>
                <p className="text-[11px] text-slate-500">
                  锁定 365-450天 与 450天+ 惩罚性附加费的元凶单品，防止利润失血
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 font-bold">
              高库龄附加费占比: {agingStorageLinkage.highAgingStoragePct || 0}%
            </span>
          </div>

          <div className="mt-3.5 p-3 rounded border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700 font-mono">
            <strong className="text-slate-900">【核心诊断结论】:</strong> {agingStorageLinkage.description}
          </div>

          {riskSkus.length > 0 ? (
            <CollapsibleTableWrapper totalCount={riskSkus.length} maxCollapsedHeight="max-h-[360px]">
              <div className="mt-3 space-y-2 text-xs">
                {riskSkus.map((r, idx) => (
                  <div key={idx} className="p-3 rounded border border-rose-200 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{r.sku}</span>
                        <span className="text-[10px] text-slate-500">超365天滞销件数: {r.aging365PlusQty} 件</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-1">
                        产生惩罚性仓储费: <strong className="text-rose-700">{formatUsd(r.highAgingStorageFee)}</strong>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-rose-800 shrink-0 font-sans">
                      建议执行: {r.action}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleTableWrapper>
          ) : (
            <div className="mt-3 p-4 rounded bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              未检测到发生 365天+ 超期惩罚性附加费的死库 SKU。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
