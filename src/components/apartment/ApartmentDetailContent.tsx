'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useApartment, useNearestStation, usePriceTrend, useTrades, useAreaTypes } from '@/hooks/useApartment';
import { ApartmentInfo } from '@/components/apartment/ApartmentInfo';
import { PriceChart } from '@/components/chart/PriceChart';
import { RentChart } from '@/components/chart/RentChart';
import { TradeList } from '@/components/apartment/TradeList';
import { NearbyInfo } from '@/components/apartment/NearbyInfo';
import { AreaFilter } from '@/components/apartment/AreaFilter';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import {
  ApartmentInfoSkeleton,
  NearbyInfoSkeleton,
  PriceChartSkeleton,
  TradeListSkeleton,
  Skeleton,
} from '@/components/skeleton';

interface ApartmentDetailContentProps {
  aptId: number;
}

export function ApartmentDetailContent({ aptId }: ApartmentDetailContentProps) {
  const [selectedArea, setSelectedArea] = useState<number | null>(null);

  const { data: aptData, isLoading: aptLoading, isError: aptError } = useApartment(aptId);
  const { data: stationData } = useNearestStation(aptId);
  const { data: areaTypesData, isLoading: areaTypesLoading } = useAreaTypes(aptId);
  const { data: trendData, isLoading: trendLoading } = usePriceTrend(aptId, {
    period: '3y',
    area: selectedArea || undefined,
  });
  const { data: tradesData, isLoading: tradesLoading } = useTrades(aptId, {
    area: selectedArea || undefined,
  });

  const apartment = aptData?.data;
  const station = stationData?.data;
  const areaTypes = areaTypesData?.data || [];
  const priceTrend = trendData?.data || [];
  const trades = tradesData?.data || [];

  // 로딩 상태 - 스켈레톤 UI
  if (aptLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
            <Skeleton className="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-1 h-4 w-64" />
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <ApartmentInfoSkeleton />
              <NearbyInfoSkeleton />
            </div>
            <div className="space-y-6 lg:col-span-2">
              <PriceChartSkeleton />
              <TradeListSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 에러 상태
  if (aptError || !apartment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">아파트 정보를 찾을 수 없습니다</p>
        <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <button onClick={() => window.history.back()} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{apartment.aptName}</h1>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">{apartment.address}</p>
          </div>
          <FavoriteButton
            aptId={aptId}
            aptName={apartment.aptName}
            size="lg"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 왼쪽: 기본 정보 + 교통 */}
          <div className="space-y-6 lg:col-span-1">
            <ApartmentInfo apartment={apartment} />
            <NearbyInfo station={station} />
          </div>

          {/* 오른쪽: 평형 필터 + 시세 차트 + 거래 내역 */}
          <div className="space-y-6 lg:col-span-2">
            {/* 평형 필터 */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">평형 선택</h2>
              <AreaFilter
                areas={areaTypes}
                selected={selectedArea}
                onChange={setSelectedArea}
                isLoading={areaTypesLoading}
              />
            </div>

            <PriceChart
              data={priceTrend}
              isLoading={trendLoading}
              aptId={aptId}
              selectedArea={selectedArea}
            />
            <RentChart
              aptId={aptId}
              selectedArea={selectedArea}
            />
            <TradeList
              trades={trades}
              isLoading={tradesLoading}
              total={tradesData?.meta?.total || 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
