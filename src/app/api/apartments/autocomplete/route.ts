import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export interface AutocompleteItem {
  id: number;
  aptName: string;
  dongName: string;
  displayName: string; // "동이름 아파트명" 형식
  sidoName: string;
  sigunguName: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    // 최소 1글자 이상
    if (query.length < 1) {
      return successResponse([]);
    }

    // 검색 결과 조회 (최대 15개, 거래량 순)
    const apartments = await prisma.apt_master.findMany({
      where: {
        OR: [
          { apt_nm: { contains: query, mode: 'insensitive' } },
          { umd_nm: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        apt_id: true,
        apt_nm: true,
        umd_nm: true,
        sido: true,
        sigungu: true,
        trade_count: true,
      },
      orderBy: [
        { trade_count: 'desc' },
        { apt_nm: 'asc' },
      ],
      take: 15,
    });

    const result: AutocompleteItem[] = apartments.map((apt) => ({
      id: apt.apt_id,
      aptName: apt.apt_nm,
      dongName: apt.umd_nm,
      displayName: `${apt.umd_nm} ${apt.apt_nm}`,
      sidoName: apt.sido || '',
      sigunguName: apt.sigungu || '',
    }));

    return successResponse(result);
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return errorResponse('자동완성 검색 중 오류가 발생했습니다', 500);
  }
}
