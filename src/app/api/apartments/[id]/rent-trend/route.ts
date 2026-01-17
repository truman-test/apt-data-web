import { NextRequest } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';

export interface RentTrend {
  date: string;
  avgDeposit: number;
  avgMonthlyRent: number;
  transactionCount: number;
}

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
    const period = searchParams.get('period') || '3y';
    const rentType = searchParams.get('rentType') || 'jeonse'; // 'jeonse' | 'monthly'
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
    let startYear = 2006;
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

    // 동적 WHERE 조건 빌드 (Prisma.sql로 안전한 파라미터 바인딩)
    const conditions = [
      Prisma.sql`sigungu_cd = ${apt.sigungu_cd}`,
      Prisma.sql`apt_nm = ${apt.apt_nm}`,
      Prisma.sql`deal_year >= ${startYear}`,
      Prisma.sql`deposit > 0`,
    ];

    // 전세/월세 조건
    if (rentType === 'monthly') {
      conditions.push(Prisma.sql`monthly_rent > 0`);
    } else {
      conditions.push(Prisma.sql`monthly_rent = 0`);
    }

    // 면적 조건 (±0.005㎡ 범위 - 근접 평형 정확 구분)
    if (area) {
      const areaNum = parseFloat(area);
      if (!isNaN(areaNum)) {
        const minArea = areaNum - 0.005;
        const maxArea = areaNum + 0.005;
        conditions.push(Prisma.sql`exclu_use_ar BETWEEN ${minArea} AND ${maxArea}`);
      }
    }

    const whereClause = Prisma.join(conditions, ' AND ');

    // Raw SQL로 월별 평균 집계 (파라미터화된 쿼리)
    const trends = await prisma.$queryRaw<
      Array<{
        deal_year: number;
        deal_month: number;
        avg_deposit: number;
        avg_monthly_rent: number;
        transaction_count: bigint;
      }>
    >(Prisma.sql`
      SELECT
        deal_year,
        deal_month,
        ROUND(AVG(deposit)) as avg_deposit,
        ROUND(AVG(monthly_rent)) as avg_monthly_rent,
        COUNT(*) as transaction_count
      FROM raw_rents
      WHERE ${whereClause}
      GROUP BY deal_year, deal_month
      ORDER BY deal_year ASC, deal_month ASC
    `);

    // 응답 형식 변환
    const result: RentTrend[] = trends.map((t) => ({
      date: `${t.deal_year}-${String(t.deal_month).padStart(2, '0')}`,
      avgDeposit: Number(t.avg_deposit),
      avgMonthlyRent: Number(t.avg_monthly_rent),
      transactionCount: Number(t.transaction_count),
    }));

    return successResponse(result);
  } catch (error) {
    console.error('Rent trend API error:', error);
    return errorResponse('전월세 시세 추이 조회 중 오류가 발생했습니다', 500);
  }
}
