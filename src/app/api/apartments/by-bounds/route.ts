import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateBounds } from '@/lib/api-response';
import { transformApartment } from '@/lib/transformers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = validateBounds(searchParams);

    if (!bounds) {
      return errorResponse('유효하지 않은 좌표입니다. swLat, swLng, neLat, neLng가 필요합니다', 400);
    }

    const { swLat, swLng, neLat, neLng } = bounds;

    // 지도 영역 내 아파트 조회 (최대 1000개)
    const apartments = await prisma.apt_master.findMany({
      where: {
        lat: { gte: swLat, lte: neLat },
        lng: { gte: swLng, lte: neLng },
        NOT: [
          { lat: null },
          { lng: null },
        ],
      },
      include: {
        kapt_info: true,
      },
      take: 1000, // 성능 제한
      orderBy: { trade_count: 'desc' }, // 거래량 많은 순 우선
    });

    return successResponse(apartments.map(transformApartment));
  } catch (error) {
    console.error('By-bounds API error:', error);
    return errorResponse('지도 영역 조회 중 오류가 발생했습니다', 500);
  }
}
