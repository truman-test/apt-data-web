'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Apartment, PriceTrend } from '@/types/apartment';

interface ComparePriceChartProps {
  apartments: Apartment[];
  trends: PriceTrend[][];
}

// 차트 색상 팔레트
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];

// 가격 포맷 (억/만원)
function formatPrice(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}억`;
  }
  return `${(value / 1000).toFixed(0)}천`;
}

// 데이터 병합 (날짜 기준)
function mergeData(apartments: Apartment[], trends: PriceTrend[][]) {
  const dateMap = new Map<string, Record<string, number>>();

  trends.forEach((trend, index) => {
    const aptKey = `apt${index}`;
    trend.forEach((item) => {
      const existing = dateMap.get(item.date) || {};
      existing[aptKey] = item.avgPrice;
      dateMap.set(item.date, existing);
    });
  });

  // 날짜순 정렬
  const sortedDates = Array.from(dateMap.keys()).sort();
  return sortedDates.map((date) => ({
    date,
    ...dateMap.get(date),
  }));
}

export function ComparePriceChart({ apartments, trends }: ComparePriceChartProps) {
  const mergedData = mergeData(apartments, trends);

  // 최신 가격 및 변동 계산
  const latestPrices = trends.map((trend) => {
    if (trend.length === 0) return { current: 0, change: 0 };
    const current = trend[trend.length - 1].avgPrice;
    const prev = trend.length > 1 ? trend[trend.length - 2].avgPrice : current;
    return { current, change: current - prev };
  });

  if (mergedData.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">시세 비교</h2>
        <div className="flex h-64 items-center justify-center text-gray-500">
          거래 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">시세 비교 (최근 3년)</h2>

      {/* 최신 가격 요약 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {apartments.map((apt, index) => (
          <div key={apt.id} className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm font-medium text-gray-700 truncate">
                {apt.aptName}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(latestPrices[index].current)}
              </span>
              {latestPrices[index].change !== 0 && (
                <span
                  className={`ml-2 text-sm ${
                    latestPrices[index].change >= 0
                      ? 'text-red-500'
                      : 'text-blue-500'
                  }`}
                >
                  {latestPrices[index].change >= 0 ? '+' : ''}
                  {formatPrice(Math.abs(latestPrices[index].change))}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mergedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${year.slice(2)}.${month}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatPrice}
              width={50}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
                    <p className="mb-1 text-xs text-gray-500">{label}</p>
                    {payload.map((entry, index) => (
                      <p
                        key={index}
                        className="text-sm font-medium"
                        style={{ color: entry.color }}
                      >
                        {apartments[parseInt(entry.dataKey?.toString().replace('apt', '') || '0')]?.aptName}:{' '}
                        {formatPrice(entry.value as number)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend
              formatter={(value) => {
                const index = parseInt(value.replace('apt', ''));
                return apartments[index]?.aptName || value;
              }}
            />
            {apartments.map((_, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={`apt${index}`}
                stroke={COLORS[index]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
