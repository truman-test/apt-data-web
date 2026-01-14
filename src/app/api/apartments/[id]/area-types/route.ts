import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';
import type { AreaType } from '@/types/apartment';

// ㎡를 평으로 변환 (1평 = 3.305785 ㎡)
function sqmToPyeong(sqm: number): number {
  return Math.round(sqm / 3.305785);
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

    // apt_master에서 조인 키 조회
    const apt = await prisma.apt_master.findUnique({
      where: { apt_id: id },
      select: { sigungu_cd: true, apt_nm: true },
    });

    if (!apt) {
      return errorResponse('아파트를 찾을 수 없습니다', 404);
    }

    // 고유한 면적 목록 조회 (거래 건수와 함께)
    const areaData = await prisma.$queryRaw<
      Array<{ exclu_use_ar: number; count: bigint }>
    >`
      SELECT
        ROUND(exclu_use_ar::numeric, 2) as exclu_use_ar,
        COUNT(*) as count
      FROM raw_trades
      WHERE sigungu_cd = ${apt.sigungu_cd}
        AND apt_nm = ${apt.apt_nm}
        AND exclu_use_ar > 0
      GROUP BY ROUND(exclu_use_ar::numeric, 2)
      ORDER BY exclu_use_ar ASC
    `;

    // 평형별로 그룹화 (비슷한 면적 통합)
    const pyeongMap = new Map<number, { areas: number[]; count: number }>();

    for (const row of areaData) {
      const area = Number(row.exclu_use_ar);
      const pyeong = sqmToPyeong(area);

      if (pyeongMap.has(pyeong)) {
        const existing = pyeongMap.get(pyeong)!;
        existing.areas.push(area);
        existing.count += Number(row.count);
      } else {
        pyeongMap.set(pyeong, { areas: [area], count: Number(row.count) });
      }
    }

    // 결과 변환
    const result: AreaType[] = Array.from(pyeongMap.entries()).map(
      ([pyeong, data], index) => ({
        id: index + 1,
        aptId: id,
        exclusiveArea: data.areas[0], // 대표 면적
        supplyArea: 0, // 공급면적 데이터 없음
        pyeong,
        units: data.count, // 거래 건수로 대체
      })
    );

    return successResponse(result);
  } catch (error) {
    console.error('Area types API error:', error);
    return errorResponse('평형 정보 조회 중 오류가 발생했습니다', 500);
  }
}
