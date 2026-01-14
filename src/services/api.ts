import type {
  Apartment,
  AreaType,
  Trade,
  Rent,
  NearestStation,
  ApiResponse,
  PriceTrend,
  RentTrend,
} from '@/types/apartment';

// Next.js Route Handlers 사용 (내부 API)
const API_URL = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 단지 검색
export async function searchApartments(
  query: string,
  options?: { page?: number; limit?: number }
): Promise<ApiResponse<Apartment[]>> {
  const params = new URLSearchParams({
    q: query,
    page: String(options?.page || 1),
    limit: String(options?.limit || 20),
  });
  return fetchApi(`/apartments/search?${params}`);
}

// 단지 상세 정보
export async function getApartment(id: number): Promise<ApiResponse<Apartment>> {
  return fetchApi(`/apartments/${id}`);
}

// 단지별 평형 정보
export async function getAreaTypes(aptId: number): Promise<ApiResponse<AreaType[]>> {
  return fetchApi(`/apartments/${aptId}/area-types`);
}

// 매매 실거래가 조회
export async function getTrades(
  aptId: number,
  options?: { startDate?: string; endDate?: string; area?: number }
): Promise<ApiResponse<Trade[]>> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.area) params.append('area', String(options.area));
  return fetchApi(`/apartments/${aptId}/trades?${params}`);
}

// 전월세 실거래가 조회
export async function getRents(
  aptId: number,
  options?: { startDate?: string; endDate?: string; rentType?: 'jeonse' | 'monthly' }
): Promise<ApiResponse<Rent[]>> {
  const params = new URLSearchParams();
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.rentType) params.append('rentType', options.rentType);
  return fetchApi(`/apartments/${aptId}/rents?${params}`);
}

// 가격 추이
export async function getPriceTrend(
  aptId: number,
  options?: { area?: number; period?: '1y' | '3y' | '5y' | 'all' }
): Promise<ApiResponse<PriceTrend[]>> {
  const params = new URLSearchParams();
  if (options?.area) params.append('area', String(options.area));
  if (options?.period) params.append('period', options.period);
  return fetchApi(`/apartments/${aptId}/price-trend?${params}`);
}

// 전월세 추이
export async function getRentTrend(
  aptId: number,
  options?: { area?: number; period?: '1y' | '3y' | '5y' | 'all'; rentType?: 'jeonse' | 'monthly' }
): Promise<ApiResponse<RentTrend[]>> {
  const params = new URLSearchParams();
  if (options?.area) params.append('area', String(options.area));
  if (options?.period) params.append('period', options.period);
  if (options?.rentType) params.append('rentType', options.rentType);
  return fetchApi(`/apartments/${aptId}/rent-trend?${params}`);
}

// 최근접 지하철역
export async function getNearestStation(aptId: number): Promise<ApiResponse<NearestStation>> {
  return fetchApi(`/apartments/${aptId}/nearest-station`);
}

// 지역별 단지 목록 (지도용)
export async function getApartmentsByBounds(bounds: {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}): Promise<ApiResponse<Apartment[]>> {
  const params = new URLSearchParams({
    swLat: String(bounds.sw.lat),
    swLng: String(bounds.sw.lng),
    neLat: String(bounds.ne.lat),
    neLng: String(bounds.ne.lng),
  });
  return fetchApi(`/apartments/by-bounds?${params}`);
}
