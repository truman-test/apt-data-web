import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, validateId } from '@/lib/api-response';
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
      return successResponse([]);
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

    // 평형별 최근 시세 조회 (매매/전세)
    const pyeongList = Array.from(groupMap.keys());
    const priceMap = new Map<number, { tradePrice?: number; jeonsePrice?: number }>();

    // 각 평형별로 시세 조회
    for (const [pyeong, group] of groupMap) {
      const minExclu = Math.min(...group.exclusiveAreas);
      const maxExclu = Math.max(...group.exclusiveAreas);

      // 최근 매매가 조회
      const latestTrade = await prisma.raw_trades.findFirst({
        where: {
          sigungu_cd: apt.sigungu_cd,
          apt_nm: apt.apt_nm,
          exclu_use_ar: { gte: minExclu - 1, lte: maxExclu + 1 },
          cdeal_type: null, // 해지되지 않은 거래
        },
        orderBy: [
          { deal_year: 'desc' },
          { deal_month: 'desc' },
          { deal_day: 'desc' },
        ],
        select: { deal_amount: true },
      });

      // 최근 전세가 조회
      const latestJeonse = await prisma.raw_rents.findFirst({
        where: {
          sigungu_cd: apt.sigungu_cd,
          apt_nm: apt.apt_nm,
          exclu_use_ar: { gte: minExclu - 1, lte: maxExclu + 1 },
          monthly_rent: 0, // 전세만
        },
        orderBy: [
          { deal_year: 'desc' },
          { deal_month: 'desc' },
          { deal_day: 'desc' },
        ],
        select: { deposit: true },
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

      // 소수점 버림 후 비교 (호갱노노 기준)
      const minExcluFloor = Math.floor(minExclu);
      const maxExcluFloor = Math.floor(maxExclu);
      const minSupplyFloor = Math.floor(minSupply);
      const maxSupplyFloor = Math.floor(maxSupply);

      return {
        id: index + 1,
        aptId: id,
        pyeong,
        exclusiveArea: minExcluFloor, // 대표값 (소수점 버림)
        exclusiveAreaMin: minExcluFloor !== maxExcluFloor ? minExclu : undefined,
        exclusiveAreaMax: minExcluFloor !== maxExcluFloor ? maxExclu : undefined,
        supplyArea: minSupplyFloor, // 대표값 (소수점 버림)
        supplyAreaMin: minSupplyFloor !== maxSupplyFloor ? minSupply : undefined,
        supplyAreaMax: minSupplyFloor !== maxSupplyFloor ? maxSupply : undefined,
        units: group.units,
        exclusiveRatio: avgRatio ? Math.round(avgRatio * 10) / 10 : undefined,
        tradePrice: prices?.tradePrice,
        jeonsePrice: prices?.jeonsePrice,
      };
    });

    return successResponse(result);
  } catch (error) {
    console.error('Area types API error:', error);
    return errorResponse('평형 정보 조회 중 오류가 발생했습니다', 500);
  }
}
