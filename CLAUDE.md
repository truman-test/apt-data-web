# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

한국 아파트 실거래가 데이터 기반 부동산 정보 서비스 (프론트엔드 + 백엔드 API).
- `apt-data-collector-v2` 프로젝트에서 수집한 PostgreSQL 데이터 활용
- **DB 읽기 전용**: SELECT만 허용, INSERT/UPDATE/DELETE 절대 금지

## Commands

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 실행
npm run test:e2e  # Playwright E2E 테스트
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
├── lib/
│   ├── prisma.ts     # Prisma 클라이언트
│   ├── api-response.ts   # API 응답 헬퍼 + HTTP 캐싱
│   ├── formatters.ts     # 가격/면적 포맷팅 함수
│   └── transformers.ts   # DB → API 응답 변환
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
e2e/                  # Playwright E2E 테스트
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

## Database Schema

### 테이블 관계도
```
regions ◄─── apt_master ───► apt_area_types
  (252)      (48,213)         (467,522)
                │
                ├───► apt_nearest_station (43,826)
                │           │
                │           ▼
                │      raw_stations (1,090)
                │
                ├───► raw_kapt_info (21,928)
                │
                ├───► raw_kapt_detail (21,955)
                │
                └───► raw_trades (10.5M) / raw_rents (12M)
                            │
                            ▼
                    area_supply_mapping (433K)

raw_schools (12,610) ◄── 좌표 기반 연결
raw_building_ledger_full (80M) ◄── 건축물대장 원본
```

### 주요 테이블

| 테이블 | 건수 | 설명 | 주요 컬럼 |
|--------|-----:|------|-----------|
| `apt_master` | 48,213 | 아파트 단지 마스터 | apt_id(PK), sigungu_cd, apt_nm, kapt_code, lat, lng |
| `raw_trades` | 10.5M | 매매 실거래가 | sigungu_cd, apt_nm, exclu_use_ar, deal_year/month/day, deal_amount, floor |
| `raw_rents` | 12M | 전월세 실거래가 | sigungu_cd, apt_nm, exclu_use_ar, deal_year/month/day, deposit, monthly_rent |
| `apt_area_types` | 467K | 단지별 면적 타입 | apt_id(FK), exclu_area, supply_area, unit_count |
| `raw_kapt_info` | 21,928 | K-apt 기본정보 | kapt_code(PK), total_dong_cnt, total_ho_cnt, hallway_type |
| `raw_kapt_detail` | 21,955 | K-apt 상세정보 | kapt_code(PK), kaptd_ecnt(승강기), kaptd_pcnt(주차), welfare_facility |
| `raw_stations` | 1,090 | 지하철역 정보 | station_name, line_name, lat, lng |
| `raw_schools` | 12,610 | 학교 정보 | school_name, school_type, school_kind, lat, lng |
| `regions` | 252 | 시군구 코드 | code(PK), sido, sigungu |
| `apt_nearest_station` | 43,826 | 최근접 지하철역 | apt_id(FK), station_id, distance_m |
| `apt_assigned_school` | 47,882 | 배정 학교 정보 | apt_id(FK), elementary_school_name, middle_zone_name |
| `area_supply_mapping` | 433K | 전용/공급 면적 매핑 | sigungu_cd, bjdong_cd, bun, ji, exclu_area, supply_area |

### 테이블 연결 키

| 관계 | 연결 방법 |
|------|-----------|
| apt_master ↔ regions | `sigungu_cd = code` |
| apt_master ↔ apt_area_types | `apt_id` |
| apt_master ↔ raw_kapt_* | `kapt_code` |
| apt_master ↔ raw_trades/rents | `sigungu_cd + apt_nm + build_year` |
| apt_master ↔ apt_nearest_station | `apt_id` |
| apt_master ↔ apt_assigned_school | `apt_id` |
| apt_assigned_school ↔ raw_schools | `elementary_school_name || '등학교' = school_name` |

### 데이터 단위
- **가격**: 만원 (`deal_amount`, `deposit`, `monthly_rent`)
- **면적**: ㎡ (`exclu_use_ar`, `exclu_area`, `supply_area`)
- **거리**: 미터 (`distance_m`)
- **전용률**: 백분율 (`exclu_ratio` = 74.5 → 74.5%)

### 주요 인덱스

| 테이블 | 인덱스 | 용도 |
|--------|--------|------|
| apt_master | `idx_apt_master_search(search_name)` | 단지 검색 |
| apt_master | `idx_apt_master_coordinates(lat, lng)` | 지도 영역 조회 |
| apt_master | `idx_apt_master_sigungu(sigungu_cd)` | 지역 필터 |
| raw_trades | `idx_raw_trades_deal_ym(deal_year, deal_month)` | 기간 조회 |
| raw_trades | `idx_raw_trades_apt_nm(apt_nm)` | 단지명 검색 |
| raw_rents | `idx_raw_rents_deal_ym(deal_year, deal_month)` | 기간 조회 |

### 자주 사용하는 쿼리 패턴

```sql
-- 단지 상세 + K-apt 정보
SELECT a.*, k.total_dong_cnt, k.total_ho_cnt, d.kaptd_ecnt, d.kaptd_pcnt
FROM apt_master a
LEFT JOIN raw_kapt_info k ON a.kapt_code = k.kapt_code
LEFT JOIN raw_kapt_detail d ON a.kapt_code = d.kapt_code
WHERE a.apt_id = ?;

-- 단지별 실거래가 조회
SELECT * FROM raw_trades
WHERE sigungu_cd = ? AND apt_nm = ? AND build_year = ?
ORDER BY deal_year DESC, deal_month DESC, deal_day DESC;

-- 면적 타입별 조회
SELECT exclu_area, supply_area, unit_count
FROM apt_area_types WHERE apt_id = ?
ORDER BY exclu_area;

-- 지도 영역 내 단지 조회
SELECT * FROM apt_master
WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?
  AND lat IS NOT NULL AND lng IS NOT NULL;

-- 최근접 지하철역
SELECT n.*, s.line_name
FROM apt_nearest_station n
JOIN raw_stations s ON n.station_id = s.id
WHERE n.apt_id = ?;
```

### 실거래가 데이터 참고사항

| 컬럼 | 값 | 의미 |
|------|-----|------|
| `cdeal_type` | NULL/빈값 | 정상 거래 |
| `cdeal_type` | 'O' | 해제된 거래 (필터링 필요) |
| `monthly_rent` | 0 | 전세 |
| `monthly_rent` | > 0 | 월세 |
| `contract_type` | '신규' | 신규 계약 |
| `contract_type` | '갱신' | 계약 갱신 |
| `use_rr_right` | 'Y' | 갱신요구권 사용 |

### NULL 허용 주요 컬럼
- `apt_master.kapt_code`: K-apt 미매칭 단지 존재 (~45%)
- `apt_master.lat/lng`: 좌표 없는 단지 존재
- `raw_trades.deal_day`: 일자 미공개 거래
- `raw_trades.floor`: 층 정보 없음

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
GET /apartments/autocomplete?q= # 자동완성 (2글자 이상)
GET /apartments/:id             # 단지 상세
GET /apartments/:id/area-types  # 평형 타입별 정보
GET /apartments/:id/trades      # 매매 실거래가
GET /apartments/:id/rents       # 전월세 실거래가
GET /apartments/:id/price-trend # 가격 추이
GET /apartments/:id/rent-trend  # 전월세 추이
GET /apartments/:id/nearest-station # 최근접 지하철역
GET /apartments/:id/schools     # 학군 정보 (배정 초등학교 + 가까운 중/고)
GET /apartments/by-bounds       # 지도 영역 내 단지
```

### API 캐싱 (Cache-Control)

| 엔드포인트 | TTL | 용도 |
|-----------|-----|------|
| search, autocomplete, by-bounds | 1분 | 자주 변경되는 검색 |
| 단지 상세, trades, rents, area-types | 5분 | 단지별 데이터 |
| price-trend, rent-trend | 1시간 | 집계 데이터 |
| nearest-station, schools | 24시간 | 정적 데이터 |

```typescript
// lib/api-response.ts
export const CacheDuration = {
  SHORT: 60,      // 1분
  MEDIUM: 300,    // 5분
  LONG: 3600,     // 1시간
  STATIC: 86400,  // 24시간
};
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
