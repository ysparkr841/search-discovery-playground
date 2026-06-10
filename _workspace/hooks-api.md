# Hooks & Utils API — Search & Discovery Playground

> 작성자: **logic-engineer** · 최종 갱신: 2026-06-10
> 이 문서는 `src/hooks`, `src/utils` 의 **소비 계약(consumer contract)** 이다.
> ui-builder · integrator 는 아래 시그니처/반환 키를 그대로 소비한다. 변경 시 logic-engineer 와 조율.
> 데이터 타입(Place, SortKey, CategoryFilter 등)의 출처는 `src/types/place.ts` (contract.md).

---

## 1. `useDebounce` — `src/hooks/useDebounce.ts`

```ts
export function useDebounce<T>(value: T, delay = 300): T
```

- `value`가 바뀌면 `delay`(ms) 뒤에 반환값이 갱신된다. 지연 안에 다시 바뀌면 이전 타이머는 `clearTimeout`으로 취소(cleanup).
- 검색 입력값 → 확정 검색어 도출에 사용. 기본 지연 **300ms**.

```ts
const debouncedQuery = useDebounce(rawQuery, 300);
```

---

## 2. `useLocalStorage` — `src/hooks/useLocalStorage.ts`

```ts
export const STORAGE_KEYS: {
  readonly RECENT_QUERIES: "sdp:recent-queries"; // string[]
  readonly FAVORITE_IDS:   "sdp:favorite-ids";   // number[]
};

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void]
```

- `[value, setValue]` 튜플 반환. `setValue`는 값 또는 함수형 업데이트(`prev => next`) 모두 지원 (`useState`와 동일한 사용감).
- 초기 마운트 시 localStorage 읽기(try/catch 파싱 방어), 값 변경 시 자동 직렬화 저장.
- **LocalStorage 키는 반드시 `STORAGE_KEYS` 상수를 사용** (문자열 하드코딩 금지).

```ts
const [recent, setRecent] = useLocalStorage<string[]>(STORAGE_KEYS.RECENT_QUERIES, []);
const [favorites, setFavorites] = useLocalStorage<number[]>(STORAGE_KEYS.FAVORITE_IDS, []);

setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
```

---

## 3. `usePlaceSearch` — `src/hooks/usePlaceSearch.ts` ⭐ 핵심 경계면

### 입력 파라미터 (단일 객체 `UsePlaceSearchParams`)

`PlaceSearchParams`(contract)를 확장한다.

| 키 | 타입 | 의미 |
| --- | --- | --- |
| `query` | `string` | 디바운스 후 확정 검색어. 트림 후 `""`이면 검색어 필터 미적용(전체). |
| `category` | `CategoryFilter` | 카테고리 필터. `"all"`이면 카테고리 필터 미적용. |
| `sort` | `SortKey` | 정렬 키. `sortPlaces`에 위임. |
| `favoritesOnly` | `boolean` | true면 `favoriteIds`에 든 장소만. |
| `favoriteIds` | `number[]` | 즐겨찾기 장소 id 목록(즐겨찾기 필터 기준). |
| `simulateError?` | `boolean` | true면 Mock API가 에러 reject(에러 상태 시연). 기본 `false`. |

```ts
export interface UsePlaceSearchParams extends PlaceSearchParams {
  favoriteIds: number[];
  simulateError?: boolean;
}
```

### 반환 객체 (`UsePlaceSearchResult`) — App.tsx 와 키 이름 정확히 일치

| 키 | 타입 | 의미 |
| --- | --- | --- |
| `results` | `Place[]` | **필터·정렬이 모두 적용된 최종 목록.** UI는 이것을 렌더. |
| `isLoading` | `boolean` | 최초 로딩 여부(내부적으로 TanStack Query `isPending`). |
| `isError` | `boolean` | 에러 상태 여부. |
| `error` | `Error \| null` | 에러 객체(없으면 `null`). `PlacesApiError` instanceof 식별 가능. |
| `refetch` | `() => void` | 재요청. ("에러 발생시키기" 토글 후 재시도 등) |
| `total` | `number` | 필터·정렬 적용 후 결과 개수(`results.length`). 빈 상태 판단/카운트 표시용. |
| `totalAll` | `number` | 서버에서 받은 전체 개수(필터 적용 전). |

```ts
export interface UsePlaceSearchResult {
  results: Place[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  total: number;
  totalAll: number;
}
```

### 동작 규약 (파생 상태, 저장하지 않고 계산)

- `results = sortPlaces(filter(전체데이터), sort)` — `useMemo`로 메모이즈.
- 검색어 매칭: `name` + `description` + `tags`를 합쳐 **대소문자 무시 부분 일치**.
- 빈 쿼리 → 전체 / 카테고리 `"all"` → 카테고리 필터 미적용 / `favoritesOnly` → `favoriteIds`만.
- 서버(Mock API)는 전체 데이터만 반환하며, 모든 필터/정렬은 이 훅(클라이언트)에서 수행한다.

### 소비 예시 (App.tsx)

```ts
const { results, isLoading, isError, error, refetch, total, totalAll } =
  usePlaceSearch({
    query: debouncedQuery,
    category,
    sort,
    favoritesOnly,
    favoriteIds: favorites,
    simulateError,
  });
```

---

## 4. `highlightText` — `src/utils/highlightText.tsx`

```ts
export function highlightText(text: string, query: string): React.ReactNode
```

- `query`가 비었거나 공백뿐이면 **원문 문자열** 그대로 반환.
- 정규식 특수문자 이스케이프 후 `i`/`g` 플래그 매칭 → 일치 구간을 `<mark>`로 감싼 ReactNode 배열 반환(다중 일치).
- 사용자 입력이 정규식을 깨뜨리지 않게 안전(크래시 방지).

```tsx
<h3>{highlightText(place.name, debouncedQuery)}</h3>
```

> `<mark>` 스타일은 ui-builder가 `src/index.css`에서 지정.

---

## 5. `sortPlaces` — `src/utils/sortPlaces.ts`

```ts
export function sortPlaces(places: Place[], key: SortKey): Place[]
```

- **원본 불변** — 복사 후 정렬한 **새 배열** 반환.
- `accuracy`: 입력 순서 유지(정확도는 검색어 필터링 단계에서 반영) / `latest`: `updatedAt` 내림차순 / `distance`: `distance` 오름차순 / `rating`: `rating` 내림차순.
- 보통은 `usePlaceSearch`가 내부에서 호출하므로 UI가 직접 부를 일은 적다.

---

## 검증 상태

- `npx tsc --noEmit` : **에러 0**
- `any` 사용(src/hooks, src/utils) : **0건**
- 작성 파일: `useDebounce.ts`, `useLocalStorage.ts`, `usePlaceSearch.ts`, `highlightText.tsx`, `sortPlaces.ts`
