# apt-data-web 개선사항 명세서

**작성일**: 2026-01-14
**MVP 상태**: 완료
**문서 목적**: MVP 이후 구현할 개선사항 상세 명세

---

## 목차

1. [UI/UX 개선](#1-uiux-개선)
2. [기능 추가](#2-기능-추가)
3. [성능 최적화](#3-성능-최적화)
4. [테스트](#4-테스트)
5. [SEO/접근성](#5-seo접근성)
6. [우선순위 매트릭스](#6-우선순위-매트릭스)

---

## 1. UI/UX 개선

### 1.1 로딩 스켈레톤 UI

**현재 상태**: 스피너만 표시
**개선 목표**: 콘텐츠 레이아웃을 유지하는 스켈레톤 UI

**구현 파일**:
```
src/components/skeleton/
├── ApartmentCardSkeleton.tsx   # 검색 결과 카드
├── PriceChartSkeleton.tsx      # 차트 영역
├── TradeListSkeleton.tsx       # 거래 내역 테이블
└── index.ts
```

**예상 코드 구조**:
```tsx
// src/components/skeleton/ApartmentCardSkeleton.tsx
export function ApartmentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-5">
      <div className="h-6 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-4 flex gap-4">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
    </div>
  );
}
```

**적용 위치**:
- `/search` - 검색 결과 로딩 시
- `/apt/[id]` - 상세 페이지 초기 로딩
- `/compare` - 비교 데이터 로딩 시

---

### 1.2 커스텀 에러 페이지

**현재 상태**: Next.js 기본 에러 페이지
**개선 목표**: 브랜드 일관성 있는 에러 페이지

**구현 파일**:
```
src/app/
├── not-found.tsx      # 404 페이지
├── error.tsx          # 클라이언트 에러
└── global-error.tsx   # 전역 에러 (레이아웃 포함)
```

**404 페이지 예상 구조**:
```tsx
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
```

**에러 바운더리 예상 구조**:
```tsx
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-900">문제가 발생했습니다</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        다시 시도
      </button>
    </div>
  );
}
```

---

### 1.3 토스트 알림 시스템

**현재 상태**: 사용자 피드백 없음
**개선 목표**: 액션 결과를 토스트로 표시

**구현 방식**: Zustand 스토어 + Portal 기반

**구현 파일**:
```
src/stores/toastStore.ts
src/components/common/Toast.tsx
src/components/common/ToastContainer.tsx
```

**스토어 구조**:
```tsx
// src/stores/toastStore.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
```

**사용 예시**:
```tsx
// 비교 페이지에서 아파트 추가 시
const { addToast } = useToastStore();
addToast('비교 목록에 추가되었습니다', 'success');
```

---

### 1.4 다크 모드

**현재 상태**: 라이트 모드만 지원
**개선 목표**: 시스템 설정 연동 + 수동 토글

**구현 방식**: next-themes 라이브러리 활용

**설치**:
```bash
npm install next-themes
```

**구현 파일**:
```
src/components/common/ThemeProvider.tsx
src/components/common/ThemeToggle.tsx
```

**ThemeProvider 구조**:
```tsx
// src/components/common/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

**Tailwind 설정** (`tailwind.config.js`):
```js
module.exports = {
  darkMode: 'class',
  // ...
}
```

**다크 모드 색상 예시**:
```tsx
// 기존
className="bg-white text-gray-900"

// 다크 모드 지원
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

---

## 2. 기능 추가

### 2.1 즐겨찾기 (관심 단지)

**현재 상태**: 없음
**개선 목표**: 관심 단지 저장 및 관리

**저장 방식**: localStorage (로그인 없이)

**구현 파일**:
```
src/stores/favoriteStore.ts
src/components/common/FavoriteButton.tsx
src/app/favorites/page.tsx
```

**스토어 구조**:
```tsx
// src/stores/favoriteStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  favorites: number[]; // apt_id 배열
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => {
        set((state) => ({ favorites: [...state.favorites, id] }));
      },
      removeFavorite: (id) => {
        set((state) => ({ favorites: state.favorites.filter((f) => f !== id) }));
      },
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: 'apt-favorites' }
  )
);
```

**버튼 컴포넌트**:
```tsx
// src/components/common/FavoriteButton.tsx
'use client';

import { Heart } from 'lucide-react';
import { useFavoriteStore } from '@/stores/favoriteStore';

export function FavoriteButton({ aptId }: { aptId: number }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  const favorited = isFavorite(aptId);

  return (
    <button
      onClick={() => favorited ? removeFavorite(aptId) : addFavorite(aptId)}
      className={`rounded-full p-2 ${
        favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
    >
      <Heart className={`h-5 w-5 ${favorited ? 'fill-current' : ''}`} />
    </button>
  );
}
```

**적용 위치**:
- 검색 결과 카드
- 단지 상세 페이지 헤더
- 비교 페이지 슬롯

---

### 2.2 전월세 시세 차트

**현재 상태**: 매매 차트만 존재
**개선 목표**: 전세/월세 시세 추이 차트 추가

**구현 파일**:
```
src/components/chart/RentChart.tsx
src/app/api/apartments/[id]/rent-trend/route.ts
src/hooks/useApartment.ts  # useRentTrend 훅 추가
```

**API 엔드포인트**:
```
GET /api/apartments/[id]/rent-trend?period=3y&rentType=jeonse
```

**응답 형식**:
```json
{
  "success": true,
  "data": [
    { "date": "2024-01", "avgDeposit": 45000, "avgMonthlyRent": 0, "count": 5 },
    { "date": "2024-02", "avgDeposit": 46000, "avgMonthlyRent": 0, "count": 3 }
  ]
}
```

**차트 컴포넌트 구조**:
```tsx
// src/components/chart/RentChart.tsx
'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type RentType = 'jeonse' | 'monthly' | 'all';

export function RentChart({ aptId }: { aptId: number }) {
  const [rentType, setRentType] = useState<RentType>('jeonse');
  const { data, isLoading } = useRentTrend(aptId, { rentType });

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">전월세 시세</h2>
        <div className="flex gap-1">
          {['jeonse', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setRentType(type as RentType)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                rentType === type ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {type === 'jeonse' ? '전세' : '월세'}
            </button>
          ))}
        </div>
      </div>
      {/* 차트 렌더링 */}
    </div>
  );
}
```

---

### 2.3 학교 정보 표시

**현재 상태**: 지하철역만 표시
**개선 목표**: 근처 초/중/고 학교 정보 표시

**데이터 소스**: `raw_schools` 테이블 (NEIS 데이터)

**구현 파일**:
```
src/app/api/apartments/[id]/nearby-schools/route.ts
src/components/apartment/SchoolInfo.tsx
src/types/apartment.ts  # NearbySchool 타입 추가
```

**API 엔드포인트**:
```
GET /api/apartments/[id]/nearby-schools?radius=1000
```

**응답 형식**:
```json
{
  "success": true,
  "data": [
    {
      "schoolName": "반포초등학교",
      "schoolType": "elementary",
      "distance": 350,
      "walkingMinutes": 5,
      "address": "서울시 서초구 반포동 ..."
    }
  ]
}
```

**컴포넌트 구조**:
```tsx
// src/components/apartment/SchoolInfo.tsx
import { GraduationCap } from 'lucide-react';

const SCHOOL_TYPE_LABELS = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
};

export function SchoolInfo({ schools }: { schools: NearbySchool[] }) {
  const grouped = {
    elementary: schools.filter((s) => s.schoolType === 'elementary'),
    middle: schools.filter((s) => s.schoolType === 'middle'),
    high: schools.filter((s) => s.schoolType === 'high'),
  };

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold">주변 학교</h2>
      {Object.entries(grouped).map(([type, list]) => (
        <div key={type} className="mb-4 last:mb-0">
          <h3 className="text-sm font-medium text-gray-500">
            {SCHOOL_TYPE_LABELS[type as keyof typeof SCHOOL_TYPE_LABELS]}
          </h3>
          <div className="mt-2 space-y-2">
            {list.slice(0, 3).map((school) => (
              <div key={school.schoolName} className="flex justify-between">
                <span>{school.schoolName}</span>
                <span className="text-gray-500">{school.distance}m</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 2.4 평형별 필터

**현재 상태**: 전체 거래 내역만 표시
**개선 목표**: 면적별 필터링

**구현 파일**:
```
src/components/apartment/AreaFilter.tsx
src/app/apt/[id]/page.tsx  # 필터 상태 추가
```

**컴포넌트 구조**:
```tsx
// src/components/apartment/AreaFilter.tsx
interface AreaFilterProps {
  areas: number[];  // 유니크 면적 목록
  selected: number | null;
  onChange: (area: number | null) => void;
}

export function AreaFilter({ areas, selected, onChange }: AreaFilterProps) {
  // 면적을 평으로 그룹화 (예: 59㎡ → 18평, 84㎡ → 25평)
  const groupedAreas = groupByPyeong(areas);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full px-3 py-1 text-sm ${
          selected === null ? 'bg-blue-600 text-white' : 'bg-gray-100'
        }`}
      >
        전체
      </button>
      {groupedAreas.map(({ pyeong, areas }) => (
        <button
          key={pyeong}
          onClick={() => onChange(areas[0])}
          className={`rounded-full px-3 py-1 text-sm ${
            selected && areas.includes(selected) ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          {pyeong}평
        </button>
      ))}
    </div>
  );
}
```

**API 수정**:
```
GET /api/apartments/[id]/trades?area=84.93
GET /api/apartments/[id]/price-trend?area=84.93
```

---

### 2.5 공유 기능

**현재 상태**: 없음
**개선 목표**: URL 복사 + SNS 공유

**구현 파일**:
```
src/components/common/ShareButton.tsx
```

**컴포넌트 구조**:
```tsx
// src/components/common/ShareButton.tsx
'use client';

import { Share2, Link, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    // 토스트 알림 표시
  };

  const shareToKakao = () => {
    // Kakao SDK 사용
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          imageUrl: '/og-image.png',
          link: { mobileWebUrl: url, webUrl: url },
        },
      });
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)}>
        <Share2 className="h-5 w-5" />
      </button>
      {showMenu && (
        <div className="absolute right-0 top-8 rounded-lg border bg-white p-2 shadow-lg">
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-2">
            <Link className="h-4 w-4" /> URL 복사
          </button>
          <button onClick={shareToKakao} className="flex items-center gap-2 px-3 py-2">
            <MessageCircle className="h-4 w-4" /> 카카오톡
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 3. 성능 최적화

### 3.1 React Query 캐싱 최적화

**현재 상태**: 기본 staleTime 60초
**개선 목표**: 데이터 특성별 캐싱 전략

**설정 변경** (`src/components/common/QueryProvider.tsx`):
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5분 (기본)
      gcTime: 30 * 60 * 1000,         // 30분 캐시 유지
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**데이터별 전략**:
| 데이터 | staleTime | 이유 |
|--------|-----------|------|
| 단지 정보 | 24시간 | 거의 변하지 않음 |
| 거래 내역 | 1시간 | 일별 업데이트 |
| 시세 추이 | 1시간 | 월별 집계 |
| 검색 결과 | 5분 | 자주 변경될 수 있음 |

**훅 수정 예시**:
```tsx
export function useApartment(id: number) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => getApartment(id),
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,  // 24시간
  });
}
```

---

### 3.2 지도 마커 클러스터링

**현재 상태**: 최대 500개 마커 제한
**개선 목표**: 클러스터링으로 대량 마커 처리

**라이브러리**: `@navermaps/cluster` (네이버 공식)

**구현 파일**:
```
src/components/map/MarkerCluster.tsx
src/app/map/page.tsx  # 클러스터 적용
```

**구현 구조**:
```tsx
// src/components/map/MarkerCluster.tsx
'use client';

import { useEffect, useRef } from 'react';

interface MarkerClusterProps {
  map: naver.maps.Map;
  markers: naver.maps.Marker[];
}

export function MarkerCluster({ map, markers }: MarkerClusterProps) {
  const clusterRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !window.MarkerClustering) return;

    clusterRef.current = new MarkerClustering({
      minClusterSize: 2,
      maxZoom: 16,
      map,
      markers,
      disableClickZoom: false,
      gridSize: 120,
      icons: [/* 클러스터 아이콘 설정 */],
      indexGenerator: [10, 50, 100, 500],
    });

    return () => {
      clusterRef.current?.setMap(null);
    };
  }, [map, markers]);

  return null;
}
```

---

### 3.3 DB 인덱스 최적화

**현재 상태**: 기본 인덱스만 존재
**개선 목표**: 자주 사용되는 쿼리 최적화

**권장 인덱스** (apt-data-collector-v2에서 실행):
```sql
-- 검색 최적화
CREATE INDEX CONCURRENTLY idx_apt_master_search
ON apt_master (apt_nm, sigungu, sido);

-- 거래 조회 최적화
CREATE INDEX CONCURRENTLY idx_raw_trades_apt_date
ON raw_trades (sigungu_cd, apt_nm, deal_year DESC, deal_month DESC);

-- 지도 영역 조회 최적화
CREATE INDEX CONCURRENTLY idx_apt_master_location
ON apt_master (lat, lng)
WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- 가격 추이 최적화
CREATE INDEX CONCURRENTLY idx_raw_trades_trend
ON raw_trades (sigungu_cd, apt_nm, deal_year, deal_month);
```

**주의**: DB 수정은 apt-data-collector-v2 프로젝트에서 수행

---

### 3.4 이미지 최적화

**현재 상태**: 이미지 미사용
**개선 목표**: OG 이미지, 파비콘 최적화

**구현 파일**:
```
public/
├── favicon.ico
├── apple-touch-icon.png
├── og-image.png
└── images/
    └── ... (필요시)

src/app/
├── icon.tsx           # 동적 파비콘
├── apple-icon.tsx     # Apple 터치 아이콘
└── opengraph-image.tsx # 동적 OG 이미지
```

**동적 OG 이미지 예시**:
```tsx
// src/app/apt/[id]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  // 아파트 정보 조회 후 이미지 생성
  return new ImageResponse(
    (
      <div style={{ /* 스타일 */ }}>
        <h1>{apartment.aptName}</h1>
        <p>{apartment.address}</p>
      </div>
    ),
    { ...size }
  );
}
```

---

## 4. 테스트

### 4.1 E2E 테스트 (Playwright)

**설치**:
```bash
npm install -D @playwright/test
npx playwright install
```

**설정 파일**:
```
playwright.config.ts
e2e/
├── home.spec.ts
├── search.spec.ts
├── apartment-detail.spec.ts
├── map.spec.ts
└── compare.spec.ts
```

**playwright.config.ts**:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**테스트 예시**:
```ts
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('검색 기능', () => {
  test('아파트 검색 후 결과 표시', async ({ page }) => {
    await page.goto('/');

    // 검색어 입력
    await page.fill('input[placeholder*="아파트"]', '래미안');
    await page.click('button[type="submit"]');

    // 결과 페이지 확인
    await expect(page).toHaveURL(/\/search\?q=래미안/);
    await expect(page.locator('[data-testid="apartment-card"]')).toHaveCount.greaterThan(0);
  });

  test('검색 결과에서 상세 페이지 이동', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 첫 번째 결과 클릭
    await page.locator('[data-testid="apartment-card"]').first().click();

    // 상세 페이지 확인
    await expect(page).toHaveURL(/\/apt\/\d+/);
    await expect(page.locator('h1')).toContainText('래미안');
  });
});
```

---

### 4.2 단위 테스트 (Jest + React Testing Library)

**설치**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**설정 파일**:
```
jest.config.js
jest.setup.js
__tests__/
├── components/
│   ├── ApartmentCard.test.tsx
│   └── PriceChart.test.tsx
├── hooks/
│   └── useApartment.test.tsx
└── lib/
    └── transformers.test.ts
```

**jest.config.js**:
```js
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

**테스트 예시**:
```tsx
// __tests__/lib/transformers.test.ts
import { transformApartment, transformTrade } from '@/lib/transformers';

describe('transformApartment', () => {
  it('DB 데이터를 프론트엔드 타입으로 변환', () => {
    const dbData = {
      apt_id: 1,
      apt_nm: '래미안퍼스티지',
      sigungu_cd: '11650',
      // ...
    };

    const result = transformApartment(dbData);

    expect(result.id).toBe(1);
    expect(result.aptName).toBe('래미안퍼스티지');
    expect(result.sigunguCode).toBe('11650');
  });
});
```

**컴포넌트 테스트 예시**:
```tsx
// __tests__/components/ApartmentCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ApartmentCard } from '@/components/search/ApartmentCard';

const mockApartment = {
  id: 1,
  aptName: '래미안퍼스티지',
  address: '서울 서초구 반포동',
  constructedYear: 2009,
  totalUnits: 2444,
};

describe('ApartmentCard', () => {
  it('아파트 정보 렌더링', () => {
    render(<ApartmentCard apartment={mockApartment} />);

    expect(screen.getByText('래미안퍼스티지')).toBeInTheDocument();
    expect(screen.getByText(/서울 서초구/)).toBeInTheDocument();
    expect(screen.getByText(/2009년/)).toBeInTheDocument();
  });
});
```

**package.json 스크립트 추가**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 5. SEO/접근성

### 5.1 메타데이터 최적화

**구현 파일**:
```
src/app/layout.tsx           # 기본 메타데이터
src/app/apt/[id]/page.tsx    # 동적 메타데이터
src/app/search/page.tsx      # 검색 페이지 메타데이터
```

**기본 메타데이터**:
```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '아파트 실거래가 - 부동산 데이터 플랫폼',
    template: '%s | 아파트 실거래가',
  },
  description: '전국 아파트 실거래가 조회, 시세 분석, 단지 비교 서비스',
  keywords: ['아파트', '실거래가', '부동산', '시세', '매매'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '아파트 실거래가',
  },
};
```

**동적 메타데이터**:
```tsx
// src/app/apt/[id]/page.tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apartment = await getApartment(params.id);

  return {
    title: apartment.aptName,
    description: `${apartment.address} - ${apartment.constructedYear}년 준공, ${apartment.totalUnits}세대`,
    openGraph: {
      title: apartment.aptName,
      description: `${apartment.address} 실거래가 및 시세 정보`,
    },
  };
}
```

---

### 5.2 Sitemap 생성

**구현 파일**:
```
src/app/sitemap.ts
```

**구현 코드**:
```tsx
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://your-domain.com';

  // 정적 페이지
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // 동적 페이지 (거래량 상위 아파트)
  const topApartments = await prisma.apt_master.findMany({
    select: { apt_id: true, updated_at: true },
    orderBy: { trade_count: 'desc' },
    take: 1000,
  });

  const apartmentPages = topApartments.map((apt) => ({
    url: `${baseUrl}/apt/${apt.apt_id}`,
    lastModified: apt.updated_at || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...apartmentPages];
}
```

---

### 5.3 robots.txt

**구현 파일**:
```
src/app/robots.ts
```

**구현 코드**:
```tsx
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/compare'],  // API와 비교 페이지 제외
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  };
}
```

---

## 6. 우선순위 매트릭스

### 즉시 구현 (높은 가치, 낮은 복잡도)

| 항목 | 예상 작업량 | 영향도 |
|------|------------|--------|
| 로딩 스켈레톤 | 2시간 | UX 대폭 개선 |
| 커스텀 에러 페이지 | 1시간 | 완성도 향상 |
| 토스트 알림 | 2시간 | 피드백 제공 |
| 즐겨찾기 | 3시간 | 재방문 유도 |

### 단기 구현 (높은 가치, 중간 복잡도)

| 항목 | 예상 작업량 | 영향도 |
|------|------------|--------|
| 평형별 필터 | 3시간 | 사용성 향상 |
| 전월세 차트 | 4시간 | 데이터 활용 |
| E2E 테스트 | 6시간 | 품질 보장 |
| SEO 메타데이터 | 2시간 | 검색 노출 |

### 중기 구현 (중간 가치, 높은 복잡도)

| 항목 | 예상 작업량 | 영향도 |
|------|------------|--------|
| 학교 정보 | 5시간 | 정보 확장 |
| 마커 클러스터링 | 4시간 | 지도 성능 |
| 다크 모드 | 4시간 | 사용자 선호 |
| 단위 테스트 | 8시간 | 코드 품질 |

### 장기 구현 (검토 필요)

| 항목 | 예상 작업량 | 비고 |
|------|------------|------|
| DB 인덱스 | 별도 프로젝트 | apt-data-collector-v2에서 수행 |
| 배포 | 미정 | 환경 결정 후 진행 |
| 공유 기능 (카카오) | 3시간 | SDK 설정 필요 |

---

## 체크리스트

구현 시 확인 사항:

- [ ] TypeScript 타입 정의 완료
- [ ] 반응형 디자인 적용 (모바일 우선)
- [ ] 에러 처리 및 로딩 상태 구현
- [ ] 접근성 (aria-label, 키보드 네비게이션)
- [ ] 테스트 작성
- [ ] 문서 업데이트
