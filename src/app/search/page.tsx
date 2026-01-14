'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchApartments } from '@/hooks/useApartment';
import { ApartmentCard } from '@/components/search/ApartmentCard';
import { Pagination } from '@/components/search/Pagination';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError } = useSearchApartments(query, { page, limit: 20 });

  // URL 파라미터 변경 시 상태 동기화
  useEffect(() => {
    setQuery(initialQuery);
    setInputValue(initialQuery);
    setPage(initialPage);
  }, [initialQuery, initialPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length >= 2) {
      setQuery(inputValue.trim());
      setPage(1);
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="아파트명, 지역명으로 검색"
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              검색
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* 검색어가 없을 때 */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">검색어를 입력해주세요</p>
            <p className="mt-1 text-sm text-gray-400">아파트명 또는 지역명으로 검색할 수 있습니다</p>
          </div>
        )}

        {/* 로딩 */}
        {query && isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-gray-500">검색 중...</p>
          </div>
        )}

        {/* 에러 */}
        {query && isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-red-500">검색 중 오류가 발생했습니다</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
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
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">&quot;{query}&quot;</span> 검색 결과{' '}
                <span className="font-semibold text-blue-600">{total.toLocaleString()}</span>건
              </p>
            </div>

            {/* 결과 없음 */}
            {apartments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-gray-500">검색 결과가 없습니다</p>
                <p className="mt-1 text-sm text-gray-400">다른 검색어로 시도해보세요</p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
