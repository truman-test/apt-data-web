import type { Metadata } from 'next';
import { FavoritesContent } from './FavoritesContent';

export const metadata: Metadata = {
  title: '관심 단지',
  description: '저장한 관심 아파트 목록입니다. 마음에 드는 아파트를 저장하고 한눈에 관리하세요.',
  openGraph: {
    title: '관심 단지 | 아파트 실거래가',
    description: '저장한 관심 아파트 목록을 확인하세요.',
  },
  robots: {
    index: false, // 개인화된 페이지이므로 검색엔진 색인 제외
  },
};

export default function FavoritesPage() {
  return <FavoritesContent />;
}
