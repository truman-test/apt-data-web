import { ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import type { Rent } from '@/types/apartment';

interface RentListProps {
  rents: Rent[];
  isLoading: boolean;
  total: number;
}

// 가격 포맷 (억/만원)
function formatPrice(value: number): string {
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const man = value % 10000;
    if (man === 0) return `${eok}억`;
    return `${eok}억 ${Math.round(man / 1000) * 1000}`;
  }
  return `${value.toLocaleString()}만`;
}

// 면적을 평으로 변환 (1평 = 3.3058㎡)
function toPyeong(area: number): number {
  return Math.round(area / 3.3058);
}

export function RentList({ rents, isLoading, total }: RentListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">전월세 거래 내역</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">총 {total.toLocaleString()}건</span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : rents.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
          전월세 거래 내역이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="pb-3 font-medium">거래일</th>
                <th className="pb-3 font-medium">면적</th>
                <th className="pb-3 font-medium">층</th>
                <th className="pb-3 font-medium">유형</th>
                <th className="pb-3 text-right font-medium">보증금/월세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rents.slice(0, 10).map((rent) => (
                <tr key={rent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white">{rent.dealDate}</span>
                      {/* 계약 유형 배지 */}
                      {rent.contractType === 'renewal' && (
                        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                          갱신
                        </span>
                      )}
                      {rent.contractType === 'new' && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                          신규
                        </span>
                      )}
                      {/* 갱신요구권 배지 */}
                      {rent.useRenewalRight && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                          <RotateCcw className="h-3 w-3" />
                          갱신권
                        </span>
                      )}
                      {/* 계약기간 */}
                      {rent.contractPeriod && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {rent.contractPeriod}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">
                    {rent.exclusiveArea.toFixed(0)}㎡ ({toPyeong(rent.exclusiveArea)}평)
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{rent.floor}층</td>
                  <td className="py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        rent.rentType === 'jeonse'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                      }`}
                    >
                      {rent.rentType === 'jeonse' ? '전세' : '월세'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {rent.rentType === 'jeonse' ? (
                        formatPrice(rent.deposit)
                      ) : (
                        <>
                          {formatPrice(rent.deposit)} / {rent.monthlyRent}만
                        </>
                      )}
                    </div>
                    {/* 종전 가격 대비 증감 (갱신 계약) */}
                    {rent.contractType === 'renewal' && rent.prevDeposit !== undefined && (
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-xs">
                        <span className="text-gray-400 dark:text-gray-500">
                          종전 {formatPrice(rent.prevDeposit)}
                        </span>
                        {rent.depositChange !== undefined && rent.depositChange !== 0 && (
                          <span
                            className={`flex items-center ${
                              rent.depositChange > 0 ? 'text-red-500' : 'text-blue-500'
                            }`}
                          >
                            {rent.depositChange > 0 ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                            {Math.abs(rent.depositChangeRate || 0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rents.length > 10 && (
            <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
              최근 10건만 표시됩니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
