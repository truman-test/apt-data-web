import { NextResponse } from 'next/server';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// 캐시 지속 시간 프리셋 (초)
export const CacheDuration = {
  NONE: 0,
  SHORT: 60,           // 1분 - 검색, 자동완성
  MEDIUM: 300,         // 5분 - 단지 상세, 거래 내역
  LONG: 3600,          // 1시간 - 가격 추이 (집계 데이터)
  STATIC: 86400,       // 24시간 - 최근접역 (거의 안 바뀜)
} as const;

export type CacheDurationValue = typeof CacheDuration[keyof typeof CacheDuration];

interface ResponseOptions<T> {
  meta?: ApiResponse<T>['meta'];
  cache?: CacheDurationValue;
}

export function successResponse<T>(
  data: T,
  options?: ResponseOptions<T> | ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  // 하위 호환성: meta만 전달된 경우
  const opts: ResponseOptions<T> = options && 'total' in options
    ? { meta: options }
    : (options as ResponseOptions<T>) || {};

  const headers: HeadersInit = {};

  if (opts.cache && opts.cache > 0) {
    headers['Cache-Control'] = `public, max-age=${opts.cache}, stale-while-revalidate=${Math.floor(opts.cache / 2)}`;
  }

  return NextResponse.json(
    { success: true, data, meta: opts.meta },
    { headers }
  );
}

export function errorResponse(
  message: string,
  status: number = 400
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    { success: false, data: null, message },
    { status }
  );
}

// 유효성 검사 유틸리티
export function validateId(id: string): number | null {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

export function validatePagination(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number } {
  return {
    page: Math.max(1, parseInt(page || '1', 10)),
    limit: Math.min(100, Math.max(1, parseInt(limit || '20', 10))),
  };
}

export function validateBounds(params: URLSearchParams): {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
} | null {
  const swLat = parseFloat(params.get('swLat') || '');
  const swLng = parseFloat(params.get('swLng') || '');
  const neLat = parseFloat(params.get('neLat') || '');
  const neLng = parseFloat(params.get('neLng') || '');

  if ([swLat, swLng, neLat, neLng].some(isNaN)) {
    return null;
  }

  return { swLat, swLng, neLat, neLng };
}
