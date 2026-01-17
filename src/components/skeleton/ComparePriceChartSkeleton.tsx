import { Skeleton } from './Skeleton';

// 차트 스켈레톤용 고정 높이 값 (렌더링 중 Math.random 호출 방지)
const CHART_BAR_HEIGHTS = [45, 72, 58, 85, 63, 78, 52, 90, 68, 55, 82, 60];

export function ComparePriceChartSkeleton({ columns = 2 }: { columns?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <Skeleton className="mb-4 h-6 w-40" />

      {/* 가격 요약 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="h-80 flex items-end justify-between gap-1 pt-4">
        {CHART_BAR_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* X축 라벨 */}
      <div className="mt-2 flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
