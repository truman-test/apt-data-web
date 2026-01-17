'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useApartment, useNearestStation, useSchools, usePriceTrend, useTrades, useRents, useAreaTypes } from '@/hooks/useApartment';
import { ApartmentInfo } from '@/components/apartment/ApartmentInfo';
import { FacilityInfo } from '@/components/apartment/FacilityInfo';
import { PriceChart } from '@/components/chart/PriceChart';
import { RentChart } from '@/components/chart/RentChart';
import { TradeList } from '@/components/apartment/TradeList';
import { RentList } from '@/components/apartment/RentList';
import { NearbyInfo } from '@/components/apartment/NearbyInfo';
import { SchoolInfo } from '@/components/apartment/SchoolInfo';
import { AreaFilter } from '@/components/apartment/AreaFilter';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { ShareButton } from '@/components/common/ShareButton';
import { ErrorBoundary, ChartErrorFallback } from '@/components/common/ErrorBoundary';
import {
  ApartmentInfoSkeleton,
  NearbyInfoSkeleton,
  SchoolInfoSkeleton,
  PriceChartSkeleton,
  TradeListSkeleton,
  Skeleton,
} from '@/components/skeleton';

interface ApartmentDetailContentProps {
  aptId: number;
}

export function ApartmentDetailContent({ aptId }: ApartmentDetailContentProps) {
  // 선택된 공급면적 (평형 구분용)
  const [selectedSupplyArea, setSelectedSupplyArea] = useState<number | null>(null);

  const { data: aptData, isLoading: aptLoading, isError: aptError } = useApartment(aptId);
  const { data: stationData } = useNearestStation(aptId);
  const { data: schoolsData } = useSchools(aptId);
  const { data: areaTypesData, isLoading: areaTypesLoading } = useAreaTypes(aptId);

  const areaTypes = areaTypesData?.data || [];

  // 선택된 공급면적에 해당하는 전용면적 찾기 (API 필터링용)
  const selectedAreaType = areaTypes.find(
    (a) => selectedSupplyArea !== null && selectedSupplyArea === a.supplyArea
  );
  const selectedExclusiveArea = selectedAreaType?.exclusiveArea;

  const { data: trendData, isLoading: trendLoading } = usePriceTrend(aptId, {
    period: '3y',
    area: selectedExclusiveArea || undefined,
  });
  const { data: tradesData, isLoading: tradesLoading } = useTrades(aptId, {
    area: selectedExclusiveArea || undefined,
  });
  const { data: rentsData, isLoading: rentsLoading } = useRents(aptId, {
    area: selectedExclusiveArea || undefined,
  });

  const apartment = aptData?.data;
  const station = stationData?.data;
  const schools = schoolsData?.data;
  const priceTrend = trendData?.data || [];
  const trades = tradesData?.data || [];
  const rents = rentsData?.data || [];

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
              <SchoolInfoSkeleton />
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
          <ShareButton
            title={`${apartment.aptName} - 실거래가`}
            description={`${apartment.address} 아파트 실거래가 및 시세 정보`}
            size="lg"
          />
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
          {/* 왼쪽: 기본 정보 + 시설 + 교통 */}
          <div className="space-y-6 lg:col-span-1">
            <ApartmentInfo apartment={apartment} />
            <FacilityInfo apartment={apartment} />
            <NearbyInfo station={station} />
            <SchoolInfo schoolInfo={schools} />
          </div>

          {/* 오른쪽: 평형 필터 + 시세 차트 + 거래 내역 */}
          <div className="space-y-6 lg:col-span-2">
            {/* 평형 필터 */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">평형 선택</h2>
              <AreaFilter
                areas={areaTypes}
                selected={selectedSupplyArea}
                onChange={setSelectedSupplyArea}
                isLoading={areaTypesLoading}
              />
            </div>

            {/* 시세 차트 - 에러 바운더리로 감싸서 차트 에러가 전체 페이지를 중단시키지 않도록 */}
            <ErrorBoundary fallback={<ChartErrorFallback />}>
              <PriceChart
                data={priceTrend}
                isLoading={trendLoading}
                aptId={aptId}
                selectedArea={selectedExclusiveArea}
              />
            </ErrorBoundary>

            <ErrorBoundary fallback={<ChartErrorFallback />}>
              <RentChart
                aptId={aptId}
                selectedArea={selectedExclusiveArea}
              />
            </ErrorBoundary>

            {/* 거래 내역 */}
            <ErrorBoundary>
              <TradeList
                trades={trades}
                isLoading={tradesLoading}
                total={tradesData?.meta?.total || 0}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <RentList
                rents={rents}
                isLoading={rentsLoading}
                total={rentsData?.meta?.total || 0}
              />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}
