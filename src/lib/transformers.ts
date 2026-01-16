import type { apt_master, raw_trades, raw_rents, apt_nearest_station, raw_kapt_info, raw_kapt_detail } from '@/generated/prisma';
import type { Apartment, Trade, Rent, NearestStation, KaptInfo, KaptDetail } from '@/types/apartment';

// Decimal/number를 안전하게 number로 변환
function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

// raw_kapt_info -> KaptInfo 변환
function transformKaptInfo(info: raw_kapt_info | null | undefined): KaptInfo | undefined {
  if (!info) return undefined;
  return {
    hallwayType: info.hallway_type || undefined,
    heatType: info.heat_type || undefined,
    manageType: info.manage_type || undefined,
    buildCompany: info.kapt_bcompany || undefined,
    topFloor: info.kapt_top_floor || undefined,
    baseFloor: info.kapt_base_floor || undefined,
    totalArea: info.kapt_tarea || undefined,
    buildingArea: info.kapt_marea || undefined,
    useDate: info.kapt_usedate || undefined,
    unitsByArea: {
      under60: info.kapt_mparea_60 || 0,
      under85: info.kapt_mparea_85 || 0,
      under135: info.kapt_mparea_135 || 0,
      over135: info.kapt_mparea_136 || 0,
    },
  };
}

// raw_kapt_detail -> KaptDetail 변환
function transformKaptDetail(detail: raw_kapt_detail | null | undefined): KaptDetail | undefined {
  if (!detail) return undefined;
  return {
    parkingTotal: (detail.kaptd_pcnt || 0) + (detail.kaptd_pcntu || 0),
    parkingGround: detail.kaptd_pcnt || undefined,
    parkingUnderground: detail.kaptd_pcntu || undefined,
    elevatorCount: detail.kaptd_ecnt || undefined,
    cctvCount: detail.kaptd_cccnt || undefined,
    evChargerGround: detail.ground_el_charger_cnt || undefined,
    evChargerUnderground: detail.underground_el_charger_cnt || undefined,
    managementCompany: detail.kapt_ccompany || undefined,
    managementCount: detail.kapt_mgr_cnt || undefined,
    securityCount: detail.kaptd_scnt || undefined,
    cleaningCount: detail.kaptd_clcnt || undefined,
    subwayLine: detail.subway_line || undefined,
    subwayStation: detail.subway_station || undefined,
    subwayWalkTime: detail.kaptd_wtime_sub || undefined,
    busWalkTime: detail.kaptd_wtime_bus || undefined,
    welfareFacility: detail.welfare_facility || undefined,
    convenientFacility: detail.convenient_facility || undefined,
    educationFacility: detail.education_facility || undefined,
  };
}

// apt_master + raw_kapt_info + raw_kapt_detail -> Apartment 변환
export function transformApartment(
  apt: apt_master & { kapt_info?: raw_kapt_info | null; kapt_detail?: raw_kapt_detail | null }
): Apartment {
  return {
    id: apt.apt_id,
    aptName: apt.apt_nm,
    aptCode: apt.kapt_code || '',
    address: [apt.sido, apt.sigungu, apt.umd_nm, apt.jibun].filter(Boolean).join(' '),
    sigunguCode: apt.sigungu_cd,
    sigunguName: apt.sigungu || '',
    sidoName: apt.sido || '',
    dongName: apt.umd_nm,
    jibun: apt.jibun || '',
    lat: toNumber(apt.lat),
    lng: toNumber(apt.lng),
    totalUnits: apt.kapt_info?.total_unit_cnt || apt.kapt_info?.total_ho_cnt || 0,
    totalBuildings: apt.kapt_info?.total_dong_cnt || 0,
    constructedYear: apt.build_year || 0,
    constructedMonth: 0,
    kaptInfo: transformKaptInfo(apt.kapt_info),
    kaptDetail: transformKaptDetail(apt.kapt_detail),
  };
}

// raw_trades -> Trade 변환
export function transformTrade(trade: raw_trades, aptId: number): Trade {
  const dealDay = trade.deal_day || 1;
  const dealDate = `${trade.deal_year}-${String(trade.deal_month).padStart(2, '0')}-${String(dealDay).padStart(2, '0')}`;

  // 해지 여부 확인 (cdeal_type이 '해제' 또는 cdeal_day가 있으면 해지)
  const isCanceled = trade.cdeal_type === '해제' || !!trade.cdeal_day;

  // 거래 방식 (직거래/중개거래)
  const dealingType = trade.dealing_gbn === '직거래' ? 'direct' : trade.dealing_gbn === '중개거래' ? 'agent' : undefined;

  return {
    id: Number(trade.id),
    aptId,
    dealDate,
    dealYear: trade.deal_year,
    dealMonth: trade.deal_month,
    dealDay,
    exclusiveArea: toNumber(trade.exclu_use_ar),
    floor: trade.floor || 0,
    dealAmount: Number(trade.deal_amount) || 0,
    isCanceled,
    cancelDate: trade.cdeal_day || undefined,
    dealingType,
  };
}

// raw_rents -> Rent 변환
export function transformRent(rent: raw_rents, aptId: number): Rent {
  const dealDay = rent.deal_day || 1;
  const dealDate = `${rent.deal_year}-${String(rent.deal_month).padStart(2, '0')}-${String(dealDay).padStart(2, '0')}`;
  const monthlyRent = Number(rent.monthly_rent) || 0;
  const deposit = Number(rent.deposit) || 0;

  // 계약 유형 (신규/갱신)
  const contractType = rent.contract_type === '갱신' ? 'renewal' : rent.contract_type === '신규' ? 'new' : undefined;

  // 계약 기간
  const contractPeriod = rent.contract_period || undefined;

  // 갱신요구권 사용 여부
  const useRenewalRight = rent.use_rr_right === '사용';

  // 종전 계약 정보
  const prevDeposit = rent.prev_deposit ? Number(rent.prev_deposit) : undefined;
  const prevMonthlyRent = rent.prev_monthly_rent ? Number(rent.prev_monthly_rent) : undefined;

  // 보증금 증감 계산 (갱신 계약 + 종전 보증금이 있을 때만)
  let depositChange: number | undefined;
  let depositChangeRate: number | undefined;
  if (contractType === 'renewal' && prevDeposit !== undefined && prevDeposit > 0) {
    depositChange = deposit - prevDeposit;
    depositChangeRate = Math.round((depositChange / prevDeposit) * 1000) / 10; // 소수점 1자리
  }

  return {
    id: Number(rent.id),
    aptId,
    dealDate,
    dealYear: rent.deal_year,
    dealMonth: rent.deal_month,
    exclusiveArea: toNumber(rent.exclu_use_ar),
    floor: rent.floor || 0,
    rentType: monthlyRent > 0 ? 'monthly' : 'jeonse',
    deposit,
    monthlyRent,
    contractType,
    contractPeriod,
    useRenewalRight,
    prevDeposit,
    prevMonthlyRent,
    depositChange,
    depositChangeRate,
  };
}

// apt_nearest_station -> NearestStation 변환
export function transformNearestStation(station: apt_nearest_station): NearestStation {
  const distance = toNumber(station.distance_m);
  // 도보 속도 약 80m/분 기준
  const walkingMinutes = distance > 0 ? Math.ceil(distance / 80) : 0;

  return {
    aptId: station.apt_id,
    stationName: station.station_name || '',
    lineName: station.line_name || '',
    distance,
    walkingMinutes,
  };
}
