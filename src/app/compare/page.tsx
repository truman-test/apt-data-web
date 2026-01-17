'use client';

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useApartment, useSearchApartments } from '@/hooks/useApartment';
import { getApartment, getPriceTrend, getNearestStation } from '@/services/api';
import { CompareTable } from '@/components/compare/CompareTable';
import { ComparePriceChart } from '@/components/compare/ComparePriceChart';
import { Skeleton, CompareTableSkeleton, ComparePriceChartSkeleton } from '@/components/skeleton';
import { useToastStore } from '@/stores/toastStore';
import type { Apartment } from '@/types/apartment';

const MAX_COMPARE = 4;

// 검색 모달 컴포넌트
function SearchModal({
  onSelect,
  onClose,
  excludeIds,
}: {
  onSelect: (apt: Apartment) => void;
  onClose: () => void;
  excludeIds: number[];
}) {
  const [query, setQuery] = useState('');
  const { data: searchResult, isLoading } = useSearchApartments(query, { limit: 10 });

  const filteredResults = searchResult?.data?.filter(
    (apt) => !excludeIds.includes(apt.id)
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">아파트 검색</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="아파트명 검색 (2글자 이상)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            autoFocus
          />
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : query.length < 2 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">2글자 이상 입력해주세요</p>
          ) : filteredResults.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">검색 결과가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => {
                    onSelect(apt);
                    onClose();
                  }}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{apt.aptName}</p>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{apt.address}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 아파트 슬롯 컴포넌트
function ApartmentSlot({
  apartment,
  onRemove,
  onAdd,
  isEmpty,
}: {
  apartment?: Apartment;
  onRemove?: () => void;
  onAdd?: () => void;
  isEmpty: boolean;
}) {
  if (isEmpty) {
    return (
      <button
        onClick={onAdd}
        className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-gray-600 dark:hover:border-blue-500"
      >
        <Plus className="mr-2 h-5 w-5" />
        아파트 추가
      </button>
    );
  }

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="pr-6 font-semibold text-gray-900 dark:text-white">{apartment?.aptName}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{apartment?.address}</p>
    </div>
  );
}

// 아파트 슬롯 with 데이터 페칭
function ApartmentSlotWithData({
  aptId,
  onRemove,
  onAdd,
}: {
  aptId?: number;
  onRemove: () => void;
  onAdd: () => void;
}) {
  const { data } = useApartment(aptId || 0);
  const apartment = data?.data;

  return (
    <ApartmentSlot
      apartment={apartment}
      onRemove={onRemove}
      onAdd={onAdd}
      isEmpty={!aptId}
    />
  );
}

// 비교 콘텐츠 컴포넌트
function CompareContent({ apartmentIds }: { apartmentIds: number[] }) {
  // useQueries로 동적 배열 쿼리 처리 (Hooks 규칙 준수)
  const apartmentQueries = useQueries({
    queries: apartmentIds.map((id) => ({
      queryKey: ['apartment', id],
      queryFn: () => getApartment(id),
      enabled: !!id,
    })),
  });

  const trendQueries = useQueries({
    queries: apartmentIds.map((id) => ({
      queryKey: ['priceTrend', id, { period: '3y' }],
      queryFn: () => getPriceTrend(id, { period: '3y' }),
      enabled: !!id,
    })),
  });

  const stationQueries = useQueries({
    queries: apartmentIds.map((id) => ({
      queryKey: ['nearestStation', id],
      queryFn: () => getNearestStation(id),
      enabled: !!id,
    })),
  });

  const isLoading =
    apartmentQueries.some((q) => q.isLoading) ||
    trendQueries.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CompareTableSkeleton columns={apartmentIds.length} />
        <ComparePriceChartSkeleton columns={apartmentIds.length} />
      </div>
    );
  }

  const apartments = apartmentQueries.map((q) => q.data?.data).filter(Boolean) as Apartment[];
  const trends = trendQueries.map((q) => q.data?.data || []);
  const stations = stationQueries.map((q) => q.data?.data || null);

  return (
    <div className="space-y-6">
      {/* 기본 정보 비교 */}
      <CompareTable apartments={apartments} stations={stations} />

      {/* 시세 차트 비교 */}
      <ComparePriceChart apartments={apartments} trends={trends} />
    </div>
  );
}

// 로딩 폴백
function ComparePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 슬롯 스켈레톤 */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        {/* 안내 메시지 스켈레톤 */}
        <div className="rounded-xl border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800">
          <Skeleton className="mx-auto h-5 w-48" />
        </div>
      </main>
    </div>
  );
}

// 메인 비교 페이지 컨텐츠 (useSearchParams 사용)
function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  // URL에서 ID 파싱 (useMemo로 파생 상태 계산)
  const apartmentIds = useMemo(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      return idsParam.split(',').map(Number).filter(Boolean).slice(0, MAX_COMPARE);
    }
    return [];
  }, [searchParams]);

  // URL 업데이트
  const updateUrl = (ids: number[]) => {
    if (ids.length > 0) {
      router.replace(`/compare?ids=${ids.join(',')}`, { scroll: false });
    } else {
      router.replace('/compare', { scroll: false });
    }
  };

  // 아파트 추가
  const addApartment = (apt: Apartment) => {
    if (apartmentIds.length >= MAX_COMPARE) {
      addToast(`최대 ${MAX_COMPARE}개까지만 비교할 수 있습니다`, 'warning');
      return;
    }
    if (apartmentIds.includes(apt.id)) {
      addToast('이미 추가된 아파트입니다', 'warning');
      return;
    }
    const newIds = [...apartmentIds, apt.id];
    updateUrl(newIds);
    addToast(`${apt.aptName}이(가) 비교 목록에 추가되었습니다`, 'success');
  };

  // 아파트 제거
  const removeApartment = (id: number) => {
    const newIds = apartmentIds.filter((aptId) => aptId !== id);
    updateUrl(newIds);
    addToast('아파트가 비교 목록에서 제거되었습니다', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold dark:text-white">아파트 비교</h1>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            {apartmentIds.length}/{MAX_COMPARE}개 선택
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 아파트 선택 슬롯 */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: MAX_COMPARE }).map((_, index) => (
            <ApartmentSlotWithData
              key={index}
              aptId={apartmentIds[index]}
              onRemove={() => removeApartment(apartmentIds[index])}
              onAdd={() => setShowSearch(true)}
            />
          ))}
        </div>

        {/* 비교 내용 */}
        {apartmentIds.length >= 2 ? (
          <CompareContent apartmentIds={apartmentIds} />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              비교할 아파트를 2개 이상 선택해주세요
            </p>
          </div>
        )}
      </main>

      {/* 검색 모달 */}
      {showSearch && (
        <SearchModal
          onSelect={addApartment}
          onClose={() => setShowSearch(false)}
          excludeIds={apartmentIds}
        />
      )}
    </div>
  );
}

// 페이지 export (Suspense로 래핑)
export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageSkeleton />}>
      <ComparePageContent />
    </Suspense>
  );
}
