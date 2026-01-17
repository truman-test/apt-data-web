import type { Metadata } from 'next';
import { MapContent } from './MapContent';

export const metadata: Metadata = {
  title: '지도 검색',
  description: '지도에서 아파트를 검색하세요. 서울, 경기, 부산 등 전국 주요 지역의 아파트 위치와 실거래가를 확인할 수 있습니다.',
  openGraph: {
    title: '지도 검색 | 아파트 실거래가',
    description: '지도에서 전국 아파트를 검색하고 실거래가를 확인하세요.',
  },
};

export default function MapPage() {
  return <MapContent />;
}
