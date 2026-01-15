// 아파트 단지 마스터 정보
export interface Apartment {
  id: number;
  aptName: string;
  aptCode: string;
  address: string;
  sigunguCode: string;
  sigunguName: string;
  sidoName: string;
  dongName: string;
  jibun: string;
  lat: number;
  lng: number;
  totalUnits: number; // 총 세대수
  totalBuildings: number; // 총 동수
  constructedYear: number; // 준공년도
  constructedMonth: number;
}

// 평형별 정보
export interface AreaType {
  id: number;
  aptId: number;
  exclusiveArea: number; // 전용면적 (㎡)
  supplyArea: number; // 공급면적 (㎡)
  pyeong: number; // 평수
  units: number; // 해당 평형 세대수
}

// 매매 실거래가
export interface Trade {
  id: number;
  aptId: number;
  dealDate: string; // YYYY-MM-DD
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  exclusiveArea: number;
  floor: number;
  dealAmount: number; // 만원 단위
}

// 전월세 실거래가
export interface Rent {
  id: number;
  aptId: number;
  dealDate: string;
  dealYear: number;
  dealMonth: number;
  exclusiveArea: number;
  floor: number;
  rentType: 'jeonse' | 'monthly'; // 전세 | 월세
  deposit: number; // 보증금 (만원)
  monthlyRent: number; // 월세 (만원, 전세는 0)
}

// 최근접 지하철역
export interface NearestStation {
  aptId: number;
  stationName: string;
  lineName: string;
  distance: number; // 미터
  walkingMinutes: number; // 도보 시간
}

// 최근접 학교
export interface NearestSchool {
  aptId: number;
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high';
  distance: number;
  walkingMinutes: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// 검색 결과
export interface SearchResult {
  apartments: Apartment[];
  total: number;
}

// 시세 통계
export interface PriceStats {
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  pricePerPyeong: number;
  transactionCount: number;
  period: string;
}

// 가격 추이 데이터 포인트
export interface PriceTrend {
  date: string;
  avgPrice: number;
  transactionCount: number;
}

// 전월세 추이 데이터 포인트
export interface RentTrend {
  date: string;
  avgDeposit: number;
  avgMonthlyRent: number;
  transactionCount: number;
}

// 자동완성 아이템
export interface AutocompleteItem {
  id: number;
  aptName: string;
  dongName: string;
  displayName: string; // "동이름 아파트명" 형식
  sidoName: string;
  sigunguName: string;
}
