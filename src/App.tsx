/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FormalMonthlyReport } from './components/FormalMonthlyReport';
import { SkuProfitAnalysis } from './components/SkuProfitAnalysis';
import { CrossLinkageView } from './components/CrossLinkageView';
import { SalesAnalysisView } from './components/SalesAnalysisView';
import { AdAnalysisView } from './components/AdAnalysisView';
import { InventoryAnalysisView } from './components/InventoryAnalysisView';
import { StorageAnalysisView } from './components/StorageAnalysisView';
import { ReturnAnalysisView } from './components/ReturnAnalysisView';
import { CostConfigPanel } from './components/CostConfigPanel';
import { ReportExportModal } from './components/ReportExportModal';
import { DataImportModal } from './components/DataImportModal';

import { SAMPLE_RAW_DATASET, SAMPLE_CONFIG, SAMPLE_LAST_MONTH_METRICS } from './data/sampleDataset';
import { runComprehensiveAnalysis } from './utils/analysisEngine';
import {
  RawUploadedData,
  ManualCostInput,
  ItemPerformanceRow,
  InventoryHealthRow,
  StorageFeeRow,
  ReturnOrderRow,
  ERPOrderRow,
  ProductCatalogRow
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('sales');
  const [currentDataset, setCurrentDataset] = useState<RawUploadedData>(SAMPLE_RAW_DATASET);
  const [currentConfig, setCurrentConfig] = useState<ManualCostInput>(SAMPLE_CONFIG);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Compute live analysis whenever dataset or configuration changes
  const analysisResult = useMemo(() => {
    return runComprehensiveAnalysis(
      currentDataset.productCatalog,
      currentDataset.erpOrders,
      currentDataset.itemPerformance,
      currentDataset.inventoryHealth,
      currentDataset.storageFees,
      currentDataset.returnOrders,
      currentConfig,
      SAMPLE_LAST_MONTH_METRICS
    );
  }, [currentDataset, currentConfig]);

  const handleLoadSampleData = () => {
    setCurrentDataset(SAMPLE_RAW_DATASET);
    setCurrentConfig(SAMPLE_CONFIG);
  };

  const handleClearAllData = () => {
    setCurrentDataset({
      productCatalog: [],
      erpOrders: [],
      itemPerformance: [],
      inventoryHealth: [],
      storageFees: [],
      returnOrders: []
    });
  };

  const handleUpdateData = (partialData: {
    itemPerf?: ItemPerformanceRow[];
    inventory?: InventoryHealthRow[];
    storage?: StorageFeeRow[];
    returns?: ReturnOrderRow[];
    erpOrders?: ERPOrderRow[];
    catalog?: ProductCatalogRow[];
  }) => {
    setCurrentDataset(prev => ({
      itemPerformance: partialData.itemPerf || prev.itemPerformance,
      inventoryHealth: partialData.inventory || prev.inventoryHealth,
      storageFees: partialData.storage || prev.storageFees,
      returnOrders: partialData.returns || prev.returnOrders,
      erpOrders: partialData.erpOrders || prev.erpOrders,
      productCatalog: partialData.catalog || prev.productCatalog
    }));
  };

  const handleSaveConfig = (newConfig: ManualCostInput) => {
    setCurrentConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#0071dc]/20 selection:text-[#0071dc]">
      {/* Top Fixed Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        result={analysisResult}
        onLoadSampleData={handleLoadSampleData}
        onOpenConfig={() => setActiveTab('config')}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            result={analysisResult}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesAnalysisView result={analysisResult} />
        )}

        {activeTab === 'ads' && (
          <AdAnalysisView result={analysisResult} />
        )}

        {activeTab === 'inventory' && (
          <InventoryAnalysisView result={analysisResult} />
        )}

        {activeTab === 'storage' && (
          <StorageAnalysisView result={analysisResult} />
        )}

        {activeTab === 'returns' && (
          <ReturnAnalysisView result={analysisResult} />
        )}

        {activeTab === 'profit' && (
          <SkuProfitAnalysis result={analysisResult} />
        )}

        {activeTab === 'linkage' && (
          <CrossLinkageView result={analysisResult} />
        )}

        {/* Monthly diagnostic report placed as the final summary chapter */}
        {activeTab === 'report' && (
          <FormalMonthlyReport result={analysisResult} />
        )}

        {activeTab === 'config' && (
          <CostConfigPanel
            currentConfig={currentConfig}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      {/* Technical Dashboard / Data Grid System Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-4 sm:px-6 py-2.5 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span>CONFIDENCE LEVEL:</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            {analysisResult.dataQuality.dataCredibility}
          </span>
          <span className="text-slate-300">|</span>
          <span>ERP + WMT MULTI-SOURCE LINKED</span>
          <span className="text-slate-300">|</span>
          <span>EXCLUDED CANCELLED: {analysisResult.dataQuality.cancelledOrdersExcludedCount} ORDERS</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>REPORT ID: WM-{analysisResult.month.replace(/[^0-9]/g, '') || '202408'}-DX</span>
          <span>ANALYSIS ENGINE v4.2.1</span>
        </div>
      </footer>

      {/* Report Export & Print Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={analysisResult}
      />

      {/* Prominent Data Import & Ingestion Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentResult={analysisResult}
        onUpdateData={handleUpdateData}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}

