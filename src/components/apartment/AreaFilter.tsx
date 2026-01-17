'use client';

import { cn } from '@/lib/utils';
import type { AreaType } from '@/types/apartment';
import { formatPrice, formatAreaRange } from '@/lib/formatters';

interface AreaFilterProps {
  areas: AreaType[];
  selected: number | null;
  onChange: (area: number | null) => void;
  isLoading?: boolean;
}

export function AreaFilter({ areas, selected, onChange, isLoading }: AreaFilterProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        면적 정보가 없습니다
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {/* 전체 카드 */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-xl border-2 p-4 text-left transition-all',
          selected === null
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
        )}
      >
        <div className="text-lg font-bold text-gray-900 dark:text-white">전체</div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {areas.reduce((sum, a) => sum + a.units, 0).toLocaleString()}세대
        </div>
      </button>

      {/* 평형별 카드 */}
      {areas.map((area) => {
        // 공급면적 기준으로 선택 비교 (정확한 매칭)
        const isSelected = selected === area.supplyArea;

        return (
          <button
            key={area.id}
            onClick={() => onChange(area.supplyArea)}
            className={cn(
              'rounded-xl border-2 p-4 text-left transition-all',
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
            )}
          >
            {/* 평수 + 세대수 */}
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {area.pyeong}평
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {area.units.toLocaleString()}세대
              </span>
            </div>

            {/* 공급/전용 면적 */}
            <div className="mt-2 space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
              <div>
                공급 {formatAreaRange(area.supplyAreaMin, area.supplyAreaMax, area.supplyArea)}
              </div>
              <div>
                전용 {formatAreaRange(area.exclusiveAreaMin, area.exclusiveAreaMax, area.exclusiveArea)}
              </div>
            </div>

            {/* 시세 정보 */}
            {(area.tradePrice || area.jeonsePrice) && (
              <div className="mt-3 space-y-1 border-t border-gray-100 pt-2 dark:border-gray-700">
                {area.tradePrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">매매</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(area.tradePrice)}
                    </span>
                  </div>
                )}
                {area.jeonsePrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">전세</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatPrice(area.jeonsePrice)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
