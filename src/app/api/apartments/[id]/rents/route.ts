import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { successResponse, errorResponse, validateId, validatePagination, CacheDuration } from '@/lib/api-response';
import { transformRent, AreaMapping } from '@/lib/transformers';

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

    const { searchParams } = new URL(request.url);
    const { page, limit } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    );
    const rentType = searchParams.get('rentType'); // 'jeonse' | 'monthly'
    const areaParam = searchParams.get('area');
    const area = areaParam ? parseFloat(areaParam) : null;
    const startYear = parseInt(searchParams.get('startYear') || '2020', 10);
    const endYear = parseInt(searchParams.get('endYear') || new Date().getFullYear().toString(), 10);

    // apt_master에서 조인 키 조회
    const apt = await prisma.apt_master.findUnique({
      where: { apt_id: id },
      select: { sigungu_cd: true, apt_nm: true },
    });

    if (!apt) {
      return errorResponse('아파트를 찾을 수 없습니다', 404);
    }

    // apt_area_types에서 면적 매핑 조회
    const areaTypes = await prisma.apt_area_types.findMany({
      where: { apt_id: id },
    });
    const areaMap: AreaMapping[] = areaTypes.map((a) => ({
      excluArea: Number(a.exclu_area),
      supplyArea: Number(a.supply_area),
      excluRatio: a.exclu_ratio ? Number(a.exclu_ratio) : null,
    }));

    // 조건 구성
    const whereClause: Prisma.raw_rentsWhereInput = {
      sigungu_cd: apt.sigungu_cd,
      apt_nm: apt.apt_nm,
      deal_year: { gte: startYear, lte: endYear },
    };

    // 전세/월세 필터
    if (rentType === 'jeonse') {
      whereClause.monthly_rent = 0;
    } else if (rentType === 'monthly') {
      whereClause.monthly_rent = { gt: 0 };
    }

    // 면적 필터 (±0.005㎡ 범위 - 근접 평형 정확 구분)
    if (area) {
      whereClause.exclu_use_ar = {
        gte: area - 0.005,
        lte: area + 0.005,
      };
    }

    // 총 개수
    const total = await prisma.raw_rents.count({ where: whereClause });

    // 전월세 내역 조회
    const rents = await prisma.raw_rents.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { deal_year: 'desc' },
        { deal_month: 'desc' },
        { deal_day: 'desc' },
      ],
    });

    return successResponse(
      rents.map((r) => transformRent(r, id, areaMap)),
      { meta: { total, page, limit }, cache: CacheDuration.MEDIUM }
    );
  } catch (error) {
    console.error('Rents API error:', error);
    return errorResponse('전월세 내역 조회 중 오류가 발생했습니다', 500);
  }
}
