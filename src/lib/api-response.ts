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

export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta });
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
