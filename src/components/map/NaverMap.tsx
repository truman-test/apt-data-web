'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapContext } from './MapProvider';

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMapReady?: (map: naver.maps.Map) => void;
}

export default function NaverMap({
  center = { lat: 37.5665, lng: 126.978 }, // 서울시청 기본값
  zoom = 14,
  className = 'w-full h-[500px]',
  onMapReady,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const { isLoaded } = useMapContext();

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.naver) return;

    const mapInstance = new naver.maps.Map(mapRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT,
      },
    });

    setMap(mapInstance);
    onMapReady?.(mapInstance);

    return () => {
      mapInstance.destroy();
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!map) return;
    map.setCenter(new naver.maps.LatLng(center.lat, center.lng));
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  return <div ref={mapRef} className={className} />;
}
