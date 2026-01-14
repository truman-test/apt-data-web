import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';
import type { PriceTrend } from '@/types/apartment';

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
    const period = searchParams.get('period') || '3y'; // 1y, 3y, 5y, all
    const area = searchParams.get('area');

    // apt_master에서 조인 키 조회
    const apt = await prisma.apt_master.findUnique({
      where: { apt_id: id },
      select: { sigungu_cd: true, apt_nm: true },
    });

    if (!apt) {
      return errorResponse('아파트를 찾을 수 없습니다', 404);
    }

    // 기간 계산
    const currentYear = new Date().getFullYear();
    let startYear = 2006; // 데이터 시작년도
    switch (period) {
      case '1y':
        startYear = currentYear - 1;
        break;
      case '3y':
        startYear = currentYear - 3;
        break;
      case '5y':
        startYear = currentYear - 5;
        break;
      case 'all':
      default:
        startYear = 2006;
    }

    // 면적 조건
    let areaCondition = '';
    if (area) {
      const areaNum = parseFloat(area);
      if (!isNaN(areaNum)) {
        areaCondition = `AND exclu_use_ar BETWEEN ${areaNum - 1} AND ${areaNum + 1}`;
      }
    }

    // Raw SQL로 월별 평균가 집계
    const trends = await prisma.$queryRawUnsafe<
      Array<{ deal_year: number; deal_month: number; avg_price: number; transaction_count: bigint }>
    >(`
      SELECT
        deal_year,
        deal_month,
        ROUND(AVG(deal_amount)) as avg_price,
        COUNT(*) as transaction_count
      FROM raw_trades
      WHERE sigungu_cd = $1
        AND apt_nm = $2
        AND deal_year >= $3
        AND deal_amount > 0
        ${areaCondition}
      GROUP BY deal_year, deal_month
      ORDER BY deal_year ASC, deal_month ASC
    `, apt.sigungu_cd, apt.apt_nm, startYear);

    // 응답 형식 변환
    const result: PriceTrend[] = trends.map((t) => ({
      date: `${t.deal_year}-${String(t.deal_month).padStart(2, '0')}`,
      avgPrice: Number(t.avg_price),
      transactionCount: Number(t.transaction_count),
    }));

    return successResponse(result);
  } catch (error) {
    console.error('Price trend API error:', error);
    return errorResponse('가격 추이 조회 중 오류가 발생했습니다', 500);
  }
}
