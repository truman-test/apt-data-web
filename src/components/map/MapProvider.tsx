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

  const handleScriptLoad = () => {
    if (window.naver && window.naver.maps) {
      if (window.naver.maps.jsContentLoaded) {
        setIsLoaded(true);
      } else {
        window.naver.maps.onJSContentLoaded = () => {
          setIsLoaded(true);
        };
      }
    }
  };

  return (
    <MapContext.Provider value={{ isLoaded }}>
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      {children}
    </MapContext.Provider>
  );
}
