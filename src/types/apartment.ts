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
  // K-apt 기본정보
  kaptInfo?: KaptInfo;
  // K-apt 상세정보
  kaptDetail?: KaptDetail;
}

// K-apt 기본정보
export interface KaptInfo {
  hallwayType?: string; // 복도유형 (계단식/복도식/혼합식)
  heatType?: string; // 난방방식
  manageType?: string; // 관리방식
  buildCompany?: string; // 시공사
  topFloor?: number; // 최고층
  baseFloor?: number; // 지하층수
  totalArea?: number; // 대지면적
  buildingArea?: number; // 건축면적
  useDate?: string; // 사용승인일
  // 면적별 세대수
  unitsByArea?: {
    under60: number; // 60㎡ 이하
    under85: number; // 60~85㎡
    under135: number; // 85~135㎡
    over135: number; // 135㎡ 초과
  };
}

// K-apt 상세정보
export interface KaptDetail {
  // 주차
  parkingTotal?: number; // 총 주차대수
  parkingGround?: number; // 지상 주차대수
  parkingUnderground?: number; // 지하 주차대수
  // 엘리베이터
  elevatorCount?: number; // 엘리베이터 수
  // CCTV
  cctvCount?: number; // CCTV 수
  // 전기차 충전
  evChargerGround?: number; // 지상 전기차 충전기
  evChargerUnderground?: number; // 지하 전기차 충전기
  // 관리
  managementCompany?: string; // 관리업체
  managementCount?: number; // 관리인원
  securityCount?: number; // 경비원 수
  cleaningCount?: number; // 청소원 수
  // 교통
  subwayLine?: string; // 지하철 노선
  subwayStation?: string; // 지하철역
  subwayWalkTime?: string; // 지하철 도보시간
  busWalkTime?: string; // 버스정류장 도보시간
  // 시설
  welfareFacility?: string; // 복지시설
  convenientFacility?: string; // 편의시설
  educationFacility?: string; // 교육시설
}

// 평형별 정보 (호갱노노 스타일 - 공급면적 기준 그룹화)
export interface AreaType {
  id: number;
  aptId: number;
  pyeong: number; // 평수 (공급면적 기준)
  exclusiveArea: number; // 전용면적 대표값 (㎡)
  exclusiveAreaMin?: number; // 전용면적 최소 (범위 표시용)
  exclusiveAreaMax?: number; // 전용면적 최대
  supplyArea: number; // 공급면적 대표값 (㎡)
  supplyAreaMin?: number; // 공급면적 최소
  supplyAreaMax?: number; // 공급면적 최대
  units: number; // 해당 평형 세대수 합계
  exclusiveRatio?: number; // 전용률 (%)
  // 시세 정보
  tradePrice?: number; // 최근 매매가 (만원)
  jeonsePrice?: number; // 최근 전세가 (만원)
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
  supplyArea?: number; // 공급면적 (㎡)
  exclusiveRatio?: number; // 전용률 (%)
  floor: number;
  dealAmount: number; // 만원 단위
  // 거래 상태
  isCanceled: boolean; // 해지 여부
  cancelDate?: string; // 해지일
  // 거래 방식
  dealingType?: 'direct' | 'agent'; // 직거래 | 중개거래
}

// 전월세 실거래가
export interface Rent {
  id: number;
  aptId: number;
  dealDate: string;
  dealYear: number;
  dealMonth: number;
  exclusiveArea: number;
  supplyArea?: number; // 공급면적 (㎡)
  exclusiveRatio?: number; // 전용률 (%)
  floor: number;
  rentType: 'jeonse' | 'monthly'; // 전세 | 월세
  deposit: number; // 보증금 (만원)
  monthlyRent: number; // 월세 (만원, 전세는 0)
  // 계약 정보
  contractType?: 'new' | 'renewal'; // 신규 | 갱신
  contractPeriod?: string; // 계약기간 (예: "24개월")
  useRenewalRight?: boolean; // 갱신요구권 사용 여부
  // 종전 계약 정보 (갱신 시)
  prevDeposit?: number; // 종전 보증금
  prevMonthlyRent?: number; // 종전 월세
  // 증감 정보 (계산된 값)
  depositChange?: number; // 보증금 증감액
  depositChangeRate?: number; // 보증금 증감률 (%)
}

// 최근접 지하철역
export interface NearestStation {
  aptId: number;
  stationName: string;
  lineName: string;
  distance: number; // 미터
  walkingMinutes: number; // 도보 시간
}

// 학교 정보
export interface SchoolItem {
  schoolName: string;
  schoolType: 'elementary' | 'middle' | 'high';
  schoolKind?: string; // 공립/사립
  distance: number; // 미터
  walkingMinutes: number; // 도보 시간
  studentCount?: number;
  isAssigned?: boolean; // 배정 학교 여부
}

// 학군 정보 (배정 + 주변)
export interface SchoolInfo {
  assignedElementary?: SchoolItem; // 배정 초등학교
  middleZoneName?: string; // 중학군명
  nearbyMiddle: SchoolItem[]; // 가까운 중학교
  nearbyHigh: SchoolItem[]; // 가까운 고등학교
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

// 검색 필터 옵션
export interface SearchFilters {
  yearBuilt?: '~1990' | '1990s' | '2000s' | '2010s' | '2020~';
  units?: '~100' | '100~300' | '300~500' | '500~1000' | '1000~2000' | '2000~';
  hallwayType?: '계단식' | '복도식' | '혼합식';
}
