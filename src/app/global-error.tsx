'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {/* 아이콘 */}
            <div
              style={{
                margin: '0 auto',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>

            {/* 메시지 */}
            <h2
              style={{
                marginTop: '24px',
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
              }}
            >
              심각한 오류가 발생했습니다
            </h2>
            <p
              style={{
                marginTop: '8px',
                color: '#6b7280',
              }}
            >
              애플리케이션에 문제가 발생했습니다. 페이지를 새로고침 해주세요.
            </p>

            {/* 액션 버튼 */}
            <div
              style={{
                marginTop: '32px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
