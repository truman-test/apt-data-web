import { Skeleton } from './Skeleton';

export function NearbyInfoSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <Skeleton className="mb-4 h-6 w-24" />

      {/* 교통 정보 카드 */}
      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-1 h-4 w-32" />
            <div className="mt-2 flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
