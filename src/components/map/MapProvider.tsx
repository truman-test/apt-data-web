'use client';

import Script from 'next/script';
import { createContext, useContext, useState, ReactNode } from 'react';

interface MapContextValue {
  isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({ isLoaded: false });

export function useMapContext() {
  return useContext(MapContext);
}

interface MapProviderProps {
  children: ReactNode;
}

export default function MapProvider({ children }: MapProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  return (
    <MapContext.Provider value={{ isLoaded }}>
      <Script
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      {children}
    </MapContext.Provider>
  );
}
