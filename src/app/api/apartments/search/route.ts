import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validatePagination, CacheDuration } from '@/lib/api-response';
import { transformApartment } from '@/lib/transformers';
import type { Prisma } from '@/generated/prisma';

// 준공 연도 필터 파싱
function parseYearFilter(yearBuilt: string | null): Prisma.apt_masterWhereInput | null {
  if (!yearBuilt) return null;
  switch (yearBuilt) {
    case '~1990': return { build_year: { lt: 1990 } };
    case '1990s': return { build_year: { gte: 1990, lt: 2000 } };
    case '2000s': return { build_year: { gte: 2000, lt: 2010 } };
    case '2010s': return { build_year: { gte: 2010, lt: 2020 } };
    case '2020~': return { build_year: { gte: 2020 } };
    default: return null;
  }
}

// 세대수 필터 파싱 (kapt_info.total_ho_cnt 기준)
function parseUnitsFilter(units: string | null): { gte?: number; lt?: number } | null {
  if (!units) return null;
  switch (units) {
    case '~100': return { lt: 100 };
    case '100~300': return { gte: 100, lt: 300 };
    case '300~500': return { gte: 300, lt: 500 };
    case '500~1000': return { gte: 500, lt: 1000 };
    case '1000~2000': return { gte: 1000, lt: 2000 };
    case '2000~': return { gte: 2000 };
    default: return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const { page, limit } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    );

    // 필터 파라미터
    const yearBuilt = searchParams.get('yearBuilt');
    const units = searchParams.get('units');
    const hallwayType = searchParams.get('hallwayType');

    // 최소 2글자 이상
    if (query.length < 2) {
      return errorResponse('검색어는 2글자 이상 입력해주세요', 400);
    }

    // 기본 검색 조건
    const searchCondition: Prisma.apt_masterWhereInput = {
      OR: [
        { apt_nm: { contains: query, mode: 'insensitive' } },
        { sigungu: { contains: query, mode: 'insensitive' } },
        { umd_nm: { contains: query, mode: 'insensitive' } },
        { sido: { contains: query, mode: 'insensitive' } },
      ],
    };

    // 준공 연도 필터
    const yearFilter = parseYearFilter(yearBuilt);

    // 세대수 필터
    const unitsFilter = parseUnitsFilter(units);

    // 복도 유형 필터
    const hallwayFilter = hallwayType && ['계단식', '복도식', '혼합식'].includes(hallwayType)
      ? { hallway_type: hallwayType }
      : null;

    // 최종 where 조건 구성
    const whereCondition: Prisma.apt_masterWhereInput = {
      AND: [
        searchCondition,
        ...(yearFilter ? [yearFilter] : []),
        // kapt_info 관련 필터는 include에서 처리 후 필터링
      ],
    };

    // kapt_info 필터 조건
    const kaptInfoFilter: Prisma.raw_kapt_infoWhereInput | undefined =
      (unitsFilter || hallwayFilter)
        ? {
            ...(unitsFilter ? { total_ho_cnt: unitsFilter } : {}),
            ...(hallwayFilter ? hallwayFilter : {}),
          }
        : undefined;

    // kapt_info 필터가 있으면 kapt_code가 있는 것만 조회
    if (kaptInfoFilter) {
      whereCondition.AND = [
        ...(Array.isArray(whereCondition.AND) ? whereCondition.AND : []),
        { kapt_code: { not: null } },
        { kapt_info: kaptInfoFilter },
      ];
    }

    // 총 개수 조회
    const total = await prisma.apt_master.count({
      where: whereCondition,
    });

    // 검색 결과 조회
    const apartments = await prisma.apt_master.findMany({
      where: whereCondition,
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
