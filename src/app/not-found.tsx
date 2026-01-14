'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* 404 텍스트 */}
        <h1 className="text-8xl font-bold text-gray-200">404</h1>

        {/* 메시지 */}
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mt-2 text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            홈으로 가기
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Search className="h-4 w-4" />
            아파트 검색
          </Link>
        </div>

        {/* 뒤로 가기 */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          이전 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
