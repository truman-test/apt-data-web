import { useQuery } from '@tanstack/react-query';
import {
  getApartment,
  getAreaTypes,
  getTrades,
  getRents,
  getPriceTrend,
  getRentTrend,
  getNearestStation,
  searchApartments,
} from '@/services/api';

export function useApartment(id: number) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => getApartment(id),
    enabled: !!id,
  });
}

export function useAreaTypes(aptId: number) {
  return useQuery({
    queryKey: ['areaTypes', aptId],
    queryFn: () => getAreaTypes(aptId),
    enabled: !!aptId,
  });
}

export function useTrades(
  aptId: number,
  options?: { startDate?: string; endDate?: string; area?: number }
) {
  return useQuery({
    queryKey: ['trades', aptId, options],
    queryFn: () => getTrades(aptId, options),
    enabled: !!aptId,
  });
}

export function useRents(
  aptId: number,
  options?: { startDate?: string; endDate?: string; rentType?: 'jeonse' | 'monthly' }
) {
  return useQuery({
    queryKey: ['rents', aptId, options],
    queryFn: () => getRents(aptId, options),
    enabled: !!aptId,
  });
}

export function usePriceTrend(
  aptId: number,
  options?: { area?: number; period?: '1y' | '3y' | '5y' | 'all' }
) {
  return useQuery({
    queryKey: ['priceTrend', aptId, options],
    queryFn: () => getPriceTrend(aptId, options),
    enabled: !!aptId,
  });
}

export function useRentTrend(
  aptId: number,
  options?: { area?: number; period?: '1y' | '3y' | '5y' | 'all'; rentType?: 'jeonse' | 'monthly' }
) {
  return useQuery({
    queryKey: ['rentTrend', aptId, options],
    queryFn: () => getRentTrend(aptId, options),
    enabled: !!aptId,
  });
}

export function useNearestStation(aptId: number) {
  return useQuery({
    queryKey: ['nearestStation', aptId],
    queryFn: () => getNearestStation(aptId),
    enabled: !!aptId,
  });
}

export function useSearchApartments(query: string, options?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['searchApartments', query, options],
    queryFn: () => searchApartments(query, options),
    enabled: query.length >= 2,
  });
}
