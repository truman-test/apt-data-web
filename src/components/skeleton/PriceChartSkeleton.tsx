import { Skeleton } from './Skeleton';

export function PriceChartSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      {/* 헤더 */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-24" />
          <div className="mt-2 flex items-baseline gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* 기간 선택 버튼 */}
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-12 rounded-lg" />
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="h-64 flex items-end justify-between gap-1 pt-4">
        {/* 차트 바 시뮬레이션 */}
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
