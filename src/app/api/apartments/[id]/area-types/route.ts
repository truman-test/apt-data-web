import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId, CacheDuration } from '@/lib/api-response';
import type { AreaType } from '@/types/apartment';

// ㎡를 평으로 변환 (1평 = 3.3 ㎡, 호갱노노 기준 - 내림)
function sqmToPyeong(sqm: number): number {
  return Math.floor(sqm / 3.3);
}

// 그룹화된 면적 타입
interface GroupedArea {
  pyeong: number;
  exclusiveAreas: number[];
  supplyAreas: number[];
  units: number;
  ratios: number[];
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

    // apt_area_types 테이블에서 조회
    const areaTypes = await prisma.apt_area_types.findMany({
      where: { apt_id: id },
      orderBy: { supply_area: 'asc' },
    });

    if (areaTypes.length === 0) {
      return successResponse([], { cache: CacheDuration.MEDIUM });
    }

    // 공급면적 기준 평수로 그룹화
    // 전용률 100%인 세대는 제외 (오피스텔/상가 등)
    const groupMap = new Map<number, GroupedArea>();

    for (const row of areaTypes) {
      const supplyArea = Number(row.supply_area);
      const excluArea = Number(row.exclu_area);
      const ratio = row.exclu_ratio ? Number(row.exclu_ratio) : 0;

      // 전용률 95% 이상이면 오피스텔/상가로 간주하여 제외
      if (ratio >= 95) continue;

      const pyeong = sqmToPyeong(supplyArea);
      const units = row.unit_count ?? 0;

      if (groupMap.has(pyeong)) {
        const group = groupMap.get(pyeong)!;
        group.exclusiveAreas.push(excluArea);
        group.supplyAreas.push(supplyArea);
        group.units += units;
        if (ratio > 0) group.ratios.push(ratio);
      } else {
        groupMap.set(pyeong, {
          pyeong,
          exclusiveAreas: [excluArea],
          supplyAreas: [supplyArea],
          units,
          ratios: ratio > 0 ? [ratio] : [],
        });
      }
    }

    // 평형별 최근 시세 조회 (매매/전세) - 단일 쿼리로 최적화
    const priceMap = new Map<number, { tradePrice?: number; jeonsePrice?: number }>();

    // 전체 면적 범위 계산
    const allExcluAreas = Array.from(groupMap.values()).flatMap(g => g.exclusiveAreas);
    const overallMinExclu = Math.min(...allExcluAreas) - 1;
    const overallMaxExclu = Math.max(...allExcluAreas) + 1;

    // 매매/전세 데이터를 병렬로 한 번에 조회
    const [recentTrades, recentJeonse] = await Promise.all([
      prisma.raw_trades.findMany({
        where: {
          sigungu_cd: apt.sigungu_cd,
          apt_nm: apt.apt_nm,
          exclu_use_ar: { gte: overallMinExclu, lte: overallMaxExclu },
          cdeal_type: null, // 해지되지 않은 거래
        },
        orderBy: [
          { deal_year: 'desc' },
          { deal_month: 'desc' },
          { deal_day: 'desc' },
        ],
        select: { exclu_use_ar: true, deal_amount: true },
        take: 500, // 충분한 양의 최근 거래
      }),
      prisma.raw_rents.findMany({
        where: {
          sigungu_cd: apt.sigungu_cd,
          apt_nm: apt.apt_nm,
          exclu_use_ar: { gte: overallMinExclu, lte: overallMaxExclu },
          monthly_rent: 0, // 전세만
        },
        orderBy: [
          { deal_year: 'desc' },
          { deal_month: 'desc' },
          { deal_day: 'desc' },
        ],
        select: { exclu_use_ar: true, deposit: true },
        take: 500,
      }),
    ]);

    // 각 평형에 해당하는 최신 거래 매칭
    for (const [pyeong, group] of groupMap) {
      const minExclu = Math.min(...group.exclusiveAreas) - 1;
      const maxExclu = Math.max(...group.exclusiveAreas) + 1;

      // 해당 면적 범위의 첫 번째(최신) 거래 찾기
      const latestTrade = recentTrades.find(t => {
        const area = Number(t.exclu_use_ar);
        return area >= minExclu && area <= maxExclu;
      });

      const latestJeonse = recentJeonse.find(r => {
        const area = Number(r.exclu_use_ar);
        return area >= minExclu && area <= maxExclu;
      });

      priceMap.set(pyeong, {
        tradePrice: latestTrade?.deal_amount ? Number(latestTrade.deal_amount) : undefined,
        jeonsePrice: latestJeonse?.deposit ? Number(latestJeonse.deposit) : undefined,
      });
    }

    // 결과 변환 (평수 순 정렬)
    const sortedPyeongs = Array.from(groupMap.keys()).sort((a, b) => a - b);

    const result: AreaType[] = sortedPyeongs.map((pyeong, index) => {
      const group = groupMap.get(pyeong)!;
      const prices = priceMap.get(pyeong);

      const minExclu = Math.min(...group.exclusiveAreas);
      const maxExclu = Math.max(...group.exclusiveAreas);
      const minSupply = Math.min(...group.supplyAreas);
      const maxSupply = Math.max(...group.supplyAreas);
      const avgRatio = group.ratios.length > 0
        ? group.ratios.reduce((a, b) => a + b, 0) / group.ratios.length
        : undefined;

      // 소수점 버림은 UI 표시용, 원본값은 API 필터링용
      const minExcluFloor = Math.floor(minExclu);
      const maxExcluFloor = Math.floor(maxExclu);
      const minSupplyFloor = Math.floor(minSupply);
      const maxSupplyFloor = Math.floor(maxSupply);

      return {
        id: index + 1,
        aptId: id,
        pyeong,
        exclusiveArea: minExclu, // 원본값 (API 필터링용)
        exclusiveAreaMin: minExcluFloor !== maxExcluFloor ? minExclu : undefined,
        exclusiveAreaMax: minExcluFloor !== maxExcluFloor ? maxExclu : undefined,
        supplyArea: minSupply, // 원본값 (API 필터링용)
        supplyAreaMin: minSupplyFloor !== maxSupplyFloor ? minSupply : undefined,
        supplyAreaMax: minSupplyFloor !== maxSupplyFloor ? maxSupply : undefined,
        units: group.units,
        exclusiveRatio: avgRatio ? Math.round(avgRatio * 10) / 10 : undefined,
        tradePrice: prices?.tradePrice,
        jeonsePrice: prices?.jeonsePrice,
      };
    });

    return successResponse(result, { cache: CacheDuration.MEDIUM });
  } catch (error) {
    console.error('Area types API error:', error);
    return errorResponse('평형 정보 조회 중 오류가 발생했습니다', 500);
  }
}
