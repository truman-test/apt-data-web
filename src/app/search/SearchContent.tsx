'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchApartments } from '@/hooks/useApartment';
import { ApartmentCard } from '@/components/search/ApartmentCard';
import { Pagination } from '@/components/search/Pagination';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { ApartmentCardSkeleton } from '@/components/skeleton';

function SearchContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError } = useSearchApartments(query, { page, limit: 20 });

  // URL 파라미터 변경 시 상태 동기화 (뒤로가기/앞으로가기 지원)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setQuery(initialQuery);
    setPage(initialPage);
  }, [initialQuery, initialPage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apartments = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <SearchAutocomplete
            initialValue={query}
            variant="header"
            onSearch={handleSearch}
            placeholder="아파트명, 지역명으로 검색"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => query && handleSearch(query)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            검색
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 검색어가 없을 때 */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">검색어를 입력해주세요</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">아파트명 또는 지역명으로 검색할 수 있습니다</p>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {query && isLoading && (
          <div>
            <div className="mb-4">
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ApartmentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* 에러 */}
        {query && isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-500 dark:text-red-400">검색 중 오류가 발생했습니다</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 검색 결과 */}
        {query && !isLoading && !isError && (
          <>
            {/* 결과 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-gray-900 dark:text-white">&quot;{query}&quot;</span> 검색 결과{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">{total.toLocaleString()}</span>건
              </p>
            </div>

            {/* 결과 없음 */}
            {apartments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-gray-500 dark:text-gray-400">검색 결과가 없습니다</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">다른 검색어로 시도해보세요</p>
              </div>
            )}

            {/* 결과 리스트 */}
            {apartments.length > 0 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {apartments.map((apt) => (
                    <ApartmentCard key={apt.id} apartment={apt} />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export function SearchContent() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <SearchContentInner />
    </Suspense>
  );
}
