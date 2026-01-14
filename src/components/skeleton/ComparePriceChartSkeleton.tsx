import { Skeleton } from './Skeleton';

export function ComparePriceChartSkeleton({ columns = 2 }: { columns?: number }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <Skeleton className="mb-4 h-6 w-40" />

      {/* 가격 요약 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-3">
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
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
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
