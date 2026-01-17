/**
 * 공통 포맷팅 유틸리티 함수
 * 가격, 면적 등 부동산 데이터 포맷팅
 */

/**
 * 가격 포맷 (억/만원 단위)
 * @example formatPrice(35000) => "3억 5,000"
 * @example formatPrice(8500) => "8,500만"
 * @example formatPrice(50000) => "5억"
 */
export function formatPrice(value: number): string {
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const man = Math.round((value % 10000) / 1000) * 1000;
    if (man === 0) return `${eok}억`;
    return `${eok}억 ${man.toLocaleString()}`;
  }
  return `${value.toLocaleString()}만`;
}

/**
 * 차트용 간단 가격 포맷
 * @example formatChartPrice(35000) => "3.5억"
 * @example formatChartPrice(8500) => "9천"
 */
export function formatChartPrice(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}억`;
  }
  return `${(value / 1000).toFixed(0)}천`;
}

/**
 * 지도/마커용 간단 가격 포맷
 * @example formatCompactPrice(35000) => "3.5억"
 * @example formatCompactPrice(8500) => "9천"
 */
export function formatCompactPrice(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}억`;
  }
  return `${(value / 1000).toFixed(0)}천`;
}

/**
 * 공급면적을 평으로 변환 (호갱노노 기준: 1평 = 3.3㎡, 소수점 버림)
 * @example toPyeong(84.5) => 25
 */
export function toPyeong(sqm: number): number {
  return Math.floor(sqm / 3.3);
}

/**
 * 면적 범위 포맷 (호갱노노 기준: 소수점 버림)
 * @example formatAreaRange(84.1, 84.9, 84.5) => "84㎡" (같은 정수)
 * @example formatAreaRange(59.5, 62.3, 60) => "59~62㎡" (다른 정수)
 */
export function formatAreaRange(min?: number, max?: number, value?: number): string {
  if (min !== undefined && max !== undefined) {
    const minFloor = Math.floor(min);
    const maxFloor = Math.floor(max);
    if (minFloor !== maxFloor) {
      return `${minFloor}~${maxFloor}㎡`;
    }
  }
  return `${Math.floor(value || 0)}㎡`;
}

/**
 * 면적을 정수로 포맷
 * @example formatArea(84.5) => "84㎡"
 */
export function formatArea(sqm: number): string {
  return `${Math.floor(sqm)}㎡`;
}
