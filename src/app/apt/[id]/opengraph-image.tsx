import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

// 이미지 크기 설정
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// 동적 라우트 파라미터
interface Props {
  params: Promise<{ id: string }>;
}

export default async function OGImage({ params }: Props) {
  const { id } = await params;
  const aptId = parseInt(id, 10);

  // 아파트 정보 조회
  let aptName = '아파트 실거래가';
  let address = '';
  let buildYear = 0;
  let totalUnits = 0;
  let hallwayType = '';

  if (!isNaN(aptId)) {
    try {
      const apt = await prisma.apt_master.findUnique({
        where: { apt_id: aptId },
        include: { kapt_info: true },
      });

      if (apt) {
        aptName = apt.apt_nm;
        address = [apt.sido, apt.sigungu, apt.umd_nm].filter(Boolean).join(' ');
        buildYear = apt.build_year || 0;
        totalUnits = apt.kapt_info?.total_unit_cnt || apt.kapt_info?.total_ho_cnt || 0;
        hallwayType = apt.kapt_info?.hallway_type || '';
      }
    } catch {
      // 에러 시 기본값 사용
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        {/* 상단 그라데이션 바 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
          }}
        />

        {/* 메인 컨텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '60px 80px',
            height: '100%',
          }}
        >
          {/* 로고/브랜드 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#1f2937',
              }}
            >
              아파트 실거래가
            </span>
          </div>

          {/* 아파트명 */}
          <div
            style={{
              fontSize: aptName.length > 15 ? '56px' : '72px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '16px',
              lineHeight: 1.2,
              display: 'flex',
            }}
          >
            {aptName}
          </div>

          {/* 주소 */}
          {address && (
            <div
              style={{
                fontSize: '32px',
                color: '#6b7280',
                marginBottom: '40px',
                display: 'flex',
              }}
            >
              {address}
            </div>
          )}

          {/* 정보 태그들 */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: 'auto',
            }}
          >
            {buildYear > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '9999px',
                  fontSize: '24px',
                  color: '#374151',
                }}
              >
                <span style={{ fontWeight: 600 }}>{buildYear}년</span>
                <span style={{ color: '#9ca3af' }}>준공</span>
              </div>
            )}
            {totalUnits > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '9999px',
                  fontSize: '24px',
                  color: '#374151',
                }}
              >
                <span style={{ fontWeight: 600 }}>{totalUnits.toLocaleString()}세대</span>
              </div>
            )}
            {hallwayType && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '9999px',
                  fontSize: '24px',
                  color: '#374151',
                }}
              >
                <span style={{ fontWeight: 600 }}>{hallwayType}</span>
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '20px',
            color: '#9ca3af',
          }}
        >
          <span>매매 · 전월세 실거래가 및 시세 정보</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
