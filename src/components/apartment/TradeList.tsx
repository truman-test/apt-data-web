import type { Trade } from '@/types/apartment';
import { formatPrice, toPyeong } from '@/lib/formatters';
import { PriceChange } from '@/components/common/PriceChange';

interface TradeListProps {
  trades: Trade[];
  isLoading: boolean;
  total: number;
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
              {trades.slice(0, 10).map((trade, index) => {
                // 같은 면적의 이전 거래 찾기 (비교용)
                const sameSizeTrades = trades.filter(
                  (t) => Math.floor(t.exclusiveArea) === Math.floor(trade.exclusiveArea) && !t.isCanceled
                );
                const currentIdx = sameSizeTrades.findIndex((t) => t.id === trade.id);
                const previousTrade = currentIdx >= 0 && currentIdx < sameSizeTrades.length - 1
                  ? sameSizeTrades[currentIdx + 1]
                  : undefined;

                return (
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
                    <td className={`py-3 text-right ${trade.isCanceled ? 'line-through opacity-60' : ''}`}>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(trade.dealAmount)}
                      </div>
                      {previousTrade && !trade.isCanceled && (
                        <div className="mt-0.5">
                          <PriceChange
                            current={trade.dealAmount}
                            previous={previousTrade.dealAmount}
                            variant="compact"
                            showIcon={false}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
