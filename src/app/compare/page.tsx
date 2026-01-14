'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { useApartment, usePriceTrend, useNearestStation, useSearchApartments } from '@/hooks/useApartment';
import { CompareTable } from '@/components/compare/CompareTable';
import { ComparePriceChart } from '@/components/compare/ComparePriceChart';
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
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">아파트 검색</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            autoFocus
          />
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : query.length < 2 ? (
            <p className="py-8 text-center text-gray-500">2글자 이상 입력해주세요</p>
          ) : filteredResults.length === 0 ? (
            <p className="py-8 text-center text-gray-500">검색 결과가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => {
                    onSelect(apt);
                    onClose();
                  }}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-900">{apt.aptName}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{apt.address}</p>
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
        className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500"
      >
        <Plus className="mr-2 h-5 w-5" />
        아파트 추가
      </button>
    );
  }

  return (
    <div className="relative rounded-xl border bg-white p-4 shadow-sm">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
      <h3 className="pr-6 font-semibold text-gray-900">{apartment?.aptName}</h3>
      <p className="mt-1 text-sm text-gray-500">{apartment?.address}</p>
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
  // 각 아파트 데이터 조회
  const apartmentQueries = apartmentIds.map((id) => useApartment(id));
  const trendQueries = apartmentIds.map((id) => usePriceTrend(id, { period: '3y' }));
  const stationQueries = apartmentIds.map((id) => useNearestStation(id));

  const isLoading =
    apartmentQueries.some((q) => q.isLoading) ||
    trendQueries.some((q) => q.isLoading);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex h-64 items-center justify-center rounded-xl border bg-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </main>
    </div>
  );
}

// 메인 비교 페이지 컨텐츠 (useSearchParams 사용)
function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apartmentIds, setApartmentIds] = useState<number[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // URL에서 ID 파싱
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam.split(',').map(Number).filter(Boolean);
      setApartmentIds(ids.slice(0, MAX_COMPARE));
    }
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
    if (apartmentIds.length < MAX_COMPARE && !apartmentIds.includes(apt.id)) {
      const newIds = [...apartmentIds, apt.id];
      setApartmentIds(newIds);
      updateUrl(newIds);
    }
  };

  // 아파트 제거
  const removeApartment = (id: number) => {
    const newIds = apartmentIds.filter((aptId) => aptId !== id);
    setApartmentIds(newIds);
    updateUrl(newIds);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">아파트 비교</h1>
          <span className="ml-auto text-sm text-gray-500">
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
          <div className="rounded-xl border bg-white p-12 text-center">
            <p className="text-gray-500">
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
