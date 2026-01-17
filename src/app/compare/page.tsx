import type { Metadata } from 'next';
import { CompareContent } from './CompareContent';

export const metadata: Metadata = {
  title: '아파트 비교',
  description: '최대 4개의 아파트를 비교하세요. 가격, 면적, 세대수, 교통 등 상세 정보를 한눈에 비교할 수 있습니다.',
  openGraph: {
    title: '아파트 비교 | 아파트 실거래가',
    description: '여러 아파트의 시세와 정보를 한눈에 비교하세요.',
  },
};

export default function ComparePage() {
  return <CompareContent />;
}
