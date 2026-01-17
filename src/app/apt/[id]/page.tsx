import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ApartmentDetailContent } from '@/components/apartment/ApartmentDetailContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const aptId = parseInt(id, 10);

  if (isNaN(aptId)) {
    return {
      title: '아파트를 찾을 수 없습니다',
    };
  }

  try {
    const apt = await prisma.apt_master.findUnique({
      where: { apt_id: aptId },
      include: { kapt_info: true },
    });

    if (!apt) {
      return {
        title: '아파트를 찾을 수 없습니다',
      };
    }

    const address = [apt.sido, apt.sigungu, apt.umd_nm, apt.jibun].filter(Boolean).join(' ');
    const totalUnits = apt.kapt_info?.total_unit_cnt || apt.kapt_info?.total_ho_cnt || 0;
    const constructedYear = apt.build_year || 0;

    const description = constructedYear > 0
      ? `${address} - ${constructedYear}년 준공, ${totalUnits.toLocaleString()}세대. 매매/전월세 실거래가 및 시세 정보.`
      : `${address} - ${totalUnits.toLocaleString()}세대. 매매/전월세 실거래가 및 시세 정보.`;

    return {
      title: apt.apt_nm,
      description,
      openGraph: {
        title: `${apt.apt_nm} - 실거래가 및 시세`,
        description,
        type: 'article',
        siteName: '아파트 실거래가',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${apt.apt_nm} - 실거래가`,
        description,
      },
    };
  } catch {
    return {
      title: '아파트 정보',
    };
  }
}

export default async function ApartmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const aptId = parseInt(id, 10);

  return <ApartmentDetailContent aptId={aptId} />;
}
