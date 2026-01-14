'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRentTrend } from '@/hooks/useApartment';
import type { RentTrend } from '@/types/apartment';

interface RentChartProps {
  aptId: number;
  selectedArea?: number | null;
}

type Period = '1y' | '3y' | '5y' | 'all';
type RentType = 'jeonse' | 'monthly';

const periods: { value: Period; label: string }[] = [
  { value: '1y', label: '1년' },
  { value: '3y', label: '3년' },
  { value: '5y', label: '5년' },
  { value: 'all', label: '전체' },
];

const rentTypes: { value: RentType; label: string }[] = [
  { value: 'jeonse', label: '전세' },
  { value: 'monthly', label: '월세' },
];

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

// 차트용 간단 포맷
function formatChartPrice(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}억`;
  }
  return `${(value / 1000).toFixed(0)}천`;
}

export function RentChart({ aptId, selectedArea }: RentChartProps) {
  const [period, setPeriod] = useState<Period>('3y');
  const [rentType, setRentType] = useState<RentType>('jeonse');

  const { data: trendData, isLoading } = useRentTrend(aptId, {
    period,
    rentType,
    area: selectedArea || undefined,
  });
  const data = trendData?.data || [];

  // 최신 시세 계산
  const latestDeposit = data.length > 0 ? data[data.length - 1].avgDeposit : 0;
  const prevDeposit = data.length > 1 ? data[data.length - 2].avgDeposit : latestDeposit;
  const depositChange = latestDeposit - prevDeposit;
  const depositChangePercent = prevDeposit > 0 ? ((depositChange / prevDeposit) * 100).toFixed(1) : '0';

  const latestMonthlyRent = data.length > 0 ? data[data.length - 1].avgMonthlyRent : 0;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">전월세 시세</h2>
          {data.length > 0 && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {rentType === 'jeonse'
                  ? formatPrice(latestDeposit)
                  : `${formatPrice(latestDeposit)} / ${latestMonthlyRent}만`
                }
              </span>
              {rentType === 'jeonse' && (
                <span
                  className={`text-sm font-medium ${
                    depositChange >= 0 ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {depositChange >= 0 ? '+' : ''}
                  {formatPrice(Math.abs(depositChange))} ({depositChange >= 0 ? '+' : ''}
                  {depositChangePercent}%)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 전세/월세 선택 */}
          <div className="flex gap-1">
            {rentTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setRentType(t.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  rentType === t.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 기간 선택 */}
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-64">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            {rentType === 'jeonse' ? '전세' : '월세'} 거래 데이터가 없습니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                tickFormatter={formatChartPrice}
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as RentTrend;
                  return (
                    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <p className="font-semibold text-gray-900">
                        보증금 {formatPrice(item.avgDeposit)}
                      </p>
                      {rentType === 'monthly' && item.avgMonthlyRent > 0 && (
                        <p className="text-sm text-gray-700">
                          월세 {item.avgMonthlyRent.toLocaleString()}만
                        </p>
                      )}
                      <p className="text-xs text-gray-500">{item.transactionCount}건 거래</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="avgDeposit"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#16a34a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
