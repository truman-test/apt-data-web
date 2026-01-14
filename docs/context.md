# apt-data-web Context

**최종 업데이트**: 2026-01-14
**MVP 상태**: 개발 초기 단계

---

## 프로젝트 배경

### 데이터 출처
백엔드 프로젝트 `apt-data-collector-v2`에서 수집한 데이터 활용:
- 국토교통부 실거래가 공개시스템
- K-apt (한국감정원 공동주택관리정보)
- NEIS (교육청 학교정보)
- 레일포털 (지하철역 정보)

### 데이터 규모
| 테이블 | 건수 |
|--------|------|
| 매매 실거래가 | 10,602,206 |
| 전월세 실거래가 | 11,844,959 |
| 단지 마스터 | 44,571 |
| 학교 | 12,610 |
| 지하철역 | 1,090 |

---

## 아키텍처 결정 기록

### 2026-01-14: 초기 아키텍처 구성

#### Provider 계층 구조
```tsx
<QueryProvider>      // React Query - 전역 최상위
  <MapProvider>      // Naver Maps - 스크립트 로드
    {children}
  </MapProvider>
</QueryProvider>
```
**이유**: React Query는 전역 상태 관리, MapProvider는 지도 스크립트 로드 담당

#### QueryProvider 설정
- **staleTime**: 60초 - 부동산 데이터 특성상 실시간 갱신 불필요
- **retry**: 1회 - 네트워크 오류 시 1번만 재시도
- **refetchOnWindowFocus**: false - 불필요한 API 호출 방지

#### 검색 최소 글자 수
- **설정**: 2글자 이상 (`enabled: query.length >= 2`)
- **이유**: 한글 특성상 1글자 검색은 의미 없음, 백엔드 부하 감소

#### 가격/면적 단위
- **가격**: 만원 (한국 부동산 관습)
- **면적**: ㎡, 전용면적 기준

---

## MVP 구현 상태

### 완료
- [x] Next.js 16 프로젝트 초기화
- [x] 핵심 패키지 설치 (React Query, Zustand, Recharts, Naver Maps)
- [x] 프로젝트 구조 생성
- [x] 홈 페이지 UI (검색 폼)
- [x] API 서비스 레이어 정의
- [x] TypeScript 타입 정의
- [x] React Query 훅

### 진행 예정
- [ ] Backend API (FastAPI)
- [ ] /search 검색 결과 페이지
- [ ] /apt/[id] 단지 상세 페이지
- [ ] /map 지도 탐색 페이지
- [ ] /compare 비교 페이지

---

## 알려진 제약사항

### 네이버 지도 API
- 무료 플랜: 일 10만 건 호출 제한
- Client ID 환경변수 필수: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`

### 백엔드 의존성
- 로컬 개발: 백엔드 서버 `localhost:8000` 실행 필요
- CORS: 백엔드에서 프론트엔드 도메인 허용 필요

### 데이터 범위
- 매매: 2006년 ~ 현재
- 전월세: 2011년 ~ 현재
- 지역: 전국 17개 시도, 251개 시군구

---

## 세션 히스토리

### 2026-01-14 (초기 세션)
- Next.js 프로젝트 초기화
- MVP 요구사항 정의 (/clarify)
- 기본 인프라 구축
- TIL: create-next-app은 .claude 폴더와 충돌
