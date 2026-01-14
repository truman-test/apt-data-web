import type { apt_master, raw_trades, raw_rents, apt_nearest_station, raw_kapt_info } from '@/generated/prisma';
import type { Apartment, Trade, Rent, NearestStation } from '@/types/apartment';

// Decimal/number를 안전하게 number로 변환
function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

// apt_master + raw_kapt_info -> Apartment 변환
export function transformApartment(
  apt: apt_master & { kapt_info?: raw_kapt_info | null }
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
  };
}

// raw_trades -> Trade 변환
export function transformTrade(trade: raw_trades, aptId: number): Trade {
  const dealDay = trade.deal_day || 1;
  const dealDate = `${trade.deal_year}-${String(trade.deal_month).padStart(2, '0')}-${String(dealDay).padStart(2, '0')}`;

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
  };
}

// raw_rents -> Rent 변환
export function transformRent(rent: raw_rents, aptId: number): Rent {
  const dealDay = rent.deal_day || 1;
  const dealDate = `${rent.deal_year}-${String(rent.deal_month).padStart(2, '0')}-${String(dealDay).padStart(2, '0')}`;
  const monthlyRent = Number(rent.monthly_rent) || 0;

  return {
    id: Number(rent.id),
    aptId,
    dealDate,
    dealYear: rent.deal_year,
    dealMonth: rent.deal_month,
    exclusiveArea: toNumber(rent.exclu_use_ar),
    floor: rent.floor || 0,
    rentType: monthlyRent > 0 ? 'monthly' : 'jeonse',
    deposit: Number(rent.deposit) || 0,
    monthlyRent,
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
