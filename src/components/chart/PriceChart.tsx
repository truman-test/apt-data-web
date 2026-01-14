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
import { usePriceTrend } from '@/hooks/useApartment';
import type { PriceTrend } from '@/types/apartment';

interface PriceChartProps {
  data: PriceTrend[];
  isLoading: boolean;
  aptId: number;
}

type Period = '1y' | '3y' | '5y' | 'all';

const periods: { value: Period; label: string }[] = [
  { value: '1y', label: '1년' },
  { value: '3y', label: '3년' },
  { value: '5y', label: '5년' },
  { value: 'all', label: '전체' },
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

export function PriceChart({ data: initialData, isLoading: initialLoading, aptId }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>('3y');

  // 기간 변경 시 새로운 데이터 요청
  const { data: trendData, isLoading } = usePriceTrend(aptId, { period });
  const data = trendData?.data || initialData;
  const loading = isLoading || initialLoading;

  // 최신 시세 계산
  const latestPrice = data.length > 0 ? data[data.length - 1].avgPrice : 0;
  const prevPrice = data.length > 1 ? data[data.length - 2].avgPrice : latestPrice;
  const priceChange = latestPrice - prevPrice;
  const priceChangePercent = prevPrice > 0 ? ((priceChange / prevPrice) * 100).toFixed(1) : '0';

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">매매 시세</h2>
          {data.length > 0 && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(latestPrice)}
              </span>
              <span
                className={`text-sm font-medium ${
                  priceChange >= 0 ? 'text-red-500' : 'text-blue-500'
                }`}
              >
                {priceChange >= 0 ? '+' : ''}
                {formatPrice(Math.abs(priceChange))} ({priceChange >= 0 ? '+' : ''}
                {priceChangePercent}%)
              </span>
            </div>
          )}
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

      {/* 차트 */}
      <div className="h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            거래 데이터가 없습니다
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
                  const item = payload[0].payload as PriceTrend;
                  return (
                    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <p className="font-semibold text-gray-900">{formatPrice(item.avgPrice)}</p>
                      <p className="text-xs text-gray-500">{item.transactionCount}건 거래</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="avgPrice"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
