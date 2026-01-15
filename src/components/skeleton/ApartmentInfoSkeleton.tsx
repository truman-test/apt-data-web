import { Skeleton } from './Skeleton';

export function ApartmentInfoSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <Skeleton className="mb-4 h-6 w-24" />

      {/* 정보 항목들 */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="mt-0.5 h-4 w-4 rounded" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="mt-1 h-4 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* 지역 태그 */}
      <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}
