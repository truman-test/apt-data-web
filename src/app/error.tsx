'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 에러 모니터링 서비스로 전송)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* 아이콘 */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* 메시지 */}
        <h2 className="mt-6 text-2xl font-semibold text-gray-900">
          문제가 발생했습니다
        </h2>
        <p className="mt-2 text-gray-500">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>

        {/* 에러 정보 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-lg bg-gray-100 p-4 text-left">
            <p className="text-xs font-medium text-gray-500">Error Details</p>
            <p className="mt-1 text-sm text-red-600">{error.message}</p>
            {error.digest && (
              <p className="mt-1 text-xs text-gray-400">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
