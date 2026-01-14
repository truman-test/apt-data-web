import { Skeleton } from './Skeleton';

export function ApartmentCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* 단지명 */}
          <Skeleton className="h-6 w-3/4" />

          {/* 주소 */}
          <div className="mt-2 flex items-center gap-1">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>

          {/* 상세 정보 */}
          <div className="mt-3 flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* 지역 뱃지 */}
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ApartmentCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ApartmentCardSkeleton key={i} />
      ))}
    </div>
  );
}
