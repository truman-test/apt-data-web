import type { Metadata } from 'next';
import { SearchContent } from './SearchContent';

export const metadata: Metadata = {
  title: '아파트 검색',
  description: '전국 48,000개 아파트 단지를 검색하세요. 아파트명, 지역명으로 실거래가 정보를 조회할 수 있습니다.',
  openGraph: {
    title: '아파트 검색 | 아파트 실거래가',
    description: '전국 48,000개 아파트 단지를 검색하세요.',
  },
};

export default function SearchPage() {
  return <SearchContent />;
}
