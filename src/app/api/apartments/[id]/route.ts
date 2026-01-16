import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';
import { transformApartment } from '@/lib/transformers';

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

    const apartment = await prisma.apt_master.findUnique({
      where: { apt_id: id },
      include: {
        kapt_info: true,
        kapt_detail: true,
        nearest_station: true,
      },
    });

    if (!apartment) {
      return errorResponse('아파트를 찾을 수 없습니다', 404);
    }

    return successResponse(transformApartment(apartment));
  } catch (error) {
    console.error('Apartment detail API error:', error);
    return errorResponse('조회 중 오류가 발생했습니다', 500);
  }
}
