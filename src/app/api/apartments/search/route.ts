import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validatePagination, CacheDuration } from '@/lib/api-response';
import { transformApartment } from '@/lib/transformers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const { page, limit } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    );

    // 최소 2글자 이상
    if (query.length < 2) {
      return errorResponse('검색어는 2글자 이상 입력해주세요', 400);
    }

    // 총 개수 조회
    const total = await prisma.apt_master.count({
      where: {
        OR: [
          { apt_nm: { contains: query, mode: 'insensitive' } },
          { sigungu: { contains: query, mode: 'insensitive' } },
          { umd_nm: { contains: query, mode: 'insensitive' } },
          { sido: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // 검색 결과 조회
    const apartments = await prisma.apt_master.findMany({
      where: {
        OR: [
          { apt_nm: { contains: query, mode: 'insensitive' } },
          { sigungu: { contains: query, mode: 'insensitive' } },
          { umd_nm: { contains: query, mode: 'insensitive' } },
          { sido: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        kapt_info: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { trade_count: 'desc' }, // 거래량 많은 순
        { apt_nm: 'asc' },
      ],
    });

    return successResponse(
      apartments.map(transformApartment),
      { meta: { total, page, limit }, cache: CacheDuration.SHORT }
    );
  } catch (error) {
    console.error('Search API error:', error);
    return errorResponse('검색 중 오류가 발생했습니다', 500);
  }
}
