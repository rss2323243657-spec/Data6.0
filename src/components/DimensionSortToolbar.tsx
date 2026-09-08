import React from 'react';
import { Search, ArrowUpDown, Filter, EyeOff } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

interface DimensionSortToolbarProps {
  activeDimension: 'category' | 'spu' | 'sku';
  onDimensionChange: (dim: 'category' | 'spu' | 'sku') => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  sortField: string;
  onSortFieldChange: (field: string) => void;
  sortOptions: SortOption[];
  sortDirection: 'asc' | 'desc';
  onToggleSortDirection: () => void;
  hideZeroData: boolean;
  onToggleHideZeroData: (hide: boolean) => void;
  totalCount: number;
}

export const DimensionSortToolbar: React.FC<DimensionSortToolbarProps> = ({
  activeDimension,
  onDimensionChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  sortField,
  onSortFieldChange,
  sortOptions,
  sortDirection,
  onToggleSortDirection,
  hideZeroData,
  onToggleHideZeroData,
  totalCount
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
      {/* Left: Dimension Switcher Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => onDimensionChange('category')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeDimension === 'category'
              ? 'bg-white text-[#0071dc] font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          品类维度 (Category)
        </button>
        <button
          type="button"
          onClick={() => onDimensionChange('spu')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeDimension === 'spu'
              ? 'bg-white text-[#0071dc] font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          SPU 维度
        </button>
        <button
          type="button"
          onClick={() => onDimensionChange('sku')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeDimension === 'sku'
              ? 'bg-white text-[#0071dc] font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          SKU 细分明细
        </button>
      </div>

      {/* Right: Search + Sort Dropdown & Button + Filter Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              searchPlaceholder ||
              `搜索${activeDimension === 'category' ? '品类' : activeDimension === 'spu' ? 'SPU' : 'SKU/商品名'}...`
            }
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0071dc] w-48 sm:w-52 font-mono"
          />
        </div>

        {/* Sort Dropdown + Direction Button */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[11px] text-slate-500 whitespace-nowrap">排序:</span>
          <select
            value={sortField}
            onChange={e => onSortFieldChange(e.target.value)}
            className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleSortDirection}
            className="ml-1 px-1.5 py-0.5 text-[11px] font-mono font-bold rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title={sortDirection === 'desc' ? '当前降序，点击切换为升序' : '当前升序，点击切换为降序'}
          >
            {sortDirection === 'desc' ? '降序 ▼' : '升序 ▲'}
          </button>
        </div>

        {/* Hide Zero Data Toggle */}
        <button
          type="button"
          onClick={() => onToggleHideZeroData(!hideZeroData)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
            hideZeroData
              ? 'bg-blue-50 border-blue-200 text-[#0071dc]'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          title="过滤完全没有投入与产出的全空项"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>{hideZeroData ? '已过滤全空项' : '显示全量'}</span>
          <span className="text-[10px] font-mono bg-white/80 px-1 py-0.2 rounded border border-slate-200 text-slate-600">
            {totalCount}条
          </span>
        </button>
      </div>
    </div>
  );
};
