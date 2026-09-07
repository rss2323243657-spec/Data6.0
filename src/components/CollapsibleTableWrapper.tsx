import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleTableWrapperProps {
  children: React.ReactNode;
  title?: string;
  totalCount?: number;
  initialCollapsed?: boolean;
  maxCollapsedHeight?: string; // e.g. 'max-h-[380px]'
  className?: string;
}

export const CollapsibleTableWrapper: React.FC<CollapsibleTableWrapperProps> = ({
  children,
  title,
  totalCount,
  initialCollapsed = false,
  maxCollapsedHeight = 'max-h-[420px]',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!initialCollapsed);

  return (
    <div className={`relative ${className}`}>
      {/* Content Container */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-none' : `${maxCollapsedHeight} overflow-hidden`
        }`}
      >
        {children}
      </div>

      {/* Fade overlay when collapsed */}
      {!isExpanded && (
        <div className="absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
      )}

      {/* Collapse / Expand Toggle Bar */}
      <div className="mt-2 flex items-center justify-center pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0071dc] bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-md transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>收起长表格数据</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>展开查看完整数据 {totalCount !== undefined ? `(共 ${totalCount} 条)` : ''}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
