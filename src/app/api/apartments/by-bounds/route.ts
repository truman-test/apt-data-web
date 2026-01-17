import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateBounds, CacheDuration } from '@/lib/api-response';
import { transformApartmentForMap } from '@/lib/transformers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = validateBounds(searchParams);

    if (!bounds) {
      return errorResponse('유효하지 않은 좌표입니다. swLat, swLng, neLat, neLng가 필요합니다', 400);
    }

    const { swLat, swLng, neLat, neLng } = bounds;

    // 지도 영역 내 아파트 조회 (필수 필드만 select, 최대 1000개)
    const apartments = await prisma.apt_master.findMany({
      where: {
        lat: { gte: swLat, lte: neLat },
        lng: { gte: swLng, lte: neLng },
        NOT: [
          { lat: null },
          { lng: null },
        ],
      },
      select: {
        apt_id: true,
        apt_nm: true,
        sido: true,
        sigungu: true,
        umd_nm: true,
        lat: true,
        lng: true,
        build_year: true,
        kapt_info: {
          select: { total_unit_cnt: true },
        },
      },
      take: 1000, // 성능 제한
      orderBy: { trade_count: 'desc' }, // 거래량 많은 순 우선
    });

    // 경량 변환 (kapt_info에서 세대수 추출)
    const result = apartments.map((apt) => transformApartmentForMap({
      ...apt,
      total_units: apt.kapt_info?.total_unit_cnt || 0,
    }));

    return successResponse(result, { cache: CacheDuration.SHORT });
  } catch (error) {
    console.error('By-bounds API error:', error);
    return errorResponse('지도 영역 조회 중 오류가 발생했습니다', 500);
  }
}
