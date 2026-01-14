# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

한국 아파트 실거래가 데이터 기반 부동산 정보 서비스 프론트엔드. apt-data-collector-v2 프로젝트에서 수집한 PostgreSQL 데이터를 활용.

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **State**: React Query (서버 상태) + Zustand (클라이언트 상태)
- **Map**: Naver Maps API
- **Chart**: Recharts
- **Style**: Tailwind CSS v4

### Directory Structure
```
src/
├── app/              # Next.js App Router 페이지
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
1. **API Client** (`services/api.ts`): 백엔드 FastAPI 서버와 통신
2. **React Query Hooks** (`hooks/useApartment.ts`): 데이터 페칭/캐싱
3. **Components**: 훅으로 데이터 조회 후 렌더링

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

## Notes

- 가격 단위: 만원
- 면적 단위: ㎡ (전용면적 기준)
- 모바일 반응형 필수
- 데이터 소스: 국토교통부 실거래가, K-apt, NEIS
