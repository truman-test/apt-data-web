# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

한국 아파트 실거래가 데이터 기반 부동산 정보 서비스 (프론트엔드 + 백엔드 API).
- `apt-data-collector-v2` 프로젝트에서 수집한 PostgreSQL 데이터 활용
- **DB 읽기 전용**: SELECT만 허용, INSERT/UPDATE/DELETE 절대 금지

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Backend API**: Next.js Route Handlers (`app/api/`)
- **Database**: PostgreSQL (읽기 전용)
- **State**: React Query (서버 상태) + Zustand (클라이언트 상태)
- **Map**: Naver Maps API
- **Chart**: Recharts
- **Style**: Tailwind CSS v4

### Directory Structure
```
src/
├── app/
│   ├── api/          # Backend API Route Handlers (읽기 전용)
│   └── ...           # 페이지 라우트
├── lib/              # DB 클라이언트, 유틸리티
├── components/
│   ├── common/       # QueryProvider 등 공통 컴포넌트
│   ├── map/          # NaverMap, MapProvider
│   ├── apartment/    # 단지 관련 컴포넌트
│   ├── search/       # 검색 관련 컴포넌트
│   └── chart/        # 시세 차트 컴포넌트
├── hooks/            # useApartment 등 React Query 훅
├── services/         # API 클라이언트 (api.ts)
├── stores/           # Zustand 스토어
└── types/            # TypeScript 타입 정의
```

### Data Flow
1. **Route Handlers** (`app/api/`): PostgreSQL에서 데이터 조회 (SELECT only)
2. **API Client** (`services/api.ts`): Route Handlers와 통신
3. **React Query Hooks** (`hooks/useApartment.ts`): 데이터 페칭/캐싱
4. **Components**: 훅으로 데이터 조회 후 렌더링

### API Client Pattern (`services/api.ts`)

```typescript
// 모든 API 응답은 ApiResponse<T> 래퍼 사용
{ success: boolean, data: T, message?: string, meta?: { total, page, limit } }

// fetchApi 함수가 에러를 자동 throw → React Query가 처리
// 컴포넌트에서는 isError, error 상태만 확인

// 쿼리 파라미터 패턴
const params = new URLSearchParams();
if (options?.filter) params.append('filter', options.filter);
return fetchApi(`/endpoint?${params}`);
```

**React Query 훅 규칙**:
- `queryKey`: `['entity', id, options]` 형식
- `enabled`: ID 기반은 `!!id`, 검색은 `query.length >= 2`

### Key Types (`types/apartment.ts`)
- `Apartment`: 단지 마스터 정보 (44,571건)
- `Trade`: 매매 실거래가 (10.6M건)
- `Rent`: 전월세 실거래가 (11.8M건)
- `ApiResponse<T>`: 표준 API 응답 래퍼

### Naver Map Integration
- `MapProvider`: 스크립트 로드 및 Context 제공
- `NaverMap`: 지도 렌더링 컴포넌트
- 반드시 `MapProvider` 하위에서 사용

## Environment Variables

```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID  # 네이버 지도 Client ID
NEXT_PUBLIC_API_URL              # 백엔드 API URL (default: http://localhost:8000/api)
DATABASE_URL                     # PostgreSQL 연결 문자열
```

## MVP Pages (docs/MVP_REQUIREMENTS.md 참조)

| 경로 | 설명 |
|------|------|
| `/` | 홈 (검색 UI) |
| `/search` | 검색 결과 |
| `/apt/[id]` | 단지 상세 + 시세 차트 |
| `/map` | 지도 탐색 |
| `/compare` | 단지 비교 |

## Backend API Endpoints

```
GET /apartments/search?q=       # 단지 검색
GET /apartments/:id             # 단지 상세
GET /apartments/:id/trades      # 매매 실거래가
GET /apartments/:id/rents       # 전월세 실거래가
GET /apartments/:id/price-trend # 가격 추이
GET /apartments/by-bounds       # 지도 영역 내 단지
```

## Critical Constraints (중요 제약사항)

**⚠️ DB 읽기 전용 원칙**
- `apt-data-collector-v2`가 데이터 수집/관리 담당
- 이 프로젝트는 **SELECT 쿼리만** 사용
- INSERT, UPDATE, DELETE, DROP 등 **절대 금지**
- DB 사용자 권한도 읽기 전용으로 설정 권장

## Notes

- 가격 단위: 만원
- 면적 단위: ㎡ (전용면적 기준)
- 모바일 반응형 필수
- 데이터 소스: 국토교통부 실거래가, K-apt, NEIS
