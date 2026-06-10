# 데이터 계약 (Contract) — Search & Discovery Playground

> 작성자: **scaffold-architect** · 최종 갱신: 2026-06-10
> 이 문서는 logic-engineer · ui-builder · integrator · qa-inspector 의 **단일 진실 공급원(SSOT)** 이다.
> 아래 타입/시그니처와 어긋나는 shape 을 기대하면 런타임 버그가 된다. 변경이 필요하면 scaffold-architect 에게 요청하라.

---

## 1. 폴더/파일 위치

| 산출물 | 경로 |
| --- | --- |
| 타입 정의 (계약 본체) | `src/types/place.ts` |
| 시드 데이터 (28개) | `src/data/places.ts` (`PLACES` named + default export) |
| Mock API | `src/api/placesApi.ts` |
| 부팅 엔트리 | `src/main.tsx` (QueryClientProvider + `./index.css` import) |
| App 스텁 | `src/App.tsx` (integrator 가 대체) |
| Tailwind 엔트리 CSS | `src/index.css` (`@import "tailwindcss"`) |

---

## 2. 핵심 타입 전문 (`src/types/place.ts`)

```ts
export type PlaceCategory = "restaurant" | "cafe" | "park" | "hospital" | "life";

export interface Place {
  id: number;
  name: string;          // 하이라이팅 대상 주 텍스트
  category: PlaceCategory;
  description: string;
  distance: number;      // meter (거리순 정렬: 오름차순)
  rating: number;        // 0~5, 소수 1자리 (평점순 정렬: 내림차순)
  updatedAt: string;     // ISO 8601 (최신순 정렬: 내림차순)
  tags: string[];
}

export type SortKey = "accuracy" | "latest" | "distance" | "rating";

// 카테고리 필터 = 실제 카테고리 + "all"(전체)
export type CategoryFilter = PlaceCategory | "all";

export interface PlaceSearchParams {
  query: string;           // 디바운스 후 확정 검색어. "" 이면 전체
  category: CategoryFilter;
  sort: SortKey;
  favoritesOnly: boolean;
}
```

### 정렬 키 의미 (sortPlaces 구현 기준)

| SortKey | 의미 | 정렬 방향 |
| --- | --- | --- |
| `accuracy` | 정확도순 (검색어 관련도. **기본값**) | 관련도 高→低 (검색어 없으면 원본 순서 유지 권장) |
| `latest` | 최신순 | `updatedAt` 내림차순 |
| `distance` | 거리순 | `distance` 오름차순 |
| `rating` | 평점순 | `rating` 내림차순 |

---

## 3. 라벨 매핑 — 영문코드 ↔ 한글라벨 (단일 출처)

**모두 `src/types/place.ts` 에서 export.** UI 는 반드시 아래 상수를 통해 라벨/순서를 얻는다 (하드코딩 금지).

```ts
export const CATEGORY_LABELS: Readonly<Record<CategoryFilter, string>> = {
  all: "전체",
  restaurant: "음식점",
  cafe: "카페",
  park: "공원",
  hospital: "병원",
  life: "생활편의",
};

export const CATEGORY_FILTER_ORDER: readonly CategoryFilter[] =
  ["all", "restaurant", "cafe", "park", "hospital", "life"]; // 탭 렌더 순서

export const SORT_LABELS: Readonly<Record<SortKey, string>> = {
  accuracy: "정확도순",
  latest: "최신순",
  distance: "거리순",
  rating: "평점순",
};

export const SORT_ORDER: readonly SortKey[] =
  ["accuracy", "latest", "distance", "rating"]; // SortSelect 렌더 순서

export const DEFAULT_SORT: SortKey = "accuracy";
```

| 영문 코드 | 한글 라벨 |
| --- | --- |
| `all` | 전체 |
| `restaurant` | 음식점 |
| `cafe` | 카페 |
| `park` | 공원 |
| `hospital` | 병원 |
| `life` | 생활편의 |

---

## 4. Mock API (`src/api/placesApi.ts`)

### 함수 시그니처

```ts
export interface FetchPlacesOptions {
  simulateError?: boolean; // true 이면 의도적으로 reject (error 상태 시연용)
}

export class PlacesApiError extends Error {} // reject 시 던지는 에러 타입

export function fetchPlaces(options?: FetchPlacesOptions): Promise<Place[]>;
```

### 반환 shape — ⚠️ 중요

- **`Promise<Place[]>` — 배열 그 자체** 다. 래핑 객체(`{ items: [] }`)가 **아니다.**
- 따라서 훅/UI 는 응답을 곧바로 `.filter()` / `.sort()` 할 수 있다.
- TanStack Query 사용 예:
  ```ts
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["places"],            // (또는 ["places", { simulateError }])
    queryFn: () => fetchPlaces(),     // data: Place[] | undefined
  });
  ```

### 동작 규약

- 인위적 네트워크 지연 **400~700ms** (랜덤) → loading 상태 시연 가능.
- 서버는 **전체 데이터만 반환**한다. 검색어/카테고리/정렬/즐겨찾기 **필터링은 클라이언트(usePlaceSearch)** 에서 수행. (검색어를 서버로 넘기지 않음 → 캐싱 단순화)
- 성공 시 원본 보호를 위해 **얕은 복사본(`[...PLACES]`)** 반환.

### 에러 트리거 방법

- `fetchPlaces({ simulateError: true })` → 지연 후 `PlacesApiError` 로 **reject**.
- UI 의 "에러 발생시키기" 토글/버튼이 이 플래그를 켜면 TanStack Query 의 `isError` / `error` 상태(3상태 중 error) 재현 가능.
- 에러 식별: `error instanceof PlacesApiError`.

---

## 5. 시드 데이터 (`src/data/places.ts`)

- 총 **28개**. `export const PLACES: Place[]` (named) + `export default PLACES`.
- 카테고리 분포: restaurant 6 / cafe 6 / park 5 / hospital 5 / life 6.
- **하이라이팅 시연용 공통 토큰** 다수 포함: `서울`(서울집 본점·서울숲·남산공원 설명·서울위내과의원·서울중앙우체국·다이소 서울역점), `강남`(강남면옥·스타벅스 강남대로점·강남 도산공원·강남세브란스병원·강남 무인세탁소), `판교`·`성수` 등.
- `distance`(250~13400m), `rating`(4.0~4.8), `updatedAt`(2026-03~06 분포) 모두 다양 → 4종 정렬이 눈에 띄게 동작.

---

## 6. 고정 의존성 버전

> 모두 `package.json` 에 **정확한 버전(캐럿 없이)** 고정. 후속 팀원은 `npm install` 재실행 불필요 (이미 설치/검증 완료).

### dependencies
| 패키지 | 버전 |
| --- | --- |
| react | 19.2.7 |
| react-dom | 19.2.7 |
| @tanstack/react-query | 5.101.0 |

### devDependencies
| 패키지 | 버전 |
| --- | --- |
| vite | 8.0.16 |
| @vitejs/plugin-react | 6.0.2 |
| typescript | 5.9.3 |
| tailwindcss | 4.3.0 |
| @tailwindcss/vite | 4.3.0 |
| @types/react | 19.2.17 |
| @types/react-dom | 19.2.3 |
| eslint | 10.4.1 |
| @eslint/js | 10.0.1 |
| typescript-eslint | 8.61.0 |
| eslint-plugin-react-hooks | 7.1.1 |
| eslint-plugin-react-refresh | 0.5.2 |
| globals | 17.6.0 |

### 설정 결정 (주의)

- **Tailwind v4** 방식: `@tailwindcss/vite` 플러그인 + 엔트리 CSS `@import "tailwindcss"` (postcss.config / tailwind.config.js 파일 **없음**). 디자인 토큰 확장은 `src/index.css` 의 `@theme {}` 블록에서 **ui-builder** 가 진행.
- **TypeScript 5.9.3 로 고정** (최신 6.0.x 가 아님): typescript-eslint 8.x 의 공식 지원 상한이 5.9 이므로 peer 호환을 위해 의도적으로 5.9.3 고정.
- **ESLint 10 + react-hooks 7.1.1 호환 처리**: `eslint-plugin-react-hooks` 의 `recommended-latest` 가 legacy array-string `plugins` 형식이라 ESLint 10 flat config 에서 거부됨. → `eslint.config.js` 에서 플러그인을 객체로 직접 등록하고 `rules-of-hooks`(error)/`exhaustive-deps`(warn) 를 명시적으로 켜는 방식으로 우회. (후속 팀원이 이 설정을 임의로 `recommended-latest` 로 되돌리면 lint 가 깨진다.)

---

## 7. 검증 결과 (scaffold-architect)

- `npm install` : 성공 (168 packages, 0 vulnerabilities)
- `npx tsc --noEmit` : **에러 0**
- `npm run build` (`tsc -b && vite build`) : **성공** (CSS 6.56kB → Tailwind 정상 주입 확인)
- `npx eslint .` : **에러 0**
- `npm run dev` (vite) : **부팅 성공**, HTTP 200
- `any` 사용 : **0건** (src 전체)

### 사용 가능한 npm 스크립트
| 스크립트 | 명령 |
| --- | --- |
| `npm run dev` | vite 개발 서버 |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit` |
