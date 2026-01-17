import { Skeleton } from './Skeleton';

export function SchoolInfoSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="space-y-4">
        {/* 배정 초등학교 섹션 */}
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* 가까운 중학교 섹션 */}
        <div>
          <Skeleton className="mb-2 h-4 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="mt-1 h-4 w-20" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
