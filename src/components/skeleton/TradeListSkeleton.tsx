import { Skeleton } from './Skeleton';

export function TradeListSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* 테이블 헤더 */}
      <div className="border-b border-gray-200 pb-3 dark:border-gray-700">
        <div className="flex">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-8 h-4 w-24" />
          <Skeleton className="ml-8 h-4 w-12" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </div>

      {/* 테이블 로우 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-8 h-4 w-28" />
            <Skeleton className="ml-8 h-4 w-10" />
            <Skeleton className="ml-auto h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
