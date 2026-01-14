import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 페이지 번호 범위 계산 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    // 끝에 가까우면 시작점 조정
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* 첫 페이지 + ... */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="flex h-10 w-10 items-center justify-center text-gray-400">...</span>
          )}
        </>
      )}

      {/* 페이지 번호 */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm transition-colors ${
            page === currentPage
              ? 'border-blue-600 bg-blue-600 font-semibold text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* ... + 마지막 페이지 */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="flex h-10 w-10 items-center justify-center text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
