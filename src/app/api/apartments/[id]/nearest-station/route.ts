import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';
import { transformNearestStation } from '@/lib/transformers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = validateId(idParam);

    if (!id) {
      return errorResponse('유효하지 않은 아파트 ID입니다', 400);
    }

    const station = await prisma.apt_nearest_station.findUnique({
      where: { apt_id: id },
    });

    if (!station) {
      return successResponse(null);
    }

    return successResponse(transformNearestStation(station));
  } catch (error) {
    console.error('Nearest station API error:', error);
    return errorResponse('지하철역 정보 조회 중 오류가 발생했습니다', 500);
  }
}
