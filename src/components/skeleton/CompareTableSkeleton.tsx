import { Skeleton } from './Skeleton';

export function CompareTableSkeleton({ columns = 2 }: { columns?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <Skeleton className="mb-4 h-6 w-32" />

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 pr-4">
                <Skeleton className="h-4 w-12" />
              </th>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="min-w-[150px] pb-3">
                  <Skeleton className="h-5 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 6 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </td>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
