import type { Trade } from '@/types/apartment';

interface TradeListProps {
  trades: Trade[];
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

// 공급면적을 평으로 변환 (호갱노노 기준: 1평 = 3.3㎡, 소수점 버림)
function toPyeong(supplyArea: number): number {
  return Math.floor(supplyArea / 3.3);
}

export function TradeList({ trades, isLoading, total }: TradeListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">최근 거래 내역</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">총 {total.toLocaleString()}건</span>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : trades.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
          거래 내역이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <th className="pb-3 font-medium">거래일</th>
                <th className="pb-3 font-medium">면적</th>
                <th className="pb-3 font-medium">층</th>
                <th className="pb-3 text-right font-medium">거래가</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {trades.slice(0, 10).map((trade) => (
                <tr
                  key={trade.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    trade.isCanceled ? 'opacity-60' : ''
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-gray-900 dark:text-white ${trade.isCanceled ? 'line-through' : ''}`}>
                        {trade.dealDate}
                      </span>
                      {trade.isCanceled && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-400">
                          해지
                        </span>
                      )}
                      {trade.dealingType === 'direct' && (
                        <span className="rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
                          직거래
                        </span>
                      )}
                    </div>
                    {trade.cancelDate && (
                      <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        해지일: {trade.cancelDate}
                      </div>
                    )}
                  </td>
                  <td className={`py-3 text-gray-600 dark:text-gray-400 ${trade.isCanceled ? 'line-through' : ''}`}>
                    <div>{trade.supplyArea ? toPyeong(trade.supplyArea) : Math.floor(trade.exclusiveArea / 3.3)}평</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      전용 {Math.floor(trade.exclusiveArea)}㎡
                      {trade.supplyArea && (
                        <span> / 공급 {Math.floor(trade.supplyArea)}㎡</span>
                      )}
                    </div>
                  </td>
                  <td className={`py-3 text-gray-600 dark:text-gray-400 ${trade.isCanceled ? 'line-through' : ''}`}>
                    {trade.floor}층
                  </td>
                  <td className={`py-3 text-right font-semibold text-gray-900 dark:text-white ${trade.isCanceled ? 'line-through' : ''}`}>
                    {formatPrice(trade.dealAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {trades.length > 10 && (
            <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
              최근 10건만 표시됩니다
            </p>
          )}
        </div>
      )}
    </div>
  );
}
