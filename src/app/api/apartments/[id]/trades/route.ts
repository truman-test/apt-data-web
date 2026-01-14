import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { successResponse, errorResponse, validateId, validatePagination } from '@/lib/api-response';
import { transformTrade } from '@/lib/transformers';

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
    const area = searchParams.get('area');
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

    // 조건 구성
    const whereClause: Prisma.raw_tradesWhereInput = {
      sigungu_cd: apt.sigungu_cd,
      apt_nm: apt.apt_nm,
      deal_year: { gte: startYear, lte: endYear },
    };

    // 면적 필터 (±1㎡ 범위)
    if (area) {
      const areaNum = parseFloat(area);
      if (!isNaN(areaNum)) {
        whereClause.exclu_use_ar = { gte: areaNum - 1, lte: areaNum + 1 };
      }
    }

    // 총 개수
    const total = await prisma.raw_trades.count({ where: whereClause });

    // 거래 내역 조회
    const trades = await prisma.raw_trades.findMany({
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
      trades.map((t) => transformTrade(t, id)),
      { total, page, limit }
    );
  } catch (error) {
    console.error('Trades API error:', error);
    return errorResponse('거래 내역 조회 중 오류가 발생했습니다', 500);
  }
}
