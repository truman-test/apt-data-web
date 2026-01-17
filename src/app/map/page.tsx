'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import MapProvider from '@/components/map/MapProvider';
import NaverMap from '@/components/map/NaverMap';
import { getApartmentsByBounds } from '@/services/api';
import type { ApartmentMapItem } from '@/lib/transformers';

// 주요 지역 좌표
const REGIONS = [
  { name: '서울', lat: 37.5665, lng: 126.978, zoom: 11 },
  { name: '강남', lat: 37.4979, lng: 127.0276, zoom: 14 },
  { name: '분당', lat: 37.3595, lng: 127.1086, zoom: 13 },
  { name: '부산', lat: 35.1796, lng: 129.0756, zoom: 11 },
  { name: '대구', lat: 35.8714, lng: 128.6014, zoom: 11 },
  { name: '인천', lat: 37.4563, lng: 126.7052, zoom: 11 },
];

export default function MapPage() {
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [center, setCenter] = useState(REGIONS[0]);
  const [apartments, setApartments] = useState<ApartmentMapItem[]>([]);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const [selectedApt, setSelectedApt] = useState<ApartmentMapItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 지도 영역 내 아파트 조회
  const loadApartments = useCallback(async (mapInstance: naver.maps.Map) => {
    const bounds = mapInstance.getBounds() as naver.maps.LatLngBounds;
    const sw = bounds.getSW();
    const ne = bounds.getNE();

    setIsLoading(true);
    try {
      const response = await getApartmentsByBounds({
        sw: { lat: sw.lat(), lng: sw.lng() },
        ne: { lat: ne.lat(), lng: ne.lng() },
      });
      setApartments(response.data || []);
    } catch (error) {
      console.error('Failed to load apartments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));

    // 새 마커 생성
    const newMarkers = apartments
      .filter((apt) => apt.lat && apt.lng)
      .slice(0, 500) // 성능을 위해 최대 500개
      .map((apt) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(apt.lat, apt.lng),
          map,
          title: apt.aptName,
          clickable: true,
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedApt(apt);
        });

        return marker;
      });

    markersRef.current = newMarkers;

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, apartments]);

  // 지도 이벤트 핸들러
  const handleMapReady = useCallback(
    (mapInstance: naver.maps.Map) => {
      setMap(mapInstance);
      loadApartments(mapInstance);

      // 지도 이동 완료 시 데이터 다시 로드
      naver.maps.Event.addListener(mapInstance, 'idle', () => {
        loadApartments(mapInstance);
      });
    },
    [loadApartments]
  );

  // 지역 선택
  const handleRegionSelect = (region: (typeof REGIONS)[0]) => {
    setCenter(region);
    setSelectedApt(null);
    if (map) {
      map.setCenter(new naver.maps.LatLng(region.lat, region.lng));
      map.setZoom(region.zoom);
    }
  };

  return (
    <MapProvider>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="z-10 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-14 items-center gap-4 px-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold dark:text-white">지도 검색</h1>

            {/* 지역 선택 */}
            <div className="ml-auto flex gap-1">
              {REGIONS.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionSelect(region)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    center.name === region.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Map */}
        <div className="relative flex-1">
          <NaverMap
            center={{ lat: center.lat, lng: center.lng }}
            zoom={center.zoom}
            className="h-full w-full"
            onMapReady={handleMapReady}
          />

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-md dark:bg-gray-800">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-gray-600 dark:text-gray-400">로딩 중...</span>
            </div>
          )}

          {/* 아파트 개수 표시 */}
          {!isLoading && apartments.length > 0 && (
            <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-2 shadow-md dark:bg-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{apartments.length}</span>개 단지
              </span>
            </div>
          )}

          {/* 선택된 아파트 정보 */}
          {selectedApt && (
            <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-md rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800">
              <button
                onClick={() => setSelectedApt(null)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="pr-8 text-lg font-semibold text-gray-900 dark:text-white">{selectedApt.aptName}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedApt.address}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {selectedApt.constructedYear > 0 && <span>{selectedApt.constructedYear}년</span>}
                {selectedApt.totalUnits > 0 && (
                  <span>{selectedApt.totalUnits.toLocaleString()}세대</span>
                )}
              </div>
              <Link
                href={`/apt/${selectedApt.id}`}
                className="mt-4 block rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                상세 정보 보기
              </Link>
            </div>
          )}
        </div>
      </div>
    </MapProvider>
  );
}
